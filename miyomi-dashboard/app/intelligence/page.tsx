'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MarketIntelligence {
  marketId: string;
  title: string;
  position: string;
  currentPrice: number;
  priceMovement24h: number;
  volume24h: number;
  engagement: {
    posts: number;
    totalReach: number;
    avgEngagement: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
  };
  valueScore: number; // 0-100 based on contrarian opportunity
  trendingScore: number; // 0-100 based on social momentum
  contentPotential: 'high' | 'medium' | 'low';
  affiliateData?: {
    program: string;
    commission: string;
    trackingLink: string;
    estimatedRevenue: number;
  };
}

interface WorkflowMode {
  mode: 'manual' | 'assisted' | 'autonomous';
  trainerInvolved: boolean;
  automationLevel: number; // 0-100
}

export default function IntelligencePage() {
  const [markets, setMarkets] = useState<MarketIntelligence[]>([]);
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h' | '48h'>('24h');
  const [sortBy, setSortBy] = useState<'value' | 'trending' | 'engagement' | 'revenue'>('value');
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>({
    mode: 'assisted',
    trainerInvolved: true,
    automationLevel: 50
  });
  const [selectedMarkets, setSelectedMarkets] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMarketIntelligence();
    const interval = setInterval(loadMarketIntelligence, 60000); // Refresh every minute
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadMarketIntelligence = () => {
    // Mock data - would aggregate from real sources
    const mockMarkets: MarketIntelligence[] = [
      {
        marketId: 'btc-150k',
        title: 'Will Bitcoin reach $150,000 by end of 2025?',
        position: 'YES',
        currentPrice: 22,
        priceMovement24h: -3.5,
        volume24h: 125000,
        engagement: {
          posts: 12,
          totalReach: 45600,
          avgEngagement: 567,
          sentiment: 'bearish'
        },
        valueScore: 95, // Extreme contrarian opportunity
        trendingScore: 78,
        contentPotential: 'high',
        affiliateData: {
          program: 'Polymarket',
          commission: '2.5%',
          trackingLink: 'https://polymarket.com/market/btc-150k?ref=miyomi',
          estimatedRevenue: 3125
        }
      },
      {
        marketId: 'ai-jobs',
        title: 'Will AI replace 10% of jobs by 2026?',
        position: 'YES',
        currentPrice: 35,
        priceMovement24h: 2.1,
        volume24h: 67000,
        engagement: {
          posts: 8,
          totalReach: 23400,
          avgEngagement: 234,
          sentiment: 'neutral'
        },
        valueScore: 72,
        trendingScore: 85, // High social momentum
        contentPotential: 'high',
        affiliateData: {
          program: 'Manifold',
          commission: '3%',
          trackingLink: 'https://manifold.markets/ai-jobs?ref=miyomi',
          estimatedRevenue: 2010
        }
      },
      {
        marketId: 'recession-2025',
        title: 'Will there be a US recession in 2025?',
        position: 'NO',
        currentPrice: 65,
        priceMovement24h: -1.2,
        volume24h: 89000,
        engagement: {
          posts: 5,
          totalReach: 12300,
          avgEngagement: 156,
          sentiment: 'bullish'
        },
        valueScore: 65,
        trendingScore: 45,
        contentPotential: 'medium',
        affiliateData: {
          program: 'Kalshi',
          commission: '2%',
          trackingLink: 'https://kalshi.com/markets/recession?ref=miyomi',
          estimatedRevenue: 1780
        }
      },
      {
        marketId: 'spacex-mars',
        title: 'Will SpaceX land on Mars before 2030?',
        position: 'NO',
        currentPrice: 72,
        priceMovement24h: 4.3,
        volume24h: 234000,
        engagement: {
          posts: 15,
          totalReach: 67800,
          avgEngagement: 892,
          sentiment: 'bullish'
        },
        valueScore: 88,
        trendingScore: 92, // Viral potential
        contentPotential: 'high'
      }
    ];

    // Sort based on selected criteria
    mockMarkets.sort((a, b) => {
      switch (sortBy) {
        case 'value': return b.valueScore - a.valueScore;
        case 'trending': return b.trendingScore - a.trendingScore;
        case 'engagement': return b.engagement.totalReach - a.engagement.totalReach;
        case 'revenue': return (b.affiliateData?.estimatedRevenue || 0) - (a.affiliateData?.estimatedRevenue || 0);
        default: return 0;
      }
    });

    setMarkets(mockMarkets);
  };

  const toggleMarketSelection = (marketId: string) => {
    const newSelection = new Set(selectedMarkets);
    if (newSelection.has(marketId)) {
      newSelection.delete(marketId);
    } else {
      newSelection.add(marketId);
    }
    setSelectedMarkets(newSelection);
  };

  const getWorkflowStatusColor = () => {
    switch (workflowMode.mode) {
      case 'manual': return 'bg-yellow-600';
      case 'assisted': return 'bg-blue-600';
      case 'autonomous': return 'bg-green-600';
    }
  };

  const calculateCompositeScore = (market: MarketIntelligence) => {
    return Math.round(
      market.valueScore * 0.4 + 
      market.trendingScore * 0.3 + 
      (market.engagement.avgEngagement / 10) * 0.3
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Back</Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold">Market Intelligence</h1>
              <p className="text-gray-400 mt-2">24/7 market analysis for optimal content timing</p>
            </div>
            
            {/* Workflow Mode Indicator */}
            <div className={`px-4 py-2 rounded-lg ${getWorkflowStatusColor()}`}>
              <div className="text-sm font-semibold">
                {workflowMode.mode.toUpperCase()} MODE
              </div>
              <div className="text-xs opacity-90">
                {workflowMode.automationLevel}% automated
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '6h' | '12h' | '24h' | '48h')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option value="6h">Last 6 hours</option>
                <option value="12h">Last 12 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="48h">Last 48 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'value' | 'trending' | 'engagement' | 'revenue')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option value="value">Value Score</option>
                <option value="trending">Trending Score</option>
                <option value="engagement">Engagement</option>
                <option value="revenue">Est. Revenue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Workflow Mode</label>
              <select
                value={workflowMode.mode}
                onChange={(e) => setWorkflowMode({
                  mode: e.target.value as 'manual' | 'assisted' | 'autonomous',
                  trainerInvolved: e.target.value !== 'autonomous',
                  automationLevel: e.target.value === 'manual' ? 20 : e.target.value === 'assisted' ? 50 : 80
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option value="manual">Manual (Trainer-led)</option>
                <option value="assisted">Assisted (AI suggestions)</option>
                <option value="autonomous">Autonomous (Full auto)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                className="w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-500 font-semibold"
                disabled={selectedMarkets.size === 0}
              >
                Generate Video ({selectedMarkets.size} selected)
              </button>
            </div>
          </div>
        </div>

        {/* Market Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {markets.map((market) => {
            const compositeScore = calculateCompositeScore(market);
            const isSelected = selectedMarkets.has(market.marketId);
            
            return (
              <div
                key={market.marketId}
                className={`bg-gray-900 border rounded-lg p-4 cursor-pointer transition ${
                  isSelected ? 'border-pink-500 bg-pink-900/10' : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => toggleMarketSelection(market.marketId)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{market.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-gray-400">
                        {market.position} @ {market.currentPrice}¢
                      </span>
                      <span className={`${market.priceMovement24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {market.priceMovement24h > 0 ? '+' : ''}{market.priceMovement24h}¢
                      </span>
                      <span className="text-gray-500">
                        Vol: ${(market.volume24h / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{compositeScore}</div>
                    <div className="text-xs text-gray-500">composite</div>
                  </div>
                </div>

                {/* Score Bars */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Value</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${market.valueScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8">{market.valueScore}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Trending</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${market.trendingScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8">{market.trendingScore}</span>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="grid grid-cols-4 gap-2 text-center py-2 border-t border-gray-800">
                  <div>
                    <div className="text-xs text-gray-500">Posts</div>
                    <div className="text-sm font-bold">{market.engagement.posts}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Reach</div>
                    <div className="text-sm font-bold">{(market.engagement.totalReach / 1000).toFixed(1)}k</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Sentiment</div>
                    <div className={`text-sm font-bold ${
                      market.engagement.sentiment === 'bullish' ? 'text-green-400' :
                      market.engagement.sentiment === 'bearish' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {market.engagement.sentiment}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Potential</div>
                    <div className={`text-sm font-bold ${
                      market.contentPotential === 'high' ? 'text-yellow-400' :
                      market.contentPotential === 'medium' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {market.contentPotential}
                    </div>
                  </div>
                </div>

                {/* Affiliate Revenue */}
                {market.affiliateData && (
                  <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        {market.affiliateData.program} ({market.affiliateData.commission})
                      </span>
                      <span className="text-green-400 font-bold">
                        Est. ${market.affiliateData.estimatedRevenue}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Indicators */}
                {workflowMode.mode === 'assisted' && compositeScore > 80 && (
                  <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700 rounded text-xs text-yellow-400">
                    🤖 AI recommends this for today&apos;s video
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
              <div className="text-sm font-semibold mb-1">📊 Export Intelligence Report</div>
              <div className="text-xs text-gray-400">Download CSV with all metrics</div>
            </button>
            <button className="p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
              <div className="text-sm font-semibold mb-1">🎯 Set Alert Thresholds</div>
              <div className="text-xs text-gray-400">Notify when markets hit targets</div>
            </button>
            <button className="p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
              <div className="text-sm font-semibold mb-1">🔄 Sync with Eden API</div>
              <div className="text-xs text-gray-400">Connect for auto video generation</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}