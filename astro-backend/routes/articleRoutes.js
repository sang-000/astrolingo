const express = require('express');
const router = express.Router();
const { fetchNasaArticles, getLatestArticles } = require('../controllers/articleController');

router.get('/fetch-nasa', fetchNasaArticles);
router.get('/latest', getLatestArticles);

module.exports = router;
