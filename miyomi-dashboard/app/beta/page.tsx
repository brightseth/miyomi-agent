'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BetaFeatures() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEngagement: 0,
    avgPnL: 0,
    activeMarkets: 0
  });

  useEffect(() => {
    // Fetch stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Beta Features</h1>
            <p className="text-gray-400 mt-2">Experimental tools and features in development</p>
          </div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-lg font-semibold hover:from-pink-500 hover:to-cyan-500 transition"
          >
            ← Back to Main
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-2xl font-bold text-pink-400">{stats.totalPosts || 127}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.totalEngagement || '12.3k'}</div>
            <div className="text-sm text-gray-500">Engagement</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-2xl font-bold text-green-400">+{stats.avgPnL || 340}¢</div>
            <div className="text-sm text-gray-500">Avg PnL</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.activeMarkets || 8}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
        </div>
        
        {/* Beta Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/daily-video" 
            className="border-2 border-red-600 bg-gradient-to-br from-red-900/30 to-pink-900/30 p-6 rounded-lg hover:from-red-900/40 hover:to-pink-900/40 transition relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-xs rounded animate-pulse">
              BETA
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-300">🎬 Daily Video</h2>
            <p className="text-gray-300">Today&apos;s killer pick. One video. Noon sharp.</p>
            <div className="mt-3 text-sm text-red-400 font-bold">→ Produce today&apos;s video</div>
          </Link>

          <Link 
            href="/content" 
            className="border border-pink-800 bg-gradient-to-br from-pink-900/20 to-purple-900/20 p-6 rounded-lg hover:from-pink-900/30 hover:to-purple-900/30 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-pink-300">📱 Content Studio</h2>
            <p className="text-gray-300">Generate posts, manage drafts, track performance</p>
            <div className="mt-3 text-sm text-pink-400">→ Create new content</div>
          </Link>

          <Link 
            href="/markets" 
            className="border border-blue-800 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6 rounded-lg hover:from-blue-900/30 hover:to-cyan-900/30 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-300">📊 Live Markets</h2>
            <p className="text-gray-300">Real-time contrarian opportunities</p>
            <div className="mt-3 text-sm text-blue-400">→ View opportunities</div>
          </Link>
          
          <Link 
            href="/recipes" 
            className="border border-purple-800 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-lg hover:from-purple-900/30 hover:to-pink-900/30 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-purple-300">🧬 Recipe Studio</h2>
            <p className="text-gray-300">Eden video templates, A/B testing, optimization</p>
            <div className="mt-3 text-sm text-purple-400">→ Manage recipes</div>
          </Link>

          <Link 
            href="/eden" 
            className="border border-indigo-800 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 p-6 rounded-lg hover:from-indigo-900/30 hover:to-blue-900/30 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-indigo-300">🎬 Eden Studio</h2>
            <p className="text-gray-300">Generate AI videos for picks</p>
            <div className="mt-3 text-sm text-indigo-400">→ Create video brief</div>
          </Link>

          <Link 
            href="/intelligence" 
            className="border border-yellow-800 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-6 rounded-lg hover:from-yellow-900/30 hover:to-orange-900/30 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-yellow-300">🧠 Market Intelligence</h2>
            <p className="text-gray-300">24/7 analysis, value scoring, AI recommendations</p>
            <div className="mt-3 text-sm text-yellow-400">→ View intelligence</div>
          </Link>

          <Link 
            href="/revenue" 
            className="border border-green-800 bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 rounded-lg hover:from-green-900/30 hover:to-emerald-900/30 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-300">💰 Revenue</h2>
            <p className="text-gray-300">Affiliate tracking, liquidity impact, earnings</p>
            <div className="mt-3 text-sm text-green-400">→ View revenue</div>
          </Link>

          <Link 
            href="/dashboard"
            className="border border-cyan-800 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 rounded-lg hover:from-cyan-900/30 hover:to-blue-900/30 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-cyan-300">📈 Old Dashboard</h2>
            <p className="text-gray-300">Previous dashboard interface</p>
            <div className="mt-3 text-sm text-cyan-400">→ View dashboard</div>
          </Link>

          <a 
            href="/schedule" 
            className="border border-gray-700 bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition opacity-50 pointer-events-none"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-500">⏰ Scheduler</h2>
            <p className="text-gray-500">Automate daily picks</p>
            <div className="mt-3 text-sm text-gray-600">Coming soon</div>
          </a>
          
          <Link 
            href="/api/markets" 
            className="border border-gray-700 bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-300">🔧 API</h2>
            <p className="text-gray-400">Test endpoints</p>
            <div className="mt-3 text-sm text-gray-500">→ View raw data</div>
          </Link>
        </div>

        {/* Live Activity Feed */}
        <div className="mt-8 border border-gray-800 bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-red-400 font-semibold">🎬 Daily Video LIVE: &quot;Bitcoin to $150k&quot;</span>
              <span>12:00 PM EST</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>🔥 12.3k views on yesterday&apos;s video</span>
              <span>1 hour ago</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>💰 Position up +3.5¢ on recession trade</span>
              <span>2 hours ago</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>📱 Posted morning take on Farcaster</span>
              <span>3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}