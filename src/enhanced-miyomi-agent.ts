// Enhanced Miyomi Agent with visual content generation
import Anthropic from '@anthropic-ai/sdk';
import { Market, MarketAnalysis, Pick, MiyomiState } from './types';
import { PolymarketClient } from './integrations/polymarket';
import { MarketAnalyzer } from './core/market-analyzer';
import { MiyomiPersonalityEngine } from './personality/miyomi-personality';
import { FarcasterDirectClient } from './integrations/farcaster-direct';
import { EdenVisualClient, EdenGenerationResult } from './integrations/eden-visual';
import { EnhancedContentGenerator } from './enhanced-content-generator';
import { StateManager } from './state/state-manager';

export interface EnhancedPick extends Pick {
  visual?: EdenGenerationResult;
  contentStyle: 'viral' | 'educational' | 'story' | 'meme';
  engagementScore: number;
}

export class EnhancedMiyomiAgent {
  private anthropic: Anthropic;
  private polymarket: PolymarketClient;
  private analyzer: MarketAnalyzer;
  private personality: MiyomiPersonalityEngine;
  private farcaster: FarcasterDirectClient;
  private eden: EdenVisualClient;
  private contentGenerator: EnhancedContentGenerator;
  private stateManager: StateManager;
  private state: MiyomiState;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.polymarket = new PolymarketClient();
    this.analyzer = new MarketAnalyzer(this.polymarket);
    this.personality = new MiyomiPersonalityEngine();
    this.farcaster = new FarcasterDirectClient();
    this.eden = new EdenVisualClient();
    this.contentGenerator = new EnhancedContentGenerator(apiKey);
    this.stateManager = new StateManager();
    this.state = this.stateManager.loadState();
  }

  async generateEnhancedDailyPick(): Promise<EnhancedPick | null> {
    console.log("🎭 Miyomi creating enhanced daily pick...");
    
    try {
      // Get trending markets
      const markets = await this.polymarket.getTrendingMarkets();
      if (!markets || markets.length === 0) {
        console.log("No markets found, Miyomi is taking a nap");
        return null;
      }

      // Find the best contrarian opportunity
      const bestMarket = await this.analyzer.findBestContrarianPick(markets);
      if (!bestMarket) {
        console.log("No good contrarian plays today, Miyomi is bored");
        return null;
      }

      console.log(`🎯 Selected market: ${bestMarket.question}`);

      // Analyze the market with enhanced reasoning
      const analysis = await this.analyzer.analyzeMarket(bestMarket);
      if (analysis.recommendation === 'SKIP') {
        console.log("Market analysis says skip, Miyomi agrees");
        return null;
      }

      // Generate enhanced content with visual elements
      const enhancedContent = await this.contentGenerator.generateEnhancedPick(bestMarket, analysis);
      
      console.log(`📱 Generated ${enhancedContent.contentStyle} style content`);
      console.log(`🎨 Visual concept: ${enhancedContent.visualPrompt.substring(0, 100)}...`);

      // Generate visual content with Eden
      let visual: EdenGenerationResult | null = null;
      try {
        visual = await this.eden.generateMiyomiVisual(
          enhancedContent.post.shortPost,
          enhancedContent.visualPrompt,
          enhancedContent.contentStyle
        );
        console.log('✅ Visual content generated');
      } catch (error) {
        console.log('🎨 Visual generation skipped:', error);
      }

      // Calculate engagement score based on content quality
      const engagementScore = this.calculateEngagementScore(
        enhancedContent.post.shortPost,
        enhancedContent.contentStyle,
        !!visual
      );

      // Create enhanced pick
      const pick: EnhancedPick = {
        id: `enhanced-${Date.now()}`,
        timestamp: new Date(),
        marketId: bestMarket.id,
        marketQuestion: bestMarket.question,
        position: analysis.recommendation,
        reasoning: analysis.reasoning.join(' '),
        consensusPrice: bestMarket.outcomes[0].probability,
        miyomiPrice: analysis.recommendation === 'YES' 
          ? Math.min(0.95, bestMarket.outcomes[0].probability + 0.2)
          : Math.max(0.05, bestMarket.outcomes[0].probability - 0.2),
        post: enhancedContent.post.shortPost,
        visual,
        contentStyle: enhancedContent.contentStyle,
        engagementScore
      };

      // Post to Farcaster with visual if available
      console.log('📱 Posting enhanced content to Farcaster...');
      const castHash = await this.postWithVisual(pick);
      
      if (castHash) {
        console.log('✅ Enhanced pick posted:', `https://warpcast.com/miyomi/${castHash.slice(0, 10)}`);
      }

      // Save the enhanced pick
      this.state.currentPick = pick;
      this.state.lastPickTime = new Date();
      this.state.pickHistory.push(pick);
      this.state.totalPicks++;
      this.stateManager.saveState(this.state);

      return pick;
      
    } catch (error) {
      console.error("Error generating enhanced daily pick:", error);
      return null;
    }
  }

  private async postWithVisual(pick: EnhancedPick): Promise<string | null> {
    try {
      // For now, post text only - Farcaster image embedding would go here
      const castHash = await this.farcaster.postAsUser(pick.post);
      
      // TODO: When we have Eden working, we could:
      // 1. Generate visual with Eden
      // 2. Upload to IPFS or image host
      // 3. Embed in Farcaster cast as attachment
      
      if (pick.visual) {
        console.log(`🎨 Would embed visual: ${pick.visual.url}`);
      }
      
      return castHash;
    } catch (error) {
      console.error('Error posting with visual:', error);
      return null;
    }
  }

  private calculateEngagementScore(
    post: string, 
    style: string, 
    hasVisual: boolean
  ): number {
    let score = 50; // Base score
    
    // Length optimization
    if (post.length > 100 && post.length < 250) score += 10;
    
    // Emoji usage
    const emojiCount = (post.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    score += Math.min(emojiCount * 3, 15);
    
    // Style bonuses
    const styleBonuses = { viral: 20, story: 15, educational: 10, meme: 25 };
    score += styleBonuses[style] || 0;
    
    // Visual content bonus
    if (hasVisual) score += 30;
    
    // NYC references
    if (post.toLowerCase().includes('nyc') || post.toLowerCase().includes('brooklyn')) score += 5;
    
    // Financial terms
    if (post.includes('$') || post.toLowerCase().includes('market')) score += 5;
    
    return Math.min(score, 100);
  }

  getContentInsights(): {
    averageEngagement: number;
    bestPerformingStyle: string;
    recentPicks: EnhancedPick[];
  } {
    const recentPicks = this.state.pickHistory.slice(-10) as EnhancedPick[];
    const avgEngagement = recentPicks.reduce((sum, pick) => sum + (pick.engagementScore || 0), 0) / recentPicks.length;
    
    const stylePerformance = recentPicks.reduce((acc, pick) => {
      if (pick.contentStyle) {
        acc[pick.contentStyle] = (acc[pick.contentStyle] || 0) + (pick.engagementScore || 0);
      }
      return acc;
    }, {} as Record<string, number>);
    
    const bestStyle = Object.entries(stylePerformance).sort(([,a], [,b]) => b - a)[0]?.[0] || 'viral';
    
    return {
      averageEngagement: avgEngagement || 0,
      bestPerformingStyle: bestStyle,
      recentPicks
    };
  }
}

// Test the enhanced agent
async function testEnhancedAgent() {
  console.log('🎭 Testing Enhanced Miyomi Agent\n');
  
  const agent = new EnhancedMiyomiAgent(process.env.ANTHROPIC_API_KEY || '');
  const pick = await agent.generateEnhancedDailyPick();
  
  if (pick) {
    console.log('\n══════════════════════════════════════════');
    console.log('🎊 ENHANCED PICK GENERATED');
    console.log('══════════════════════════════════════════');
    console.log(`Style: ${pick.contentStyle}`);
    console.log(`Engagement Score: ${pick.engagementScore}/100`);
    console.log(`Post: "${pick.post}"`);
    
    if (pick.visual) {
      console.log(`Visual: ${pick.visual.url}`);
      console.log(`Visual Type: ${pick.visual.type}`);
    }
    
    console.log('\n📊 Content Insights:');
    const insights = agent.getContentInsights();
    console.log(`Average Engagement: ${insights.averageEngagement.toFixed(1)}/100`);
    console.log(`Best Performing Style: ${insights.bestPerformingStyle}`);
  }
}

if (require.main === module) {
  testEnhancedAgent();
}