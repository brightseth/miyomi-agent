// Complete Miyomi data-driven content trading pipeline
import { MarketPicker } from './services/svc-markets/picker';
import { fetchAllMarkets } from './services/svc-markets/connectors';
import { PublisherService } from './services/svc-publisher';

export interface MiyomiConfig {
  anthropicKey: string;
  neynarKey?: string;
  signerUuid?: string;
  kalshiKey?: string;
  edenKey?: string;
  baseUrl?: string;
}

export class MiyomiPipeline {
  private marketPicker: MarketPicker;
  private publisherService: PublisherService;
  
  constructor(config: MiyomiConfig) {
    this.marketPicker = new MarketPicker();
    this.publisherService = new PublisherService(
      config.anthropicKey,
      config.neynarKey || '',
      config.signerUuid || '',
      config.baseUrl || 'https://miyomi.vercel.app'
    );
  }

  async runDailyPick(): Promise<void> {
    console.log('🎭 MIYOMI DAILY PICK PIPELINE');
    console.log('═'.repeat(60));
    
    try {
      // 1. Fetch all markets
      console.log('1️⃣ Fetching markets from all sources...');
      const markets = await fetchAllMarkets();
      console.log(`   Found ${markets.length} active markets`);
      
      // 2. Rank opportunities
      console.log('2️⃣ Ranking contrarian opportunities...');
      const opportunities = await this.marketPicker.rankOpportunities(markets);
      console.log(`   Identified ${opportunities.length} opportunities`);
      
      if (opportunities.length === 0) {
        console.log('⚠️ No viable opportunities found');
        return;
      }
      
      // 3. Select top pick
      console.log('3️⃣ Selecting top opportunity...');
      const topOpportunity = opportunities[0];
      const pick = await this.marketPicker.createPick(topOpportunity);
      
      console.log(`   Selected: ${pick.opportunity.market.title.substring(0, 50)}...`);
      console.log(`   Position: ${pick.opportunity.recommendedPosition} at ${pick.opportunity.market.yesPrice}¢/${pick.opportunity.market.noPrice}¢`);
      console.log(`   Confidence: ${(pick.confidence * 100).toFixed(1)}%`);
      
      // 4. Generate and publish content
      console.log('4️⃣ Generating content and publishing...');
      const pipeline = await this.publisherService.processPickForPublication(pick);
      
      console.log('🎉 PIPELINE COMPLETE!');
      console.log('═'.repeat(60));
      console.log(`📱 Cast: ${pipeline.publishResult.farcasterUrl}`);
      console.log(`🔗 Track: https://miyomi.vercel.app/m/${pipeline.publishResult.shortlinkId}`);
      console.log(`🎯 Target: ${pick.targetPrice}¢ (${pick.opportunity.recommendedPosition})`);
      console.log(`📊 Thesis: ${pipeline.content.thesis.join(' • ')}`);
      
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      throw error;
    }
  }

  async getPerformanceStats(): Promise<void> {
    console.log('📊 MIYOMI PERFORMANCE STATS');
    console.log('═'.repeat(60));
    
    const report = await this.publisherService.getPerformanceReport(7);
    const analytics = await this.publisherService.getShortlinkAnalytics();
    
    console.log(`📈 7-Day Performance:`);
    console.log(`   Picks: ${report.totalPicks}`);
    console.log(`   Win Rate: ${(report.winRate * 100).toFixed(1)}%`);
    console.log(`   Avg PnL: ${report.avgPnL.toFixed(1)}%`);
    console.log(`   Total Engagement: ${report.totalEngagement}`);
    
    console.log(`\n🔗 Attribution:`);
    console.log(`   Total Shortlinks: ${analytics.totalShortlinks}`);
    console.log(`   Total Clicks: ${analytics.totalClicks}`);
    console.log(`   CTR: ${analytics.avgClicksPerLink.toFixed(1)} clicks/link`);
    
    if (report.bestPick) {
      console.log(`\n🏆 Best Pick: ${report.bestPick.title}`);
      console.log(`   PnL: +${report.bestPick.pnl.toFixed(1)}%`);
      console.log(`   Engagement: ${report.bestPick.engagement} interactions`);
    }
  }
}

// Test the complete pipeline
async function testMiyomiPipeline() {
  console.log('🤖 Testing Complete Miyomi Pipeline\n');
  
  const config: MiyomiConfig = {
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    neynarKey: process.env.NEYNAR_API_KEY,
    signerUuid: process.env.FARCASTER_SIGNER_UUID,
    kalshiKey: process.env.KALSHI_API_KEY,
    baseUrl: 'https://miyomi.vercel.app'
  };
  
  const miyomi = new MiyomiPipeline(config);
  
  try {
    // Run daily pick pipeline
    await miyomi.runDailyPick();
    
    // Show performance stats
    console.log('\n');
    await miyomi.getPerformanceStats();
    
  } catch (error) {
    console.error('Miyomi pipeline test failed:', error);
  }
}

if (require.main === module) {
  testMiyomiPipeline();
}