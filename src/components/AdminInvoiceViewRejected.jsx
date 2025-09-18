import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';
import authService from '../services/authService';
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

const AdminInvoiceViewRejected = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const [invoice] = useState({
    invoiceNumber: '#T0001',
    projectName: 'Q3 Financial Audit',
    submittedOn: '2 July 2025',
    dueDate: '6 July 2025',
    dueDays: 'Due in 4 days',
    client: 'David White',
    contractor: 'Sarah Lee',
    hoursLogged: '22 Hrs',
    ratePerHour: '$90',
    subtotal: '$1980.00',
    amountDue: '$1980.00',
    status: 'Rejected',
    rejectionMessage: 'Your invoice rejected by some reason please contact admin or client'
  });

  const [showRequestEditInvoice, setShowRequestEditInvoice] = useState(false);
  const [showMessageContractor, setShowMessageContractor] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices', active: true },
    // { id: 'contractor-intake', icon: '📝', label: 'Contractor intake', path: '/admin-contractor-intake' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Invoice Management</span>
        </div>
        <div className="header-right">
          <div className="notification-icon" onClick={() => navigate('/admin-notifications')} style={{ cursor: 'pointer' }}><HeaderNotificationIcon /></div>
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
          <div className="invoice-view-container">
            {/* Invoice Header */}
            <div className="invoice-header">
              <div className="invoice-title">
                <h2>Invoice ({invoice.invoiceNumber})</h2>
                <button className="tab-btn active" onClick={() => navigate('/admin-invoices')}>Back</button>
              </div>
              <div className="invoice-actions">
                <button
                  className="request-edit-btn"
                  onClick={() => setShowRequestEditInvoice(!showRequestEditInvoice)}
                >
                  Request Edit Invoice
                </button>
                <button
                  className="message-contractor-btn"
                  onClick={() => setShowMessageContractor(!showMessageContractor)}
                >
                  Message Contractor
                </button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="status-badges">
              <span className="status-badge client">🔵 Client:</span>
              <span className="status-badge rejected">Rejected</span>
              <span className="status-badge admin">🔵 Admin:</span>
              <span className="status-badge not-paid">🔴 Not Paid</span>
            </div>

            {/* Invoice Content */}
            <div className="invoice-content">
              <div className="invoice-main">
                <div className="invoice-details">
                  <div className="detail-section">
                    <div className="detail-item">
                      <span className="label">Project Name</span>
                      <span className="value">{invoice.projectName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Submitted On</span>
                      <span className="value">{invoice.submittedOn}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Client</span>
                      <span className="value">{invoice.client}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-item">
                      <span className="label">Due Date</span>
                      <span className="value">{invoice.dueDate} - {invoice.dueDays}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Contractor</span>
                      <span className="value">{invoice.contractor}</span>
                    </div>
                  </div>
                </div>

                {/* Pay Now Button */}
                <div className="pay-now-section">
                  <button className="pay-now-btn">
                    💳 Pay Now
                  </button>
                </div>

                {/* Amount Due */}
                <div className="amount-due-section">
                  <div className="amount-label">Amount Due</div>
                  <div className="amount-value">${invoice.amountDue}</div>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="invoice-summary">
                {/* Rejection Message */}
                <div className="rejection-message-card">
                  <h4>Rejection Message</h4>
                  <p>{invoice.rejectionMessage}</p>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Hours Logged</span>
                  <span className="summary-value">{invoice.hoursLogged}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Rate per Hour</span>
                  <span className="summary-value">{invoice.ratePerHour}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">{invoice.subtotal}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Request Edit Invoice Modal */}
      {showRequestEditInvoice && (
        <div className="modal-overlay" onClick={() => setShowRequestEditInvoice(false)}>
          <div className="modal-content request-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Edit Invoice</h3>
              <button className="close-btn" onClick={() => setShowRequestEditInvoice(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Write message to edit details of intake form of contractor"
                rows={6}
                className="request-edit-textarea"
              />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowRequestEditInvoice(false)}>
                  Cancel
                </button>
                <button className="btn-primary">
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Contractor Modal */}
      {showMessageContractor && (
        <div className="modal-overlay" onClick={() => setShowMessageContractor(false)}>
          <div className="modal-content message-contractor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message Contractor</h3>
              <button className="close-btn" onClick={() => setShowMessageContractor(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Type your message to the contractor here..."
                rows={6}
                className="message-textarea"
              />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowMessageContractor(false)}>
                  Cancel
                </button>
                <button className="btn-primary">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoiceViewRejected;