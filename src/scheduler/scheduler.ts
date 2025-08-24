// Scheduler for Miyomi's Daily Show
import cron from 'node-cron';
import { MiyomiAgent } from '../core/miyomi-agent';

export class MiyomiScheduler {
  private agent: MiyomiAgent;
  private tasks: cron.ScheduledTask[] = [];

  constructor(agent: MiyomiAgent) {
    this.agent = agent;
  }

  startDailyShow(): void {
    console.log("📅 Starting Miyomi's daily schedule...");
    
    // Main show at 12pm EST every day
    const chicksPick = cron.schedule('0 12 * * *', async () => {
      console.log("🎬 It's showtime! Starting Chick's Pick...");
      const pick = await this.agent.generateDailyPick();
      
      if (pick) {
        console.log("✅ Daily pick generated and posted!");
        console.log(pick.post);
        // Here you would integrate with social media APIs
        // await this.postToSocialMedia(pick.post);
      }
    }, {
      timezone: 'America/New_York'
    });

    // Performance update at 6pm EST
    const performanceUpdate = cron.schedule('0 18 * * *', async () => {
      console.log("📊 Updating performance...");
      await this.agent.updatePickPerformance();
      const update = await this.agent.generatePerformanceUpdate();
      console.log("Performance update:", update);
      // await this.postToSocialMedia(update);
    }, {
      timezone: 'America/New_York'
    });

    // Weekend recap on Sunday at 2pm EST
    const weekendRecap = cron.schedule('0 14 * * 0', async () => {
      console.log("📈 Generating weekly recap...");
      const state = this.agent.getState();
      const winRate = state.winRate || 0;
      
      let recap = `Weekly Chick's Pick Recap 📊\n\n`;
      recap += `Total picks: ${state.pickHistory.filter(p => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return p.timestamp > weekAgo;
      }).length}\n`;
      recap += `Win rate: ${(winRate * 100).toFixed(0)}%\n`;
      
      if (winRate > 0.6) {
        recap += `\nAnother week of being literally always right 💅`;
      } else if (winRate < 0.4) {
        recap += `\nRough week but mercury was in retrograde so doesn't count`;
      } else {
        recap += `\nBalanced week, the market is learning to respect me`;
      }
      
      console.log(recap);
      // await this.postToSocialMedia(recap);
    }, {
      timezone: 'America/New_York'
    });

    this.tasks.push(chicksPick, performanceUpdate, weekendRecap);
    
    // Start all tasks
    this.tasks.forEach(task => task.start());
    
    console.log("✅ Scheduler started with the following tasks:");
    console.log("  - Daily Chick's Pick at 12pm EST");
    console.log("  - Performance Update at 6pm EST");
    console.log("  - Weekly Recap on Sundays at 2pm EST");
  }

  stop(): void {
    console.log("🛑 Stopping scheduler...");
    this.tasks.forEach(task => task.stop());
    this.tasks = [];
  }

  // Run the daily pick immediately (for testing)
  async runNow(): Promise<void> {
    console.log("🚀 Running Chick's Pick immediately...");
    const pick = await this.agent.generateDailyPick();
    
    if (pick) {
      console.log("\n" + "═".repeat(60));
      console.log("📱 CHICK'S PICK");
      console.log("═".repeat(60));
      console.log(pick.post);
      console.log("═".repeat(60));
      console.log(`\nMarket: ${pick.marketQuestion}`);
      console.log(`Position: ${pick.position}`);
      console.log(`Consensus: ${(pick.consensusPrice * 100).toFixed(0)}%`);
      console.log(`Miyomi's Target: ${(pick.miyomiPrice * 100).toFixed(0)}%`);
    } else {
      console.log("No suitable markets found for today's pick");
    }
  }

  // Run performance update immediately
  async updateNow(): Promise<void> {
    console.log("📊 Running performance update...");
    await this.agent.updatePickPerformance();
    const update = await this.agent.generatePerformanceUpdate();
    console.log("\n" + "═".repeat(60));
    console.log("📈 PERFORMANCE UPDATE");
    console.log("═".repeat(60));
    console.log(update);
    console.log("═".repeat(60));
  }
}