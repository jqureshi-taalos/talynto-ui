import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './Dashboard.css';
import authService from '../services/authService';
import ClientHeader from './ClientHeader';
import AssignProjectPopup from './AssignProjectPopup';
import DashboardIcon from './DashboardIcon';
import ProjectsIcon from './ProjectsIcon';
import NotificationsIcon from './NotificationsIcon';
import ProfileSettingsIcon from './ProfileSettingsIcon';
import LogoutIcon from './LogoutIcon';
import FindTalentIcon from './FindTalentIcon';
import MessagesIcon from './MessagesIcon';
import InvoicesIcon from './InvoicesIcon';
import ProfileSettings from './ProfileSettings';

const ClientWishlistViewProfile = () => {
  const { talentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [talentProfile, setTalentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignProjectPopup, setShowAssignProjectPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

  useEffect(() => {
    fetchTalentProfile();
  }, [talentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTalentProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/contractor/${talentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          navigate('/login');
          return;
        }
        if (response.status === 404) {
          setError('Talent profile not found');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTalentProfile({
        id: data.id,
        userId: data.userId, // Add userId for assignment
        fullName: data.name,
        title: data.jobTitle || 'Professional',
        location: data.location || 'Not specified',
        availability: data.availability ? `${data.availability} Hrs/week` : 'Not available',
        hourlyRate: data.hourlyRate ? `$${data.hourlyRate}/hr` : 'Rate not specified',
        matchedProject: data.matchedProject || 'No specific project match',
        certifications: data.certifications || 'Not specified',
        skills: data.skills || 'Not specified',
        software: 'NetSuite, Quick Books', // This could be extracted from skills or added to the model
        bio: data.bio || 'No bio available',
        rating: data.rating,
        reviewCount: data.reviewCount,
        workModel: data.workModel,
        isShortlisted: data.isShortlisted,
        isVerified: data.isVerified,
        lastActiveAt: data.lastActiveAt
      });
    } catch (error) {
      console.error('Error fetching talent profile:', error);
      setError('Failed to load talent profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Check if we came from dashboard, otherwise default to talent page
    const from = location.state?.from;
    if (from === 'dashboard') {
      navigate('/dashboard');
    } else if (location.pathname.startsWith('/client-wishlist-view')) {
      if (location.state?.previousPage) {
        navigate(location.state?.previousPage);
      } else {
        navigate('/talent');
      }
    } else {
      navigate('/talent');
    }
  };

  const handleAssignProject = () => {
    setShowAssignProjectPopup(true);
  };

  const handleAssignProjectSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
    // Refresh the talent profile to show updated assignment status
    fetchTalentProfile();
  };

  const handleCloseAssignPopup = () => {
    setShowAssignProjectPopup(false);
  };

  const handleMessage = () => {
    const contractorId = talentProfile?.userId || talentId;
    if (contractorId) {
      navigate('/messages', { state: { openChatWithContractor: contractorId } });
    } else {
      navigate('/messages');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <ClientHeader pageTitle="Find Talent" />
        <div className="dashboard-layout">
          <div className="dashboard-main">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading talent profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <ClientHeader pageTitle="Find Talent" />
        <div className="dashboard-layout">
          <div className="dashboard-main">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Error: {error}</p>
              <button onClick={handleBack}>Back to Find Talent</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!talentProfile) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <ClientHeader pageTitle="Find Talent" />

      {/* Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-nav">
            <button className="sidebar-item" onClick={() => navigate('/dashboard')}>
              <span className="sidebar-icon"><DashboardIcon /></span>
              <span className="sidebar-label">Dashboard</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/projects')}>
              <span className="sidebar-icon"><ProjectsIcon /></span>
              <span className="sidebar-label">My Projects</span>
            </button>
            <button className="sidebar-item active" onClick={() => navigate('/talent')}>
              <span className="sidebar-icon"><FindTalentIcon /></span>
              <span className="sidebar-label">Find Talent</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/invoices')}>
              <span className="sidebar-icon"><InvoicesIcon /></span>
              <span className="sidebar-label">Invoice Requests</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/messages')}>
              <span className="sidebar-icon"><MessagesIcon /></span>
              <span className="sidebar-label">Messages</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/settings')}>
              <span className="sidebar-icon"><ProfileSettingsIcon /></span>
              <span className="sidebar-label">Profile Settings</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/notifications')}>
              <span className="sidebar-icon"><NotificationsIcon /></span>
              <span className="sidebar-label">Notifications</span>
            </button>
          </div>
          <button className="logout-btn" onClick={() => {
            authService.logout();
            navigate('/login');
          }}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="wishlist-profile-container">
            <div className="wishlist-header">
              <h1>{talentProfile.isShortlisted ? 'Shortlisted' : ''}</h1>
              <div className="wishlist-actions">
                <button className="tab-btn active" onClick={handleBack}>
                  ← Back
                </button>
                <button className="assign-project-btn" onClick={handleAssignProject}>
                  Assign Project
                </button>
                <button className="message-btn" onClick={handleMessage}>
                  Message
                </button>
              </div>
            </div>

            <ProfileSettings
              hideSettingsHeader={true}
              formData={talentProfile}
              contractorViewedByClient={true}

            />

            {/* <div className="talent-profile-card">
              <div className="profile-header">
                <h2>{talentProfile.fullName}</h2>
              </div>

              <div className="profile-details">
                <div className="profile-left">
                  <div className="profile-field">
                    <span className="field-label">Full Name</span>
                    <span className="field-value">{talentProfile.fullName}</span>
                  </div>

                  <div className="profile-field">
                    <span className="field-label">Title/Role</span>
                    <span className="field-value">{talentProfile.title}</span>
                  </div>

                  <div className="profile-field">
                    <span className="field-label">Location</span>
                    <span className="field-value">{talentProfile.location}</span>
                  </div>

                  <div className="profile-field">
                    <span className="field-label">Availability</span>
                    <span className="field-value">{talentProfile.availability}</span>
                  </div>

                  <div className="profile-field">
                    <span className="field-label">Hourly rate Range</span>
                    <span className="field-value">{talentProfile.hourlyRate}</span>
                  </div>

                  <div className="profile-field">
                    <span className="field-label">Match For Project</span>
                    <span className="field-value">{talentProfile.matchedProject}</span>
                  </div>
                </div>

                <div className="profile-right">
                  <div className="profile-field">
                    <span className="field-label">Certifications</span>
                    <span className="field-value">{talentProfile.certifications}</span>
                  </div>

                  <div className="profile-field">
                    <span className="field-label">Skills/Expertise</span>
                    <span className="field-value">{talentProfile.skills}</span>
                  </div>

                  <div className="profile-field">
                    <span className="field-label">Software Used</span>
                    <span className="field-value">{talentProfile.software}</span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message-overlay">
          <div className="success-message">
            <span className="success-icon">✓</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Assign Project Popup */}
      <AssignProjectPopup
        isOpen={showAssignProjectPopup}
        onClose={handleCloseAssignPopup}
        contractorId={talentProfile?.userId || talentId}
        onAssignSuccess={handleAssignProjectSuccess}
      />
    </div>
  );
};

export default ClientWishlistViewProfile;