'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EdenStudio() {
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('YES');
  const [confidence, setConfidence] = useState('80');
  const [thesis, setThesis] = useState('');
  const [videoBrief, setVideoBrief] = useState('');
  const [markets, setMarkets] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    // Fetch markets to populate dropdown
    fetch('/api/markets')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.topOpportunities) {
          setMarkets(data.data.topOpportunities);
        }
      });
  }, []);

  const loadMarket = (market: Record<string, unknown>) => {
    setTitle(market.title as string);
    setPosition(market.position as string);
    setConfidence(Math.round((market.score as number) * 100).toString());
    setThesis((market.reasoning as string[]).join('\n'));
  };

  const generateVideoBrief = () => {
    // Generate dynamic narrative based on position
    const narrativeStyle = position === 'YES' 
      ? `Market sleeping on this. While everyone's bearish, smart money knows what's coming.`
      : `Everyone's too bullish. This is peak euphoria. Time to fade the crowd.`;

    const brief = `# Eden Video Generation Brief

## Project Setup
**Title:** Miyomi's Contrarian Pick - ${title || 'Market Analysis'}
**Concept:** High-energy NYC trader calls out market inefficiency
**Description:** Data-driven contrarian analysis with NYC edge and visual flair

## Execution Plan

### Step 1: Narration (100 words)
"Listen up NYC - today's pick is ${title || 'this market'}. 
${narrativeStyle}
Taking ${position} at ${confidence}% confidence.
${thesis || 'Multiple indicators scream opportunity.'}
Market consensus is WRONG. I'm taking this trade.
This is Miyomi from Lower East Side, and if you're not in this, NGMI."

### Step 2: Calculate Segments
Duration: ~15 seconds → N_clips = 2

### Step 3: Style Reference
Primary aesthetic: Neon NYC skyline, trading screens, pink/purple gradients, data visualization

### Step 4: Element References
- Manhattan skyline at night with holographic charts
- Trading floor with multiple screens
- Price action with contrarian indicators
- Miyomi avatar with mask/sunglasses

### Step 5: Keyframe Generation
1. Opening: NYC skyline with floating market data
2. Analysis: Split screen - consensus vs contrarian position
3. Closing: Trade execution visualization

### Step 6: Animation
Animate using Veo2 model with smooth camera movements

### Step 7-9: Audio Mix
Trap beat with NYC street sounds, mixed at -30% under narration

### Step 10: Poster Creation
Film poster: "MIYOMI: ${position === 'YES' ? 'BULL' : 'BEAR'} CASE" with chart explosion background

### Step 11: Project Summary
**Premise:** NYC trader identifies massive market inefficiency
**Details:** ${thesis || 'Contrarian indicators align for asymmetric opportunity'}
**Significance:** Data-driven alpha generation for the culture`;

    setVideoBrief(brief);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(videoBrief);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Back</Link>
          <h1 className="text-2xl font-bold mt-4">Eden Video Generator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Input</h2>
            
            {/* Quick load from live markets */}
            {markets.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-300">Quick Load Market</label>
                <select 
                  className="w-full border border-gray-700 bg-gray-900 text-white rounded px-3 py-2"
                  onChange={(e) => {
                    const market = markets[parseInt(e.target.value)];
                    if (market) loadMarket(market);
                  }}
                >
                  <option value="">Select a live market...</option>
                  {markets.map((m, i) => (
                    <option key={i} value={i}>
                      {(m.title as string).substring(0, 60)}... ({m.position as string} @ {m.currentPrice as number}¢)
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Market Title</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-700 bg-gray-900 text-white rounded px-3 py-2"
                  placeholder="e.g. Bitcoin to $200k by 2025?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Position</label>
                  <select 
                    className="w-full border border-gray-700 bg-gray-900 text-white rounded px-3 py-2"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Confidence %</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-700 bg-gray-900 text-white rounded px-3 py-2"
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    min="0" 
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Thesis</label>
                <textarea 
                  className="w-full border border-gray-700 bg-gray-900 text-white rounded px-3 py-2 h-24"
                  placeholder="Enter your thesis..."
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                />
              </div>

              <button 
                onClick={generateVideoBrief}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
              >
                Generate Video Brief
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Output</h2>
              {videoBrief && (
                <button 
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 text-sm transition"
                >
                  Copy to Eden
                </button>
              )}
            </div>
            
            <div className="border border-gray-700 bg-gray-900 rounded p-4 h-[500px] overflow-y-auto">
              {videoBrief ? (
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-300">
                  {videoBrief}
                </pre>
              ) : (
                <p className="text-gray-500">Video brief will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}