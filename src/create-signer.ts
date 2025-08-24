// Create a Neynar signer for Miyomi
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function createSigner() {
  const apiKey = process.env.NEYNAR_API_KEY;
  
  if (!apiKey) {
    console.error('Need NEYNAR_API_KEY in .env');
    return;
  }

  try {
    console.log('Creating signer for @miyomi...\n');
    
    // Create a signer via Neynar API
    const response = await axios.post(
      'https://api.neynar.com/v2/farcaster/signer',
      {
        name: 'Miyomi Agent',
        // You might need to provide Miyomi's FID (Farcaster ID)
        // Get it from: https://warpcast.com/miyomi
      },
      {
        headers: {
          'api_key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Signer created!');
    console.log('Signer UUID:', response.data.signer_uuid);
    console.log('Status:', response.data.status);
    console.log('\nAdd this to your .env:');
    console.log(`FARCASTER_SIGNER_UUID=${response.data.signer_uuid}`);
    
    if (response.data.approval_url) {
      console.log('\n🔗 Approve the signer in Warpcast:');
      console.log(response.data.approval_url);
    }
    
  } catch (error: any) {
    console.error('Error creating signer:', error.response?.data || error.message);
    console.log('\nYou might need to:');
    console.log('1. Check your API key is correct');
    console.log('2. Use the Neynar dashboard instead');
    console.log('3. Make sure you have the right plan (some features need paid plan)');
  }
}

createSigner();