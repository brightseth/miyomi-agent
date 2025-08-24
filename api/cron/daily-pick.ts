// Vercel Cron Job - Daily Pick at 12pm EST
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MiyomiAgent } from '../../src/core/miyomi-agent';
import { SupabaseManager } from '../../src/state/supabase-manager';

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

    // Initialize Miyomi
    const miyomi = new MiyomiAgent(apiKey);
    const supabase = new SupabaseManager();

    // Generate pick
    const pick = await miyomi.generateDailyPick();
    
    if (pick) {
      // Save to Supabase if configured
      await supabase.savePick(pick);
      
      // TODO: Post to social media
      // await postToTwitter(pick.post);
      // await postToFarcaster(pick.post);
      
      return res.status(200).json({
        success: true,
        pick: {
          market: pick.marketQuestion,
          position: pick.position,
          post: pick.post
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