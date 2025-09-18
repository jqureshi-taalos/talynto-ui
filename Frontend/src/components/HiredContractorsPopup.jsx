import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatarUtils';
import ProfileAvatar from './ProfileAvatar';
import authService from '../services/authService';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

const HiredContractorsPopup = ({ isOpen, onClose }) => {
  const [hiredContractors, setHiredContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchHiredContractors();
    }
  }, [isOpen]);

  const fetchHiredContractors = async () => {
    try {
      setLoading(true);
      setError('');
      const token = authService.getToken();
      
      if (!token) {
        authService.logout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/client/hired-contractors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHiredContractors(data);
      } else if (response.status === 401) {
        authService.logout();
        navigate('/login');
      } else {
        setError('Failed to fetch hired contractors');
      }
    } catch (error) {
      console.error('Error fetching hired contractors:', error);
      setError('Error fetching hired contractors');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (contractorId) => {
    navigate(`/client-wishlist-view-profile/${contractorId}`, { state: { from: 'dashboard' } });
    onClose();
  };

  const handleMessage = (contractor) => {
    const contractorId = contractor?.id;
    if (contractorId) {
      navigate('/messages', { state: { openChatWithContractor: contractorId } });
    } else {
      navigate('/messages');
    }
    onClose();
  };

  const handleClose = () => {
    setHiredContractors([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="hired-contractors-popup-overlay">
      <div className="hired-contractors-popup">
        <div className="popup-header">
          <h2>All Hired Contractors</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="popup-content">
          {loading ? (
            <div className="loading-message">Loading hired contractors...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : hiredContractors.length === 0 ? (
            <div className="no-contractors-message">No hired contractors found</div>
          ) : (
            <div className="hired-contractors-grid">
              {hiredContractors.map(contractor => (
                <div key={contractor.id} className="hired-contractor-card">
                  <div className="contractor-avatar">
                    <img 
                      src={getAvatarUrl(contractor, 50)} 
                      alt={contractor.name} 
                      className="profile-avatar"
                      style={{ width: 50, height: 50, borderRadius: '50%' }}
                      onError={(e) => {
                        // Fallback to UI Avatars if database image fails
                        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(contractor.name)}&size=50&background=random&color=fff&bold=true&format=svg`;
                        if (e.target.src !== fallbackUrl) {
                          e.target.src = fallbackUrl;
                        }
                      }}
                    />
                  </div>
                  <div className="contractor-info">
                    <div className="contractor-name">{contractor.name}</div>
                    <div className="contractor-actions">
                      <button 
                        className="action-btn view-profile"
                        onClick={() => handleViewProfile(contractor.id)}
                      >
                        View Profile
                      </button>
                      <span className="action-separator">|</span>
                      <button 
                        className="action-btn message"
                        onClick={() => handleMessage(contractor)}
                      >
                        Message
                      </button>
                    </div>
                    <div className="contractor-tags">
                      <span className="tag">{contractor.qualifications ? contractor.qualifications.split(',')[0].trim() : 'CPA'}</span>
                      <span className="tag">{contractor.skills ? contractor.skills.split(',')[0].trim() : 'QuickBooks'}</span>
                      <span className="tag">{contractor.workModel || 'Remote'}</span>
                      <span className="tag">{contractor.availability ? `${contractor.availability} Hours/week` : '20 Hours/week'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button className="close-popup-btn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HiredContractorsPopup;