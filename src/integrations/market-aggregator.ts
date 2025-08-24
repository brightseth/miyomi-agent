// Unified market data aggregator for Polymarket + Kalshi
import { Market } from '../types';
import { PolymarketClient } from './polymarket';
import { KalshiClient } from './kalshi';
import { PublicMarketDataClient } from './public-market-data';

export interface MarketSource {
  name: 'polymarket' | 'kalshi' | 'public-crypto' | 'public-stocks' | 'public-economic';
  priority: number;
  enabled: boolean;
}

export class MarketAggregator {
  private polymarket: PolymarketClient;
  private kalshi: KalshiClient;
  private publicData: PublicMarketDataClient;
  private sources: MarketSource[] = [
    { name: 'polymarket', priority: 1, enabled: true },
    { name: 'kalshi', priority: 2, enabled: true },
    { name: 'public-crypto', priority: 3, enabled: true },
    { name: 'public-stocks', priority: 4, enabled: true },
    { name: 'public-economic', priority: 5, enabled: true }
  ];

  constructor() {
    this.polymarket = new PolymarketClient();
    this.kalshi = new KalshiClient();
    this.publicData = new PublicMarketDataClient();
  }

  async getAllActiveMarkets(limit: number = 50): Promise<Market[]> {
    console.log('🌐 Aggregating markets from all sources...');
    
    const allMarkets: Market[] = [];
    
    // Get markets from each source in parallel
    const marketPromises = this.sources
      .filter(source => source.enabled)
      .map(async (source) => {
        try {
          console.log(`📊 Fetching from ${source.name}...`);
          
          let markets: Market[] = [];
          
          switch (source.name) {
            case 'polymarket':
              markets = await this.polymarket.getActiveMarkets(limit);
              break;
            case 'kalshi':
              markets = await this.kalshi.getActiveMarkets(limit);
              break;
            case 'public-crypto':
              markets = await this.publicData.getCryptoTrendingMarkets();
              break;
            case 'public-stocks':
              markets = await this.publicData.getStockTrendingMarkets();
              break;
            case 'public-economic':
              markets = await this.publicData.getEconomicMarkets();
              break;
            default:
              markets = [];
          }
          
          // Add source metadata
          return markets.map(market => ({
            ...market,
            source: source.name,
            sourcePriority: source.priority
          }));
        } catch (error) {
          console.log(`❌ ${source.name} failed:`, error);
          return [];
        }
      });

    const results = await Promise.all(marketPromises);
    results.forEach(markets => allMarkets.push(...markets));

    console.log(`✅ Aggregated ${allMarkets.length} total markets`);
    
    // Remove duplicates and sort by volume/importance
    const uniqueMarkets = this.deduplicateMarkets(allMarkets);
    const sortedMarkets = this.sortByImportance(uniqueMarkets);
    
    return sortedMarkets.slice(0, limit);
  }

  async getTrendingMarkets(limit: number = 20): Promise<Market[]> {
    console.log('🔥 Getting trending markets across all platforms...');
    
    const allMarkets = await this.getAllActiveMarkets(100);
    
    // Calculate trending score based on volume momentum and consensus
    const trendingMarkets = allMarkets
      .map(market => ({
        ...market,
        trendingScore: this.calculateTrendingScore(market)
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    console.log(`📈 Found ${trendingMarkets.length} trending markets`);
    
    // Log top trending for debugging
    trendingMarkets.slice(0, 3).forEach((market, i) => {
      console.log(`${i + 1}. ${market.question} (${market.source})`);
      console.log(`   Consensus: ${(market.probability * 100).toFixed(1)}%, Volume: $${(market.volume / 1000).toFixed(0)}k`);
    });

    return trendingMarkets;
  }

  private deduplicateMarkets(markets: Market[]): Market[] {
    const seen = new Set();
    return markets.filter(market => {
      // Create a normalized key for deduplication
      const key = market.question.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private sortByImportance(markets: Market[]): Market[] {
    return markets.sort((a, b) => {
      // Priority: volume24hr > volume > source priority
      const scoreA = (a.volume24hr || 0) * 2 + (a.volume || 0) + (1000 / (a.sourcePriority || 1));
      const scoreB = (b.volume24hr || 0) * 2 + (b.volume || 0) + (1000 / (b.sourcePriority || 1));
      return scoreB - scoreA;
    });
  }

  private calculateTrendingScore(market: Market): number {
    let score = 0;
    
    // Volume momentum (24hr vs total)
    if (market.volume > 0) {
      const momentum = (market.volume24hr || 0) / market.volume;
      score += momentum * 100;
    }
    
    // Absolute volume weight
    score += Math.log(market.volume || 1) * 10;
    
    // Controversial markets (close to 50/50) are more interesting
    const controversy = 1 - Math.abs(market.probability - 0.5) * 2;
    score += controversy * 50;
    
    // Recent activity bonus
    if (market.updatedAt) {
      const hoursSinceUpdate = (Date.now() - new Date(market.updatedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate < 24) {
        score += (24 - hoursSinceUpdate) * 2;
      }
    }
    
    // Source priority
    score += (market.sourcePriority || 1) * 10;
    
    return score;
  }

  async getMarketsByCategory(category: string): Promise<Market[]> {
    const allMarkets = await this.getAllActiveMarkets(100);
    
    return allMarkets.filter(market => 
      market.tags.some(tag => 
        tag.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  getSourceStatus(): { [key: string]: boolean } {
    return {
      polymarket: this.sources.find(s => s.name === 'polymarket')?.enabled || false,
      kalshi: this.sources.find(s => s.name === 'kalshi')?.enabled || false
    };
  }
}

// Test the aggregator
async function testMarketAggregator() {
  console.log('🌐 Testing Market Aggregator\n');
  
  const aggregator = new MarketAggregator();
  
  console.log('Source status:', aggregator.getSourceStatus());
  
  const trending = await aggregator.getTrendingMarkets(5);
  
  console.log('\n🔥 TOP TRENDING MARKETS:');
  console.log('═'.repeat(50));
  
  trending.forEach((market, i) => {
    console.log(`\n${i + 1}. ${market.question}`);
    console.log(`   Source: ${market.source}`);
    console.log(`   Consensus: ${(market.probability * 100).toFixed(1)}% YES`);
    console.log(`   Volume: $${(market.volume / 1000).toFixed(0)}k (24h: $${(market.volume24hr / 1000).toFixed(0)}k)`);
    console.log(`   Tags: ${market.tags.join(', ')}`);
  });
  
  // Test category filtering
  console.log('\n💰 CRYPTO MARKETS:');
  const cryptoMarkets = await aggregator.getMarketsByCategory('crypto');
  cryptoMarkets.slice(0, 2).forEach(market => {
    console.log(`- ${market.question} (${(market.probability * 100).toFixed(1)}% YES)`);
  });
}

if (require.main === module) {
  testMarketAggregator();
}