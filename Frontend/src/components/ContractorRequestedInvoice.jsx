import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardIcon from './DashboardIcon'; // Dashboard SVG icon
import ProjectsIcon from './ProjectsIcon'; // Projects SVG icon
import NotificationsIcon from './NotificationsIcon';
import ProfileSettingsIcon from './ProfileSettingsIcon';
import './Dashboard.css';
import taalosLogo from '../assets/taalos logo.png';
import LogoutIcon from './LogoutIcon';
import MessagesIcon from './MessagesIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import NeedHelpIcon from './NeedHelpIcon';
import InvoicesIcon from './InvoicesIcon'

const ContractorRequestedInvoice = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const invoiceData = {
    invoiceId: '#T0001',
    projectName: 'Q3 Audit',
    status: 'Rejected',
    submittedOn: '2 July 2025',
    rejectedOn: '3 July 2025',
    rejectionMessage: 'Invoice amount appears incorrect based on hours submitted. Please review and resubmit.',
    hoursBilled: '22 Hrs',
    ratePerHour: '$85',
    subtotal: '$1,870'
  };

  const handleMessageClient = () => {
    navigate('/contractor-messages');
  };

  const handleCancelInvoice = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Invoice cancelled:', invoiceId);
      alert('Invoice cancelled successfully!');
      navigate('/contractor-invoices');
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      alert('Error cancelling invoice. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditInvoice = () => {
    navigate(`/contractor-submit-new-invoice/${invoiceId}`);
  };

  const handleResubmitInvoice = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Invoice resubmitted:', invoiceId);
      alert('Invoice resubmitted successfully!');
      navigate('/contractor-invoices');
    } catch (error) {
      console.error('Error resubmitting invoice:', error);
      alert('Error resubmitting invoice. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      case 'approved':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'rejected':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      case 'paid':
        return { backgroundColor: '#cce5ff', color: '#004085' };
      default:
        return { backgroundColor: '#f8f9fa', color: '#6c757d' };
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Invoices</span>
        </div>
        <div className="header-right">
          <div className="help-section">
            <span className="help-icon"><NeedHelpIcon /></span>
            <span className="help-text">Get Help from Taalos</span>
          </div>
          <div
            className="notification-icon"
            onClick={() => navigate('/notifications')}
          ><HeaderNotificationIcon /></div>
          <div className="user-profile">
            <div>
              <div className="user-name">Taalos</div>
              <div className="user-role">Contractor</div>
            </div>
            <div className="user-avatar">T</div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-nav">
            <button className="sidebar-item">
              <span className="sidebar-icon"><DashboardIcon /></span>
              <span className="sidebar-label">Dashboard</span>
            </button>
            <button className="sidebar-item">
              <span className="sidebar-icon"><ProjectsIcon /></span>
              <span className="sidebar-label">My Projects</span>
            </button>
            <button className="sidebar-item">
              <span className="sidebar-icon"><MessagesIcon /></span>
              <span className="sidebar-label">Messages</span>
            </button>
            <button className="sidebar-item active">
              <span className="sidebar-icon"><InvoicesIcon /></span>
              <span className="sidebar-label">Invoices</span>
            </button>
            <button className="sidebar-item">
              <span className="sidebar-icon"><ProfileSettingsIcon /></span>
              <span className="sidebar-label">Profile</span>
            </button>
            <button className="sidebar-item">
              <span className="sidebar-icon"><NotificationsIcon /></span>
              <span className="sidebar-label">Notifications</span>
            </button>
          </div>
          <button className="logout-btn">
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="requested-invoice-container">
            <div className="requested-invoice-header">
              <h1>Invoice <strong>Summary</strong></h1>
              <div className="invoice-actions">
                <button className="message-client-btn" onClick={handleMessageClient}>
                  Message Client
                </button>
                <button className="cancel-invoice-btn" onClick={handleCancelInvoice} disabled={isProcessing}>
                  Cancel Invoice
                </button>
                <button className="edit-btn" onClick={handleEditInvoice}>
                  Edit
                </button>
                <button className="resubmit-btn" onClick={handleResubmitInvoice} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Resubmit Invoice'}
                </button>
              </div>
            </div>

            <div className="invoice-summary-layout">
              {/* Invoice Summary */}
              <div className="invoice-summary-card">
                <div className="summary-content">
                  <div className="profile-field">
                    <span className="field-label">Invoice ID</span>
                    <span className="field-value">{invoiceData.invoiceId}</span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="field-label">Project Name</span>
                    <span className="field-value">{invoiceData.projectName}</span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="field-label">Status</span>
                    <span 
                      className="status-badge"
                      style={getStatusStyle(invoiceData.status)}
                    >
                      {invoiceData.status}
                    </span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="field-label">Submitted On</span>
                    <span className="field-value">{invoiceData.submittedOn}</span>
                  </div>
                  
                  <div className="profile-field">
                    <span className="field-label">Rejected On</span>
                    <span className="field-value">{invoiceData.rejectedOn}</span>
                  </div>
                </div>
              </div>

              {/* Rejection Message */}
              {invoiceData.status === 'Rejected' && (
                <div className="rejection-message-card">
                  <h3>Rejection Message</h3>
                  <p className="rejection-text">{invoiceData.rejectionMessage}</p>
                </div>
              )}
            </div>

            {/* Invoice Detail */}
            <div className="invoice-detail-card">
              <h2>Invoice <strong>Detail</strong></h2>
              
              <div className="detail-content">
                <div className="profile-field">
                  <span className="field-label">Hours Billed</span>
                  <span className="field-value">{invoiceData.hoursBilled}</span>
                </div>
                
                <div className="profile-field">
                  <span className="field-label">Rate per Hour</span>
                  <span className="field-value">{invoiceData.ratePerHour}</span>
                </div>
                
                <div className="profile-field">
                  <span className="field-label">Subtotal</span>
                  <span className="field-value">{invoiceData.subtotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorRequestedInvoice;