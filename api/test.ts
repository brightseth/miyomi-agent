import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_KEY;
  const hasCronSecret = !!process.env.CRON_SECRET;
  
  res.status(200).json({
    status: 'Miyomi is alive! 🎭',
    environment: {
      anthropicKey: hasAnthropicKey ? '✅ Set' : '❌ Missing',
      supabaseUrl: hasSupabaseUrl ? '✅ Set' : '❌ Missing',
      supabaseKey: hasSupabaseKey ? '✅ Set' : '❌ Missing',
      cronSecret: hasCronSecret ? '✅ Set' : '❌ Missing'
    },
    message: 'Daily picks at 12pm EST, performance updates at 6pm EST',
    endpoints: {
      dailyPick: '/api/cron/daily-pick',
      performanceUpdate: '/api/cron/performance-update',
      test: '/api/test'
    }
  });
}