# 🎭 Miyomi API Setup Guide

## Current Status ✅
- **Farcaster**: ✅ Working with approved signer
- **Polymarket**: ✅ Getting real market data (12 active markets)
- **Public Stock Data**: ✅ Working via Alpha Vantage
- **Economic Markets**: ✅ Generated from real economic conditions

## Optional API Keys (Free)

### 1. Alpha Vantage (Stock Data)
- **What**: Real-time stock market data
- **Setup**: Go to https://www.alphavantage.co/support/#api-key
- **Add to .env**: `ALPHAVANTAGE_API_KEY=your_key_here`
- **Benefit**: Better stock market predictions

### 2. CoinMarketCap (Crypto Data)  
- **What**: Real-time crypto trending data
- **Setup**: Go to https://coinmarketcap.com/api/
- **Add to .env**: `COINMARKETCAP_API_KEY=your_key_here`
- **Benefit**: Real crypto market analysis instead of mock data

### 3. Kalshi (Prediction Markets)
- **What**: US-regulated prediction markets
- **Setup**: 
  1. Go to https://kalshi.com/api
  2. Create account → Settings → API Keys
  3. Generate API key pair
- **Add to .env**: 
  ```
  KALSHI_API_KEY=your_key_here
  KALSHI_API_SECRET=your_secret_here
  ```
- **Benefit**: Real prediction market data from regulated exchange

### 4. Eden.art (Visual Content)
- **What**: AI image/video generation
- **Setup**: Join Discord at https://discord.gg/eden and request API access
- **Add to .env**:
  ```
  EDEN_API_KEY=your_key_here
  EDEN_API_SECRET=your_secret_here
  ```
- **Benefit**: Auto-generated images for every Miyomi pick

## Quick Setup (2 minutes)

```bash
# Get Alpha Vantage key (no email required)
curl -s "https://www.alphavantage.co/support/#api-key"

# Add to .env file
echo "ALPHAVANTAGE_API_KEY=your_key_here" >> .env

# Test improved data
npm run run
```

## Authentication Methods

**All these APIs use simple API keys**, not OAuth passwords:
- ✅ **API Key**: Just paste the key
- ❌ **OAuth Password**: Not needed
- ❌ **Google OAuth**: Not required

**Current Working Without Extra Setup:**
- Real Polymarket data (public endpoints)
- Real stock market data (Alpha Vantage free tier)
- Generated economic predictions
- Full Farcaster posting

Miyomi is already working great with the current setup! 🎭