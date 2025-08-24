# 🚀 Complete Miyomi Setup Guide

Follow these steps to deploy Miyomi with full cloud infrastructure:

## 1️⃣ Local Setup & Testing

### Add your Anthropic API Key
Edit `.env` file and add your key:
```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
```

### Test locally
```bash
npm run test
npm run run  # Generate a real pick
```

## 2️⃣ GitHub Setup

### Initialize git and create repository
```bash
git init
git add .
git commit -m "Initial Miyomi setup"

# Using GitHub CLI (install with: brew install gh)
gh auth login
gh repo create miyomi-agent --public --source=. --push
```

Or manually:
1. Go to https://github.com/new
2. Create repo named "miyomi-agent"
3. Run:
```bash
git remote add origin https://github.com/YOUR-USERNAME/miyomi-agent.git
git push -u origin main
```

## 3️⃣ Supabase Setup (Cloud Database)

### Create Supabase Project
1. Go to https://supabase.com
2. Create new project (free tier)
3. Save your credentials:
   - Project URL: https://YOUR-PROJECT.supabase.co
   - Anon Key: eyJhbGc...
   - Service Role Key: eyJhbGc... (keep secret!)

### Create Database Tables
Run this SQL in Supabase SQL Editor:

```sql
-- Picks table
CREATE TABLE picks (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  market_id TEXT NOT NULL,
  market_question TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('YES', 'NO')),
  reasoning TEXT NOT NULL,
  consensus_price DECIMAL(3,2) NOT NULL,
  miyomi_price DECIMAL(3,2) NOT NULL,
  post TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance tracking
CREATE TABLE pick_performance (
  pick_id TEXT PRIMARY KEY REFERENCES picks(id),
  current_price DECIMAL(3,2) NOT NULL,
  pnl DECIMAL(4,3) NOT NULL,
  pnl_percent DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('winning', 'losing', 'flat')),
  last_updated TIMESTAMPTZ NOT NULL
);

-- Personality state
CREATE TABLE personality_state (
  id SERIAL PRIMARY KEY,
  mood TEXT NOT NULL,
  energy TEXT NOT NULL,
  current_vibe TEXT NOT NULL,
  win_rate DECIMAL(3,2),
  total_picks INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_picks_timestamp ON picks(timestamp DESC);
CREATE INDEX idx_picks_market_id ON picks(market_id);
```

### Update .env
```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-key
```

## 4️⃣ Vercel Deployment

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy
```bash
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project name? miyomi-agent
# - Which directory? ./
# - Override settings? No
```

### Add Environment Variables in Vercel
1. Go to https://vercel.com/YOUR-USERNAME/miyomi-agent/settings/environment-variables
2. Add:
   - ANTHROPIC_API_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY

### Configure for Cron Jobs
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-pick",
      "schedule": "0 17 * * *"
    },
    {
      "path": "/api/cron/performance-update",
      "schedule": "0 23 * * *"
    }
  ]
}
```

## 5️⃣ Polymarket Trading Setup (Optional)

### Get API Access
1. Visit https://polymarket.com
2. Complete KYC verification
3. Generate API keys in settings

### Add to .env
```
POLYMARKET_API_KEY=your-api-key
POLYMARKET_SECRET=your-secret
```

## 6️⃣ Social Media Integration

### Twitter/X
```
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
```

### Farcaster
```
FARCASTER_MNEMONIC=your twelve word phrase here
FARCASTER_FID=your-fid
```

## 🎯 Quick Commands

### Development
```bash
npm run dev          # Development mode with auto-reload
npm run test         # Test pick generation
npm run run          # Generate one pick
npm run schedule     # Run scheduler locally
```

### Production
```bash
vercel --prod        # Deploy to production
vercel logs          # View logs
```

## 📊 Monitoring

### Check Deployment
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Logs: `vercel logs --follow`

### Database Queries
```sql
-- Recent picks
SELECT * FROM picks ORDER BY timestamp DESC LIMIT 10;

-- Win rate
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN pp.status = 'winning' THEN 1 ELSE 0 END) as wins,
  ROUND(AVG(CASE WHEN pp.status = 'winning' THEN 1 ELSE 0 END) * 100, 2) as win_rate
FROM picks p
JOIN pick_performance pp ON p.id = pp.pick_id;
```

## 🚨 Troubleshooting

### Vercel Functions Timeout
- Upgrade to Pro for longer timeouts
- Or use Edge Functions

### Supabase Connection Issues
- Check service key is correct
- Ensure tables are created
- Check RLS policies

### Polymarket API Errors
- Verify KYC is complete
- Check API rate limits
- Use public endpoints for reading

## 🎉 Success Checklist

- [ ] Local test works
- [ ] GitHub repo created
- [ ] Supabase tables created
- [ ] Vercel deployment live
- [ ] Environment variables set
- [ ] Cron jobs configured
- [ ] First pick generated

Once all checked, Miyomi will run automatically at 12pm EST daily!