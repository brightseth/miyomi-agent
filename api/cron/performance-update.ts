// Vercel Cron Job - Performance Update at 6pm EST
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MiyomiAgent } from '../../src/core/miyomi-agent';
import { SupabaseManager } from '../../src/state/supabase-manager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('📊 Updating performance...');
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const miyomi = new MiyomiAgent(apiKey);
    const supabase = new SupabaseManager();

    // Update performance
    await miyomi.updatePickPerformance();
    
    // Generate update post
    const update = await miyomi.generatePerformanceUpdate();
    
    // Save updated state
    const state = miyomi.getState();
    await supabase.savePersonalityState(state);
    
    // Update performance in Supabase
    if (state.currentPick && state.currentPick.performance) {
      await supabase.updatePerformance(
        state.currentPick.id,
        state.currentPick.performance
      );
    }
    
    // TODO: Post update to social media
    // await postToTwitter(update);
    
    return res.status(200).json({
      success: true,
      update,
      performance: state.currentPick?.performance
    });
  } catch (error) {
    console.error('Error in performance update cron:', error);
    return res.status(500).json({
      error: 'Failed to update performance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}