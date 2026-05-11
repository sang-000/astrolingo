// controllers/mongoNewsController.js
// Enhanced news controller for MongoDB integration with AI simplification

const NewsArticle = require('../models/NewsArticle');
const cronService = require('../services/cronService');
const newsFetchingService = require('../services/newsFetchingService');
const simplificationService = require('../services/simplificationService');

class MongoNewsController {
  // Get all news articles (for /news page)
  async getAllNews(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const source = req.query.source;
      
      // Build query
      const query = { isActive: true };
      if (source && source !== 'all') {
        query.source = source;
      }

      // Get articles with pagination
      const articles = await NewsArticle.find(query)
        .sort({ publishedAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('title url image publishedAt description source simplificationStatus hasSimplification ageInHours')
        .lean();

      // Get total count for pagination
      const totalCount = await NewsArticle.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);

      // Add computed fields
      const enhancedArticles = articles.map(article => ({
        ...article,
        id: article._id,
        hasSimplification: !!(article.childContent && article.studentContent && article.researcherContent),
        ageInHours: Math.floor((Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60))
      }));

      res.json({
        success: true,
        articles: enhancedArticles,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: source || 'all',
          cacheStatus: 'DATABASE'
        }
      });
    } catch (error) {
      console.error('❌ Error in getAllNews:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch news articles',
        message: error.message
      });
    }
  }

  // Get single article with full content
  async getArticleById(req, res) {
    try {
      const { id } = req.params;
      
      const article = await NewsArticle.findById(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Article not found'
        });
      }

      // Convert to object and add computed fields
      const articleData = article.toObject();
      articleData.id = articleData._id;
      articleData.hasSimplification = article.hasSimplification;
      articleData.ageInHours = article.ageInHours;

      res.json({
        success: true,
        article: articleData
      });
    } catch (error) {
      console.error('❌ Error in getArticleById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch article',
        message: error.message
      });
    }
  }

  // Get simplified content for specific level
  async getSimplifiedContent(req, res) {
    try {
      const { id } = req.params;
      const { level } = req.query;

      if (!['child', 'student', 'researcher'].includes(level)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid level. Must be: child, student, or researcher'
        });
      }

      const article = await NewsArticle.findById(id);
      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Article not found'
        });
      }

      const simplifiedContent = article.getSimplifiedContent(level);
      const hasSimplification = article.hasSimplification;

      res.json({
        success: true,
        level,
        content: simplifiedContent,
        hasSimplification,
        simplificationStatus: article.simplificationStatus,
        simplificationProvider: article.simplificationProvider
      });
    } catch (error) {
      console.error('❌ Error in getSimplifiedContent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get simplified content',
        message: error.message
      });
    }
  }

  // Manual trigger for news fetching (admin only)
  async triggerNewsFetch(req, res) {
    try {
      console.log('🔧 Manual news fetch triggered');
      
      // Run in background
      cronService.triggerManual().catch(error => {
        console.error('❌ Manual trigger failed:', error);
      });

      res.json({
        success: true,
        message: 'News fetch triggered successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in triggerNewsFetch:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger news fetch',
        message: error.message
      });
    }
  }

  // Get cron job status
  async getCronStatus(req, res) {
    try {
      const status = cronService.getStatus();
      const fetchStats = newsFetchingService.getStats();
      const simplificationStats = simplificationService.getStats();

      res.json({
        success: true,
        cronStatus: status,
        fetchStats,
        simplificationStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in getCronStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get cron status',
        message: error.message
      });
    }
  }

  // Get news sources and statistics
  async getNewsSources(req, res) {
    try {
      const sources = await NewsArticle.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 },
            latestArticle: { $max: '$publishedAt' },
            simplifiedCount: {
              $sum: {
                $cond: [
                  { $eq: ['$simplificationStatus', 'completed'] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const totalArticles = await NewsArticle.countDocuments({ isActive: true });
      const simplifiedArticles = await NewsArticle.countDocuments({ 
        isActive: true, 
        simplificationStatus: 'completed' 
      });

      res.json({
        success: true,
        sources,
        statistics: {
          totalArticles,
          simplifiedArticles,
          simplificationRate: totalArticles > 0 ? Math.round((simplifiedArticles / totalArticles) * 100) : 0
        }
      });
    } catch (error) {
      console.error('❌ Error in getNewsSources:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get news sources',
        message: error.message
      });
    }
  }

  // Search articles
  async searchArticles(req, res) {
    try {
      const { q, source, limit = 20 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters'
        });
      }

      const query = {
        isActive: true,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ]
      };

      if (source && source !== 'all') {
        query.source = source;
      }

      const articles = await NewsArticle.find(query)
        .sort({ publishedAt: -1 })
        .limit(parseInt(limit))
        .select('title url image publishedAt description source simplificationStatus')
        .lean();

      res.json({
        success: true,
        query: q,
        results: articles.length,
        articles: articles.map(article => ({
          ...article,
          id: article._id,
          hasSimplification: !!(article.childContent && article.studentContent && article.researcherContent)
        }))
      });
    } catch (error) {
      console.error('❌ Error in searchArticles:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
        message: error.message
      });
    }
  }
}

module.exports = new MongoNewsController();
