// services/newsFetchingService.js
// Service to fetch news from multiple space news APIs

const Parser = require('rss-parser');
const axios = require('axios');
const sanitizeHtml = require('sanitize-html');
const NewsArticle = require('../models/NewsArticle');

// Configure RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'fullContent'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['description', 'description']
    ]
  }
});

// News source configurations
const NEWS_SOURCES = {
  NASA_RSS: {
    url: 'https://www.nasa.gov/news-release/feed/',
    name: 'NASA',
    type: 'rss'
  },
  SPACEFLIGHT_API: {
    url: 'https://api.spaceflightnewsapi.net/v4/articles',
    name: 'Spaceflight News',
    type: 'api'
  },
  UNIVERSE_TODAY: {
    url: 'https://www.universetoday.com/feed/',
    name: 'Universe Today',
    type: 'rss'
  },
  ESA_NEWS: {
    url: 'https://www.esa.int/rssfeed/Our_Activities',
    name: 'ESA',
    type: 'rss'
  }
};

class NewsFetchingService {
  constructor() {
    this.fetchStats = {
      totalFetched: 0,
      newArticles: 0,
      duplicates: 0,
      errors: 0,
      lastRun: null
    };
  }

  // Main method to fetch all news
  async fetchAllNews() {
    console.log('🚀 Starting comprehensive news fetch...');
    const startTime = Date.now();
    
    this.fetchStats = {
      totalFetched: 0,
      newArticles: 0,
      duplicates: 0,
      errors: 0,
      lastRun: new Date()
    };

    const fetchPromises = Object.entries(NEWS_SOURCES).map(([key, source]) => 
      this.fetchFromSource(source).catch(error => {
        console.error(`❌ Error fetching from ${source.name}:`, error.message);
        this.fetchStats.errors++;
        return [];
      })
    );

    try {
      const results = await Promise.all(fetchPromises);
      const allArticles = results.flat();
      
      console.log(`📊 Fetch Summary:`);
      console.log(`   Total fetched: ${this.fetchStats.totalFetched}`);
      console.log(`   New articles: ${this.fetchStats.newArticles}`);
      console.log(`   Duplicates skipped: ${this.fetchStats.duplicates}`);
      console.log(`   Errors: ${this.fetchStats.errors}`);
      console.log(`   Duration: ${Date.now() - startTime}ms`);

      return {
        success: true,
        stats: this.fetchStats,
        articles: allArticles
      };
    } catch (error) {
      console.error('❌ Critical error in fetchAllNews:', error);
      return {
        success: false,
        error: error.message,
        stats: this.fetchStats
      };
    }
  }

  // Fetch from a single source
  async fetchFromSource(source) {
    console.log(`📡 Fetching from ${source.name}...`);
    
    try {
      let articles = [];
      
      if (source.type === 'rss') {
        articles = await this.fetchFromRSS(source);
      } else if (source.type === 'api') {
        articles = await this.fetchFromAPI(source);
      }

      // Process and save articles
      const savedArticles = [];
      for (const article of articles) {
        try {
          const saved = await this.saveArticleIfNew(article);
          if (saved) {
            savedArticles.push(saved);
          }
        } catch (error) {
          console.error(`❌ Error saving article "${article.title}":`, error.message);
          this.fetchStats.errors++;
        }
      }

      console.log(`✅ ${source.name}: ${savedArticles.length} new articles saved`);
      return savedArticles;
    } catch (error) {
      console.error(`❌ Error fetching from ${source.name}:`, error);
      throw error;
    }
  }

  // Fetch from RSS feed
  async fetchFromRSS(source) {
    const feed = await parser.parseURL(source.url);
    this.fetchStats.totalFetched += feed.items.length;

    return feed.items.map(item => {
      // Extract content
      let content = item.fullContent || 
                   item['content:encoded'] || 
                   item.content || 
                   item.description || 
                   item.summary || 
                   '';
      
      // Clean HTML
      content = sanitizeHtml(content, {
        allowedTags: [],
        allowedAttributes: {}
      });

      // Extract image
      let image = null;
      if (item.mediaContent?.url) image = item.mediaContent.url;
      else if (item.mediaThumbnail?.url) image = item.mediaThumbnail.url;
      else if (item.enclosure?.url) image = item.enclosure.url;
      else {
        // Try to extract image from content
        const imgMatch = (item.content || item.description || '').match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) image = imgMatch[1];
      }

      return {
        title: item.title?.trim() || 'Untitled',
        url: item.link?.trim() || item.guid?.trim(),
        image: image || 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop',
        publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
        content: content.trim() || item.title || 'No content available',
        description: sanitizeHtml(item.description || item.summary || '', {
          allowedTags: [],
          allowedAttributes: {}
        }).substring(0, 500),
        source: source.name,
        sourceUrl: source.url
      };
    });
  }

  // Fetch from Spaceflight News API
  async fetchFromAPI(source) {
    const response = await axios.get(source.url, {
      params: {
        limit: 50,
        ordering: '-published_at'
      },
      timeout: 15000
    });

    this.fetchStats.totalFetched += response.data.results.length;

    return response.data.results.map(item => ({
      title: item.title?.trim() || 'Untitled',
      url: item.url?.trim(),
      image: item.image_url || 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop',
      publishedAt: new Date(item.published_at),
      content: item.summary?.trim() || item.title || 'No content available',
      description: item.summary?.substring(0, 500) || '',
      source: source.name,
      sourceUrl: source.url
    }));
  }

  // Save article if it's new (not duplicate)
  async saveArticleIfNew(articleData) {
    if (!articleData.url || !articleData.title) {
      console.warn('⚠️ Skipping article with missing URL or title');
      return null;
    }

    // Check if article already exists
    const exists = await NewsArticle.articleExists(articleData.url, articleData.title);
    if (exists) {
      this.fetchStats.duplicates++;
      return null;
    }

    // Create and save new article
    const article = new NewsArticle({
      ...articleData,
      simplificationStatus: 'pending'
    });

    await article.save();
    this.fetchStats.newArticles++;
    
    console.log(`💾 Saved: "${article.title.substring(0, 50)}..."`);
    return article;
  }

  // Get fetch statistics
  getStats() {
    return this.fetchStats;
  }

  // Clean old articles (optional - keep last 1000 articles)
  async cleanOldArticles() {
    try {
      const totalCount = await NewsArticle.countDocuments();
      if (totalCount > 1000) {
        const articlesToDelete = await NewsArticle.find({})
          .sort({ publishedAt: 1 })
          .limit(totalCount - 1000)
          .select('_id');
        
        const deleteIds = articlesToDelete.map(a => a._id);
        await NewsArticle.deleteMany({ _id: { $in: deleteIds } });
        
        console.log(`🧹 Cleaned ${deleteIds.length} old articles`);
      }
    } catch (error) {
      console.error('❌ Error cleaning old articles:', error);
    }
  }
}

module.exports = new NewsFetchingService();
