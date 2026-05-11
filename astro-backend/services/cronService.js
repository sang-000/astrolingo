// services/cronService.js
// Automated cron job service for fetching and simplifying news

const cron = require('node-cron');
const newsFetchingService = require('./newsFetchingService');
const simplificationService = require('./simplificationService');
const apodService = require('./apodService');

class CronService {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.runCount = 0;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalArticlesFetched: 0,
      totalArticlesSimplified: 0,
      totalAPODProcessed: 0
    };
  }

  // Start the cron job (every 3 hours)
  start() {
    console.log('🕒 Starting comprehensive cron job service...');
    
    // Run every 3 hours: 0 */3 * * *
    // For testing, you can use '*/5 * * * *' (every 5 minutes)
    this.cronJob = cron.schedule('0 */3 * * *', async () => {
      await this.runComprehensiveUpdate();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    // Daily APOD update at 6 AM
    this.apodCronJob = cron.schedule('0 6 * * *', async () => {
      await this.runAPODUpdate();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    // Calculate next run time
    this.updateNextRunTime();
    
    console.log('✅ Cron jobs scheduled:');
    console.log('   - News & Simplification: every 3 hours');
    console.log('   - APOD Update: daily at 6 AM');
    console.log(`⏰ Next run: ${this.nextRun}`);

    // Run immediately on startup (optional)
    setTimeout(() => {
      console.log('🚀 Running initial news fetch...');
      this.runNewsUpdate();
    }, 5000);

    return this;
  }

  // Stop the cron jobs
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏹️ News cron job stopped');
    }
    if (this.apodCronJob) {
      this.apodCronJob.stop();
      console.log('⏹️ APOD cron job stopped');
    }
  }

  // Comprehensive update (news + APOD)
  async runComprehensiveUpdate() {
    console.log('\n🔄 === COMPREHENSIVE UPDATE STARTED ===');
    
    // Run news update
    await this.runNewsUpdate();
    
    // Run APOD update
    await this.runAPODUpdate();
    
    console.log('✅ === COMPREHENSIVE UPDATE COMPLETED ===\n');
  }

  // APOD-specific update
  async runAPODUpdate() {
    console.log('\n🌌 === APOD UPDATE STARTED ===');
    const startTime = Date.now();

    try {
      const apodResult = await apodService.fetchAndProcessAPOD(15);
      
      if (apodResult.success) {
        this.stats.totalAPODProcessed += apodResult.stats?.processed || 0;
        console.log(`✅ APOD Update completed: ${apodResult.stats?.processed || 0} processed`);
      } else {
        console.warn(`⚠️ APOD Update had issues: ${apodResult.error}`);
      }

      const duration = Date.now() - startTime;
      console.log(`⏱️ APOD Update duration: ${Math.round(duration / 1000)}s`);
    } catch (error) {
      console.error('❌ APOD Update failed:', error);
    }
    
    console.log('=== APOD UPDATE COMPLETED ===\n');
  }

  // Main news update execution
  async runNewsUpdate() {
    if (this.isRunning) {
      console.log('⚠️ News update already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();
    this.runCount++;
    this.stats.totalRuns++;

    console.log(`\n🔄 === NEWS UPDATE #${this.runCount} STARTED ===`);
    console.log(`⏰ Started at: ${this.lastRun.toLocaleString()}`);

    const startTime = Date.now();

    try {
      // Step 1: Fetch new articles
      console.log('\n📡 Phase 1: Fetching news from all sources...');
      const fetchResult = await newsFetchingService.fetchAllNews();
      
      if (!fetchResult.success) {
        throw new Error(`News fetching failed: ${fetchResult.error}`);
      }

      this.stats.totalArticlesFetched += fetchResult.stats.newArticles;
      console.log(`✅ Fetched ${fetchResult.stats.newArticles} new articles`);

      // Step 2: Simplify articles
      console.log('\n🧠 Phase 2: AI simplification process...');
      const simplificationResult = await simplificationService.simplifyPendingArticles();
      
      if (simplificationResult.success) {
        this.stats.totalArticlesSimplified += simplificationResult.stats?.successful || 0;
        console.log(`✅ Simplified ${simplificationResult.stats?.successful || 0} articles`);
      } else {
        console.warn(`⚠️ Simplification had issues: ${simplificationResult.error}`);
      }

      // Step 3: Cleanup old articles (optional)
      console.log('\n🧹 Phase 3: Cleanup...');
      await newsFetchingService.cleanOldArticles();

      this.stats.successfulRuns++;
      const duration = Date.now() - startTime;
      
      console.log(`\n✅ === NEWS UPDATE #${this.runCount} COMPLETED ===`);
      console.log(`⏱️ Duration: ${Math.round(duration / 1000)}s`);
      console.log(`📊 New articles: ${fetchResult.stats.newArticles}`);
      console.log(`🧠 Simplified: ${simplificationResult.stats?.successful || 0}`);
      console.log(`⏰ Next run: ${this.getNextRunTime()}`);

    } catch (error) {
      this.stats.failedRuns++;
      console.error(`\n❌ === NEWS UPDATE #${this.runCount} FAILED ===`);
      console.error(`Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } finally {
      this.isRunning = false;
      this.updateNextRunTime();
    }
  }

  // Update next run time calculation
  updateNextRunTime() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(next.getHours() + 3);
    next.setMinutes(0);
    next.setSeconds(0);
    next.setMilliseconds(0);
    this.nextRun = next;
  }

  // Get next run time
  getNextRunTime() {
    return this.nextRun ? this.nextRun.toLocaleString() : 'Not scheduled';
  }

  // Get cron job status
  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.cronJob ? this.cronJob.getStatus() : false,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      runCount: this.runCount,
      stats: this.stats
    };
  }

  // Manual trigger (for testing)
  async triggerManual() {
    console.log('🔧 Manual trigger requested...');
    await this.runNewsUpdate();
  }

  // Get comprehensive stats
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      runCount: this.runCount,
      uptime: this.lastRun ? Date.now() - this.lastRun.getTime() : 0
    };
  }
}

module.exports = new CronService();
