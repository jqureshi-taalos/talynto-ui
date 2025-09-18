import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AdminInvoices = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [clientStatusFilter, setClientStatusFilter] = useState('All');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const pageSize = 10;

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices', active: true },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];

  // Fetch invoices from API
  const fetchInvoices = async (page = 1, search = '', clientStatus = 'All', adminStatus = 'All', dateFilter = '') => {
    try {
      setLoading(true);
      const token = authService.getToken();

      if (!token) {
        setError('Not authenticated');
        authService.logout();
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy: 'submittedAt',
        sortOrder: 'desc'
      });

      if (search) {
        params.append('searchTerm', search);
      }

      if (clientStatus !== 'All') {
        params.append('status', clientStatus);
      }

      if (dateFilter && dateFilter.trim() !== '') {
        params.append('dateFilter', dateFilter.trim());
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/invoice/search?${params.toString()}`,
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
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch invoices' }));
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }

      const data = await response.json();
      let filteredInvoices = data.invoices || [];

      // Debug: Log the first invoice to see what fields are available
      if (filteredInvoices.length > 0) {
        console.log('Sample invoice data:', filteredInvoices[0]);
      }

      // Apply client-side admin status filtering since backend may not support it  
      if (adminStatus !== 'All') {
        // Use adminPaymentStatus for admin status filtering
        filteredInvoices = filteredInvoices.filter(invoice => {
          if (adminStatus === 'Paid') {
            return invoice.adminPaymentStatus === 'Paid';
          } else if (adminStatus === 'Not Paid') {
            return !invoice.adminPaymentStatus || invoice.adminPaymentStatus !== 'Paid';
          }
          return invoice.adminPaymentStatus === adminStatus;
        });
      }

      setInvoices(filteredInvoices);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load invoices on component mount
  useEffect(() => {
    // Check if user is authenticated before fetching
    if (!authService.isAuthenticated()) {
      authService.logout();
      return;
    }
    fetchInvoices(1, searchTerm, clientStatusFilter, adminStatusFilter, dateFilter);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchInvoices(1, searchTerm, clientStatusFilter, adminStatusFilter, dateFilter);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle status filter changes
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }
    fetchInvoices(1, searchTerm, clientStatusFilter, adminStatusFilter, dateFilter);
  }, [clientStatusFilter, adminStatusFilter]);

  // Handle date filter changes
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }
    fetchInvoices(1, searchTerm, clientStatusFilter, adminStatusFilter, dateFilter);
  }, [dateFilter]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchInvoices(page, searchTerm, clientStatusFilter, adminStatusFilter, dateFilter);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      case 'paid': return 'status-paid';
      default: return '';
    }
  };

  const handleInvoiceClick = (invoice) => {
    navigate(`/admin-invoice/${invoice.id}`);
  };

  const handleDropdownToggle = (e, invoiceId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === invoiceId ? null : invoiceId);
  };

  const getDropdownStyle = (index, totalCount) => {
    const isLastFew = index >= totalCount - 3; // Last 3 rows
    return {
      position: 'absolute',
      top: isLastFew ? 'auto' : '100%',
      bottom: isLastFew ? '100%' : 'auto',
      // @remove dynamic extra stylings
      // right: '0',
      // backgroundColor: 'white',
      // border: '1px solid #000000',
      // borderRadius: '4px',
      // boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      // zIndex: 1000,
      // minWidth: '150px'
    };
  };

  const handleDropdownItemClick = async (e, action, invoice) => {
    e.stopPropagation();
    setOpenDropdownId(null);

    try {
      const token = authService.getToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      let endpoint, method;
      let body = {};

      if (action === 'reject') {
        endpoint = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/invoice/${invoice.id}/admin/reject`;
        method = 'PUT';
        body = { action: 'reject' };
      } else if (action === 'view') {
        navigate(`/admin-invoice/${invoice.id}`);
        return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Admin action response:', responseData);

        // Refresh the invoices list
        fetchInvoices(currentPage, searchTerm, clientStatusFilter, adminStatusFilter, dateFilter);

        // Show success message
        const actionText = action === 'reject' ? 'rejected' : 'updated';
        console.log(`Invoice ${actionText} successfully`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update invoice' }));
        console.error('Admin action error:', errorData);
        setError(errorData.message || `Failed to ${action} invoice`);
      }
    } catch (err) {
      console.error(`Error ${action} invoice:`, err);
      setError(`An error occurred while updating the invoice`);
    }
  };

  const canMarkAsPaid = (status) => {
    return ['pending', 'accepted', 'rejected'].includes(status.toLowerCase());
  };

  const canReject = (status) => {
    return ['pending', 'accepted'].includes(status.toLowerCase());
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdownId]);

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
          <div className="invoices-management-container">
            {/* Header */}
            <div className="invoices-management-header">
              <h2>Manage Invoices</h2>
              <div className="filter-controls">
                <div className="search-filters">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Search by Invoice ID, Project Name, Client Name, or Amount..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  {/* <div className="date-filter">
                    <label htmlFor="invoiceDateFilter">Filter by submitted date:</label>
                    <input
                      type="date"
                      id="invoiceDateFilter"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="date-input"
                      title="Filter invoices submitted on this date"
                    />
                  </div> */}
                </div>
              </div>
            </div>

            {/* Status Filters */}
            <div className="status-filter-section">
              <div className="client-status-filters">
                <span className="filter-label">Client Status</span>
                <div className="status-filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="clientStatus"
                      checked={clientStatusFilter === 'All'}
                      onChange={() => setClientStatusFilter('All')}
                    />
                    <span className="filter-dot"></span>
                    All
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="clientStatus"
                      checked={clientStatusFilter === 'Accepted'}
                      onChange={() => setClientStatusFilter('Accepted')}
                    />
                    <span className="filter-dot accepted"></span>
                    Accepted
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="clientStatus"
                      checked={clientStatusFilter === 'Pending'}
                      onChange={() => setClientStatusFilter('Pending')}
                    />
                    <span className="filter-dot pending"></span>
                    Pending
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="clientStatus"
                      checked={clientStatusFilter === 'Rejected'}
                      onChange={() => setClientStatusFilter('Rejected')}
                    />
                    <span className="filter-dot rejected"></span>
                    Rejected
                  </label>
                </div>
              </div>

              <div className="admin-status-filters">
                <span className="filter-label">Admin Status</span>
                <div className="status-filter-options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="adminStatus"
                      checked={adminStatusFilter === 'All'}
                      onChange={() => setAdminStatusFilter('All')}
                    />
                    <span className="filter-dot"></span>
                    All
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="adminStatus"
                      checked={adminStatusFilter === 'Paid'}
                      onChange={() => setAdminStatusFilter('Paid')}
                    />
                    <span className="filter-dot paid"></span>
                    Paid
                  </label>
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="adminStatus"
                      checked={adminStatusFilter === 'Not Paid'}
                      onChange={() => setAdminStatusFilter('Not Paid')}
                    />
                    <span className="filter-dot not-paid"></span>
                    Not Paid
                  </label>
                </div>
              </div>
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div className="loading-state">
                <p>Loading invoices...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>Error: {error}</p>
                <button onClick={() => fetchInvoices(currentPage, searchTerm, clientStatusFilter, adminStatusFilter, dateFilter)}>Retry</button>
              </div>
            )}

            {/* Invoices Table */}
            {!loading && !error && (
              <div className="invoices-table">
                <div className="table-header">
                  <div className="th">Invoice ID</div>
                  <div className="th">Project Name</div>
                  <div className="th">Client Name</div>
                  <div className="th">Contractor Name</div>
                  <div className="th">Amount</div>
                  <div className="th">Submitted On</div>
                  <div className="th">Status (by Client)</div>
                  <div className="th">Status (by Admin)</div>
                  <div className="th">Actions</div>
                </div>

                {invoices.length === 0 ? (
                  <div className="no-invoices">
                    <p>No invoices found.</p>
                  </div>
                ) : (
                  invoices.map((invoice, index) => (
                    <div key={invoice.id || index} className="table-row" onClick={() => handleInvoiceClick(invoice)}>
                      <div className="td">{invoice.invoiceNumber || invoice.id}</div>
                      <div className="td">{invoice.project?.name || invoice.projectName}</div>
                      <div className="td">
                        <div className="client-info">
                          <ProfileAvatar
                            user={{
                              id: invoice.client?.id || invoice.clientId,
                              firstName: invoice.client?.firstName || invoice.clientFirstName,
                              lastName: invoice.client?.lastName || invoice.clientLastName,
                              name: invoice.clientName,
                              email: invoice.client?.email || invoice.clientEmail
                            }}
                            profilePictureData={invoice.clientAvatar}
                            size={24}
                            className="client-avatar"
                          />
                          <span>{invoice.clientName}</span>
                        </div>
                      </div>
                      <div className="td">
                        <div className="contractor-info">
                          <ProfileAvatar
                            user={{
                              id: invoice.contractor?.id || invoice.contractorId,
                              firstName: invoice.contractor?.firstName || invoice.contractorFirstName,
                              lastName: invoice.contractor?.lastName || invoice.contractorLastName,
                              name: invoice.contractorName,
                              email: invoice.contractor?.email || invoice.contractorEmail
                            }}
                            profilePictureData={invoice.contractorAvatar}
                            size={24}
                            className="contractor-avatar"
                          />
                          <span>{invoice.contractorName}</span>
                        </div>
                      </div>
                      <div className="td">{formatAmount(invoice.totalAmount || invoice.amount)}</div>
                      <div className="td">{formatDate(invoice.submittedAt || invoice.submittedOn)}</div>
                      <div className="td">
                        <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="td">
                        <span className={`status-badge ${invoice.adminPaymentStatus === 'Paid' ? 'status-paid' : 'status-not-paid'}`}>
                          {invoice.adminPaymentStatus || 'Not Paid'}
                        </span>
                      </div>
                      {/* <div className="td">
                        <div className="">
                          <button className="">...</button>
                          <div className="dropdown-menu">
                            <div className="dropdown-item">View</div>
                            <div className="dropdown-item">Mark as Paid</div>
                            <div className="dropdown-item">Reject</div>
                            <div className="dropdown-item">Message Contractor</div>
                          </div>
                        </div>
                      </div> */}
                      <div className="td">
                        <div className="actions-menu" style={{ position: 'relative' }}>
                          <button
                            className="actions-trigger"
                            onClick={(e) => handleDropdownToggle(e, invoice.id)}
                          // @remove inline styles
                          // style={{
                          //   background: '#f8f9fa',
                          //   border: '1px solid #000000',
                          //   cursor: 'pointer',
                          //   fontSize: '14px',
                          //   padding: '6px 10px',
                          //   borderRadius: '4px',
                          //   color: '#000000'
                          // }}
                          >
                            ⋯
                          </button>
                          {openDropdownId === invoice.id && (
                            <div
                              className="actions-dropdown"
                              style={getDropdownStyle(index, invoices.length)}
                            >
                              <div
                                className="dropdown-item"
                                onClick={(e) => handleDropdownItemClick(e, 'view', invoice)}
                              // @remove
                              // style={{
                              //   padding: '8px 12px',
                              //   cursor: 'pointer',
                              //   borderBottom: '1px solid #f0f0f0'
                              // }}
                              >
                                View
                              </div>
                              {canReject(invoice.status) && (
                                <div
                                  className="dropdown-item"
                                  onClick={(e) => handleDropdownItemClick(e, 'reject', invoice)}
                                // @remove
                                // style={{
                                //   padding: '8px 12px',
                                //   cursor: 'pointer',
                                //   color: '#dc3545'
                                // }}
                                >
                                  Reject
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  ««
                </button>
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            )}

            {/* Results Summary */}
            {!loading && !error && (
              <div className="results-summary">
                <p>Showing {invoices.length} of {totalCount} invoices</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminInvoices;