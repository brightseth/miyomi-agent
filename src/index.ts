// Miyomi Agent - Main Entry Point
import dotenv from 'dotenv';
import { MiyomiAgent } from './core/miyomi-agent';
import { MiyomiScheduler } from './scheduler/scheduler';

// Load environment variables
dotenv.config();

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     🎭 MIYOMI - Prediction Market Contrarian Agent 🎭    ║
║                                                          ║
║     "NYC's Chaos Coordinator of Prediction Markets"      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: ANTHROPIC_API_KEY not found in .env file');
    process.exit(1);
  }

  // Initialize Miyomi
  const miyomi = new MiyomiAgent(apiKey);
  const scheduler = new MiyomiScheduler(miyomi);

  // Handle command line arguments
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'run':
      // Run the daily pick immediately
      await scheduler.runNow();
      break;
      
    case 'update':
      // Update performance of current pick
      await scheduler.updateNow();
      break;
      
    case 'schedule':
      // Start the scheduler for automated daily picks
      scheduler.startDailyShow();
      console.log("\n🎬 Miyomi is now live! Daily shows at 12pm EST");
      console.log("Press Ctrl+C to stop\n");
      
      // Keep the process running
      process.on('SIGINT', () => {
        console.log('\n👋 Miyomi signing off...');
        scheduler.stop();
        process.exit(0);
      });
      break;
      
    case 'test':
      // Run a test pick
      await miyomi.testRun();
      break;
      
    case 'stats':
      // Show statistics
      const state = miyomi.getState();
      console.log("\n📊 Miyomi's Stats:");
      console.log("═".repeat(40));
      console.log(`Total Picks: ${state.totalPicks}`);
      console.log(`Win Rate: ${state.winRate ? (state.winRate * 100).toFixed(1) : 0}%`);
      console.log(`Current Vibe: ${state.personality.currentVibe}`);
      console.log(`Mood: ${state.personality.mood}`);
      
      if (state.currentPick) {
        console.log(`\nCurrent Pick:`);
        console.log(`  Market: ${state.currentPick.marketQuestion}`);
        console.log(`  Position: ${state.currentPick.position}`);
        if (state.currentPick.performance) {
          console.log(`  P&L: ${state.currentPick.performance.pnlPercent.toFixed(1)}%`);
          console.log(`  Status: ${state.currentPick.performance.status}`);
        }
      }
      break;
      
    default:
      // Show help
      console.log(`
Usage: npm start [command]

Commands:
  run       - Generate and post today's Chick's Pick immediately
  update    - Update performance of current pick
  schedule  - Start automated daily scheduler (12pm EST)
  test      - Run a test pick without posting
  stats     - Show Miyomi's current statistics
  
Examples:
  npm start run       # Generate today's pick
  npm start schedule  # Start daily automated picks
  npm start stats     # View performance stats
      `);
  }
}

// Run the application
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});