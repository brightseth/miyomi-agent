// Market data connectors with proper normalization
import { Market, MarketSchema } from './types';

export async function fetchPolymarket(): Promise<Market[]> {
  const out: Market[] = [];
  let cursor = "";
  
  console.log('📊 Fetching Polymarket markets...');
  
  do {
    try {
      const url = `https://clob.polymarket.com/markets${cursor ? `?next_cursor=${encodeURIComponent(cursor)}` : ""}`;
      const resp = await fetch(url).then(r => r.json());
      
      for (const m of resp.data || []) {
        // Only process active markets
        if (!m.active || m.closed || !m.accepting_orders) continue;
        
        try {
          const market: Market = {
            source: 'polymarket',
            id: m.condition_id,
            url: `https://polymarket.com/event/${m.market_slug}`,
            title: m.question,
            category: m.category || 'general',
            closesAt: m.end_date_iso,
            yesPrice: m.tokens?.[0]?.price ? Math.round(m.tokens[0].price * 100) : 50,
            noPrice: m.tokens?.[1]?.price ? Math.round(m.tokens[1].price * 100) : 50,
            liquidityScore: m.liquidity ? Math.min(1, m.liquidity / 100000) : 0.5,
            volume24h: m.volume_24hr || 0,
            lastTradeTime: m.updated_at,
          };
          
          // Validate with zod
          const validated = MarketSchema.parse(market);
          out.push(validated);
          
        } catch (parseError) {
          // Skip invalid markets
          continue;
        }
      }
      
      cursor = resp.next_cursor && resp.next_cursor !== "-LTE=" ? resp.next_cursor : "";
      
      // Don't fetch too many pages
      if (out.length > 100) break;
      
    } catch (error) {
      console.error('Polymarket fetch error:', error);
      break;
    }
  } while (cursor);

  console.log(`✅ Normalized ${out.length} Polymarket markets`);
  return out;
}

export async function fetchKalshi(series?: string): Promise<Market[]> {
  const BASE = "https://api.elections.kalshi.com/trade-api/v2";
  
  console.log('📊 Fetching Kalshi markets...');
  
  try {
    const url = `${BASE}/markets?status=open${series ? `&series_ticker=${series}` : ""}`;
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': process.env.KALSHI_API_KEY || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Kalshi API error: ${response.status} ${response.statusText}`);
    }
    
    const { markets } = await response.json();
    
    const out: Market[] = [];
    
    for (const m of markets || []) {
      try {
        const market: Market = {
          source: 'kalshi',
          id: m.ticker,
          url: `https://kalshi.com/markets/${m.ticker}`,
          title: m.title,
          category: m.category || 'general',
          closesAt: m.close_time,
          yesPrice: Math.round(m.yes_price || 50),
          noPrice: Math.round(100 - (m.yes_price || 50)),
          liquidityScore: m.open_interest ? Math.min(1, m.open_interest / 10000) : 0.5,
          volume24h: m.volume_24h || 0,
          lastTradeTime: m.last_update_time,
        };
        
        // Validate with zod
        const validated = MarketSchema.parse(market);
        out.push(validated);
        
      } catch (parseError) {
        // Skip invalid markets
        continue;
      }
    }
    
    console.log(`✅ Normalized ${out.length} Kalshi markets`);
    return out;
    
  } catch (error: any) {
    console.error('Kalshi fetch error:', error.message);
    return [];
  }
}

export async function fetchAllMarkets(): Promise<Market[]> {
  console.log('🌐 Fetching from all market sources...');
  
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarket().catch(err => {
      console.log('Polymarket failed:', err.message);
      return [];
    }),
    fetchKalshi().catch(err => {
      console.log('Kalshi failed:', err.message);
      return [];
    })
  ]);
  
  const allMarkets = [...polymarkets, ...kalshiMarkets];
  console.log(`📈 Total normalized markets: ${allMarkets.length}`);
  
  return allMarkets;
}

// Test the connectors
async function testConnectors() {
  console.log('🧪 Testing Market Connectors\n');
  
  const markets = await fetchAllMarkets();
  
  console.log('\n📊 SAMPLE MARKETS:');
  console.log('═'.repeat(60));
  
  markets.slice(0, 5).forEach((market, i) => {
    console.log(`\n${i + 1}. ${market.title}`);
    console.log(`   Source: ${market.source}`);
    console.log(`   YES: ${market.yesPrice}¢, NO: ${market.noPrice}¢`);
    console.log(`   Volume 24h: $${(market.volume24h / 1000).toFixed(0)}k`);
    console.log(`   Liquidity: ${(market.liquidityScore * 100).toFixed(0)}%`);
    console.log(`   Closes: ${new Date(market.closesAt).toLocaleDateString()}`);
    console.log(`   URL: ${market.url}`);
  });
  
  // Show source breakdown
  const breakdown = markets.reduce((acc, m) => {
    acc[m.source] = (acc[m.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📈 SOURCE BREAKDOWN:');
  Object.entries(breakdown).forEach(([source, count]) => {
    console.log(`${source}: ${count} markets`);
  });
}

if (require.main === module) {
  testConnectors();
}