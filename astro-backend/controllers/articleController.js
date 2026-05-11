// controllers/articleController.js

const xml2js = require('xml2js');
const fetch = require('node-fetch');
const Article = require('../models/Article');

// List of NASA RSS feeds
const NASA_RSS_URLS = [
  'https://www.nasa.gov/news-release/feed/',
  'https://www.nasa.gov/feeds/iotd-feed/',
  'https://www.nasa.gov/rss-feeds/',
  'https://www.jpl.nasa.gov/feeds/news/'
];

// Controller to fetch articles from NASA RSS feeds
exports.fetchNasaArticles = async (req, res) => {
  try {
    const articles = [];

    for (const url of NASA_RSS_URLS) {
      console.log(`Fetching from: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`❌ Failed to fetch ${url} - Status: ${response.status}`);
        continue;
      }

      const xmlData = await response.text();

      const parser = new xml2js.Parser({
        explicitArray: true, // always keep arrays
        trim: true,
        mergeAttrs: true // merge attributes into same object
      });

      let result;
      try {
        result = await parser.parseStringPromise(xmlData);
      } catch (err) {
        console.error(`❌ Error parsing XML from ${url}`, err);
        continue;
      }

      // Determine feed items (RSS or Atom)
      let items = [];
      if (result.rss?.channel?.[0]?.item) {
        items = result.rss.channel[0].item;
      } else if (result.feed?.entry) {
        items = result.feed.entry;
      }

      console.log(`✅ Found ${items.length} items in feed ${url}`);

      for (const item of items) {
        const title = item.title?.[0] || (item.title?.[0]?._) || "No title";
        const link = item.link?.[0] || (item.link?.[0]?.href);
        const pubDate = item.pubDate?.[0] || item.updated?.[0] || new Date();
        const description = item.description?.[0] || item.summary?.[0] || "";

        if (!link) continue;

        // Save to database only if article does not exist
        const existing = await Article.findOne({ link });
        if (!existing) {
          const article = new Article({
            title,
            description,
            link,
            publishedAt: new Date(pubDate)
          });
          await article.save();
          articles.push(article);
        }
      }
    }

    console.log(`🎉 Saved ${articles.length} new articles.`);
    res.json({ success: true, newArticles: articles.length });

  } catch (err) {
    console.error("🔥 Error fetching NASA articles:", err);
    res.status(500).json({ success: false, message: "Failed to fetch articles" });
  }
};

// Controller to get the latest saved articles
exports.getLatestArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedAt: -1 }).limit(10);
    res.json({ success: true, articles });
  } catch (err) {
    console.error("🔥 Error fetching latest articles:", err);
    res.status(500).json({ success: false, message: "Failed to get latest articles" });
  }
};
