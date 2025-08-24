// Direct posting using custody address
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

async function postDirect(text: string) {
  const mnemonic = process.env.MIYOMI_MNEMONIC;
  
  if (!mnemonic) {
    console.error('Please add MIYOMI_MNEMONIC to your .env file');
    return;
  }

  try {
    // Derive the wallet from mnemonic (this is Miyomi's custody wallet)
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    console.log('✅ Custody wallet derived');
    console.log('Address:', wallet.address);
    
    // This should match: 0x1da90dc544de3b0cfcab9f430ecc26d7ce57f972
    if (wallet.address.toLowerCase() !== '0x1da90dc544de3b0cfcab9f430ecc26d7ce57f972') {
      console.error('❌ Wallet address mismatch! Expected Miyomi custody address');
      return;
    }
    
    // Create a developer-managed signer for this account
    console.log('Creating developer-managed signer...');
    
    const signerResponse = await axios.post(
      'https://api.neynar.com/v2/farcaster/signer/developer_managed',
      {
        sponsor_fid: 1282072
      },
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Developer signer created:', signerResponse.data.signer_uuid);
    
    // Now try to post using this developer-managed signer
    const castResponse = await axios.post(
      'https://api.neynar.com/v2/farcaster/cast',
      {
        signer_uuid: signerResponse.data.signer_uuid,
        text: text
      },
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Cast posted!', castResponse.data);
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.data?.code === 'SignerNotApproved') {
      console.log('\n📝 The signer needs to be approved by Miyomi\'s account.');
      console.log('Since you have the custody wallet, you can:');
      console.log('1. Go to warpcast.com/~/settings');
      console.log('2. Sign in using the custody wallet private key');
      console.log('3. Approve the pending signer requests');
      
      // Let's also save the private key for manual use
      const wallet = ethers.Wallet.fromMnemonic(process.env.MIYOMI_MNEMONIC!);
      console.log('\nPrivate key for signing in:', wallet.privateKey);
    }
  }
}

// Test post
const testMessage = `🎭 miyomi here, testing direct posting

the market thinks it knows what's coming... 

spoiler: it doesn't 💅`;

postDirect(testMessage);