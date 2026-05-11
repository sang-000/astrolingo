// SpaceNews.jsx - Real-time NASA/ISRO News with AI Simplification
import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from 'dompurify';

export default function SpaceNews() {
  // State management
  const [articles, setArticles] = useState([]);
  const [mode, setMode] = useState('student');
  const [loading, setLoading] = useState(true);
  const [simplifying, setSimplifying] = useState(false);
  const [simplifiedContent, setSimplifiedContent] = useState({});
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState({});

  // Mode configuration
  const modeConfig = {
    child: { 
      icon: '👧', 
      label: 'Child', 
      description: 'Simple & Fun' 
    },
    student: { 
      icon: '🎓', 
      label: 'Student', 
      description: 'Educational' 
    },
    researcher: { 
      icon: '🔬', 
      label: 'Researcher', 
      description: 'Technical' 
    }
  };

  // Fetch real-time news
  const fetchRealtimeNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Fetching news...');
      const response = await axios.get('http://localhost:5000/api/news/realtime');
      
      if (response.data.success) {
        setArticles(response.data.articles);
        setLastFetched(new Date());
        setIsRealTime(true);
      } else {
        throw new Error(response.data.error || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch news');
      setIsRealTime(false);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRealtimeNews();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-6 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-3xl font-bold text-white mb-4">Loading Space News...</h2>
          <p className="text-purple-300">Fetching the latest updates from NASA and ISRO</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/50 rounded-xl max-w-md mx-4">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={fetchRealtimeNews}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔄 Try Again
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Make sure the backend server is running on port 5000
          </p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sanitize content
  const sanitizeContent = (html) => {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'a', 'strong', 'em', 'ul', 'ol', 'li', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Space News Explorer
              </span>
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-300">
                  {isRealTime ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => document.getElementById('mode-selector')?.classList.toggle('hidden')}
                >
                  <span>{modeConfig[mode].icon}</span>
                  <span>{modeConfig[mode].label}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div id="mode-selector" className="hidden absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg z-20">
                  {Object.entries(modeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setMode(key)}
                      className={`w-full text-left px-4 py-2 flex items-center space-x-2 ${
                        mode === key 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={fetchRealtimeNews}
                disabled={loading || simplifying}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  loading || simplifying
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Simplification Status */}
        {simplifying && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="loading-spinner w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-yellow-300 font-medium">
                Simplifying content for {mode} level...
              </span>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌌</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Articles Found</h2>
            <p className="text-gray-400 mb-6">We couldn't find any space news articles.</p>
            <button
              onClick={fetchRealtimeNews}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article 
                key={article.id}
                className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-colors"
              >
                {article.imageUrl && (
                  <div className="h-48 bg-slate-800 overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-purple-400 bg-slate-700/50 px-2 py-1 rounded">
                      {article.source}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {article.title}
                  </h2>
                  
                  <div 
                    className="prose prose-invert text-gray-300 mb-4 text-sm line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeContent(article.description || article.content || '')
                    }}
                  />
                  
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                      Read more
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Data provided by NASA and ISRO APIs
            </p>
            <p className="text-gray-500 text-sm mt-2 md:mt-0">
              Last updated: {lastFetched ? lastFetched.toLocaleTimeString() : 'Never'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
