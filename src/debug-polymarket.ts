// Debug Polymarket API response
import axios from 'axios';

async function debugPolymarketAPI() {
  console.log('🔍 Debugging Polymarket API Response\n');
  
  try {
    const response = await axios.get('https://clob.polymarket.com/markets', {
      params: {
        active: true,
        closed: false,
        limit: 3
      }
    });

    console.log('Status:', response.status);
    console.log('Response structure:');
    console.log('- Type:', typeof response.data);
    console.log('- Has data property:', 'data' in response.data);
    console.log('- Data type:', typeof response.data.data);
    console.log('- Data length:', response.data.data?.length);
    
    if (response.data.data && response.data.data.length > 0) {
      const firstMarket = response.data.data[0];
      console.log('\nFirst market sample:');
      console.log('- Question:', firstMarket.question);
      console.log('- Active:', firstMarket.active);
      console.log('- Closed:', firstMarket.closed);
      console.log('- Volume:', firstMarket.volume);
      console.log('- Tokens:', firstMarket.tokens?.length || 0);
      
      if (firstMarket.tokens?.length > 0) {
        console.log('- First token:', {
          outcome: firstMarket.tokens[0].outcome,
          price: firstMarket.tokens[0].price
        });
      }
    }
    
    // Filter for truly active markets
    const activeMarkets = response.data.data.filter(m => m.active && !m.closed);
    console.log(`\nFound ${activeMarkets.length} truly active markets`);
    
    activeMarkets.slice(0, 3).forEach((market, i) => {
      console.log(`${i + 1}. ${market.question}`);
      console.log(`   Volume: ${market.volume || 'N/A'}`);
      console.log(`   Outcomes: ${market.tokens?.map(t => `${t.outcome}: ${t.price}`).join(', ') || 'N/A'}`);
    });
    
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

debugPolymarketAPI();