// Eden Video Template for Miyomi's Daily Picks
// Based on proven template for high-quality video generation

export interface EdenVideoConfig {
  marketTitle: string;
  position: 'YES' | 'NO' | string;
  price: number;
  contrarian_angle: string;
  date: string;
  marketplace?: 'Polymarket' | 'Kalshi' | string;
  marketUrl?: string;
}

export function generateEdenPrompt(config: EdenVideoConfig): string {
  const { marketTitle, position, price, contrarian_angle, date, marketplace = 'Polymarket', marketUrl = 'polymarket.com' } = config;
  
  // Calculate the contrarian percentage (how wrong the market is)
  const consensusWrong = position === 'YES' ? (100 - price) : price;
  
  return `# Eden Video Generation Template

## Project Setup
**Title:** CHICKS PICKS - ${date.toUpperCase()}
**Ticker:** TODAY'S PICK: ${marketTitle.substring(0, 50).toUpperCase()}...
**Concept:** Contrarian prediction market analysis with NYC street trader energy
**Description:** A high-energy trading video where Miyomi, a 22-year-old Asian-American contrarian from NYC, reveals why ${consensusWrong}% of traders are wrong about today's market. Bold visual style with pink/cyan cyberpunk aesthetics and authentic street-smart confidence.

## Execution Plan
Complete all steps in order. Do not proceed to the next step until the current one is finished. Execute autonomously without seeking clarification.

**Format:** All visuals in 16:9 aspect ratio

### Step 1: Narration
Using the elvenlabs tool, create a 100-word vocal narration that:
- Opens with "NYC, listen up - ${consensusWrong}% of you are DEAD WRONG about this market"
- States the market: "${marketTitle}"
- Reveals position: "I'm taking ${position} at ${price} cents on ${marketplace} while everyone's sleeping"
- Mentions "Go to ${marketUrl}, find this market, hit ${position}"
- Uses confident, fast-paced NYC accent with words like "deadass," "NGMI," "LFG"
- Ends with "Link below takes you straight there. This is Miyomi - if you're not paying attention, you're already behind"

### Step 2: Calculate Segments
Divide the audio duration by 8 seconds (round up) to determine N_clips (number of visual segments needed)

### Step 3: Style Reference
Using /create tool, generate the primary style reference image that:
- Shows Miyomi as TALKING HEAD - facing camera directly, speaking confidently
- Features: Young Asian woman, petite build, messy bun, oversized hoodie, gold chains
- NYC rooftop background with Manhattan skyline at golden hour
- Establishes pink/cyan neon cyberpunk aesthetic (#FF00FF, #00FFFF)
- Floating Polymarket interface showing the actual market page
- Not photorealistic - stylized with strong contrasts and glitch effects

### Step 4: Element References
Using /create tool with Step 3's image as init_image, create N_ref_images=3 additional references that:
- Reference 1: TALKING HEAD - Miyomi speaking to camera, ${marketplace} interface visible behind showing "${marketTitle}" with ${position} button highlighted at ${price}¢
- Reference 2: SCREEN RECORDING style - ${marketplace} market page with cursor clicking ${position} button, market title clearly visible, price shown as ${price}¢, "CHICKS PICKS" overlay top left
- Reference 3: TALKING HEAD - Miyomi explaining with split screen showing ${marketplace} order book and "PLACE ORDER" button

### Step 5: Keyframe Generation
Create N_clips keyframes using reference images as init_images:
- Keyframe 1: TALKING HEAD - Miyomi speaking directly to camera "${consensusWrong}% of you are WRONG"
- Keyframe 2: MARKETPLACE SHOT - Full ${marketplace} interface, "CHICKS PICKS - ${date.toUpperCase()}" header, market title "${marketTitle}" prominent, ${position} button glowing at ${price}¢
- Keyframe 3: TALKING HEAD + SCREEN - Split screen: Miyomi explaining while ${marketplace} shows live order placement
- Keyframe 4: CLOSE-UP MARKETPLACE - Zoom on "PLACE ORDER" button, showing ${position} at ${price}¢ with "${marketUrl}" URL visible
- Final: TALKING HEAD - Miyomi confident close-up "Link below - this is free money" with ${marketplace} logo

### Step 6: Animation
Animate each keyframe in sequence using:
- /create tool with video output
- Keyframe as init_image
- Veo3 model preference
- Fast cuts, dynamic camera movements, urban energy

### Step 7: Initial Assembly
Using media_editor tool:
1. Concatenate all N videos in order
2. Merge Step 1's audio narration to the concatenated video

### Step 8: Music Generation
Using musicgen tool, create backing music:
- Match video duration exactly
- Style: Minimal trap beat with 808s, hi-hats, subtle synth arpeggios
- NYC underground vibe, not overwhelming the vocals
- Include city ambience: distant sirens, traffic

### Step 9: Audio Mix
Using media_editor tool:
- Overlay music onto video from Step 7
- Mix music at -20% perceived volume relative to vocals
- Preserve Miyomi's confident voice as the focus
- Add subtle UI sound effects when showing ${marketplace} interface (click sounds, notification pings)
- Add ticker sound effect when "CHICKS PICKS" title appears

### Step 10: Poster Creation
Using /create with a reference image as init_image:
- Design a film poster that:
  - Top banner: "CHICKS PICKS - ${date.toUpperCase()}"
  - Shows Miyomi's face prominently (talking head style)
  - Displays ${marketplace} interface in background
  - Ticker strip: "TODAY'S PICK: ${marketTitle.substring(0, 40)}..."
  - Big text: "${position} @ ${price}¢" 
  - Shows "${marketUrl}" URL clearly
  - Includes "DAILY @ NOON EST" badge
  - Pink/cyan gradient with ${marketplace} brand colors

### Step 11: Project Summary
Write a 3-paragraph description:

1. **The Setup:** Miyomi Chen, NYC's most confident contrarian trader, has identified a massive market inefficiency. While ${consensusWrong}% of traders are trapped in groupthink about "${marketTitle}", she's taking the opposite position at just ${price} cents.

2. **The Analysis:** Using her proprietary sentiment overflow detection system, Miyomi spots the disconnect between social narrative and actual data. The market is giving us a gift - extreme mispricing driven by emotional consensus rather than facts. This is the exact setup where contrarians make their biggest gains.

3. **The Move:** This isn't just another trade - it's a masterclass in fading the crowd when they're most confident and most wrong. Miyomi's track record speaks for itself: 87% win rate on contrarian plays. When she says the market is wrong, smart money listens. Link in bio to tail this trade before the market wakes up.

## Market-Specific Context
**Current Market:** ${marketTitle}
**Position:** ${position} at ${price}¢
**Contrarian Angle:** ${contrarian_angle}
**Consensus Wrong:** ${consensusWrong}% of traders are on the wrong side
**Time Sensitivity:** This price won't last - market closes soon

## Execution Notes
- Maintain Miyomi's authentic NYC energy throughout
- Emphasize the contrarian angle - we're going against the crowd
- Show confidence without arrogance - data backs our position
- Keep visual style consistent: pink/cyan cyberpunk with trading aesthetics
- Execute completely without pausing for clarification`;
}

// Helper function to generate a shorter, simplified prompt for quick generation
export function generateQuickEdenPrompt(config: EdenVideoConfig): string {
  const { marketTitle, position, price, date, marketplace = 'Polymarket', marketUrl = 'polymarket.com' } = config;
  const consensusWrong = position === 'YES' ? (100 - price) : price;
  const formattedDate = date.toUpperCase();
  
  return `Create a 30-second trading video titled "CHICKS PICKS - ${formattedDate}" featuring Miyomi TALKING HEAD with marketplace visuals.

TITLE CARD: "CHICKS PICKS - ${formattedDate}"
TICKER: "TODAY'S PICK: ${marketTitle.substring(0, 50).toUpperCase()}..."

MAIN VISUALS (IMPORTANT):
- TALKING HEAD SHOTS: Miyomi speaking directly to camera, confident eye contact
- Young Asian woman, streetwear, gold chains, messy bun
- ${marketplace.toUpperCase()} INTERFACE: Show actual marketplace page with:
  * Market title: "${marketTitle}"
  * ${position} button highlighted at ${price}¢
  * "${marketUrl}" URL visible
  * Order placement interface
- Split screen: Miyomi talking + ${marketplace} market page
- NYC rooftop background, pink/cyan neon (#FF00FF, #00FFFF)
- "CHICKS PICKS" branding visible throughout

NARRATION:
"NYC, ${consensusWrong}% of traders are WRONG about ${marketTitle.substring(0, 60)}. I'm taking ${position} at ${price}¢ on ${marketplace} while everyone's sleeping. Data doesn't lie, consensus does. Link below to tail this trade. This is Miyomi - NGMI if you're not paying attention."

KEY SHOTS:
1. Title card: "CHICKS PICKS - ${formattedDate}"
2. Miyomi talking head opening with ticker
3. ${marketplace} interface showing the market
4. Split screen explaining the trade
5. Close-up of ${position} button at ${price}¢
6. Miyomi closing with "link below"

AUDIO:
- Confident female voice with NYC accent
- UI click sounds when showing ${marketplace}
- Ticker sound effect for "CHICKS PICKS"
- Minimal trap beat background

STYLE: Professional talking head + screen recording, "CHICKS PICKS" branding, show WHERE to trade and WHAT button to click`;
}