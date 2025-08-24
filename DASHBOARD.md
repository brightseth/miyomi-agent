# Miyomi Dashboard 🎭

A web interface for managing Miyomi's data-driven content trading operations and Eden video generation.

## Features

### 📊 Live Market Monitoring (`/markets`)
- Real-time contrarian opportunities from Polymarket + Kalshi
- Automatic scoring and ranking
- One-click pick generation
- Direct market links

### 🎨 Eden Video Studio (`/eden`)
- Automated video brief generation
- Template follows Eden's exact format
- Customizable for each market pick
- Copy-to-clipboard for Eden interface

### 📈 Performance Dashboard (`/`)
- Win rate and PnL tracking
- Engagement metrics
- Recent post history
- Quick access to all features

## Access

Dashboard is running at: **http://localhost:3005**

### Pages:
- **Home**: http://localhost:3005
- **Markets**: http://localhost:3005/markets
- **Eden Studio**: http://localhost:3005/eden

## API Endpoints

- `GET /api/markets` - Fetch live market opportunities
- `POST /api/generate-pick` - Generate pick from market
- `GET /api/stats` - Performance statistics

## Eden Video Workflow

1. Navigate to Eden Studio (`/eden`)
2. Enter market details or use generated pick
3. Click "Generate Eden Video Brief"
4. Copy the generated template
5. Paste into Eden's interface for autonomous video creation

The template includes:
- 100-word narration script
- Visual style references
- Keyframe specifications
- Audio mixing instructions
- Complete execution plan

## Architecture Integration

The dashboard connects to your main Miyomi pipeline:
- Uses same market connectors and scoring logic
- Shares content generation with Claude
- Integrates with Farcaster publishing
- Tracks engagement and PnL

## Environment Variables

Ensure these are set in your main `.env`:
```
ANTHROPIC_API_KEY=your_key
NEYNAR_API_KEY=your_key
FARCASTER_SIGNER_UUID=your_uuid
KALSHI_API_KEY=your_key
EDEN_API_KEY=your_key (when available)
```

## Next Steps

1. **Video Generation**: Use Eden Studio to create rich media for picks
2. **Market Monitoring**: Watch `/markets` for high-scoring opportunities
3. **Performance Tracking**: Monitor win rate and engagement metrics
4. **Automation**: Schedule daily picks through the main pipeline

The dashboard provides manual control over aspects that need human oversight while the main pipeline handles automated trading and posting.