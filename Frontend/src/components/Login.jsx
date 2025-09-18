import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css';
import signPagePicture from '../assets/sign page picture.png';
import taalosLogo from '../assets/taalos logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'client'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get success message from navigation state
  const successMessage = location.state?.message;

  useEffect(() => {
    console.log('Login component mounted');
    console.log('Current pathname:', location.pathname);
    console.log('Window pathname:', window.location.pathname);
    console.log('Is authenticated:', authService.isAuthenticated());
    console.log('Current user:', authService.getCurrentUser());
    console.log('SessionStorage keys:', Object.keys(sessionStorage));
    console.log('LocalStorage keys:', Object.keys(localStorage));
    
    // Check if something is forcing a redirect
    const loggedOut = sessionStorage.getItem('loggedOut') || localStorage.getItem('loggedOut');
    console.log('LoggedOut flag:', loggedOut);
    
    return () => {
      console.log('Login component unmounting');
    };
  }, [location.pathname]);


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Only clear the specific field error, not general errors
    if (errors[name] && name !== 'general') {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Don't auto-clear general error messages - let user dismiss manually or on next submit
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted - preventDefault called');
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    // Clear all previous errors when user explicitly submits
    setErrors({});
    
    try {
      const response = await authService.login(formData.email, formData.password);
      
      console.log('Login response:', response);
      console.log('User from response:', response.user);
      console.log('User role from response:', response.user.role);
      
      const userRole = response.user.role;
      const selectedUserType = formData.userType;
      console.log('User role from backend:', userRole, 'Selected user type:', selectedUserType);
      
      // Make role comparison case-insensitive
      const normalizedRole = userRole ? userRole.toLowerCase() : '';
      const normalizedSelectedType = selectedUserType ? selectedUserType.toLowerCase() : '';
      
      // Validate that the selected user type matches the actual user role
      // Admins should only be able to login from /admin-login page
      if (normalizedRole === 'admin') {
        setErrors({
          general: 'Admin users must use the admin login page.'
        });
        setIsLoading(false);
        return;
      }
      
      if (normalizedRole !== normalizedSelectedType) {
        setErrors({
          general: 'Invalid username or password. Please check your credentials and selected user type.'
        });
        setIsLoading(false);
        return;
      }
      
      switch (normalizedRole) {
        case 'contractor':
          navigate('/contractor-dashboard');
          break;
        case 'client':
          navigate('/client-dashboard');
          break;
        default:
          console.log('Unknown role:', userRole, 'navigating to login');
          setErrors({
            general: `Unknown user role: ${userRole}. Please contact support.`
          });
          setIsLoading(false);
          return;
      }
    } catch (error) {
      console.log('Login error:', error);
      
      // Handle contractor approval status errors
      if (error.message === 'CONTRACTOR_INTAKE_INCOMPLETE') {
        navigate('/contractor-intake-form');
        return;
      }
      
      if (error.message === 'CONTRACTOR_PENDING') {
        navigate('/profile-submitted-successfully');
        return;
      }
      
      if (error.message === 'CONTRACTOR_REJECTED') {
        navigate('/profile-rejected', { state: { email: formData.email } });
        return;
      }
      
      if (error.message === 'CONTRACTOR_NOT_APPROVED') {
        setErrors({
          general: 'Your contractor profile is pending approval. Please wait for admin review.'
        });
        setIsLoading(false);
        return;
      }
      
      // Handle client approval status errors
      if (error.message === 'CLIENT_PENDING') {
        setErrors({
          general: 'Your client account is pending approval. Please wait for admin review before you can access your account.'
        });
        setIsLoading(false);
        return;
      }
      
      if (error.message === 'CLIENT_REJECTED') {
        setErrors({
          general: 'Your client account has been rejected. Please contact support for more information.'
        });
        setIsLoading(false);
        return;
      }
      
      if (error.message === 'CLIENT_NOT_APPROVED') {
        setErrors({
          general: 'Your client account is not approved. Please wait for admin review.'
        });
        setIsLoading(false);
        return;
      }
      
      if (error.message === 'CLIENT_DEACTIVATED') {
        setErrors({
          general: 'Your client account has been deactivated. Please contact support for assistance.'
        });
        setIsLoading(false);
        return;
      }
      
      // Handle common error cases with user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid credentials') || 
            error.message.includes('Unauthorized') ||
            error.message.includes('Invalid username or password') ||
            error.message.includes('401')) {
          errorMessage = 'Invalid username or password. Please check your credentials and selected user type.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log('Setting error message:', errorMessage);
      setErrors({
        general: errorMessage
      });
      console.log('Error state set, should be visible now');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-image">
            <img src={signPagePicture} alt="Sign in illustration" />
          </div>
          <div className="auth-form-section">
            <div className="auth-header">
              <div className="header-with-logo">
                <img src={taalosLogo} alt="Taalos Logo" className="taalos-logo" />
                <h1>taalos</h1>
              </div>
              <h2>Sign In To Your <strong>Account</strong></h2>
              <p className="tagline">Matches that Matter, For Companies and Careers.</p>
              
              <div className="user-type-selection">
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="userType"
                      value="client"
                      checked={formData.userType === 'client'}
                      onChange={handleChange}
                    />
                    <span className="radio-custom"></span>
                    Client
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="userType"
                      value="contractor"
                      checked={formData.userType === 'contractor'}
                      onChange={handleChange}
                    />
                    <span className="radio-custom"></span>
                    Contractor
                  </label>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {successMessage && (
                <div className="success-message">
                  {successMessage}
                </div>
              )}
              
              {errors.general && (
                <div className="error-message general-error" style={{ 
                  display: 'block', 
                  visibility: 'visible', 
                  opacity: 1,
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  color: '#721c24',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  position: 'relative'
                }}>
                  <span>{errors.general}</span>
                  <button 
                    type="button" 
                    className="error-dismiss" 
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Dismissing error');
                      setErrors(prev => ({ ...prev, general: '' }));
                    }}
                    aria-label="Dismiss error"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: '#721c24'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email Address:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter Email Address"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Enter Password"
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>
              
              <div className="auth-links">
                <Link to="/register">Register Account</Link>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
              
              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;