'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MiyomiAIEngine, DashboardAI } from '@/lib/ai-content-engine';
import { generateShortCode, generateTrackingUrl } from '@/lib/url-shortener';
import { generateEdenPrompt, generateQuickEdenPrompt } from '@/lib/eden-template';

interface MarketData {
  marketId: string;
  marketTitle: string;
  position: string;
  price: number;
  volume?: number;
  momentum?: number;
}

export default function DashboardPage() {
  // Core state for daily workflow
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [videoScript, setVideoScript] = useState('');
  const [edenPrompt, setEdenPrompt] = useState('');
  const [trackingLink, setTrackingLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [useFullTemplate, setUseFullTemplate] = useState(true);
  
  // Time check for noon EST
  const getNoonStatus = () => {
    const now = new Date();
    const estHour = now.getUTCHours() - 5;
    const timeToNoon = 12 - estHour;
    
    if (timeToNoon === 0) return { status: 'NOW', message: '🔴 LIVE - Post now!' };
    if (timeToNoon > 0 && timeToNoon <= 2) return { status: 'SOON', message: `⏰ ${timeToNoon}h until noon` };
    if (timeToNoon < 0 && timeToNoon >= -1) return { status: 'RECENT', message: '✅ Posted today' };
    return { status: 'PLANNING', message: '📝 Preparing tomorrow' };
  };

  // Fetch market data
  const fetchMarkets = useCallback(async () => {
    try {
      const response = await fetch('/api/markets');
      const data = await response.json();
      
      const formattedMarkets = data.markets?.slice(0, 6).map((m: Record<string, unknown>) => ({
        marketId: (m.market_slug as string) || (m.condition_id as string) || `market_${Date.now()}`,
        marketTitle: (m.question as string) || (m.title as string) || 'Unknown Market',
        position: (m.outcome as string) || 'YES',
        price: Math.round(((m.price as number) || 0.5) * 100),
        volume: (m.volume_24hr as number) || 0,
        momentum: Math.random() * 0.8 + 0.2
      })) || getMockMarkets();
      
      setMarkets(formattedMarkets);
      if (!selectedMarket && formattedMarkets.length > 0) {
        setSelectedMarket(formattedMarkets[0]);
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      setMarkets(getMockMarkets());
    }
  }, [selectedMarket]);

  const getMockMarkets = (): MarketData[] => [
    {
      marketId: 'will-bitcoin-btc-reach-200000-by-december-31-2025',
      marketTitle: 'Will Bitcoin reach $200,000 by end of 2025?',
      position: 'YES',
      price: 9,
      volume: 125000,
      momentum: 0.92
    },
    {
      marketId: 'will-there-be-a-us-recession-in-2025',
      marketTitle: 'Will there be a US recession in 2025?',
      position: 'NO',
      price: 65,
      volume: 87000,
      momentum: 0.75
    }
  ];

  // Generate everything with one click
  const generateAll = () => {
    if (!selectedMarket) return;
    
    setIsGenerating(true);
    
    // Generate script
    const script = `MIYOMI'S DAILY PICK - ${new Date().toLocaleDateString()}

[HOOK - 0:00-0:03]
"NYC, today's pick is INSANE - ${100 - selectedMarket.price}% are WRONG about this"

[SETUP - 0:03-0:10]
"${selectedMarket.marketTitle}"
Taking ${selectedMarket.position} at ${selectedMarket.price}¢

[EVIDENCE - 0:10-0:20]
Market's giving us a gift - look at this price action
Consensus is trapped in groupthink
Data says the opposite of what everyone believes

[CTA - 0:20-0:30]
"Link below to tail this trade. This is Miyomi - if you're not in this, NGMI"`;
    
    setVideoScript(script);
    
    // Generate Eden prompt using the new template
    const contrarian_angle = selectedMarket.position === 'YES' 
      ? `${100 - selectedMarket.price}% think it won't happen - they're wrong`
      : `${selectedMarket.price}% think it will happen - they're delusional`;
    
    // Determine marketplace (could add logic to choose between Polymarket/Kalshi based on best odds)
    const marketplace = 'Polymarket' as 'Polymarket' | 'Kalshi'; // Could be determined dynamically
    const marketUrl = marketplace === 'Kalshi' ? 'kalshi.com' : 'polymarket.com';
    
    const edenConfig = {
      marketTitle: selectedMarket.marketTitle,
      position: selectedMarket.position,
      price: selectedMarket.price,
      contrarian_angle,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      marketplace,
      marketUrl
    };
    
    // Use full or quick template based on user preference
    const eden = useFullTemplate 
      ? generateEdenPrompt(edenConfig)
      : generateQuickEdenPrompt(edenConfig);
    
    setEdenPrompt(eden);
    
    // Generate tracking link
    const shortCode = generateShortCode(selectedMarket.marketId, selectedMarket.marketTitle);
    setTrackingLink(`https://miyomi-dashboard.vercel.app/m/${shortCode}`);
    
    setTimeout(() => setIsGenerating(false), 1500);
  };

  // Copy to clipboard with feedback
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const button = document.activeElement as HTMLButtonElement;
      const originalText = button?.textContent;
      if (button) {
        button.textContent = '✓ Copied!';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-600');
        }, 2000);
      }
    } catch (err) {
      alert(`Failed to copy ${label}`);
    }
  };

  // Auto-refresh markets
  useEffect(() => {
    fetchMarkets();
    const interval = autoRefresh ? setInterval(fetchMarkets, 30000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh, fetchMarkets]);

  const noonStatus = getNoonStatus();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">
              Miyomi Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Daily pick workflow • Noon EST • Every day</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/miyomi" 
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-lg font-semibold hover:from-pink-500 hover:to-cyan-500 transition"
            >
              View Profile →
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Noon Status Bar */}
        <div className={`mb-6 p-4 rounded-lg text-center font-bold text-lg ${
          noonStatus.status === 'NOW' ? 'bg-red-600 animate-pulse' :
          noonStatus.status === 'SOON' ? 'bg-yellow-600' :
          noonStatus.status === 'RECENT' ? 'bg-green-600' :
          'bg-gray-800'
        }`}>
          {noonStatus.message}
        </div>

        {/* MAIN DAILY WORKFLOW SECTION */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
            <span>🎯 Daily Video Production</span>
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded ${autoRefresh ? 'bg-green-600' : 'bg-gray-700'}`}
              >
                {autoRefresh ? '🟢 Live' : '⏸️ Paused'}
              </button>
              <span className="text-gray-400">Last: {lastRefresh.toLocaleTimeString()}</span>
            </div>
          </h2>

          {/* Market Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Market</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {markets.map((market) => (
                <button
                  key={market.marketId}
                  onClick={() => setSelectedMarket(market)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedMarket?.marketId === market.marketId
                      ? 'border-pink-500 bg-pink-950/30'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{market.marketTitle}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {market.position} @ {market.price}¢
                    </span>
                    {market.momentum && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        market.momentum > 0.7 ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-300'
                      }`}>
                        🔥 {(market.momentum * 100).toFixed(0)}% hot
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Everything Button */}
          <button
            onClick={generateAll}
            disabled={!selectedMarket || isGenerating}
            className="w-full py-4 mb-6 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-lg font-bold text-lg hover:from-pink-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 transition-all shadow-lg"
          >
            {isGenerating ? '⚡ Generating Everything...' : '🚀 Generate Script + Eden Prompt + Link'}
          </button>

          {/* Generated Content Grid */}
          {(videoScript || edenPrompt || trackingLink) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Script */}
              {videoScript && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">Video Script (30 sec)</label>
                    <button
                      onClick={() => copyToClipboard(videoScript, 'Script')}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <textarea
                    value={videoScript}
                    onChange={(e) => setVideoScript(e.target.value)}
                    className="w-full h-48 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono"
                  />
                </div>
              )}

              {/* Eden Prompt */}
              {edenPrompt && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-300">Eden Prompt</label>
                      <button
                        onClick={() => setUseFullTemplate(!useFullTemplate)}
                        className={`px-2 py-1 rounded text-xs ${
                          useFullTemplate ? 'bg-purple-700' : 'bg-gray-700'
                        }`}
                        title={useFullTemplate ? 'Using full 11-step template' : 'Using quick template'}
                      >
                        {useFullTemplate ? '📖 Full' : '⚡ Quick'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(edenPrompt, 'Eden prompt')}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs"
                      >
                        📋 Copy
                      </button>
                      <a
                        href="https://app.eden.art"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs"
                      >
                        🎨 Open Eden
                      </a>
                    </div>
                  </div>
                  <textarea
                    value={edenPrompt}
                    onChange={(e) => setEdenPrompt(e.target.value)}
                    className="w-full h-48 p-3 bg-gray-800 border border-purple-700 rounded-lg text-sm font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Video URL & Social Media */}
          {trackingLink && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-300">Video URL (paste after Eden)</label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    placeholder="Paste Eden video URL here..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded"
                  />
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
                    >
                      👀 Preview
                    </a>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Tracking Link</label>
                <div className="flex gap-2">
                  <input
                    value={trackingLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(trackingLink, 'Link')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Social Media Posts</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const text = `🚨 Why ${100 - (selectedMarket?.price || 50)}% of Traders Are DEAD WRONG About ${selectedMarket?.marketTitle?.substring(0, 50)} 📈

Taking ${selectedMarket?.position} vs ${selectedMarket?.price}% consensus

📊 ${trackingLink}`;
                      copyToClipboard(text, 'Farcaster post');
                    }}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm"
                  >
                    🟣 Farcaster Post
                  </button>
                  <button
                    onClick={() => {
                      const text = `Just dropped my daily pick 🎯

${selectedMarket?.marketTitle?.substring(0, 80)}...

${selectedMarket?.position} at ${selectedMarket?.price}¢

📊 ${trackingLink}

#PredictionMarkets #NYC #Contrarian`;
                      copyToClipboard(text, 'Twitter post');
                    }}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded text-sm"
                  >
                    🐦 Twitter Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECONDARY FEATURES - Below the fold */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-pink-400">$1.2M</div>
              <div className="text-xs text-gray-400 mt-1">Total Volume</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">87%</div>
              <div className="text-xs text-gray-400 mt-1">Win Rate</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">12.5K</div>
              <div className="text-xs text-gray-400 mt-1">Followers</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">365</div>
              <div className="text-xs text-gray-400 mt-1">Day Streak</div>
            </div>
          </div>

          {/* Market Intelligence */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">📊 Market Intelligence</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-gray-300">3 high-conviction contrarian opportunities detected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-300">Volume spike in crypto markets (+45% vs yesterday)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-300">Optimal engagement window: 11:45 AM EST</span>
              </div>
            </div>
          </div>

          {/* Revenue Tracking */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">💰 Revenue Tracking</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Today</div>
                <div className="text-xl font-bold text-green-400">$847</div>
              </div>
              <div>
                <div className="text-gray-400">This Week</div>
                <div className="text-xl font-bold text-green-400">$5,231</div>
              </div>
              <div>
                <div className="text-gray-400">This Month</div>
                <div className="text-xl font-bold text-green-400">$24,892</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}