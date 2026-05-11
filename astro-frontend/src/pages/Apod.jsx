// pages/Apod.jsx
// NASA APOD Gallery with interactive carousel and AI-enhanced descriptions

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const APOD = () => {
  const [apodData, setApodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAPOD, setSelectedAPOD] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    // Temporarily disabled for testing
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   navigate('/login');
    //   return;
    // }
  }, [navigate]);

  // Fetch APOD gallery
  useEffect(() => {
    fetchAPODGallery();
  }, []);

  const fetchAPODGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get existing gallery data
      let response = await fetch('http://localhost:5000/api/apod/gallery?limit=15', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let data = await response.json();

      // If no data available, trigger fetch and wait
      if (!data.success || !data.data || data.data.length === 0) {
        console.log('📡 No APOD data found, fetching from NASA...');
        
        // Trigger APOD fetch
        await fetch('http://localhost:5000/api/apod/fetch?count=15', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Wait a bit for processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Try to get data again
        response = await fetch('http://localhost:5000/api/apod/gallery?limit=15', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          data = await response.json();
        }
      }

      if (data.success && data.data && data.data.length > 0) {
        // Sort data to ensure today's image is first, then previous days
        const sortedData = data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setApodData(sortedData);
        setSelectedAPOD(sortedData[0]);
        setCurrentIndex(0);
        console.log(`✅ Loaded ${sortedData.length} APOD entries`);
      } else {
        throw new Error('No APOD data available after fetch attempt');
      }
    } catch (err) {
      console.error('❌ Error fetching APOD gallery:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAPODSelect = (apod, index) => {
    setSelectedAPOD(apod);
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedAPOD(apodData[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex < apodData.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedAPOD(apodData[newIndex]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDisplayDescription = (apod) => {
    return apod.shortDescription || 
           (apod.explanation ? apod.explanation.substring(0, 150) + '...' : 
           'Amazing cosmic view captured by space telescopes.');
  };

  const getDisplayCaption = (apod) => {
    return apod.creativeCaption || apod.title;
  };

  if (loading) {
    return (
      <div className="nasa-loading-container">
        <div className="nasa-loading-content">
          <div className="nasa-loading-spinner"></div>
          <h2 className="nasa-loading-title">Loading Cosmic Gallery</h2>
          <p className="nasa-loading-subtitle">Fetching astronomy pictures from NASA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nasa-error-container">
        <div className="nasa-error-content">
          <div className="nasa-error-icon">🌌</div>
          <h2 className="nasa-error-title">Gallery Unavailable</h2>
          <p className="nasa-error-message">{error}</p>
          <button onClick={fetchAPODGallery} className="nasa-btn">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!apodData.length) {
    return (
      <div className="nasa-error-container">
        <div className="nasa-error-content">
          <div className="nasa-error-icon">🌌</div>
          <h2 className="nasa-error-title">No Images Available</h2>
          <p className="nasa-error-message">APOD gallery is currently empty</p>
          <button onClick={fetchAPODGallery} className="nasa-btn">
            Refresh Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="apod-gallery-container">
      {/* Header */}
      <div className="apod-gallery-header">
        <div className="nasa-container">
          <h1 className="apod-gallery-title">
            🌌 NASA APOD Gallery
          </h1>
          <p className="apod-gallery-subtitle">
            Astronomy Picture of the Day • {apodData.length} cosmic wonders
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="nasa-container">
        <div className="apod-gallery-content">
          {/* Featured Image */}
          {selectedAPOD && (
            <div className="apod-featured-section">
              <div className="apod-featured-image-container">
                {selectedAPOD.media_type === 'image' ? (
                  <img
                    src={selectedAPOD.url}
                    alt={selectedAPOD.title}
                    className="apod-featured-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop';
                    }}
                  />
                ) : (
                  <div className="apod-video-container">
                    <iframe
                      src={selectedAPOD.url}
                      title={selectedAPOD.title}
                      className="apod-featured-video"
                      allowFullScreen
                    />
                  </div>
                )}
                
                {/* Navigation Arrows */}
                <button 
                  className="apod-nav-btn apod-nav-prev"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  className="apod-nav-btn apod-nav-next"
                  onClick={handleNext}
                  disabled={currentIndex === apodData.length - 1}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Featured Content */}
              <div className="apod-featured-content">
                <div className="apod-featured-meta">
                  <span className="apod-featured-date">
                    {formatDate(selectedAPOD.date)}
                  </span>
                  <span className="apod-featured-type">
                    {selectedAPOD.media_type === 'image' ? '📸 Image' : '🎥 Video'}
                  </span>
                </div>
                
                <h2 className="apod-featured-title">
                  {selectedAPOD.title}
                </h2>
                
                <p className="apod-featured-caption">
                  {getDisplayCaption(selectedAPOD)}
                </p>
                
                <div className="apod-featured-description">
                  {selectedAPOD.explanation}
                </div>
                
                <div className="apod-featured-actions">
                  {selectedAPOD.hdurl && (
                    <a
                      href={selectedAPOD.hdurl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apod-btn apod-btn-primary"
                    >
                      View HD Image
                      <svg className="apod-external-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  
                  {selectedAPOD.copyright && (
                    <span className="apod-copyright">
                      © {selectedAPOD.copyright}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Thumbnail Gallery */}
          <div className="apod-thumbnails-section">
            <h3 className="apod-thumbnails-title">Gallery ({apodData.length})</h3>
            <div className="apod-thumbnails-grid">
              {apodData.map((apod, index) => (
                <div
                  key={apod.date}
                  className={`apod-thumbnail-card ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => handleAPODSelect(apod, index)}
                >
                  <div className="apod-thumbnail-image-container">
                    {apod.media_type === 'image' ? (
                      <img
                        src={apod.url}
                        alt={apod.title}
                        className="apod-thumbnail-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=150&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="apod-thumbnail-video">
                        <div className="apod-video-icon">🎥</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="apod-thumbnail-content">
                    <div className="apod-thumbnail-date">
                      {new Date(apod.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <h4 className="apod-thumbnail-title">
                      {apod.title.length > 40 ? apod.title.substring(0, 40) + '...' : apod.title}
                    </h4>
                    <p className="apod-thumbnail-description">
                      {getDisplayDescription(apod)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APOD;
