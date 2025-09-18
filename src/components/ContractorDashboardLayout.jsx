import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { getAvatarUrl } from '../utils/avatarUtils';
import messageNotificationService from '../services/messageNotificationService';
import DashboardIcon from './DashboardIcon';
import ProjectsIcon from './ProjectsIcon';
import taalosLogo from '../assets/taalos logo.png';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import LogoutIcon from './LogoutIcon';
import MessagesIcon from './MessagesIcon';
import ProfileSettingsIcon from './ProfileSettingsIcon'
import HeaderNotificationIcon from './HeaderNotificationIcon'
import NeedHelpIcon from './NeedHelpIcon'
import './Dashboard.css';

const ContractorDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showMessageNotification, setShowMessageNotification] = useState(false);

  // Update user data when component becomes visible or when location changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setCurrentUser(authService.getCurrentUser());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Also update when location changes (navigation)
  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, [location.pathname]);

  // Initialize message notifications for contractors
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role && user.role.toLowerCase() === 'contractor') {
      // Start message notification service
      messageNotificationService.startListening();

      // Add listener for message events
      const removeListener = messageNotificationService.addListener((eventType, data) => {
        if (eventType === 'unreadCountChanged') {
          setUnreadMessageCount(data.count);
        } else if (eventType === 'newMessage') {
          // Show brief notification animation for new messages
          setShowMessageNotification(true);
          setTimeout(() => setShowMessageNotification(false), 3000);
        }
      });

      // Get initial unread count
      setUnreadMessageCount(messageNotificationService.getUnreadCount());

      return () => {
        removeListener();
        messageNotificationService.stopListening();
      };
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { id: '', icon: <DashboardIcon />, label: 'Dashboard', path: '/contractor-dashboard' },
    { id: 'projects', icon: <ProjectsIcon />, label: 'My Projects', path: '/contractor-projects' },
    { id: 'messages', icon: <MessagesIcon />, label: 'Messages', path: '/contractor-messages', badge: unreadMessageCount },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/contractor-invoices' },
    { id: 'profile', icon: <ProfileSettingsIcon />, label: 'Profile', path: '/contractor-edit-profile' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/contractor-notifications' }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Dashboard</span>
        </div>
        <div className="header-right">
          <div className="help-section">
            <span className="help-icon"><NeedHelpIcon /></span>
            <span className="help-text">Get Help from Taalos</span>
          </div>
          <div className="header-icons">
            <div 
              className={`message-notification-icon ${showMessageNotification ? 'pulse' : ''}`} 
              onClick={() => navigate('/contractor-messages')}
              title={`${unreadMessageCount} unread messages`}
            >
              <MessagesIcon fill="#000000"/>
              {unreadMessageCount > 0 && (
                <span className="message-badge">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>
              )}
            </div>
            <div className="notification-icon" onClick={() => navigate('/contractor-notifications')}><HeaderNotificationIcon /></div>
          </div>
          <div className="user-profile">
            <div>
              <div className="user-name">
                {currentUser?.firstName && currentUser?.lastName 
                  ? `${currentUser.firstName} ${currentUser.lastName}` 
                  : currentUser?.name || 'Contractor'}
              </div>
              <div className="user-role">Contractor</div>
            </div>
            <img 
              src={getAvatarUrl(currentUser, 40)} 
              alt={currentUser?.firstName && currentUser?.lastName 
                ? `${currentUser.firstName} ${currentUser.lastName}` 
                : currentUser?.name || 'Contractor'}
              className="user-avatar"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.target.style.display = 'none';
                const fallback = e.target.nextSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div 
              className="user-avatar-fallback"
              style={{ display: 'none' }}
            >
              {currentUser?.firstName && currentUser?.lastName 
                ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase()
                : currentUser?.name 
                  ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : 'C'}
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                end={item.id === ''}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="sidebar-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ContractorDashboardLayout;