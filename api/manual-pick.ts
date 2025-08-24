// Manual trigger for testing Miyomi's pick generation and posting
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MiyomiAgent } from '../src/core/miyomi-agent';
import { FarcasterClient } from '../src/integrations/farcaster';
import { SupabaseManager } from '../src/state/supabase-manager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple auth check
  const auth = req.headers.authorization;
  if (!auth || !auth.includes(process.env.CRON_SECRET || 'test')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Initialize services
    const miyomi = new MiyomiAgent(apiKey);
    const farcaster = new FarcasterClient();
    const supabase = new SupabaseManager();

    console.log('🎭 Generating Miyomi pick manually...');
    
    // Generate pick
    const pick = await miyomi.generateDailyPick();
    
    if (!pick) {
      return res.status(200).json({
        success: false,
        message: 'No suitable markets found'
      });
    }

    // Save to database
    await supabase.savePick(pick);

    // Post to Farcaster if configured
    let farcasterUrl = null;
    if (farcaster.isConnected()) {
      const hash = await farcaster.postCast(pick.post);
      if (hash) {
        farcasterUrl = `https://warpcast.com/~/conversations/${hash}`;
      }
    }

    return res.status(200).json({
      success: true,
      pick: {
        id: pick.id,
        market: pick.marketQuestion,
        position: pick.position,
        consensus: (pick.consensusPrice * 100).toFixed(0) + '%',
        miyomi: (pick.miyomiPrice * 100).toFixed(0) + '%',
        post: pick.post
      },
      posted: {
        farcaster: farcasterUrl || 'Not configured',
        supabase: supabase.isConnected() ? 'Saved' : 'Not configured'
      }
    });
  } catch (error) {
    console.error('Error generating manual pick:', error);
    return res.status(500).json({
      error: 'Failed to generate pick',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}