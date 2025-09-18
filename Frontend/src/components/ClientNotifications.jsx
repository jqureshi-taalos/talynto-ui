import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import DashboardLayout from './DashboardLayout';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import { getAvatarUrl } from '../utils/avatarUtils';

const ClientNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      if (isMounted) {
        await fetchNotifications();
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(currentPage, pageSize);
      setNotifications(data.notifications || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      // Fall back to mock data if API fails
      setNotifications([
        {
          id: 1,
          type: 'project_created',
          message: 'You created a new project "Q3 Financial Audit"',
          timeAgo: '2 hours ago',
          isRead: false,
          avatarUrl: null // Client's own avatar or project icon
        },
        {
          id: 2,
          type: 'project_assigned',
          message: 'You assigned John Smith to project "Year-End Tax Review"',
          timeAgo: '1 day ago',
          isRead: false,
          contractorName: 'John Smith',
          projectName: 'Year-End Tax Review',
          avatarUrl: '/path/to/contractor/avatar.jpg'
        },
        {
          id: 3,
          type: 'invoice_accepted',
          message: 'You accepted Andrew Heys\'s invoice for project "Bookkeeping Services"',
          timeAgo: '3 days ago',
          isRead: true,
          contractorName: 'Andrew Heys',
          projectName: 'Bookkeeping Services',
          avatarUrl: '/path/to/contractor/avatar2.jpg'
        },
        {
          id: 4,
          type: 'invoice_rejected',
          message: 'You rejected Sarah Connor\'s invoice for project "Tax Preparation"',
          timeAgo: '5 days ago',
          isRead: true,
          contractorName: 'Sarah Connor',
          projectName: 'Tax Preparation',
          avatarUrl: '/path/to/contractor/avatar3.jpg'
        },
        {
          id: 5,
          type: 'invoice_paid',
          message: 'You paid Michael Davis\'s invoice for project "Financial Analysis"',
          timeAgo: '1 week ago',
          isRead: true,
          contractorName: 'Michael Davis',
          projectName: 'Financial Analysis',
          avatarUrl: '/path/to/contractor/avatar4.jpg'
        },
        {
          id: 6,
          type: 'invoice_pending',
          message: 'Your payment for Lisa Johnson\'s invoice for project "Audit Review" is pending',
          timeAgo: '2 weeks ago',
          isRead: true,
          contractorName: 'Lisa Johnson',
          projectName: 'Audit Review',
          avatarUrl: '/path/to/contractor/avatar5.jpg'
        },
        {
          id: 7,
          type: 'profile_updated',
          message: 'You updated your profile settings',
          timeAgo: '1 month ago',
          isRead: true,
          avatarUrl: null // Client's own avatar
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Still update local state for better UX
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Still update local state for better UX
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    }
  };

  const getDefaultAvatar = (name) => {
    if (!name) return 'T'; // Default for client
    return name.charAt(0).toUpperCase();
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHour = Math.floor(diffInMin / 60);
    const diffInDay = Math.floor(diffInHour / 24);
    const diffInWeek = Math.floor(diffInDay / 7);
    const diffInMonth = Math.floor(diffInDay / 30);

    if (diffInSec < 60) return 'Just now';
    if (diffInMin < 60) return `${diffInMin} minute${diffInMin > 1 ? 's' : ''} ago`;
    if (diffInHour < 24) return `${diffInHour} hour${diffInHour > 1 ? 's' : ''} ago`;
    if (diffInDay < 7) return `${diffInDay} day${diffInDay > 1 ? 's' : ''} ago`;
    if (diffInWeek < 4) return `${diffInWeek} week${diffInWeek > 1 ? 's' : ''} ago`;
    if (diffInMonth < 12) return `${diffInMonth} month${diffInMonth > 1 ? 's' : ''} ago`;

    const diffInYear = Math.floor(diffInMonth / 12);
    return `${diffInYear} year${diffInYear > 1 ? 's' : ''} ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="notifications-container client-notification">
        <div className="notifications-header">
          <h1>Notifications</h1>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-avatar">
                {notification.contractorName ? (
                  <img src={getAvatarUrl({ name: notification.contractorName })} alt="Avatar" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    T
                  </div>
                )}
              </div>
              <div className="notification-content">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{notification.timeAgo || formatTimeAgo(notification.createdAt)}</div>
              </div>
              {!notification.isRead && (
                <div className="notification-unread-dot"></div>
              )}
            </div>
          ))}
        </div>

        {notifications.length === 0 && !loading && (
          <div className="no-notifications">
            <h3>No notifications yet</h3>
            <p>We'll notify you when there's something new</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                ⟪
              </button>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ⟨
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ⟩
              </button>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                ⟫
              </button>
            </div>
            <div className="pagination-info">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} notifications
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientNotifications;