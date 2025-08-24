// Approve signer directly on-chain via Optimism
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

async function approveSignerDirect() {
  const mnemonic = process.env.MIYOMI_MNEMONIC;
  const signerUuid = process.env.FARCASTER_SIGNER_UUID;
  
  if (!mnemonic || !signerUuid) {
    console.error('Please add MIYOMI_MNEMONIC and FARCASTER_SIGNER_UUID to your .env file');
    return;
  }

  try {
    // Connect to Optimism
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.optimism.io');
    const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
    
    console.log('✅ Connected to Optimism');
    console.log('Custody wallet:', wallet.address);
    
    // Get signer info
    const signerResponse = await axios.get(
      `https://api.neynar.com/v2/farcaster/signer?signer_uuid=${signerUuid}`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || ''
        }
      }
    );
    
    console.log('Signer status:', signerResponse.data.status);
    
    if (signerResponse.data.status === 'approved') {
      console.log('✅ Signer already approved!');
      return;
    }
    
    // Farcaster KeyGateway contract on Optimism
    const keyGatewayAddress = '0x00000000fc56947c7e7183f8ca4b62398caadf0b';
    
    // The ABI for the add function
    const keyGatewayABI = [
      'function add(uint32 keyType, bytes calldata key, uint8 metadataType, bytes calldata metadata) external payable'
    ];
    
    const contract = new ethers.Contract(keyGatewayAddress, keyGatewayABI, wallet);
    
    // Parameters for adding the key
    const keyType = 1; // Ed25519 key type
    const publicKey = signerResponse.data.public_key;
    const metadataType = 1; // SignedKeyRequestValidator metadata
    
    // We need to construct the metadata properly
    // For now, let's see what the current transaction would cost
    console.log('Estimating gas for key addition...');
    
    try {
      // Just estimate for now - we'd need the proper metadata format
      const estimate = await contract.estimateGas.add(
        keyType,
        publicKey,
        metadataType,
        '0x' // Empty metadata for estimation
      );
      
      console.log('Gas estimate:', estimate.toString());
      
      const gasPrice = await provider.getGasPrice();
      const cost = estimate.mul(gasPrice);
      console.log('Estimated cost:', ethers.utils.formatEther(cost), 'ETH');
      
    } catch (error) {
      console.log('Gas estimation failed (expected without proper metadata)');
    }
    
    console.log('\n🎭 Alternative approach needed:');
    console.log('The signer is in pending_approval status.');
    console.log('This means the signature was accepted by Neynar.');
    console.log('You need to complete the approval using a Farcaster-compatible app.');
    console.log('\nTry:');
    console.log('1. Download a Farcaster mobile client that supports signer approval');
    console.log('2. Import your custody wallet');  
    console.log('3. Approve pending signers in settings');
    console.log('4. Or use the deeplink in a compatible browser/app:');
    console.log('   farcaster://signed-key-request?token=0x7ec7003f9aea7193f8ab76a29213c526a7c40d789b268f5a');
    
    // Meanwhile, let's test if the current signer works for posting
    console.log('\n🧪 Testing current signer for posting...');
    const testResponse = await axios.post(
      'https://api.neynar.com/v2/farcaster/cast',
      {
        signer_uuid: signerUuid,
        text: '🎭 testing miyomi signer approval...'
      },
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Test post successful!', testResponse.data);
    
  } catch (error: any) {
    if (error.response?.data?.code === 'SignerNotApproved') {
      console.log('❌ Signer still needs approval');
      console.log('The signature was valid but the signer needs final approval via app/deeplink');
    } else {
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

approveSignerDirect();