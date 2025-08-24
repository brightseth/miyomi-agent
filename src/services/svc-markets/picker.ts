// Market opportunity picker with contrarian scoring
import { Market, Opportunity, Pick } from './types';

export class MarketPicker {
  private weights = {
    liquidity: 0.25,
    momentum: 0.20,
    recency: 0.15,
    narrative: 0.20,
    spreadCost: -0.20 // negative because higher spread is worse
  };

  constructor() {}

  async rankOpportunities(markets: Market[]): Promise<Opportunity[]> {
    console.log(`🎯 Ranking ${markets.length} market opportunities...`);
    
    const opportunities: Opportunity[] = [];
    
    for (const market of markets) {
      try {
        const opportunity = await this.scoreMarket(market);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      } catch (error) {
        // Skip markets that can't be scored
        continue;
      }
    }
    
    // Sort by score (highest first)
    opportunities.sort((a, b) => b.score - a.score);
    
    console.log(`✅ Ranked ${opportunities.length} opportunities`);
    
    // Log top opportunities
    opportunities.slice(0, 3).forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.market.title.substring(0, 50)}...`);
      console.log(`   Score: ${opp.score.toFixed(2)}, Position: ${opp.recommendedPosition}`);
      console.log(`   24h Change: ${opp.delta24h.toFixed(1)}¢, Time to close: ${opp.timeToClose.toFixed(1)}h`);
    });
    
    return opportunities;
  }

  private async scoreMarket(market: Market): Promise<Opportunity | null> {
    // Calculate time to close
    const timeToClose = (new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60);
    
    // Filter by time constraints (more flexible for demo)
    if (timeToClose < 1 || timeToClose > 365 * 24) {
      return null; // At least 1 hour, at most 1 year
    }
    
    // Calculate momentum and positioning
    const delta24h = this.calculateDelta24h(market);
    const liquidityRank = this.calculateLiquidityRank(market);
    const narrativeBoost = this.calculateNarrativeBoost(market);
    const spreadCost = this.calculateSpreadCost(market);
    
    // Contrarian logic: look for overreactions
    const recommendedPosition = this.getContrarianPosition(market, delta24h);
    
    if (recommendedPosition === 'SKIP') {
      return null;
    }
    
    // Calculate composite score
    const score = 
      this.weights.liquidity * liquidityRank +
      this.weights.momentum * Math.abs(delta24h) / 10 + // Normalize momentum
      this.weights.recency * this.getRecencyScore(market) +
      this.weights.narrative * narrativeBoost +
      this.weights.spreadCost * spreadCost;
    
    // Generate reasoning
    const reasoning = this.generateReasoning(market, delta24h, liquidityRank, narrativeBoost);
    
    return {
      market,
      score,
      reasoning,
      delta24h,
      timeToClose,
      liquidityRank,
      narrativeBoost,
      recommendedPosition,
    };
  }

  private calculateDelta24h(market: Market): number {
    // Mock 24h price change calculation
    // In real implementation, this would compare current price to 24h ago
    const volatility = Math.sin(Date.now() / 1000000) * 10; // -10 to +10 cents
    return volatility;
  }

  private calculateLiquidityRank(market: Market): number {
    const volume = market.volume24h || 0;
    
    // Rank based on volume tiers
    if (volume > 100000) return 1.0;      // High volume
    if (volume > 50000) return 0.8;       // Good volume  
    if (volume > 10000) return 0.6;       // Medium volume
    if (volume > 1000) return 0.4;        // Low volume
    return 0.2;                           // Very low volume
  }

  private calculateNarrativeBoost(market: Market): number {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Weekday 9-15 PT boost for certain categories
    const isBusinessHours = day >= 1 && day <= 5 && hour >= 12 && hour <= 18; // EST
    
    const category = market.category?.toLowerCase() || '';
    const title = market.title.toLowerCase();
    
    let boost = 0.5; // Base score
    
    // Category boosts
    if (title.includes('bitcoin') || title.includes('crypto')) {
      boost += 0.4; // Crypto always hot
    } else if (category.includes('politics') || title.includes('election')) {
      boost += isBusinessHours ? 0.3 : 0.1;
    } else if (category.includes('economics') || title.includes('fed')) {
      boost += isBusinessHours ? 0.3 : 0.1;
    } else if (title.includes('ai') || title.includes('tech')) {
      boost += 0.2;
    }
    
    return Math.min(1.0, boost);
  }

  private calculateSpreadCost(market: Market): number {
    const spread = Math.abs(market.yesPrice - market.noPrice);
    
    // Lower spread is better (less cost to trade)
    if (spread < 5) return 1.0;    // Tight spread
    if (spread < 10) return 0.8;   // Good spread
    if (spread < 20) return 0.6;   // Ok spread
    if (spread < 40) return 0.4;   // Wide spread
    return 0.2;                    // Very wide spread
  }

  private getRecencyScore(market: Market): number {
    if (!market.lastTradeTime) return 0.5;
    
    const hoursSinceUpdate = (Date.now() - new Date(market.lastTradeTime).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 1) return 1.0;     // Very recent
    if (hoursSinceUpdate < 6) return 0.8;     // Recent
    if (hoursSinceUpdate < 24) return 0.6;    // Today
    if (hoursSinceUpdate < 72) return 0.4;    // This week
    return 0.2;                               // Old
  }

  private getContrarianPosition(market: Market, delta24h: number): 'YES' | 'NO' | 'SKIP' {
    const yesProb = market.yesPrice / 100;
    
    // Skip extreme prices (likely resolved markets)
    if (yesProb <= 0.02 || yesProb >= 0.98) {
      return 'SKIP';
    }
    
    // Contrarian thresholds
    const momentum = Math.abs(delta24h);
    
    // Skip if market is too close to 50/50 (no edge)
    if (Math.abs(yesProb - 0.5) < 0.1) {
      return 'SKIP';
    }
    
    // Momentum reversal logic
    if (delta24h > 8 && yesProb > 0.6) {
      return 'NO'; // Price went up too much, bet against
    }
    
    if (delta24h < -8 && yesProb < 0.4) {
      return 'YES'; // Price went down too much, bet for
    }
    
    // Contrarian against strong consensus
    if (yesProb > 0.75) {
      return 'NO'; // Market too confident YES
    }
    
    if (yesProb < 0.25) {
      return 'YES'; // Market too confident NO
    }
    
    // Default contrarian based on slight bias
    return yesProb > 0.55 ? 'NO' : 'YES';
  }

  private generateReasoning(
    market: Market, 
    delta24h: number, 
    liquidityRank: number, 
    narrativeBoost: number
  ): string[] {
    const reasoning: string[] = [];
    
    if (Math.abs(delta24h) > 5) {
      reasoning.push(`${delta24h > 0 ? 'Price surge' : 'Price drop'} of ${Math.abs(delta24h).toFixed(1)}¢ in 24h indicates overreaction`);
    }
    
    if (liquidityRank > 0.7) {
      reasoning.push('High liquidity provides good execution for contrarian trades');
    } else if (liquidityRank < 0.4) {
      reasoning.push('Low liquidity creates opportunity for price discovery');
    }
    
    if (narrativeBoost > 0.7) {
      reasoning.push('Strong narrative momentum creates crowd psychology bias');
    }
    
    const yesProb = market.yesPrice / 100;
    if (yesProb > 0.7) {
      reasoning.push('Market overconfident in YES outcome');
    } else if (yesProb < 0.3) {
      reasoning.push('Market overconfident in NO outcome');
    }
    
    // Always include source reasoning
    reasoning.push(`${market.source} market dynamics favor contrarian positioning`);
    
    return reasoning.length > 0 ? reasoning : ['General contrarian opportunity identified'];
  }

  async createPick(opportunity: Opportunity): Promise<Pick> {
    const targetPrice = this.calculateTargetPrice(opportunity);
    const stopLoss = this.calculateStopLoss(opportunity, targetPrice);
    
    return {
      id: `pick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      opportunity,
      thesis: opportunity.reasoning,
      confidence: Math.min(0.9, opportunity.score / 100), // Convert score to 0-1 confidence
      targetPrice,
      stopLoss,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
    };
  }

  private calculateTargetPrice(opportunity: Opportunity): number {
    const currentPrice = opportunity.recommendedPosition === 'YES' 
      ? opportunity.market.yesPrice 
      : opportunity.market.noPrice;
    
    // Target 20% move in our direction
    const targetMove = 20; // cents
    
    return opportunity.recommendedPosition === 'YES'
      ? Math.min(95, currentPrice + targetMove)
      : Math.max(5, currentPrice + targetMove);
  }

  private calculateStopLoss(opportunity: Opportunity, targetPrice: number): number {
    const currentPrice = opportunity.recommendedPosition === 'YES' 
      ? opportunity.market.yesPrice 
      : opportunity.market.noPrice;
    
    // Stop loss at 10% adverse move
    const stopMove = 10; // cents
    
    return opportunity.recommendedPosition === 'YES'
      ? Math.max(5, currentPrice - stopMove)
      : Math.min(95, currentPrice - stopMove);
  }
}

// Test the picker
async function testPicker() {
  console.log('🎯 Testing Market Picker\n');
  
  const picker = new MarketPicker();
  const { fetchAllMarkets } = await import('./connectors');
  
  const markets = await fetchAllMarkets();
  const opportunities = await picker.rankOpportunities(markets);
  
  if (opportunities.length > 0) {
    console.log('\n🏆 TOP OPPORTUNITY:');
    console.log('═'.repeat(60));
    
    const top = opportunities[0];
    const pick = await picker.createPick(top);
    
    console.log(`Market: ${top.market.title}`);
    console.log(`Score: ${top.score.toFixed(2)}`);
    console.log(`Position: ${top.recommendedPosition}`);
    console.log(`Current: ${top.market.yesPrice}¢ YES / ${top.market.noPrice}¢ NO`);
    console.log(`Target: ${pick.targetPrice}¢`);
    console.log(`Stop Loss: ${pick.stopLoss}¢`);
    console.log(`Confidence: ${(pick.confidence * 100).toFixed(1)}%`);
    console.log(`\nThesis:`);
    pick.thesis.forEach((reason, i) => {
      console.log(`${i + 1}. ${reason}`);
    });
  }
}

if (require.main === module) {
  testPicker();
}