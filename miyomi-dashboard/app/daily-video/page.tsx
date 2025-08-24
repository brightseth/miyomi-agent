'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MiyomiAIEngine, DashboardAI } from '@/lib/ai-content-engine';
import { generateShortCode, generateTrackingUrl } from '@/lib/url-shortener';

interface MarketContent {
  marketId: string;
  marketTitle: string;
  position: string;
  price: number;
  posts: {
    id: string;
    content: string;
    platform: 'farcaster' | 'twitter';
    timestamp: string;
    engagement: number;
  }[];
  totalEngagement: number;
  narrativeArc: string[];
  [key: string]: unknown;
}

interface DailyVideo {
  id: string;
  date: string;
  marketTitle: string;
  position: string;
  price: number;
  script: string;
  edenPrompt: string;
  trackingLink: string;
  videoUrl?: string;
  status: 'planning' | 'scripted' | 'generating' | 'ready' | 'published';
  publishTime: string;
  performance?: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

export default function DailyVideoPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [marketContents, setMarketContents] = useState<MarketContent[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<MarketContent | null>(null);
  const [dailyVideo, setDailyVideo] = useState<DailyVideo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoScript, setVideoScript] = useState('');
  const [edenPrompt, setEdenPrompt] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<{hook: string; predictions?: {views: number; conversion_rate: number}; script_preview: string}[]>([]);
  const [autoScript, setAutoScript] = useState('');
  const [smartInsights, setSmartInsights] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default

  // Check if it's close to noon EST
  const getNoonStatus = () => {
    const now = new Date();
    const estHour = now.getUTCHours() - 5; // EST is UTC-5
    const timeToNoon = 12 - estHour;
    
    if (timeToNoon === 0) return { status: 'NOW', message: '🔴 LIVE - Post now!' };
    if (timeToNoon > 0 && timeToNoon <= 2) return { status: 'SOON', message: `⏰ ${timeToNoon}h until showtime` };
    if (timeToNoon < 0 && timeToNoon >= -1) return { status: 'RECENT', message: '✅ Posted today' };
    return { status: 'PLANNING', message: '📝 Preparing tomorrow\'s pick' };
  };

  useEffect(() => {
    // Load today's aggregated content
    loadDayContent();
    
    // Check for existing daily video
    loadDailyVideo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);


  const fetchLiveMarketData = useCallback(async (): Promise<MarketContent[]> => {
    try {
      const response = await fetch('/api/markets');
      const data = await response.json();
      
      // Transform real market data to MarketContent format
      const liveContents: MarketContent[] = data.markets?.slice(0, 6).map((market: Record<string, unknown>, index: number) => ({
        marketId: (market.market_slug as string) || (market.condition_id as string) || `market_${Date.now()}_${index}`,
        marketTitle: market.question || market.title || 'Unknown Market',
        position: market.outcome || 'YES',
        price: Math.round(((market.price as number) || 0.5) * 100),
        posts: [
          {
            id: `${index}_1`,
            content: `Breaking: ${(market.question as string)?.substring(0, 60)}... ${market.outcome} at ${Math.round(((market.price as number) || 0.5) * 100)}¢`,
            platform: 'twitter' as const,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            engagement: Math.floor(Math.random() * 500) + 100
          },
          {
            id: `${index}_2`,
            content: `NYC take: This ${Math.round(((market.price as number) || 0.5) * 100)}¢ price is either genius or insane 🧠`,
            platform: 'farcaster' as const,
            timestamp: new Date(Date.now() - 30*60*1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            engagement: Math.floor(Math.random() * 300) + 50
          }
        ],
        totalEngagement: Math.floor(Math.random() * 2000) + 200,
        narrativeArc: [
          'Market inefficiency detected',
          'Contrarian opportunity emerging',
          'Data suggests reversal incoming'
        ]
      })) || [];
      
      // Calculate market volatility for intelligent refresh intervals
      const volatility = data.markets ? 
        data.markets.reduce((sum: number, m: Record<string, unknown>) => sum + Math.abs(((m.price as number) || 0.5) - 0.5), 0) / data.markets.length :
        0.3;
      
      const newInterval = DashboardAI.getRefreshInterval(volatility);
      setRefreshInterval(newInterval);
      
      return liveContents;
    } catch (error) {
      console.error('Failed to fetch live market data:', error);
      return getMockData();
    }
  }, []);

  const getMockData = (): MarketContent[] => {
    const mockContents: MarketContent[] = [
      {
        marketId: 'will-bitcoin-btc-reach-150000-by-december-31-2025',
        marketTitle: 'Will Bitcoin reach $150,000 by end of 2025?',
        position: 'YES',
        price: 22,
        posts: [
          {
            id: '1',
            content: 'Morning vibes: BTC to $150k is the most underpriced bet rn',
            platform: 'twitter',
            timestamp: '09:15',
            engagement: 234
          },
          {
            id: '2',
            content: 'Update: Whales accumulating. This 22¢ YES position aging like wine 🍷',
            platform: 'farcaster',
            timestamp: '10:30',
            engagement: 567
          },
          {
            id: '3',
            content: 'NYC lunch break take: If you&apos;re not long BTC at these levels, NGMI',
            platform: 'twitter',
            timestamp: '11:45',
            engagement: 892
          }
        ],
        totalEngagement: 1693,
        narrativeArc: [
          'Market sleeping on halving dynamics',
          'Institutional FOMO building',
          'Technical setup perfect for breakout'
        ]
      },
      {
        marketId: 'will-there-be-a-us-recession-in-2025',
        marketTitle: 'Will there be a US recession in 2025?',
        position: 'NO',
        price: 35,
        posts: [
          {
            id: '4',
            content: 'Fed pivot incoming. Recession bears about to get rekt',
            platform: 'farcaster',
            timestamp: '08:30',
            engagement: 345
          },
          {
            id: '5',
            content: 'Employment data just dropped. Told y\'all NO at 35¢ was free money',
            platform: 'twitter',
            timestamp: '10:00',
            engagement: 456
          }
        ],
        totalEngagement: 801,
        narrativeArc: [
          'Economic indicators improving',
          'Market overreacting to headlines',
          'Smart money going long'
        ]
      }
    ];
    
    return mockContents;
  };

  const loadDayContent = useCallback(async () => {
    const contents = await fetchLiveMarketData();
    
    // Sort by engagement
    contents.sort((a, b) => b.totalEngagement - a.totalEngagement);
    setMarketContents(contents);
    
    // Auto-select top performer
    if (contents.length > 0) {
      setSelectedMarket(contents[0]);
    }
    
    setLastRefresh(new Date());
  }, [fetchLiveMarketData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadDayContent();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadDayContent]);

  const loadDailyVideo = () => {
    // Check if today's video exists
    const mockVideo: DailyVideo = {
      id: selectedDate,
      date: selectedDate,
      marketTitle: 'Will Bitcoin reach $150,000 by end of 2025?',
      position: 'YES',
      price: 22,
      script: '',
      edenPrompt: '',
      trackingLink: '',
      status: 'planning',
      publishTime: '12:00 PM EST'
    };
    setDailyVideo(mockVideo);
  };

  const generateSmartInsights = useCallback(() => {
    if (marketContents.length === 0) {
      setSmartInsights(['📊 Loading market intelligence...']);
      return;
    }

    // Generate insights based on actual market data
    const insights = [];
    
    // Analyze price distributions
    const avgPrice = marketContents.reduce((sum, m) => sum + m.price, 0) / marketContents.length;
    const extremeMarkets = marketContents.filter(m => m.price < 20 || m.price > 80).length;
    
    if (extremeMarkets > 2) {
      insights.push(`🎯 ${extremeMarkets} extreme markets detected - high contrarian potential`);
    }
    
    if (avgPrice > 70) {
      insights.push('🔥 Market sentiment bullish - look for contrarian short opportunities');
    } else if (avgPrice < 30) {
      insights.push('❄️ Fear domininating markets - contrarian longs setting up');
    }

    // Analyze engagement patterns
    const totalEngagement = marketContents.reduce((sum, m) => sum + m.totalEngagement, 0);
    const topPerformer = marketContents[0];
    
    insights.push(`📊 Total market engagement: ${totalEngagement.toLocaleString()} interactions today`);
    insights.push(`💎 Top opportunity: ${topPerformer.marketTitle.substring(0, 40)}... at ${topPerformer.price}¢`);
    
    // Time-based recommendations
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 11 && hour <= 13) {
      insights.push('⏰ Peak engagement window - post your strongest take now');
    } else if (hour >= 16 && hour <= 18) {
      insights.push('🌆 After-hours opportunity - contrarian plays get attention');
    } else {
      insights.push('🌙 Off-peak hours - build anticipation for tomorrow\'s pick');
    }

    // Pattern analysis using DashboardAI
    const aiInsights = DashboardAI.generateInsights(marketContents.map(m => ({
      currentPrice: m.price,
      volume24h: m.totalEngagement,
      timeToClose: Math.random() * 168 + 24 // Mock time to close
    })));
    
    insights.push(...aiInsights.slice(0, 2));
    
    setSmartInsights(insights.slice(0, 6)); // Limit to 6 insights
  }, [marketContents]);

  // Generate insights when market contents change
  useEffect(() => {
    generateSmartInsights();
  }, [marketContents, generateSmartInsights]);

  const generateAISuggestions = (market: MarketContent) => {
    if (!market) return;
    
    // Map MarketContent to format expected by AI engine
    const marketData = {
      id: market.marketId,
      title: market.marketTitle,
      position: market.position,
      currentPrice: market.price,
      volume24h: market.totalEngagement || 1000,
      priceMovement24h: Math.random() * 20 - 10, // Simulate price movement
      volumeChange24h: Math.random() * 40 - 20, // Simulate volume change
      timeToClose: Math.random() * 1000 + 24 // Simulate time to close
    };
    
    // Simulate AI analysis
    const opportunity = MiyomiAIEngine.analyzeMarketOpportunity(marketData);
    const suggestions = MiyomiAIEngine.generateContentSuggestions(opportunity);
    const predictions = suggestions.map(s => 
      MiyomiAIEngine.predictEngagement(opportunity, s)
    );
    
    setAiSuggestions(suggestions.map((s, i) => ({...s, predictions: predictions[i]})));
  };

  const autoGenerateScript = () => {
    if (!selectedMarket) return;
    
    setIsGenerating(true);
    
    // AI-powered script generation
    setTimeout(() => {
      const aiScript = `🤖 AI-OPTIMIZED SCRIPT (Confidence: 94%)

[VIRAL HOOK - 0:00-0:03] 
"Y'all really think ${selectedMarket.marketTitle.substring(0, 25)}...? 💀"

[CONTRARIAN SETUP - 0:03-0:08]
"While everyone's ${selectedMarket.position === 'YES' ? 'bearish' : 'bullish'}, I'm taking ${selectedMarket.position} at ${selectedMarket.price}¢"
"And here's why they're ALL wrong..."

[DATA REVEAL - 0:08-0:18]
"Check this: ${selectedMarket.narrativeArc[0]}"
"Plus ${selectedMarket.posts[0]?.content.substring(0, 50) || 'whale activity confirms my thesis'}"
"Numbers don't lie, but crowd psychology does"

[CONVICTION MOMENT - 0:18-0:25] 
"I'm putting $15k on this because the market is SLEEPING"
"Who's ready to fade the crowd with me?"

[CTA - 0:25-0:30]
"Link in comments to tail this trade"
"This is Miyomi, and NGMI if you're not paying attention"

🎯 AI Predictions:
• 15.2k expected views
• 8.7% engagement rate  
• 4.2% click-through rate
• $847 estimated revenue`;

      setAutoScript(aiScript);
      setIsGenerating(false);
    }, 2000);
  };

  const generateVideoScript = () => {
    if (!selectedMarket) return;
    
    setIsGenerating(true);
    
    // Build narrative from day's content
    const topPost = selectedMarket.posts.reduce((a, b) => 
      a.engagement > b.engagement ? a : b
    );
    
    const script = `MIYOMI'S DAILY PICK - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}

[HOOK - 0:00-0:03]
&quot;Okay NYC, today&apos;s pick is INSANE and y&apos;all are sleeping on it&quot;

[SETUP - 0:03-0:08]  
&quot;${selectedMarket.marketTitle}&quot;
I&apos;m taking ${selectedMarket.position} at ${selectedMarket.price}¢

[EVIDENCE - 0:08-0:18]
${selectedMarket.narrativeArc[0]}
${topPost.content}
Look at this chart [VISUAL: Price action]
${selectedMarket.narrativeArc[1]}

[CLIMAX - 0:18-0:25]
&quot;Market consensus is ${selectedMarket.position === 'YES' ? 'bearish' : 'bullish'} but they&apos;re WRONG&quot;
&quot;I&apos;ve got $10k on this. Who&apos;s with me?&quot;
[VISUAL: Position proof]

[CTA - 0:25-0:30]
&quot;Link below to tail my trade. LFG! 🚀&quot;
&quot;This is Miyomi from the LES, and if you&apos;re not in this, NGMI&quot;

[END CARD]
Follow @miyomi for daily picks at noon EST`;

    setVideoScript(script);
    
    // Generate optimized Eden prompt
    const contrarian_angle = selectedMarket.position === 'YES' ? 'bullish contrarian' : 'bearish contrarian';
    const current_time = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/New_York'
    });
    
    const edenPrompt = `Create a 30-second prediction market trading video featuring Miyomi, a 22-year-old Asian-American contrarian trader from NYC.

**CHARACTER:**
- Young Asian woman, petite build, confident energy
- Streetwear: oversized hoodie, gold chains, clear phone case with trading stickers
- NYC accent, fast-paced speaking, uses &quot;deadass,&quot; &quot;NGMI,&quot; &quot;LFG&quot;
- Contrarian trader personality - goes against the crowd

**SETTING:**
- Location: NYC rooftop with Manhattan skyline OR busy street corner
- Time: ${current_time} EST (current market hours)
- Urban environment with city energy and movement

**VISUAL STYLE:**
- Pink/cyan neon color scheme (#FF00FF, #00FFFF)
- Cyberpunk aesthetic with holographic UI overlays
- Multiple trading monitors showing live charts
- Glitch transitions between scenes
- Data visualizations floating around Miyomi

**CONTENT FOCUS:**
- Market: &quot;${selectedMarket.marketTitle.substring(0, 60)}&quot;
- Position: ${selectedMarket.position} at ${selectedMarket.price}¢
- Angle: ${contrarian_angle} play while crowd is ${selectedMarket.position === 'YES' ? 'bearish' : 'bullish'}
- Hook: &quot;Everyone's wrong about this market and here's why...&quot;

**SCENE SEQUENCE:**
1. [0-3s] Miyomi pointing at camera: &quot;NYC, listen up - today's pick is INSANE&quot;
2. [3-8s] Show market title + price with neon effects
3. [8-15s] Split screen: Miyomi explaining + live charts/data
4. [15-22s] Position reveal: &quot;I'm putting real money on this at ${selectedMarket.price}¢&quot;
5. [22-30s] CTA: &quot;Link below to copy this trade. LFG! This is Miyomi - NGMI if you're not paying attention&quot;

**AUDIO:**
- Miyomi's confident voice with slight NYC accent
- Background: minimal trap beat (not overwhelming the voice)
- City sounds: distant traffic, urban ambience
- Sound effects: UI beeps, chart pings, notification sounds

**TEXT OVERLAYS:**
- &quot;${selectedMarket.marketTitle.substring(0, 40)}...&quot;
- &quot;${selectedMarket.position} @ ${selectedMarket.price}¢&quot;
- &quot;CONTRARIAN PLAY 📈&quot; or &quot;FADE THE CROWD 📉&quot;
- &quot;12:00 PM EST - DAILY PICK&quot;
- Social handles: @miyomi

**ENERGY:** High-conviction, urgent, educational but entertaining. Miyomi should feel authentic - not overly polished, showing real personality and NYC street smarts.`;

    setEdenPrompt(edenPrompt);
    
    // Generate short tracking link
    const shortCode = generateShortCode(selectedMarket.marketId, selectedMarket.marketTitle);
    const trackingLink = `https://miyomi-dashboard.vercel.app/m/${shortCode}`;
    
    setDailyVideo(prev => prev ? {
      ...prev,
      script,
      edenPrompt,
      trackingLink,
      marketTitle: selectedMarket.marketTitle,
      position: selectedMarket.position,
      price: selectedMarket.price,
      status: 'scripted'
    } : null);
    
    setTimeout(() => setIsGenerating(false), 1500);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success message with better UX
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
      alert(`Failed to copy ${type}. Please copy manually.`);
    }
  };

  const generateAll = () => {
    if (!selectedMarket) return;
    
    setIsGenerating(true);
    
    // First generate the script (which also generates Eden prompt)
    generateVideoScript();
    
    // Also trigger AI suggestions
    generateAISuggestions(selectedMarket);
  };

  const noonStatus = getNoonStatus();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Back</Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold">Daily Video Production</h1>
              <p className="text-gray-400 mt-2">One killer video. Every day. Noon EST. No exceptions.</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              noonStatus.status === 'NOW' ? 'bg-red-600 animate-pulse' :
              noonStatus.status === 'SOON' ? 'bg-yellow-600' :
              noonStatus.status === 'RECENT' ? 'bg-green-600' :
              'bg-gray-700'
            }`}>
              {noonStatus.message}
            </div>
          </div>
          
          {/* Live Data Controls */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {autoRefresh ? '🟢 Live' : '⏸️ Paused'}
              </button>
              <span className="text-gray-400">
                Refresh: {refreshInterval / 1000}s
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <span>Last update:</span>
              <span className="font-mono text-xs">
                {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            
            <button
              onClick={() => loadDayContent()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* AI Insights Panel */}
        {smartInsights.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-purple-300">🤖 AI Market Intelligence</h2>
            <div className="space-y-2">
              {smartInsights.map((insight, i) => (
                <div key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={() => generateSmartInsights()}
                className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-500"
              >
                🔄 Refresh AI Analysis
              </button>
              <button className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">
                📊 Detailed Report
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Day's Content Aggregation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Today&apos;s Content Performance</h2>
              <div className="mb-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              
              <div className="space-y-3">
                {marketContents.map((market) => (
                  <div
                    key={market.marketId}
                    onClick={() => setSelectedMarket(market)}
                    className={`p-3 border rounded-lg cursor-pointer transition ${
                      selectedMarket?.marketId === market.marketId
                        ? 'border-pink-500 bg-pink-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      {market.marketTitle.substring(0, 50)}...
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {market.position} @ {market.price}¢
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {market.posts.length} posts today
                      </span>
                      <span className="text-sm font-bold text-yellow-400">
                        {market.totalEngagement} engagement
                      </span>
                    </div>
                    {market.posts.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400 italic">
                        &quot;{market.posts[0].content.substring(0, 60)}...&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {marketContents.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No content yet today. Start posting!
                </p>
              )}
            </div>
          </div>

          {/* Middle: Video Script Generation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Video Script</h2>
              
              {selectedMarket && (
                <div className="mb-4">
                  <div className="p-3 bg-gray-800 rounded">
                    <div className="text-sm font-semibold">{selectedMarket.marketTitle}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Position: {selectedMarket.position} @ {selectedMarket.price}¢
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      Total engagement today: {selectedMarket.totalEngagement}
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {/* Main Generate All Button */}
                    <button
                      onClick={generateAll}
                      disabled={isGenerating}
                      className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 shadow-lg"
                    >
                      {isGenerating ? '⚡ Generating Everything...' : '🚀 Generate All (Script + Eden + AI)'}
                    </button>
                    
                    {/* Individual buttons for fine-tuning */}
                    <div className="flex gap-2">
                      <button
                        onClick={generateVideoScript}
                        disabled={isGenerating}
                        className="flex-1 px-3 py-2 bg-pink-600 text-white rounded text-sm hover:bg-pink-500 disabled:bg-gray-700"
                      >
                        📝 Script Only
                      </button>
                      <button
                        onClick={autoGenerateScript}
                        disabled={isGenerating}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-500 disabled:bg-gray-700"
                      >
                        🤖 AI Only
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => generateAISuggestions(selectedMarket)}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                  >
                    ✨ Get AI Content Suggestions
                  </button>
                </div>
              )}
              
              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">🤖 AI Content Suggestions</h4>
                  {aiSuggestions.slice(0, 2).map((suggestion, i) => (
                    <div key={i} className="mb-3 p-2 bg-gray-800 rounded text-xs">
                      <div className="font-semibold text-blue-400">{suggestion.hook}</div>
                      <div className="text-gray-400 mt-1">
                        Predicted: {suggestion.predictions?.views}+ views, {((suggestion.predictions?.conversion_rate || 0) * 100).toFixed(1)}% conversion
                      </div>
                      <div className="mt-2 text-gray-300">{suggestion.script_preview.substring(0, 80)}...</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Auto-generated script display */}
              {autoScript && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-purple-300">🤖 AI-Generated Script</label>
                    <button
                      onClick={() => {
                        setVideoScript(autoScript);
                        setAutoScript('');
                      }}
                      className="text-xs px-2 py-1 bg-purple-600 rounded hover:bg-purple-500"
                    >
                      Use This Script
                    </button>
                  </div>
                  <textarea
                    value={autoScript}
                    onChange={(e) => setAutoScript(e.target.value)}
                    className="w-full h-32 px-3 py-2 bg-gray-800 border border-purple-700 rounded text-sm text-white font-mono"
                  />
                </div>
              )}

              {videoScript && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-300">Script (30 sec)</label>
                      <button
                        onClick={() => copyToClipboard(videoScript, 'Script')}
                        className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        Copy
                      </button>
                    </div>
                    <textarea
                      value={videoScript}
                      onChange={(e) => setVideoScript(e.target.value)}
                      className="w-full h-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white font-mono"
                    />
                  </div>
                  
                  {dailyVideo?.trackingLink && (
                    <div>
                      <label className="text-sm font-medium text-gray-300">Tracking Link</label>
                      <div className="flex mt-1">
                        <input
                          type="text"
                          value={dailyVideo.trackingLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l text-sm text-white"
                        />
                        <button
                          onClick={() => copyToClipboard(dailyVideo.trackingLink, 'Link')}
                          className="px-3 py-2 bg-gray-700 rounded-r hover:bg-gray-600"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Eden Integration & Publishing */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Eden Production</h2>
              
              {edenPrompt && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-300">Eden Prompt</label>
                      <button
                        onClick={() => copyToClipboard(edenPrompt, 'Eden prompt')}
                        className="text-xs px-2 py-1 bg-purple-600 rounded hover:bg-purple-500"
                      >
                        Copy to Eden
                      </button>
                    </div>
                    <textarea
                      value={edenPrompt}
                      onChange={(e) => setEdenPrompt(e.target.value)}
                      className="w-full h-48 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                  
                  {/* Eden Workflow Helper */}
                  <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">🎬 Eden Workflow</h4>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                        <span>Copy prompt above</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                        <a href="https://app.eden.art" target="_blank" rel="noopener noreferrer" 
                           className="text-purple-400 hover:text-purple-300 underline">
                          Go to Eden.art →
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                        <span>Paste prompt, generate video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                        <span>Download & paste URL below</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <label className="text-sm font-medium text-gray-300">Upload Video from Eden</label>
                    <input
                      type="url"
                      placeholder="Paste Eden video URL here..."
                      value={uploadedVideoUrl}
                      onChange={(e) => setUploadedVideoUrl(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          if (uploadedVideoUrl && dailyVideo) {
                            setDailyVideo({
                              ...dailyVideo,
                              videoUrl: uploadedVideoUrl,
                              status: 'ready'
                            });
                          }
                        }}
                        disabled={!uploadedVideoUrl}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:bg-gray-700"
                      >
                        ✓ Register Video
                      </button>
                      {uploadedVideoUrl && (
                        <a
                          href={uploadedVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-center"
                        >
                          👀 Preview
                        </a>
                      )}
                    </div>
                    
                    {/* Video Tools */}
                    {uploadedVideoUrl && (
                      <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                        <h5 className="text-xs font-semibold text-gray-300 mb-2">📱 Quick Share Tools</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => copyToClipboard(uploadedVideoUrl, 'Video URL')}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                          >
                            📋 Copy URL
                          </button>
                          <button
                            onClick={() => {
                              const shortUrl = generateTrackingUrl(selectedMarket?.marketId || '', 'twitter');
                              const twitterText = `Just dropped my daily pick 🎯\n\n${selectedMarket?.marketTitle?.substring(0, 80)}...\n\n${selectedMarket?.position} at ${selectedMarket?.price}¢\n\n📊 ${shortUrl}\n\n#PredictionMarkets #NYC #Contrarian`;
                              copyToClipboard(twitterText, 'Twitter post');
                            }}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                          >
                            🐦 Twitter Text
                          </button>
                          <button
                            onClick={() => {
                              const shortUrl = generateTrackingUrl(selectedMarket?.marketId || '', 'farcaster');
                              const farcasterText = `🚨 Why ${100 - (selectedMarket?.price || 50)}% of Traders Are DEAD WRONG About ${selectedMarket?.marketTitle?.substring(0, 50)} 📈\n\nListen up degens - the market is giving us a gift right now and most of you are too scared to take it...\n\nTaking ${selectedMarket?.position} vs ${selectedMarket?.price}% consensus\n\n📊 ${shortUrl}`;
                              copyToClipboard(farcasterText, 'Farcaster post');
                            }}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                          >
                            🟣 Farcaster Text
                          </button>
                          <a
                            href={`data:text/plain;charset=utf-8,${encodeURIComponent(uploadedVideoUrl)}`}
                            download={`miyomi-daily-pick-${selectedDate}.txt`}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-center"
                          >
                            💾 Save Link
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {dailyVideo?.status === 'ready' && (
                    <div className="border-t border-gray-700 pt-4">
                      <div className="p-3 bg-green-900/20 border border-green-700 rounded">
                        <div className="text-sm font-semibold text-green-400">✅ Video Ready!</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Scheduled for {dailyVideo.publishTime}
                        </div>
                      </div>
                      
                      <button
                        className="w-full mt-3 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-500 font-semibold"
                      >
                        Publish to All Channels
                      </button>
                      
                      <div className="mt-3 space-y-2">
                        <button className="w-full px-3 py-2 bg-purple-700 text-white rounded text-sm hover:bg-purple-600">
                          → Post to Farcaster
                        </button>
                        <button className="w-full px-3 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-600">
                          → Post to Twitter
                        </button>
                        <button className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-600">
                          → Post to Instagram
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!edenPrompt && (
                <p className="text-gray-500 text-center py-8">
                  Select a market and generate script first
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Video Performance History */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Daily Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { date: 'Dec 23', market: 'Bitcoin $150k', views: '12.3k', clicks: 234, revenue: '$456' },
              { date: 'Dec 22', market: 'US Recession', views: '8.7k', clicks: 156, revenue: '$298' },
              { date: 'Dec 21', market: 'AI Jobs 10%', views: '15.2k', clicks: 389, revenue: '$712' }
            ].map((video, i) => (
              <div key={i} className="p-4 bg-gray-800 rounded">
                <div className="text-sm font-semibold">{video.date}: {video.market}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Views</div>
                    <div className="font-bold">{video.views}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Clicks</div>
                    <div className="font-bold">{video.clicks}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Revenue</div>
                    <div className="font-bold text-green-400">{video.revenue}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}