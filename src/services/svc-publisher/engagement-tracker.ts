// Engagement and PnL tracking service
import { ShortlinkTracker, ShortlinkData } from './shortlink-tracker';
import { Market } from '../svc-markets/types';

export interface EngagementMetrics {
  castHash: string;
  likes: number;
  recasts: number;
  replies: number;
  timestamp: string;
}

export interface PnLSnapshot {
  pickId: string;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl?: number;
  timestamp: string;
}

export interface PerformanceReport {
  period: string;
  totalPicks: number;
  winRate: number;
  avgPnL: number;
  bestPick: {
    title: string;
    pnl: number;
    engagement: number;
  } | null;
  totalEngagement: number;
  clickThroughRate: number;
}

export class EngagementTracker {
  private shortlinkTracker: ShortlinkTracker;
  private engagementHistory: Map<string, EngagementMetrics[]> = new Map();
  private pnlHistory: Map<string, PnLSnapshot[]> = new Map();

  constructor(shortlinkTracker: ShortlinkTracker) {
    this.shortlinkTracker = shortlinkTracker;
  }

  async recordEngagement(castHash: string, metrics: Omit<EngagementMetrics, 'castHash' | 'timestamp'>): Promise<void> {
    const engagement: EngagementMetrics = {
      castHash,
      ...metrics,
      timestamp: new Date().toISOString()
    };
    
    // Store engagement history
    if (!this.engagementHistory.has(castHash)) {
      this.engagementHistory.set(castHash, []);
    }
    this.engagementHistory.get(castHash)!.push(engagement);
    
    // Update shortlink tracker
    const all = await this.shortlinkTracker.getAllShortlinks();
    const shortlink = all.find(s => s.castHash === castHash);
    
    if (shortlink) {
      await this.shortlinkTracker.updateEngagement(shortlink.id, metrics);
    }
    
    console.log(`📊 Recorded engagement for ${castHash}: +${metrics.likes} likes, +${metrics.recasts} RTs`);
  }

  async recordPnL(pickId: string, snapshot: Omit<PnLSnapshot, 'pickId' | 'timestamp'>): Promise<void> {
    const pnlSnapshot: PnLSnapshot = {
      pickId,
      ...snapshot,
      timestamp: new Date().toISOString()
    };
    
    // Store PnL history
    if (!this.pnlHistory.has(pickId)) {
      this.pnlHistory.set(pickId, []);
    }
    this.pnlHistory.get(pickId)!.push(pnlSnapshot);
    
    // Update shortlink tracker
    const all = await this.shortlinkTracker.getAllShortlinks();
    const shortlink = all.find(s => s.pickId === pickId);
    
    if (shortlink) {
      await this.shortlinkTracker.updatePnL(shortlink.id, {
        entryPrice: snapshot.entryPrice,
        currentPrice: snapshot.currentPrice,
        unrealizedPnl: snapshot.unrealizedPnl,
        realizedPnl: snapshot.realizedPnl
      });
    }
    
    console.log(`💰 Recorded PnL for ${pickId}: ${snapshot.unrealizedPnl.toFixed(2)}%`);
  }

  async fetchCurrentMarketPrices(markets: Market[]): Promise<Map<string, number>> {
    // Mock implementation - in real version would fetch live prices
    const prices = new Map<string, number>();
    
    for (const market of markets) {
      // Simulate price movement
      const basePrice = market.yesPrice;
      const volatility = (Math.random() - 0.5) * 10; // ±5 cents
      const currentPrice = Math.max(1, Math.min(99, basePrice + volatility));
      
      prices.set(market.id, currentPrice);
    }
    
    return prices;
  }

  async updateAllPnL(markets: Market[]): Promise<void> {
    console.log('💹 Updating PnL for all active picks...');
    
    const currentPrices = await this.fetchCurrentMarketPrices(markets);
    const all = await this.shortlinkTracker.getAllShortlinks();
    
    for (const shortlink of all) {
      const marketId = shortlink.marketUrl.split('/').pop() || '';
      const currentPrice = currentPrices.get(marketId);
      
      if (currentPrice && shortlink.pnl?.entryPrice) {
        const entryPrice = shortlink.pnl.entryPrice;
        const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
        
        // Adjust for position direction
        const adjustedPnL = shortlink.position === 'YES' ? pnlPercent : -pnlPercent;
        
        await this.recordPnL(shortlink.pickId, {
          entryPrice,
          currentPrice,
          unrealizedPnl: adjustedPnL
        });
      }
    }
  }

  async generatePerformanceReport(periodDays: number = 7): Promise<PerformanceReport> {
    const cutoffDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const all = await this.shortlinkTracker.getAllShortlinks();
    
    const recentLinks = all.filter(link => 
      new Date(link.createdAt) > cutoffDate
    );
    
    const totalPicks = recentLinks.length;
    const winningSLinks = recentLinks.filter(link => 
      (link.pnl?.unrealizedPnl || 0) > 0
    );
    
    const winRate = totalPicks > 0 ? winningSLinks.length / totalPicks : 0;
    
    const avgPnL = totalPicks > 0 
      ? recentLinks.reduce((sum, link) => sum + (link.pnl?.unrealizedPnl || 0), 0) / totalPicks
      : 0;
    
    const totalEngagement = recentLinks.reduce((sum, link) => 
      sum + link.engagement.likes + link.engagement.recasts + link.engagement.replies, 0
    );
    
    const totalClicks = recentLinks.reduce((sum, link) => sum + link.clicks, 0);
    const clickThroughRate = totalClicks > 0 ? totalClicks / totalPicks : 0;
    
    // Find best performing pick
    let bestPick = null;
    if (recentLinks.length > 0) {
      const best = recentLinks.reduce((best, current) => {
        const currentScore = (current.pnl?.unrealizedPnl || 0) + 
          (current.engagement.likes + current.engagement.recasts + current.engagement.replies);
        const bestScore = (best.pnl?.unrealizedPnl || 0) + 
          (best.engagement.likes + best.engagement.recasts + best.engagement.replies);
        
        return currentScore > bestScore ? current : best;
      });
      
      bestPick = {
        title: best.contentTitle,
        pnl: best.pnl?.unrealizedPnl || 0,
        engagement: best.engagement.likes + best.engagement.recasts + best.engagement.replies
      };
    }
    
    return {
      period: `${periodDays} days`,
      totalPicks,
      winRate,
      avgPnL,
      bestPick,
      totalEngagement,
      clickThroughRate
    };
  }
}

// Test engagement tracking
async function testEngagementTracker() {
  console.log('📊 Testing Engagement Tracker\n');
  
  const shortlinkTracker = new ShortlinkTracker();
  const engagementTracker = new EngagementTracker(shortlinkTracker);
  
  // Create test data
  await shortlinkTracker.createShortlink({
    id: 'test1',
    pickId: 'pick-btc-1',
    castHash: 'cast-btc-123',
    marketTitle: 'Bitcoin to $70k?',
    marketUrl: 'https://polymarket.com/event/btc-70k',
    position: 'YES',
    targetPrice: 30,
    confidence: 0.7,
    contentTitle: 'Bitcoin Dip Analysis',
    createdAt: new Date().toISOString()
  });
  
  await shortlinkTracker.createShortlink({
    id: 'test2',
    pickId: 'pick-eth-1',
    castHash: 'cast-eth-456',
    marketTitle: 'ETH to $3k?',
    marketUrl: 'https://polymarket.com/event/eth-3k',
    position: 'NO',
    targetPrice: 40,
    confidence: 0.8,
    contentTitle: 'ETH Resistance Analysis',
    createdAt: new Date().toISOString()
  });
  
  // Simulate engagement and PnL
  await engagementTracker.recordEngagement('cast-btc-123', {
    likes: 25,
    recasts: 8,
    replies: 5
  });
  
  await engagementTracker.recordPnL('pick-btc-1', {
    entryPrice: 10,
    currentPrice: 25,
    unrealizedPnl: 150
  });
  
  await engagementTracker.recordPnL('pick-eth-1', {
    entryPrice: 60,
    currentPrice: 45,
    unrealizedPnl: 25
  });
  
  // Generate report
  const report = await engagementTracker.generatePerformanceReport(7);
  
  console.log('📈 PERFORMANCE REPORT (7 days):');
  console.log('═'.repeat(60));
  console.log(`Total Picks: ${report.totalPicks}`);
  console.log(`Win Rate: ${(report.winRate * 100).toFixed(1)}%`);
  console.log(`Avg PnL: ${report.avgPnL.toFixed(1)}%`);
  console.log(`Total Engagement: ${report.totalEngagement}`);
  console.log(`Click-through Rate: ${report.clickThroughRate.toFixed(1)} clicks/pick`);
  
  if (report.bestPick) {
    console.log(`\n🏆 Best Pick: ${report.bestPick.title}`);
    console.log(`   PnL: ${report.bestPick.pnl.toFixed(1)}%`);
    console.log(`   Engagement: ${report.bestPick.engagement}`);
  }
}

if (require.main === module) {
  testEngagementTracker();
}