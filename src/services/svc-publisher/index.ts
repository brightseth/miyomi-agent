// Complete svc-publisher service orchestrator
import { ContentGenerator, ContentOutput } from './content-generator';
import { FarcasterPublisher, PublishResult } from './farcaster-publisher';
import { ShortlinkTracker } from './shortlink-tracker';
import { EngagementTracker, PerformanceReport } from './engagement-tracker';
import { Pick } from '../svc-markets/types';

export interface PublishingPipeline {
  pick: Pick;
  content: ContentOutput;
  publishResult: PublishResult;
  timestamp: string;
}

export class PublisherService {
  private contentGenerator: ContentGenerator;
  private farcasterPublisher: FarcasterPublisher;
  private shortlinkTracker: ShortlinkTracker;
  private engagementTracker: EngagementTracker;

  constructor(
    anthropicKey: string,
    neynarKey: string,
    signerUuid: string,
    baseUrl: string = 'https://miyomi.vercel.app'
  ) {
    this.contentGenerator = new ContentGenerator(anthropicKey);
    this.farcasterPublisher = new FarcasterPublisher(neynarKey, signerUuid, baseUrl);
    this.shortlinkTracker = new ShortlinkTracker();
    this.engagementTracker = new EngagementTracker(this.shortlinkTracker);
  }

  async processPickForPublication(pick: Pick): Promise<PublishingPipeline> {
    console.log(`🎬 Processing pick ${pick.id} for publication...`);
    
    try {
      // 1. Generate content with Claude
      console.log('1️⃣ Generating content...');
      const content = await this.contentGenerator.generateContent(pick);
      
      // 2. Publish to Farcaster with shortlink
      console.log('2️⃣ Publishing to Farcaster...');
      const publishResult = await this.farcasterPublisher.publishContent(pick, content);
      
      // 3. Set up initial PnL tracking
      console.log('3️⃣ Setting up PnL tracking...');
      const entryPrice = pick.opportunity.recommendedPosition === 'YES' 
        ? pick.opportunity.market.yesPrice 
        : pick.opportunity.market.noPrice;
      
      await this.engagementTracker.recordPnL(pick.id, {
        entryPrice,
        currentPrice: entryPrice,
        unrealizedPnl: 0
      });
      
      const pipeline: PublishingPipeline = {
        pick,
        content,
        publishResult,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Published pipeline for pick ${pick.id}`);
      console.log(`📱 Cast: ${publishResult.farcasterUrl}`);
      console.log(`🔗 Track: ${publishResult.shortlinkId}`);
      
      return pipeline;
      
    } catch (error) {
      console.error(`❌ Publishing pipeline failed for pick ${pick.id}:`, error);
      throw error;
    }
  }

  async updateEngagementMetrics(castHash: string, likes: number, recasts: number, replies: number): Promise<void> {
    await this.engagementTracker.recordEngagement(castHash, {
      likes,
      recasts,
      replies
    });
  }

  async updateMarketPnL(pickId: string, currentPrice: number): Promise<void> {
    const pnlHistory = this.engagementTracker['pnlHistory'].get(pickId);
    if (!pnlHistory || pnlHistory.length === 0) return;
    
    const lastSnapshot = pnlHistory[pnlHistory.length - 1];
    const pnlPercent = ((currentPrice - lastSnapshot.entryPrice) / lastSnapshot.entryPrice) * 100;
    
    await this.engagementTracker.recordPnL(pickId, {
      entryPrice: lastSnapshot.entryPrice,
      currentPrice,
      unrealizedPnl: pnlPercent
    });
  }

  async getPerformanceReport(days: number = 7): Promise<PerformanceReport> {
    return await this.engagementTracker.generatePerformanceReport(days);
  }

  async getShortlinkAnalytics() {
    return await this.shortlinkTracker.getAnalytics();
  }
}

// Test the complete publisher service
async function testPublisherService() {
  console.log('🎪 Testing Complete Publisher Service\n');
  
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const neynarKey = process.env.NEYNAR_API_KEY || '';
  const signerUuid = process.env.FARCASTER_SIGNER_UUID || '';
  
  if (!anthropicKey) {
    console.log('⚠️ Missing Anthropic API key - testing with fallback content');
  }
  
  const publisher = new PublisherService(anthropicKey, neynarKey, signerUuid);
  
  // Create mock pick
  const mockPick: Pick = {
    id: 'pick-' + Date.now(),
    timestamp: new Date().toISOString(),
    opportunity: {
      market: {
        source: 'polymarket',
        id: 'btc-test-' + Date.now(),
        url: 'https://polymarket.com/event/btc-70k-test',
        title: 'Will Bitcoin dip to $70,000 by December 31, 2025?',
        category: 'crypto',
        closesAt: '2025-12-31T00:00:00Z',
        yesPrice: 15,
        noPrice: 85,
        liquidityScore: 0.4,
        volume24h: 25000,
      },
      score: 0.82,
      reasoning: ['Market overconfident in NO outcome', 'Technical oversold conditions'],
      delta24h: -3.2,
      timeToClose: 2800,
      liquidityRank: 0.4,
      narrativeBoost: 0.9,
      recommendedPosition: 'YES',
    },
    thesis: ['Institutional accumulation accelerating', 'Technical bounce due', 'Sentiment too bearish'],
    confidence: 0.82,
    targetPrice: 40,
    stopLoss: 8,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  
  try {
    // Test complete pipeline
    const pipeline = await publisher.processPickForPublication(mockPick);
    
    console.log('\n🎯 PUBLISHING PIPELINE RESULT:');
    console.log('═'.repeat(60));
    console.log(`Pick ID: ${pipeline.pick.id}`);
    console.log(`Content Title: ${pipeline.content.title}`);
    console.log(`Cast Hash: ${pipeline.publishResult.castHash}`);
    console.log(`Shortlink: /m/${pipeline.publishResult.shortlinkId}`);
    
    // Simulate engagement updates
    console.log('\n📊 Simulating engagement updates...');
    await publisher.updateEngagementMetrics(pipeline.publishResult.castHash, 12, 3, 1);
    
    // Simulate PnL update
    console.log('💰 Simulating PnL update...');
    await publisher.updateMarketPnL(pipeline.pick.id, 22); // Price moved from 15 to 22
    
    // Generate performance report
    const report = await publisher.getPerformanceReport(7);
    
    console.log('\n📈 PERFORMANCE SUMMARY:');
    console.log('═'.repeat(60));
    console.log(`Picks: ${report.totalPicks}`);
    console.log(`Win Rate: ${(report.winRate * 100).toFixed(1)}%`);
    console.log(`Avg PnL: ${report.avgPnL.toFixed(1)}%`);
    console.log(`Engagement: ${report.totalEngagement}`);
    
    if (report.bestPick) {
      console.log(`Best: ${report.bestPick.title} (+${report.bestPick.pnl.toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.error('Publisher service test failed:', error);
  }
}

if (require.main === module) {
  testPublisherService();
}