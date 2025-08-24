// Post to Farcaster using Miyomi's mnemonic
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

async function postWithMnemonic(text: string) {
  const mnemonic = process.env.MIYOMI_MNEMONIC;
  
  if (!mnemonic) {
    console.error('Please add MIYOMI_MNEMONIC to your .env file');
    console.log('Format: MIYOMI_MNEMONIC="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"');
    return;
  }

  try {
    // Derive the wallet from mnemonic
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    console.log('✅ Wallet derived from mnemonic');
    console.log('Address:', wallet.address);
    console.log('Public Key:', wallet.publicKey);
    
    // Create a new signer with Neynar
    console.log('Creating new signer...');
    const signerResponse = await axios.post(
      'https://api.neynar.com/v2/farcaster/signer',
      {},
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ New signer created:', signerResponse.data.signer_uuid);
    const signerUuid = signerResponse.data.signer_uuid;
    
    // The signer needs to be approved by signing in with the account
    // For now, let's try our existing approved signer
    console.log('Trying with existing signer...');
    const castResponse = await axios.post(
      'https://api.neynar.com/v2/farcaster/cast',
      {
        signer_uuid: '0e8ac9b8-3372-4903-8328-c3659befadae',
        text: text
      },
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Posted!', castResponse.data);
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
    
    // If that fails, let's try the Hub SDK approach
    console.log('\nTrying Hub SDK approach...');
    await tryHubSDK(text, wallet);
  }
}

async function tryHubSDK(text: string, wallet: ethers.Wallet) {
  try {
    // We'll implement Hub SDK posting next if needed
    console.log('Hub SDK approach would go here');
    console.log('Your wallet address is:', wallet.address);
    console.log('This address needs to be associated with Miyomi\'s Farcaster account');
    
  } catch (error) {
    console.error('Hub SDK failed:', error);
  }
}

// Test post
const testMessage = `🎭 testing testing... miyomi's first automated cast

daily contrarian picks starting soon

the market consensus is about to learn what chaos means 💅`;

postWithMnemonic(testMessage);