import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { getAvatarUrl } from '../utils/avatarUtils';
import taalosLogo from '../assets/taalos logo.png';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import NeedHelpIcon from './NeedHelpIcon'

const ClientHeader = ({ pageTitle = "Dashboard" }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role && currentUser.role.toLowerCase() === 'client') {
      setUser(currentUser);
    }
  }, []);

  // Add effect to refresh user data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.role && currentUser.role.toLowerCase() === 'client') {
          setUser(currentUser);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
        <span className="header-title">taalos</span>
        <div className="header-divider"></div>
        <span className="header-page">{pageTitle}</span>
      </div>
      <div className="header-right">
        <div className="help-section">
          <span className="help-icon"><NeedHelpIcon /></span>
          <span className="help-text">Get Help from Taalos</span>
        </div>
        <div className="notification-icon"><HeaderNotificationIcon /></div>
        <div className="user-profile">
          <div>
            <div className="user-name">{user?.firstName} {user?.lastName || ''}</div>
            <div className="user-role">Client</div>
          </div>
          {user ? (
            <>
              <img 
                src={getAvatarUrl(user, 40)} 
                alt={`${user.firstName} ${user.lastName || ''}`}
                className="user-avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div 
                className="user-avatar-fallback"
                style={{ display: 'none' }}
              >
                {user.firstName?.[0]}{user.lastName?.[0] || ''}
              </div>
            </>
          ) : (
            <div className="user-avatar">?</div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;