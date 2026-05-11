import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  const styles = {
    nav: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: isScrolled 
        ? 'rgba(15, 23, 42, 0.95)' 
        : 'linear-gradient(90deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      backdropFilter: isScrolled ? 'blur(10px)' : 'none',
      borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
      boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.3)' : 'none',
      transition: 'all 0.3s ease'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    navContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '4rem'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'white',
      textDecoration: 'none',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
    },
    logoIcon: {
      fontSize: '2rem',
      animation: 'float 3s ease-in-out infinite'
    },
    desktopMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    navLink: {
      color: '#cbd5e1',
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    activeNavLink: {
      color: '#a855f7',
      background: 'rgba(168, 85, 247, 0.1)',
      transform: 'translateY(-1px)'
    },
    loginButton: {
      color: '#a855f7',
      border: '2px solid #a855f7',
      background: 'transparent',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    registerButton: {
      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    logoutButton: {
      background: '#dc2626',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    mobileMenuButton: {
      display: 'none',
      background: 'none',
      border: 'none',
      color: '#cbd5e1',
      padding: '0.5rem',
      cursor: 'pointer',
      transition: 'color 0.3s ease'
    },
    mobileMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'rgba(15, 23, 42, 0.98)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(139, 92, 246, 0.2)',
      padding: '1rem',
      transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
      opacity: isMobileMenuOpen ? 1 : 0,
      visibility: isMobileMenuOpen ? 'visible' : 'hidden',
      transition: 'all 0.3s ease'
    },
    mobileNavLink: {
      display: 'block',
      color: '#cbd5e1',
      textDecoration: 'none',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      marginBottom: '0.5rem'
    },
    mobileButtonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginTop: '1rem'
    }
  };

  const handleLinkHover = (e, isHover) => {
    if (isHover) {
      e.target.style.color = '#ffffff';
      e.target.style.transform = 'translateY(-1px)';
    } else if (!isActiveRoute(e.target.getAttribute('href'))) {
      e.target.style.color = '#cbd5e1';
      e.target.style.transform = 'translateY(0)';
    }
  };

  const handleButtonHover = (e, isHover, type) => {
    if (isHover) {
      e.target.style.transform = 'translateY(-2px)';
      if (type === 'login') {
        e.target.style.background = '#a855f7';
        e.target.style.color = 'white';
      } else if (type === 'register') {
        e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
      } else if (type === 'logout') {
        e.target.style.background = '#b91c1c';
      }
    } else {
      e.target.style.transform = 'translateY(0)';
      if (type === 'login') {
        e.target.style.background = 'transparent';
        e.target.style.color = '#a855f7';
      } else if (type === 'register') {
        e.target.style.boxShadow = 'none';
      } else if (type === 'logout') {
        e.target.style.background = '#dc2626';
      }
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.navContent}>
          {/* Logo */}
          <Link 
            to="/" 
            style={styles.logo}
            onMouseEnter={(e) => {
              e.target.style.color = '#a855f7';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'white';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span style={styles.logoIcon}>🚀</span>
            <span>AstroLingo</span>
          </Link>

          {/* Desktop Menu */}
          <div className="desktop-menu" style={styles.desktopMenu}>
            <Link 
              to="/" 
              style={{
                ...styles.navLink,
                ...(isActiveRoute('/') ? styles.activeNavLink : {})
              }}
              onMouseEnter={(e) => handleLinkHover(e, true)}
              onMouseLeave={(e) => handleLinkHover(e, false)}
            >
              🏠 Home
            </Link>
            <Link 
              to="/news" 
              style={{
                ...styles.navLink,
                ...(isActiveRoute('/news') ? styles.activeNavLink : {})
              }}
              onMouseEnter={(e) => handleLinkHover(e, true)}
              onMouseLeave={(e) => handleLinkHover(e, false)}
            >
              📰 News
            </Link>
            <Link 
              to="/space-news" 
              style={{
                ...styles.navLink,
                ...(isActiveRoute('/space-news') ? styles.activeNavLink : {})
              }}
              onMouseEnter={(e) => handleLinkHover(e, true)}
              onMouseLeave={(e) => handleLinkHover(e, false)}
            >
              🚀 Live News
            </Link>
            <Link 
              to="/apod" 
              style={{
                ...styles.navLink,
                ...(isActiveRoute('/apod') ? styles.activeNavLink : {})
              }}
              onMouseEnter={(e) => handleLinkHover(e, true)}
              onMouseLeave={(e) => handleLinkHover(e, false)}
            >
              🌌 NASA APOD
            </Link>
            <Link 
              to="/asteroids" 
              style={{
                ...styles.navLink,
                ...(isActiveRoute('/asteroids') ? styles.activeNavLink : {})
              }}
              onMouseEnter={(e) => handleLinkHover(e, true)}
              onMouseLeave={(e) => handleLinkHover(e, false)}
            >
              ☄️ Asteroids
            </Link>

            {token ? (
              <>
                <button 
                  onClick={handleLogout}
                  style={styles.logoutButton}
                  onMouseEnter={(e) => handleButtonHover(e, true, 'logout')}
                  onMouseLeave={(e) => handleButtonHover(e, false, 'logout')}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  style={styles.loginButton}
                  onMouseEnter={(e) => handleButtonHover(e, true, 'login')}
                  onMouseLeave={(e) => handleButtonHover(e, false, 'login')}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  style={styles.registerButton}
                  onMouseEnter={(e) => handleButtonHover(e, true, 'register')}
                  onMouseLeave={(e) => handleButtonHover(e, false, 'register')}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            style={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div style={styles.mobileMenu}>
          <Link 
            to="/" 
            style={styles.mobileNavLink}
            onClick={closeMobileMenu}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(168, 85, 247, 0.1)';
              e.target.style.color = '#a855f7';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#cbd5e1';
            }}
          >
            🏠 Home
          </Link>
          <Link 
            to="/news" 
            style={styles.mobileNavLink}
            onClick={closeMobileMenu}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(168, 85, 247, 0.1)';
              e.target.style.color = '#a855f7';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#cbd5e1';
            }}
          >
            📰 News
          </Link>
          <Link 
            to="/space-news" 
            style={styles.mobileNavLink}
            onClick={closeMobileMenu}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(168, 85, 247, 0.1)';
              e.target.style.color = '#a855f7';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#cbd5e1';
            }}
          >
            🚀 Live News
          </Link>
          <Link 
            to="/apod" 
            style={styles.mobileNavLink}
            onClick={closeMobileMenu}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(168, 85, 247, 0.1)';
              e.target.style.color = '#a855f7';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#cbd5e1';
            }}
          >
            🌌 NASA APOD
          </Link>
          <Link 
            to="/asteroids" 
            style={styles.mobileNavLink}
            onClick={closeMobileMenu}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(168, 85, 247, 0.1)';
              e.target.style.color = '#a855f7';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#cbd5e1';
            }}
          >
            ☄️ Asteroids
          </Link>

          {token ? (
            <>
              <div style={styles.mobileButtonContainer}>
                <button 
                  onClick={handleLogout}
                  style={{...styles.logoutButton, width: '100%'}}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={styles.mobileButtonContainer}>
              <Link 
                to="/login" 
                style={{...styles.loginButton, textAlign: 'center', display: 'block'}}
                onClick={closeMobileMenu}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                style={{...styles.registerButton, textAlign: 'center', display: 'block'}}
                onClick={closeMobileMenu}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
        
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
