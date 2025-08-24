// Shortlink tracking system for attribution
export interface ShortlinkData {
  id: string;
  pickId: string;
  castHash: string;
  marketTitle: string;
  marketUrl: string;
  position: 'YES' | 'NO';
  targetPrice: number;
  confidence: number;
  contentTitle: string;
  createdAt: string;
  clicks: number;
  engagement: {
    likes: number;
    recasts: number;
    replies: number;
  };
  pnl?: {
    entryPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
    realizedPnl?: number;
  };
}

export class ShortlinkTracker {
  private storage: Map<string, ShortlinkData> = new Map();

  async createShortlink(data: Omit<ShortlinkData, 'clicks' | 'engagement'>): Promise<string> {
    const shortlinkData: ShortlinkData = {
      ...data,
      clicks: 0,
      engagement: {
        likes: 0,
        recasts: 0,
        replies: 0
      }
    };
    
    this.storage.set(data.id, shortlinkData);
    console.log(`🔗 Created shortlink: /m/${data.id}`);
    
    return data.id;
  }

  async trackClick(id: string, userAgent?: string, referrer?: string): Promise<ShortlinkData | null> {
    const data = this.storage.get(id);
    if (!data) return null;
    
    data.clicks++;
    this.storage.set(id, data);
    
    console.log(`👆 Click tracked for /m/${id} (total: ${data.clicks})`);
    
    return data;
  }

  async updateEngagement(id: string, engagement: Partial<ShortlinkData['engagement']>): Promise<void> {
    const data = this.storage.get(id);
    if (!data) return;
    
    data.engagement = { ...data.engagement, ...engagement };
    this.storage.set(id, data);
    
    console.log(`📊 Updated engagement for /m/${id}:`, data.engagement);
  }

  async updatePnL(id: string, pnl: ShortlinkData['pnl']): Promise<void> {
    const data = this.storage.get(id);
    if (!data) return;
    
    data.pnl = pnl;
    this.storage.set(id, data);
    
    console.log(`💰 Updated PnL for /m/${id}: ${pnl?.unrealizedPnl?.toFixed(2)}%`);
  }

  async getShortlink(id: string): Promise<ShortlinkData | null> {
    return this.storage.get(id) || null;
  }

  async getAllShortlinks(): Promise<ShortlinkData[]> {
    return Array.from(this.storage.values());
  }

  async getAnalytics(): Promise<{
    totalClicks: number;
    totalShortlinks: number;
    avgClicksPerLink: number;
    topPerformers: ShortlinkData[];
    totalEngagement: number;
    avgPnL: number;
  }> {
    const all = this.getAllShortlinks();
    const links = await all;
    
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
    const totalEngagement = links.reduce((sum, link) => 
      sum + link.engagement.likes + link.engagement.recasts + link.engagement.replies, 0
    );
    
    const linksWithPnL = links.filter(link => link.pnl?.unrealizedPnl !== undefined);
    const avgPnL = linksWithPnL.length > 0 
      ? linksWithPnL.reduce((sum, link) => sum + (link.pnl?.unrealizedPnl || 0), 0) / linksWithPnL.length
      : 0;
    
    const topPerformers = links
      .sort((a, b) => (b.clicks + b.engagement.likes + b.engagement.recasts) - (a.clicks + a.engagement.likes + a.engagement.recasts))
      .slice(0, 5);
    
    return {
      totalClicks,
      totalShortlinks: links.length,
      avgClicksPerLink: links.length > 0 ? totalClicks / links.length : 0,
      topPerformers,
      totalEngagement,
      avgPnL
    };
  }
}

// Express.js route handler for shortlinks
export function createShortlinkHandler(tracker: ShortlinkTracker) {
  return async (req: any, res: any) => {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing shortlink ID' });
    }
    
    // Track the click
    const data = await tracker.trackClick(id, req.headers['user-agent'], req.headers.referer);
    
    if (!data) {
      return res.status(404).json({ error: 'Shortlink not found' });
    }
    
    // Redirect to market URL
    res.redirect(302, data.marketUrl);
  };
}

// Webhook handler for engagement updates
export function createEngagementWebhook(tracker: ShortlinkTracker) {
  return async (req: any, res: any) => {
    const { castHash, likes, recasts, replies } = req.body;
    
    if (!castHash) {
      return res.status(400).json({ error: 'Missing cast hash' });
    }
    
    // Find shortlink by cast hash
    const all = await tracker.getAllShortlinks();
    const shortlink = all.find(s => s.castHash === castHash);
    
    if (shortlink) {
      await tracker.updateEngagement(shortlink.id, { likes, recasts, replies });
    }
    
    res.json({ success: true });
  };
}

// Test the tracker
async function testShortlinkTracker() {
  console.log('🔗 Testing Shortlink Tracker\n');
  
  const tracker = new ShortlinkTracker();
  
  // Create test shortlink
  const testData: Omit<ShortlinkData, 'clicks' | 'engagement'> = {
    id: 'abc123',
    pickId: 'pick-test-123',
    castHash: 'cast-hash-123',
    marketTitle: 'Will Bitcoin dip to $70,000 by December 31, 2025?',
    marketUrl: 'https://polymarket.com/event/btc-70k',
    position: 'YES',
    targetPrice: 30,
    confidence: 0.7,
    contentTitle: 'Bitcoin Dip Analysis',
    createdAt: new Date().toISOString()
  };
  
  await tracker.createShortlink(testData);
  
  // Simulate clicks and engagement
  await tracker.trackClick('abc123');
  await tracker.trackClick('abc123');
  await tracker.updateEngagement('abc123', { likes: 15, recasts: 3, replies: 2 });
  await tracker.updatePnL('abc123', {
    entryPrice: 10,
    currentPrice: 25,
    unrealizedPnl: 150 // 150% gain
  });
  
  // Show analytics
  const analytics = await tracker.getAnalytics();
  
  console.log('📊 SHORTLINK ANALYTICS:');
  console.log('═'.repeat(60));
  console.log(`Total Links: ${analytics.totalShortlinks}`);
  console.log(`Total Clicks: ${analytics.totalClicks}`);
  console.log(`Avg Clicks/Link: ${analytics.avgClicksPerLink.toFixed(1)}`);
  console.log(`Total Engagement: ${analytics.totalEngagement}`);
  console.log(`Avg PnL: ${analytics.avgPnL.toFixed(1)}%`);
  
  console.log('\n🏆 TOP PERFORMER:');
  if (analytics.topPerformers.length > 0) {
    const top = analytics.topPerformers[0];
    console.log(`${top.contentTitle}`);
    console.log(`Clicks: ${top.clicks}, Likes: ${top.engagement.likes}, Recasts: ${top.engagement.recasts}`);
    console.log(`PnL: ${top.pnl?.unrealizedPnl?.toFixed(1)}%`);
  }
}

if (require.main === module) {
  testShortlinkTracker();
}