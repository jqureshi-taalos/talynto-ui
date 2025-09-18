import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css';
import signPagePicture from '../assets/sign page picture.png';
import taalosLogo from '../assets/taalos logo.png';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Get token from URL parameters or navigation state (for password reset flow)
  const token = searchParams.get('token') || location.state?.resetToken;
  const email = location.state?.email;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Confirm password is required';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    setMessage('');
    
    try {
      // If token exists, this is password reset flow, otherwise it's change password
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api'}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmNewPassword
          })
        });

        if (response.ok) {
          setMessage('Password has been reset successfully!');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          const errorData = await response.json();
          setErrors({
            general: errorData.message || 'Failed to reset password. Please try again.'
          });
        }
      } else {
        await authService.changePassword(formData.newPassword);
        setMessage('Password has been changed successfully!');
      }
    } catch (error) {
      setErrors({
        general: error.message || 'Failed to change password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-image">
            <img src={signPagePicture} alt="Change password illustration" />
          </div>
          <div className="auth-form-section">
            <div className="auth-header">
              <div className="back-link">
                <Link to="/login" className="back-button">
                  ← Back
                </Link>
              </div>
              <div className="header-with-logo">
                <img src={taalosLogo} alt="Taalos Logo" className="taalos-logo" />
                <h1>taalos</h1>
              </div>
              <h2>Change Your <strong>Password</strong></h2>
              <p className="tagline">Matches that Matter, For Companies and Careers.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && (
                <div className="error-message general-error">
                  {errors.general}
                </div>
              )}
              
              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? 'error' : ''}
                  placeholder="Enter New Password"
                />
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className={errors.confirmNewPassword ? 'error' : ''}
                  placeholder="Confirm New Password"
                />
                {errors.confirmNewPassword && (
                  <span className="error-message">{errors.confirmNewPassword}</span>
                )}
              </div>
              
              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Changing...' : 'Confirm Change →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;