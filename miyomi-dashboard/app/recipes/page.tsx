'use client';
import { useState } from 'react';
import Link from 'next/link';
import { RECIPE_PRESETS, generateRecipeVariant, type RecipePreset } from '@/lib/recipe-presets';

interface RecipePerformance {
  views: number;
  engagement_rate: number;
  completion_rate: number;
  conversion_rate: number;
  revenue: number;
}

export default function RecipesPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<RecipePreset | null>(null);
  const [showVariantBuilder] = useState(false);
  const [abTests, setAbTests] = useState<Array<{
    id: string;
    control: string;
    variant: string;
    status: 'running' | 'completed';
    winner?: string;
    improvement?: number;
  }>>([]);

  // Mock performance data
  const performanceData: Record<string, RecipePerformance> = {
    'miyomi_daily_market_drop': {
      views: 125340,
      engagement_rate: 0.124,
      completion_rate: 0.67,
      conversion_rate: 0.045,
      revenue: 5643.20
    },
    'miyomi_breaking_analysis': {
      views: 45230,
      engagement_rate: 0.089,
      completion_rate: 0.52,
      conversion_rate: 0.023,
      revenue: 1045.29
    }
  };

  const agents = ['all', 'miyomi', 'solienne', 'abraham', 'ezra', 'lyra', 'nova'];
  
  const filteredPresets = Object.entries(RECIPE_PRESETS).filter(([key, preset]) => 
    selectedAgent === 'all' || preset.agent.name === selectedAgent
  );

  const createABTest = (controlPreset: string, variantChanges: Partial<RecipePreset>) => {
    const variant = generateRecipeVariant(controlPreset, variantChanges);
    const testId = `test_${Date.now()}`;
    
    setAbTests([...abTests, {
      id: testId,
      control: controlPreset,
      variant: variant.recipe_id,
      status: 'running'
    }]);
  };

  const renderPresetCard = (preset: RecipePreset, key: string) => {
    const perf = performanceData[key];
    
    return (
      <div
        key={key}
        className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition cursor-pointer"
        onClick={() => setSelectedPreset(preset)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{preset.agent.preset.replace(/_/g, ' ').toUpperCase()}</h3>
            <p className="text-sm text-gray-400">{preset.agent.name} • {preset.metadata.duration}s</p>
          </div>
          <div className="text-right">
            <div className="text-xs px-2 py-1 bg-gray-800 rounded">
              v{preset.recipe_id.split('.v')[1]}
            </div>
          </div>
        </div>

        {/* Visual Style Preview */}
        <div className="mb-3">
          <div className="flex gap-1 mb-2">
            {preset.style_defaults.color_palette.map((color, i) => (
              <div
                key={i}
                className="h-6 flex-1 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {preset.style_defaults.primary_aesthetic} • {preset.agent.voice.pacing} pacing
          </p>
        </div>

        {/* Performance Metrics */}
        {perf && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Views:</span>
              <span className="ml-1 font-bold">{(perf.views / 1000).toFixed(1)}k</span>
            </div>
            <div>
              <span className="text-gray-500">Engagement:</span>
              <span className="ml-1 font-bold">{(perf.engagement_rate * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-500">Completion:</span>
              <span className="ml-1 font-bold">{(perf.completion_rate * 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-500">Revenue:</span>
              <span className="ml-1 font-bold text-green-400">${perf.revenue.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* Platform Targets */}
        <div className="mt-3 flex gap-1">
          {preset.metadata.platform_targets.map((platform) => (
            <span key={platform} className="text-xs px-2 py-1 bg-gray-800 rounded">
              {platform}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Back</Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold">Recipe Management</h1>
              <p className="text-gray-400 mt-2">Eden video creation templates and A/B testing</p>
            </div>
            <button
              onClick={() => console.log('Create variant')}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
            >
              + Create Variant
            </button>
          </div>
        </div>

        {/* Agent Filter */}
        <div className="mb-6">
          <div className="flex gap-2">
            {agents.map((agent) => (
              <button
                key={agent}
                onClick={() => setSelectedAgent(agent)}
                className={`px-4 py-2 rounded transition ${
                  selectedAgent === agent
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {agent === 'all' ? 'All Agents' : agent.charAt(0).toUpperCase() + agent.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredPresets.map(([key, preset]) => renderPresetCard(preset, key))}
        </div>

        {/* A/B Testing Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Active A/B Tests</h2>
          {abTests.length === 0 ? (
            <p className="text-gray-500">No active tests. Create a variant to start testing.</p>
          ) : (
            <div className="space-y-3">
              {abTests.map((test) => (
                <div key={test.id} className="p-4 bg-gray-800 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{test.control}</span>
                      <span className="mx-2 text-gray-500">vs</span>
                      <span className="font-semibold">Variant #{test.variant.slice(-4)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {test.status === 'running' ? (
                        <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded">
                          Running
                        </span>
                      ) : (
                        <>
                          <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                            Winner: {test.winner}
                          </span>
                          <span className="text-green-400 font-bold">
                            +{test.improvement}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Preset Detail */}
        {selectedPreset && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedPreset.agent.preset.replace(/_/g, ' ')}</h2>
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Agent Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Name:</span> {selectedPreset.agent.name}</div>
                    <div><span className="text-gray-500">Tone:</span> {selectedPreset.agent.voice.tone.join(', ')}</div>
                    <div><span className="text-gray-500">Accent:</span> {selectedPreset.agent.voice.accent || 'None'}</div>
                    <div><span className="text-gray-500">Pacing:</span> {selectedPreset.agent.voice.pacing}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Video Metadata</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Duration:</span> {selectedPreset.metadata.duration}s</div>
                    <div><span className="text-gray-500">Aspect:</span> {selectedPreset.metadata.aspect_ratio}</div>
                    <div><span className="text-gray-500">Platforms:</span> {selectedPreset.metadata.platform_targets.join(', ')}</div>
                    <div><span className="text-gray-500">Title:</span> {selectedPreset.metadata.title_template}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Visual Style</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Aesthetic:</span> {selectedPreset.style_defaults.primary_aesthetic}</div>
                    <div><span className="text-gray-500">Effects:</span> {selectedPreset.style_defaults.visual_effects.join(', ')}</div>
                    <div className="flex gap-1 mt-2">
                      {selectedPreset.style_defaults.color_palette.map((color, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className="w-8 h-8 rounded" style={{ backgroundColor: color }} />
                          <span className="text-xs">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Optimization Notes</h3>
                  <p className="text-sm text-gray-400">
                    {selectedPreset.optimization_notes || 'No specific optimization notes.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                  Export Recipe JSON
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500">
                  Create Variant
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500">
                  Generate Video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Evolution Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recipe Evolution</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
            <div className="space-y-4">
              {[
                { version: '1.0', date: '2024-12-01', change: 'Initial Miyomi daily recipe', improvement: null },
                { version: '1.1', date: '2024-12-10', change: 'Shortened to 30s', improvement: '+15% completion' },
                { version: '1.2', date: '2024-12-15', change: 'Added glitch effects', improvement: '+23% engagement' },
                { version: '1.3', date: '2024-12-20', change: 'Faster pacing', improvement: '+8% conversion' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-700 flex items-center justify-center text-xs">
                    {item.version}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.change}</div>
                    <div className="text-xs text-gray-500">{item.date}</div>
                  </div>
                  {item.improvement && (
                    <div className="text-sm text-green-400 font-bold">{item.improvement}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}