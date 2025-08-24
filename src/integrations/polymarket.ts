// Polymarket API Integration
import axios from 'axios';
import { Market, MarketBook, PolymarketResponse } from '../types';

export class PolymarketClient {
  private baseUrl = 'https://clob.polymarket.com';
  private apiClient = axios.create({
    baseURL: this.baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async getActiveMarkets(limit: number = 50): Promise<Market[]> {
    // For now, always use mock markets since Polymarket CLOB requires auth
    console.log('Using mock markets for development');
    return this.getMockMarkets();
    
    // Uncomment when you have Polymarket API access:
    /*
    try {
      const response = await this.apiClient.get('/markets', {
        params: {
          active: true,
          closed: false,
          limit,
          order: 'volume24hr',
          ascending: false
        }
      });

      return this.transformMarkets(response.data);
    } catch (error: any) {
      console.log('Using mock markets (API call failed)');
      return this.getMockMarkets();
    }
    */
  }

  async getMarketBySlug(slug: string): Promise<Market | null> {
    try {
      const response = await this.apiClient.get(`/markets/${slug}`);
      return this.transformMarket(response.data);
    } catch (error) {
      console.error(`Error fetching market ${slug}:`, error);
      return null;
    }
  }

  async getMarketOrderBook(marketId: string): Promise<MarketBook | null> {
    try {
      const response = await this.apiClient.get(`/book`, {
        params: {
          market: marketId
        }
      });

      return {
        marketId,
        bids: response.data.bids || [],
        asks: response.data.asks || [],
        spread: this.calculateSpread(response.data),
        midpoint: this.calculateMidpoint(response.data)
      };
    } catch (error) {
      console.error(`Error fetching order book for ${marketId}:`, error);
      return null;
    }
  }

  async getTrendingMarkets(): Promise<Market[]> {
    console.log('Getting trending markets...');
    try {
      // Get markets with high recent volume changes
      const markets = await this.getActiveMarkets(100);
      console.log(`Got ${markets.length} markets from getActiveMarkets`);
      
      // If we got mock markets, just return them
      if (markets.length <= 3) {
        return markets;
      }
      
      // Sort by volume momentum (24hr volume vs total volume ratio)
      return markets
        .filter(m => m.volume > 10000) // Minimum threshold
        .sort((a, b) => {
          const momentumA = a.volume24hr / (a.volume || 1);
          const momentumB = b.volume24hr / (b.volume || 1);
          return momentumB - momentumA;
        })
        .slice(0, 20);
    } catch (error) {
      console.error('Error fetching trending markets:', error);
      return this.getMockMarkets();
    }
  }

  private transformMarkets(data: any): Market[] {
    if (!data || !Array.isArray(data)) return [];
    return data.map(market => this.transformMarket(market));
  }

  private transformMarket(data: any): Market {
    return {
      id: data.condition_id || data.id,
      question: data.question || data.title,
      slug: data.slug,
      active: data.active !== false,
      closed: data.closed || false,
      volume: parseFloat(data.volume || 0),
      volume24hr: parseFloat(data.volume_24hr || data.volume24hr || 0),
      liquidity: parseFloat(data.liquidity || 0),
      startDate: data.start_date || data.startDate,
      endDate: data.end_date || data.endDate,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
      outcomes: this.transformOutcomes(data.outcomes || data.tokens),
      lastTradePrice: data.last_trade_price,
      probability: data.probability,
      tags: data.tags || []
    };
  }

  private transformOutcomes(outcomes: any[]): any[] {
    if (!outcomes) return [];
    return outcomes.map(outcome => ({
      id: outcome.token_id || outcome.id,
      title: outcome.outcome || outcome.title || (outcome.outcome_index === 0 ? 'NO' : 'YES'),
      price: parseFloat(outcome.price || 0),
      probability: parseFloat(outcome.price || 0) // Price represents probability in Polymarket
    }));
  }

  private calculateSpread(bookData: any): number {
    const bestBid = bookData.bids?.[0]?.price || 0;
    const bestAsk = bookData.asks?.[0]?.price || 1;
    return bestAsk - bestBid;
  }

  private calculateMidpoint(bookData: any): number {
    const bestBid = bookData.bids?.[0]?.price || 0;
    const bestAsk = bookData.asks?.[0]?.price || 1;
    return (bestBid + bestAsk) / 2;
  }

  // Mock data for development/testing
  private getMockMarkets(): Market[] {
    return [
      {
        id: 'mock-1',
        question: 'Will Taylor Swift announce a 2025 world tour before February?',
        slug: 'taylor-swift-2025-tour',
        active: true,
        closed: false,
        volume: 850000,
        volume24hr: 125000,
        liquidity: 50000,
        startDate: '2024-01-01',
        endDate: '2025-02-28',
        createdAt: '2024-01-01',
        updatedAt: new Date().toISOString(),
        outcomes: [
          { id: 'yes', title: 'YES', price: 0.75, probability: 0.75 },
          { id: 'no', title: 'NO', price: 0.25, probability: 0.25 }
        ],
        probability: 0.75,
        tags: ['entertainment', 'music']
      },
      {
        id: 'mock-2',
        question: 'Will the Fed cut rates in January 2025?',
        slug: 'fed-rates-jan-2025',
        active: true,
        closed: false,
        volume: 2500000,
        volume24hr: 450000,
        liquidity: 150000,
        startDate: '2024-01-01',
        endDate: '2025-01-31',
        createdAt: '2024-01-01',
        updatedAt: new Date().toISOString(),
        outcomes: [
          { id: 'yes', title: 'YES', price: 0.65, probability: 0.65 },
          { id: 'no', title: 'NO', price: 0.35, probability: 0.35 }
        ],
        probability: 0.65,
        tags: ['economics', 'finance']
      },
      {
        id: 'mock-3',
        question: 'Will Bitcoin reach $100k before March 2025?',
        slug: 'bitcoin-100k-march',
        active: true,
        closed: false,
        volume: 5000000,
        volume24hr: 750000,
        liquidity: 300000,
        startDate: '2024-01-01',
        endDate: '2025-03-31',
        createdAt: '2024-01-01',
        updatedAt: new Date().toISOString(),
        outcomes: [
          { id: 'yes', title: 'YES', price: 0.45, probability: 0.45 },
          { id: 'no', title: 'NO', price: 0.55, probability: 0.55 }
        ],
        probability: 0.45,
        tags: ['crypto', 'bitcoin']
      }
    ];
  }
}