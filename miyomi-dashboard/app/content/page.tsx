'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  content: string;
  market: {
    title: string;
    position: string;
    price: number;
  };
  platform: 'farcaster' | 'twitter';
  timestamp: string;
  engagement: {
    likes: number;
    replies: number;
    recasts: number;
  };
  performance?: {
    marketMove: number;
    pnl: number;
  };
  status: 'draft' | 'published' | 'scheduled';
}

export default function ContentPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<{
    title: string;
    position: string;
    currentPrice: number;
    score: number;
    reasoning?: string[];
  } | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [markets, setMarkets] = useState<{
    title: string;
    position: string;
    currentPrice: number;
    score: number;
    reasoning?: string[];
  }[]>([]);
  const [newContent, setNewContent] = useState('');
  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'generate'>('published');

  useEffect(() => {
    // Fetch markets for generation
    fetch('/api/markets')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMarkets(data.data.topOpportunities || []);
        }
      });
    
    // Load existing posts
    loadPosts();
  }, []);

  const loadPosts = () => {
    // Mock posts for now - will connect to real data
    const mockPosts: Post[] = [
      {
        id: '1',
        content: "Everyone sleeping on Bitcoin under $100k 😴\n\nWhile y'all panic about \"crashes\", I'm loading up at 22¢ YES for $150k by EOY 2025.\n\nMarket's giving us a gift rn. Historical halving patterns don't lie.\n\nNGMI if you're not taking this trade 💅",
        market: {
          title: "Will Bitcoin reach $150,000 by end of 2025?",
          position: "YES",
          price: 22
        },
        platform: 'farcaster',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        engagement: {
          likes: 127,
          replies: 23,
          recasts: 45
        },
        performance: {
          marketMove: 3.5,
          pnl: 350
        },
        status: 'published'
      },
      {
        id: '2', 
        content: "LOL everyone thinks we're getting a recession 🙄\n\nTaking NO at 35¢ because:\n- Fed's done hiking\n- Employment still strong\n- Consumer spending up\n\nCrowd's always wrong at extremes. This is free money.",
        market: {
          title: "Will there be a US recession in 2025?",
          position: "NO",
          price: 35
        },
        platform: 'twitter',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        engagement: {
          likes: 89,
          replies: 31,
          recasts: 12
        },
        performance: {
          marketMove: -2.1,
          pnl: -210
        },
        status: 'published'
      }
    ];
    setPosts(mockPosts);
  };

  const generateContent = async () => {
    if (!selectedMarket) return;
    
    setGeneratingContent(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market: selectedMarket })
      });
      
      const data = await response.json();
      setNewContent(data.content);
      
      // Add to drafts
      const newPost: Post = {
        id: Date.now().toString(),
        content: data.content,
        market: {
          title: selectedMarket.title,
          position: selectedMarket.position,
          price: selectedMarket.currentPrice
        },
        platform: 'farcaster',
        timestamp: new Date().toISOString(),
        engagement: { likes: 0, replies: 0, recasts: 0 },
        status: 'draft'
      };
      
      setPosts([newPost, ...posts]);
      setActiveTab('drafts');
    } catch (error) {
      console.error('Generation error:', error);
      // Fallback content
      const position = selectedMarket.position;
      const price = selectedMarket.currentPrice;
      const title = selectedMarket.title;
      
      const templates = [
        `Everyone's ${position === 'YES' ? 'bearish' : 'bullish'} on "${title}" at ${price}¢\n\nI'm taking ${position} because the market's wrong again.\n\n${selectedMarket.reasoning?.[0] || 'Contrarian play of the day'} 📈`,
        `NYC knows what's up 🗽\n\n"${title}"\n${position} @ ${price}¢\n\n${selectedMarket.reasoning?.[0] || 'Market sleeping on this one'}\n\nWho's with me? 👀`,
        `Today's pick: ${position} on "${title}"\n\nCurrent: ${price}¢\nTarget: ${position === 'YES' ? '75' : '25'}¢\n\n${selectedMarket.reasoning?.[0] || 'Data says crowd is wrong'}\n\nLFG 🚀`
      ];
      
      setNewContent(templates[Math.floor(Math.random() * templates.length)]);
    } finally {
      setGeneratingContent(false);
    }
  };

  const publishPost = async (post: Post) => {
    // Here we would actually post to Farcaster/Twitter
    const updatedPosts = posts.map(p => 
      p.id === post.id ? { ...p, status: 'published' as const } : p
    );
    setPosts(updatedPosts);
  };

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'published') return p.status === 'published';
    if (activeTab === 'drafts') return p.status === 'draft';
    return false;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Back</Link>
          <h1 className="text-2xl font-bold mt-4">Content Studio</h1>
          <p className="text-gray-400 mt-2">Generate and manage Miyomi&apos;s contrarian takes</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('published')}
            className={`pb-3 px-1 ${activeTab === 'published' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Published ({posts.filter(p => p.status === 'published').length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`pb-3 px-1 ${activeTab === 'drafts' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Drafts ({posts.filter(p => p.status === 'draft').length})
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 px-1 ${activeTab === 'generate' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Generate New
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Generate Content</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Select Market</label>
                <select 
                  className="w-full border border-gray-700 bg-gray-800 text-white rounded px-3 py-2"
                  onChange={(e) => {
                    const market = markets[parseInt(e.target.value)];
                    setSelectedMarket(market);
                  }}
                >
                  <option value="">Choose a market...</option>
                  {markets.map((m, i) => (
                    <option key={i} value={i}>
                      {m.title.substring(0, 60)}... ({m.position} @ {m.currentPrice}¢)
                    </option>
                  ))}
                </select>
              </div>

              {selectedMarket && (
                <div className="mb-4 p-3 bg-gray-800 rounded">
                  <div className="text-sm">
                    <div className="font-semibold">{selectedMarket.title}</div>
                    <div className="text-gray-400 mt-1">
                      Position: {selectedMarket.position} @ {selectedMarket.currentPrice}¢
                    </div>
                    <div className="text-gray-500 mt-1">
                      {selectedMarket.reasoning?.join(' • ')}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={generateContent}
                disabled={!selectedMarket || generatingContent}
                className="w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-500 disabled:bg-gray-700 disabled:text-gray-500 transition"
              >
                {generatingContent ? 'Generating...' : 'Generate Miyomi Take'}
              </button>

              {newContent && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Generated Content</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full h-32 border border-gray-700 bg-gray-800 text-white rounded px-3 py-2"
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => {
                        if (!selectedMarket) return;
                        const newPost: Post = {
                          id: Date.now().toString(),
                          content: newContent,
                          market: {
                            title: selectedMarket.title,
                            position: selectedMarket.position,
                            price: selectedMarket.currentPrice
                          },
                          platform: 'farcaster',
                          timestamp: new Date().toISOString(),
                          engagement: { likes: 0, replies: 0, recasts: 0 },
                          status: 'draft'
                        };
                        setPosts([newPost, ...posts]);
                        setNewContent('');
                        setActiveTab('drafts');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    >
                      Save as Draft
                    </button>
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                    >
                      Post to Farcaster
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {(activeTab === 'published' || activeTab === 'drafts') && (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {activeTab === 'drafts' ? 'No drafts yet. Generate some content!' : 'No published posts yet.'}
              </p>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        post.platform === 'farcaster' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'
                      }`}>
                        {post.platform}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        post.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(post.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {post.performance && (
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${post.performance.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {post.performance.pnl > 0 ? '+' : ''}{post.performance.pnl}¢ PnL
                        </div>
                        <div className="text-xs text-gray-500">
                          {post.performance.marketMove > 0 ? '+' : ''}{post.performance.marketMove}¢ move
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        <span className="font-semibold">{post.market.position}</span> @ {post.market.price}¢
                        <span className="ml-2 text-xs">• {post.market.title.substring(0, 40)}...</span>
                      </div>
                      {post.status === 'published' ? (
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <span>❤️ {post.engagement.likes}</span>
                          <span>💬 {post.engagement.replies}</span>
                          <span>🔄 {post.engagement.recasts}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => publishPost(post)}
                          className="px-3 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-500"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}