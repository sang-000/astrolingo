// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';
import News from './pages/News';
import ArticleDetail from './pages/ArticleDetail';
import APOD from './pages/Apod';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import './styles.css';

// NASA-Inspired Navigation Component
const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isActive = (path) => {
    return location.pathname === path ? 'nasa-nav-link active' : 'nasa-nav-link';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="nasa-navbar">
        <div className="nasa-nav-container">
          <Link className="nasa-brand" to="/">
            AstroLingo
          </Link>
          
          <button className="nasa-mobile-toggle" id="mobile-menu-btn">
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className="nasa-nav-menu" id="nav-menu">
            <ul className="nasa-nav-list">
              <li className="nasa-nav-item">
                <Link className={isActive('/')} to="/">Home</Link>
              </li>
              {isAuthenticated && (
                <li className="nasa-nav-item">
                  <Link className={isActive('/news')} to="/news">News</Link>
                </li>
              )}
              <li className="nasa-nav-item">
                <Link className={isActive('/apod')} to="/apod">APOD</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li className="nasa-nav-item">
                    <button className="nasa-nav-link nasa-logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nasa-nav-item">
                    <Link className={isActive('/login')} to="/login">Login</Link>
                  </li>
                  <li className="nasa-nav-item">
                    <Link className={isActive('/register')} to="/register">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {isAuthenticated && (
        <div className="nasa-tagline">
          Stay updated with the latest from NASA & Space agencies around the world.
        </div>
      )}
    </>
  );
};

// Simple Space News component that always works
const SimpleSpaceNews = () => {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">🚀 Space News for All</h1>
        <p className="lead text-muted">
          The latest space news from around the universe.
        </p>
      </div>
      
      <div className="row g-4">
        {[
          {
            title: "James Webb Space Telescope Discovers Ancient Galaxies",
            description: "The James Webb Space Telescope has identified some of the most ancient galaxies ever observed.",
            image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=200&fit=crop",
            date: "October 10, 2024"
          },
          {
            title: "Mars Rover Makes Groundbreaking Discovery", 
            description: "NASA's Perseverance rover has uncovered evidence of ancient water activity on Mars.",
            image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=200&fit=crop",
            date: "October 9, 2024"
          },
          {
            title: "SpaceX Successfully Launches New Satellite Constellation",
            description: "SpaceX has successfully deployed another batch of satellites, expanding global internet coverage.",
            image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400&h=200&fit=crop", 
            date: "October 8, 2024"
          }
        ].map((article, index) => (
          <div key={index} className="col-md-4">
            <div className="card h-100 shadow-sm">
              <img src={article.image} className="card-img-top" alt={article.title} style={{height: '200px', objectFit: 'cover'}} />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{article.title}</h5>
                <p className="card-text text-muted small">{article.date}</p>
                <p className="card-text flex-grow-1">{article.description}</p>
                <a href="#" className="btn btn-outline-primary mt-auto">Read More</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navigation />
      
      <div className={`nasa-main-content ${isAuthenticated ? 'with-tagline' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <AuthGuard>
              <Home />
            </AuthGuard>
          } />
          <Route path="/news" element={
            <AuthGuard>
              <News />
            </AuthGuard>
          } />
          <Route path="/article/:id" element={
            <AuthGuard>
              <ArticleDetail />
            </AuthGuard>
          } />
          <Route path="/apod" element={
            <AuthGuard>
              <APOD />
            </AuthGuard>
          } />
          <Route path="/space-news" element={<SimpleSpaceNews />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
