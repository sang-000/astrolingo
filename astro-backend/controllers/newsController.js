// astro-backend/controllers/newsController.js

require('dotenv').config();
const Parser = require('rss-parser');
const sanitizeHtml = require('sanitize-html');
const Article = require('../models/Article'); // make sure this file exists: models/Article.js

const parser = new Parser();
const NASA_RSS_URL = process.env.NASA_RSS_URL || 'https://www.nasa.gov/news-release/feed/';

// -------------------------------------------------------------------
// STEP 2: FETCH AND SAVE NEWS FROM NASA RSS FEED
// -------------------------------------------------------------------
exports.fetchNews = async (req, res) => {
    try {
        const feed = await parser.parseURL(NASA_RSS_URL);
        const saved = [];

        for (const item of feed.items || []) {
            const link = item.link || item.guid || item.id;
            if (!link) continue;

            // Check for duplicates using link
            const exists = await Article.findOne({ link });
            if (exists) continue;

            // Extract image if present
            const imageUrl =
                (item.enclosure && item.enclosure.url) ||
                (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) ||
                item.image ||
                null;

            // Clean and simplify description
            const rawDesc = item.contentSnippet || item.content || item.summary || '';
            const description = sanitizeHtml(rawDesc, { allowedTags: [], allowedAttributes: {} });

            // Use date fields safely
            const publishedAt = item.isoDate
                ? new Date(item.isoDate)
                : item.pubDate
                    ? new Date(item.pubDate)
                    : new Date();

            // Create new article object
            const article = new Article({
                title: item.title || 'Untitled',
                description,
                link,
                publishedAt,
                source: 'NASA-News',
                imageUrl,
                mediaType: 'article',
            });

            await article.save();
            saved.push(article);
        }

        console.log(`✅ Saved ${saved.length} new NASA articles.`);
        res.json({ success: true, savedCount: saved.length, saved });
    } catch (err) {
        console.error('❌ fetchNews error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

// -------------------------------------------------------------------
// STEP 3: GET LATEST NEWS FROM DATABASE
// -------------------------------------------------------------------
exports.getLatestNews = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || '20', 10);
        const articles = await Article.find({ source: 'NASA-News' })
            .sort({ publishedAt: -1 })
            .limit(limit)
            .select('-__v'); // exclude extra mongoose field

        res.json({ success: true, articles });
    } catch (err) {
        console.error('❌ getLatestNews error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to get news' });
    }
};

// -------------------------------------------------------------------
// OPTIONAL: For scheduled auto-fetch (like a cron job)
// -------------------------------------------------------------------
exports.fetchNewsDaily = async () => {
    const result = await this.fetchNews();
    console.log('Scheduled news fetch result:', result);
    return result;
};
