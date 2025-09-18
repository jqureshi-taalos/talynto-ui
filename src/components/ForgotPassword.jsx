import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css';
import signPagePicture from '../assets/sign page picture.png';
import taalosLogo from '../assets/taalos logo.png';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email' or 'verification'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 'verification' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (error) {
      setError('');
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      await authService.forgotPassword(email);
      setMessage('Verification code has been sent to your email.');
      setStep('verification');
    } catch (error) {
      setError(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api'}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: verificationCode
        })
      });

      if (response.ok) {
        const result = await response.json();
        navigate('/change-password', { 
          state: { 
            resetToken: result.resetToken,
            email: email 
          }
        });
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
    setIsLoading(true);
    setError('');
    
    try {
      await authService.forgotPassword(email);
      setCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      setMessage('Verification code has been resent to your email.');
    } catch (error) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-image">
            <img src={signPagePicture} alt="Forgot password illustration" />
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
              {step === 'email' ? (
                <>
                  <h2>Forgot Your <strong>Password</strong></h2>
                  <p className="tagline">Matches that Matter, For Companies and Careers.</p>
                </>
              ) : (
                <>
                  <h2>Email <strong>Verification</strong></h2>
                  <p className="verification-message">
                    A verification code has been sent to {email}. The code is valid for 5 minutes.
                  </p>
                </>
              )}
            </div>
            
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="auth-form">
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
                
                <div className="form-group">
                  <label htmlFor="email">Email Address:</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={error ? 'error' : ''}
                    placeholder="Enter Email Address"
                  />
                </div>
                
                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Continue →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerificationSubmit} className="auth-form">
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
                  {isLoading ? 'Verifying...' : 'Verify Code →'}
                </button>
                
                <div className="auth-links">
                  <button 
                    type="button" 
                    onClick={handleResendCode}
                    className="resend-link"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;