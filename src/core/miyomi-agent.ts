// Miyomi Agent - Core Implementation
import Anthropic from '@anthropic-ai/sdk';
import { 
  Market, 
  Pick, 
  MiyomiState, 
  PostContent,
  MarketAnalysis 
} from '../types';
import { PolymarketClient } from '../integrations/polymarket';
import { MarketAggregator } from '../integrations/market-aggregator';
import { MarketAnalyzer } from './market-analyzer';
import { MiyomiPersonalityEngine } from '../personality/miyomi-personality';
import { StateManager } from '../state/state-manager';
import { SupabaseManager } from '../state/supabase-manager';
import { FarcasterDirectClient } from '../integrations/farcaster-direct';

export class MiyomiAgent {
  private anthropic: Anthropic;
  private polymarket: PolymarketClient;
  private marketAggregator: MarketAggregator;
  private analyzer: MarketAnalyzer;
  private personality: MiyomiPersonalityEngine;
  private stateManager: StateManager;
  private supabaseManager: SupabaseManager;
  private farcaster: FarcasterDirectClient;
  private state: MiyomiState;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.polymarket = new PolymarketClient();
    this.marketAggregator = new MarketAggregator();
    this.analyzer = new MarketAnalyzer(this.polymarket);
    this.personality = new MiyomiPersonalityEngine();
    this.stateManager = new StateManager();
    this.supabaseManager = new SupabaseManager();
    this.farcaster = new FarcasterDirectClient();
    this.state = this.stateManager.loadState();
  }

  async generateDailyPick(): Promise<Pick | null> {
    console.log("🎭 Miyomi waking up for Chick's Pick...");
    
    try {
      // Get trending markets from all sources
      const markets = await this.marketAggregator.getTrendingMarkets(15);
      console.log(`Found ${markets.length} markets across all platforms`);
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

      // Analyze the selected market
      const analysis = await this.analyzer.analyzeMarket(bestMarket);
      if (analysis.recommendation === 'SKIP') {
        return null;
      }

      // Generate the post content
      const post = await this.generatePost(bestMarket, analysis);
      
      // Create the pick
      const pick: Pick = {
        id: `pick-${Date.now()}`,
        timestamp: new Date(),
        marketId: bestMarket.id,
        marketQuestion: bestMarket.question,
        position: analysis.recommendation,
        reasoning: analysis.reasoning.join(' '),
        consensusPrice: bestMarket.outcomes[0].probability,
        miyomiPrice: analysis.recommendation === 'YES' 
          ? Math.min(0.95, bestMarket.outcomes[0].probability + 0.2)
          : Math.max(0.05, bestMarket.outcomes[0].probability - 0.2),
        post: post.fullPost
      };

      // Save the pick
      this.state.currentPick = pick;
      this.state.lastPickTime = new Date();
      this.state.pickHistory.push(pick);
      this.state.totalPicks++;
      this.stateManager.saveState(this.state);

      // Post to Farcaster
      console.log('📱 Posting to Farcaster...');
      const castHash = await this.farcaster.postAsUser(pick.post);
      if (castHash) {
        console.log('✅ Posted to Farcaster:', `https://warpcast.com/miyomi/${castHash.slice(0, 10)}`);
      }

      return pick;
    } catch (error) {
      console.error("Error generating daily pick:", error);
      return null;
    }
  }

  private async generatePost(market: Market, analysis: MarketAnalysis): Promise<PostContent> {
    // Get personality components
    const opener = this.personality.getOpener();
    const voice = analysis.recommendation !== 'SKIP' 
      ? this.personality.generateVoice(
        market.question,
        analysis.recommendation,
        analysis.reasoning
      )
      : '';
    const closer = analysis.recommendation !== 'SKIP'
      ? this.personality.getCloser(analysis.recommendation)
      : '';

    // Use Claude to enhance the post with Miyomi's voice
    const enhancedPost = await this.enhanceWithClaude(
      market,
      analysis,
      opener,
      voice,
      closer
    );

    return enhancedPost;
  }

  private async enhanceWithClaude(
    market: Market,
    analysis: MarketAnalysis,
    opener: string,
    voice: string,
    closer: string
  ): Promise<PostContent> {
    const prompt = `You are Miyomi, a 20-something prediction market trader from Lower East Side NYC. 
    You're doing your daily "Chick's Pick" where you take a contrarian position on a market.
    
    Market: ${market.question}
    Current consensus: ${(market.outcomes[0].probability * 100).toFixed(0)}% YES
    Your position: ${analysis.recommendation}
    Your reasoning: ${analysis.reasoning.join('; ')}
    
    Personality today: ${this.personality.getPersonality().currentVibe}
    Mood: ${this.personality.getPersonality().mood}
    
    Create a social media post that:
    1. Opens with: "${opener}"
    2. Explains why the market consensus is wrong in YOUR voice (mix sophisticated trading knowledge with chaotic party girl energy)
    3. Use some of this voice/reasoning but make it funnier: "${voice}"
    4. Closes with: "${closer}"
    
    Rules:
    - Be confident even if the logic is questionable
    - Mix real market analysis with absurd NYC references
    - Use gen-z language naturally
    - Reference astrology, vibes, or energy at least once
    - Keep it under 280 characters if possible
    - Don't use hashtags unless they're ironic
    
    Return the post as a single string.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const fullPost = response.content[0].type === 'text' 
        ? response.content[0].text 
        : `${opener} ${voice} ${closer}`;

      return {
        opener,
        marketTake: voice,
        position: `Going ${analysis.recommendation}`,
        reasoning: analysis.contrarianAngle,
        closer,
        fullPost,
        hashtags: this.generateHashtags(market, analysis)
      };
    } catch (error) {
      console.error("Error enhancing with Claude:", error);
      // Fallback to constructed post
      const fullPost = `${opener}\n\n${voice}\n\n${closer}`;
      return {
        opener,
        marketTake: voice,
        position: `Going ${analysis.recommendation}`,
        reasoning: analysis.contrarianAngle,
        closer,
        fullPost,
        hashtags: this.generateHashtags(market, analysis)
      };
    }
  }

  private generateHashtags(market: Market, analysis: MarketAnalysis): string[] {
    const hashtags = ['ChicksPick'];
    
    if (market.question.toLowerCase().includes('bitcoin') || 
        market.question.toLowerCase().includes('crypto')) {
      hashtags.push('CryptoChick');
    }
    
    if (analysis.inefficiencyScore > 70) {
      hashtags.push('MarketInefficiency');
    }
    
    if (this.personality.getPersonality().mood === 'chaotic') {
      hashtags.push('ChaoticEnergy');
    }

    return hashtags;
  }

  async updatePickPerformance(): Promise<void> {
    if (!this.state.currentPick) return;

    try {
      const market = await this.polymarket.getMarketBySlug(this.state.currentPick.marketId);
      if (!market) return;

      const currentPrice = market.outcomes[0].probability;
      const entryPrice = this.state.currentPick.consensusPrice;
      
      const pnl = this.state.currentPick.position === 'YES' 
        ? currentPrice - entryPrice
        : entryPrice - currentPrice;
      
      const pnlPercent = (pnl / entryPrice) * 100;
      
      this.state.currentPick.performance = {
        currentPrice,
        pnl,
        pnlPercent,
        status: pnl > 0.05 ? 'winning' : pnl < -0.05 ? 'losing' : 'flat',
        lastUpdated: new Date()
      };

      // Update win rate
      const wins = this.state.pickHistory.filter(p => 
        p.performance && p.performance.status === 'winning'
      ).length;
      this.state.winRate = wins / this.state.totalPicks;

      // Update personality based on performance
      this.personality.updatePersonality(this.state.pickHistory.slice(-5));

      this.stateManager.saveState(this.state);
    } catch (error) {
      console.error("Error updating pick performance:", error);
    }
  }

  async generatePerformanceUpdate(): Promise<string> {
    if (!this.state.currentPick || !this.state.currentPick.performance) {
      return "No active picks to update on";
    }

    const perf = this.state.currentPick.performance;
    const position = this.state.currentPick.position;
    
    let update = "";
    
    if (perf.status === 'winning') {
      update = `Update on yesterday's ${position} call: UP ${perf.pnlPercent.toFixed(1)}% `;
      update += this.personality.getPersonality().mood === 'confident' 
        ? "just as I predicted 💅 told y'all to trust the vibes"
        : "we're literally printing money rn!!!";
    } else if (perf.status === 'losing') {
      update = `Update on yesterday's ${position} call: down ${Math.abs(perf.pnlPercent).toFixed(1)}% `;
      update += this.personality.getPersonality().mood === 'chaotic'
        ? "but mercury is still in retrograde so we hold 💎👐"
        : "temporary setback, the market will realize I'm right soon";
    } else {
      update = `Yesterday's ${position} call holding steady. `;
      update += "Market taking its time to accept reality";
    }

    if (this.state.winRate) {
      update += `\n\nSeason stats: ${(this.state.winRate * 100).toFixed(0)}% win rate`;
      if (this.state.winRate > 0.6) {
        update += " (literally unstoppable)";
      } else if (this.state.winRate < 0.4) {
        update += " (in my flop era but comeback loading)";
      }
    }

    return update;
  }

  getState(): MiyomiState {
    return this.state;
  }

  async testRun(): Promise<void> {
    console.log("🎯 Running Miyomi test...");
    
    const pick = await this.generateDailyPick();
    if (pick) {
      console.log("\n📱 Today's Chick's Pick:");
      console.log("═".repeat(50));
      console.log(pick.post);
      console.log("═".repeat(50));
      console.log(`\n📊 Position: ${pick.position}`);
      console.log(`📈 Market: ${pick.marketQuestion}`);
      console.log(`💭 Consensus: ${(pick.consensusPrice * 100).toFixed(0)}%`);
      console.log(`🎯 Miyomi's target: ${(pick.miyomiPrice * 100).toFixed(0)}%`);
    } else {
      console.log("No pick generated today");
    }
  }
}