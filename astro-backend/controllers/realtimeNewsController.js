// controllers/realtimeNewsController.js
// Real-time NASA/ISRO news fetching with HuggingFace AI simplification

require('dotenv').config();
const axios = require('axios');
const xml2js = require('xml2js');

// Configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || 'facebook/bart-large-cnn';
const HUGGINGFACE_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

// RSS Feed URLs - Updated with reliable sources and fallbacks
const RSS_FEEDS = {
  // NASA feeds
  NASA_NEWS: 'https://www.nasa.gov/feed/',
  NASA_BREAKING: 'https://www.nasa.gov/feed/?s=&feed=breaking-news',
  
  // SpaceNews - reliable alternative for space news
  SPACE_NEWS: 'https://spacenews.com/feed/',
  
  // ISRO alternatives - using archive.org as a fallback
  ISRO_NEWS: 'https://web.archive.org/web/202310/https://www.isro.gov.in/rss.xml',
  
  // Additional reliable space news sources
  SPACEFLIGHT_NOW: 'https://spaceflightnow.com/feed/',
  SPACE_DAILY: 'http://www.spacedaily.com/space-news.rss',
  
  // General science and tech as fallback
  SCIENCEDAILY: 'https://www.sciencedaily.com/rss/space_time/space_exploration.rss'
};

// XML Parser
const parser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: false,
  trim: true
});

// ===================================================================
// MAIN ENDPOINT: GET REAL-TIME NEWS
// ===================================================================
exports.getRealtimeNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const source = req.query.source || 'all';
    
    console.log(`🚀 [${new Date().toISOString()}] Fetching REAL-TIME news from ${source} sources...`);
    
    let allArticles = [];
    const fetchPromises = [];
    
    // Determine which sources to fetch with priority
    const sourcesToFetch = [];
    
    // Always include these high-priority sources
    const highPrioritySources = [
      { name: 'NASA_NEWS', url: RSS_FEEDS.NASA_NEWS },
      { name: 'SPACE_NEWS', url: RSS_FEEDS.SPACE_NEWS },
      { name: 'SPACEFLIGHT_NOW', url: RSS_FEEDS.SPACEFLIGHT_NOW }
    ];
    
    // Add NASA-specific sources if requested
    if (source === 'all' || source === 'nasa') {
      sourcesToFetch.push(
        { name: 'NASA_BREAKING', url: RSS_FEEDS.NASA_BREAKING }
      );
    }
    
    // Add ISRO sources if requested (with fallbacks)
    if (source === 'all' || source === 'isro') {
      sourcesToFetch.push(
        { name: 'ISRO_NEWS', url: RSS_FEEDS.ISRO_NEWS },
        { name: 'SPACE_DAILY', url: RSS_FEEDS.SPACE_DAYS },
        { name: 'SCIENCEDAILY', url: RSS_FEEDS.SCIENCEDAILY }
      );
    }
    
    // Combine all sources with high priority first
    sourcesToFetch.unshift(...highPrioritySources);
    
    // Fetch all sources in parallel with timeout and error handling
    for (const feedSource of sourcesToFetch) {
      const fetchWithTimeout = (url, name) => {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn(`⏱️  Timeout fetching ${name} (${url})`);
            resolve([]); // Resolve with empty array on timeout
          }, 10000); // 10 second timeout per feed
          
          fetchRSSFeed(url, name)
            .then(articles => resolve(articles || []))
            .catch(error => {
              console.warn(`⚠️  Error fetching ${name} (${url}):`, error.message);
              resolve([]); // Resolve with empty array on error
            })
            .finally(() => clearTimeout(timeout));
        });
      };
      
      fetchPromises.push(fetchWithTimeout(feedSource.url, feedSource.name));
    }
    
    const results = await Promise.allSettled(fetchPromises);
    
    // Process all results (both successful and failed)
    let successfulFeeds = 0;
    results.forEach((result, index) => {
      const sourceName = sourcesToFetch[index]?.name || `Unknown Source ${index}`;
      
      if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
        const newArticles = Array.isArray(result.value) ? result.value : [];
        allArticles = [...allArticles, ...newArticles];
        console.log(`✅ ${sourceName}: ${newArticles.length} articles`);
        successfulFeeds++;
      } else {
        const error = result.status === 'rejected' ? result.reason?.message : 'No articles found';
        console.warn(`⚠️  ${sourceName} failed: ${error}`);
      }
    });
    
    console.log(`📊 Fetched from ${successfulFeeds}/${sourcesToFetch.length} sources successfully`);
    
    // Remove duplicates and sort by date
    allArticles = removeDuplicates(allArticles);
    allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // Apply limit
    const limitedArticles = allArticles.slice(0, limit);
    
    console.log(`✅ [REAL-TIME] Successfully fetched ${limitedArticles.length} fresh articles from ${allArticles.length} total`);
    
    res.json({
      success: true,
      articles: limitedArticles,
      metadata: {
        totalFetched: allArticles.length,
        returned: limitedArticles.length,
        sources: sourcesToFetch.map(s => s.name),
        fetchedAt: new Date().toISOString(),
        isRealTime: true,
        cacheStatus: 'FRESH_FETCH'
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getRealtimeNews:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time news',
      details: error.message
    });
  }
};

// ===================================================================
// SINGLE ARTICLE SIMPLIFICATION
// ===================================================================
exports.simplifyArticle = async (req, res) => {
  try {
    const { content, mode = 'student' } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for simplification'
      });
    }
    
    console.log(`🧠 Simplifying article for ${mode} mode (${content.length} chars)...`);
    
    const simplifiedContent = await simplifyWithHuggingFace(content, mode);
    
    res.json({
      success: true,
      originalContent: content,
      simplifiedContent,
      mode,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in simplifyArticle:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to simplify article',
      details: error.message
    });
  }
};

// ===================================================================
// BATCH SIMPLIFICATION (PARALLEL PROCESSING)
// ===================================================================
exports.simplifyBatch = async (req, res) => {
  try {
    const { articles, mode = 'student' } = req.body;
    
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({
        success: false,
        error: 'Articles array is required for batch simplification'
      });
    }
    
    console.log(`🚀 [BATCH] Simplifying ${articles.length} articles for ${mode} mode in parallel...`);
    
    const startTime = Date.now();
    
    // Process all articles in parallel using Promise.all()
    const simplificationPromises = articles.map(async (article, index) => {
      try {
        const content = article.description || article.content || article.title;
        const simplified = await simplifyWithHuggingFace(content, mode);
        
        return {
          id: article.id || `article_${index}`,
          success: true,
          simplifiedContent: simplified,
          originalLength: content.length,
          simplifiedLength: simplified.length
        };
      } catch (error) {
        console.warn(`⚠️ Failed to simplify article ${article.id || index}:`, error.message);
        return {
          id: article.id || `article_${index}`,
          success: false,
          simplifiedContent: article.description || article.content || article.title,
          error: error.message
        };
      }
    });
    
    const results = await Promise.all(simplificationPromises);
    const processingTime = Date.now() - startTime;
    
    // Create simplified content map
    const simplifiedMap = {};
    let successCount = 0;
    
    results.forEach(result => {
      simplifiedMap[result.id] = result.simplifiedContent;
      if (result.success) successCount++;
    });
    
    console.log(`✅ [BATCH] Completed ${successCount}/${articles.length} simplifications in ${processingTime}ms`);
    
    res.json({
      success: true,
      simplified: simplifiedMap,
      metadata: {
        totalArticles: articles.length,
        successfulSimplifications: successCount,
        failedSimplifications: articles.length - successCount,
        processingTimeMs: processingTime,
        mode,
        processedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error in simplifyBatch:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process batch simplification',
      details: error.message
    });
  }
};

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

// Fetch and parse RSS feed
async function fetchRSSFeed(url, sourceName) {
  try {
    console.log(`📡 Fetching ${sourceName} from ${url}...`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'AstroLingo/1.0 (Educational Space News Aggregator)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });
    
    const parsed = await parser.parseStringPromise(response.data);
    
    // Handle different RSS/Atom feed formats
    let items = [];
    if (parsed.rss?.channel?.item) {
      items = parsed.rss.channel.item;
    } else if (parsed.feed?.entry) {
      items = parsed.feed.entry;
    } else if (parsed.channel?.item) {
      items = parsed.channel.item;
    }
    
    if (!Array.isArray(items)) {
      items = [items].filter(Boolean);
    }
    
    const articles = items.slice(0, 20).map((item, index) => {
      // Handle different title formats
      let title = 'Untitled';
      if (typeof item.title === 'string') {
        title = item.title;
      } else if (item.title?._) {
        title = item.title._;
      } else if (item.title?.$?.text) {
        title = item.title.$.text;
      }
      
      // Handle different description formats
      let description = '';
      if (item.description) {
        description = typeof item.description === 'string' ? item.description : item.description._ || '';
      } else if (item.summary) {
        description = typeof item.summary === 'string' ? item.summary : item.summary._ || '';
      } else if (item.content) {
        description = typeof item.content === 'string' ? item.content : item.content._ || '';
      }
      
      // Handle different link formats
      let link = '';
      if (typeof item.link === 'string') {
        link = item.link;
      } else if (item.link?.href) {
        link = item.link.href;
      } else if (item.link?.$?.href) {
        link = item.link.$.href;
      } else if (item.guid) {
        link = typeof item.guid === 'string' ? item.guid : item.guid._ || '';
      }
      
      // Handle different date formats
      const pubDate = item.pubDate || item.published || item.updated || item.date || new Date().toISOString();
      
      return {
        id: `${sourceName.toLowerCase()}_${Date.now()}_${index}`,
        title: cleanText(title),
        description: cleanText(description),
        content: cleanText(description), // Use description as content
        link: link,
        publishedAt: new Date(pubDate).toISOString(),
        source: sourceName.replace('_', ' '),
        category: 'Space News',
        isRealTime: true,
        fetchedAt: new Date().toISOString()
      };
    });
    
    return articles.filter(article => article.title && article.title !== 'Untitled');
    
  } catch (error) {
    console.error(`❌ Error fetching ${sourceName}:`, error.message);
    throw error;
  }
}

// HuggingFace API simplification
async function simplifyWithHuggingFace(content, mode) {
  try {
    // First try HuggingFace API
    if (HUGGINGFACE_API_KEY) {
      const hfResult = await callHuggingFaceAPI(content, mode);
      if (hfResult) {
        return hfResult;
      }
    }
    
    // Fallback to rule-based simplification
    console.warn('🔄 Using fallback simplification for', mode, 'mode');
    return fallbackSimplification(content, mode);
    
  } catch (error) {
    console.warn('⚠️ HuggingFace API failed, using fallback:', error.message);
    return fallbackSimplification(content, mode);
  }
}

// Call HuggingFace API
async function callHuggingFaceAPI(content, mode) {
  try {
    const prompts = {
      child: `Simplify this space news so that a child aged 8-10 can understand it. Use simple words and short sentences. Avoid technical jargon: ${content}`,
      student: `Simplify the following space news so that a high school student (around 15 years old) can understand it. Keep the language clear and concise, explain important technical terms, and make it informative but easy to follow: ${content}`,
      researcher: `Summarize the following space news for a researcher or professional. Keep all technical details, scientific terms, and accurate data. Do not simplify the content; maintain the original depth and complexity: ${content}`
    };
    
    const parameters = {
      child: { max_length: 80, min_length: 30 },
      student: { max_length: 150, min_length: 60 },
      researcher: { max_length: 250, min_length: 100 }
    };
    
    const response = await axios.post(
      HUGGINGFACE_URL,
      {
        inputs: prompts[mode] || prompts.student,
        parameters: {
          ...parameters[mode] || parameters.student,
          do_sample: false,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    if (response.data && response.data[0] && response.data[0].summary_text) {
      return response.data[0].summary_text;
    }
    
    return null;
    
  } catch (error) {
    if (error.response?.status === 503) {
      console.warn('🔄 HuggingFace model loading, using fallback...');
    } else {
      console.error('❌ HuggingFace API error:', error.message);
    }
    return null;
  }
}

// Fallback rule-based simplification
function fallbackSimplification(content, mode) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(' ');
  
  switch (mode) {
    case 'child':
      return `🚀 Space Discovery! Scientists found something amazing in space! ${sentences[0]?.substring(0, 100)}... This helps us learn more about our universe and the stars! Maybe you'll be a space explorer someday too! 🌟`;
      
    case 'student':
      const firstTwo = sentences.slice(0, 2).join('. ');
      return `📚 Space Research Update: ${firstTwo}. This discovery helps scientists understand more about space and could lead to new technologies. The research is important for future space exploration missions.`;
      
    case 'researcher':
      return content.length > 250 ? content.substring(0, 247) + '...' : content;
      
    default:
      return content.substring(0, 150) + '...';
  }
}

// Remove duplicate articles based on title similarity
function removeDuplicates(articles) {
  const seen = new Set();
  const unique = [];
  
  for (const article of articles) {
    const normalizedTitle = article.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!seen.has(normalizedTitle)) {
      seen.add(normalizedTitle);
      unique.push(article);
    }
  }
  
  return unique;
}

// Clean text content
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// ===================================================================
// HEALTH CHECK ENDPOINT
// ===================================================================
exports.healthCheck = async (req, res) => {
  try {
    const status = {
      service: 'Real-time News API',
      status: 'operational',
      timestamp: new Date().toISOString(),
      huggingface: HUGGINGFACE_API_KEY ? 'configured' : 'not configured',
      feeds: Object.keys(RSS_FEEDS).length
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      service: 'Real-time News API',
      status: 'error',
      error: error.message
    });
  }
};
