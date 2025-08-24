// Kalshi API Integration
import axios from 'axios';
import { Market } from '../types';

export class KalshiClient {
  private baseUrl = 'https://trading-api.kalshi.com/trade-api/v2';
  private apiClient = axios.create({
    baseURL: this.baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    // Kalshi requires authentication for most endpoints
    this.initializeAuth();
  }

  private async initializeAuth() {
    const apiKey = process.env.KALSHI_API_KEY;
    
    if (!apiKey) {
      console.log('📝 Kalshi API key not configured');
      console.log('Add KALSHI_API_KEY to .env for real data');
      return;
    }

    try {
      // Use API key for authentication
      this.apiClient.defaults.headers.common['X-API-KEY'] = apiKey;
      this.token = apiKey;
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // API keys don't expire daily
      
      console.log('✅ Kalshi API key configured');
      
      // Test the connection
      const testResponse = await this.apiClient.get('/markets', {
        params: { limit: 1 }
      });
      
      console.log('✅ Kalshi API connection verified');
      
    } catch (error: any) {
      console.log('❌ Kalshi API key failed:', error.response?.data || error.message);
      console.log('💡 Make sure your API key is valid and has proper permissions');
    }
  }

  private async ensureValidToken() {
    if (!this.token || !this.tokenExpiry || new Date() > this.tokenExpiry) {
      console.log('🔄 Refreshing Kalshi token...');
      await this.initializeAuth();
    }
  }

  async getActiveMarkets(limit: number = 50): Promise<Market[]> {
    try {
      await this.ensureValidToken();
      
      if (!this.token) {
        console.log('🔄 No Kalshi auth, using mock data');
        return this.getMockKalshiMarkets();
      }

      console.log('Fetching real Kalshi markets...');
      const response = await this.apiClient.get('/markets', {
        params: {
          limit,
          status: 'open'
        }
      });

      console.log(`✅ Got ${response.data.markets?.length || 0} real markets from Kalshi`);
      return this.transformKalshiMarkets(response.data.markets || []);
      
    } catch (error: any) {
      console.log('🔄 Kalshi API failed, using mock data:', error.response?.data?.detail || error.message);
      return this.getMockKalshiMarkets();
    }
  }

  async getMarketDetails(marketTicker: string): Promise<Market | null> {
    try {
      await this.ensureValidToken();
      
      if (!this.token) return null;

      const response = await this.apiClient.get(`/markets/${marketTicker}`);
      return this.transformKalshiMarket(response.data.market);
      
    } catch (error: any) {
      console.error(`Error fetching Kalshi market ${marketTicker}:`, error.response?.data || error.message);
      return null;
    }
  }

  async getTrendingMarkets(): Promise<Market[]> {
    console.log('Getting trending Kalshi markets...');
    
    try {
      const markets = await this.getActiveMarkets(100);
      
      // Sort by volume and recent activity
      return markets
        .filter(m => m.volume > 1000) // Minimum threshold
        .sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0))
        .slice(0, 15);
        
    } catch (error) {
      console.error('Error fetching trending Kalshi markets:', error);
      return this.getMockKalshiMarkets();
    }
  }

  private transformKalshiMarkets(data: any[]): Market[] {
    return data.map(market => this.transformKalshiMarket(market));
  }

  private transformKalshiMarket(data: any): Market {
    // Convert Kalshi format to our unified Market interface
    return {
      id: data.ticker,
      question: data.title,
      slug: data.ticker.toLowerCase(),
      active: data.status === 'open',
      closed: data.status === 'closed',
      volume: parseFloat(data.volume || 0),
      volume24hr: parseFloat(data.volume_24h || 0),
      liquidity: parseFloat(data.open_interest || 0),
      startDate: data.open_time,
      endDate: data.close_time,
      createdAt: data.open_time,
      updatedAt: data.last_price_time,
      outcomes: [
        { 
          id: 'yes', 
          title: 'YES', 
          price: parseFloat(data.yes_ask || data.last_price || 0.5),
          probability: parseFloat(data.yes_ask || data.last_price || 0.5)
        },
        { 
          id: 'no', 
          title: 'NO', 
          price: 1 - parseFloat(data.yes_ask || data.last_price || 0.5),
          probability: 1 - parseFloat(data.yes_ask || data.last_price || 0.5)
        }
      ],
      lastTradePrice: parseFloat(data.last_price || 0),
      probability: parseFloat(data.yes_ask || data.last_price || 0.5),
      tags: [data.category?.toLowerCase() || 'general']
    };
  }

  private getMockKalshiMarkets(): Market[] {
    return [
      {
        id: 'FEDRATE-25JAN',
        question: 'Will the Fed cut interest rates at the January 2025 meeting?',
        slug: 'fed-rates-jan-2025',
        active: true,
        closed: false,
        volume: 1250000,
        volume24hr: 85000,
        liquidity: 75000,
        startDate: '2024-12-01',
        endDate: '2025-01-29',
        createdAt: '2024-12-01',
        updatedAt: new Date().toISOString(),
        outcomes: [
          { id: 'yes', title: 'YES', price: 0.32, probability: 0.32 },
          { id: 'no', title: 'NO', price: 0.68, probability: 0.68 }
        ],
        probability: 0.32,
        tags: ['economics', 'fed']
      },
      {
        id: 'STOCKS-25Q1',
        question: 'Will S&P 500 be above 6000 at end of Q1 2025?',
        slug: 'sp500-6000-q1',
        active: true,
        closed: false,
        volume: 980000,
        volume24hr: 125000,
        liquidity: 65000,
        startDate: '2024-11-01',
        endDate: '2025-03-31',
        createdAt: '2024-11-01',
        updatedAt: new Date().toISOString(),
        outcomes: [
          { id: 'yes', title: 'YES', price: 0.58, probability: 0.58 },
          { id: 'no', title: 'NO', price: 0.42, probability: 0.42 }
        ],
        probability: 0.58,
        tags: ['stocks', 'markets']
      }
    ];
  }
}

// Test Kalshi integration
async function testKalshiClient() {
  console.log('🎯 Testing Kalshi Integration\n');
  
  const kalshi = new KalshiClient();
  const markets = await kalshi.getTrendingMarkets();
  
  console.log(`Found ${markets.length} Kalshi markets:`);
  markets.forEach(market => {
    console.log(`\n📊 ${market.question}`);
    console.log(`   Probability: ${(market.probability * 100).toFixed(1)}% YES`);
    console.log(`   Volume: $${(market.volume / 1000).toFixed(0)}k`);
    console.log(`   24h Volume: $${(market.volume24hr / 1000).toFixed(0)}k`);
    console.log(`   Category: ${market.tags.join(', ')}`);
  });
}

if (require.main === module) {
  testKalshiClient();
}