// Miyomi Agent - Main Entry Point  
import dotenv from 'dotenv';
import { MiyomiPipeline, MiyomiConfig } from './miyomi-pipeline';

// Load environment variables
dotenv.config();

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     🎭 MIYOMI - Data-Driven Content Trader 🎭           ║
║                                                          ║
║     "NYC's Chaos Coordinator of Prediction Markets"      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);

  // Check for required API keys
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.error('❌ Error: ANTHROPIC_API_KEY not found in .env file');
    process.exit(1);
  }

  // Initialize Miyomi pipeline
  const config: MiyomiConfig = {
    anthropicKey,
    neynarKey: process.env.NEYNAR_API_KEY,
    signerUuid: process.env.FARCASTER_SIGNER_UUID,
    kalshiKey: process.env.KALSHI_API_KEY,
    edenKey: process.env.EDEN_API_KEY,
    baseUrl: 'https://miyomi.vercel.app'
  };

  const miyomi = new MiyomiPipeline(config);

  // Handle command line arguments
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'run':
      // Run the daily pick pipeline immediately
      await miyomi.runDailyPick();
      break;
      
    case 'stats':
      // Show performance statistics
      await miyomi.getPerformanceStats();
      break;
      
    case 'test':
      // Run a test pick pipeline
      await miyomi.runDailyPick();
      break;
      
    case 'schedule':
      // TODO: Implement cron scheduler for automated daily picks
      console.log("🎬 Scheduling not yet implemented - use 'run' for manual picks");
      break;
      
    default:
      // Show help
      console.log(`
Usage: npm start [command]

Commands:
  run       - Execute complete data-driven trading pipeline
  test      - Run pipeline test with real market data  
  stats     - Show performance and engagement statistics
  schedule  - Start automated daily scheduler (coming soon)
  
Examples:
  npm start run       # Run daily pick pipeline
  npm start stats     # View performance analytics
  npm start test      # Test pipeline with current markets
      `);
  }
}

// Run the application
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});