// Check signer status and test posting
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function checkSignerStatus() {
  const signerUuid = process.env.FARCASTER_SIGNER_UUID;
  
  if (!signerUuid) {
    console.error('Please add FARCASTER_SIGNER_UUID to your .env file');
    return;
  }

  try {
    // Check signer status
    const signerResponse = await axios.get(
      `https://api.neynar.com/v2/farcaster/signer?signer_uuid=${signerUuid}`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || ''
        }
      }
    );
    
    console.log('🎭 Miyomi Signer Status:', signerResponse.data.status);
    console.log('Signer UUID:', signerUuid);
    
    if (signerResponse.data.status === 'approved') {
      console.log('✅ Signer is APPROVED! Testing posting...');
      
      // Test a cast
      const testResponse = await axios.post(
        'https://api.neynar.com/v2/farcaster/cast',
        {
          signer_uuid: signerUuid,
          text: `🎭 miyomi's first automated cast!

the market consensus thinks they know what's coming...

they don't 💅

time to shake things up with some chaos theory trading`
        },
        {
          headers: {
            'api_key': process.env.NEYNAR_API_KEY || '',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Test cast posted successfully!');
      console.log('Cast hash:', testResponse.data.cast.hash);
      console.log('Cast URL:', `https://warpcast.com/miyomi/${testResponse.data.cast.hash.slice(0, 10)}`);
      
    } else if (signerResponse.data.status === 'pending_approval') {
      console.log('⏳ Signer is pending approval');
      console.log('Please open this URL in your Farcaster client to approve:');
      console.log('https://client.farcaster.xyz/deeplinks/signed-key-request?token=0x7ec7003f9aea7193f8ab76a29213c526a7c40d789b268f5a');
    } else {
      console.log('❌ Signer status:', signerResponse.data.status);
    }
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkSignerStatus();