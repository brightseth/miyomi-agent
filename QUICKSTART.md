# 🚀 Miyomi Quick Start Guide

## What You Need to Do Now:

### 1️⃣ **Add Your Anthropic API Key** (REQUIRED)
Edit `.env` file:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
```

Get your key at: https://console.anthropic.com/settings/keys

### 2️⃣ **Test Miyomi Locally**
```bash
# Test if she works
npm run test

# Generate a real pick
npm run run
```

### 3️⃣ **Create GitHub Repository**
```bash
# Option A: Using GitHub CLI (install with: brew install gh)
gh auth login
gh repo create miyomi-agent --public --source=. --push

# Option B: Manual
# 1. Go to https://github.com/new
# 2. Create repo "miyomi-agent"
# 3. Run:
git remote add origin https://github.com/YOUR-USERNAME/miyomi-agent.git
git push -u origin main
```

### 4️⃣ **Set Up Supabase** (5 minutes)
1. Go to https://supabase.com and create free account
2. Create new project (remember your password!)
3. Go to Settings → API
4. Copy:
   - Project URL → Add to `.env` as `SUPABASE_URL`
   - Service Role Key → Add to `.env` as `SUPABASE_SERVICE_KEY`
5. Go to SQL Editor and run the SQL from `SETUP.md`

### 5️⃣ **Deploy to Vercel** (5 minutes)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, then add env vars in dashboard:
# https://vercel.com/YOUR-USERNAME/miyomi-agent/settings/environment-variables
```

### 6️⃣ **Add Environment Variables in Vercel**
Go to your Vercel dashboard and add:
- `ANTHROPIC_API_KEY` - Your Claude API key
- `SUPABASE_URL` - From Supabase dashboard
- `SUPABASE_SERVICE_KEY` - From Supabase dashboard
- `CRON_SECRET` - Make up a random string

## 🎯 Quick Commands

```bash
# Test locally
npm run test

# Generate one pick
npm run run

# Run scheduler locally (posts at 12pm EST)
npm run schedule

# Deploy to production
./deploy.sh

# Check stats
npm run stats
```

## 📱 Social Media (Optional)

To post to Twitter/X:
1. Create Twitter Developer account
2. Get API v2 credentials
3. Add to `.env`:
```
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
```

## ✅ Success Checklist

- [ ] Added ANTHROPIC_API_KEY to .env
- [ ] Tested locally with `npm run test`
- [ ] Created GitHub repository
- [ ] Set up Supabase project
- [ ] Deployed to Vercel
- [ ] Added env vars in Vercel dashboard
- [ ] Cron jobs running (check Vercel logs)

## 🚨 Common Issues

**"No markets found"**
- This uses mock data by default, so it should work
- Real Polymarket API doesn't need auth for reading

**Vercel deployment fails**
- Make sure all env vars are set in dashboard
- Check build logs in Vercel dashboard

**Supabase connection fails**
- Double-check service key (not anon key!)
- Make sure tables are created

## 📊 Monitor Your Agent

- **Vercel Logs**: `vercel logs --follow`
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Actions**: Auto-deploys on push

## 🎭 Miyomi is Ready!

Once deployed, she'll:
- Post daily picks at 12pm EST
- Update performance at 6pm EST
- Generate weekly recaps on Sundays

Check her personality with:
```bash
npm run stats
```

She's ready to challenge market consensus! 💅