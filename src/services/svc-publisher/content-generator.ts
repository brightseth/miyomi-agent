// Content generation service with Claude + Eden integration
import Anthropic from '@anthropic-ai/sdk';
import { Pick, Opportunity } from '../svc-markets/types';

export interface ContentOutput {
  title: string;
  narrative: string;
  thesis: string[]; // 3 bullet points
  cta: string;
  imagePrompts: string[];
  videoBrief: any;
  farcasterPost: string;
}

export interface EdenImageResponse {
  url: string;
  prompt: string;
  generationTime: number;
}

export interface EdenVideoResponse {
  url: string;
  brief: any;
  generationTime: number;
}

export class ContentGenerator {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async generateContent(pick: Pick): Promise<ContentOutput> {
    console.log('✍️ Generating content for pick...');
    
    const market = pick.opportunity.market;
    const position = pick.opportunity.recommendedPosition;
    
    // Style selection based on category
    const style = this.selectStyle(market.category || '', market.title);
    
    const systemPrompt = this.buildSystemPrompt(style);
    const userPrompt = this.buildUserPrompt(pick);
    
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.8,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return this.parseContentOutput(content, pick);
      
    } catch (error) {
      console.error('Content generation failed:', error);
      return this.getFallbackContent(pick);
    }
  }

  private selectStyle(category: string, title: string): 'viral' | 'sober' | 'explainer' {
    const titleLower = title.toLowerCase();
    const categoryLower = category.toLowerCase();
    
    if (titleLower.includes('bitcoin') || titleLower.includes('crypto')) {
      return 'viral';
    }
    
    if (categoryLower.includes('politics') || titleLower.includes('election')) {
      return 'sober';
    }
    
    if (categoryLower.includes('economics') || titleLower.includes('fed') || titleLower.includes('inflation')) {
      return 'explainer';
    }
    
    return 'viral'; // Default
  }

  private buildSystemPrompt(style: 'viral' | 'sober' | 'explainer'): string {
    const basePrompt = `You are MIYOMI, a prediction-market content creator and data-driven trader. You analyze markets and create engaging content that moves opinions.

Your personality: 20-something NYC prediction market trader, mix of sophisticated analysis with chaotic party girl energy.

OUTPUT FORMAT (return exactly this structure):
TITLE: [compelling headline]
NARRATIVE: [one paragraph explaining the market situation]
THESIS:
• [bullet point 1]
• [bullet point 2]  
• [bullet point 3]
CTA: [call to action with market reference]
IMAGE_PROMPT_1: [Eden image generation prompt]
IMAGE_PROMPT_2: [Alternative Eden image prompt]
VIDEO_BRIEF: [Eden video generation concept]`;

    const styleInstructions = {
      viral: `Style: VIRAL - Make it shareable, controversial, FOMO-inducing. Use crypto slang, NYC references, confident predictions. Target audience: crypto traders, degens, market watchers.`,
      
      sober: `Style: SOBER STORY - Create thoughtful analysis with narrative structure. Use political insight, historical context, measured tone. Target audience: political junkies, news readers, policy watchers.`,
      
      explainer: `Style: EXPLAINER - Educational but entertaining. Break down complex economics simply, use analogies, make it accessible. Target audience: general investors, econ students, curious normies.`
    };

    return `${basePrompt}\n\n${styleInstructions[style]}`;
  }

  private buildUserPrompt(pick: Pick): string {
    const market = pick.opportunity.market;
    const opp = pick.opportunity;
    
    return `MARKET ANALYSIS:
Title: ${market.title}
Source: ${market.source}
Current Price: ${market.yesPrice}¢ YES / ${market.noPrice}¢ NO
Your Position: ${opp.recommendedPosition}
Target Price: ${pick.targetPrice}¢
Confidence: ${(pick.confidence * 100).toFixed(1)}%
Time to Close: ${opp.timeToClose.toFixed(1)} hours
24h Change: ${opp.delta24h.toFixed(1)}¢

REASONING:
${pick.thesis.join('\n')}

Create content that explains why the market is wrong and why your contrarian position will win. Make it engaging, data-driven, and actionable.`;
  }

  private parseContentOutput(content: string, pick: Pick): ContentOutput {
    try {
      // Parse the structured output from Claude
      const lines = content.split('\n');
      
      let title = '';
      let narrative = '';
      let thesis: string[] = [];
      let cta = '';
      let imagePrompts: string[] = [];
      let videoBrief = '';
      
      let currentSection = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('TITLE:')) {
          title = trimmed.replace('TITLE:', '').trim();
          currentSection = 'title';
        } else if (trimmed.startsWith('NARRATIVE:')) {
          narrative = trimmed.replace('NARRATIVE:', '').trim();
          currentSection = 'narrative';
        } else if (trimmed.startsWith('THESIS:')) {
          currentSection = 'thesis';
        } else if (trimmed.startsWith('CTA:')) {
          cta = trimmed.replace('CTA:', '').trim();
          currentSection = 'cta';
        } else if (trimmed.startsWith('IMAGE_PROMPT_1:')) {
          imagePrompts[0] = trimmed.replace('IMAGE_PROMPT_1:', '').trim();
        } else if (trimmed.startsWith('IMAGE_PROMPT_2:')) {
          imagePrompts[1] = trimmed.replace('IMAGE_PROMPT_2:', '').trim();
        } else if (trimmed.startsWith('VIDEO_BRIEF:')) {
          videoBrief = trimmed.replace('VIDEO_BRIEF:', '').trim();
        } else if (trimmed.startsWith('•') && currentSection === 'thesis') {
          thesis.push(trimmed.replace('•', '').trim());
        } else if (currentSection === 'narrative' && trimmed && !trimmed.includes(':')) {
          narrative += ' ' + trimmed;
        }
      }
      
      // Create Farcaster post (280 char limit)
      const farcasterPost = this.createFarcasterPost(title, narrative, pick);
      
      return {
        title: title || 'Market Analysis',
        narrative: narrative || 'Analysis pending...',
        thesis: thesis.length > 0 ? thesis : pick.thesis,
        cta: cta || `Trade this market →`,
        imagePrompts: imagePrompts.filter(p => p.length > 0),
        videoBrief: videoBrief || 'Market analysis video concept',
        farcasterPost
      };
      
    } catch (error) {
      console.error('Content parsing failed:', error);
      return this.getFallbackContent(pick);
    }
  }

  private createFarcasterPost(title: string, narrative: string, pick: Pick): string {
    // Create optimized Farcaster post
    const market = pick.opportunity.market;
    const position = pick.opportunity.recommendedPosition;
    const consensus = market.yesPrice;
    
    // Build post components
    const hook = title.length > 0 ? title.split(':')[0] : 'Market Analysis';
    const thesis = narrative.length > 100 ? narrative.substring(0, 100) + '...' : narrative;
    const call = `Taking ${position} vs ${consensus}% consensus`;
    
    let post = `${hook}\n\n${thesis}\n\n${call}`;
    
    // Trim to Farcaster limit
    if (post.length > 320) {
      post = `${hook}\n\n${call}`;
    }
    
    if (post.length > 320) {
      post = call;
    }
    
    return post;
  }

  private getFallbackContent(pick: Pick): ContentOutput {
    const market = pick.opportunity.market;
    const position = pick.opportunity.recommendedPosition;
    
    return {
      title: `${market.title} - Contrarian Analysis`,
      narrative: `Market consensus is wrong about ${market.title}. Taking ${position} position.`,
      thesis: pick.thesis,
      cta: `Trade this market →`,
      imagePrompts: [`Prediction market chart showing contrarian opportunity`],
      videoBrief: 'Market analysis visualization',
      farcasterPost: `🎭 Contrarian pick: ${market.title}\n\nTaking ${position} vs consensus\n\nMarket is wrong on this one 💅`
    };
  }
}

// Eden integration stubs
export async function edenCreateImage(prompt: string): Promise<EdenImageResponse | null> {
  const apiKey = process.env.EDEN_API_KEY;
  const apiUrl = process.env.EDEN_API_URL || 'https://api.eden.art';
  
  if (!apiKey) {
    console.log('🎨 Eden not configured, would generate:', prompt.substring(0, 50) + '...');
    return {
      url: `https://mock-eden.com/image-${Date.now()}.png`,
      prompt,
      generationTime: 15000
    };
  }

  try {
    const response = await fetch(`${apiUrl}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'image',
        model: 'eden-image-latest',
        prompt,
        aspect: '16:9'
      })
    });

    const result = await response.json();
    return {
      url: result.url,
      prompt,
      generationTime: result.generation_time || 15000
    };
    
  } catch (error) {
    console.error('Eden image generation failed:', error);
    return null;
  }
}

export async function edenCreateVideo(videoBrief: any): Promise<EdenVideoResponse | null> {
  const apiKey = process.env.EDEN_API_KEY;
  const apiUrl = process.env.EDEN_API_URL || 'https://api.eden.art';
  
  if (!apiKey) {
    console.log('🎬 Eden video not configured, would generate:', JSON.stringify(videoBrief).substring(0, 50) + '...');
    return {
      url: `https://mock-eden.com/video-${Date.now()}.mp4`,
      brief: videoBrief,
      generationTime: 45000
    };
  }

  try {
    const response = await fetch(`${apiUrl}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'video',
        model: 'veo2',
        brief: videoBrief
      })
    });

    const result = await response.json();
    return {
      url: result.url,
      brief: videoBrief,
      generationTime: result.generation_time || 45000
    };
    
  } catch (error) {
    console.error('Eden video generation failed:', error);
    return null;
  }
}

// Test content generation
async function testContentGenerator() {
  console.log('✍️ Testing Content Generator\n');
  
  const generator = new ContentGenerator(process.env.ANTHROPIC_API_KEY || '');
  
  // Create a mock pick
  const mockPick: Pick = {
    id: 'test-pick-123',
    timestamp: new Date().toISOString(),
    opportunity: {
      market: {
        source: 'polymarket',
        id: 'btc-70k',
        url: 'https://polymarket.com/event/btc-70k',
        title: 'Will Bitcoin dip to $70,000 by December 31, 2025?',
        category: 'crypto',
        closesAt: '2025-12-31T00:00:00Z',
        yesPrice: 10,
        noPrice: 90,
        liquidityScore: 0.3,
        volume24h: 15000,
      },
      score: 0.75,
      reasoning: ['Market overconfident in NO outcome', 'Contrarian opportunity identified'],
      delta24h: -2.5,
      timeToClose: 3000,
      liquidityRank: 0.3,
      narrativeBoost: 0.8,
      recommendedPosition: 'YES',
    },
    thesis: ['Market sentiment too bearish', 'Technical oversold conditions', 'Institutional buying underneath'],
    confidence: 0.7,
    targetPrice: 30,
    stopLoss: 5,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  
  const content = await generator.generateContent(mockPick);
  
  console.log('📝 GENERATED CONTENT:');
  console.log('═'.repeat(60));
  console.log(`Title: ${content.title}`);
  console.log(`\nNarrative: ${content.narrative}`);
  console.log(`\nThesis:`);
  content.thesis.forEach((point, i) => {
    console.log(`${i + 1}. ${point}`);
  });
  console.log(`\nCTA: ${content.cta}`);
  console.log(`\nFarcaster Post (${content.farcasterPost.length} chars):`);
  console.log(`"${content.farcasterPost}"`);
  console.log(`\nImage Prompts:`);
  content.imagePrompts.forEach((prompt, i) => {
    console.log(`${i + 1}. ${prompt}`);
  });
  console.log(`\nVideo Brief: ${content.videoBrief}`);
}

if (require.main === module) {
  testContentGenerator();
}