// News.jsx - Secure NASA & Spaceflight News with AI Simplification
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simplifying, setSimplifying] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("student");
  const [error, setError] = useState(null);
  const [fetchInfo, setFetchInfo] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRealTime, setIsRealTime] = useState(true);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Fetch live news on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchLiveNews();
    }
  }, []);

  // Handle simplification level changes
  useEffect(() => {
    if (articles.length > 0) {
      handleSimplificationChange(selectedLevel);
    }
  }, [selectedLevel]);

  const fetchLiveNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startTime = Date.now();
      console.log(`🚀 Fetching live news from NASA & Spaceflight News at ${new Date().toLocaleTimeString()}...`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/news/realtime?source=all&limit=15&t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.articles || []);
        setFetchInfo({
          totalFetched: data.count || 0,
          sources: ['NASA', 'Spaceflight News'],
          fetchedAt: data.fetchedAt || new Date().toISOString(),
          cacheStatus: data.cacheStatus || 'FRESH_FETCH',
          fetchDuration: Date.now() - startTime
        });
        setLastRefresh(new Date());
        setIsRealTime(true);
        
        console.log(`✅ Loaded ${(data.articles || []).length} articles from NASA & Spaceflight News in ${Date.now() - startTime}ms`);
      } else {
        throw new Error(data.error || 'Failed to fetch live news');
      }
    } catch (err) {
      console.error('❌ Error fetching live news:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setError(err.message);
      setIsRealTime(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSimplificationChange = async (newLevel) => {
    setSimplifying(true);
    setSelectedLevel(newLevel);
    
    // Add a small delay to show loading state
    setTimeout(() => {
      setSimplifying(false);
    }, 500);
  };

  const getSimplifiedContent = (article) => {
    if (!article.simplifiedContent) {
      return article.fullContent || article.description || article.title;
    }
    
    switch (selectedLevel) {
      case 'child':
        return article.simplifiedContent.child || article.description;
      case 'student':
        return article.simplifiedContent.student || article.description;
      case 'researcher':
        return article.simplifiedContent.researcher || article.fullContent || article.description;
      default:
        return article.description;
    }
  };
  
  // Progressive individual simplification with real-time updates
  const progressiveSimplification = async () => {
    const simplified = {};
    const progress = { ...simplificationProgress };
    
    console.log(`🔄 Falling back to progressive AI simplification...`);
    
    for (const article of articles.slice(0, 12)) { // Process up to 12 articles
      try {
        // Update progress to processing
        progress[article.id] = 'processing';
        setSimplificationProgress({ ...progress });
        
        const response = await fetch(
          `http://localhost:5000/api/news/live/simplify?level=${selectedLevel}&content=${encodeURIComponent(article.description)}`
        );
        const data = await response.json();
        
        if (data.success) {
          simplified[article.id] = data.simplifiedContent;
          progress[article.id] = 'completed';
        } else {
          simplified[article.id] = article.description;
          progress[article.id] = 'failed';
        }
        
        // Update UI with each completed simplification
        setSimplifiedArticles({ ...simplified });
        setSimplificationProgress({ ...progress });
        
      } catch (err) {
        simplified[article.id] = article.description;
        progress[article.id] = 'failed';
        setSimplifiedArticles({ ...simplified });
        setSimplificationProgress({ ...progress });
      }
      
      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`✅ Progressive simplification completed for ${Object.keys(simplified).length} articles`);
  };

  if (loading) {
    return (
      <div className="nasa-loading-container">
        <div className="nasa-loading-content">
          <div className="nasa-loading-spinner"></div>
          <h2 className="nasa-loading-title">Accessing Space Intelligence</h2>
          <p className="nasa-loading-subtitle">Fetching latest discoveries from NASA & Space agencies...</p>
          <div className="nasa-loading-info">
            ⚡ Real-time NASA RSS • Spaceflight News API • AI Simplification Ready
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nasa-error-container">
        <div className="nasa-error-content">
          <div className="nasa-error-icon">🌌</div>
          <h2 className="nasa-error-title">Mission Control Error</h2>
          <p className="nasa-error-message">{error}</p>
          <button onClick={fetchLiveNews} className="nasa-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nasa-news-container">
      {/* Header with Simplification Controls */}
      <div className="nasa-news-header">
        <div className="nasa-container">
          <div className="nasa-news-header-content">
            <div className="nasa-news-title-section">
              <h1 className="nasa-title">Space Intelligence Feed</h1>
              <p className="nasa-news-subtitle">
                {fetchInfo ? (
                  <>
                    Live from NASA & Spaceflight News • {articles.length} articles • 
                    <span className="nasa-status-live">⚡ LIVE</span>
                    {fetchInfo.cacheStatus && (
                      <span className="nasa-cache-status"> • {fetchInfo.cacheStatus}</span>
                    )}
                  </>
                ) : (
                  'Connecting to space agencies...'
                )}
              </p>
            </div>
            
            {/* AI Simplification Controls */}
            <div className="nasa-simplification-controls">
              <div className="nasa-control-label">Reading Level:</div>
              <div className="nasa-toggle-group">
                <button
                  onClick={() => handleSimplificationChange('child')}
                  className={`nasa-toggle-btn ${selectedLevel === 'child' ? 'active child' : ''}`}
                  disabled={simplifying}
                >
                  🧒 Child
                </button>
                <button
                  onClick={() => handleSimplificationChange('student')}
                  className={`nasa-toggle-btn ${selectedLevel === 'student' ? 'active student' : ''}`}
                  disabled={simplifying}
                >
                  🎓 Student
                </button>
                <button
                  onClick={() => handleSimplificationChange('researcher')}
                  className={`nasa-toggle-btn ${selectedLevel === 'researcher' ? 'active researcher' : ''}`}
                  disabled={simplifying}
                >
                  🔬 Researcher
                </button>
              </div>
              {simplifying && (
                <div className="nasa-simplifying-indicator">
                  <div className="nasa-spinner-small"></div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="nasa-container">
        {articles.length > 0 ? (
          <div className="nasa-articles-grid">
            {articles.map((article, index) => (
              <article
                key={article.id || index}
                className="nasa-article-card"
              >
              {/* Article Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image || article.imageUrl || 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=400&fit=crop'}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=400&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2 font-poppins">
                  {article.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="text-purple-300">
                    📅 {new Date(article.pubDate || article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  
                  {/* Freshness Indicator */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${article.freshness === 'BREAKING' ? 'bg-red-500 text-white animate-pulse' : article.freshness === 'VERY_FRESH' ? 'bg-green-500 text-white' : article.freshness === 'FRESH' ? 'bg-blue-500 text-white' : article.freshness === 'RECENT' ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white'}`}>
                    {article.freshness === 'BREAKING' ? '🔥 BREAKING' : article.freshness === 'VERY_FRESH' ? '⚡ VERY FRESH' : article.freshness === 'FRESH' ? '🆕 FRESH' : article.freshness === 'RECENT' ? '📰 RECENT' : '📚 ARCHIVED'}
                  </div>
                </div>

                {/* Simplified Content with Progressive Loading */}
                <div className="mb-4">
                  {simplifiedArticles[articleId] ? (
                    <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-400 transform transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{levelConfig[selectedLevel].icon}</span>
                          <span className="text-sm font-medium text-purple-300">
                            {levelConfig[selectedLevel].label} Level
                          </span>
                        </div>
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          <span>✅</span>
                          <span>AI Simplified</span>
                        </div>
                      </div>
                      <div className="text-gray-300 leading-relaxed">
                        <p className="whitespace-pre-line">
                          {simplifiedArticles[articleId]}
                        </p>
                        {selectedLevel === 'researcher' && article.originalContent && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <h4 className="text-sm font-semibold text-purple-300 mb-2">Full Original Content:</h4>
                            <p className="text-sm text-gray-400 whitespace-pre-line">
                              {article.originalContent}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : simplificationProgress[articleId] === 'processing' ? (
                    <div className="bg-slate-700/30 rounded-lg p-4 border-l-4 border-yellow-400">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="loading-spinner w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-yellow-300">
                          🧠 AI Processing {levelConfig[selectedLevel].label} Level...
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-600 rounded animate-pulse"></div>
                        <div className="h-3 bg-slate-600 rounded w-4/5 animate-pulse"></div>
                        <div className="h-3 bg-slate-600 rounded w-3/5 animate-pulse"></div>
                      </div>
                    </div>
                  ) : simplificationProgress[articleId] === 'failed' ? (
                    <div className="bg-slate-700/30 rounded-lg p-4 border-l-4 border-red-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-400">⚠️</span>
                        <span className="text-sm font-medium text-red-300">
                          AI Processing Failed - Showing Original
                        </span>
                      </div>
                      <p className="text-gray-400 leading-relaxed">
                        {article.description}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-700/30 rounded-lg p-4 border-l-4 border-gray-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-400">
                          Waiting for AI simplification...
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-600 rounded animate-pulse"></div>
                        <div className="h-3 bg-slate-600 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Read Original Link */}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  <span>Read Original Article</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          );
          })}
        </div>

        {/* Refresh Button with Status */}
        <div className="text-center mt-12">
          <button
            onClick={fetchLiveNews}
            disabled={loading || simplifying}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Fetching Fresh News...
              </span>
            ) : simplifying ? (
              <span className="flex items-center gap-2">
                <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                AI Simplifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                🔄 Get Latest News
              </span>
            )}
          </button>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm text-purple-400">
              🌍 Live from {selectedSource === 'all' ? 'NASA & ISRO APIs' : selectedSource.toUpperCase() + ' API'} • 
              <span className={`font-medium ${isRealTime ? 'text-green-400' : 'text-red-400'}`}>
                {isRealTime ? ' ⚡ REAL-TIME' : ' ❌ OFFLINE'}
              </span>
            </p>
            
            {fetchInfo && (
              <div className="text-xs text-purple-500 space-y-1">
                <p>
                  📊 {articles.length} articles loaded • {fetchInfo.totalFetched} total available • 
                  Simplified for {levelConfig[selectedLevel].label.toLowerCase()}s
                </p>
                <p>
                  🕒 Last update: {lastRefresh?.toLocaleTimeString()} • 
                  Processing: {fetchInfo.fetchDuration}ms • 
                  Status: {fetchInfo.cacheStatus}
                </p>
                {simplifying && (
                  <p className="text-yellow-400">
                    🧠 AI is actively processing articles for {levelConfig[selectedLevel].label} level...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}