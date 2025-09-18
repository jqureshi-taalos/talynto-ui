import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

class NotificationService {
  async createNotification(type, data) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      let message = '';
      let notificationData = {
        type,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
        ...data
      };

      // Generate notification messages based on type
      switch (type) {
        case 'project_created':
          message = `You created a new project "${data.projectName}"`;
          break;
        case 'project_assigned':
          message = `You assigned ${data.contractorName} to project "${data.projectName}"`;
          break;
        case 'invoice_accepted':
          message = `You accepted ${data.contractorName}'s invoice for project "${data.projectName}"`;
          break;
        case 'invoice_rejected':
          message = `You rejected ${data.contractorName}'s invoice for project "${data.projectName}"`;
          break;
        case 'invoice_paid':
          message = `You paid ${data.contractorName}'s invoice for project "${data.projectName}"`;
          break;
        case 'invoice_pending':
          message = `Your payment for ${data.contractorName}'s invoice for project "${data.projectName}" is pending`;
          break;
        case 'profile_updated':
          message = 'You updated your profile settings';
          break;
        case 'message_sent':
          message = `You sent a message to ${data.recipientName}`;
          // Map to allowed type
          notificationData.type = 'message';
          break;
        case 'message_received':
          message = `You received a message from ${data.senderName}`;
          // Map to allowed type
          notificationData.type = 'message';
          break;
        case 'invoice_submitted':
          message = `You submitted an invoice for project "${data.projectName}"`;
          break;
        case 'profile_updated':
          message = 'Your profile settings have been updated';
          break;
        case 'contractor_message_received':
          message = `You received a message from ${data.clientName}`;
          break;
        default:
          message = 'Notification';
      }

      notificationData.message = message;
      notificationData.timeAgo = this.getTimeAgo(new Date());

      const response = await fetch(`${API_BASE_URL}/notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw the error - notifications shouldn't break the main flow
      return null;
    }
  }

  async getNotifications(page = 1, pageSize = 20) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/notification?page=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/notification/${notificationId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/notification/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Helper methods for specific notification types
  async notifyProjectCreated(projectName) {
    return this.createNotification('project_created', { projectName });
  }

  async notifyProjectAssigned(projectName, contractorName) {
    return this.createNotification('project_assigned', { projectName, contractorName });
  }

  async notifyInvoiceAction(action, projectName, contractorName) {
    return this.createNotification(`invoice_${action}`, { projectName, contractorName });
  }

  async notifyProfileUpdated() {
    return this.createNotification('profile_updated', {});
  }

  async notifyMessageSent(recipientName) {
    return this.createNotification('message_sent', { recipientName });
  }

  async notifyMessageReceived(senderName) {
    return this.createNotification('message_received', { senderName });
  }

  // Contractor-specific notification methods
  async notifyContractorProfileUpdated() {
    return this.createNotification('profile_updated', {});
  }

  async notifyInvoiceSubmitted(projectName) {
    return this.createNotification('invoice_submitted', { projectName });
  }

  async notifyContractorMessageReceived(clientName) {
    return this.createNotification('contractor_message_received', { clientName });
  }

  // Utility function to format time ago
  getTimeAgo(date) {
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
  }
}

export default new NotificationService();