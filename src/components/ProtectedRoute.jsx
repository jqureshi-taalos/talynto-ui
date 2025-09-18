import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  useEffect(() => {
    // Prevent browser caching of protected pages
    const preventCaching = () => {
      // Add cache control headers via meta tags
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

    if (isAuthenticated && requiredRole) {
      preventCaching();
      
      // Clear the logout flag since user is accessing a protected route
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
  }, [isAuthenticated, requiredRole]);

  // Re-check authentication on every render to catch back button scenarios
  const currentAuthStatus = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!currentAuthStatus) {
    // Always redirect to regular login when authentication fails
    // Admin users can access admin login from the regular login page
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    // Always redirect to regular login for role mismatches
    // Admin users can access admin login from the regular login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;