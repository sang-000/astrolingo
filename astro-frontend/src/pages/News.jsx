// News.jsx - Secure NASA & Spaceflight News with AI Simplification
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchInfo, setFetchInfo] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRealTime, setIsRealTime] = useState(true);
  const navigate = useNavigate();

  // Check authentication on component mount (temporarily disabled for testing)
  useEffect(() => {
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   navigate('/login');
    //   return;
    // }
  }, [navigate]);

  // Fetch live news on component mount
  useEffect(() => {
    fetchLiveNews(); // Always fetch for testing
  }, []);

  const fetchLiveNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startTime = Date.now();
      console.log(`🚀 Fetching news from MongoDB at ${new Date().toLocaleTimeString()}...`);
      
      // Fetch from MongoDB articles endpoint
      const response = await fetch(`http://localhost:5000/api/news/articles?limit=20&t=${Date.now()}`, {
        headers: {
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
          totalFetched: data.pagination?.totalCount || 0,
          sources: ['NASA', 'Spaceflight News', 'Universe Today', 'ESA'],
          fetchedAt: data.metadata?.fetchedAt || new Date().toISOString(),
          cacheStatus: data.metadata?.cacheStatus || 'DATABASE',
          fetchDuration: Date.now() - startTime
        });
        setLastRefresh(new Date());
        setIsRealTime(true);
        
        console.log(`✅ Loaded ${(data.articles || []).length} articles from MongoDB in ${Date.now() - startTime}ms`);
      } else {
        throw new Error(data.error || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('❌ Error fetching news:', err);
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
                {article.image && (
                  <div className="nasa-article-image-container">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="nasa-article-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="nasa-article-overlay">
                      <span className="nasa-article-source">{article.source}</span>
                    </div>
                  </div>
                )}

                <div className="nasa-article-content">
                  {/* Article Meta */}
                  <div className="nasa-article-meta">
                    <span className="nasa-article-date">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Recent'}
                    </span>
                  </div>

                  {/* Article Title */}
                  <h3 
                    className="nasa-article-title nasa-article-title-clickable"
                    onClick={() => navigate(`/article/${article.id || article._id}`)}
                  >
                    {article.title}
                  </h3>

                  {/* Article Actions */}
                  <div className="nasa-article-actions">
                    <button 
                      onClick={() => navigate(`/article/${article.id || article._id}`)}
                      className="nasa-btn-small"
                      style={{ marginRight: '10px' }}
                    >
                      Explore Discovery
                    </button>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nasa-btn-small"
                    >
                      Read Original
                      <svg className="nasa-external-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="nasa-empty-state">
            <div className="nasa-empty-icon">🌌</div>
            <h3>No Space Intelligence Available</h3>
            <p>Mission data is currently unavailable. Please try again later.</p>
            <button onClick={fetchLiveNews} className="nasa-btn">
              Refresh Intelligence
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
