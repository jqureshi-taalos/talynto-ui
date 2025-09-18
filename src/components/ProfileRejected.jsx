import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css';
import signPagePicture from '../assets/sign page picture.png';
import taalosLogo from '../assets/taalos logo.png';

const ProfileRejected = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, [location.state?.email]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      // Get email from navigation state (passed from Login component)
      const email = location.state?.email;
      console.log('Email from navigation state:', email);
      
      if (!email) {
        console.log('No email provided in navigation state');
        setRejectionReason('Unable to load rejection details - no email provided.');
        return;
      }

      // Use new public endpoint for rejected contractors
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const apiUrl = `${API_BASE_URL}/auth/rejected-profile/${encodeURIComponent(email)}`;
      
      console.log('Environment API URL:', process.env.REACT_APP_API_BASE_URL);
      console.log('Final API_BASE_URL:', API_BASE_URL);
      console.log('Making API call to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Rejected profile data received:', userData);
        console.log('AdminNotes field (uppercase):', userData.AdminNotes);
        console.log('adminNotes field (lowercase):', userData.adminNotes);
        console.log('AdminNotes type:', typeof userData.AdminNotes);
        console.log('AdminNotes value:', JSON.stringify(userData.AdminNotes));
        
        console.log('Contractor application data:', {
          LinkedUrl: userData.LinkedUrl,
          linkedUrl: userData.linkedUrl, // Check lowercase too
          LinkedinUrl: userData.LinkedinUrl, // Check this variant
          ResumeFileName: userData.ResumeFileName,
          ResumeContentType: userData.ResumeContentType,
          IndustryExperience: userData.IndustryExperience,
          Expertise: userData.Expertise,
          Profession: userData.Profession,
          Domain: userData.Domain,
          HourlyRate: userData.HourlyRate,
          WorkModel: userData.WorkModel,
          Certifications: userData.Certifications,
          Skills: userData.Skills,
          Bio: userData.Bio,
          JobTitle: userData.JobTitle
        });
        setUserDetails(userData);
        
        const rejectionText = userData.AdminNotes || userData.adminNotes || 'No specific reason provided.';
        console.log('Final rejection text being set:', rejectionText);
        console.log('Rejection text type:', typeof rejectionText);
        setRejectionReason(rejectionText);
      } else {
        console.log('API call failed');
        const responseText = await response.text();
        console.log('Error response:', responseText);
        
        if (response.status === 404) {
          setRejectionReason('User profile not found.');
        } else if (response.status === 403) {
          setRejectionReason('Access denied - profile not rejected.');
        } else {
          setRejectionReason('Unable to load rejection details.');
        }
      }
    } catch (error) {
      console.error('Error fetching rejected profile:', error);
      setRejectionReason('Unable to load rejection details due to network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDetails = () => {
    // Navigate to contractor intake form with user data for pre-population
    const email = userDetails?.email || userDetails?.Email;
    console.log('Passing email to intake form:', email);
    console.log('User details:', userDetails);
    
    navigate('/contractor-intake-form', { 
      state: { 
        userData: userDetails, 
        isEditing: true,
        email: email // Pass email explicitly
      } 
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-image">
            <img src={signPagePicture} alt="Profile rejected illustration" />
          </div>
          <div className="auth-form-section">
            <div className="rejection-page-content">
              <div className="rejection-header">
                <img src={taalosLogo} alt="Taalos Logo" className="taalos-logo rejection-logo" />
                <h1>taalos</h1>
              </div>
              
              <div className="rejection-message-section">
                <h2 className="rejection-title">Your Profile is rejected</h2>
                <div className="rejection-details">
                  <p className="rejection-description">Please review the admin feedback and submit the details again</p>
                  
                  {loading ? (
                    <div className="rejection-reason-loading">Loading rejection details...</div>
                  ) : (
                    <div className="rejection-reason-section">
                      <h4 className="rejection-reason-title">Admin Feedback:</h4>
                      <div className="rejection-reason-content">
                        {rejectionReason}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleEditDetails}
                  className="auth-button rejection-button"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Edit Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileRejected;