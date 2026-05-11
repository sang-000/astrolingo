// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const { fetchNews, getLatestNews } = require('../controllers/newsController');
const { simplifyArticle } = require('../controllers/simplifyController');
const { getLiveNews, simplifyLiveContent, getNewsSources } = require('../controllers/liveNewsController');

// ===== ORIGINAL DATABASE ROUTES =====
// manual fetch (use Postman to trigger)
router.get('/fetch', fetchNews);

// get latest saved articles
router.get('/latest', getLatestNews);

// NEW: simplify an article (POST body: { level: "child"|"student"|"research", force?: true })
router.post('/:id/simplify', simplifyArticle);

// ===== NEW LIVE NEWS ROUTES =====
// Get live news directly from NASA/ISRO APIs
router.get('/live', getLiveNews);

// Simplify live content (single article)
router.get('/live/simplify', simplifyLiveContent);

// Batch simplify multiple articles in parallel
router.post('/live/simplify-batch', require('../controllers/liveNewsController').simplifyBatch);

// Get available news sources
router.get('/sources', getNewsSources);

module.exports = router;
