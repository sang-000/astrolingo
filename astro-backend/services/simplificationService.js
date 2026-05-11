// services/simplificationService.js
// AI simplification service with Google Gemini

const { GoogleGenAI } = require('@google/genai');
const NewsArticle = require('../models/NewsArticle');

class SimplificationService {
  constructor() {
    // Initialize Gemini
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Simplification prompts for different levels
    this.prompts = {
      child: `Rewrite the following space news article for an 8-year-old child. Use very simple words, short sentences, and make it exciting and fun to read. Avoid technical jargon. Focus on the amazing discoveries and adventures in space. Keep it under 150 words. Article text:\n\n`,
      
      student: `Summarize and simplify the following space news article for a high school student. Use clear language, explain scientific concepts simply, and maintain educational value. Keep it informative but accessible. Include key facts and discoveries. Keep it under 300 words. Article text:\n\n`,
      
      researcher: `Provide a clear, detailed summary of the following space news article for researchers and professionals. Maintain all technical details, scientific accuracy, and professional terminology. Include all data, measurements, and technical specifications mentioned. Article text:\n\n`
    };

    this.stats = {
      processed: 0,
      successful: 0,
      failed: 0,
      geminiSuccess: 0,
      fallbackUsed: 0
    };
  }

  // Main method to simplify all pending articles
  async simplifyPendingArticles() {
    console.log('🧠 Starting AI simplification process...');
    const startTime = Date.now();

    try {
      const pendingArticles = await NewsArticle.findPendingSimplification();
      console.log(`📝 Found ${pendingArticles.length} articles needing simplification`);

      if (pendingArticles.length === 0) {
        return { success: true, message: 'No articles need simplification' };
      }

      // Process articles in batches of 5 to avoid overwhelming APIs
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < pendingArticles.length; i += batchSize) {
        batches.push(pendingArticles.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.all(batch.map(article => this.simplifyArticle(article)));
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`✅ Simplification complete in ${Date.now() - startTime}ms`);
      console.log(`📊 Stats: ${this.stats.successful}/${this.stats.processed} successful`);
      console.log(`🤖 Gemini: ${this.stats.geminiSuccess}`);

      return {
        success: true,
        stats: this.stats,
        duration: Date.now() - startTime
      };
    } catch (error) {
      console.error('❌ Error in simplifyPendingArticles:', error);
      return { success: false, error: error.message };
    }
  }

  // Simplify a single article
  async simplifyArticle(article) {
    console.log(`🔄 Processing: "${article.title.substring(0, 50)}..."`);
    this.stats.processed++;

    try {
      // Update status to processing
      article.simplificationStatus = 'processing';
      await article.save();

      const textToSimplify = article.content || article.description || article.title;
      
      // Try to simplify with all three levels
      const [childContent, studentContent, researcherContent] = await Promise.all([
        this.simplifyText(textToSimplify, 'child'),
        this.simplifyText(textToSimplify, 'student'),
        this.simplifyText(textToSimplify, 'researcher')
      ]);

      // Update article with simplified content
      article.childContent = childContent;
      article.studentContent = studentContent;
      article.researcherContent = researcherContent;
      article.simplificationStatus = 'completed';
      article.simplificationError = null;

      await article.save();
      this.stats.successful++;
      
      console.log(`✅ Simplified: "${article.title.substring(0, 30)}..."`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to simplify "${article.title.substring(0, 30)}...":`, error.message);
      
      // Update article with error status
      article.simplificationStatus = 'failed';
      article.simplificationError = error.message;
      await article.save();
      
      this.stats.failed++;
      return false;
    }
  }

  // Simplify text using Gemini
  async simplifyText(text, level) {
    if (!text || text.trim().length < 10) {
      return this.getFallbackText(text, level);
    }

    try {
      const simplified = await this.simplifyWithGemini(text, level);
      if (simplified && simplified.length > 20) {
        this.stats.geminiSuccess++;
        return simplified;
      }
    } catch (error) {
      console.warn(`⚠️ Gemini failed for ${level}:`, error.message);
    }

    // Final fallback
    this.stats.fallbackUsed++;
    return this.getFallbackText(text, level);
  }

  // Simplify using Gemini
  async simplifyWithGemini(text, level) {
    const cleanText = text.replace(/\\s+/g, ' ').trim();
    const maxInputLength = 4000; // Gemini can handle more tokens
    const inputText = cleanText.length > maxInputLength ? 
      cleanText.substring(0, maxInputLength) + '...' : cleanText;

    const prompt = this.prompts[level] + inputText;

    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.7,
        }
    });

    if (response && response.text) {
        return response.text.trim();
    }

    throw new Error('Gemini API returned no valid response');
  }

  // Get fallback text when all AI methods fail
  getFallbackText(text, level) {
    const cleanText = text.replace(/[^\\w\\s.,!?]/g, '').trim();
    
    switch (level) {
      case 'child':
        return cleanText.substring(0, 200) + '... 🚀 (This is about space exploration and discoveries!)';
      case 'student':
        return cleanText.substring(0, 400) + '... 🔬 (Learn more about space science and technology!)';
      case 'researcher':
        return cleanText + ' 📊 (Full technical details preserved for research purposes)';
      default:
        return cleanText;
    }
  }

  // Get simplification statistics
  getStats() {
    return this.stats;
  }

  // Reset statistics
  resetStats() {
    this.stats = {
      processed: 0,
      successful: 0,
      failed: 0,
      geminiSuccess: 0,
      fallbackUsed: 0
    };
  }
}

module.exports = new SimplificationService();
