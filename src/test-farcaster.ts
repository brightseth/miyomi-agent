// Test Farcaster posting for Miyomi
import dotenv from 'dotenv';
import { FarcasterClient } from './integrations/farcaster';

dotenv.config();

async function testFarcaster() {
  console.log('🟣 Testing Farcaster integration...\n');
  
  const farcaster = new FarcasterClient();
  
  if (!farcaster.isConnected()) {
    console.log('❌ Farcaster not configured');
    console.log('Need NEYNAR_API_KEY and FARCASTER_SIGNER_UUID in .env');
    return;
  }
  
  // Test post
  const testPost = `🎭 mic check mic check... is this thing on?

just your local chaos coordinator testing the farcaster vibes

daily contrarian picks starting tomorrow at 12pm EST 💅

the market consensus is about to get humbled`;

  console.log('Posting test cast...');
  const hash = await farcaster.postCast(testPost);
  
  if (hash) {
    console.log('✅ Success! View at:');
    console.log(`https://warpcast.com/~/conversations/${hash}`);
  } else {
    console.log('❌ Failed to post');
  }
}

testFarcaster().catch(console.error);