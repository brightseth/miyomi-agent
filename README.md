# 🎭 Miyomi - The Contrarian Prediction Market Agent

> *"NYC's Chaos Coordinator of Prediction Markets"*

Miyomi is an AI-powered prediction market trading agent with personality. She runs a daily show called "Chick's Pick" where she analyzes markets on Polymarket and takes contrarian positions, mixing sophisticated market analysis with downtown NYC party girl energy.

## Character Profile

**Miyomi** is a 20-something trader living in Lower East Side, NYC. She believes the city's social and cultural signals predict markets better than traditional analysis. Her trading philosophy: *"The market consensus is usually wrong, especially when everyone agrees."*

### Personality Traits
- **Smart but chaotic** - Mixes real market analysis with astrology and vibes
- **Confidently contrarian** - Always betting against the herd
- **NYC culture oracle** - References Dimes Square parties and bodega wisdom
- **Gen-Z trader** - Uses trading slang naturally ("aping in", "diamond hands")

## Features

### 🎯 Core Functionality
- **Daily Chick's Pick** - Automated contrarian market analysis at 12pm EST
- **Personality Engine** - Dynamic voice that adapts based on mood and performance
- **Market Analysis** - Identifies inefficiencies and contrarian opportunities
- **Performance Tracking** - Monitors picks and updates win rate
- **State Management** - Persistent memory of all picks and outcomes

### 📊 Market Intelligence
- Analyzes market consensus for overconfidence
- Detects volume anomalies and manipulation
- Scores cultural relevance of prediction markets
- Identifies contrarian angles others miss

### 🗣️ Voice & Personality
- Time-based mood shifts (philosophical mornings, chaotic nights)
- NYC-specific references and cultural touchpoints
- Mixes sophisticated analysis with gen-z chaos
- Consistent character voice across all posts

## Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd miyomi-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Usage

### Generate Today's Pick (One-Time)
```bash
npm run run
```

### Start Daily Scheduler
```bash
npm run schedule
# Miyomi will post daily at 12pm EST
```

### Check Statistics
```bash
npm run stats
```

### Test Mode
```bash
npm run test
```

## Example Output

```
🎭 CHICK'S PICK
════════════════════════════════════════════════════════════
bestiesss wake up it's time for today's absolutely unhinged pick 💅

Not everyone betting on Taylor Swift tour announcement without checking her jet tracker. The market's 80% sure but her plane's been parked in Nashville for DAYS. Plus Mercury's in retrograde and she's a Sagittarius - the vibes are OFF.

Loading NO because the bodega guy told me she's focusing on re-recordings instead 🥂
════════════════════════════════════════════════════════════

Market: Will Taylor Swift announce a 2025 world tour before February?
Position: NO
Consensus: 80%
Miyomi's Target: 60%
```

## Architecture

```
miyomi-agent/
├── src/
│   ├── core/
│   │   ├── miyomi-agent.ts       # Main agent orchestration
│   │   └── market-analyzer.ts    # Contrarian market analysis
│   ├── personality/
│   │   └── miyomi-personality.ts # Voice and character engine
│   ├── integrations/
│   │   └── polymarket.ts         # Polymarket API client
│   ├── scheduler/
│   │   └── scheduler.ts          # Cron job management
│   ├── state/
│   │   └── state-manager.ts      # Persistent state handling
│   └── index.ts                   # Entry point
```

## Daily Schedule

- **12:00 PM EST** - Chick's Pick (main contrarian market call)
- **6:00 PM EST** - Performance update on active picks
- **Sunday 2:00 PM EST** - Weekly recap and stats

## Contrarian Logic

Miyomi identifies inefficiencies through:
1. **Extreme Consensus** (>80% or <20%) - Markets hate certainty
2. **Volume Anomalies** - Sudden spikes without news = manipulation
3. **Cultural Relevance** - Pop culture markets always overhype
4. **Near Expiry Confidence** - Last-minute certainty is usually wrong

## Performance Tracking

Miyomi tracks:
- Win rate across all picks
- Best/worst performing calls
- Personality adjustments based on recent performance
- P&L for each position

## Future Enhancements

- [ ] Social media integration (Twitter/X, Farcaster)
- [ ] Live market monitoring and alerts
- [ ] Multi-market simultaneous positions
- [ ] Community interaction and replies
- [ ] Custom market creation
- [ ] Advanced technical analysis
- [ ] Integration with on-chain trading

## Configuration

### Environment Variables
```bash
ANTHROPIC_API_KEY=your-api-key    # Required: Claude API access
TWITTER_API_KEY=                  # Optional: For Twitter posting
FARCASTER_PRIVATE_KEY=             # Optional: For Farcaster posting
```

### Personality Settings
Miyomi's personality adapts based on:
- Time of day (morning philosophy → afternoon sass → evening chaos)
- Recent performance (winning streak = confident, losing = more chaotic)
- Market conditions (volatile markets increase energy)

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run specific commands
npm start [run|update|schedule|test|stats]
```

## API Integration

Currently supports:
- **Polymarket CLOB API** - Market data and order books
- **Anthropic Claude API** - Enhanced personality and analysis

## License

MIT

---

*"The market consensus is adorable but wrong. Loading bags because my tarot reader in Washington Square told me so."* - Miyomi