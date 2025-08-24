// Direct Hub posting using Miyomi's account
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { 
  getSSLHubRpcClient,
  CastAddBody,
  FarcasterNetwork,
  makeCastAdd,
  NobleEd25519Signer
} from '@farcaster/hub-nodejs';

dotenv.config();

async function postToHub(text: string) {
  const mnemonic = process.env.MIYOMI_MNEMONIC;
  
  if (!mnemonic) {
    console.error('Please add MIYOMI_MNEMONIC to your .env file');
    return;
  }

  try {
    // Derive the wallet from mnemonic
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    console.log('✅ Wallet derived from mnemonic');
    console.log('Address:', wallet.address);
    
    // Create a signer from the private key
    const privateKeyBytes = Buffer.from(wallet.privateKey.slice(2), 'hex');
    const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);
    
    console.log('✅ Ed25519 signer created');
    
    // Connect to Farcaster Hub
    const client = getSSLHubRpcClient('nemes.farcaster.xyz:2283');
    
    console.log('✅ Connected to Farcaster Hub');
    
    // Create cast
    const castBody: CastAddBody = {
      text: text,
      mentions: [],
      mentionsPositions: [],
      embeds: [],
      parentCastId: undefined,
      parentUrl: undefined,
    };
    
    // Make the cast message
    const castAdd = await makeCastAdd(
      castBody,
      { fid: 1282072, network: FarcasterNetwork.MAINNET }, // Miyomi's FID
      ed25519Signer
    );
    
    console.log('✅ Cast message created');
    
    // Submit to hub
    const result = await client.submitMessage(castAdd);
    
    if (result.isOk()) {
      console.log('✅ Cast posted successfully!');
      console.log('Cast hash:', result.value.hash);
    } else {
      console.error('❌ Failed to post cast:', result.error);
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Make sure the wallet address is registered with Miyomi\'s Farcaster account');
    console.log('2. The account might need to be connected as a recovery address');
    console.log('3. Try logging into Warpcast with this wallet first');
  }
}

// Test post
const testMessage = `🎭 miyomi's first direct hub cast

the consensus is wrong (as usual)

time to make some noise 💅`;

postToHub(testMessage);