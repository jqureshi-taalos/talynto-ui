import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';
import signPagePicture from '../assets/sign page picture.png';
import taalosLogo from '../assets/taalos logo.png';

const EmailVerification = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and userType from navigation state or default
  const email = location.state?.email || 'user@example.com';
  const userType = location.state?.userType || 'client';

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call the backend API to verify email
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api'}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: verificationCode
        })
      });

      if (response.ok) {
        // SECURITY FIX: Email verification now returns authentication response
        const result = await response.json();
        
        // Store authentication tokens if provided
        if (result.token && result.token.trim() !== '') {
          localStorage.setItem('token', result.token);
          localStorage.setItem('refreshToken', result.refreshToken);
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        // Navigate based on user type after successful authentication
        if (userType === 'contractor') {
          // Contractors need to complete intake form
          navigate('/contractor-intake-form', { 
            state: { email: email }
          });
        } else {
          // Clients proceed to profile submitted page (now properly authenticated)
          navigate('/profile-submitted-successfully');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Call the backend API to resend verification code
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api'}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      if (response.ok) {
        // Reset code inputs and show success message
        setCode(['', '', '', '', '', '']);
        setError(''); // Clear any previous errors
        setMessage('Verification code has been resent successfully. Please check your email.');
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      setError('Network error. Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-image">
            <img src={signPagePicture} alt="Email verification illustration" />
          </div>
          <div className="auth-form-section">
            <div className="auth-header">
              <div className="header-with-logo">
                <img src={taalosLogo} alt="Taalos Logo" className="taalos-logo" />
                <h1>taalos</h1>
              </div>
              <h2>Email <strong>Verification</strong></h2>
              <p className="verification-message">
                A verification email has been sent to {email} containing a confirmation code. The code is valid for the next 5 minutes.
              </p>
              <p className="spam-reminder">
                If you don't see the email in your inbox, please check your spam or junk folder, as automated emails may sometimes be incorrectly filtered.
              </p>
              <p className="support-info">
                If you need further assistance, please contact support.
              </p>
              <p className="thank-you">
                Thank you for your cooperation!
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-message general-error">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}
              
              <div className="verification-code-container">
                <div className="code-inputs">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`code-input ${error ? 'error' : ''}`}
                      placeholder=""
                    />
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Email →'}
              </button>
              
              <div className="auth-links">
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  className="resend-link"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;