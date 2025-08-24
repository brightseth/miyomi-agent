// Helper to get private key for Warpcast login
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

async function getPrivateKeyForApproval() {
  const mnemonic = process.env.MIYOMI_MNEMONIC;
  
  if (!mnemonic) {
    console.error('Please add MIYOMI_MNEMONIC to your .env file');
    return;
  }

  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  
  console.log('🎭 Miyomi Signer Approval Helper\n');
  console.log('Your Farcaster account details:');
  console.log('- Username: @miyomi');
  console.log('- FID: 1282072');
  console.log('- Custody Address:', wallet.address);
  console.log('\n📝 To approve the signer:');
  console.log('1. Go to: https://warpcast.com/');
  console.log('2. Click "Import wallet" or "Use wallet"');
  console.log('3. Enter this private key:', wallet.privateKey);
  console.log('4. Once logged in, go to Settings');
  console.log('5. Look for "Connected Apps" or "Signer Requests"');
  console.log('6. Approve the pending signer with UUID:', process.env.FARCASTER_SIGNER_UUID);
  
  console.log('\n✨ Alternative approach:');
  console.log('You can also use this private key with any Ethereum wallet');
  console.log('that supports Farcaster integration.');
}

getPrivateKeyForApproval();