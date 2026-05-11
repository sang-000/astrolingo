// server.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");       // for fetching full article
const cheerio = require("cheerio");   // for parsing HTML
require("dotenv").config({ override: true }); // Always use .env file, overrides system env vars

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Example home route
app.get("/", (req, res) => {
  res.send("AstroLingo Backend Running 🚀");
});

// ✅ TEST ROUTE to check RSS feed
app.get("/test-feed", async (req, res) => {
  try {
    const Parser = require("rss-parser");
    const parser = new Parser();
    const feed = await parser.parseURL("https://www.nasa.gov/news-release/feed/");

    res.json({
      success: true,
      count: feed.items.length,
      sample: feed.items[0] || null,
    });
  } catch (err) {
    console.error("Error fetching RSS:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Import routes
const newsRoutes = require("./routes/newsRoutes");
const nasaRoutes = require("./routes/nasaRoutes");
const userRoutes = require("./routes/userRoutes");
const freshArticlesRoutes = require("./routes/freshArticlesRoutes");
const asteroidRoutes = require("./routes/asteroidRoutes");
const realtimeNewsRoutes = require("./routes/realtimeNewsRoutes");
const enhancedNewsRoutes = require("./routes/enhancedNewsRoutes");
const mongoNewsRoutes = require("./routes/mongoNewsRoutes");
const apodRoutes = require("./routes/apodRoutes");

app.use("/api/news", newsRoutes);
// app.use("/api/news", realtimeNewsRoutes); // Old real-time news routes - disabled
app.use("/api/news", enhancedNewsRoutes); // Enhanced news with AI simplification
app.use("/api/news", mongoNewsRoutes); // MongoDB-based news system
app.use("/api/apod", apodRoutes); // NASA APOD routes
app.use("/api/nasa", nasaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/articles", freshArticlesRoutes);
app.use("/api/asteroids", asteroidRoutes);

// ✅ Import Article model
const Article = require("./models/Article");

// ✅ Import and start cron service
const cronService = require("./services/cronService");

// ✅ Simplify route with mode (child, student, researcher)
app.post("/api/articles/:id/simplify", async (req, res) => {
  const { id } = req.params;
  const { mode } = req.body; // 🌟 new: mode sent from frontend

  console.log(`Simplify request for article ID: ${id}, Mode: ${mode}`);

  try {
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    let textToSimplify = "";

    // Step 1: Try fetching full article from its link
    if (article.link) {
      try {
        const response = await axios.get(article.link);
        const $ = cheerio.load(response.data);
        const paragraphs = $("p")
          .map((i, el) => $(el).text())
          .get()
          .join(" ");
        textToSimplify = paragraphs || article.content || article.description || article.title;
      } catch (err) {
        console.error("Error fetching full article:", err.message);
        textToSimplify = article.content || article.description || article.title;
      }
    } else {
      // No link → fallback to existing DB content
      textToSimplify = article.content || article.description || article.title;
    }

    if (!textToSimplify) {
      textToSimplify = "No content available to simplify.";
    }

    // 🌈 Step 2: Apply mode-based simplification
    let simplifiedContent = "";

    if (mode === "child") {
      simplifiedContent =
        textToSimplify.slice(0, 400) + " ... (simplified for children 👧)";
    } else if (mode === "student") {
      simplifiedContent =
        textToSimplify.slice(0, 800) + " ... (simplified for students 🎓)";
    } else {
      simplifiedContent = textToSimplify + " ... (full content for researchers 🧠)";
    }

    // ✅ Response
    res.json({
      success: true,
      articleId: id,
      mode,
      simplifiedContent,
    });
  } catch (err) {
    console.error("Error simplifying article:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  
  // Start cron service after server is running
  setTimeout(() => {
    cronService.start();
  }, 2000);
});
