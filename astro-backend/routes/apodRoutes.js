// routes/apodRoutes.js
// Routes for NASA APOD (Astronomy Picture of the Day) endpoints

const express = require('express');
const router = express.Router();
const apodController = require('../controllers/apodController');

// -------------------------------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------------------------------

// GET /api/apod/gallery - Get APOD gallery (recent 15 entries)
// Query: ?limit=15
router.get('/gallery', apodController.getAPODGallery);

// GET /api/apod/today - Get today's APOD
router.get('/today', apodController.getTodaysAPOD);

// GET /api/apod/date/:date - Get APOD by specific date (YYYY-MM-DD)
router.get('/date/:date', apodController.getAPODByDate);

// GET /api/apod/search - Search APOD entries
// Query: ?q=search_term&limit=20
router.get('/search', apodController.searchAPOD);

// GET /api/apod/stats - Get APOD statistics
router.get('/stats', apodController.getAPODStats);

// -------------------------------------------------------------------
// ADMIN ROUTES
// -------------------------------------------------------------------

// POST /api/apod/fetch - Manual trigger for APOD fetching
// Query: ?count=15
router.post('/fetch', apodController.triggerAPODFetch);

module.exports = router;
