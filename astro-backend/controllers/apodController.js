// controllers/apodController.js
// Controller for NASA APOD (Astronomy Picture of the Day) endpoints

const apodService = require('../services/apodService');
const APOD = require('../models/APOD');

class APODController {
  // Get recent APOD entries for gallery
  async getAPODGallery(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 15;
      const result = await apodService.getRecentAPOD(limit);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      // Sort to ensure today's image is first
      const sortedData = result.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      res.json({
        success: true,
        data: sortedData,
        count: result.count,
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'NASA APOD API',
          cacheStatus: 'DATABASE'
        }
      });
    } catch (error) {
      console.error('❌ Error in getAPODGallery:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch APOD gallery',
        message: error.message
      });
    }
  }

  // Get today's APOD
  async getTodaysAPOD(req, res) {
    try {
      const result = await apodService.getTodaysAPOD();
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error || 'Today\'s APOD not available'
        });
      }

      res.json({
        success: true,
        data: result.data,
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'NASA APOD API'
        }
      });
    } catch (error) {
      console.error('❌ Error in getTodaysAPOD:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch today\'s APOD',
        message: error.message
      });
    }
  }

  // Get APOD by specific date
  async getAPODByDate(req, res) {
    try {
      const { date } = req.params;
      
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      const apod = await APOD.findOne({ date: date, isActive: true });
      
      if (!apod) {
        return res.status(404).json({
          success: false,
          error: 'APOD not found for the specified date'
        });
      }

      res.json({
        success: true,
        data: apod
      });
    } catch (error) {
      console.error('❌ Error in getAPODByDate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch APOD by date',
        message: error.message
      });
    }
  }

  // Manual trigger for APOD fetch (admin)
  async triggerAPODFetch(req, res) {
    try {
      console.log('🔧 Manual APOD fetch triggered');
      
      const count = parseInt(req.query.count) || 15;
      
      // Run in background
      apodService.fetchAndProcessAPOD(count).catch(error => {
        console.error('❌ Manual APOD trigger failed:', error);
      });

      res.json({
        success: true,
        message: 'APOD fetch triggered successfully',
        count: count,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in triggerAPODFetch:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger APOD fetch',
        message: error.message
      });
    }
  }

  // Get APOD statistics
  async getAPODStats(req, res) {
    try {
      const totalCount = await APOD.countDocuments({ isActive: true });
      const processedCount = await APOD.countDocuments({ 
        isActive: true, 
        aiProcessed: true 
      });
      const recentCount = await APOD.countDocuments({
        isActive: true,
        fetchedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      const serviceStats = apodService.getStats();

      res.json({
        success: true,
        statistics: {
          totalAPOD: totalCount,
          aiProcessed: processedCount,
          recentlyFetched: recentCount,
          processingRate: totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0
        },
        serviceStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in getAPODStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get APOD statistics',
        message: error.message
      });
    }
  }

  // Search APOD entries
  async searchAPOD(req, res) {
    try {
      const { q, limit = 20 } = req.query;
      
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
          { explanation: { $regex: q, $options: 'i' } },
          { shortDescription: { $regex: q, $options: 'i' } }
        ]
      };

      const results = await APOD.find(query)
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .select('date title explanation shortDescription creativeCaption url media_type');

      res.json({
        success: true,
        query: q,
        results: results.length,
        data: results
      });
    } catch (error) {
      console.error('❌ Error in searchAPOD:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
        message: error.message
      });
    }
  }
}

module.exports = new APODController();
