// Vercel Cron Job - Daily Pick with Farcaster posting
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MiyomiAgent } from '../../src/core/miyomi-agent';
import { SupabaseManager } from '../../src/state/supabase-manager';
import { FarcasterClient } from '../../src/integrations/farcaster';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🎬 Starting Daily Chicks Pick...');
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Initialize services
    const miyomi = new MiyomiAgent(apiKey);
    const supabase = new SupabaseManager();
    const farcaster = new FarcasterClient();

    // Generate pick
    const pick = await miyomi.generateDailyPick();
    
    if (pick) {
      // Save to Supabase if configured
      await supabase.savePick(pick);
      
      // Post to Farcaster
      let farcasterHash = null;
      if (farcaster.isConnected()) {
        const formattedPost = farcaster.formatPickForFarcaster(pick);
        farcasterHash = await farcaster.postCast(formattedPost, 'predictions');
      }
      
      return res.status(200).json({
        success: true,
        pick: {
          market: pick.marketQuestion,
          position: pick.position,
          post: pick.post
        },
        social: {
          farcaster: farcasterHash ? `https://warpcast.com/~/conversations/${farcasterHash}` : null
        }
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'No suitable markets found for today'
      });
    }
  } catch (error) {
    console.error('Error in daily pick cron:', error);
    return res.status(500).json({
      error: 'Failed to generate daily pick',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}