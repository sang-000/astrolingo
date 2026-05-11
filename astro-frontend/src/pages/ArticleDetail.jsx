// pages/ArticleDetail.jsx
// Detailed article page with AI simplification toggles

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('student');
  const [simplifying, setSimplifying] = useState(false);
  const [simplifiedContent, setSimplifiedContent] = useState('');

  // Check authentication
  useEffect(() => {
    // Temporarily disabled for testing
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   navigate('/login');
    //   return;
    // }
  }, [navigate]);

  // Fetch article details
  useEffect(() => {
    if (id) {
      fetchArticleDetails();
    }
  }, [id]);

  // Update simplified content when level changes
  useEffect(() => {
    if (article) {
      updateSimplifiedContent();
    }
  }, [selectedLevel, article]);

  const fetchArticleDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/news/articles/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        setError('Article not found');
        return;
      }

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setArticle(data.article);
        console.log('✅ Article loaded:', data.article.title);
      } else {
        throw new Error(data.error || 'Failed to fetch article');
      }
    } catch (err) {
      console.error('❌ Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSimplifiedContent = async () => {
    if (!article) return;

    setSimplifying(true);

    try {
      // Get simplified content from the article data
      let content = '';
      switch (selectedLevel) {
        case 'child':
          content = article.childContent || article.description || article.content;
          break;
        case 'student':
          content = article.studentContent || article.description || article.content;
          break;
        case 'researcher':
          content = article.researcherContent || article.content || article.description;
          break;
        default:
          content = article.content || article.description;
      }

      // If no simplified content exists, try to fetch it
      if (!article.childContent || !article.studentContent || !article.researcherContent) {
        try {
          const response = await fetch(`http://localhost:5000/api/news/articles/${id}/simplified?level=${selectedLevel}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              content = data.content;
            }
          }
        } catch (fetchError) {
          console.warn('Could not fetch simplified content:', fetchError);
        }
      }

      setSimplifiedContent(content);
    } catch (error) {
      console.error('Error updating simplified content:', error);
      setSimplifiedContent(article.content || article.description || 'Content not available');
    } finally {
      setTimeout(() => setSimplifying(false), 300);
    }
  };

  const handleLevelChange = (newLevel) => {
    setSelectedLevel(newLevel);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="nasa-loading-container">
        <div className="nasa-loading-content">
          <div className="nasa-loading-spinner"></div>
          <h2 className="nasa-loading-title">Loading Article</h2>
          <p className="nasa-loading-subtitle">Accessing space intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nasa-error-container">
        <div className="nasa-error-content">
          <div className="nasa-error-icon">🌌</div>
          <h2 className="nasa-error-title">Article Not Found</h2>
          <p className="nasa-error-message">{error}</p>
          <button onClick={() => navigate('/news')} className="nasa-btn">
            Back to News
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="nasa-error-container">
        <div className="nasa-error-content">
          <div className="nasa-error-icon">🌌</div>
          <h2 className="nasa-error-title">No Article Data</h2>
          <button onClick={() => navigate('/news')} className="nasa-btn">
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nasa-article-detail-container">
      {/* Header with Back Button */}
      <div className="nasa-article-header">
        <div className="nasa-container">
          <button onClick={() => navigate('/news')} className="nasa-back-btn">
            <svg className="nasa-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to News
          </button>
        </div>
      </div>

      {/* Article Content */}
      <div className="nasa-container">
        <article className="nasa-article-detail">
          {/* Article Image */}
          {article.image && (
            <div className="nasa-article-detail-image-container">
              <img
                src={article.image}
                alt={article.title}
                className="nasa-article-detail-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=600&fit=crop';
                }}
              />
            </div>
          )}

          {/* Article Header */}
          <div className="nasa-article-detail-header">
            <div className="nasa-article-detail-meta">
              <span className="nasa-article-source">{article.source}</span>
              <span className="nasa-article-date">{formatDate(article.publishedAt)}</span>
            </div>
            
            <h1 className="nasa-article-detail-title">{article.title}</h1>
            
            {article.description && (
              <p className="nasa-article-detail-description">{article.description}</p>
            )}

            {/* AI Simplification Controls */}
            <div className="nasa-article-simplification-controls">
              <div className="nasa-control-label">Reading Level:</div>
              <div className="nasa-toggle-group">
                <button
                  onClick={() => handleLevelChange('child')}
                  className={`nasa-toggle-btn ${selectedLevel === 'child' ? 'active child' : ''}`}
                  disabled={simplifying}
                >
                  🧒 Child
                </button>
                <button
                  onClick={() => handleLevelChange('student')}
                  className={`nasa-toggle-btn ${selectedLevel === 'student' ? 'active student' : ''}`}
                  disabled={simplifying}
                >
                  🎓 Student
                </button>
                <button
                  onClick={() => handleLevelChange('researcher')}
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

          {/* Article Content */}
          <div className="nasa-article-detail-content">
            {simplifying ? (
              <div className="nasa-content-loading">
                <div className="nasa-spinner-small"></div>
                <p>Loading simplified content...</p>
              </div>
            ) : (
              <div className="nasa-article-text">
                {simplifiedContent || 'Simplified version not available. Please try again later.'}
              </div>
            )}
          </div>

          {/* Article Actions */}
          <div className="nasa-article-detail-actions">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nasa-btn nasa-btn-primary"
            >
              Read Original Article
              <svg className="nasa-external-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <button onClick={() => navigate('/news')} className="nasa-btn nasa-btn-secondary">
              Back to News Feed
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
