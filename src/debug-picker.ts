// Debug the picker filtering
import { fetchAllMarkets } from './services/svc-markets/connectors';

async function debugPicker() {
  console.log('🔍 Debugging Market Picker\n');
  
  const markets = await fetchAllMarkets();
  console.log(`Got ${markets.length} total markets`);
  
  console.log('\nSample market time analysis:');
  markets.slice(0, 5).forEach((market, i) => {
    const timeToClose = (new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60);
    console.log(`${i + 1}. ${market.title.substring(0, 50)}...`);
    console.log(`   Closes: ${market.closesAt}`);
    console.log(`   Time to close: ${timeToClose.toFixed(1)} hours`);
    console.log(`   YES: ${market.yesPrice}¢, NO: ${market.noPrice}¢`);
    console.log(`   Volume 24h: ${market.volume24h || 0}`);
    
    // Check filtering criteria
    const timeOk = timeToClose >= 1 && timeToClose <= 365 * 24;
    const priceOk = market.yesPrice >= 5 && market.yesPrice <= 95;
    console.log(`   Filters: Time=${timeOk}, Price=${priceOk}`);
  });
  
  // Check time distribution
  const timeRanges = {
    'Next hour': 0,
    'Next day': 0, 
    'Next week': 0,
    'Next month': 0,
    'Later': 0
  };
  
  markets.forEach(market => {
    const hours = (new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hours < 1) timeRanges['Next hour']++;
    else if (hours < 24) timeRanges['Next day']++;
    else if (hours < 24 * 7) timeRanges['Next week']++;
    else if (hours < 24 * 30) timeRanges['Next month']++;
    else timeRanges['Later']++;
  });
  
  console.log('\n⏰ TIME TO CLOSE DISTRIBUTION:');
  Object.entries(timeRanges).forEach(([range, count]) => {
    console.log(`${range}: ${count} markets`);
  });
}

debugPicker();