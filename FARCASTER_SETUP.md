# 🟣 Farcaster Setup for Miyomi

## Quick Setup (Using Neynar)

### 1. Create Miyomi's Farcaster Account
- Go to [Warpcast](https://warpcast.com)
- Sign up with username like `@miyomi` or `@miyomiNYC`
- Save the **recovery phrase** (12 words)
- Complete profile:
  - Name: "Miyomi"
  - Bio: "NYC's chaos coordinator of prediction markets 🎭 Daily contrarian picks at 12pm EST. The market consensus is adorable but wrong 💅"
  - PFP: Generate an AI image of a chaotic NYC girl

### 2. Get Neynar API Key (Easy posting)
- Go to [Neynar Dashboard](https://dev.neynar.com)
- Sign up for free account
- Create new app
- Copy your API key

### 3. Create a Signer for Miyomi
- In Neynar dashboard, go to "Signers"
- Click "Create Signer"
- Connect Miyomi's Farcaster account
- Copy the `signer_uuid`

### 4. Add to Environment Variables

**Local (.env):**
```bash
# Farcaster via Neynar
NEYNAR_API_KEY=your-neynar-api-key
FARCASTER_SIGNER_UUID=your-signer-uuid
```

**Vercel Dashboard:**
Add the same variables at:
https://vercel.com/edenprojects/miyomi-agent/settings/environment-variables

## Alternative: Direct Farcaster (Advanced)

If you want to post directly without Neynar:

### 1. Get Miyomi's Private Key
```bash
# From the recovery phrase, derive the private key
# Use this tool: https://farcaster-auth.vercel.app
```

### 2. Add to .env
```bash
FARCASTER_MNEMONIC="your twelve word recovery phrase here"
# OR
FARCASTER_PRIVATE_KEY=0x...your-private-key
```

## Test Your Setup

### Local Test:
```bash
npm run test-farcaster
```

### Production Test:
```bash
curl -X POST https://miyomi-agent.vercel.app/api/manual-pick \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Channels to Join

Have Miyomi follow and post in:
- `/predictions` - Main prediction markets channel
- `/polymarket` - Polymarket specific
- `/degen` - For the chaos energy
- `/nyc` - Local vibes

## First Post Ideas

Let Miyomi introduce herself:
```
"bestiesss your new prediction market oracle has arrived 🎭 

daily contrarian picks at 12pm EST because the consensus is literally always wrong

i trade on vibes, mercury retrograde, and what my bodega guy tells me

first pick dropping tomorrow 💅"
```

## Monitoring

- Check posts: https://warpcast.com/miyomi
- Neynar dashboard: https://dev.neynar.com
- Vercel logs: Check for posting confirmations

## Ready to Post!

Once configured, Miyomi will automatically post:
- Daily picks at 12pm EST
- Performance updates at 6pm EST
- Weekly recaps on Sundays

The chaos coordinator is ready for Farcaster! 🟣