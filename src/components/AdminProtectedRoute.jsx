import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  useEffect(() => {
    // Prevent browser caching of admin pages
    const preventCaching = () => {
      const metaTag = document.createElement('meta');
      metaTag.httpEquiv = 'Cache-Control';
      metaTag.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(metaTag);
      
      const pragmaTag = document.createElement('meta');
      pragmaTag.httpEquiv = 'Pragma';
      pragmaTag.content = 'no-cache';
      document.head.appendChild(pragmaTag);
      
      const expiresTag = document.createElement('meta');
      expiresTag.httpEquiv = 'Expires';
      expiresTag.content = '0';
      document.head.appendChild(expiresTag);
    };

    if (isAuthenticated && user?.role?.toLowerCase() === 'admin') {
      preventCaching();
      sessionStorage.removeItem('loggedOut');
    }

    // Cleanup function to remove meta tags
    return () => {
      const metaTags = document.querySelectorAll('meta[http-equiv]');
      metaTags.forEach(tag => {
        if (tag.getAttribute('http-equiv') === 'Cache-Control' || 
            tag.getAttribute('http-equiv') === 'Pragma' || 
            tag.getAttribute('http-equiv') === 'Expires') {
          tag.remove();
        }
      });
    };
  }, [isAuthenticated, user]);

  // Re-check authentication on every render to catch back button scenarios
  const currentAuthStatus = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // Check if user is not authenticated
  if (!currentAuthStatus) {
    // Redirect to admin login page specifically
    return <Navigate to="/admin-login" replace />;
  }

  // Check if user is authenticated but not an admin
  if (currentUser?.role?.toLowerCase() !== 'admin') {
    // Redirect to admin login page for non-admin users
    return <Navigate to="/admin-login" replace />;
  }

  // Check for session timeout or token expiry
  if (currentAuthStatus && currentUser) {
    try {
      // Verify token is still valid - check sessionStorage (not localStorage)
      const token = sessionStorage.getItem('token');
      if (!token || token.trim() === '') {
        return <Navigate to="/admin-login" replace />;
      }
      
      // Additional security check: verify token format (basic JWT check)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return <Navigate to="/admin-login" replace />;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return <Navigate to="/admin-login" replace />;
    }
  }

  return children;
};

export default AdminProtectedRoute;