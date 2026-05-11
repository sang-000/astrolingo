// components/AuthGuard.jsx
// Component to protect routes and handle authentication redirection

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="nasa-loading-container">
        <div className="nasa-loading-content">
          <div className="nasa-loading-spinner"></div>
          <h2 className="nasa-loading-title">Initializing AstroLingo</h2>
          <p className="nasa-loading-subtitle">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default AuthGuard;
