'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Market {
  title: string;
  source: string;
  position: string;
  currentPrice: number;
  score: number;
  delta24h: number;
  timeToClose: number;
  reasoning: string[];
  url: string;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMarkets();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      console.log('Fetching markets...');
      const response = await fetch('/api/markets');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Market data:', data);
      
      if (data.success) {
        const opportunities = data.data.topOpportunities || [];
        console.log('Found opportunities:', opportunities.length);
        setMarkets(opportunities);
      } else {
        setError(data.error || 'Failed to fetch markets');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Back</Link>
          <h1 className="text-2xl font-bold mt-4">Live Markets</h1>
        </div>

        {loading && <p className="text-gray-400">Loading markets...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="space-y-4">
            {markets.length === 0 ? (
              <p className="text-gray-400">No markets available</p>
            ) : (
              markets.map((market, i) => (
                <div key={i} className="border border-gray-700 bg-gray-900 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{market.title}</h3>
                      <p className="text-sm text-gray-400">
                        {market.source} • {market.position} @ {market.currentPrice}¢
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">Score: {(market.score * 100).toFixed(0)}%</div>
                      <div className="text-sm">
                        <span className={market.delta24h > 0 ? 'text-green-400' : 'text-red-400'}>
                          {market.delta24h > 0 ? '+' : ''}{market.delta24h?.toFixed(1)}¢
                        </span>
                        <span className="text-gray-500 ml-1">(24h)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    {market.reasoning?.slice(0, 2).join(' • ')}
                  </div>
                  <div className="mt-2">
                    <a 
                      href={market.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View Market →
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        <button 
          onClick={fetchMarkets}
          className="mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
        >
          Refresh Markets
        </button>
      </div>
    </div>
  );
}