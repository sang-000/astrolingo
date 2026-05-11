// astro-backend/routes/enhancedNewsRoutes.js
// Routes for real-time space news with AI simplification

const express = require('express');
const router = express.Router();
const {
  getRealTimeNews,
  getNewsSources,
  simplifySingleArticle
} = require('../controllers/enhancedNewsController');

// -------------------------------------------------------------------
// REAL-TIME NEWS ROUTES
// -------------------------------------------------------------------

// GET /api/news/realtime - Fetch real-time space news with AI simplification
// Query params: ?limit=12&source=all|nasa|space
router.get('/realtime', getRealTimeNews);

// GET /api/news/sources - Get available news sources
router.get('/sources', getNewsSources);

// POST /api/news/simplify - Simplify single article text
// Body: { text: "article content", level: "child|student|researcher" }
router.post('/simplify', simplifySingleArticle);

module.exports = router;
