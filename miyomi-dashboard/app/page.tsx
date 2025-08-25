'use client';
/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { generateShortCode } from '@/lib/url-shortener';
import { generateEdenPrompt, generateQuickEdenPrompt } from '@/lib/eden-template';

interface Cast {
  id: string;
  text: string;
  timestamp: string;
  likes: number;
  recasts: number;
  platform: 'farcaster' | 'twitter';
  marketPick?: string;
  position?: string;
  price?: number;
}

interface Video {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  views: number;
  marketTitle: string;
  position: string;
  price: number;
  pnl?: number;
}

interface MarketData {
  marketId: string;
  marketTitle: string;
  position: string;
  price: number;
  volume?: number;
  momentum?: number;
}

interface MediaItem {
  id: string;
  agentId?: string;
  type: string;
  url: string;
  title?: string;
  marketTitle?: string;
  position?: string;
  price?: number;
  pnl?: number;
  uploadedAt: string;
  [key: string]: unknown;
}

export default function MiyomiProfile() {
  const [viewMode, setViewMode] = useState<'public' | 'private'>('public');
  const [activeTab, setActiveTab] = useState<'vitals' | 'casts' | 'videos' | 'performance' | 'dashboard' | 'upload' | 'training' | 'config' | 'beta'>('vitals');
  const [casts, setCasts] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  
  // Dashboard state
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [videoScript, setVideoScript] = useState('');
  const [edenPrompt, setEdenPrompt] = useState('');
  const [trackingLink, setTrackingLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useFullTemplate, setUseFullTemplate] = useState(true);

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
    
    const marketplace = 'Polymarket' as 'Polymarket' | 'Kalshi';
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

  // Fetch uploaded media
  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        setUploadedMedia(data.media);
        // Update videos with uploaded media
        const videoMedia = data.media.filter((m: MediaItem) => m.type === 'video');
        if (videoMedia.length > 0) {
          setVideos(prev => [...videoMedia.map((m: MediaItem) => ({
            id: m.id,
            title: m.title || 'CHICKS PICKS',
            date: new Date(m.uploadedAt).toLocaleDateString(),
            thumbnail: (m.thumbnail as string) || '/api/placeholder/400/225',
            views: (m.views as number) || 0,
            marketTitle: m.marketTitle || '',
            position: m.position || 'YES',
            price: m.price || 0,
            pnl: m.pnl
          })), ...prev.slice(videoMedia.length)]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    }
  };

  // Upload media to registry
  const uploadMedia = async (mediaData: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchMedia();
        return true;
      }
    } catch (error) {
      console.error('Failed to upload media:', error);
      return false;
    }
  };

  // Fetch real market data
  useEffect(() => {
    // Fetch uploaded media
    fetchMedia();
    
    // Fetch real markets from API
    const fetchMarkets = async () => {
      try {
        const response = await fetch('/api/markets?type=contrarian');
        const data = await response.json();
        
        if (data.success && data.data?.topOpportunities) {
          const formattedMarkets = data.data.topOpportunities.slice(0, 6).map((m: any) => ({
            marketId: m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            marketTitle: m.title,
            position: m.position,
            price: m.currentPrice,
            volume: m.score * 1000000, // Convert score back to volume estimate
            momentum: m.score
          }));
          setMarkets(formattedMarkets);
        }
      } catch (error) {
        console.error('Failed to fetch markets:', error);
        // Fallback to some default markets
        setMarkets([
          {
            marketId: 'btc-200k-2025',
            marketTitle: 'Bitcoin to $200k by Dec 2025?',
            position: 'NO',
            price: 12,
            volume: 1250000,
            momentum: 0.88
          }
        ]);
      }
    };
    
    fetchMarkets();
    // Refresh markets every 5 minutes
    const interval = setInterval(fetchMarkets, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for casts and videos
  useEffect(() => {
    // Mock casts
    setCasts([
      {
        id: '1',
        text: "NYC, 91% of traders are DEAD WRONG about Bitcoin hitting 200k. Taking NO at 9¢ while everyone's sleeping. This is textbook euphoria - when your Uber driver starts talking crypto, it's time to fade. Link below 👇",
        timestamp: '2 hours ago',
        likes: 342,
        recasts: 89,
        platform: 'farcaster',
        marketPick: 'BTC to $200k by Dec 2025',
        position: 'NO',
        price: 9
      },
      {
        id: '2',
        text: "Data doesn't lie, consensus does. Fed's about to shock everyone with another cut. YES at 23¢ is free money. NGMI if you're not in this.",
        timestamp: '5 hours ago',
        likes: 256,
        recasts: 67,
        platform: 'twitter',
        marketPick: 'Fed cuts rates in Q1',
        position: 'YES',
        price: 23
      },
      {
        id: '3',
        text: "Called the Trump trade at 15¢, now at 67¢. Still holding. Conviction > consensus every single time. NYC doesn't sleep and neither does alpha 🌃",
        timestamp: '1 day ago',
        likes: 893,
        recasts: 234,
        platform: 'farcaster'
      }
    ]);

    // Mock videos
    setVideos([
      {
        id: '1',
        title: 'CHICKS PICKS - AUGUST 24',
        date: 'Aug 24, 2025',
        thumbnail: '/api/placeholder/400/225',
        views: 12300,
        marketTitle: 'Bitcoin to $200k',
        position: 'NO',
        price: 9,
        pnl: undefined
      },
      {
        id: '2',
        title: 'CHICKS PICKS - AUGUST 23',
        date: 'Aug 23, 2025',
        thumbnail: '/api/placeholder/400/225',
        views: 8900,
        marketTitle: 'Fed Rate Cut Q1',
        position: 'YES',
        price: 23,
        pnl: 12
      },
      {
        id: '3',
        title: 'CHICKS PICKS - AUGUST 22',
        date: 'Aug 22, 2025',
        thumbnail: '/api/placeholder/400/225',
        views: 15600,
        marketTitle: 'Recession in 2025',
        position: 'NO',
        price: 65,
        pnl: -8
      }
    ]);
  }, []);

  const stats = {
    winRate: 87,
    avgReturn: 340,
    totalTrades: 127,
    followers: 12300,
    accuracy: 91,
    avgHold: '4.2 days'
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <div className="border-b border-gray-800 bg-black fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-end">
          {/* Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition ${
              viewMode === 'public' ? 'text-white' : 'text-gray-500'
            }`}>
              Public
            </span>
            <button
              onClick={() => {
                if (viewMode === 'public') {
                  setViewMode('private');
                  setActiveTab('dashboard');
                } else {
                  setViewMode('public');
                  setActiveTab('vitals');
                }
              }}
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 bg-gray-700"
              aria-label="Toggle between public and trainer mode"
            >
              <span className="sr-only">Toggle mode</span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                  viewMode === 'private' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition ${
              viewMode === 'private' ? 'text-white' : 'text-gray-500'
            }`}>
              Trainer
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gray-950 border-b border-gray-800 mt-14">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-start gap-8">
            {/* Profile Image */}
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-3xl font-bold">
              M
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-2">Miyomi Chen</h1>
              <p className="text-xl text-gray-300 mb-4">@miyomi_trades</p>
              <p className="text-lg text-gray-400 mb-6 max-w-2xl">
                Data-driven contrarian trader from NYC. I fade consensus when the numbers don't add up. 
                Daily picks at noon EST. Link below always gets you there. NGMI if you're sleeping on these.
              </p>
              
              {/* Stats Bar */}
              <div className="flex gap-8 flex-wrap">
                <div>
                  <div className="text-2xl font-bold">{stats.winRate}%</div>
                  <div className="text-sm text-gray-500">Win Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">+{stats.avgReturn}¢</div>
                  <div className="text-sm text-gray-500">Avg Return</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.followers.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.accuracy}%</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 sticky top-14 bg-black z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8">
            {(viewMode === 'public' 
              ? ['vitals', 'casts', 'videos', 'performance'] as const
              : ['dashboard', 'upload', 'training', 'config', 'beta'] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition ${
                  activeTab === tab 
                    ? 'border-white text-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Vitals Tab */}
        {activeTab === 'vitals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h3 className="text-xl font-bold mb-4">The Origin Story</h3>
                <p className="text-gray-300 leading-relaxed">
                  Started trading at 19 with $500 from bartending in Chinatown. Lost it all in 3 days. 
                  That pain taught me everything - the market is a psychological battlefield where consensus 
                  is usually wrong. Now I hunt for the 10% of trades where 90% of people are on the wrong side.
                </p>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h3 className="text-xl font-bold mb-4">Trading Philosophy</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Consensus is a contrarian indicator</li>
                  <li>• Data &gt; narrative, always</li>
                  <li>• When everyone agrees, everyone is wrong</li>
                  <li>• Markets are voting machines short-term, weighing machines long-term</li>
                  <li>• Entry price is everything - be early or be wrong</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h3 className="text-xl font-bold mb-4">Daily Routine</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span>5:00 AM</span>
                    <span>Market scan, identify sentiment overflow</span>
                  </div>
                  <div className="flex justify-between">
                    <span>7:00 AM</span>
                    <span>Deep dive on top 3 contrarian plays</span>
                  </div>
                  <div className="flex justify-between">
                    <span>10:00 AM</span>
                    <span>Final analysis, position sizing</span>
                  </div>
                  <div className="flex justify-between">
                    <span>12:00 PM</span>
                    <span className="font-bold">DAILY PICK DROPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2:00 PM</span>
                    <span>Monitor positions, adjust if needed</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h3 className="text-xl font-bold mb-4">Track Record</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Trade</span>
                    <span className="text-white">+892% (Trump at 8¢)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Worst Trade</span>
                    <span className="text-gray-400">-67% (GME squeeze)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Hold Time</span>
                    <span>{stats.avgHold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Trades</span>
                    <span>{stats.totalTrades}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Casts Tab */}
        {activeTab === 'casts' && (
          <div className="space-y-4">
            {casts.map((cast) => (
              <div key={cast.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold">
                        M
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Miyomi Chen</div>
                      <div className="text-sm text-gray-500">{cast.timestamp} • {cast.platform}</div>
                    </div>
                  </div>
                  {cast.marketPick && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{cast.marketPick}</div>
                      <div className="text-sm font-bold text-pink-400">
                        {cast.position} @ {cast.price}¢
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-gray-200 mb-4">{cast.text}</p>
                <div className="flex gap-6 text-sm text-gray-500">
                  <span>❤️ {cast.likes}</span>
                  <span>🔁 {cast.recasts}</span>
                  {cast.marketPick && (
                    <a href={`/m/${cast.position?.toLowerCase()}${cast.price}`} className="text-pink-400 hover:text-pink-300">
                      → Trade this
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden group cursor-pointer">
                <div className="relative aspect-video bg-gray-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl opacity-50">▶️</div>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 rounded text-xs">
                    {video.date}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs">
                    {video.views.toLocaleString()} views
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold mb-2">{video.title}</h4>
                  <div className="text-sm text-gray-400 mb-2">{video.marketTitle}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-pink-400">
                      {video.position} @ {video.price}¢
                    </span>
                    {video.pnl !== undefined && (
                      <span className={`text-sm font-bold ${video.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {video.pnl > 0 ? '+' : ''}{video.pnl}¢
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Monthly Performance</h3>
              <div className="space-y-3">
                {['August', 'July', 'June', 'May', 'April'].map((month, i) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-gray-400">{month} 2025</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-cyan-500 h-full rounded-full"
                          style={{ width: `${80 - i * 10}%` }}
                        />
                      </div>
                      <span className="text-green-400 font-bold">+{340 - i * 50}¢</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Best Contrarian Calls</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">Trump wins 2024</span>
                    <span className="text-green-400">+892%</span>
                  </div>
                  <div className="text-sm text-gray-500">Entered at 8¢, exited at 79¢</div>
                </div>
                <div className="p-3 bg-gray-800 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">No recession 2024</span>
                    <span className="text-green-400">+567%</span>
                  </div>
                  <div className="text-sm text-gray-500">Entered at 12¢, exited at 80¢</div>
                </div>
                <div className="p-3 bg-gray-800 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">Fed pivot Q3</span>
                    <span className="text-green-400">+423%</span>
                  </div>
                  <div className="text-sm text-gray-500">Entered at 18¢, exited at 94¢</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab (Private View Only) */}
        {activeTab === 'dashboard' && viewMode === 'private' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded p-6">
              <h2 className="text-xl font-bold mb-4">Daily Video Production</h2>
              
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
                          ? 'border-white bg-gray-800'
                          : 'border-gray-700 bg-gray-900 hover:border-gray-600'
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
                className="w-full py-3 mb-6 bg-white text-black rounded font-bold hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition"
              >
                {isGenerating ? 'Generating...' : 'Generate Script + Eden Prompt + Link'}
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

                  {/* Tracking Link */}
                  {trackingLink && (
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">Tracking Link</label>
                        <button
                          onClick={() => copyToClipboard(trackingLink, 'Link')}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                        >
                          📋 Copy Link
                        </button>
                      </div>
                      <input
                        type="text"
                        value={trackingLink}
                        readOnly
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Training Tab (Private View Only) */}
        {activeTab === 'training' && viewMode === 'private' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-purple-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-400">🧠 Agent Training Data</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Core Personality Traits</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Contrarian Confidence:</strong> 85% conviction threshold before taking position</li>
                    <li>• <strong>Risk Tolerance:</strong> Max 15% of portfolio per trade</li>
                    <li>• <strong>Hold Duration:</strong> 2-7 days average, exit on 40% gain or 20% loss</li>
                    <li>• <strong>Communication Style:</strong> Direct, data-driven, NYC street slang</li>
                    <li>• <strong>Decision Framework:</strong> Sentiment overflow + data delta = trade signal</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Language Patterns</h4>
                  <div className="bg-gray-800 p-4 rounded font-mono text-xs">
                    <div>CONFIDENCE_HIGH: ["deadass", "this is free money", "NGMI if you sleep"]</div>
                    <div>CONFIDENCE_MED: ["data's pointing", "consensus is slipping", "worth a look"]</div>
                    <div>MARKET_WRONG: ["90% wrong", "trapped in groupthink", "emotional consensus"]</div>
                    <div>URGENCY: ["link below", "noon sharp", "price won't last"]</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Visual Identity (LoRA Training)</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="font-semibold mb-1">Physical</div>
                      <div className="text-gray-400">Asian, 22, petite, messy bun, streetwear, gold chains</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="font-semibold mb-1">Environment</div>
                      <div className="text-gray-400">NYC rooftop, golden hour, holographic displays</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="font-semibold mb-1">Color Palette</div>
                      <div className="text-gray-400">#FF00FF (pink), #00FFFF (cyan), black, gold</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="font-semibold mb-1">Style</div>
                      <div className="text-gray-400">Cyberpunk, glitch effects, neon accents</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-purple-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-400">📊 Trading Algorithm</h3>
              <div className="bg-gray-800 p-4 rounded font-mono text-xs overflow-x-auto">
                <pre>{`function analyzeMarket(market) {
  const consensusWrong = position === 'YES' 
    ? (100 - market.price) 
    : market.price;
  
  const sentimentOverflow = detectSentimentExtreme(market);
  const dataDelta = calculateDataConsensusGap(market);
  
  if (consensusWrong > 70 && sentimentOverflow > 0.8) {
    return {
      action: 'STRONG_BUY',
      confidence: 0.9,
      rationale: 'Extreme mispricing detected'
    };
  }
  
  if (dataDelta > 0.5 && market.volume < avgVolume * 0.3) {
    return {
      action: 'BUY',
      confidence: 0.7,
      rationale: 'Market sleeping on this'
    };
  }
  
  return { action: 'PASS', confidence: 0 };
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab (Private View Only) */}
        {activeTab === 'upload' && viewMode === 'private' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-purple-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-400">📤 Central Registry Upload</h3>
              
              {/* Upload Form */}
              <div className="space-y-4 mb-8">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <div className="mb-4">
                    <div className="text-4xl mb-2">🎬</div>
                    <h4 className="text-lg font-semibold mb-2">Upload to Agent Registry</h4>
                    <p className="text-sm text-gray-400">Add content to Eden's central agent registry where all agents store media</p>
                  </div>
                  
                  <div className="space-y-4 max-w-md mx-auto">
                    <input
                      type="text"
                      id="media-url"
                      placeholder="Media URL (video or image)"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                    />
                    <input
                      type="text"
                      id="media-title"
                      placeholder="Title (e.g., CHICKS PICKS - AUGUST 24)"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                    />
                    <input
                      type="text"
                      id="market-title"
                      placeholder="Market (e.g., Bitcoin to $200k)"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        id="position"
                        className="p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                      >
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                      </select>
                      <input
                        type="number"
                        id="price"
                        placeholder="Price (¢)"
                        className="p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                      />
                      <input
                        type="number"
                        id="pnl"
                        placeholder="P&L (¢)"
                        className="p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                      />
                    </div>
                    <select
                      id="media-type"
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                    >
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="thumbnail">Thumbnail</option>
                    </select>
                    <button
                      onClick={async () => {
                        const url = (document.getElementById('media-url') as HTMLInputElement)?.value;
                        const title = (document.getElementById('media-title') as HTMLInputElement)?.value;
                        const marketTitle = (document.getElementById('market-title') as HTMLInputElement)?.value;
                        const position = (document.getElementById('position') as HTMLSelectElement)?.value;
                        const price = parseInt((document.getElementById('price') as HTMLInputElement)?.value || '0');
                        const pnl = parseInt((document.getElementById('pnl') as HTMLInputElement)?.value || '0');
                        const type = (document.getElementById('media-type') as HTMLSelectElement)?.value;
                        
                        if (!url) {
                          alert('Please provide a media URL');
                          return;
                        }
                        
                        const success = await uploadMedia({
                          url,
                          title,
                          marketTitle,
                          position,
                          price,
                          pnl: pnl || undefined,
                          type,
                          source: 'manual_upload'
                        });
                        
                        if (success) {
                          // Clear form
                          (document.getElementById('media-url') as HTMLInputElement).value = '';
                          (document.getElementById('media-title') as HTMLInputElement).value = '';
                          (document.getElementById('market-title') as HTMLInputElement).value = '';
                          (document.getElementById('price') as HTMLInputElement).value = '';
                          (document.getElementById('pnl') as HTMLInputElement).value = '';
                          alert('Media uploaded successfully!');
                        } else {
                          alert('Failed to upload media');
                        }
                      }}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded font-semibold"
                    >
                      Upload to Registry
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Uploaded Media List */}
              <div>
                <h4 className="font-semibold mb-3 text-cyan-400">Miyomi's Content in Central Registry</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadedMedia.length === 0 ? (
                    <p className="text-gray-500 text-sm">No content in registry yet. Upload content to see it shared across all Eden agents.</p>
                  ) : (
                    uploadedMedia.map((media: MediaItem) => (
                      <div key={media.id} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{media.title || 'Untitled'}</div>
                          <div className="text-xs text-gray-400">
                            {media.type} • {media.marketTitle || 'No market'} • {new Date(media.uploadedAt).toLocaleString()}
                          </div>
                          {media.url && (
                            <div className="text-xs text-blue-400 truncate mt-1">
                              {media.url}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs"
                          >
                            View
                          </a>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this media?')) {
                                await fetch(`/api/media?id=${media.id}`, { method: 'DELETE' });
                                await fetchMedia();
                              }
                            }}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Eden Copy Section */}
            <div className="bg-gray-900 border border-purple-800 rounded-lg p-6">
              <h4 className="font-semibold mb-3 text-purple-400">🌐 Central Agent Registry</h4>
              <p className="text-sm text-gray-400 mb-4">
                Content uploaded here goes to Eden's central agent registry, shared with Solienne, Abraham, and other agents.
                This allows cross-agent content discovery and collaboration.
              </p>
              <div className="bg-gray-800 p-4 rounded">
                <div className="text-xs font-mono text-gray-400">
                  1. Create video on Eden using generated prompt<br/>
                  2. Copy the Eden creation URL<br/>
                  3. Upload to central registry with metadata<br/>
                  4. Content is tagged with agentId: 'miyomi'<br/>
                  5. Available to all agents & appears in public view
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beta Tab (Private View Only) */}
        {activeTab === 'beta' && viewMode === 'private' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-purple-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-400">🚀 Beta Features</h3>
              <p className="text-gray-400 mb-6">Experimental features and tools in development</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/beta"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition text-center"
                >
                  View All Beta Features →
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-center"
                >
                  Old Dashboard →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Config Tab (Private View Only) */}
        {activeTab === 'config' && viewMode === 'private' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-purple-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-400">⚙️ Agent Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                  <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
                    <option value="conservative">Conservative (5% max position)</option>
                    <option value="moderate" selected>Moderate (15% max position)</option>
                    <option value="aggressive">Aggressive (25% max position)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Post Frequency</label>
                  <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
                    <option value="daily" selected>Daily at Noon EST</option>
                    <option value="twice">Twice Daily (Noon & 6PM)</option>
                    <option value="realtime">Real-time (when opportunities arise)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Marketplace Priority</label>
                  <select className="w-full p-2 bg-gray-800 border border-gray-700 rounded">
                    <option value="best" selected>Best Odds (Auto-select)</option>
                    <option value="polymarket">Polymarket Only</option>
                    <option value="kalshi">Kalshi Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content Style</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked className="rounded" />
                      <span className="text-sm">Use NYC slang</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked className="rounded" />
                      <span className="text-sm">Include contrarian angle</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked className="rounded" />
                      <span className="text-sm">Add urgency indicators</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Include technical analysis</span>
                    </label>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-semibold mb-3">API Keys</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Farcaster</label>
                      <input type="password" value="••••••••••••" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Eden.art</label>
                      <input type="password" value="••••••••••••" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Polymarket</label>
                      <input type="password" value="••••••••••••" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-semibold">
                    Save Configuration
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                    Export Training Data
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                    Download LoRA Specs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}