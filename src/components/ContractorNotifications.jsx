import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';

const ContractorNotifications = () => {
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
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const response = await fetch(`${API_BASE_URL}/notification?page=${currentPage}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
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
          type: 'invoice',
          title: 'Invoice Status Update',
          message: 'Your invoice for Q3 Financial Audit has been accepted by Jane Client (client@taalos.com).',
          timeAgo: '2 hours ago',
          isRead: false
        },
        {
          id: 2,
          type: 'invoice',
          title: 'Invoice Rejected',
          message: 'Your invoice for Year-End Tax Review has been rejected by Jane Client (client@taalos.com). Please review and resubmit.',
          timeAgo: '1 day ago',
          isRead: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const response = await fetch(`${API_BASE_URL}/notification/${id}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };



  if (loading) {
    return (
      <ContractorDashboardLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </ContractorDashboardLayout>
    );
  }

  return (
    <ContractorDashboardLayout>
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="notifications-list contractor-notifications">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-content">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{notification.timeAgo}</div>
              </div>
              {!notification.isRead && (
                <div className="notification-unread-indicator"></div>
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
    </ContractorDashboardLayout>
  );
};

export default ContractorNotifications;