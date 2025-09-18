import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import signPagePicture from '../assets/sign page picture.png';
import taalosLogo from '../assets/taalos logo.png';
import authService from '../services/authService';

const ProfileSubmittedSuccessfully = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login anyway
      navigate('/login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-image">
            <img src={signPagePicture} alt="Profile submitted illustration" />
          </div>
          <div className="auth-form-section">
            <div className="success-page-content">
              <div className="success-header">
                <img src={taalosLogo} alt="Taalos Logo" className="taalos-logo success-logo" />
                <h1>taalos</h1>
              </div>
              
              <div className="success-message-section">
                <h2 className="success-title">Profile Submitted Successfully!</h2>
                <div className="success-details">
                  <p className="success-subtitle">Your profile is in review</p>
                  <p className="success-description">You will soon receive an email for confirmation</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="auth-button success-button"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSubmittedSuccessfully;