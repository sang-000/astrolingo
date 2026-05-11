// NewsSimple.jsx - Fresh NASA News without Tailwind dependencies
import React, { useEffect, useState } from "react";

export default function NewsSimple() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simplifying, setSimplifying] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("student");
  const [simplifiedArticles, setSimplifiedArticles] = useState({});
  const [error, setError] = useState(null);

  // Fetch fresh NASA articles on component mount
  useEffect(() => {
    fetchFreshArticles();
  }, []);

  // Simplify articles when level changes
  useEffect(() => {
    if (articles.length > 0) {
      simplifyAllArticles();
    }
  }, [selectedLevel, articles]);

  const fetchFreshArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/articles/latest');
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.articles);
        console.log(`✅ Loaded ${data.articles.length} fresh articles`);
      } else {
        throw new Error(data.error || 'Failed to fetch articles');
      }
    } catch (err) {
      console.error('Error fetching fresh articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const simplifyAllArticles = async () => {
    try {
      setSimplifying(true);
      const simplified = {};
      
      for (const article of articles) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/articles/simplify?level=${selectedLevel}&content=${encodeURIComponent(article.description)}`
          );
          const data = await response.json();
          
          if (data.success) {
            simplified[article.id] = data.simplifiedContent;
          } else {
            simplified[article.id] = article.description; // Fallback to original
          }
        } catch (err) {
          console.error(`Error simplifying article ${article.id}:`, err);
          simplified[article.id] = article.description; // Fallback to original
        }
      }
      
      setSimplifiedArticles(simplified);
    } catch (err) {
      console.error('Error in simplification process:', err);
    } finally {
      setSimplifying(false);
    }
  };

  const levelConfig = {
    child: { icon: '👶', label: 'Child', color: '#ec4899' },
    student: { icon: '🎓', label: 'Student', color: '#3b82f6' },
    researcher: { icon: '🧑‍🔬', label: 'Researcher', color: '#8b5cf6' }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    },
    header: {
      position: 'sticky',
      top: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
      zIndex: 10,
      padding: '2rem'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      margin: 0,
      textAlign: 'center'
    },
    subtitle: {
      color: '#a855f7',
      textAlign: 'center',
      margin: 0
    },
    levelButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    levelButton: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    activeButton: {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    },
    inactiveButton: {
      background: 'rgba(71, 85, 105, 0.5)',
      color: '#cbd5e1'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem'
    },
    articlesGrid: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    articleCard: {
      background: 'rgba(51, 65, 85, 0.5)',
      borderRadius: '1rem',
      overflow: 'hidden',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer'
    },
    articleImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover'
    },
    articleContent: {
      padding: '1.5rem'
    },
    articleTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
      lineHeight: '1.4'
    },
    articleDate: {
      color: '#a855f7',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    simplifiedBox: {
      background: 'rgba(71, 85, 105, 0.5)',
      borderRadius: '0.5rem',
      padding: '1rem',
      borderLeft: '4px solid #a855f7',
      marginBottom: '1rem'
    },
    simplifiedHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      color: '#a855f7'
    },
    readLink: {
      color: '#a855f7',
      textDecoration: 'none',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    refreshButton: {
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      margin: '2rem auto',
      display: 'block',
      transition: 'all 0.2s'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div className="loading-spinner"></div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🚀 Loading space news from the cosmos...</h2>
          <p style={{ color: '#a855f7', margin: 0 }}>Fetching the latest discoveries from NASA</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌌</div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Oops! Something went wrong</h2>
          <p style={{ color: '#ef4444', margin: '1rem 0' }}>{error}</p>
          <button 
            onClick={fetchFreshArticles}
            style={styles.refreshButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with toggle buttons */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🌌 Latest Space Discoveries</h1>
          <p style={styles.subtitle}>
            Fresh from NASA • {articles.length} articles • Always up-to-date
          </p>
          
          {/* Level Toggle Buttons */}
          <div style={styles.levelButtons}>
            {Object.entries(levelConfig).map(([level, config]) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                style={{
                  ...styles.levelButton,
                  ...(selectedLevel === level 
                    ? { ...styles.activeButton, background: config.color, color: 'white' }
                    : styles.inactiveButton
                  )
                }}
              >
                <span style={{ fontSize: '1.125rem' }}>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            ))}
          </div>
          
          {simplifying && (
            <div style={{ textAlign: 'center', color: '#a855f7', marginTop: '1rem' }}>
              <div className="loading-spinner" style={{ width: '1rem', height: '1rem', display: 'inline-block', marginRight: '0.5rem' }}></div>
              Simplifying content for {levelConfig[selectedLevel].label} level...
            </div>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      <div style={styles.articlesGrid}>
        {articles.map((article, index) => (
          <div
            key={article.id}
            style={styles.articleCard}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {/* Article Image */}
            <img
              src={article.imageUrl}
              alt={article.title}
              style={styles.articleImage}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=400&fit=crop';
              }}
            />

            {/* Article Content */}
            <div style={styles.articleContent}>
              <h3 style={styles.articleTitle}>{article.title}</h3>
              
              <div style={styles.articleDate}>
                📅 {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              {/* Simplified Content */}
              <div style={styles.simplifiedBox}>
                <div style={styles.simplifiedHeader}>
                  <span style={{ fontSize: '1.125rem' }}>{levelConfig[selectedLevel].icon}</span>
                  <span>{levelConfig[selectedLevel].label} Level</span>
                </div>
                <p style={{ margin: 0, lineHeight: '1.5', color: '#e2e8f0' }}>
                  {simplifiedArticles[article.id] || article.description}
                </p>
              </div>

              {/* Read Original Link */}
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.readLink}
              >
                <span>Read Original Article</span>
                <span>→</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchFreshArticles}
        disabled={loading}
        style={{
          ...styles.refreshButton,
          opacity: loading ? 0.5 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        {loading ? '🔄 Fetching Fresh News...' : '🔄 Fetch Fresh News'}
      </button>
    </div>
  );
}
