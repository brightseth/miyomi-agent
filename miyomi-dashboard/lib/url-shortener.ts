// URL Shortener utility for Miyomi's market links

// Generate a short code from market title or ID
export function generateShortCode(marketId: string, marketTitle?: string): string {
  // If it's already a known pattern, use a readable short code
  if (marketTitle) {
    const title = marketTitle.toLowerCase();
    
    // Bitcoin markets
    if (title.includes('bitcoin') || title.includes('btc')) {
      if (title.includes('200')) return 'btc200';
      if (title.includes('150')) return 'btc150';
      if (title.includes('100')) return 'btc100';
    }
    
    // Ethereum markets
    if (title.includes('ethereum') || title.includes('eth')) {
      if (title.includes('10')) return 'eth10k';
      if (title.includes('5')) return 'eth5k';
    }
    
    // Recession/economy
    if (title.includes('recession')) return 'rec25';
    if (title.includes('fed') || title.includes('rate')) return 'fed25';
    
    // Politics
    if (title.includes('trump')) return 'trump25';
    if (title.includes('biden')) return 'biden25';
  }
  
  // Otherwise generate a unique 6-character code
  return generateRandomCode();
}

// Generate a random 6-character code
function generateRandomCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate the full short URL
export function generateShortUrl(marketId: string, marketTitle?: string, baseUrl?: string): string {
  const code = generateShortCode(marketId, marketTitle);
  const base = baseUrl || 'https://miyomi-dashboard.vercel.app';
  return `${base}/m/${code}`;
}

// Generate tracking URL with UTM parameters
export function generateTrackingUrl(
  marketId: string,
  source: 'twitter' | 'farcaster' | 'video' | 'daily',
  campaign?: string
): string {
  const code = generateShortCode(marketId);
  const params = new URLSearchParams({
    s: source,
    c: campaign || 'daily_pick',
    t: new Date().toISOString().split('T')[0]
  });
  
  return `https://miyomi-dashboard.vercel.app/m/${code}?${params.toString()}`;
}

// Extract market info from various URL formats
export function parseMarketUrl(url: string): { marketId?: string; code?: string } {
  // Check if it's already a short URL
  const shortMatch = url.match(/\/m\/([a-z0-9]+)/i);
  if (shortMatch) {
    return { code: shortMatch[1] };
  }
  
  // Check for Polymarket event URL
  const eventMatch = url.match(/polymarket\.com\/event\/([^?#]+)/i);
  if (eventMatch) {
    return { marketId: eventMatch[1] };
  }
  
  // Check for market parameter
  const marketMatch = url.match(/[?&]market=([^&#]+)/i);
  if (marketMatch) {
    return { marketId: marketMatch[1] };
  }
  
  return {};
}