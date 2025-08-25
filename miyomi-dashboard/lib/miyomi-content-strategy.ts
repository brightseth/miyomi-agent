/**
 * Miyomi Content Strategy - Based on Prediction Market Research
 * 
 * Key Insights:
 * 1. Odds embedded where people scroll (X cards/frames)
 * 2. Vertical sports/news clips with odds overlaid (TikTok/IG Reels)
 * 3. Zero-click engagement is king
 * 4. Post-mortems build credibility
 */

export interface MiyomiContent {
  platform: 'x' | 'farcaster' | 'tiktok' | 'instagram';
  type: 'odds-card' | 'video-clip' | 'frame' | 'post-mortem' | 'market-move';
  market: {
    title: string;
    position: 'YES' | 'NO';
    currentOdds: number;
    previousOdds?: number;
    volume?: number;
    whaleActivity?: boolean;
  };
  content: {
    hook: string;
    body: string;
    cta: string;
    visual?: string; // URL to image/video
  };
  timing: 'breaking' | 'scheduled' | 'reactive';
}

// Content Templates based on winning formats
export const CONTENT_TEMPLATES = {
  // X (Twitter) - Zero-Click Format
  x: {
    breaking: {
      hook: (market: string, odds: number) => 
        `${odds}% consensus on ${market}. They're wrong.`,
      body: (position: string, price: number, reasoning: string) =>
        `Taking ${position} at ${price}¢\n\n${reasoning}\n\nData > narrative, always.`,
      cta: () => `Reply with your take or tag @AskPolymarket for odds`,
      format: 'CARD' // Embed odds card natively
    },
    postMortem: {
      hook: (result: 'WIN' | 'LOSS', pnl: number) =>
        result === 'WIN' 
          ? `+${pnl}¢ locked. Receipts below.`
          : `−${pnl}¢ lesson. Here's what changed:`,
      body: (market: string, position: string, outcome: string) =>
        `Market: ${market}\nPosition: ${position}\nOutcome: ${outcome}\n\nCalibration matters more than being right.`,
      cta: () => `Follow for daily contrarian picks at noon EST`
    },
    whaleAlert: {
      hook: (amount: number, market: string) =>
        `🐋 $${amount}k just hit ${market}`,
      body: (position: string, impact: string) =>
        `${position} whale. ${impact}\n\nWhen smart money moves, consensus follows.`,
      cta: () => `Get in before the herd`
    }
  },

  // TikTok/IG Reels - Odds-over-Clip Format
  video: {
    structure: {
      '0-3s': 'Question on screen with current odds',
      '3-12s': 'News clip or market context',
      '12-25s': 'Why odds moved + Miyomi take',
      '25-40s': 'CTA with odds overlay',
      maxLength: 45
    },
    hooks: [
      "91% think Bitcoin won't hit $200k. Watch this.",
      "The market is DEAD WRONG about this",
      "Free money alert - but 87% can't see it",
      "Why I'm betting against EVERYONE on this"
    ],
    overlays: {
      odds: 'Top left corner, updating live',
      position: 'Bottom bar with YES/NO indicator',
      pnl: 'Green/red ticker when showing results'
    }
  },

  // Farcaster - Mini Apps (Frames deprecated)
  farcaster: {
    miniApp: {
      title: (market: string) => market.slice(0, 50),
      type: 'Interactive mini app',
      embed: 'Tradeable position in-cast',
      action: 'One-click trading via mini app',
      postText: (position: string, odds: number) =>
        `${100 - odds}% consensus trapped. Taking ${position}.\n\nTrade via mini app below 👇`
    },
    daily: {
      title: "Miyomi's Daily Three",
      format: '3 markets, 3 mini apps, 3 contrarian plays',
      timing: '12PM EST sharp',
      note: 'Each cast embeds tradeable mini app'
    },
    integration: {
      platform: 'Mini Apps API',
      features: ['In-feed trading', 'Live odds updates', 'Position tracking'],
      requirement: 'Mini app must be approved and deployed'
    }
  },

  // Instagram - Carousel Format
  instagram: {
    carousel: {
      slide1: 'Result/Question',
      slide2: 'Odds chart over time',
      slide3: 'What moved the market',
      slide4: 'Miyomi's position + reasoning',
      slide5: 'CTA: Link in bio to trade'
    },
    reel: 'Same as TikTok but with IG-specific captions'
  }
};

// Voice Guidelines (No edgelord, heavy on data)
export const MIYOMI_VOICE = {
  core: [
    "Data doesn't lie, consensus does",
    "Entry price is everything",
    "Calibration > conviction",
    "When everyone agrees, everyone is wrong",
    "Fade the masses, not the math"
  ],
  
  avoid: [
    "Rocket/moon emojis",
    "WAGMI/NGMI (except sparingly)",
    "Edgelord takes",
    "Political hot takes",
    "Unsubstantiated claims"
  ],
  
  tone: 'Dry, probability-literate, receipt-heavy',
  
  phrases: {
    highConfidence: [
      "${odds}% are wrong about this",
      "Consensus trapped in groupthink",
      "Market's giving us a gift here",
      "Data says X, narrative says Y"
    ],
    medConfidence: [
      "Worth a position at these levels",
      "Asymmetric risk/reward",
      "Market's sleeping on this"
    ],
    postMortem: [
      "Called it at ${entry}¢, closed at ${exit}¢",
      "Receipts matter more than predictions",
      "Here's what the market missed",
      "Calibration check: ${accuracy}% this month"
    ]
  }
};

// Content Cadence
export const CONTENT_SCHEDULE = {
  daily: {
    '9AM': 'Morning market scan (X)',
    '12PM': 'CHICKS PICKS video drop (TikTok/IG)',
    '12:05PM': 'Farcaster frame with top pick',
    '3PM': 'Market move alert if significant',
    '6PM': 'Sports odds overlay (if applicable)',
    '9PM': 'Post-mortem on closed markets'
  },
  
  weekly: {
    monday: 'Week ahead - top 5 contrarian plays',
    wednesday: 'Calibration report with Brier scores',
    friday: 'Whale watch - biggest positions',
    sunday: 'Educational explainer on one market'
  },
  
  reactive: {
    trigger: 'Any market moving >10% in 1 hour',
    response: 'Post within 15 minutes with odds card',
    format: 'Breaking news style with embedded odds'
  }
};

// Auto-Response Patterns
export const AUTO_RESPONSES = {
  x: {
    pattern: '@miyomi_trades',
    response: (market: string, odds: number, position: string) =>
      `Current odds: ${odds}% YES\nMy position: ${position}\nReasoning: ${100-odds}% consensus means ${odds}% opportunity\n\nTag @AskPolymarket for live odds`,
    embedOddsCard: true
  },
  
  farcaster: {
    pattern: 'cast with market mention',
    response: 'Mini app with tradeable position',
    autoMiniApp: true,
    note: 'Requires mini app deployment on Farcaster'
  }
};

// Measurement KPIs
export const METRICS = {
  engagement: {
    x: 'Reply rate + @AskPolymarket tags',
    farcaster: 'Mini app interaction rate + trades initiated',
    tiktok: 'Watch time + shares',
    instagram: 'Saves + carousel completion'
  },
  
  credibility: {
    brierScore: 'Track all predictions',
    winRate: 'Positions closed in profit',
    calibration: 'Predicted vs actual outcomes',
    transparency: 'All trades public with timestamps'
  },
  
  growth: {
    dailyActive: 'Unique engaged users',
    retention: '% returning for post-mortems',
    conversion: 'Content view → trade',
    viral: 'Shares/reposts per content piece'
  }
};

// Platform-Specific Optimizations
export const PLATFORM_CONFIG = {
  x: {
    maxLength: 280,
    mediaTypes: ['image', 'card'],
    bestTimes: ['9AM', '12PM', '6PM', '9PM'],
    features: ['Quote tweets', 'Polls', 'Spaces']
  },
  
  tiktok: {
    maxLength: 60,
    idealLength: 30,
    aspectRatio: '9:16',
    features: ['Lives during volatility', 'Duets', 'Stitches']
  },
  
  instagram: {
    reelLength: 30,
    carouselMax: 10,
    bestTimes: ['12PM', '5PM', '8PM'],
    features: ['Stories with polls', 'Reels', 'Carousels']
  },
  
  farcaster: {
    miniAppFirst: true,
    maxCastLength: 320,
    features: ['Mini Apps', 'Channels', 'Direct replies'],
    miniAppRequirements: [
      'Must be deployed to Farcaster Mini Apps platform',
      'Needs approval from Farcaster team',
      'In-cast trading functionality',
      'Live odds updates'
    ]
  }
};

// Generate content for a specific market opportunity
export function generateMiyomiContent(
  market: {
    title: string;
    position: 'YES' | 'NO';
    currentOdds: number;
    volume: number;
    momentum?: number;
  },
  platform: 'x' | 'farcaster' | 'tiktok' | 'instagram',
  type: 'breaking' | 'scheduled' | 'postMortem' = 'breaking'
): MiyomiContent {
  const consensusAgainst = market.position === 'YES' 
    ? (100 - market.currentOdds) 
    : market.currentOdds;

  switch (platform) {
    case 'x':
      return {
        platform: 'x',
        type: 'odds-card',
        market: {
          title: market.title,
          position: market.position,
          currentOdds: market.currentOdds,
          volume: market.volume
        },
        content: {
          hook: CONTENT_TEMPLATES.x.breaking.hook(market.title, consensusAgainst),
          body: CONTENT_TEMPLATES.x.breaking.body(
            market.position,
            market.currentOdds,
            `${consensusAgainst}% consensus = ${100-consensusAgainst}% alpha`
          ),
          cta: CONTENT_TEMPLATES.x.breaking.cta()
        },
        timing: type
      };

    case 'tiktok':
      return {
        platform: 'tiktok',
        type: 'video-clip',
        market: {
          title: market.title,
          position: market.position,
          currentOdds: market.currentOdds,
          volume: market.volume
        },
        content: {
          hook: CONTENT_TEMPLATES.video.hooks[Math.floor(Math.random() * CONTENT_TEMPLATES.video.hooks.length)],
          body: `NYC, today's pick is INSANE. ${consensusAgainst}% are WRONG about ${market.title}. Taking ${market.position} at ${market.currentOdds}¢ while everyone's sleeping.`,
          cta: "Link below to tail this trade. If you're not in this, NGMI."
        },
        timing: type
      };

    case 'farcaster':
      return {
        platform: 'farcaster',
        type: 'frame', // Will be mini app in production
        market: {
          title: market.title,
          position: market.position,
          currentOdds: market.currentOdds,
          volume: market.volume
        },
        content: {
          hook: CONTENT_TEMPLATES.farcaster.miniApp.postText(market.position, market.currentOdds),
          body: `Market: ${market.title}\nPosition: ${market.position}\nEntry: ${market.currentOdds}¢`,
          cta: 'Trade via mini app below 👇'
        },
        timing: type
      };

    case 'instagram':
      return {
        platform: 'instagram',
        type: 'video-clip',
        market: {
          title: market.title,
          position: market.position,
          currentOdds: market.currentOdds,
          volume: market.volume
        },
        content: {
          hook: `${consensusAgainst}% WRONG`,
          body: `${market.title}\n\nTaking ${market.position} at ${market.currentOdds}¢\n\nConsensus trapped. Data says otherwise.`,
          cta: 'Link in bio for today\'s play'
        },
        timing: type
      };

    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

// Generate a full day's content schedule
export function generateDailyContent(markets: any[]) {
  const topPick = markets[0];
  const schedule = [];

  // 9AM - Morning scan
  schedule.push({
    time: '9:00 AM',
    content: generateMiyomiContent(topPick, 'x', 'scheduled'),
    note: 'Morning market scan'
  });

  // 12PM - Main video drop
  schedule.push({
    time: '12:00 PM',
    content: generateMiyomiContent(topPick, 'tiktok', 'scheduled'),
    note: 'CHICKS PICKS daily video'
  });

  // 12:05PM - Farcaster frame
  schedule.push({
    time: '12:05 PM',
    content: generateMiyomiContent(topPick, 'farcaster', 'scheduled'),
    note: 'Farcaster frame for engagement'
  });

  // 6PM - Instagram reel
  schedule.push({
    time: '6:00 PM',
    content: generateMiyomiContent(topPick, 'instagram', 'scheduled'),
    note: 'IG Reel for evening audience'
  });

  return schedule;
}