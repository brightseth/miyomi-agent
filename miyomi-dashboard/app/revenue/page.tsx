'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RevenueData {
  date: string;
  video: {
    title: string;
    market: string;
    position: string;
    views: number;
  };
  affiliate: {
    clicks: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    program: string;
  };
  liquidity: {
    volumeDriven: number;
    marketImpact: number;
  };
  total: number;
}

interface AffiliateProgram {
  name: string;
  status: 'active' | 'pending' | 'inactive';
  commission: string;
  totalEarnings: number;
  pendingPayout: number;
  nextPayout: string;
}

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [affiliatePrograms, setAffiliatePrograms] = useState<AffiliateProgram[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalClicks: 0,
    totalConversions: 0,
    avgConversionRate: 0,
    bestPerformer: '',
    projectedMonthly: 0
  });

  useEffect(() => {
    loadRevenueData();
    loadAffiliatePrograms();
  }, [timeRange]);

  const loadRevenueData = () => {
    // Mock data - would come from real tracking
    const mockData: RevenueData[] = [
      {
        date: '2024-12-24',
        video: {
          title: 'Bitcoin to $150k is FREE MONEY',
          market: 'Will Bitcoin reach $150,000?',
          position: 'YES @ 22¢',
          views: 15234
        },
        affiliate: {
          clicks: 456,
          conversions: 23,
          conversionRate: 5.04,
          revenue: 1265.50,
          program: 'Polymarket'
        },
        liquidity: {
          volumeDriven: 45000,
          marketImpact: 2.3
        },
        total: 1265.50
      },
      {
        date: '2024-12-23',
        video: {
          title: 'AI Jobs FUD is WRONG',
          market: 'Will AI replace 10% of jobs?',
          position: 'YES @ 35¢',
          views: 12456
        },
        affiliate: {
          clicks: 234,
          conversions: 15,
          conversionRate: 6.41,
          revenue: 890.25,
          program: 'Manifold'
        },
        liquidity: {
          volumeDriven: 23000,
          marketImpact: 1.8
        },
        total: 890.25
      },
      {
        date: '2024-12-22',
        video: {
          title: 'Recession Bears Getting REKT',
          market: 'US recession in 2025?',
          position: 'NO @ 65¢',
          views: 8923
        },
        affiliate: {
          clicks: 178,
          conversions: 8,
          conversionRate: 4.49,
          revenue: 445.60,
          program: 'Kalshi'
        },
        liquidity: {
          volumeDriven: 18000,
          marketImpact: 1.2
        },
        total: 445.60
      }
    ];

    // Calculate totals
    const totals = mockData.reduce((acc, day) => ({
      totalRevenue: acc.totalRevenue + day.total,
      totalClicks: acc.totalClicks + day.affiliate.clicks,
      totalConversions: acc.totalConversions + day.affiliate.conversions,
      avgConversionRate: 0,
      bestPerformer: day.total > acc.totalRevenue / mockData.length ? day.video.title : acc.bestPerformer,
      projectedMonthly: 0
    }), {
      totalRevenue: 0,
      totalClicks: 0,
      totalConversions: 0,
      avgConversionRate: 0,
      bestPerformer: '',
      projectedMonthly: 0
    });

    totals.avgConversionRate = (totals.totalConversions / totals.totalClicks) * 100;
    totals.projectedMonthly = (totals.totalRevenue / mockData.length) * 30;

    setRevenueData(mockData);
    setTotalStats(totals);
  };

  const loadAffiliatePrograms = () => {
    const programs: AffiliateProgram[] = [
      {
        name: 'Polymarket',
        status: 'active',
        commission: '2.5% of volume',
        totalEarnings: 12456.78,
        pendingPayout: 3456.50,
        nextPayout: '2025-01-01'
      },
      {
        name: 'Manifold Markets',
        status: 'active',
        commission: '3% of deposits',
        totalEarnings: 8234.56,
        pendingPayout: 2134.25,
        nextPayout: '2024-12-31'
      },
      {
        name: 'Kalshi',
        status: 'active',
        commission: '2% of trades',
        totalEarnings: 5678.90,
        pendingPayout: 1234.60,
        nextPayout: '2025-01-05'
      },
      {
        name: 'Clearing Corp (MIYOMI Markets)',
        status: 'pending',
        commission: '10% of fees',
        totalEarnings: 0,
        pendingPayout: 0,
        nextPayout: 'Q1 2025 Launch'
      }
    ];
    setAffiliatePrograms(programs);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Back</Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold">Revenue Analytics</h1>
              <p className="text-gray-400 mt-2">Track affiliate performance and liquidity impact</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400">
              ${totalStats.totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400 mt-1">Total Revenue</div>
            <div className="text-xs text-green-400 mt-2">
              ↑ 23% from last period
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">
              {totalStats.totalClicks}
            </div>
            <div className="text-sm text-gray-400 mt-1">Total Clicks</div>
            <div className="text-xs text-gray-500 mt-2">
              {totalStats.avgConversionRate.toFixed(2)}% conversion
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">
              {totalStats.totalConversions}
            </div>
            <div className="text-sm text-gray-400 mt-1">Conversions</div>
            <div className="text-xs text-gray-500 mt-2">
              ${(totalStats.totalRevenue / totalStats.totalConversions).toFixed(2)} avg
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">
              ${totalStats.projectedMonthly.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400 mt-1">Projected Monthly</div>
            <div className="text-xs text-yellow-400 mt-2">
              Based on current rate
            </div>
          </div>
        </div>

        {/* Affiliate Programs */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Affiliate Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {affiliatePrograms.map((program) => (
              <div key={program.name} className="p-4 bg-gray-800 rounded">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{program.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    program.status === 'active' ? 'bg-green-900 text-green-300' :
                    program.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {program.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Commission:</span>
                    <span>{program.commission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="text-green-400">${program.totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pending:</span>
                    <span className="text-yellow-400">${program.pendingPayout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Next payout:</span>
                    <span className="text-xs">{program.nextPayout}</span>
                  </div>
                </div>
                {program.name === 'Clearing Corp (MIYOMI Markets)' && (
                  <div className="mt-3 p-2 bg-purple-900/20 border border-purple-700 rounded text-xs text-purple-400">
                    🚀 Own market creation coming soon!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Performance */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Daily Video Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Video / Market</th>
                  <th className="pb-2 text-right">Views</th>
                  <th className="pb-2 text-right">Clicks</th>
                  <th className="pb-2 text-right">Conv.</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">Revenue</th>
                  <th className="pb-2 text-right">Liquidity</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((day) => (
                  <tr key={day.date} className="border-b border-gray-800 text-sm">
                    <td className="py-3">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="font-semibold">{day.video.title}</div>
                      <div className="text-xs text-gray-500">{day.video.position}</div>
                    </td>
                    <td className="py-3 text-right">{day.video.views.toLocaleString()}</td>
                    <td className="py-3 text-right">{day.affiliate.clicks}</td>
                    <td className="py-3 text-right">{day.affiliate.conversions}</td>
                    <td className="py-3 text-right">{day.affiliate.conversionRate.toFixed(1)}%</td>
                    <td className="py-3 text-right text-green-400 font-semibold">
                      ${day.affiliate.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-purple-400">
                      ${(day.liquidity.volumeDriven / 1000).toFixed(0)}k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Path to Own Markets */}
        <div className="mt-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-purple-300">
            🚀 MIYOMI Markets - Coming Q1 2025
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm">
              <div className="font-semibold text-purple-400 mb-2">Phase 1: Affiliate</div>
              <div className="text-gray-400">Drive liquidity to existing markets</div>
              <div className="text-xs text-green-400 mt-1">✅ Currently Active</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-purple-400 mb-2">Phase 2: Market Maker</div>
              <div className="text-gray-400">Provide liquidity, capture spreads</div>
              <div className="text-xs text-yellow-400 mt-1">🔄 Testing on Clearing Corp</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-purple-400 mb-2">Phase 3: Own Markets</div>
              <div className="text-gray-400">Create and control entire markets</div>
              <div className="text-xs text-purple-400 mt-1">🎯 10x revenue potential</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}