// Direct Farcaster posting using account credentials
import axios from 'axios';
import * as viem from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export class FarcasterDirectClient {
  private apiKey: string;
  private signerUuid: string;
  private isEnabled: boolean = false;

  constructor() {
    this.apiKey = process.env.NEYNAR_API_KEY || '';
    this.signerUuid = process.env.FARCASTER_SIGNER_UUID || '';
    this.isEnabled = !!(this.apiKey && this.signerUuid);
  }

  async postAsUser(text: string, fid: number = 1282072): Promise<string | null> {
    if (!this.isEnabled) {
      console.log('Farcaster not configured');
      return null;
    }

    try {
      const response = await axios.post(
        'https://api.neynar.com/v2/farcaster/cast',
        {
          signer_uuid: this.signerUuid,
          text: text.substring(0, 320), // Farcaster limit
          channel_id: 'predictions'
        },
        {
          headers: {
            'api_key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Posted to Farcaster');
      return response.data.cast?.hash || null;
    } catch (error: any) {
      console.error('Farcaster posting failed:', error.response?.data || error.message);
      
      if (error.response?.data?.code === 'SignerNotApproved') {
        console.log('\n📝 Signer needs approval. Visit:');
        console.log('https://warpcast.com/~/settings/verified-addresses');
        console.log('Or approve pending signer requests in Warpcast.');
      }
      
      return null;
    }
  }
}