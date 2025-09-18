import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { getAvatarUrl } from '../utils/avatarUtils';
import messageNotificationService from '../services/messageNotificationService';
import DashboardIcon from './DashboardIcon';
import ProjectsIcon from './ProjectsIcon';
import './Dashboard.css';
import taalosLogo from '../assets/taalos logo.png';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import ProfileSettingsIcon from './ProfileSettingsIcon';
import LogoutIcon from './LogoutIcon';
import FindTalentIcon from './FindTalentIcon';
import MessagesIcon from './MessagesIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import NeedHelpIcon from './NeedHelpIcon';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showMessageNotification, setShowMessageNotification] = useState(false);

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

  // Initialize message notifications
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role && currentUser.role.toLowerCase() === 'client') {
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
  }, [user]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { id: '', icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
    { id: 'projects', icon: <ProjectsIcon />, label: 'My Projects', path: '/projects' },
    { id: 'talent', icon: <FindTalentIcon />, label: 'Find Talent', path: '/talent' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoice Requests', path: '/invoices' },
    { id: 'messages', icon: <MessagesIcon />, label: 'Messages', path: '/messages', badge: unreadMessageCount },
    { id: 'settings', icon: <ProfileSettingsIcon />, label: 'Profile Settings', path: '/settings' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/notifications' }
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
              onClick={() => navigate('/messages')}
              title={`${unreadMessageCount} unread messages`}
            >
              <MessagesIcon fill="#000000" />
              {unreadMessageCount > 0 && (
                <span className="message-badge">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>
              )}
            </div>
            <div className="notification-icon"
            onClick={() => navigate('/notifications')}
            ><HeaderNotificationIcon /></div>
          </div>
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

export default DashboardLayout;