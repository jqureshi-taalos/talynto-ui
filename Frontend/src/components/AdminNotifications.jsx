import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import authService from '../services/authService';
import ProfileAvatar from './ProfileAvatar';
import taalosLogo from '../assets/taalos logo.png';
import DashboardIcon from './DashboardIcon'; // Dashboard SVG icon
import UserManagementIcon from './UserManagementIcon';
import ProjectManagementIcon from './ProjectManagementIcon';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import SettingsIcon from './SettingsIcon';
import ConfigurationIcon from './ConfigurationIcon';
import LogoutIcon from './LogoutIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import './Dashboard.css';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const pageSize = 10;

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices' },
    // { id: 'contractor-intake', icon: '📝', label: 'Contractor Intake', path: '/admin-contractor-intake' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications', active: true },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];

  // Load notifications on component mount and page change
  useEffect(() => {
    loadNotifications();
  }, [currentPage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Try to load from API
      const response = await adminService.getPaginatedNotifications(currentPage, pageSize);
      setNotifications(response.notifications || []);
      setTotalPages(response.totalPages || 1);
      setTotalNotifications(response.totalCount || 0);
      setError(null);
    } catch (apiError) {
      // No fallback data - force proper API setup
      console.error('API failed to load notifications:', apiError);
      setNotifications([]);
      setTotalPages(1);
      setTotalNotifications(0);
      setError('Failed to load notifications from API: ' + apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Notifications</span>
        </div>
        <div className="header-right">
          <div className="notification-badge">
            <span className="badge-icon"><HeaderNotificationIcon /></span>
          </div>
          <div className="user-profile">
            <div>
              <div className="user-name">Taalos</div>
              <div className="user-role">Super Admin</div>
            </div>
            <ProfileAvatar
              user={{
                id: authService.getCurrentUser()?.id,
                firstName: authService.getCurrentUser()?.firstName,
                lastName: authService.getCurrentUser()?.lastName,
                email: authService.getCurrentUser()?.email
              }}
              size={40}
              className="user-avatar"
            />
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {sidebarItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-item ${item.active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </div>
          ))}
          <div className="sidebar-item" onClick={() => navigate('/admin-login')}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="notifications-container">
            {/* Notifications Header */}
            <div className="notifications-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 0' }}>
              <div className="notifications-info">
                <h3>Notifications ({totalNotifications})</h3>
                {/* @remove commented page 1 of total */}
                {/* <p style={{ margin: '5px 0', color: '#000000', fontSize: '14px' }}>Page {currentPage} of {totalPages}</p> */}
              </div>
              <button
                onClick={loadNotifications}
                disabled={loading}
                style={{ padding: '8px 16px', backgroundColor: '#4EC1EF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {error && (
              <div className="error-message" style={{ background: '#ff4444', color: 'white', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
                {error}
                <button
                  onClick={() => setError(null)}
                  style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="notifications-list">
              {loading ? (
                <div className="loading-message" style={{ textAlign: 'center', padding: '40px', color: '#000000' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="no-notifications" style={{ textAlign: 'center', padding: '40px', color: '#000000' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}><HeaderNotificationIcon /></div>
                  <h3 style={{ marginBottom: '10px' }}>No Notifications</h3>
                  <p>You currently have no notifications.</p>
                  {error && (
                    <div style={{ marginTop: '20px' }}>
                      <button
                        onClick={loadNotifications}
                        style={{ padding: '8px 16px', backgroundColor: '#4EC1EF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Retry Loading
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                notifications.map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-avatar">
                      <span>{notification.avatar || <HeaderNotificationIcon />}</span>
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <div className="notification-user">
                          <span>{notification.user || notification.title || 'System'}</span>
                          <span className='notification-message'>{notification.message || notification.content || 'No message'}</span>
                        </div>
                        <div className="notification-time">
                          <span>{notification.time || new Date(notification.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>


                  // @remove exisitng code, 
                  // <div key={notification.id} className="notification-item">
                  //   <div className="notification-avatar">
                  //     <span>{notification.avatar || <HeaderNotificationIcon />}</span>
                  //   </div>
                  //   <div className="notification-content">
                  //     <div className="notification-header">
                  //       <span className="notification-user">{notification.user || notification.title || 'System'}</span>
                  //       <span className="notification-time">{notification.time || new Date(notification.createdAt || Date.now()).toLocaleDateString()}</span>
                  //     </div>
                  //     <div className="notification-message">
                  //       {notification.message || notification.content || 'No message'}
                  //     </div>
                  //     {notification.type && (
                  //       <div className="notification-type" style={{ fontSize: '12px', color: '#000000', marginTop: '5px' }}>
                  //         Type: {notification.type}
                  //       </div>
                  //     )}
                  //   </div>
                  // </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '5px' }}>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ padding: '8px 12px', border: '1px solid #000000', background: currentPage === 1 ? '#f8f9fa' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else {
                    const start = Math.max(1, currentPage - 2);
                    const end = Math.min(totalPages, start + 4);
                    page = start + i;
                    if (page > end) return null;
                  }

                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #000000',
                        background: currentPage === page ? '#4EC1EF' : 'white',
                        color: currentPage === page ? 'white' : '#000000',
                        cursor: 'pointer'
                      }}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ padding: '8px 12px', border: '1px solid #000000', background: currentPage === totalPages ? '#f8f9fa' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNotifications;