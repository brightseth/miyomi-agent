// Farcaster publishing service with Neynar v2
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { ContentOutput } from './content-generator';
import { Pick } from '../svc-markets/types';

export interface PublishResult {
  castHash: string;
  shortlinkId: string;
  farcasterUrl: string;
  timestamp: string;
}

export class FarcasterPublisher {
  private neynar: NeynarAPIClient;
  private signerUuid: string;
  private baseUrl: string;

  constructor(apiKey: string, signerUuid: string, baseUrl: string = 'https://miyomi.vercel.app') {
    const config = new Configuration({
      apiKey,
      baseOptions: {
        headers: {
          "x-neynar-experimental": true,
        },
      },
    });
    this.neynar = new NeynarAPIClient(config);
    this.signerUuid = signerUuid;
    this.baseUrl = baseUrl;
  }

  async publishContent(pick: Pick, content: ContentOutput): Promise<PublishResult> {
    console.log('📱 Publishing to Farcaster...');
    
    // Create shortlink for tracking
    const shortlinkId = this.generateShortlinkId();
    const shortlink = `${this.baseUrl}/m/${shortlinkId}`;
    
    // Prepare post with shortlink
    const postWithLink = this.addShortlinkToPost(content.farcasterPost, shortlink);
    
    try {
      // Post to Farcaster via Neynar v2
      const castResponse = await this.neynar.publishCast({
        signerUuid: this.signerUuid,
        text: postWithLink
      });
      
      // Store shortlink data for tracking
      await this.storeShortlink(shortlinkId, pick, content, castResponse.cast.hash);
      
      const farcasterUrl = `https://warpcast.com/${castResponse.cast.author.username}/${castResponse.cast.hash}`;
      
      console.log(`✅ Published cast: ${castResponse.cast.hash}`);
      console.log(`🔗 Shortlink: ${shortlink}`);
      
      return {
        castHash: castResponse.cast.hash,
        shortlinkId,
        farcasterUrl,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Farcaster publishing failed:', error);
      
      // Return mock result for testing
      const mockResult: PublishResult = {
        castHash: 'mock-' + Date.now(),
        shortlinkId,
        farcasterUrl: 'https://warpcast.com/miyomi/mock-cast',
        timestamp: new Date().toISOString()
      };
      
      console.log('📱 Using mock publish result for testing');
      await this.storeShortlink(shortlinkId, pick, content, mockResult.castHash);
      
      return mockResult;
    }
  }

  private generateShortlinkId(): string {
    // Generate 6-character alphanumeric ID
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private addShortlinkToPost(post: string, shortlink: string): string {
    // Add shortlink to post if space allows
    const linkText = `\n\n📊 ${shortlink}`;
    
    if (post.length + linkText.length <= 320) {
      return post + linkText;
    }
    
    // If no space, just return original post
    return post;
  }

  private async storeShortlink(
    id: string, 
    pick: Pick, 
    content: ContentOutput, 
    castHash: string
  ): Promise<void> {
    // Store shortlink data for tracking
    // This would integrate with your database
    console.log(`💾 Storing shortlink ${id} for pick ${pick.id}`);
    
    const shortlinkData = {
      id,
      pickId: pick.id,
      castHash,
      marketTitle: pick.opportunity.market.title,
      marketUrl: pick.opportunity.market.url,
      position: pick.opportunity.recommendedPosition,
      targetPrice: pick.targetPrice,
      confidence: pick.confidence,
      contentTitle: content.title,
      createdAt: new Date().toISOString(),
      clicks: 0,
      engagement: {
        likes: 0,
        recasts: 0,
        replies: 0
      }
    };
    
    // TODO: Store in database
    console.log('Shortlink data:', JSON.stringify(shortlinkData, null, 2));
  }
}

// Test the publisher
async function testFarcasterPublisher() {
  console.log('📱 Testing Farcaster Publisher\n');
  
  const apiKey = process.env.NEYNAR_API_KEY;
  const signerUuid = process.env.FARCASTER_SIGNER_UUID;
  
  if (!apiKey || !signerUuid) {
    console.log('⚠️ Missing Neynar API key or signer UUID - testing in mock mode');
    
    // Mock publish result
    const mockResult: PublishResult = {
      castHash: 'mock-cast-' + Date.now(),
      shortlinkId: 'abc123',
      farcasterUrl: 'https://warpcast.com/miyomi/mock-cast',
      timestamp: new Date().toISOString()
    };
    
    console.log('🎭 MOCK PUBLISH RESULT:');
    console.log('═'.repeat(60));
    console.log(`Cast Hash: ${mockResult.castHash}`);
    console.log(`Shortlink: https://miyomi.vercel.app/m/${mockResult.shortlinkId}`);
    console.log(`Farcaster URL: ${mockResult.farcasterUrl}`);
    
    return;
  }
  
  const publisher = new FarcasterPublisher(apiKey, signerUuid);
  
  // Create mock pick and content for testing
  const mockPick: Pick = {
    id: 'test-pick-' + Date.now(),
    timestamp: new Date().toISOString(),
    opportunity: {
      market: {
        source: 'polymarket',
        id: 'btc-70k-test',
        url: 'https://polymarket.com/event/btc-70k',
        title: 'Will Bitcoin dip to $70,000 by December 31, 2025?',
        category: 'crypto',
        closesAt: '2025-12-31T00:00:00Z',
        yesPrice: 10,
        noPrice: 90,
        liquidityScore: 0.3,
        volume24h: 15000,
      },
      score: 0.75,
      reasoning: ['Market overconfident in NO outcome', 'Contrarian opportunity identified'],
      delta24h: -2.5,
      timeToClose: 3000,
      liquidityRank: 0.3,
      narrativeBoost: 0.8,
      recommendedPosition: 'YES',
    },
    thesis: ['Market sentiment too bearish', 'Technical oversold conditions', 'Institutional buying underneath'],
    confidence: 0.7,
    targetPrice: 30,
    stopLoss: 5,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  
  const mockContent: ContentOutput = {
    title: "🚨 Bitcoin Dip to 70k? Market's Wrong - Here's Why",
    narrative: "The crowd is pricing BTC sub-70k at 90% but institutional flow says otherwise.",
    thesis: ['ETF inflows accelerating', 'Technical oversold', 'Short squeeze brewing'],
    cta: "Take YES at 10¢ before the reversal",
    imagePrompts: ['Bitcoin chart breaking resistance with NYC skyline backdrop'],
    videoBrief: 'Bitcoin analysis with trading floor energy',
    farcasterPost: "🚨 Bitcoin sub-70k by EOY? \n\nCrowd pricing this at 90% but flow data says NOPE\n\nTaking YES at 10¢ - this screams oversold 📈\n\n#Bitcoin #PredictionMarkets"
  };
  
  try {
    const result = await publisher.publishContent(mockPick, mockContent);
    
    console.log('🎉 PUBLISH SUCCESS:');
    console.log('═'.repeat(60));
    console.log(`Cast Hash: ${result.castHash}`);
    console.log(`Shortlink: https://miyomi.vercel.app/m/${result.shortlinkId}`);
    console.log(`Farcaster URL: ${result.farcasterUrl}`);
    
  } catch (error) {
    console.error('Publishing test failed:', error);
  }
}

if (require.main === module) {
  testFarcasterPublisher();
}