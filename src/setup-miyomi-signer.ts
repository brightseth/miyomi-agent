// Setup script to connect Miyomi's account
import dotenv from 'dotenv';
import axios from 'axios';
import { ethers } from 'ethers';

dotenv.config();

async function setupMiyomiSigner() {
  console.log('🎭 Miyomi Signer Setup Helper\n');
  console.log('This will help you connect @miyomi to post on Farcaster.\n');
  
  console.log('Choose an option:\n');
  console.log('1. Use Miyomi\'s recovery phrase (if you have it)');
  console.log('2. Create a webhook URL for posting');
  console.log('3. Use a different approach\n');

  // Option 1: Direct key approach
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Option 1: Recovery Phrase Method');
  console.log('─────────────────────────────────────────');
  console.log('If you have Miyomi\'s 12-word recovery phrase:');
  console.log('1. Add to .env: MIYOMI_MNEMONIC="word1 word2 word3..."');
  console.log('2. We can derive the key and post directly\n');

  // Option 2: Webhook approach
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Option 2: Neynar Webhook (Easier!)');
  console.log('─────────────────────────────────────────');
  console.log('1. Go to https://dev.neynar.com');
  console.log('2. Look for "Webhooks" or "Actions" section');
  console.log('3. Create a "Cast Action" webhook');
  console.log('4. Get the webhook URL');
  console.log('5. Add to .env: NEYNAR_WEBHOOK_URL=...\n');

  // Option 3: Manual signer approval
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Option 3: Manual Signer Approval');
  console.log('─────────────────────────────────────────');
  console.log('Your signer UUID: 0e8ac9b8-3372-4903-8328-c3659befadae');
  console.log('\nTo approve it:');
  console.log('1. Install Warpcast on desktop (has more features)');
  console.log('2. Or try: https://warpcast.com/~/settings/verified-addresses');
  console.log('3. Or DM @dwr.eth saying you need help approving a signer\n');

  // Check current signer status
  try {
    const response = await axios.get(
      'https://api.neynar.com/v2/farcaster/signer?signer_uuid=0e8ac9b8-3372-4903-8328-c3659befadae',
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || ''
        }
      }
    );
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Current Signer Status:', response.data.status);
    
    if (response.data.status === 'approved') {
      console.log('✅ Signer is approved! You can post now!');
    } else {
      console.log('⏳ Signer needs approval from @miyomi account');
    }
  } catch (error) {
    console.log('Could not check signer status');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 Recommended: Use Option 2 (Webhook)');
  console.log('It\'s the easiest and doesn\'t require key management');
}

setupMiyomiSigner();