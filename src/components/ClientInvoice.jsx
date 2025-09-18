import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardIcon from './DashboardIcon';
import ProjectsIcon from './ProjectsIcon';
import NotificationsIcon from './NotificationsIcon';
import './Dashboard.css';
import taalosLogo from '../assets/taalos logo.png';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import { getAvatarUrl } from '../utils/avatarUtils';
import LogoutIcon from './LogoutIcon';
import ProfileSettingsIcon from './ProfileSettingsIcon';
import FindTalentIcon from './FindTalentIcon';
import MessagesIcon from './MessagesIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import NeedHelpIcon from './NeedHelpIcon'
import InvoicesIcon from './InvoicesIcon'

const ClientInvoice = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:54192/api';

  useEffect(() => {
    fetchInvoiceData();
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role && currentUser.role.toLowerCase() === 'client') {
      setUser(currentUser);
    }
  }, [invoiceId]);

  const fetchInvoiceData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/invoice/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          navigate('/login');
          return;
        }
        if (response.status === 404) {
          setError('Invoice not found');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Invoice data received from backend:', data);
      console.log('Project data from backend:', data.project);
      console.log('Project ID from backend:', data.project?.id);
      setInvoiceData(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Failed to load invoice details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/invoice/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Invoice approved:', result);

      navigate('/invoices');
    } catch (error) {
      console.error('Error approving invoice:', error);
      setError('Failed to approve invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageContractor = () => {
    const contractorId = invoiceData?.contractorId || invoiceData?.contractor?.id;
    console.log('Invoice data:', invoiceData);
    console.log('Extracted contractor ID:', contractorId);
    if (contractorId) {
      navigate('/messages', { state: { openChatWithContractor: contractorId } });
    } else {
      console.log('No contractor ID found, navigating to general messages');
      navigate('/messages');
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/invoice/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Invoice rejected:', result);

      navigate('/invoices');
    } catch (error) {
      console.error('Error rejecting invoice:', error);
      setError('Failed to reject invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      case 'approved':
      case 'accepted':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'rejected':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      case 'paid':
        return { backgroundColor: '#cce5ff', color: '#004085' };
      default:
        return { backgroundColor: '#f8f9fa', color: '#6c757d' };
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          backgroundColor: '#FFF8D8',
          color: '#DDB70B'
        };
      case 'accepted':
        return {
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      case 'rejected':
        return {
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
      case 'active':
        return {
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      case 'paid':
        return {
          backgroundColor: '#E6E5FF',
          color: '#2320D7'
        };
      default:
        return {
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
    }
  };

  const getPaymentStatusStyle = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return { backgroundColor: '#d1ecf1', color: '#0c5460' };
      case 'not paid':
      case 'unpaid':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      case 'processing':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      default:
        return { backgroundColor: '#f8f9fa', color: '#6c757d' };
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
            <span className="header-title">taalos</span>
            <div className="header-divider"></div>
            <span className="header-page">Invoice Requests</span>
          </div>
          <div className="header-right">
            <div className="help-section">
              <span className="help-icon"><NeedHelpIcon /></span>
              <span className="help-text">Get Help from Taalos</span>
            </div>
            <div className="notification-icon" onClick={() => navigate('/notifications')}><HeaderNotificationIcon /></div>
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
                <div className="user-avatar">T</div>
              )}
            </div>
          </div>
        </div>
        <div className="dashboard-layout">
          <div className="dashboard-main">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading invoice details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
            <span className="header-title">taalos</span>
            <div className="header-divider"></div>
            <span className="header-page">Invoice Requests</span>
          </div>
          <div className="header-right">
            <div className="help-section">
              <span className="help-icon"><NeedHelpIcon /></span>
              <span className="help-text">Get Help from Taalos</span>
            </div>
            <div className="notification-icon" ><HeaderNotificationIcon /></div>
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
                <div className="user-avatar">T</div>
              )}
            </div>
          </div>
        </div>
        <div className="dashboard-layout">
          <div className="dashboard-main">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Error: {error}</p>
              <button onClick={() => navigate('/client-dashboard/invoices')}>
                Back to Invoices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Invoice Requests</span>
          {invoiceData && invoiceData.status.toLowerCase() === 'rejected' && (
            <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#721c24', fontWeight: 'bold', fontSize: '0.9rem' }}>Client Status: Rejected</span>
              <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Admin Status: Not Reviewed</span>
            </div>
          )}
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
              <div className="user-avatar">T</div>
            )}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-nav">
            <button className="sidebar-item" onClick={() => navigate('/dashboard')}>
              <span className="sidebar-icon"><DashboardIcon /></span>
              <span className="sidebar-label">Dashboard</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/projects')}>
              <span className="sidebar-icon"><ProjectsIcon /></span>
              <span className="sidebar-label">My Projects</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/talent')}>
              <span className="sidebar-icon"><FindTalentIcon /></span>
              <span className="sidebar-label">Find Talent</span>
            </button>
            <button className="sidebar-item active" onClick={() => navigate('/invoices')}>
              <span className="sidebar-icon"><InvoicesIcon /></span>
              <span className="sidebar-label">Invoice Requests</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/messages')}>
              <span className="sidebar-icon"><MessagesIcon /></span>
              <span className="sidebar-label">Messages</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/settings')}>
              <span className="sidebar-icon"><ProfileSettingsIcon /></span>
              <span className="sidebar-label">Profile Settings</span>
            </button>
            <button className="sidebar-item" onClick={() => navigate('/notifications')}>
              <span className="sidebar-icon"><NotificationsIcon /></span>
              <span className="sidebar-label">Notifications</span>
            </button>
          </div>
          <button className="logout-btn" onClick={() => {
            authService.logout();
            navigate('/login');
          }}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="client-invoice-container">
            {/* Back Button */}
            <div className='h-left-button-holder'>
              {invoiceData && (
                <button
                  onClick={() => navigate('/invoices')}
                  className='tab-btn active'
                  style={{ marginBottom: '1rem' }}
                >
                  ← Back
                </button>
              )}
            </div>
            <div className="client-invoice-layout">
              {/* Invoice Summary */}
              <div className="client-invoice-summary">
                <h2>Invoice <strong>Summary</strong></h2>

                <div className="client-summary-content h-box-shadow">
                  <div className="client-summary-row">
                    <span className="client-summary-label">Invoice ID</span>
                    <span className="client-summary-value">{invoiceData.invoiceNumber}</span>
                  </div>

                  <div className="client-summary-row">
                    <span className="client-summary-label">Status</span>
                    <span
                      className="status-badge"
                      style={getStatusColor(invoiceData.status)}
                    >
                      {invoiceData.status}
                    </span>
                  </div>

                  <div className="client-summary-row">
                    <span className="client-summary-label">Payment Status</span>
                    <span
                      className="status-badge"
                      style={getStatusColor(invoiceData.adminPaymentStatus)}
                    >
                      {invoiceData.adminPaymentStatus || 'Not Paid'}
                    </span>
                  </div>

                  <div className="client-summary-row">
                    <span className="client-summary-label">Submitted On</span>
                    <span className="client-summary-value">{invoiceData.submittedOn}</span>
                  </div>

                  <div className="client-summary-row">
                    <span className="client-summary-label">Project</span>
                    <div className="client-project-info">
                      <div
                        className="client-project-color-bar"
                        style={{ backgroundColor: invoiceData.project.color }}
                      ></div>
                      <span className="client-project-name">{invoiceData.project.name}</span>
                    </div>
                  </div>

                  <div className="client-summary-row">
                    <span className="client-summary-label">Client</span>
                    <div className="client-client-info">
                      <div className="client-client-avatar">{invoiceData.client.avatar}</div>
                      <span className="client-client-name">{invoiceData.client.name}</span>
                    </div>
                  </div>

                  <div className="client-summary-row">
                    <span className="client-summary-label">Contractor</span>
                    <div className="client-contractor-info">
                      <img className='client-client-avatar' src={getAvatarUrl(invoiceData.contractor, 24)} alt={invoiceData.contractor.name}
                      // className="client-contractor-avatar-img"
                      />
                      <span className="client-contractor-name">{invoiceData.contractor.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Detail */}
              <div className="client-invoice-detail">
                <h2>Invoice <strong>Detail</strong></h2>

                <div className="client-detail-content h-box-shadow">
                  <div className="client-detail-row">
                    <span className="client-detail-label">Billing Period</span>
                    <span className="client-detail-value">{invoiceData.billingPeriod}</span>
                  </div>

                  <div className="client-detail-row">
                    <span className="client-detail-label">Hours Worked</span>
                    <span className="client-detail-value">{invoiceData.hoursWorked}</span>
                  </div>

                  <div className="client-detail-row">
                    <span className="client-detail-label">Rate (Per Hour)</span>
                    <span className="client-detail-value">{invoiceData.ratePerHour}</span>
                  </div>

                  <div className="client-detail-row">
                    <span className="client-detail-label">Subtotal</span>
                    <span className="client-detail-value">
                      {(() => {
                        // Always calculate to ensure correct math
                        const hours = parseFloat(invoiceData.hoursWorked?.toString() || 0);
                        const rate = parseFloat(invoiceData.ratePerHour?.replace(/[$,]/g, '') || 0);
                        const subtotal = hours * rate;
                        return `$${subtotal.toFixed(2)}`;
                      })()}
                    </span>
                  </div>

                  <div className="client-detail-row client-total-row">
                    <span className="client-detail-label">Total Amount</span>
                    <span className="client-detail-value client-total-amount">
                      {(() => {
                        // Always calculate to ensure correct math
                        const hours = parseFloat(invoiceData.hoursWorked?.toString() || 0);
                        const rate = parseFloat(invoiceData.ratePerHour?.replace(/[$,]/g, '') || 0);
                        const subtotalValue = hours * rate;
                        const total = subtotalValue;

                        // Debug logging
                        console.log('Invoice Calculation Debug:');
                        console.log('Hours:', hours);
                        console.log('Rate:', rate);
                        console.log('Subtotal:', subtotalValue);
                        console.log('Total:', total);
                        console.log('Backend totalAmount:', invoiceData.totalAmount);

                        return `$${total.toFixed(2)}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Message Section */}
            {invoiceData.status.toLowerCase() === 'rejected' && (
              <div style={{
                margin: '20px 0',
                padding: '20px',
                backgroundColor: '#f8d7da',
                borderRadius: '8px',
                border: '1px solid #f5c6cb'
              }}>
                <h3 style={{ color: '#721c24', marginBottom: '10px', marginTop: '0' }}>Rejection Message</h3>
                <p style={{ color: '#721c24', margin: '0' }}>
                  {invoiceData.rejectionMessage || 'Invoice amount appears incorrect based on hours submitted. Please review and resubmit.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {invoiceData.status.toLowerCase() === 'pending' && (
              <div className="client-invoice-actions">
                <button
                  className="client-reject-btn"
                  onClick={handleReject}
                  disabled={isLoading}
                  style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
                >
                  {isLoading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    if (invoiceData.project?.id) {
                      navigate(`/client-view-project/${invoiceData.project.id}`);
                    } else {
                      console.error('Project ID not available');
                      alert('Unable to view project: Project ID not available');
                    }
                  }}
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
                >
                  View Project
                </button>
                <button
                  className="btn-primary"
                  onClick={handleApprove}
                  disabled={isLoading}
                  
                >
                  {isLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            )}

            {/* Action Buttons for Rejected Invoices */}
            {invoiceData.status.toLowerCase() === 'rejected' && (
              <div
                // className="client-invoice-actions"
                className="h-left-button-holder"
              >
                <button
                  onClick={() => {
                    if (invoiceData.project?.id) {
                      navigate(`/client-view-project/${invoiceData.project.id}`);
                    } else {
                      console.error('Project ID not available');
                      alert('Unable to view project: Project ID not available');
                    }
                  }}
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
                >
                  View Project
                </button>
                <button
                  onClick={handleMessageContractor}
                  className='btn-primary'
                >
                  Message Contractor
                </button>
              </div>
            )}

            {/* Action Buttons for Accepted Invoices */}
            {invoiceData.status.toLowerCase() === 'accepted' && (
              <div className="client-invoice-actions">
                <button
                  onClick={() => navigate('/invoices')}
                  style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (invoiceData.project?.id) {
                      navigate(`/client-view-project/${invoiceData.project.id}`);
                    } else {
                      console.error('Project ID not available');
                      alert('Unable to view project: Project ID not available');
                    }
                  }}
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
                >
                  View Project
                </button>
                <button
                  onClick={handleMessageContractor}
                  className='btn-primary'
                >
                  Message Contractor
                </button>
              </div>
            )}

            {/* Action Buttons for Paid Invoices */}
            {invoiceData.status.toLowerCase() === 'paid' && (
              <div className="client-invoice-actions">
                <button
                  onClick={() => navigate('/invoices')}
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (invoiceData.project?.id) {
                      navigate(`/client-view-project/${invoiceData.project.id}`);
                    } else {
                      console.error('Project ID not available');
                      alert('Unable to view project: Project ID not available');
                    }
                  }}
                  style={{ backgroundColor: '#4EC1EF', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  View Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInvoice;