// routes/mongoNewsRoutes.js
// Routes for MongoDB-based news system with AI simplification

const express = require('express');
const router = express.Router();
const mongoNewsController = require('../controllers/mongoNewsController');

// -------------------------------------------------------------------
// PUBLIC ROUTES (for logged-in users)
// -------------------------------------------------------------------

// GET /api/news/articles - Get all news articles with pagination
router.get('/articles', mongoNewsController.getAllNews);

// GET /api/news/articles/:id - Get single article by ID
router.get('/articles/:id', mongoNewsController.getArticleById);

// GET /api/news/articles/:id/simplified - Get simplified content for specific level
// Query: ?level=child|student|researcher
router.get('/articles/:id/simplified', mongoNewsController.getSimplifiedContent);

// GET /api/news/sources - Get available news sources and statistics
router.get('/sources', mongoNewsController.getNewsSources);

// GET /api/news/search - Search articles
// Query: ?q=search_term&source=NASA&limit=20
router.get('/search', mongoNewsController.searchArticles);

// -------------------------------------------------------------------
// ADMIN ROUTES (for system management)
// -------------------------------------------------------------------

// POST /api/news/fetch - Manual trigger for news fetching
router.post('/fetch', mongoNewsController.triggerNewsFetch);

// GET /api/news/status - Get cron job and system status
router.get('/status', mongoNewsController.getCronStatus);

module.exports = router;
