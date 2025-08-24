// Approve signer using EIP-712 signature
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

async function approveSignerEIP712() {
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
    
    // Get the signer details to get the public key
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
    
    if (signerResponse.data.status === 'approved') {
      console.log('✅ Signer already approved!');
      return;
    }
    
    const signerPublicKey = signerResponse.data.public_key;
    console.log('Signer public key:', signerPublicKey);
    
    // EIP-712 signature parameters
    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const requestFid = 1282072; // Miyomi's FID
    const key = signerPublicKey; // The signer's public key
    
    // EIP-712 Domain
    const domain = {
      name: 'Farcaster SignedKeyRequestValidator',
      version: '1',
      chainId: 10, // Optimism mainnet
      verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553'
    };
    
    // EIP-712 Types
    const types = {
      SignedKeyRequest: [
        { name: 'requestFid', type: 'uint256' },
        { name: 'key', type: 'bytes' },
        { name: 'deadline', type: 'uint256' }
      ]
    };
    
    // Message to sign
    const message = {
      requestFid: requestFid,
      key: key,
      deadline: deadline
    };
    
    console.log('Signing EIP-712 message...');
    console.log('Domain:', domain);
    console.log('Message:', message);
    
    // Sign using EIP-712
    const signature = await wallet._signTypedData(domain, types, message);
    console.log('✅ EIP-712 signature created');
    
    // Register the signed key with Neynar
    console.log('Registering signed key with Neynar...');
    const registerResponse = await axios.post(
      'https://api.neynar.com/v2/farcaster/signer/signed_key',
      {
        signer_uuid: signerUuid,
        app_fid: requestFid,
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
    
    // Check final status
    setTimeout(async () => {
      try {
        const checkResponse = await axios.get(
          `https://api.neynar.com/v2/farcaster/signer?signer_uuid=${signerUuid}`,
          {
            headers: {
              'api_key': process.env.NEYNAR_API_KEY || ''
            }
          }
        );
        console.log('Final signer status:', checkResponse.data.status);
        
        if (checkResponse.data.status === 'approved') {
          console.log('🎭 Miyomi is ready to post on Farcaster!');
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 3000);
    
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
    console.log('\nTroubleshooting:');
    console.log('- Make sure the wallet is the custody address for FID', 1282072);
    console.log('- The EIP-712 signature must be from the account that controls the FID');
  }
}

approveSignerEIP712();