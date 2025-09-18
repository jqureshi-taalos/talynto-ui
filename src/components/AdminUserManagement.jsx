import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import adminService from '../services/adminService';
import authService from '../services/authService';
import ProfileAvatar from './ProfileAvatar';
import RejectionReasonPopup from './RejectionReasonPopup';
import taalosLogo from '../assets/taalos logo.png';
import NotificationsIcon from './NotificationsIcon';
import SettingsIcon from './SettingsIcon';
import ConfigurationIcon from './ConfigurationIcon';
import LogoutIcon from './LogoutIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon';
import DashboardIcon from './DashboardIcon';
import ProjectManagementIcon from './ProjectManagementIcon';
import UserManagementIcon from './UserManagementIcon';
import InvoicesIcon from './InvoicesIcon';
import './Dashboard.css';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'contractor' ? 'Contractor' : 'Client');
  const [contractors, setContractors] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectionPopup, setRejectionPopup] = useState(null); // { userId, userType, userName }
  const pageSize = 10;

  const fetchContractors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getPaginatedContractors(currentPage, pageSize, statusFilter, searchTerm, dateFilter);

      // Format the date for display
      const formattedContractors = response.contractors.map(contractor => ({
        ...contractor,
        createdDate: new Date(contractor.createdDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        verification: 'Verified', // Default for now
        intakeSubmitted: contractor.intakeFormCompleted ? 'Completed' : 'Pending'
      }));

      setContractors(formattedContractors);
      setPagination({
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch contractors');
      console.error('Error fetching contractors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getPaginatedClients(currentPage, pageSize, statusFilter, searchTerm, dateFilter);

      // Format the date for display
      const formattedClients = response.clients.map(client => ({
        ...client,
        createdDate: new Date(client.createdDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        verification: 'Verified', // Default for now
        intakeSubmitted: 'N/A' // Clients don't have intake forms
      }));

      setClients(formattedClients);
      setPagination({
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Contractor') {
      fetchContractors();
    } else {
      fetchClients();
    }
  }, [activeTab, currentPage, statusFilter, searchTerm, dateFilter]);


  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDateFilterChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    setCurrentPage(1); // Reset to first page when changing date filter
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setStatusFilter('All');
    setSearchTerm('');
    setDateFilter('');
    // Update URL to reflect the active tab
    setSearchParams({ tab: tab.toLowerCase() });
  };

  const handleApprove = async (userId, userType) => {
    try {
      setActionLoading(true);
      if (userType === 'client') {
        await adminService.approveClient(userId, 'Approved by admin');
        fetchClients();
      } else {
        await adminService.approveContractor(userId, 'Approved by admin');
        fetchContractors();
      }
    } catch (err) {
      setError(err.message || `Failed to approve ${userType}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (userId, userType, userName = '') => {
    setRejectionPopup({ userId, userType, userName });
  };

  const handleRejectionSubmit = async (rejectionReason) => {
    if (!rejectionPopup) return;

    try {
      setActionLoading(true);
      const { userId, userType } = rejectionPopup;

      if (userType === 'client') {
        await adminService.rejectClient(userId, rejectionReason);
        fetchClients();
      } else {
        await adminService.rejectContractor(userId, rejectionReason);
        fetchContractors();
      }

      setRejectionPopup(null);
    } catch (err) {
      setError(err.message || `Failed to reject ${rejectionPopup.userType}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectionCancel = () => {
    setRejectionPopup(null);
  };

  const handleDeactivate = async (userId, userType) => {
    setConfirmAction({
      type: 'deactivate',
      userId,
      userType,
      message: `Are you sure you want to deactivate this ${userType}? They will not be able to log in until reactivated.`
    });
  };

  const handleReactivate = async (userId, userType) => {
    setConfirmAction({
      type: 'reactivate',
      userId,
      userType,
      message: `Are you sure you want to reactivate this ${userType}? They will be able to log in again.`
    });
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    try {
      setActionLoading(true);

      if (confirmAction.type === 'deactivate') {
        await adminService.adminDeactivateAccount(confirmAction.userId);
      } else {
        await adminService.adminReactivateAccount(confirmAction.userId);
      }

      if (confirmAction.userType === 'client') {
        fetchClients();
      } else {
        fetchContractors();
      }
    } catch (err) {
      setError(err.message || `Failed to ${confirmAction.type} ${confirmAction.userType}`);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const cancelAction = () => {
    setConfirmAction(null);
  };


  const generatePageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleLogout = async () => {
    await authService.logout();
    // Don't manually navigate - authService.logout() handles redirect
  };

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management', active: true },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices' },
    // { id: 'contractor-intake', icon: '📝', label: 'Contractor Intake', path: '/admin-contractor-intake' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];


  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const handleUserClick = (user) => {
    if (activeTab === 'Client') {
      navigate(`/admin-user-management/client/${user.id}?status=${user.status.toLowerCase()}&tab=client`);
    } else {
      navigate(`/admin-user-management/contractor/${user.id}?status=${user.status.toLowerCase()}&tab=contractor`);
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
          <span className="header-page">User Management</span>
        </div>
        <div className="header-right">
          <div className="notification-icon" onClick={() => navigate('/admin-notifications')} style={{ cursor: 'pointer' }}><HeaderNotificationIcon /></div>
          <div className="user-profile">
            <div>
              <div className="user-name">
                {authService.getCurrentUser()?.firstName && authService.getCurrentUser()?.lastName
                  ? `${authService.getCurrentUser().firstName} ${authService.getCurrentUser().lastName}`
                  : authService.getCurrentUser()?.name || 'Admin'}
              </div>
              <div className="user-role">
                {authService.getCurrentUser()?.role || 'Super Admin'}
              </div>
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
          <div className="sidebar-item" onClick={handleLogout}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="user-management-container">
            {/* Tabs */}
            <div className="user-management-tabs">
              <button
                className={`tab-btn ${activeTab === 'Client' ? 'active' : ''}`}
                onClick={() => handleTabChange('Client')}
              >
                Client
              </button>
              <button
                className={`tab-btn ${activeTab === 'Contractor' ? 'active' : ''}`}
                onClick={() => handleTabChange('Contractor')}
              >
                Contractor
              </button>
            </div>

            {/* Search Bar */}
            <div className="search-section">
              <div className="search-filters">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab.toLowerCase()}s by name or email...`}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="search-input"
                  />
                </div>
                {/* <div className="date-filter">
                  <label htmlFor="dateFilter">Filter by date:</label>
                  <input
                    type="date"
                    id="dateFilter"
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="date-input"
                    title="Filter users created on this date"
                  />
                </div> */}
              </div>
            </div>

            {/* Status Filters */}
            <div className="status-filter-section">
              <div className="status-filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === 'All'}
                    onChange={() => handleStatusFilterChange('All')}
                  />
                  <span className="filter-dot"></span>
                  All
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === 'Active'}
                    onChange={() => handleStatusFilterChange('Active')}
                  />
                  <span className="filter-dot active"></span>
                  Active
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === 'Inactive'}
                    onChange={() => handleStatusFilterChange('Inactive')}
                  />
                  <span className="filter-dot inactive"></span>
                  Inactive
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === 'Pending'}
                    onChange={() => handleStatusFilterChange('Pending')}
                  />
                  <span className="filter-dot pending"></span>
                  Pending
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === 'Rejected'}
                    onChange={() => handleStatusFilterChange('Rejected')}
                  />
                  <span className="filter-dot rejected"></span>
                  Rejected
                </label>
              </div>
            </div>

            {/* Users Table */}
            <div className={`users-table ${activeTab === 'Client' ? 'clients-table' : ''}`}>
              <div className="table-header">
                <div className="th">Name</div>
                <div className="th">Email</div>
                {activeTab === 'Contractor' && <div className="th">Verification</div>}
                <div className="th">Created Date</div>
                {activeTab === 'Contractor' && <div className="th">Intake Submitted</div>}
                <div className="th">Status</div>
                <div className="th">Actions</div>
              </div>

              {loading ? (
                <div className="table-row">
                  <div className="td" style={{ textAlign: 'center', padding: '2rem' }} colSpan={activeTab === 'Contractor' ? "7" : "5"}>
                    Loading {activeTab.toLowerCase()}s...
                  </div>
                </div>
              ) : error ? (
                <div className="table-row">
                  <div className="td" style={{ textAlign: 'center', padding: '2rem', color: 'red' }} colSpan={activeTab === 'Contractor' ? "7" : "5"}>
                    Error: {error}
                  </div>
                </div>
              ) : (activeTab === 'Contractor' ? contractors : clients).length === 0 ? (
                <div className="table-row">
                  <div className="td" style={{ textAlign: 'center', padding: '2rem' }} colSpan={activeTab === 'Contractor' ? "7" : "5"}>
                    No {activeTab.toLowerCase()}s found
                  </div>
                </div>
              ) : (
                (activeTab === 'Contractor' ? contractors : clients).map((user) => (
                  <div key={user.id} className="table-row">
                    <div className="td" onClick={() => handleUserClick(user)}>
                      <div className="user-info">
                        <ProfileAvatar
                          user={{
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            name: user.name,
                            email: user.email
                          }}
                          size={32}
                          className="user-avatar"
                        />
                        <span>{user.name}</span>
                      </div>
                    </div>
                    <div className="td" onClick={() => handleUserClick(user)}>{user.email}</div>
                    {activeTab === 'Contractor' && <div className="td" onClick={() => handleUserClick(user)}>{user.verification}</div>}
                    <div className="td" onClick={() => handleUserClick(user)}>{user.createdDate}</div>
                    {activeTab === 'Contractor' && <div className="td" onClick={() => handleUserClick(user)}>{user.intakeSubmitted}</div>}
                    <div className="td" onClick={() => handleUserClick(user)}>
                      <span className={`status-badge ${getStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="td">
                      <div className="actions-menu">
                        <button className="actions-trigger">⋯</button>
                        <div className="actions-dropdown">
                          <button
                            className="action-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(user);
                            }}
                          >
                            View
                          </button>
                          {user.status === 'Pending' && (
                            <>
                              <button
                                className="action-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(user.id, activeTab.toLowerCase());
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="action-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(user.id, activeTab.toLowerCase(), user.name);
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {user.status === 'Active' && (
                            <button
                              className="action-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeactivate(user.id, activeTab.toLowerCase());
                              }}
                              disabled={actionLoading}
                            >
                              Deactivate
                            </button>
                          )}
                          {user.status === 'Inactive' && (
                            <button
                              className="action-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReactivate(user.id, activeTab.toLowerCase());
                              }}
                              disabled={actionLoading}
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  ««
                </button>
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  ‹
                </button>
                {generatePageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  ›
                </button>
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                >
                  »
                </button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="pagination-info" style={{ textAlign: 'center', marginTop: '1rem', color: '#000000' }}>
              {pagination.totalCount > 0 && (
                <span>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount} {activeTab.toLowerCase()}s
                </span>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm {confirmAction.type === 'deactivate' ? 'Deactivation' : 'Reactivation'}</h3>
            <p>{confirmAction.message}</p>
            <div className="confirmation-details">
              <p><strong>⚠ Important:</strong></p>
              <ul>
                {confirmAction.type === 'deactivate' ? (
                  <>
                    <li>User will not be able to log in after deactivation</li>
                    <li>All user data will be preserved</li>
                    <li>Admin can reactivate the account at any time</li>
                    <li>Associated projects and invoices remain accessible to admin</li>
                  </>
                ) : (
                  <>
                    <li>User will be able to log in again</li>
                    <li>All previous access and permissions will be restored</li>
                    <li>User will receive normal system notifications</li>
                  </>
                )}
              </ul>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={cancelAction}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className={confirmAction.type === 'deactivate' ? 'confirm-delete-btn' : 'confirm-reactivate-btn'}
                onClick={executeAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : `Yes, ${confirmAction.type === 'deactivate' ? 'Deactivate' : 'Reactivate'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Popup */}
      <RejectionReasonPopup
        isOpen={!!rejectionPopup}
        onClose={handleRejectionCancel}
        onSubmit={handleRejectionSubmit}
        userType={rejectionPopup?.userType}
        userName={rejectionPopup?.userName}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminUserManagement;