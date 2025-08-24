// AI-powered content generation engine for Miyomi
export interface MarketOpportunity {
  marketId: string;
  title: string;
  position: string;
  currentPrice: number;
  momentum: number;
  contrarian_score: number;
  social_sentiment: 'bullish' | 'bearish' | 'neutral';
  volume_trend: 'increasing' | 'decreasing' | 'stable';
  time_sensitivity: 'urgent' | 'medium' | 'low';
}

export interface ContentSuggestion {
  hook: string;
  angle: string;
  urgency_level: number;
  expected_engagement: number;
  platform_optimization: Record<string, string>;
  script_preview: string;
}

export class MiyomiAIEngine {
  
  // Analyze market for content opportunities
  static analyzeMarketOpportunity(market: Record<string, unknown>): MarketOpportunity {
    const contrarian_score = this.calculateContrarianScore(market);
    const momentum = this.calculateMomentum(market);
    const social_sentiment = this.analyzeSocialSentiment(market);
    
    return {
      marketId: (market.id as string) || `market_${Date.now()}`,
      title: (market.title as string) || 'Unknown Market',
      position: (market.position as string) || 'YES',
      currentPrice: (market.currentPrice as number) || 50,
      momentum,
      contrarian_score,
      social_sentiment,
      volume_trend: this.analyzeVolumeTrend(market),
      time_sensitivity: this.assessTimeSensitivity(market)
    };
  }

  // Generate smart content suggestions
  static generateContentSuggestions(opportunity: MarketOpportunity): ContentSuggestion[] {
    const suggestions: ContentSuggestion[] = [];
    
    // High contrarian score = confident take
    if (opportunity.contrarian_score > 0.8) {
      suggestions.push({
        hook: `Everyone's ${opportunity.position === 'YES' ? 'bearish' : 'bullish'} but check this data 👀`,
        angle: 'data_revelation',
        urgency_level: 9,
        expected_engagement: 0.12,
        platform_optimization: {
          tiktok: 'Quick cuts, data overlay, "THEY\'RE WRONG" energy',
          twitter: 'Thread with charts, position reveal at end',
          farcaster: 'Technical analysis, whale watching data'
        },
        script_preview: this.generateScriptPreview(opportunity, 'confident_contrarian')
      });
    }

    // High momentum = breaking news angle
    if (opportunity.momentum > 0.7) {
      suggestions.push({
        hook: `This market just MOVED and nobody's talking about it`,
        angle: 'breaking_analysis',
        urgency_level: 8,
        expected_engagement: 0.09,
        platform_optimization: {
          tiktok: 'Urgent energy, live reaction vibes',
          twitter: 'Real-time commentary thread',
          farcaster: 'Quick alpha drop'
        },
        script_preview: this.generateScriptPreview(opportunity, 'breaking_news')
      });
    }

    // Time sensitive = FOMO angle
    if (opportunity.time_sensitivity === 'urgent') {
      suggestions.push({
        hook: `Last chance to get in before this market realizes what's happening`,
        angle: 'opportunity_window',
        urgency_level: 10,
        expected_engagement: 0.15,
        platform_optimization: {
          tiktok: 'Clock ticking visual, urgent countdown',
          twitter: 'Position size reveal, "loading up" energy',
          farcaster: 'Alpha group exclusive vibes'
        },
        script_preview: this.generateScriptPreview(opportunity, 'urgent_opportunity')
      });
    }

    return suggestions.sort((a, b) => b.expected_engagement - a.expected_engagement);
  }

  // Calculate contrarian opportunity score
  private static calculateContrarianScore(market: Record<string, unknown>): number {
    const price = (market.currentPrice as number) || 50;
    const volume = (market.volume24h as number) || 1000;
    
    // Higher score for extreme prices with decent volume
    const price_extremity = Math.abs(50 - price) / 50;
    const volume_factor = Math.min(1, volume / 50000);
    
    return Math.min(1, price_extremity * 0.7 + volume_factor * 0.3);
  }

  // Calculate market momentum
  private static calculateMomentum(market: Record<string, unknown>): number {
    const delta = (market.priceMovement24h as number) || 0;
    const volume_change = (market.volumeChange24h as number) || 0;
    
    return Math.min(1, (Math.abs(delta) * 0.6 + Math.abs(volume_change) * 0.4) / 10);
  }

  // Analyze social sentiment
  private static analyzeSocialSentiment(market: Record<string, unknown>): 'bullish' | 'bearish' | 'neutral' {
    const price = (market.currentPrice as number) || 50;
    
    if (price > 70) return 'bullish';
    if (price < 30) return 'bearish';
    return 'neutral';
  }

  // Analyze volume trend
  private static analyzeVolumeTrend(market: Record<string, unknown>): 'increasing' | 'decreasing' | 'stable' {
    const volumeChange = (market.volumeChange24h as number) || 0;
    
    if (volumeChange > 20) return 'increasing';
    if (volumeChange < -20) return 'decreasing';
    return 'stable';
  }

  // Assess time sensitivity
  private static assessTimeSensitivity(market: Record<string, unknown>): 'urgent' | 'medium' | 'low' {
    const timeToClose = (market.timeToClose as number) || 1000;
    
    if (timeToClose < 24) return 'urgent';
    if (timeToClose < 168) return 'medium';
    return 'low';
  }

  // Generate script preview based on style
  private static generateScriptPreview(opportunity: MarketOpportunity, style: string): string {
    const templates = {
      confident_contrarian: `Okay NYC, ${opportunity.title.substring(0, 30)}... I'm taking ${opportunity.position} at ${opportunity.currentPrice}¢ while everyone else is ${opportunity.social_sentiment}. Market consensus is WRONG and here's why...`,
      
      breaking_news: `JUST IN: ${opportunity.title.substring(0, 25)}... moved to ${opportunity.currentPrice}¢ and I called this yesterday. If you're not watching this market, you're missing the play of the week...`,
      
      urgent_opportunity: `Listen up - ${opportunity.title.substring(0, 30)}... This ${opportunity.currentPrice}¢ price won't last. I'm loading up before everyone else figures out what we already know...`
    };
    
    return templates[style as keyof typeof templates] || templates.confident_contrarian;
  }

  // Predict engagement based on market and content factors
  static predictEngagement(opportunity: MarketOpportunity, suggestion: ContentSuggestion): {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    conversion_rate: number;
  } {
    const base_views = 5000;
    const engagement_multiplier = suggestion.expected_engagement;
    const urgency_boost = suggestion.urgency_level / 10;
    const contrarian_boost = opportunity.contrarian_score;
    
    const total_multiplier = 1 + engagement_multiplier + urgency_boost + contrarian_boost;
    
    const views = Math.round(base_views * total_multiplier);
    
    return {
      views,
      likes: Math.round(views * 0.08),
      comments: Math.round(views * 0.02),
      shares: Math.round(views * 0.03),
      conversion_rate: Math.min(0.06, 0.02 + contrarian_boost * 0.04)
    };
  }

  // Generate optimized posting schedule
  static optimizePostingSchedule(opportunities: MarketOpportunity[]): {
    time: string;
    market: MarketOpportunity;
    reasoning: string;
  }[] {
    const schedule = [];
    
    // Daily pick at noon (highest engagement)
    const noonPick = opportunities
      .sort((a, b) => b.contrarian_score - a.contrarian_score)[0];
    
    if (noonPick) {
      schedule.push({
        time: '12:00 PM EST',
        market: noonPick,
        reasoning: 'Peak engagement time + highest contrarian score'
      });
    }

    // Morning market scan (8am)
    const morningScan = opportunities
      .filter(o => o.momentum > 0.6)[0];
    
    if (morningScan) {
      schedule.push({
        time: '8:00 AM EST',
        market: morningScan,
        reasoning: 'Pre-market momentum + news cycle capture'
      });
    }

    // Evening wrap (6pm)
    const eveningWrap = opportunities
      .filter(o => o.time_sensitivity === 'urgent')[0];
    
    if (eveningWrap) {
      schedule.push({
        time: '6:00 PM EST',
        market: eveningWrap,
        reasoning: 'After-hours opportunity + time-sensitive play'
      });
    }

    return schedule;
  }
}

// Smart dashboard state management
export class DashboardAI {
  
  // Auto-refresh with intelligent intervals
  static getRefreshInterval(marketVolatility: number): number {
    // More volatile markets = faster refresh
    if (marketVolatility > 0.8) return 10000; // 10 seconds
    if (marketVolatility > 0.5) return 30000; // 30 seconds
    return 60000; // 1 minute
  }

  // Generate dashboard insights
  static generateInsights(markets: Record<string, unknown>[]): string[] {
    const insights = [];
    
    const avgPrice = markets.reduce((sum, m) => sum + ((m.currentPrice as number) || 0), 0) / markets.length;
    if (avgPrice > 60) {
      insights.push('🔥 Markets running hot - look for contrarian shorts');
    } else if (avgPrice < 40) {
      insights.push('❄️ Fear in the markets - contrarian longs setting up');
    }

    const highVolume = markets.filter(m => ((m.volume24h as number) || 0) > 100000).length;
    if (highVolume > 3) {
      insights.push('📈 High volume across multiple markets - big money moving');
    }

    const urgentMarkets = markets.filter(m => ((m.timeToClose as number) || 1000) < 48).length;
    if (urgentMarkets > 2) {
      insights.push('⏰ Multiple markets closing soon - time-sensitive opportunities');
    }

    return insights;
  }
}