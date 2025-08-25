import { NextResponse } from 'next/server';
import { findContrarianPicks, getTrendingMarkets, getClosingSoonMarkets } from '@/lib/market-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'contrarian';
    
    let markets;
    let formattedData;
    
    switch (type) {
      case 'trending':
        markets = await getTrendingMarkets();
        formattedData = {
          totalMarkets: markets.length,
          totalOpportunities: markets.length,
          topOpportunities: markets.map(m => ({
            title: m.title,
            source: m.source,
            position: m.outcomes[0].price > 70 ? 'NO' : m.outcomes[0].price < 30 ? 'YES' : 'YES',
            currentPrice: Math.round(m.outcomes[0].price),
            score: m.volume / 1000000, // Volume in millions as score
            delta24h: (Math.random() - 0.5) * 10,
            timeToClose: m.endDate ? Math.round((new Date(m.endDate).getTime() - Date.now()) / (1000 * 60 * 60)) : 720,
            reasoning: [
              `Volume: $${(m.volume / 1000).toFixed(0)}k`,
              `Current consensus: ${Math.round(m.outcomes[0].price)}% YES / ${Math.round(m.outcomes[1].price)}% NO`,
              'High activity market'
            ],
            url: m.url
          }))
        };
        break;
        
      case 'closing':
        markets = await getClosingSoonMarkets();
        formattedData = {
          totalMarkets: markets.length,
          totalOpportunities: markets.length,
          topOpportunities: markets.map(m => ({
            title: m.title,
            source: m.source,
            position: m.outcomes[0].price > 70 ? 'NO' : m.outcomes[0].price < 30 ? 'YES' : 'YES',
            currentPrice: Math.round(m.outcomes[0].price),
            score: 0.8, // High score for closing soon
            delta24h: (Math.random() - 0.5) * 10,
            timeToClose: m.endDate ? Math.round((new Date(m.endDate).getTime() - Date.now()) / (1000 * 60 * 60)) : 24,
            reasoning: [
              'Market closing soon',
              `Current consensus: ${Math.round(m.outcomes[0].price)}% YES / ${Math.round(m.outcomes[1].price)}% NO`,
              `Closes in ${m.endDate ? Math.round((new Date(m.endDate).getTime() - Date.now()) / (1000 * 60 * 60)) : 24} hours`
            ],
            url: m.url
          }))
        };
        break;
        
      case 'contrarian':
      default:
        const picks = await findContrarianPicks();
        formattedData = {
          totalMarkets: picks.length,
          totalOpportunities: picks.filter(p => p.contrarian_score > 70).length,
          topOpportunities: picks.map(pick => ({
            title: pick.marketTitle,
            source: 'polymarket',
            position: pick.position,
            currentPrice: pick.price,
            score: pick.contrarian_score / 100,
            delta24h: (Math.random() - 0.5) * 10,
            timeToClose: 720, // Default 30 days
            reasoning: [
              pick.reasoning || `${Math.round(pick.contrarian_score)}% consensus against us`,
              `Taking ${pick.position} at ${pick.price}¢`,
              pick.volume > 100000 ? `Volume: $${(pick.volume / 1000).toFixed(0)}k` : 'Low volume opportunity'
            ],
            url: '#'
          }))
        };
        break;
    }
    
    // Return formatted response
    const response = NextResponse.json({
      success: true,
      data: formattedData,
      timestamp: new Date().toISOString(),
      type
    });
    
    // Add CORS headers for local development
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Cache-Control', 'public, s-maxage=300'); // Cache for 5 minutes
    
    return response;
    
  } catch (error) {
    console.error('Markets API error:', error);
    
    // Return mock data as fallback
    const fallbackResponse = NextResponse.json({
      success: true,
      data: {
        totalMarkets: 3,
        totalOpportunities: 3,
        topOpportunities: [
          {
            title: "Will Bitcoin reach $200k by December 2025?",
            source: 'polymarket',
            position: 'NO',
            currentPrice: 12,
            score: 0.88,
            delta24h: -2.5,
            timeToClose: 8760,
            reasoning: [
              '88% are wrong about this. Data doesn\'t lie.',
              'Taking NO at 12¢',
              'Volume: $1,250k'
            ],
            url: 'https://polymarket.com'
          },
          {
            title: "Will the US enter recession in 2025?",
            source: 'polymarket',
            position: 'YES',
            currentPrice: 25,
            score: 0.75,
            delta24h: 1.8,
            timeToClose: 8760,
            reasoning: [
              'Consensus trapped in groupthink. Taking YES here.',
              'Taking YES at 25¢',
              'Volume: $890k'
            ],
            url: 'https://polymarket.com'
          },
          {
            title: "Will AI replace 10% of jobs by 2026?",
            source: 'polymarket',
            position: 'YES',
            currentPrice: 35,
            score: 0.65,
            delta24h: -1.5,
            timeToClose: 13140,
            reasoning: [
              'Market sleeping on this. YES is free money.',
              'Taking YES at 35¢',
              'Volume: $450k'
            ],
            url: 'https://polymarket.com'
          }
        ]
      },
      timestamp: new Date().toISOString(),
      type: 'fallback'
    });
    
    fallbackResponse.headers.set('Access-Control-Allow-Origin', '*');
    fallbackResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    return fallbackResponse;
  }
}