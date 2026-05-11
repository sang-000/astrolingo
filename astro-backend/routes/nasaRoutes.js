// routes/nasaRoutes.js
const express = require("express");
const router = express.Router();
const { getApod } = require("../controllers/nasaController");

router.get("/apod", getApod);

module.exports = router;
