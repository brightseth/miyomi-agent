// Eden Video Template for Miyomi's Daily Picks
// Based on PROVEN winning formats: Vertical clips with odds overlays

export interface EdenVideoConfig {
  marketTitle: string;
  position: 'YES' | 'NO' | string;
  price: number;
  contrarian_angle: string;
  date: string;
  marketplace?: 'Polymarket' | 'Kalshi' | string;
  marketUrl?: string;
  previousPrice?: number; // For showing momentum
  volume?: number; // For credibility
  whaleActivity?: boolean; // For urgency
}

export function generateEdenPrompt(config: EdenVideoConfig): string {
  const { 
    marketTitle, 
    position, 
    price, 
    contrarian_angle, 
    date, 
    marketplace = 'Polymarket', 
    marketUrl = 'polymarket.com',
    previousPrice,
    volume 
  } = config;
  
  // Calculate the contrarian percentage
  const consensusWrong = position === 'YES' ? (100 - price) : price;
  const priceMovement = previousPrice ? price - previousPrice : 0;
  const volumeK = volume ? Math.round(volume / 1000) : 0;
  
  return `# Eden Video Generation - ODDS OVERLAY FORMAT
## Based on @polymarketsports winning template (637k followers)

## Project Setup
**Title:** CHICKS PICKS - ${date.toUpperCase()}
**Format:** VERTICAL 9:16 (TikTok/IG Reels optimized)
**Length:** 30-45 seconds MAX
**Style:** Odds-over-clip format that's PROVEN to work

## WINNING STRUCTURE (0-45s)
Based on research of top performing prediction content:

### 0-3s: HOOK WITH ODDS ON SCREEN
- Big text overlay: "${consensusWrong}% ARE WRONG"
- Subtext: "${marketTitle.substring(0, 60)}"
- Visual: Miyomi TALKING HEAD looking directly at camera

### 3-12s: CONTEXT CLIP + LIVE ODDS
- Show NEWS CLIP or MARKET SCREENSHOT related to ${marketTitle}
- PERMANENT OVERLAY (top left): Live odds ticker showing:
  * "${position} @ ${price}¢" in green if profitable
  * Previous: ${previousPrice || price - 5}¢ → Current: ${price}¢
  * Volume: $${volumeK}k
- Bottom bar: "${marketplace.toUpperCase()}" logo

### 12-25s: WHY ODDS MOVED (Data reveal)
- Split screen: Miyomi explaining + ${marketplace} interface
- Show the ACTUAL MARKET PAGE with:
  * Market title clearly visible
  * ${position} button highlighted
  * Order book showing liquidity
- Miyomi's take: "${contrarian_angle}"
- Text overlay: "Consensus trapped in groupthink"

### 25-40s: CTA WITH ODDS STICKER
- Full screen ${marketplace} showing:
  * How to place the trade
  * ${position} button at ${price}¢
  * URL bar showing ${marketUrl}
- Miyomi voiceover: "Link below to tail this trade"
- Final overlay: "DAILY @ NOON EST"

## Narration Script (Match to visuals)
"${consensusWrong}% think ${position === 'YES' ? 'this won\'t happen' : 'this will happen'}. 

They're wrong.

${marketTitle}.

I'm taking ${position} at ${price} cents.

${volume ? `$${volumeK}k already flowing in.` : 'Market\'s sleeping on this.'}

Data says one thing, narrative says another.

When everyone agrees, everyone is wrong.

Link below. Noon tomorrow, we do it again."

## CRITICAL OVERLAYS (Always visible)
Based on what's working for @polymarketsports:

1. **Odds Ticker (Top Left):** 
   - Live updating: "${position} ${price}¢"
   - Color: Green if winning, red if losing

2. **Position Bar (Bottom):**
   - "MIYOMI'S PICK: ${position} @ ${price}¢"
   - ${marketplace} logo

3. **Urgency Sticker (When applicable):**
   - "WHALE ALERT 🐋" if large volume
   - "CLOSING SOON ⏰" if market ending

## Visual Identity
- Miyomi: Young Asian woman, streetwear, confident direct-to-camera
- Background: NYC rooftop OR clean studio with monitors
- Color scheme: Pink/cyan accents (#FF00FF, #00FFFF)
- Font: Bold, clean, readable on mobile
- Show REAL ${marketplace} interface, not mockups

## Audio Mix
- Vocals: Clear, confident, slight NYC accent
- Music: Minimal trap beat, -20% volume vs voice
- SFX: UI clicks when showing trades, cash register on CTA

## Platform Optimization
- Vertical 9:16 for TikTok/IG Reels
- Captions burned in for silent viewing
- Hook within 1 second
- No dead space, constant visual interest

## Success Metrics This Achieves
- Zero-click engagement (odds visible immediately)
- High retention (structure proven by @polymarketsports)
- Clear CTA (exact platform and button to click)
- Credibility (showing real interface, real odds)

Remember: This format has 637k followers on TikTok. Don't innovate, replicate.`;
}

// Quick version for rapid generation
export function generateQuickEdenPrompt(config: EdenVideoConfig): string {
  const { marketTitle, position, price, date, marketplace = 'Polymarket' } = config;
  const consensusWrong = position === 'YES' ? (100 - price) : price;
  
  return `30-SECOND VERTICAL VIDEO - ODDS OVERLAY FORMAT

STRUCTURE (Copy @polymarketsports exactly):
0-3s: "${consensusWrong}% ARE WRONG" text overlay + Miyomi talking head
3-12s: Market context clip with LIVE ODDS TICKER (top left): "${position} @ ${price}¢"
12-25s: Split screen - Miyomi + ${marketplace} interface showing the trade
25-30s: CTA "Link below" with ${marketplace} order screen

OVERLAYS (Always visible):
- Top left: Live odds "${position} ${price}¢"
- Bottom: "MIYOMI'S PICK" bar
- ${marketplace} logo

NARRATION:
"${consensusWrong}% wrong about ${marketTitle}. Taking ${position} at ${price}¢. Link below."

Style: Vertical 9:16, pink/cyan accent, real ${marketplace} interface
Audio: Clear voice, minimal beat, UI sounds

This format works. Don't change it.`;
}

// Generate content for other platforms based on winning formats
export function generatePlatformContent(
  config: EdenVideoConfig,
  platform: 'x' | 'farcaster' | 'instagram'
): string {
  const consensusWrong = config.position === 'YES' ? (100 - config.price) : config.price;
  
  switch (platform) {
    case 'x':
      // X Card format (zero-click engagement)
      return `${consensusWrong}% consensus on ${config.marketTitle}

Taking ${config.position} at ${config.price}¢

${config.contrarian_angle}

Reply with your take or tag @AskPolymarket for live odds`;

    case 'farcaster':
      // Mini app format (Frames deprecated)
      return `${consensusWrong}% trapped in groupthink.

Market: ${config.marketTitle}
Position: ${config.position} @ ${config.price}¢

Trade via mini app below 👇`;

    case 'instagram':
      // Carousel format
      return `Slide 1: ${config.marketTitle}?
Slide 2: Current odds - ${config.position} @ ${config.price}¢
Slide 3: ${consensusWrong}% think opposite
Slide 4: Miyomi's take: ${config.contrarian_angle}
Slide 5: Link in bio to trade`;

    default:
      return '';
  }
}