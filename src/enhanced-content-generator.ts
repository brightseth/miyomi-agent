// Enhanced content generator with visual prompts
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { Market, MarketAnalysis, PostContent } from './types';
import { MiyomiPersonalityEngine } from './personality/miyomi-personality';

dotenv.config();

export class EnhancedContentGenerator {
  private anthropic: Anthropic;
  private personality: MiyomiPersonalityEngine;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.personality = new MiyomiPersonalityEngine();
  }

  async generateEnhancedPick(market: Market, analysis: MarketAnalysis): Promise<{
    post: PostContent;
    visualPrompt: string;
    contentStyle: 'viral' | 'educational' | 'story' | 'meme';
  }> {
    const currentPersonality = this.personality.getPersonality();
    
    // Choose content style based on market and mood
    const style = this.chooseContentStyle(market, currentPersonality.mood);
    
    const post = await this.generateStyledPost(market, analysis, style);
    const visualPrompt = await this.generateVisualPrompt(market, analysis, post);
    
    return {
      post,
      visualPrompt,
      contentStyle: style
    };
  }

  private chooseContentStyle(market: Market, mood: string): 'viral' | 'educational' | 'story' | 'meme' {
    // Bitcoin/crypto = viral content
    if (market.question.toLowerCase().includes('bitcoin') || market.question.toLowerCase().includes('crypto')) {
      return 'viral';
    }
    
    // Politics = story/narrative
    if (market.question.toLowerCase().includes('election') || market.question.toLowerCase().includes('president')) {
      return 'story';
    }
    
    // Strange markets = meme content
    if (market.question.includes('alien') || market.question.includes('simulation')) {
      return 'meme';
    }
    
    // Default based on mood
    return mood === 'philosophical' ? 'educational' : 'viral';
  }

  private async generateStyledPost(
    market: Market, 
    analysis: MarketAnalysis, 
    style: 'viral' | 'educational' | 'story' | 'meme'
  ): Promise<PostContent> {
    const prompts = {
      viral: `Create a viral Farcaster post as Miyomi about ${market.question}.
      
      Current consensus: ${(market.outcomes[0].probability * 100).toFixed(0)}% YES
      Your position: ${analysis.recommendation}
      
      Make it:
      - Hook people in the first line
      - Mix finance knowledge with party girl energy  
      - Include specific NYC references that feel authentic
      - Create FOMO or curiosity
      - End with confidence/call to action
      
      150-250 characters max. Be quotable.`,

      educational: `Create an educational but fun post as Miyomi about ${market.question}.
      
      Teach your followers something while being entertaining:
      - Start with a surprising fact or insight
      - Explain the contrarian thesis simply
      - Use analogies that a party girl would use
      - Make complex trading concepts accessible
      
      200-280 characters.`,

      story: `Tell a mini story as Miyomi about ${market.question}.
      
      Create a narrative that includes:
      - A specific moment or person in NYC
      - Your realization about the market
      - The "plot twist" of your contrarian view
      - Emotional hooks that make people care
      
      Focus on storytelling over pure analysis.`,

      meme: `Create meme-worthy content as Miyomi about ${market.question}.
      
      Make it:
      - Absurd but somehow makes sense
      - Mixes serious analysis with ridiculous comparisons
      - References pop culture or internet culture
      - Could spawn quote tweets and reactions
      
      Be unhinged but memorable.`
    };

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.85,
        messages: [
          {
            role: 'user',
            content: prompts[style]
          }
        ]
      });

      const fullPost = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return {
        fullPost,
        shortPost: fullPost.length > 280 ? fullPost.substring(0, 277) + '...' : fullPost
      };
    } catch (error) {
      console.error('Error generating styled post:', error);
      return { fullPost: 'Content generation failed', shortPost: 'Content generation failed' };
    }
  }

  private async generateVisualPrompt(
    market: Market, 
    analysis: MarketAnalysis, 
    post: PostContent
  ): Promise<string> {
    const prompt = `Based on this Miyomi prediction post: "${post.shortPost}"
    
    Market: ${market.question}
    Position: ${analysis.recommendation}
    
    Create a visual prompt for generating an image/video that would accompany this post.
    
    Consider:
    - The emotional energy of the post
    - Visual metaphors for market movement
    - Miyomi's aesthetic (NYC party girl meets trading floor)
    - Colors and vibes that match the prediction
    
    Describe the perfect visual content in 1-2 sentences. Be specific about style, colors, mood.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'A dynamic trading chart visualization';
    } catch (error) {
      console.error('Error generating visual prompt:', error);
      return 'A dynamic trading chart visualization';
    }
  }
}

// Test the enhanced generator
async function testEnhancedGenerator() {
  const generator = new EnhancedContentGenerator(process.env.ANTHROPIC_API_KEY || '');
  
  const testMarket = {
    id: 'test-btc',
    question: 'Will Bitcoin reach $100k before March 2025?',
    outcomes: [{ name: 'YES', probability: 0.45 }, { name: 'NO', probability: 0.55 }]
  };

  const testAnalysis = {
    recommendation: 'YES' as const,
    reasoning: [
      'Volume spike with no news indicates whale accumulation',
      'Market sentiment is overly bearish despite strong fundamentals'
    ]
  };

  console.log('🎨 Testing Enhanced Content Generator\n');
  
  const result = await generator.generateEnhancedPick(testMarket, testAnalysis);
  
  console.log('══════════════════════════════════════════');
  console.log(`📱 ${result.contentStyle.toUpperCase()} STYLE POST`);
  console.log('══════════════════════════════════════════');
  console.log(result.post.shortPost);
  console.log(`\nLength: ${result.post.shortPost.length} chars`);
  
  console.log('\n══════════════════════════════════════════');
  console.log('🎨 VISUAL PROMPT');
  console.log('══════════════════════════════════════════');
  console.log(result.visualPrompt);
}

if (require.main === module) {
  testEnhancedGenerator();
}