import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
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

const AdminProjectManagement = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const pageSize = 10;

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management', active: true },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices' },
    // { id: 'contractor-intake', icon: '📝', label: 'Contractor Intake', path: '/admin-contractor-intake' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];

  // Load projects on component mount and when status/date filters change
  useEffect(() => {
    loadProjects();
  }, [currentPage, statusFilter, startDateFilter, endDateFilter]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        loadProjects();
      } else {
        setCurrentPage(1); // This will trigger loadProjects via the other useEffect
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getAllProjectsForAdmin(currentPage, pageSize, statusFilter, 'createdAt', 'desc', searchTerm, startDateFilter, endDateFilter);
      setProjects(response.projects || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 1);
      setStatusCounts(response.statusCounts || {});
      console.log('Projects loaded:', response.projects?.length, 'projects');
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects: ' + error.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  // Removed handleProjectClick - admin project management table rows should not be clickable
  // const handleProjectClick = (project) => {
  //   navigate(`/admin-project/${project.id}`);
  // };

  const handleDropdownToggle = (e, projectId) => {
    e.stopPropagation(); // Prevent row click
    console.log('Dropdown toggled for project:', projectId, 'current openDropdownId:', openDropdownId);
    const newId = openDropdownId === projectId ? null : projectId;
    console.log('Setting openDropdownId to:', newId);
    setOpenDropdownId(newId);
  };

  const getDropdownStyle = (index, totalCount) => {
    const isLastFew = index >= totalCount - 3; // Last 3 rows
    return {
      position: 'absolute',
      top: isLastFew ? 'auto' : '100%',
      bottom: isLastFew ? '100%' : 'auto',
      // @remove extra dynamic styling
      // right: '0',
      // backgroundColor: 'white',
      // border: '1px solid #000000',
      // borderRadius: '4px',
      // boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      // zIndex: 1000,
      // minWidth: '150px'
    };
  };

  const handleDropdownItemClick = (e, action, project) => {
    e.stopPropagation(); // Prevent row click
    setOpenDropdownId(null); // Close dropdown

    switch (action) {
      case 'view':
        if (project.status === 'Active') {
          navigate(`/admin-project-management/view-project-active/${project.id}`);
        } else {
          navigate(`/admin-project-management/view-project/${project.id}`);
        }
        break;
      case 'close':
        // TODO: Implement close project functionality
        console.log('Close project:', project.id);
        break;
      case 'edit':
        if (project.status === 'Active') {
          navigate(`/admin-project-management/view-project-active/${project.id}?edit=true`);
        } else {
          navigate(`/admin-project-management/view-project/${project.id}?edit=true`);
        }
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (start === 'Not set' && end === 'Not set') {
      return 'Not set';
    } else if (start === 'Not set') {
      return `End: ${end}`;
    } else if (end === 'Not set') {
      return `Start: ${start}`;
    } else {
      return `${start} - ${end}`;
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
          <span className="header-title">taalos</span>
          <div className="header-divider"></div>
          <span className="header-page">Project Management</span>
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
          <div className="sidebar-item" onClick={() => navigate('/admin-login')}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="project-management-container">
            {/* Header */}
            <div className="project-management-header">
              <h2>Manage Projects</h2>
            </div>

            {/* Search Bar */}
            <div className="search-section">
              <div className="search-filters">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search projects by name, client, contractor, or type..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="search-input"
                  />
                </div>
                {/* <div className="date-filters">
                  <div className="date-filter">
                    <label htmlFor="startDateFilter">Start Date from:</label>
                    <input
                      type="date"
                      id="startDateFilter"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="date-input"
                      title="Filter projects by start date from this date"
                    />
                  </div> */}
                {/* <div className="date-filter">
                    <label htmlFor="endDateFilter">End Date until:</label>
                    <input
                      type="date"
                      id="endDateFilter"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="date-input"
                      title="Filter projects by end date until this date"
                    />
                  </div> */}
                {/* </div> */}
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
                  All ({totalCount})
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === 'Active'}
                    onChange={() => handleStatusFilterChange('Active')}
                  />
                  <span className="filter-dot active"></span>
                  Active ({statusCounts.Active || 0})
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === 'Pending'}
                    onChange={() => handleStatusFilterChange('Pending')}
                  />
                  <span className="filter-dot pending"></span>
                  Pending ({statusCounts.Pending || 0})
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === 'Closed'}
                    onChange={() => handleStatusFilterChange('Closed')}
                  />
                  <span className="filter-dot closed"></span>
                  Closed ({statusCounts.Closed || 0})
                </label>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="loading-spinner"></div>
            )}

            {/* Error State */}
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

            {/* Projects Table */}
            {!loading && !error && (
              <div className="projects-table">
                <div className="table-header">
                  <div className="th">Project Name</div>
                  <div className="th">Project Type</div>
                  <div className="th">Client Name</div>
                  <div className="th">Assigned Contractor</div>
                  <div className="th">Start / End Date</div>
                  <div className="th">Status</div>
                  <div className="th">Actions</div>
                </div>

                {projects.length === 0 ? (
                  <div className="no-projects" style={{ textAlign: 'center', padding: '40px', color: '#000000' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
                    <h3 style={{ marginBottom: '10px' }}>No Projects Found</h3>
                    <p>No projects match the current filter.</p>
                  </div>
                ) : (
                  projects.map((project, index) => (
                    <div key={project.id} className="table-row">
                      <div className="td">{project.name}</div>
                      <div className="td">{project.projectType || project.type || 'Not specified'}</div>
                      <div className="td">{project.clientName}</div>
                      <div className="td">
                        <div className="contractor-info">
                          {project.assignedContractorId ? (
                            <ProfileAvatar
                              user={{
                                id: project.assignedContractorId,
                                firstName: project.assignedContractorFirstName,
                                lastName: project.assignedContractorLastName,
                                name: project.assignedContractorName,
                                email: project.assignedContractorEmail
                              }}
                              size={24}
                              className="contractor-avatar"
                            />
                          ) : (
                            <span className="contractor-avatar">?</span>
                          )}
                          <span>{project.assignedContractorName || 'TBD'}</span>
                        </div>
                      </div>
                      <div className="td">{formatDateRange(project.startDate, project.endDate)}</div>
                      <div className="td">
                        <span className={`status-badge ${getStatusClass(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="td">
                        <div className="actions-menu" style={{ position: 'relative' }}>
                          <button
                            className="actions-trigger"
                            onClick={(e) => handleDropdownToggle(e, project.id)}
                          >
                            ⋯
                          </button>
                          {openDropdownId === project.id && (
                            <div
                              className="actions-dropdown"
                              style={getDropdownStyle(index, projects.length)}
                            >
                              {project.status === 'Pending' && (
                                <>
                                  <div
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'view', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f0f0f0'
                                    }}
                                  >
                                    View
                                  </div>
                                  <div
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'edit', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Edit
                                  </div>
                                </>
                              )}
                              {project.status === 'Active' && (
                                <>
                                  <div
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'view', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f0f0f0'
                                    }}
                                  >
                                    View
                                  </div>
                                  <div
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'edit', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Edit
                                  </div>
                                </>
                              )}
                              {(project.status === 'Inactive' || project.status === 'Closed') && (
                                <div
                                  className="dropdown-item"
                                  onClick={(e) => handleDropdownItemClick(e, 'view', project)}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  View
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* <div className="td">
                        <div className="">
                          <button 
                            onClick={(e) => handleDropdownToggle(e, project.id)}
                          >
                            ...
                          </button>
                          {openDropdownId === project.id && (
                            <div 
                              className="dropdown-menu" 
                              style={{
                                position: 'absolute',
                                top: '100%',
                                right: '0',
                                backgroundColor: 'white',
                                border: '1px solid #000000',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                zIndex: 1000,
                                minWidth: '150px'
                              }}
                            >
                              {project.status === 'Pending' && (
                                <>
                                  <div 
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'view', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f0f0f0'
                                    }}
                                  >
                                    View
                                  </div>
                                  <div 
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'assign', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f0f0f0'
                                    }}
                                  >
                                    Assign Contractor
                                  </div>
                                  <div 
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'close', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f0f0f0'
                                    }}
                                  >
                                    Close
                                  </div>
                                  <div 
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'edit', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f0f0f0'
                                    }}
                                  >
                                    Edit
                                  </div>
                                </>
                              )}
                              {project.status === 'Active' && (
                                <>
                                  <div 
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'view', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f0f0f0'
                                    }}
                                  >
                                    View
                                  </div>
                                  <div 
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownItemClick(e, 'edit', project)}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Edit
                                  </div>
                                </>
                              )}
                              {(project.status === 'Inactive' || project.status === 'Closed') && (
                                <div 
                                  className="dropdown-item"
                                  onClick={(e) => handleDropdownItemClick(e, 'view', project)}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  View
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div> */}

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
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
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
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminProjectManagement;

