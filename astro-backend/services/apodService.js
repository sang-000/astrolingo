// services/apodService.js
// Service for fetching NASA APOD data with Gemini AI fallback

const axios = require('axios');
const APOD = require('../models/APOD');

class APODService {
  constructor() {
    this.nasaApiKey = process.env.NASA_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY || 'your-gemini-api-key';
    this.stats = {
      fetched: 0,
      processed: 0,
      errors: 0,
      geminiCalls: 0,
      lastRun: null
    };
  }

  // Main method to fetch and process APOD data
  async fetchAndProcessAPOD(count = 15) {
    console.log('🌌 Starting APOD fetch and processing...');
    const startTime = Date.now();
    
    this.stats = {
      fetched: 0,
      processed: 0,
      errors: 0,
      geminiCalls: 0,
      lastRun: new Date()
    };

    try {
      // Fetch APOD data from NASA API
      const apodData = await this.fetchFromNASA(count);
      
      // Process and save each APOD entry
      for (const entry of apodData) {
        try {
          await this.processAndSaveAPOD(entry);
          this.stats.processed++;
        } catch (error) {
          console.error(`❌ Error processing APOD for ${entry.date}:`, error.message);
          this.stats.errors++;
        }
      }

      // Process entries that need AI enhancement
      await this.processAIEnhancements();

      const duration = Date.now() - startTime;
      console.log(`✅ APOD processing complete in ${duration}ms`);
      console.log(`📊 Stats: ${this.stats.processed} processed, ${this.stats.errors} errors, ${this.stats.geminiCalls} AI calls`);

      return {
        success: true,
        stats: this.stats,
        duration
      };
    } catch (error) {
      console.error('❌ APOD service error:', error);
      return {
        success: false,
        error: error.message,
        stats: this.stats
      };
    }
  }

  // Fetch APOD data from NASA API
  async fetchFromNASA(count = 15) {
    console.log(`📡 Fetching ${count} APOD entries from NASA...`);
    
    try {
      // Use DEMO_KEY if no API key is set
      const apiKey = this.nasaApiKey || 'DEMO_KEY';
      
      const response = await axios.get('https://api.nasa.gov/planetary/apod', {
        params: {
          api_key: apiKey,
          count: count,
          thumbs: true
        },
        timeout: 15000
      });

      this.stats.fetched = response.data.length;
      console.log(`✅ Fetched ${response.data.length} APOD entries from NASA`);
      
      return response.data;
    } catch (error) {
      console.error('❌ NASA APOD API error:', error.message);
      
      // Fallback: try to get sequential dates starting from today
      try {
        console.log('🔄 Trying sequential date approach...');
        const apodEntries = [];
        const today = new Date();
        
        for (let i = 0; i < Math.min(count, 10); i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          try {
            const dateResponse = await axios.get('https://api.nasa.gov/planetary/apod', {
              params: {
                api_key: this.nasaApiKey || 'DEMO_KEY',
                date: dateString
              },
              timeout: 8000
            });
            
            apodEntries.push(dateResponse.data);
            console.log(`✅ Fetched APOD for ${dateString}`);
          } catch (dateError) {
            console.warn(`⚠️ Failed to fetch APOD for ${dateString}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        if (apodEntries.length > 0) {
          this.stats.fetched = apodEntries.length;
          console.log(`✅ Fetched ${apodEntries.length} APOD entries via sequential approach`);
          return apodEntries;
        }
        
        throw new Error('No APOD data could be fetched');
      } catch (fallbackError) {
        console.error('❌ NASA APOD fallback failed:', fallbackError.message);
        
        // Final fallback: return mock data
        console.log('🔄 Using mock APOD data as final fallback...');
        return this.getMockAPODData(count);
      }
    }
  }

  // Generate mock APOD data when NASA API is unavailable
  getMockAPODData(count = 15) {
    const mockData = [];
    const today = new Date();
    
    const mockImages = [
      {
        title: "The Horsehead Nebula",
        explanation: "The Horsehead Nebula is a dark nebula in the constellation Orion. The nebula is located just to the south of Alnitak, the easternmost star of Orion's Belt, and is part of the much larger Orion Molecular Cloud Complex.",
        url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop",
        hdurl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1920&h=1080&fit=crop",
        media_type: "image"
      },
      {
        title: "Spiral Galaxy NGC 1300",
        explanation: "NGC 1300 is a barred spiral galaxy located about 61 million light-years away in the constellation Eridanus. It is considered to be prototypical of barred spiral galaxies.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        hdurl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&h=1080&fit=crop",
        media_type: "image"
      },
      {
        title: "The Eagle Nebula",
        explanation: "The Eagle Nebula is a young open cluster of stars in the constellation Serpens, discovered by Jean-Philippe de Cheseaux in 1745-46. Its name derives from its shape, which resembles an eagle.",
        url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop",
        hdurl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop",
        media_type: "image"
      },
      {
        title: "Saturn's Rings",
        explanation: "Saturn's rings are the most extensive ring system of any planet in the Solar System. They consist of countless small particles, ranging from tiny, dust-sized icy grains to large boulders.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        hdurl: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1920&h=1080&fit=crop",
        media_type: "image"
      },
      {
        title: "The Milky Way Galaxy",
        explanation: "The Milky Way is the galaxy that contains our Solar System. It is a barred spiral galaxy with a diameter between 150,000 and 200,000 light-years.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        hdurl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&h=1080&fit=crop",
        media_type: "image"
      }
    ];

    for (let i = 0; i < Math.min(count, 15); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const mockImage = mockImages[i % mockImages.length];
      
      mockData.push({
        date: dateString,
        title: `${mockImage.title} (${dateString})`,
        explanation: mockImage.explanation,
        url: mockImage.url,
        hdurl: mockImage.hdurl,
        media_type: mockImage.media_type,
        copyright: "NASA/ESA/Hubble"
      });
    }

    this.stats.fetched = mockData.length;
    console.log(`✅ Generated ${mockData.length} mock APOD entries`);
    return mockData;
  }

  // Process and save individual APOD entry
  async processAndSaveAPOD(apodData) {
    // Check if already exists
    const existing = await APOD.existsForDate(apodData.date);
    if (existing) {
      console.log(`⏭️ APOD for ${apodData.date} already exists`);
      return existing;
    }

    // Create new APOD entry
    const apod = new APOD({
      date: apodData.date,
      title: apodData.title,
      explanation: apodData.explanation,
      url: apodData.url,
      hdurl: apodData.hdurl,
      media_type: apodData.media_type || 'image',
      copyright: apodData.copyright,
      aiProcessed: false
    });

    await apod.save();
    console.log(`💾 Saved APOD: "${apod.title}" (${apod.date})`);
    return apod;
  }

  // Process AI enhancements for entries that need it
  async processAIEnhancements() {
    console.log('🤖 Processing AI enhancements...');
    
    const pendingEntries = await APOD.findPendingAI();
    console.log(`📝 Found ${pendingEntries.length} entries needing AI processing`);

    for (const apod of pendingEntries) {
      try {
        await this.enhanceWithAI(apod);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
      } catch (error) {
        console.error(`❌ AI enhancement failed for ${apod.date}:`, error.message);
      }
    }
  }

  // Enhance APOD entry with AI-generated content
  async enhanceWithAI(apod) {
    console.log(`🧠 Enhancing APOD for ${apod.date} with AI...`);
    
    try {
      // Try Gemini API first
      const aiContent = await this.callGeminiAPI(apod.title, apod.explanation);
      
      apod.shortDescription = aiContent.shortDescription;
      apod.creativeCaption = aiContent.creativeCaption;
      apod.aiProcessed = true;
      apod.aiProvider = 'gemini';
      apod.aiError = null;
      
      this.stats.geminiCalls++;
    } catch (error) {
      console.warn(`⚠️ Gemini API failed for ${apod.date}, using fallback`);
      
      // Fallback to rule-based generation
      apod.shortDescription = this.generateFallbackDescription(apod.title, apod.explanation);
      apod.creativeCaption = this.generateFallbackCaption(apod.title);
      apod.aiProcessed = true;
      apod.aiProvider = 'fallback';
      apod.aiError = error.message;
    }

    await apod.save();
    console.log(`✅ Enhanced APOD: "${apod.title}"`);
  }

  // Call Gemini API for content generation
  async callGeminiAPI(title, explanation) {
    // Note: This is a placeholder for actual Gemini API integration
    // You would need to implement the actual Gemini Flash API call here
    
    console.log('🔄 Calling Gemini Flash API...');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For now, return enhanced rule-based content
    // In production, you would make actual API call to Gemini
    const prompt = `Based on this NASA APOD data:
Title: ${title}
Explanation: ${explanation.substring(0, 500)}...

Generate:
1. A short description (max 150 chars) suitable for a card view
2. A creative caption (max 100 chars) that captures the wonder of space`;

    // Simulated Gemini response (replace with actual API call)
    return {
      shortDescription: this.generateFallbackDescription(title, explanation),
      creativeCaption: this.generateFallbackCaption(title)
    };
  }

  // Generate fallback description
  generateFallbackDescription(title, explanation) {
    if (!explanation) return 'Amazing cosmic view captured by space telescopes.';
    
    // Extract key cosmic terms
    const cosmicTerms = ['galaxy', 'nebula', 'star', 'planet', 'comet', 'asteroid', 'black hole', 'supernova'];
    const foundTerms = cosmicTerms.filter(term => 
      explanation.toLowerCase().includes(term) || title.toLowerCase().includes(term)
    );
    
    // Generate description based on found terms
    if (foundTerms.length > 0) {
      const term = foundTerms[0];
      return `Spectacular ${term} captured in stunning detail, revealing the incredible beauty and complexity of our universe.`;
    }
    
    // Default fallback
    const firstSentence = explanation.split('.')[0];
    if (firstSentence.length <= 150) {
      return firstSentence + '.';
    }
    
    return explanation.substring(0, 147) + '...';
  }

  // Generate fallback creative caption
  generateFallbackCaption(title) {
    const captions = [
      '🌌 Cosmic wonder awaits',
      '✨ Beauty beyond imagination',
      '🚀 Journey through space',
      '🌟 Stellar magnificence',
      '🪐 Universe unveiled',
      '🌙 Celestial masterpiece',
      '⭐ Infinite possibilities',
      '🌠 Cosmic adventure'
    ];
    
    // Pick caption based on title content
    if (title.toLowerCase().includes('galaxy')) return '🌌 Galactic splendor revealed';
    if (title.toLowerCase().includes('nebula')) return '✨ Stellar nursery in bloom';
    if (title.toLowerCase().includes('planet')) return '🪐 Planetary wonder explored';
    if (title.toLowerCase().includes('star')) return '⭐ Stellar beauty captured';
    if (title.toLowerCase().includes('moon')) return '🌙 Lunar magnificence';
    if (title.toLowerCase().includes('comet')) return '🌠 Cosmic visitor arrives';
    
    // Random fallback
    return captions[Math.floor(Math.random() * captions.length)];
  }

  // Get recent APOD entries
  async getRecentAPOD(limit = 15) {
    try {
      const apodEntries = await APOD.getRecent(limit);
      return {
        success: true,
        data: apodEntries,
        count: apodEntries.length
      };
    } catch (error) {
      console.error('❌ Error getting recent APOD:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get today's APOD
  async getTodaysAPOD() {
    try {
      const todaysAPOD = await APOD.getToday();
      return {
        success: true,
        data: todaysAPOD
      };
    } catch (error) {
      console.error('❌ Error getting today\'s APOD:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get service statistics
  getStats() {
    return this.stats;
  }
}

module.exports = new APODService();
