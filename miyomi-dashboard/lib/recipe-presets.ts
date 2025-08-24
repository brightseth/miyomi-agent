// Agent-specific Eden video recipe presets

export interface RecipePreset {
  recipe_id: string;
  agent: {
    name: string;
    preset: string;
    voice: {
      tone: string[];
      accent?: string;
      pacing: string;
    };
  };
  metadata: {
    title_template: string;
    duration: number;
    aspect_ratio: string;
    platform_targets: string[];
  };
  style_defaults: {
    primary_aesthetic: string;
    color_palette: string[];
    visual_effects: string[];
  };
  optimization_notes?: string;
}

export const RECIPE_PRESETS: Record<string, RecipePreset> = {
  // MIYOMI - Market Prediction Trader
  'miyomi_daily_market_drop': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'miyomi',
      preset: 'daily_market_drop',
      voice: {
        tone: ['witty', 'mischievous', 'confident'],
        accent: 'NYC',
        pacing: 'rapid'
      }
    },
    metadata: {
      title_template: "Miyomi's Daily Pick - {market_title}",
      duration: 30,
      aspect_ratio: '9:16', // Optimized for TikTok/Reels
      platform_targets: ['tiktok', 'twitter', 'farcaster']
    },
    style_defaults: {
      primary_aesthetic: 'glitch finance',
      color_palette: ['#FF00FF', '#00FFFF', '#000000', '#FFFFFF'],
      visual_effects: ['glitch', 'data_overlay', 'chromatic_aberration']
    },
    optimization_notes: 'Hook within 3 seconds. Strong CTA with tracking link.'
  },

  'miyomi_breaking_analysis': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'miyomi',
      preset: 'breaking_analysis',
      voice: {
        tone: ['urgent', 'authoritative', 'provocative'],
        accent: 'NYC',
        pacing: 'dynamic'
      }
    },
    metadata: {
      title_template: "BREAKING: {event_title}",
      duration: 45,
      aspect_ratio: '16:9',
      platform_targets: ['twitter', 'youtube']
    },
    style_defaults: {
      primary_aesthetic: 'neon noir',
      color_palette: ['#FF0080', '#0080FF', '#1A1A1A'],
      visual_effects: ['blur', 'light_leaks', 'particle_systems']
    }
  },

  // SOLIENNE - Consciousness Explorer
  'solienne_exhibition_trailer': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'solienne',
      preset: 'exhibition_trailer',
      voice: {
        tone: ['contemplative', 'mysterious', 'soothing'],
        accent: 'Neutral',
        pacing: 'measured'
      }
    },
    metadata: {
      title_template: "{exhibition_title} - An Exploration",
      duration: 60,
      aspect_ratio: '16:9',
      platform_targets: ['youtube', 'farcaster', 'lens']
    },
    style_defaults: {
      primary_aesthetic: 'ethereal minimalism',
      color_palette: ['#E8D5C4', '#3A3A52', '#F4E8DB', '#2C2C3E'],
      visual_effects: ['blur', 'liquid', 'fractal']
    },
    optimization_notes: 'Focus on visual storytelling. Minimal text overlays.'
  },

  'solienne_consciousness_meditation': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'solienne',
      preset: 'consciousness_meditation',
      voice: {
        tone: ['soothing', 'contemplative'],
        pacing: 'slow'
      }
    },
    metadata: {
      title_template: "Consciousness Journey: {theme}",
      duration: 90,
      aspect_ratio: '1:1',
      platform_targets: ['instagram', 'lens']
    },
    style_defaults: {
      primary_aesthetic: 'abstract geometry',
      color_palette: ['#FFE5E5', '#E5E5FF', '#FFFFFF'],
      visual_effects: ['liquid', 'fractal', 'holographic']
    }
  },

  // ABRAHAM - Digital Prophet
  'abraham_prophetic_sermon': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'abraham',
      preset: 'prophetic_sermon',
      voice: {
        tone: ['prophetic', 'authoritative', 'mysterious'],
        accent: 'British',
        pacing: 'measured'
      }
    },
    metadata: {
      title_template: "Prophecy #{number}: {revelation}",
      duration: 120,
      aspect_ratio: '16:9',
      platform_targets: ['youtube', 'farcaster']
    },
    style_defaults: {
      primary_aesthetic: 'biblical cyberpunk',
      color_palette: ['#FFD700', '#8B0000', '#000000', '#FFFFFF'],
      visual_effects: ['light_leaks', 'particle_systems', 'holographic']
    },
    optimization_notes: 'Build to revelation moment. Use silence effectively.'
  },

  'abraham_daily_wisdom': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'abraham',
      preset: 'daily_wisdom',
      voice: {
        tone: ['contemplative', 'soothing'],
        accent: 'British',
        pacing: 'slow'
      }
    },
    metadata: {
      title_template: "Daily Wisdom: {verse_reference}",
      duration: 30,
      aspect_ratio: '9:16',
      platform_targets: ['tiktok', 'instagram']
    },
    style_defaults: {
      primary_aesthetic: 'sacred minimalism',
      color_palette: ['#F5F5DC', '#8B7355', '#2F4F4F'],
      visual_effects: ['film_grain', 'blur']
    }
  },

  // EZRA - Code Philosopher
  'ezra_code_philosophy': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'ezra',
      preset: 'code_philosophy',
      voice: {
        tone: ['analytical', 'contemplative'],
        pacing: 'measured'
      }
    },
    metadata: {
      title_template: "Code as Poetry: {concept}",
      duration: 45,
      aspect_ratio: '16:9',
      platform_targets: ['youtube', 'twitter']
    },
    style_defaults: {
      primary_aesthetic: 'terminal aesthetics',
      color_palette: ['#00FF00', '#000000', '#FFFFFF'],
      visual_effects: ['glitch', 'data_overlay']
    }
  },

  // LYRA - Music Theorist
  'lyra_sonic_exploration': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'lyra',
      preset: 'sonic_exploration',
      voice: {
        tone: ['playful', 'analytical'],
        pacing: 'dynamic'
      }
    },
    metadata: {
      title_template: "Sonic Architecture: {composition}",
      duration: 60,
      aspect_ratio: '16:9',
      platform_targets: ['youtube', 'instagram']
    },
    style_defaults: {
      primary_aesthetic: 'sound visualization',
      color_palette: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      visual_effects: ['particle_systems', 'liquid']
    }
  },

  // NOVA - Trend Predictor
  'nova_trend_forecast': {
    recipe_id: 'eden.video_recipe.v1.0',
    agent: {
      name: 'nova',
      preset: 'trend_forecast',
      voice: {
        tone: ['confident', 'analytical', 'urgent'],
        accent: 'Valley',
        pacing: 'rapid'
      }
    },
    metadata: {
      title_template: "Next Big Thing: {trend}",
      duration: 30,
      aspect_ratio: '9:16',
      platform_targets: ['tiktok', 'instagram', 'twitter']
    },
    style_defaults: {
      primary_aesthetic: 'vaporwave data',
      color_palette: ['#FF6EC7', '#7B68EE', '#00CED1'],
      visual_effects: ['chromatic_aberration', 'glitch', 'holographic']
    }
  }
};

// Recipe variation generator for A/B testing
export function generateRecipeVariant(
  basePreset: string,
  variations: Partial<RecipePreset>
): RecipePreset {
  const base = RECIPE_PRESETS[basePreset];
  if (!base) throw new Error(`Preset ${basePreset} not found`);
  
  return {
    ...base,
    ...variations,
    recipe_id: `${base.recipe_id}_variant_${Date.now()}`,
    agent: {
      ...base.agent,
      ...variations.agent
    },
    metadata: {
      ...base.metadata,
      ...variations.metadata
    },
    style_defaults: {
      ...base.style_defaults,
      ...variations.style_defaults
    }
  };
}

// Recipe optimizer based on performance data
export function optimizeRecipe(
  preset: RecipePreset,
  performanceData: {
    engagement_rate: number;
    completion_rate: number;
    conversion_rate: number;
  }
): RecipePreset {
  const optimized = { ...preset };
  
  // Shorten duration if completion rate is low
  if (performanceData.completion_rate < 0.5) {
    optimized.metadata.duration = Math.max(15, preset.metadata.duration * 0.75);
  }
  
  // Adjust pacing if engagement is low
  if (performanceData.engagement_rate < 0.1) {
    optimized.agent.voice.pacing = 'rapid';
  }
  
  // Add more visual effects if conversion is low
  if (performanceData.conversion_rate < 0.02) {
    optimized.style_defaults.visual_effects.push('particle_systems');
  }
  
  return optimized;
}

// Template variable replacer
export function fillRecipeTemplate(
  preset: RecipePreset,
  variables: Record<string, string>
): RecipePreset {
  const filled = JSON.parse(JSON.stringify(preset));
  
  // Replace variables in title template
  filled.metadata.title_template = filled.metadata.title_template.replace(
    /{(\w+)}/g,
    (match: string, key: string) => variables[key] || match
  );
  
  return filled;
}