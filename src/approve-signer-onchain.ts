// Approve signer directly on-chain using custody wallet
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

async function approveSignerOnchain() {
  const mnemonic = process.env.MIYOMI_MNEMONIC;
  const signerUuid = process.env.FARCASTER_SIGNER_UUID;
  
  if (!mnemonic || !signerUuid) {
    console.error('Please add MIYOMI_MNEMONIC and FARCASTER_SIGNER_UUID to your .env file');
    return;
  }

  try {
    // Derive the custody wallet
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    console.log('✅ Custody wallet loaded:', wallet.address);
    
    // First, get the signer details to get the public key
    console.log('Getting signer details...');
    const signerResponse = await axios.get(
      `https://api.neynar.com/v2/farcaster/signer?signer_uuid=${signerUuid}`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || ''
        }
      }
    );
    
    console.log('Current signer status:', signerResponse.data.status);
    const signerPublicKey = signerResponse.data.public_key;
    
    if (signerResponse.data.status === 'approved') {
      console.log('✅ Signer already approved!');
      return;
    }
    
    console.log('Signer public key:', signerPublicKey);
    
    // Create the signature for signer approval
    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const fid = 1282072; // Miyomi's FID
    
    // The message format for Farcaster signer approval
    const message = `${fid}:${signerPublicKey}:${deadline}`;
    
    console.log('Signing message:', message);
    const signature = await wallet.signMessage(message);
    console.log('✅ Message signed');
    
    // Register the signed key with Neynar
    console.log('Registering signed key...');
    const registerResponse = await axios.post(
      'https://api.neynar.com/v2/farcaster/signer/signed_key',
      {
        signer_uuid: signerUuid,
        app_fid: fid,
        deadline: deadline,
        signature: signature
      },
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Signed key registered!');
    console.log('Response:', registerResponse.data);
    
    if (registerResponse.data.approval_url) {
      console.log('\n📱 Complete approval by visiting:');
      console.log(registerResponse.data.approval_url);
      console.log('\nOr we can try to complete it programmatically...');
    }
    
    // Check if it's now approved
    setTimeout(async () => {
      const checkResponse = await axios.get(
        `https://api.neynar.com/v2/farcaster/signer?signer_uuid=${signerUuid}`,
        {
          headers: {
            'api_key': process.env.NEYNAR_API_KEY || ''
          }
        }
      );
      console.log('Final signer status:', checkResponse.data.status);
    }, 2000);
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

approveSignerOnchain();