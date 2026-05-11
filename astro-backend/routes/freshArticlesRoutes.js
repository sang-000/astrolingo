// routes/freshArticlesRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Parser = require('rss-parser');

const parser = new Parser();

// 🚀 Fetch fresh NASA articles (no caching)
router.get('/latest', async (req, res) => {
  try {
    console.log('🔄 Fetching fresh NASA articles...');
    
    // NASA RSS Feed URL
    const NASA_RSS_URL = 'https://www.nasa.gov/news-release/feed/';
    
    // Parse RSS feed
    const feed = await parser.parseURL(NASA_RSS_URL);
    
    // Transform articles to our format
    const articles = feed.items.slice(0, 10).map(item => ({
      id: item.guid || item.link,
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.content || item.summary || '',
      link: item.link,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      imageUrl: extractImageUrl(item),
      source: 'NASA-Live'
    }));

    console.log(`✅ Fetched ${articles.length} fresh articles`);
    
    res.json({
      success: true,
      articles,
      fetchedAt: new Date().toISOString(),
      source: 'live'
    });

  } catch (error) {
    console.error('❌ Error fetching fresh articles:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fresh NASA articles',
      message: error.message
    });
  }
});

// 🧠 Simplify article content with AI
router.get('/simplify', async (req, res) => {
  try {
    const { level, content } = req.query;
    
    if (!level || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: level and content'
      });
    }

    if (!['child', 'student', 'researcher'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid level. Must be: child, student, or researcher'
      });
    }

    console.log(`🧠 Simplifying content for ${level} level...`);

    // Get simplified content based on level
    const simplifiedContent = await simplifyWithAI(content, level);

    res.json({
      success: true,
      level,
      originalContent: content.substring(0, 100) + '...',
      simplifiedContent,
      simplifiedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error simplifying content:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to simplify content',
      message: error.message
    });
  }
});

// Helper function to extract image URL from RSS item
function extractImageUrl(item) {
  // Try different possible image sources
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  
  if (item.image) {
    return item.image;
  }
  
  // Try to extract image from content
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }
  }
  
  // Default space image if no image found
  return 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=400&fit=crop';
}

// AI Simplification function
async function simplifyWithAI(content, level) {
  try {
    // Check if we have HuggingFace API key
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    
    if (!HF_API_KEY) {
      // Fallback to rule-based simplification if no AI API
      return simplifyWithRules(content, level);
    }

    // Prepare prompt based on level
    let prompt = '';
    let maxLength = 200;

    switch (level) {
      case 'child':
        prompt = `Explain this space news in very simple words that a 10-year-old child can understand. Use short sentences and fun language: ${content}`;
        maxLength = 150;
        break;
      case 'student':
        prompt = `Summarize this space news for a 15-year-old student. Make it clear and educational: ${content}`;
        maxLength = 250;
        break;
      case 'researcher':
        prompt = `Provide a concise summary of this space news maintaining technical accuracy: ${content}`;
        maxLength = 300;
        break;
    }

    // Call HuggingFace API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        inputs: prompt.substring(0, 1000), // Limit input length
        parameters: {
          max_length: maxLength,
          min_length: 50,
          do_sample: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data[0] && response.data[0].summary_text) {
      return response.data[0].summary_text;
    }

    // Fallback if AI response is unexpected
    return simplifyWithRules(content, level);

  } catch (error) {
    console.error('AI simplification failed, using fallback:', error.message);
    return simplifyWithRules(content, level);
  }
}

// Fallback rule-based simplification
function simplifyWithRules(content, level) {
  // Clean the content
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  
  switch (level) {
    case 'child':
      return `🚀 Space News for Kids: ${cleanContent.substring(0, 120)}... This is about exciting space discoveries that scientists are learning about! 🌟`;
    
    case 'student':
      return `📚 Student Summary: ${cleanContent.substring(0, 200)}... This research helps us understand more about space and science. 🔬`;
    
    case 'researcher':
      return cleanContent.substring(0, 300) + (cleanContent.length > 300 ? '...' : '');
    
    default:
      return cleanContent.substring(0, 200) + '...';
  }
}

module.exports = router;
