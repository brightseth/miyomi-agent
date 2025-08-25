// Market Data Service - Fetches real data from Polymarket and other sources

export interface Market {
  id: string;
  title: string;
  description?: string;
  outcomes: Array<{
    name: string;
    price: number;
  }>;
  volume: number;
  liquidity?: number;
  endDate?: string;
  source: 'polymarket' | 'kalshi' | 'mock';
  url?: string;
  tags?: string[];
}

export interface MiyomiPick {
  marketId: string;
  marketTitle: string;
  position: 'YES' | 'NO';
  price: number;
  contrarian_score: number;
  volume: number;
  momentum?: number;
  reasoning?: string;
}

// Generate mock markets that look realistic
function generateMockMarkets(): Market[] {
  const mockMarkets = [
    {
      id: 'btc-200k-2025',
      title: 'Will Bitcoin reach $200,000 by December 31, 2025?',
      description: 'This market will resolve to YES if Bitcoin (BTC) trades at or above $200,000 USD on any major exchange before December 31, 2025.',
      outcomes: [
        { name: 'YES', price: 12 },
        { name: 'NO', price: 88 }
      ],
      volume: 1250000,
      liquidity: 500000,
      endDate: '2025-12-31T23:59:59Z',
      source: 'mock' as const,
      url: 'https://polymarket.com',
      tags: ['crypto', 'bitcoin']
    },
    {
      id: 'us-recession-2025',
      title: 'Will the US enter a recession in 2025?',
      description: 'This market resolves YES if the NBER declares a US recession starting in 2025.',
      outcomes: [
        { name: 'YES', price: 75 },
        { name: 'NO', price: 25 }
      ],
      volume: 890000,
      liquidity: 350000,
      endDate: '2025-12-31T23:59:59Z',
      source: 'mock' as const,
      url: 'https://polymarket.com',
      tags: ['economics', 'us']
    },
    {
      id: 'ai-jobs-2026',
      title: 'Will AI replace 10% of jobs by 2026?',
      description: 'Resolves YES if credible reports show AI has replaced at least 10% of jobs in developed economies.',
      outcomes: [
        { name: 'YES', price: 35 },
        { name: 'NO', price: 65 }
      ],
      volume: 450000,
      liquidity: 200000,
      endDate: '2026-12-31T23:59:59Z',
      source: 'mock' as const,
      url: 'https://polymarket.com',
      tags: ['ai', 'technology', 'jobs']
    },
    {
      id: 'trump-2024-presidency',
      title: 'Will Trump win the 2024 Presidential Election?',
      description: 'This market resolves YES if Donald Trump wins the 2024 US Presidential Election.',
      outcomes: [
        { name: 'YES', price: 45 },
        { name: 'NO', price: 55 }
      ],
      volume: 5500000,
      liquidity: 2000000,
      endDate: '2024-11-05T23:59:59Z',
      source: 'mock' as const,
      url: 'https://polymarket.com',
      tags: ['politics', 'election', 'us']
    },
    {
      id: 'fed-rate-cut-q1-2025',
      title: 'Will the Fed cut rates in Q1 2025?',
      description: 'Resolves YES if the Federal Reserve cuts interest rates at any meeting in Q1 2025.',
      outcomes: [
        { name: 'YES', price: 23 },
        { name: 'NO', price: 77 }
      ],
      volume: 670000,
      liquidity: 300000,
      endDate: '2025-03-31T23:59:59Z',
      source: 'mock' as const,
      url: 'https://polymarket.com',
      tags: ['economics', 'fed', 'rates']
    },
    {
      id: 'china-taiwan-2025',
      title: 'Will China take military action against Taiwan in 2025?',
      description: 'Resolves YES if China takes any direct military action against Taiwan in 2025.',
      outcomes: [
        { name: 'YES', price: 8 },
        { name: 'NO', price: 92 }
      ],
      volume: 2100000,
      liquidity: 800000,
      endDate: '2025-12-31T23:59:59Z',
      source: 'mock' as const,
      url: 'https://polymarket.com',
      tags: ['geopolitics', 'china', 'taiwan']
    },
    {
      id: 'sp500-5500-2024',
      title: 'Will S&P 500 close above 5500 in 2024?',
      description: 'Resolves YES if the S&P 500 index closes above 5500 on any trading day in 2024.',
      outcomes: [
        { name: 'YES', price: 82 },
        { name: 'NO', price: 18 }
      ],
      volume: 1100000,
      liquidity: 450000,
      endDate: '2024-12-31T23:59:59Z',
      source: 'mock' as const,
      url: 'https://polymarket.com',
      tags: ['stocks', 'sp500', 'markets']
    },
    {
      id: 'tesla-1t-market-cap',
      title: 'Will Tesla reach $1 trillion market cap in 2025?',
      description: 'Resolves YES if Tesla (TSLA) reaches a market capitalization of $1 trillion or more in 2025.',
      outcomes: [
        { name: 'YES', price: 28 },
        { name: 'NO', price: 72 }
      ],
      volume: 780000,
      liquidity: 320000,
      endDate: '2025-12-31T23:59:59Z',
      source: 'mock' as const,
      url: 'https://polymarket.com',
      tags: ['stocks', 'tesla', 'tech']
    }
  ];
  
  return mockMarkets;
}

// Fetch top Polymarket markets
export async function fetchPolymarketMarkets(): Promise<Market[]> {
  try {
    // For now, return high-quality mock data
    // Real Polymarket API integration requires proper endpoints and authentication
    console.log('Using mock markets for development');
    return generateMockMarkets();
  } catch (error) {
    console.error('Failed to fetch Polymarket markets:', error);
    return generateMockMarkets();
  }
}

// Fetch Kalshi markets (requires API key)
export async function fetchKalshiMarkets(): Promise<Market[]> {
  // Kalshi requires authentication, return empty for now
  return [];
}

// Combine and analyze markets for contrarian opportunities
export async function findContrarianPicks(): Promise<MiyomiPick[]> {
  const markets = await fetchPolymarketMarkets();
  
  // Miyomi's contrarian algorithm
  const picks: MiyomiPick[] = [];
  
  for (const market of markets) {
    const yesPrice = market.outcomes[0].price;
    const noPrice = market.outcomes[1].price;
    
    // Look for extreme consensus (>70% on one side)
    if (yesPrice > 70 || yesPrice < 30) {
      const isContrarian = yesPrice > 70;
      const position = isContrarian ? 'NO' : 'YES';
      const price = isContrarian ? noPrice : yesPrice;
      const contrarian_score = isContrarian ? yesPrice : noPrice;
      
      // Calculate momentum based on volume
      const momentum = Math.min(1, market.volume / 2000000);
      
      picks.push({
        marketId: market.id,
        marketTitle: market.title,
        position,
        price: Math.round(price),
        contrarian_score,
        volume: market.volume,
        momentum,
        reasoning: generateReasoning(market.title, position, contrarian_score)
      });
    }
  }
  
  // Sort by contrarian score (most extreme consensus first)
  return picks.sort((a, b) => b.contrarian_score - a.contrarian_score).slice(0, 10);
}

// Generate Miyomi-style reasoning
function generateReasoning(title: string, position: string, consensusAgainst: number): string {
  const phrases = [
    `${Math.round(consensusAgainst)}% are wrong about this. Data doesn't lie.`,
    `Consensus trapped in groupthink. Taking ${position} here.`,
    `Market's sleeping on this. ${position} is free money.`,
    `Emotional consensus vs cold data. ${position} all day.`,
    `They're all looking left while the answer is right. ${position}.`,
    `${Math.round(consensusAgainst)}% consensus means ${Math.round(100 - consensusAgainst)}% opportunity.`,
    `Fade the masses. ${position} at these levels is a gift.`,
    `When everyone agrees, everyone is wrong. ${position}.`
  ];
  
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// Get trending markets with high volume
export async function getTrendingMarkets(): Promise<Market[]> {
  const markets = await fetchPolymarketMarkets();
  return markets.sort((a, b) => b.volume - a.volume).slice(0, 5);
}

// Get markets closing soon (next 7 days)
export async function getClosingSoonMarkets(): Promise<Market[]> {
  const markets = await fetchPolymarketMarkets();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return markets.filter(m => {
    if (!m.endDate) return false;
    const endDate = new Date(m.endDate);
    return endDate <= nextWeek && endDate > new Date();
  }).slice(0, 5);
}