import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatarUtils';
import ProfileAvatar from './ProfileAvatar';
import authService from '../services/authService';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

const TaalosRecommendationsPopup = ({ isOpen, onClose }) => {
  const [matchedContractors, setMatchedContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchMatchedContractors();
    }
  }, [isOpen]);

  const fetchMatchedContractors = async () => {
    try {
      setLoading(true);
      setError('');
      const token = authService.getToken();
      
      if (!token) {
        authService.logout();
        return;
      }

      // Fetch both general matched contractors and project-specific contractors
      const [generalResponse, projectResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/client/matched-contractors?limit=50`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/dashboard/client/pending-projects-contractors?contractorsPerProject=10`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (generalResponse.ok && projectResponse.ok) {
        const generalData = await generalResponse.json();
        const projectData = await projectResponse.json();
        
        console.log('🔍 DEBUG - General contractors:', generalData);
        console.log('🔍 DEBUG - Project contractors:', projectData);
        
        // Combine contractors from both sources
        const allContractors = [...generalData];
        
        // Add contractors from project-specific matching
        if (projectData && typeof projectData === 'object') {
          Object.values(projectData).forEach(contractors => {
            if (Array.isArray(contractors)) {
              allContractors.push(...contractors);
            }
          });
        }
        
        // Remove duplicates based on contractor ID
        const uniqueContractors = allContractors.filter((contractor, index, self) => 
          index === self.findIndex(c => c.id === contractor.id)
        );
        
        console.log('🔍 DEBUG - Combined unique contractors:', uniqueContractors);
        setMatchedContractors(uniqueContractors);
      } else if (generalResponse.status === 401 || projectResponse.status === 401) {
        authService.logout();
        navigate('/login');
      } else {
        setError('Failed to fetch matched contractors');
      }
    } catch (error) {
      console.error('Error fetching matched contractors:', error);
      setError('Error fetching matched contractors');
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
    setMatchedContractors([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="hired-contractors-popup-overlay">
      <div className="hired-contractors-popup">
        <div className="popup-header">
          <h2>Recommended Contractors for Your Pending Projects</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="popup-content">
          {loading ? (
            <div className="loading-message">Loading recommendations...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : matchedContractors.length === 0 ? (
            <div className="no-contractors-message">No contractors found matching your pending projects' requirements</div>
          ) : (
            <div className="hired-contractors-grid">
              {matchedContractors.map(contractor => (
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

export default TaalosRecommendationsPopup;