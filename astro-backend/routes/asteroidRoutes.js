// routes/asteroidRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getTodaysAsteroids, 
  getAsteroidById, 
  getAsteroidStats, 
  getDateRange 
} = require('../controllers/asteroidController');

// Get today's near earth asteroids
router.get('/today', getTodaysAsteroids);

// Get asteroids for specific date range
router.get('/feed', getTodaysAsteroids);

// Get detailed information about a specific asteroid
router.get('/details/:asteroidId', getAsteroidById);

// Get asteroid statistics
router.get('/stats', getAsteroidStats);

// Get available date range
router.get('/dates', getDateRange);

module.exports = router;
