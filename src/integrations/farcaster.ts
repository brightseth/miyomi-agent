// Farcaster Integration for Miyomi
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

export class FarcasterClient {
  private client: NeynarAPIClient | null = null;
  private signerUuid: string | null = null;
  private isEnabled: boolean = false;

  constructor() {
    const apiKey = process.env.NEYNAR_API_KEY;
    this.signerUuid = process.env.FARCASTER_SIGNER_UUID || null;
    
    if (apiKey && this.signerUuid) {
      this.client = new NeynarAPIClient({ apiKey });
      this.isEnabled = true;
      console.log('🟣 Farcaster connected');
    } else {
      console.log('📝 Farcaster not configured');
    }
  }

  async postCast(text: string, channelId?: string): Promise<string | null> {
    if (!this.isEnabled || !this.client || !this.signerUuid) {
      console.log('Farcaster not enabled, skipping post');
      return null;
    }

    try {
      // Truncate if too long (Farcaster limit is 320 chars)
      const truncatedText = text.length > 320 ? text.substring(0, 317) + '...' : text;
      
      const response = await this.client.publishCast({
        signerUuid: this.signerUuid,
        text: truncatedText,
        channelId: channelId || 'predictions', // Post to predictions channel by default
      });

      console.log('✅ Posted to Farcaster:', response.cast.hash);
      return response.cast.hash;
    } catch (error) {
      console.error('Error posting to Farcaster:', error);
      return null;
    }
  }

  async postThread(posts: string[]): Promise<string[] | null> {
    if (!this.isEnabled || !this.client || !this.signerUuid) {
      return null;
    }

    const hashes: string[] = [];
    let parentHash: string | undefined;

    try {
      for (const post of posts) {
        const truncated = post.length > 320 ? post.substring(0, 317) + '...' : post;
        
        const response = await this.client.publishCast({
          signerUuid: this.signerUuid,
          text: truncated,
          parent: parentHash,
        });

        hashes.push(response.cast.hash);
        parentHash = response.cast.hash;
        
        // Small delay between thread posts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Posted thread with ${hashes.length} casts`);
      return hashes;
    } catch (error) {
      console.error('Error posting thread to Farcaster:', error);
      return null;
    }
  }

  formatPickForFarcaster(pick: any): string {
    // Format Miyomi's pick for Farcaster's character limit
    const position = pick.position === 'YES' ? '✅ YES' : '❌ NO';
    
    // Shorten the post if needed
    let post = pick.post;
    
    // If post is too long, create a shorter version
    if (post.length > 280) {
      post = `🎭 Chick's Pick: ${position}\n\n"${pick.marketQuestion}"\n\nConsensus: ${(pick.consensusPrice * 100).toFixed(0)}%\nMiyomi: ${(pick.miyomiPrice * 100).toFixed(0)}%\n\n${pick.reasoning.substring(0, 100)}...`;
    }

    return post;
  }

  async getUserProfile(username: string) {
    if (!this.client) return null;
    
    try {
      const response = await this.client.lookupUserByUsername({ username });
      return response.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return this.isEnabled;
  }
}

// Helper to set up Farcaster signer (run once to get signer UUID)
export async function setupFarcasterSigner() {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    console.error('Need NEYNAR_API_KEY to set up signer');
    return;
  }

  const client = new NeynarAPIClient({ apiKey });
  
  try {
    // This creates a signer that Miyomi can use to post
    // Note: Creating signers programmatically may require a paid Neynar plan
    // It's often easier to create via the Neynar dashboard
    console.log('To create a signer:');
    console.log('1. Go to https://dev.neynar.com');
    console.log('2. Find the Signers or Managed Signers section');
    console.log('3. Create a new signer for @miyomi');
    console.log('4. Copy the signer_uuid');
  } catch (error) {
    console.error('Error:', error);
  }
}