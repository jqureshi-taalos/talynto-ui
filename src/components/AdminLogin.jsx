import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';
import taalosLogo from '../assets/taalos logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('AdminLogin component mounted');
    console.log('Current window pathname:', window.location.pathname);
    console.log('Is authenticated:', authService.isAuthenticated());
    console.log('Current user:', authService.getCurrentUser());
    
    return () => {
      console.log('AdminLogin component unmounting');
    };
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      
      // Check if user has admin role (case-insensitive)
      const userRole = response.user?.role?.toLowerCase();
      if (userRole === 'admin') {
        // Clear any logout flags since user is successfully logging in
        sessionStorage.removeItem('loggedOut');
        localStorage.removeItem('loggedOut');
        navigate('/admin-dashboard');
      } else {
        setError('Access denied. This login is for administrators only. Please use the regular login if you are a client or contractor.');
        // Auto logout non-admin user
        await authService.logout();
      }
    } catch (error) {
      const errorMessage = error.message || 'Invalid email or password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="admin-login-page">
      {/* Left Side - Background Image */}
      <div className="admin-login-left">
      </div>

      {/* Right Side - Login Form */}
      <div className="admin-login-right">
        <div className="login-form-wrapper">
          {/* Logo */}
          <div className="login-logo">
            <img src={taalosLogo} alt="Taalos Logo" className="logo-image" />
            <span className="logo-text">taalos</span>
          </div>

          {/* Welcome Text */}
          <div className="login-welcome">
            <h1>Welcome To <span className="portal-text">Portal</span></h1>
            <p>Matches that Matter For Companies and Careers</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error-message">
                {error}
              </div>
            )}
            
            
            <div className="login-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your Password"
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;