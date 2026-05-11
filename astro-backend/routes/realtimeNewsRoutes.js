// routes/realtimeNewsRoutes.js
// Routes for real-time NASA/ISRO news with AI simplification

const express = require('express');
const router = express.Router();

const {
  getRealtimeNews,
  simplifyArticle,
  simplifyBatch,
  healthCheck
} = require('../controllers/realtimeNewsController');

// ===================================================================
// REAL-TIME NEWS ROUTES
// ===================================================================

// GET /api/news/realtime?limit=15&source=all
// Fetch fresh NASA/ISRO news directly from RSS feeds
router.get('/realtime', getRealtimeNews);

// POST /api/news/simplify
// Simplify single article content using HuggingFace API
// Body: { content: "article text", mode: "child|student|researcher" }
router.post('/simplify', simplifyArticle);

// POST /api/news/simplify-batch
// Simplify multiple articles in parallel for fast processing
// Body: { articles: [...], mode: "child|student|researcher" }
router.post('/simplify-batch', simplifyBatch);

// GET /api/news/health
// Health check endpoint for monitoring
router.get('/health', healthCheck);

module.exports = router;
