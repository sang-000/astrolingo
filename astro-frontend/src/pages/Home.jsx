import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1c 0%, #000000 100%)',
      color: '#ffffff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '60px' // Account for NASA navbar
    },
    hero: {
      textAlign: 'center',
      padding: '4rem 2rem',
      position: 'relative',
      zIndex: 2
    },
    title: {
      fontSize: 'clamp(3rem, 8vw, 6rem)',
      fontWeight: 700,
      margin: '0 0 1rem 0',
      color: '#ffffff',
      textShadow: '0 0 30px rgba(0, 188, 212, 0.6)',
      animation: isVisible ? 'fadeInUp 1s ease-out' : 'none',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
      color: 'rgba(248, 250, 252, 0.8)',
      margin: '0 0 3rem 0',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      animation: isVisible ? 'fadeInUp 1s ease-out 0.3s both' : 'none'
    },
    ctaSection: {
      textAlign: 'center',
      padding: '4rem 2rem',
      animation: isVisible ? 'fadeInUp 1s ease-out 0.6s both' : 'none'
    },
    ctaTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#f8fafc'
    },
    ctaDescription: {
      fontSize: '1.2rem',
      color: '#40e0d0',
      marginBottom: '2rem'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    primaryButton: {
      background: 'linear-gradient(45deg, #40e0d0, #00bcd4)',
      color: '#000',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '2rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block',
      boxShadow: '0 4px 15px rgba(64, 224, 208, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    secondaryButton: {
      background: 'transparent',
      color: '#40e0d0',
      border: '2px solid #40e0d0',
      padding: '1rem 2rem',
      borderRadius: '2rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    backgroundAnimation: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 20% 80%, rgba(64, 224, 208, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 188, 212, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(64, 224, 208, 0.05) 0%, transparent 50%)
      `,
      animation: 'float 6s ease-in-out infinite'
    },
    // Featured News Styles
    featuredNewsSection: {
      background: 'rgba(26, 26, 46, 0.8)',
      color: '#f8fafc',
      padding: '4rem 0',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      borderTop: '1px solid rgba(64, 224, 208, 0.2)'
    },
    featuredNewsContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem'
    },
    featuredNewsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '3rem',
      borderBottom: '1px solid rgba(64, 224, 208, 0.2)',
      paddingBottom: '1rem'
    },
    featuredNewsTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#f8fafc',
      margin: 0,
      letterSpacing: '-0.025em'
    },
    recentlyPublishedLink: {
      color: '#40e0d0',
      textDecoration: 'none',
      fontSize: '1.1rem',
      fontWeight: '500',
      transition: 'color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    mainNewsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      marginBottom: '3rem'
    },
    featuredArticle: {
      background: 'rgba(26, 26, 46, 0.6)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(64, 224, 208, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid rgba(64, 224, 208, 0.2)'
    },
    featuredImageContainer: {
      position: 'relative',
      height: '300px',
      overflow: 'hidden'
    },
    featuredImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    articleLabel: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      background: '#1e293b',
      color: 'white',
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      borderRadius: '0.25rem',
      letterSpacing: '0.05em'
    },
    readTime: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      borderRadius: '0.25rem'
    },
    featuredContent: {
      padding: '1.5rem'
    },
    featuredHeadline: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#0f172a',
      lineHeight: '1.3',
      margin: '0 0 1rem 0'
    },
    featuredExcerpt: {
      color: '#64748b',
      lineHeight: '1.6',
      margin: 0,
      fontSize: '1rem'
    },
    sideArticlesGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    sideArticle: {
      background: '#ffffff',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    sideImageContainer: {
      position: 'relative',
      height: '150px',
      overflow: 'hidden'
    },
    sideImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    sideHeadline: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#0f172a',
      lineHeight: '1.4',
      margin: 0,
      padding: '1rem'
    },
    circularThumbnailsSection: {
      borderTop: '1px solid #e2e8f0',
      paddingTop: '2rem'
    },
    circularSectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '1.5rem',
      margin: '0 0 1.5rem 0'
    },
    circularThumbnailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1.5rem'
    },
    circularThumbnail: {
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.3s ease'
    },
    circularImageContainer: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      overflow: 'hidden',
      margin: '0 auto 1rem auto',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    circularImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    circularTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#0f172a',
      lineHeight: '1.3',
      margin: '0 0 0.5rem 0',
      maxWidth: '150px',
      margin: '0 auto 0.5rem auto'
    },
    circularReadTime: {
      fontSize: '0.75rem',
      color: '#64748b',
      fontWeight: '500'
    }
  };

  const handleButtonHover = (e, isHover) => {
    if (isHover) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
    } else {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    }
  };

  const handleNewsCardHover = (e, isHover) => {
    if (isHover) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
    } else {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = e.currentTarget.classList.contains('featured') 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
        : '0 2px 4px rgba(0, 0, 0, 0.1)';
    }
  };

  const handleCircularHover = (e, isHover) => {
    if (isHover) {
      e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
    } else {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundAnimation}></div>
      
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>AstroLingo</h1>
        <p style={styles.subtitle}>
          Empowering Minds to Think Beyond the Sky
        </p>
      </section>


      {/* Featured News Section */}
      <section style={styles.featuredNewsSection}>
        <div className="featured-news-container" style={styles.featuredNewsContainer}>
          {/* Header */}
          <div className="featured-news-header" style={styles.featuredNewsHeader}>
            <h2 className="featured-news-title" style={styles.featuredNewsTitle}>Featured News</h2>
            <Link to="/news" style={styles.recentlyPublishedLink}>
              Recently Published →
            </Link>
          </div>

          {/* Main Grid */}
          <div className="main-news-grid" style={styles.mainNewsGrid}>
            {/* Featured Article (Left) */}
            <div 
              style={styles.featuredArticle}
              onMouseEnter={(e) => handleNewsCardHover(e, true)}
              onMouseLeave={(e) => handleNewsCardHover(e, false)}
            >
              <div style={styles.featuredImageContainer}>
                <img 
                  src="https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&h=400&fit=crop" 
                  alt="Featured space discovery"
                  style={styles.featuredImage}
                />
                <div style={styles.articleLabel}>NEWS RELEASE</div>
                <div style={styles.readTime}>8 MIN READ</div>
              </div>
              <div style={styles.featuredContent}>
                <h3 className="featured-headline" style={styles.featuredHeadline}>
                  Discovery Alert: 'Baby' Planet Photographed in a Ring around a Star for the First Time!
                </h3>
                <p style={styles.featuredExcerpt}>
                  Astronomers have captured the first direct image of a young planet forming within the dusty disk surrounding its host star, providing unprecedented insights into planetary formation.
                </p>
              </div>
            </div>

            {/* Side Articles (Right) */}
            <div className="side-articles-grid" style={styles.sideArticlesGrid}>
              <div 
                style={styles.sideArticle}
                onMouseEnter={(e) => handleNewsCardHover(e, true)}
                onMouseLeave={(e) => handleNewsCardHover(e, false)}
              >
                <div style={styles.sideImageContainer}>
                  <img 
                    src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=300&h=200&fit=crop" 
                    alt="Mars mission"
                    style={styles.sideImage}
                  />
                  <div style={styles.articleLabel}>ARTICLE</div>
                  <div style={styles.readTime}>5 MIN READ</div>
                </div>
                <h4 className="side-headline" style={styles.sideHeadline}>
                  NASA's Perseverance Rover Discovers Ancient River Delta on Mars
                </h4>
              </div>

              <div 
                style={styles.sideArticle}
                onMouseEnter={(e) => handleNewsCardHover(e, true)}
                onMouseLeave={(e) => handleNewsCardHover(e, false)}
              >
                <div style={styles.sideImageContainer}>
                  <img 
                    src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop" 
                    alt="Space telescope"
                    style={styles.sideImage}
                  />
                  <div style={styles.articleLabel}>BLOG</div>
                  <div style={styles.readTime}>3 MIN READ</div>
                </div>
                <h4 className="side-headline" style={styles.sideHeadline}>
                  James Webb Space Telescope Reveals Stunning Galaxy Formations
                </h4>
              </div>

              <div 
                style={styles.sideArticle}
                onMouseEnter={(e) => handleNewsCardHover(e, true)}
                onMouseLeave={(e) => handleNewsCardHover(e, false)}
              >
                <div style={styles.sideImageContainer}>
                  <img 
                    src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=300&h=200&fit=crop" 
                    alt="Asteroid mission"
                    style={styles.sideImage}
                  />
                  <div style={styles.articleLabel}>NEWS RELEASE</div>
                  <div style={styles.readTime}>6 MIN READ</div>
                </div>
                <h4 className="side-headline" style={styles.sideHeadline}>
                  DART Mission Successfully Alters Asteroid's Trajectory
                </h4>
              </div>

              <div 
                style={styles.sideArticle}
                onMouseEnter={(e) => handleNewsCardHover(e, true)}
                onMouseLeave={(e) => handleNewsCardHover(e, false)}
              >
                <div style={styles.sideImageContainer}>
                  <img 
                    src="https://images.unsplash.com/photo-1517976487492-5750f3195933?w=300&h=200&fit=crop" 
                    alt="ISS mission"
                    style={styles.sideImage}
                  />
                  <div style={styles.articleLabel}>ARTICLE</div>
                  <div style={styles.readTime}>4 MIN READ</div>
                </div>
                <h4 className="side-headline" style={styles.sideHeadline}>
                  International Space Station Celebrates 25 Years in Orbit
                </h4>
              </div>
            </div>
          </div>

          {/* Bottom Circular Thumbnails Row */}
          <div style={styles.circularThumbnailsSection}>
            <h3 style={styles.circularSectionTitle}>More Stories</h3>
            <div className="circular-thumbnails-grid" style={styles.circularThumbnailsGrid}>
              {[
                { 
                  image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=150&h=150&fit=crop",
                  title: "Solar Flare Activity Reaches Peak",
                  readTime: "2 MIN READ"
                },
                { 
                  image: "https://images.unsplash.com/photo-1608178398319-48f814d0750c?w=150&h=150&fit=crop",
                  title: "New Exoplanet Discovery",
                  readTime: "3 MIN READ"
                },
                { 
                  image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=150&h=150&fit=crop",
                  title: "Lunar Base Construction Plans",
                  readTime: "5 MIN READ"
                },
                { 
                  image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=150&h=150&fit=crop",
                  title: "SpaceX Dragon Mission Update",
                  readTime: "4 MIN READ"
                },
                { 
                  image: "https://images.unsplash.com/photo-1614314107768-6018061b5b72?w=150&h=150&fit=crop",
                  title: "Asteroid Mining Technology",
                  readTime: "6 MIN READ"
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  style={styles.circularThumbnail}
                  onMouseEnter={(e) => handleCircularHover(e, true)}
                  onMouseLeave={(e) => handleCircularHover(e, false)}
                >
                  <div style={styles.circularImageContainer}>
                    <img 
                      src={item.image}
                      alt={item.title}
                      style={styles.circularImage}
                    />
                  </div>
                  <h5 style={styles.circularTitle}>{item.title}</h5>
                  <span style={styles.circularReadTime}>{item.readTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Explore the Universe?</h2>
        <p style={styles.ctaDescription}>
          Join thousands of space enthusiasts learning about the cosmos
        </p>
        <div style={styles.buttonContainer}>
          {token ? (
            <>
              <Link 
                to="/dashboard" 
                style={styles.primaryButton}
                className="home-primary-btn"
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Go to Dashboard
              </Link>
              <Link 
                to="/news" 
                style={styles.secondaryButton}
                className="home-secondary-btn"
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Explore News
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/register" 
                style={styles.primaryButton}
                className="home-primary-btn"
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Start Your Journey
              </Link>
              <Link 
                to="/login" 
                style={styles.secondaryButton}
                className="home-secondary-btn"
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
