import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import taalosLogo from '../assets/taalos logo.png';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        
        {/* Left Visual Section */}
        <div className="unauthorized-visual">
          <div className="error-icon-container">
            <div className="error-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="#e74c3c" strokeWidth="2" />
                <path
                  d="M15 9l-6 6M9 9l6 6"
                  stroke="#e74c3c"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="error-code">403</div>
        </div>

        {/* Right Details Section */}
        <div className="unauthorized-details">
          <div className="logo-section">
            <img
              src={taalosLogo}
              alt="Taalos Logo"
              className="unauthorized-logo"
            />
            <span className="company-name">taalos</span>
          </div>

          <h1 className="error-title">Access Denied</h1>
          <h2 className="error-subtitle">
            You don't have permission to view this page
          </h2>

          <p className="error-description">
            We're sorry, but you don't have the required permissions to access this resource.
          </p>
          <ul className="error-reasons">
            <li>Your session has expired</li>
            <li>You don't have sufficient privileges</li>
            <li>The page requires authentication</li>
          </ul>

          <div className="action-buttons">
            <Link to="/login" className="primary-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Login
            </Link>
            <button
              onClick={() => window.history.back()}
              className="secondary-button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Go Back
            </button>
          </div>

          <div className="help-section">
            <p className="help-text">
              Need help? Contact our{' '}
              <a href="mailto:support@taalos.com" className="help-link">
                support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
