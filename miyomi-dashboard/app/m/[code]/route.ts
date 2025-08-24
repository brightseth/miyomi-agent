import { NextRequest, NextResponse } from 'next/server';

// Market code mapping - in production this would be in a database
const marketCodes: Record<string, string> = {
  // Bitcoin markets
  'c841fp': 'will-bitcoin-btc-reach-200000-by-december-31-2025',
  'btc200': 'will-bitcoin-btc-reach-200000-by-december-31-2025',
  'btc150': 'will-bitcoin-btc-reach-150000-by-december-31-2025',
  'btc100': 'will-bitcoin-reach-100000-in-2025',
  
  // Recession markets
  'rec25': 'will-there-be-a-us-recession-in-2025',
  'fed25': 'will-the-fed-cut-rates-in-2025',
  
  // Politics
  'trump25': 'will-trump-serve-as-president-in-2025',
  'biden25': 'will-biden-complete-his-term',
  
  // Crypto markets
  'eth5k': 'will-ethereum-reach-5000-in-2025',
  'sol500': 'will-solana-reach-500-in-2025',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const utm = request.nextUrl.searchParams;
  
  // Get the market slug from our mapping
  const marketSlug = marketCodes[code.toLowerCase()];
  
  if (!marketSlug) {
    // If code not found, redirect to Polymarket homepage with error tracking
    const fallbackUrl = new URL('https://polymarket.com');
    fallbackUrl.searchParams.set('ref', 'miyomi');
    fallbackUrl.searchParams.set('utm_source', 'short_link');
    fallbackUrl.searchParams.set('utm_campaign', 'invalid_code');
    fallbackUrl.searchParams.set('code', code);
    
    return NextResponse.redirect(fallbackUrl);
  }
  
  // Build the full Polymarket URL
  const polymarketUrl = new URL(`https://polymarket.com/event/${marketSlug}`);
  
  // Add tracking parameters
  polymarketUrl.searchParams.set('ref', 'miyomi');
  polymarketUrl.searchParams.set('utm_source', utm.get('s') || 'short_link');
  polymarketUrl.searchParams.set('utm_medium', utm.get('m') || 'social');
  polymarketUrl.searchParams.set('utm_campaign', utm.get('c') || code);
  
  // Add any additional UTM params from the short URL
  utm.forEach((value, key) => {
    if (!['s', 'm', 'c'].includes(key)) {
      polymarketUrl.searchParams.set(key, value);
    }
  });
  
  // Log for analytics (in production, save to database)
  console.log(`Redirect: /m/${code} -> ${polymarketUrl.toString()}`);
  
  return NextResponse.redirect(polymarketUrl);
}