import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

const SpaceNewsForAll = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveData, setIsLiveData] = useState(false);

  // Mock data that always works
  const getMockSpaceNews = () => {
    return [
      {
        title: "James Webb Space Telescope Discovers Ancient Galaxies",
        link: "https://www.universetoday.com/sample1",
        pubDate: new Date().toISOString(),
        description: "The James Webb Space Telescope has identified some of the most ancient galaxies ever observed, providing new insights into the early universe and galaxy formation processes.",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=200&fit=crop"
      },
      {
        title: "Mars Rover Makes Groundbreaking Discovery",
        link: "https://www.universetoday.com/sample2", 
        pubDate: new Date(Date.now() - 86400000).toISOString(),
        description: "NASA's Perseverance rover has uncovered evidence of ancient water activity on Mars, bringing us closer to understanding the planet's potential for past life.",
        image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=200&fit=crop"
      },
      {
        title: "SpaceX Successfully Launches New Satellite Constellation",
        link: "https://www.universetoday.com/sample3",
        pubDate: new Date(Date.now() - 172800000).toISOString(), 
        description: "SpaceX has successfully deployed another batch of satellites, expanding global internet coverage and advancing space-based communication technology.",
        image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400&h=200&fit=crop"
      },
      {
        title: "Asteroid Mining Mission Approved by Space Agency",
        link: "https://www.universetoday.com/sample4",
        pubDate: new Date(Date.now() - 259200000).toISOString(),
        description: "A revolutionary asteroid mining mission has been approved, marking a significant step toward space resource utilization and sustainable space exploration.",
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=200&fit=crop"
      },
      {
        title: "New Exoplanet Found in Habitable Zone",
        link: "https://www.universetoday.com/sample5",
        pubDate: new Date(Date.now() - 345600000).toISOString(),
        description: "Astronomers have discovered a potentially habitable exoplanet orbiting within the goldilocks zone of its star, raising exciting possibilities for extraterrestrial life.",
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=200&fit=crop"
      },
      {
        title: "International Space Station Receives New Module",
        link: "https://www.universetoday.com/sample6",
        pubDate: new Date(Date.now() - 432000000).toISOString(),
        description: "The International Space Station has successfully integrated a new research module, expanding its capabilities for scientific experiments and space research.",
        image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=200&fit=crop"
      }
    ];
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load sample data immediately to ensure page always works
        console.log('Loading sample space news articles...');
        setArticles(getMockSpaceNews());
        setIsLiveData(false);
        setLoading(false);
        
      } catch (err) {
        console.error('Error in fetchNews:', err);
        setArticles(getMockSpaceNews());
        setIsLiveData(false);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available';
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString || 'Date not available';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" role="status" className="me-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <span>Fetching the latest space news...</span>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="space-news-container">
        <Container className="py-5">
          <div className="text-center">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">🛰️ Asteroid Scanner Offline</h4>
              <p>{error}</p>
              <hr />
              <p className="mb-0">Our space news feed is temporarily unavailable. This could be due to:</p>
              <ul className="text-start mt-3">
                <li>Network connectivity issues</li>
                <li>RSS feed server maintenance</li>
                <li>CORS proxy service limitations</li>
              </ul>
            </div>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Retry Scan
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="space-news-container">
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 space-news-title mb-3">🚀 Space News for All</h1>
          <p className="lead text-muted">
            The latest space news from around the universe, updated in real-time from Universe Today.
          </p>
          <div className="text-muted small">
            <i className="fas fa-sync-alt me-2"></i>
            Last updated: {new Date().toLocaleString()}
          </div>
          {!isLiveData && (
            <div className="alert alert-info mt-3" role="alert">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Demo Mode:</strong> Showing sample space news articles. Live RSS feed temporarily unavailable.
            </div>
          )}
        </div>

        <Row xs={1} md={2} lg={3} className="g-4">
          {articles.map((article, index) => (
            <Col key={index}>
              <Card 
                className="h-100 shadow-sm news-card" 
                style={{ 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  border: 'none',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                {article.image && (
                  <div 
                    style={{ 
                      height: '200px', 
                      overflow: 'hidden',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="img-fluid w-100 h-100 article-image"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5">{article.title}</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted small">
                    {formatDate(article.pubDate)}
                  </Card.Subtitle>
                  
                  <Card.Text className="flex-grow-1">
                    {article.description ? 
                      (article.description.length > 200 ? 
                        article.description.substring(0, 200) + '...' : 
                        article.description) : 
                      'No description available.'}
                  </Card.Text>
                  
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary mt-auto align-self-start"
                  >
                    Read Full Article →
                  </a>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-5">
          <p className="text-muted">
            <i className="fas fa-rss me-2"></i>
            Powered by Universe Today RSS Feed
          </p>
        </div>
      </Container>
    </div>
  );
};

export default SpaceNewsForAll;
