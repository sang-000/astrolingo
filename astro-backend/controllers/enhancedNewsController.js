// astro-backend/controllers/enhancedNewsController.js
// Real-time space news with AI-powered simplification

require('dotenv').config();
const Parser = require('rss-parser');
const sanitizeHtml = require('sanitize-html');
const axios = require('axios');
const cheerio = require('cheerio');
const { HfInference } = require('@huggingface/inference');

// Configure RSS parser with custom fields for better content extraction
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'fullContent'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['description', 'description']
    ]
  }
});

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || process.env.HUGGING_FACE_API_KEY);

// News sources
const NEWS_SOURCES = {
  NASA_RSS: 'https://www.nasa.gov/news-release/feed/',
  SPACEFLIGHT_API: 'https://api.spaceflightnewsapi.net/v4/articles'
};

// -------------------------------------------------------------------
// SIMPLIFICATION PROMPTS FOR DIFFERENT READING LEVELS
// -------------------------------------------------------------------
const SIMPLIFICATION_PROMPTS = {
  child: `Rewrite this space news article for an 8-year-old child. Use simple words, short sentences, and make it exciting and fun to read. Avoid technical terms. Focus on the amazing discoveries and adventures in space. Maximum 200 words:\n\n`,
  
  student: `Rewrite this space news article for a high school student. Use clear language, explain scientific concepts simply, and maintain educational value. Keep it informative but accessible. Include key facts and discoveries. Maximum 400 words:\n\n`,
  
  researcher: `Provide the full detailed content of this space news article for researchers and professionals. Maintain all technical details, scientific accuracy, and professional terminology. Include all data, measurements, and technical specifications mentioned:\n\n`
};

// -------------------------------------------------------------------
// FETCH ARTICLES FROM RSS SOURCES
// -------------------------------------------------------------------
async function fetchFromSource(url, sourceName) {
  try {
    console.log(`📡 Fetching from ${sourceName}: ${url}`);
    const feed = await parser.parseURL(url);
    
    const articles = feed.items.map(item => {
      // Extract full content from various RSS fields
      let fullContent = item.fullContent || 
                       item['content:encoded'] || 
                       item.content || 
                       item.description || 
                       item.summary || 
                       '';
      
      // Clean HTML tags for better processing
      fullContent = sanitizeHtml(fullContent, {
        allowedTags: [],
        allowedAttributes: {}
      });
      
      return {
        id: item.guid || item.link || item.title,
        title: item.title,
        description: item.description || item.summary || '',
        fullContent: fullContent,
        link: item.link,
        publishedAt: item.pubDate || item.isoDate,
        source: sourceName,
        image: item.mediaContent?.url || 
               item.mediaThumbnail?.url || 
               item.enclosure?.url ||
               'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop'
      };
    });
    
    console.log(`✅ Successfully fetched ${articles.length} articles from ${sourceName}`);
    return articles;
    
  } catch (error) {
    console.error(`❌ Error fetching from ${sourceName}:`, error.message);
    return [];
  }
}

// -------------------------------------------------------------------
// FETCH ARTICLES FROM SPACEFLIGHT NEWS API
// -------------------------------------------------------------------
async function fetchFromSpaceflightAPI() {
  try {
    console.log(`📡 Fetching from Spaceflight News API`);
    const response = await axios.get(NEWS_SOURCES.SPACEFLIGHT_API, {
      params: {
        limit: 20,
        ordering: '-published_at'
      }
    });
    
    const articles = response.data.results.map(item => ({
      id: item.id.toString(),
      title: item.title,
      description: item.summary,
      fullContent: item.summary,
      link: item.url,
      publishedAt: item.published_at,
      source: 'Spaceflight News',
      image: item.image_url || 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop'
    }));
    
    console.log(`✅ Successfully fetched ${articles.length} articles from Spaceflight News API`);
    return articles;
    
  } catch (error) {
    console.error(`❌ Error fetching from Spaceflight News API:`, error.message);
    return [];
  }
}


// -------------------------------------------------------------------
// EXTRACT IMAGE FROM CONTENT
// -------------------------------------------------------------------
function extractImageFromContent(content) {
  if (!content) return null;
  
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

// -------------------------------------------------------------------
// AI-POWERED TEXT SIMPLIFICATION
// -------------------------------------------------------------------
async function simplifyText(text, level) {
  try {
    if (!process.env.HUGGINGFACE_API_KEY && !process.env.HUGGING_FACE_API_KEY) {
      console.warn('⚠️ No Hugging Face API key found, using fallback simplification');
      return fallbackSimplification(text, level);
    }

    // Clean and truncate text for API limits
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const maxInputLength = level === 'researcher' ? 2000 : 1000;
    const inputText = cleanText.length > maxInputLength ? 
      cleanText.substring(0, maxInputLength) + '...' : cleanText;

    const prompt = SIMPLIFICATION_PROMPTS[level];
    const fullPrompt = `${prompt}${inputText}`;

    console.log(`🧠 Simplifying text for ${level} level (${inputText.length} chars)...`);

    // Use Hugging Face text generation model
    try {
      const response = await hf.textGeneration({
        model: 'facebook/bart-large-cnn',
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: level === 'child' ? 200 : level === 'student' ? 400 : 600,
          temperature: 0.3,
          do_sample: true,
          top_p: 0.9
        }
      });

      if (response && response.generated_text) {
        // Clean up the response
        let simplified = response.generated_text.replace(fullPrompt, '').trim();
        if (simplified.length > 50) {
          return simplified;
        }
      }
    } catch (hfError) {
      console.log(`⚠️ Primary model failed, trying alternative approach: ${hfError.message}`);
    }

    // Fallback to summarization model
    try {
      const summaryResponse = await hf.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: inputText,
        parameters: {
          max_length: level === 'child' ? 100 : level === 'student' ? 200 : 400,
          min_length: level === 'child' ? 50 : level === 'student' ? 100 : 200
        }
      });

      if (summaryResponse && summaryResponse.summary_text) {
        return summaryResponse.summary_text;
      }
    } catch (summaryError) {
      console.log(`⚠️ Summarization model failed: ${summaryError.message}`);
    }

    return fallbackSimplification(text, level);
    
  } catch (error) {
    console.error(`❌ AI simplification failed for ${level}:`, error.message);
    return fallbackSimplification(text, level);
  }
}

// -------------------------------------------------------------------
// FALLBACK SIMPLIFICATION (RULE-BASED)
// -------------------------------------------------------------------
function fallbackSimplification(text, level) {
  const cleanText = text.replace(/[^\w\s.,!?]/g, '').trim();
  
  switch (level) {
    case 'child':
      return cleanText.substring(0, 200) + '... 🚀 (This is about space exploration and discoveries!)';
    
    case 'student':
      return cleanText.substring(0, 400) + '... 🔬 (Learn more about space science and technology!)';
    
    case 'researcher':
      return cleanText + ' 📊 (Full technical details preserved for research purposes)';
    
    default:
      return cleanText;
  }
}

// -------------------------------------------------------------------
// MAIN ENDPOINT: GET REAL-TIME NEWS WITH SIMPLIFICATION
// -------------------------------------------------------------------
exports.getRealTimeNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '12', 10);
    const source = req.query.source || 'all';
    
    console.log(`🚀 Fetching real-time space news (limit: ${limit}, source: ${source})`);
    
    // Step 1: Fetch articles from multiple sources in parallel
    const fetchPromises = [];
    
    if (source === 'all' || source === 'nasa') {
      fetchPromises.push(fetchFromSource(NEWS_SOURCES.NASA_RSS, 'NASA'));
    }
    
    if (source === 'all' || source === 'spaceflight') {
      fetchPromises.push(fetchFromSpaceflightAPI());
    }
    
    const results = await Promise.all(fetchPromises);
    let allArticles = results.flat();
    
    // Remove duplicates and sort by date
    const uniqueArticles = allArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title || a.guid === article.guid)
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, limit);
    
    // Step 2: Generate simplified versions for each article
    console.log(`📝 Generating simplified versions for ${uniqueArticles.length} articles...`);
    
    const articlesWithSimplification = await Promise.all(
      uniqueArticles.map(async (article) => {
        // Use full content for simplification, fallback to description
        const textToSimplify = article.fullContent || article.content || article.description || article.title;
        
        console.log(`🔄 Processing article: ${article.title.substring(0, 50)}... (${textToSimplify.length} chars)`);
        
        // Generate all three reading levels in parallel
        const [childVersion, studentVersion, researcherVersion] = await Promise.all([
          simplifyText(textToSimplify, 'child'),
          simplifyText(textToSimplify, 'student'),
          simplifyText(textToSimplify, 'researcher')
        ]);
        
        return {
          ...article,
          // Keep original full content available
          originalContent: textToSimplify,
          simplifiedContent: {
            child: childVersion,
            student: studentVersion,
            researcher: researcherVersion
          },
          fetchedAt: new Date().toISOString()
        };
      })
    );
    
    console.log(`✅ Successfully processed ${articlesWithSimplification.length} articles with AI simplification`);
    
    res.json({
      success: true,
      count: articlesWithSimplification.length,
      totalFetched: articlesWithSimplification.length,
      articles: articlesWithSimplification,
      fetchedAt: new Date().toISOString(),
      sources: ['NASA', 'SpaceNews', 'Universe Today'],
      cacheStatus: 'FRESH_FETCH'
    });
    
  } catch (error) {
    console.error('❌ Error in getRealTimeNews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time news',
      message: error.message
    });
  }
};

// -------------------------------------------------------------------
// ENDPOINT: GET NEWS SOURCES
// -------------------------------------------------------------------
exports.getNewsSources = async (req, res) => {
  res.json({
    success: true,
    sources: NEWS_SOURCES,
    description: 'Available real-time space news sources'
  });
};

// -------------------------------------------------------------------
// ENDPOINT: SIMPLIFY SINGLE ARTICLE
// -------------------------------------------------------------------
exports.simplifySingleArticle = async (req, res) => {
  try {
    const { text, level } = req.body;
    
    if (!text || !level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: text and level'
      });
    }
    
    if (!['child', 'student', 'researcher'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid level. Must be: child, student, or researcher'
      });
    }
    
    const simplifiedText = await simplifyText(text, level);
    
    res.json({
      success: true,
      originalText: text,
      level,
      simplifiedText,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in simplifySingleArticle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simplify article',
      message: error.message
    });
  }
};
