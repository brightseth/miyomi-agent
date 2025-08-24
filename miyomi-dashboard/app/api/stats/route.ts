import { NextResponse } from 'next/server';

// API route to fetch performance statistics
export async function GET() {
  try {
    // Mock stats for now
    const stats = {
      totalPosts: 127,
      totalEngagement: 12347,
      avgPnL: 340,
      activeMarkets: 8,
      performance: {
        period: "7 days",
        totalPicks: 127,
        winRate: 0.62,
        avgPnL: 340,
        totalEngagement: 12347,
        clickThroughRate: 2.4,
        bestPick: {
          title: "Bitcoin to $150k",
          pnl: 850,
          engagement: 445
        }
      },
      recentActivity: [
        { type: 'post', message: 'Posted: "Bitcoin to $150k" pick', time: '2 min ago' },
        { type: 'pnl', message: 'Position up +3.5¢ on recession trade', time: '1 hour ago' },
        { type: 'video', message: 'Generated Eden video for AI jobs market', time: '3 hours ago' },
        { type: 'engagement', message: '127 likes on morning pick', time: '4 hours ago' }
      ]
    };
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics'
    }, { status: 500 });
  }
}