import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import ProfileAvatar from './ProfileAvatar';
import taalosLogo from '../assets/taalos logo.png';
import DashboardIcon from './DashboardIcon';
import UserManagementIcon from './UserManagementIcon';
import ProjectManagementIcon from './ProjectManagementIcon';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import SettingsIcon from './SettingsIcon';
import ConfigurationIcon from './ConfigurationIcon';
import LogoutIcon from './LogoutIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import './Dashboard.css';
import PayNowButtonIcon from './PayNowButtonIcon';
import ClientIcon from './ClientIcon';
import AdminIcon from './AdminIcon';

const AdminInvoiceView = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();

        if (!token) {
          setError('Not authenticated');
          authService.logout();
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/invoice/${invoiceId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 401) {
          setError('Session expired. Please login again.');
          authService.logout();
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch invoice details' }));
          throw new Error(errorData.message || 'Failed to fetch invoice details');
        }

        const data = await response.json();

        console.log('Hourly rate field:', data?.ratePerHour || 'NOT FOUND');

        setInvoice(data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId && authService.isAuthenticated()) {
      fetchInvoice();
    } else if (!authService.isAuthenticated()) {
      authService.logout();
    }
  }, [invoiceId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    console.log('In formatAmount function', amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const parseNumericValue = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
      const cleaned = value
        .replace(/[^0-9.\-]/g, '') // Remove everything except digits, dot, minus
        .trim();

      const parsed = parseFloat(cleaned);

      return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  };

  const calculateTaalosFee = (subtotal) => {
    const subtotalAmount = parseNumericValue(subtotal);
    return subtotalAmount * 0.3;
  };

  const calculateTotalWithFees = (subtotal) => {
    const subtotalAmount = parseNumericValue(subtotal);
    const taalosFee = calculateTaalosFee(subtotal);
    return subtotalAmount + taalosFee;
  };

  const calculateDueDaysText = (dueDate) => {
    if (!dueDate) return 'No due date';
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
    }
  };

  const handleBackNavigation = () => {
    const source = searchParams.get('source');
    if (source === 'dashboard') {
      navigate('/admin-dashboard');
    } else {
      navigate('/admin-invoices');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices', active: true },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];

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

  const handlePayNow = async () => {
    if (!invoice || invoice.adminPaymentStatus === 'Paid') {
      return;
    }

    try {
      setLoading(true);
      const token = authService.getToken();

      if (!token) {
        setError('Not authenticated');
        authService.logout();
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/invoice/${invoiceId}/admin/mark-paid`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'pay' })
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log('Pay now response:', responseData);

        // Refresh the invoice data
        // window.location.reload(); // Simple refresh for now
        navigate('/admin-invoices')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to mark invoice as paid' }));
        setError(errorData.message || 'Failed to mark invoice as paid');
      }
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      setError('An error occurred while processing payment');
    } finally {
      setLoading(false);
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
          {loading && (
            <div className="loading-state">
              <p>Loading invoice...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {!loading && !error && invoice && (
            <div className="invoice-view-container">
              {/* Invoice Header */}
              <div className="invoice-header">
                <div className="invoice-title">
                  <h2>Invoice ({invoice?.invoiceNumber || 'Loading...'})</h2>
                  <button className="tab-btn active" onClick={handleBackNavigation}>Back</button>
                </div>
              </div>

              {/* Invoice Content */}
              <div className="invoice-content">
                <div className="h-invoice-main h-box-shadow">
                  <div className='h-invoice-sub-main'>
                    <div className='h-invoice-row'>
                      <div className='h-invoice-data-row'>
                        <div>
                          <div className='label'>Project Name</div>
                          <div className='value'>{invoice?.project?.name || 'N/A'}</div>
                        </div>
                        <div>
                          <button className="btn-primary" disabled={invoice?.adminPaymentStatus === 'Paid'} onClick={handlePayNow}>
                            {invoice?.adminPaymentStatus === 'Paid' ? '✅ Already Paid' :
                              <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}> <PayNowButtonIcon /> Pay Now </span>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className='h-invoice-row'>
                      <div className='h-invoice-data-row'>
                        <div>
                          <div className='label'>Submitted On</div>
                          <div className='value'>{formatDate(invoice?.submittedAt)}</div>
                        </div>
                        <div>
                          <div className='label'>Due Date</div>
                          <div className='value'>{formatDate(invoice?.dueDate)} - {calculateDueDaysText(invoice?.dueDate)}</div>
                        </div>
                      </div>
                    </div>
                    <div className='h-invoice-row'>
                      <div className='h-invoice-data-row'>
                        <div>
                          <div className='label'>Client</div>
                          <div className='value'>{invoice?.client?.name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="label">Contractor</div>
                          <div className="value">{invoice?.contractor?.name || 'N/A'}</div>                        </div>
                      </div>
                    </div>

                    <div className='h-invoice-amount'>
                      <div>
                        <div className='label'>Amount Due</div>
                        <div className='value'>{invoice?.totalAmount || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Summary */}
                <div>
                  <div className="status-badges">
                    <span className='status-title'> <ClientIcon /> Client:</span>
                    <span className="status-badge" style={getStatusColor(invoice?.status)}>{invoice?.status || 'Pending'}</span>
                    <span className='status-title'><AdminIcon /> Admin Payment:</span>
                    <span className="status-badge" style={getStatusColor(invoice?.adminPaymentStatus || 'not-paid')}> {invoice?.adminPaymentStatus || 'Not Paid'}</span>
                  </div>
                  <div className="invoice-summary h-box-shadow">
                    <div className="summary-item">
                      <span className="summary-label">Hours Logged</span>
                      <span className="summary-value">{parseNumericValue(invoice?.HoursWorked || invoice?.hoursWorked) || '0'} hrs</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Rate per Hour</span>
                      <span className="summary-value">{formatAmount(parseNumericValue(invoice?.ratePerHour))}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Subtotal</span>
                      <span className="summary-value">{invoice?.subtotal || 'N/A'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Taalos Fee (30%)</span>
                      <span className="summary-value">{formatAmount(calculateTaalosFee(invoice?.subtotal))}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Amount</span>
                      <span className="summary-value">{formatAmount(calculateTotalWithFees(invoice?.subtotal))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

    </div>
  );
};

export default AdminInvoiceView;