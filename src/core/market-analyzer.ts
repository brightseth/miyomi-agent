// Market Analysis Engine with Contrarian Logic
import { Market, MarketAnalysis } from '../types';
import { PolymarketClient } from '../integrations/polymarket';

export class MarketAnalyzer {
  private polymarket: PolymarketClient;

  constructor(polymarket: PolymarketClient) {
    this.polymarket = polymarket;
  }

  async analyzeMarket(market: Market): Promise<MarketAnalysis> {
    const inefficiencyScore = this.calculateInefficiency(market);
    const culturalRelevance = this.assessCulturalRelevance(market);
    const volumeAnomalies = this.detectVolumeAnomalies(market);
    const priceMovement = this.analyzePriceMovement(market);
    const contrarianAngle = this.findContrarianAngle(market);
    
    const { recommendation, reasoning } = this.generateRecommendation(
      market,
      inefficiencyScore,
      culturalRelevance,
      contrarianAngle
    );

    return {
      marketId: market.id,
      inefficiencyScore,
      contrarianAngle,
      culturalRelevance,
      volumeAnomalies,
      priceMovement,
      recommendation,
      reasoning
    };
  }

  private calculateInefficiency(market: Market): number {
    let score = 0;

    // High consensus (>80% or <20%) suggests potential inefficiency
    const probability = market.outcomes[0].probability;
    if (probability > 0.8 || probability < 0.2) {
      score += 30;
    }

    // High volume with stable price suggests herd mentality
    if (market.volume24hr > 100000 && this.isPriceStable(market)) {
      score += 25;
    }

    // Recent surge in volume might indicate FOMO
    const volumeRatio = market.volume24hr / (market.volume / 30); // Assuming 30 day average
    if (volumeRatio > 3) {
      score += 20;
    }

    // Low liquidity relative to volume suggests manipulation potential
    if (market.liquidity < market.volume24hr * 0.1) {
      score += 15;
    }

    // Markets near expiry with high certainty are often wrong
    const daysToExpiry = this.getDaysToExpiry(market.endDate);
    if (daysToExpiry < 7 && (probability > 0.75 || probability < 0.25)) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  private assessCulturalRelevance(market: Market): number {
    let score = 0;
    const question = market.question.toLowerCase();
    
    // Pop culture keywords
    const popCulture = ['taylor', 'swift', 'kardashian', 'tiktok', 'viral', 'celebrity', 'influencer'];
    const hasPopCulture = popCulture.some(keyword => question.includes(keyword));
    if (hasPopCulture) score += 30;

    // Tech/Crypto culture
    const techCrypto = ['bitcoin', 'ethereum', 'ai', 'openai', 'elon', 'musk', 'twitter', 'meta'];
    const hasTechCrypto = techCrypto.some(keyword => question.includes(keyword));
    if (hasTechCrypto) score += 25;

    // Politics but fun
    const funPolitics = ['trump', 'biden', 'election', 'congress', 'supreme court'];
    const hasPolitics = funPolitics.some(keyword => question.includes(keyword));
    if (hasPolitics) score += 20;

    // NYC relevant
    const nycKeywords = ['new york', 'nyc', 'manhattan', 'brooklyn', 'subway'];
    const hasNYC = nycKeywords.some(keyword => question.includes(keyword));
    if (hasNYC) score += 25;

    return Math.min(score, 100);
  }

  private detectVolumeAnomalies(market: Market): boolean {
    // Detect unusual volume patterns
    const volumeRatio = market.volume24hr / (market.volume / 30);
    const hasSpike = volumeRatio > 5;
    
    // Check if volume doesn't match price movement
    const priceStable = this.isPriceStable(market);
    const highVolumeStablePrice = market.volume24hr > 50000 && priceStable;
    
    return hasSpike || highVolumeStablePrice;
  }

  private analyzePriceMovement(market: Market): 'stable' | 'volatile' | 'trending' {
    // This would ideally look at historical data
    // For now, using heuristics based on current data
    
    const probability = market.outcomes[0].probability;
    
    // Near 50/50 suggests volatility
    if (probability > 0.45 && probability < 0.55) {
      return 'volatile';
    }
    
    // High volume with extreme probability suggests trending
    if (market.volume24hr > 100000 && (probability > 0.7 || probability < 0.3)) {
      return 'trending';
    }
    
    return 'stable';
  }

  private findContrarianAngle(market: Market): string {
    const probability = market.outcomes[0].probability;
    const question = market.question.toLowerCase();
    
    // Generate contrarian narrative based on market characteristics
    if (probability > 0.8) {
      return "Everyone's too confident - markets hate certainty";
    } else if (probability < 0.2) {
      return "Classic oversold situation - fear creates opportunity";
    } else if (this.detectVolumeAnomalies(market)) {
      return "Volume screams manipulation - fade the fake pump";
    } else if (question.includes('announce') || question.includes('release')) {
      return "Announcement markets always leak - insiders already positioned";
    } else if (question.includes('reach') || question.includes('hit')) {
      return "Round number targets are psychological traps";
    } else {
      return "Consensus formed too quickly - suspicious";
    }
  }

  private generateRecommendation(
    market: Market,
    inefficiencyScore: number,
    culturalRelevance: number,
    contrarianAngle: string
  ): { recommendation: 'YES' | 'NO' | 'SKIP', reasoning: string[] } {
    const reasoning: string[] = [];
    const probability = market.outcomes[0].probability;
    
    // Skip if not interesting enough
    if (inefficiencyScore < 40 && culturalRelevance < 30) {
      return { recommendation: 'SKIP', reasoning: ['Market too boring for Chicks Pick'] };
    }

    // Contrarian logic: bet against extreme consensus
    let recommendation: 'YES' | 'NO' | 'SKIP';
    
    if (probability > 0.75) {
      recommendation = 'NO';
      reasoning.push('Market is way too confident in YES');
      reasoning.push('Herd mentality alert - everyone piling into YES');
    } else if (probability < 0.25) {
      recommendation = 'YES';
      reasoning.push('Market severely undervaluing YES probability');
      reasoning.push('Fear has pushed this too low');
    } else if (this.detectVolumeAnomalies(market)) {
      // Fade volume spikes
      recommendation = probability > 0.5 ? 'NO' : 'YES';
      reasoning.push('Volume spike without news = manipulation');
      reasoning.push('Smart money is on the other side');
    } else if (culturalRelevance > 60) {
      // Cultural events tend to disappoint expectations
      recommendation = probability > 0.5 ? 'NO' : 'YES';
      reasoning.push('Pop culture markets always overhype');
      reasoning.push('The universe loves to humble prediction markets');
    } else {
      // Default contrarian
      recommendation = probability > 0.5 ? 'NO' : 'YES';
      reasoning.push(contrarianAngle);
    }

    // Add Miyomi-specific reasoning
    if (market.question.includes('Fed') || market.question.includes('rate')) {
      reasoning.push("Jerome Powell's zodiac chart says otherwise");
    }
    if (market.question.includes('Taylor Swift')) {
      reasoning.push("Her jet tracker patterns don't lie");
    }
    if (market.question.includes('Bitcoin') || market.question.includes('crypto')) {
      reasoning.push("Crypto markets move on vibes not fundamentals");
    }

    return { recommendation, reasoning };
  }

  private isPriceStable(market: Market): boolean {
    // Check if price is relatively stable (would need historical data ideally)
    const probability = market.outcomes[0].probability;
    return probability > 0.4 && probability < 0.6;
  }

  private getDaysToExpiry(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = Math.abs(end.getTime() - now.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async findBestContrarianPick(markets: Market[]): Promise<Market | null> {
    let bestMarket: Market | null = null;
    let bestScore = 0;

    for (const market of markets) {
      const analysis = await this.analyzeMarket(market);
      
      if (analysis.recommendation === 'SKIP') continue;
      
      // Score based on inefficiency and cultural relevance
      const score = analysis.inefficiencyScore + (analysis.culturalRelevance * 0.5);
      
      if (score > bestScore) {
        bestScore = score;
        bestMarket = market;
      }
    }

    return bestMarket;
  }
}