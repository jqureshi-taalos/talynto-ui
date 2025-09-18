import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';
import { debugApiRequest } from '../utils/apiTest';
import { createDropdownPositionHandler } from '../utils/dropdownUtils';
import { getAvatarUrl } from '../utils/avatarUtils';
import ContractorInvitationModal from './ContractorInvitationModal';

const ContractorProjects = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobInvites, setJobInvites] = useState([]);
  const [jobInviteFilter, setJobInviteFilter] = useState('pending');
  const [jobInvitePage, setJobInvitePage] = useState(1);
  const [jobInviteTotalPages, setJobInviteTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showJobActionsMenu, setShowJobActionsMenu] = useState(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
    }
  }, [activeTab, activeFilter, currentPage, startDateFilter, endDateFilter]);

  useEffect(() => {
    if (activeTab === 'job') {
      fetchJobInvites();
    }
  }, [activeTab, jobInviteFilter, jobInvitePage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchProjects();
      } else {
        setCurrentPage(1); // This will trigger fetchProjects via the other useEffect
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString()
      });

      if (activeFilter !== 'all') {
        params.append('status', activeFilter);
      }

      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }

      if (startDateFilter && startDateFilter.trim() !== '') {
        params.append('startDate', startDateFilter.trim());
      }

      if (endDateFilter && endDateFilter.trim() !== '') {
        params.append('endDate', endDateFilter.trim());
      }

      const fullUrl = `${API_BASE_URL}/dashboard/contractor/projects-list?${params}`;

      console.log('Fetching contractor projects from:', fullUrl);

      const result = await debugApiRequest(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!result.success) {
        if (result.status === 401) {
          authService.logout();
          navigate('/login');
          return;
        }
        throw new Error(`API request failed: ${result.error || result.text}`);
      }

      const data = result.data;
      setProjects(data.projects || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 0);

    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message);

      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback mock data due to API error');
        setProjects([
          {
            id: 1,
            name: 'Q3 Financial Audit',
            startDate: '22/5/2025',
            endDate: '',
            client: {
              name: 'David White',
              avatar: 'DW'
            },
            status: 'active',
            color: '#4EC1EF',
            hourlyRate: 75
          },
          {
            id: 2,
            name: 'Year-End Tax Review',
            startDate: '22/5/2025',
            endDate: '28/6/2025',
            client: {
              name: 'Shawn Brown',
              avatar: 'SB'
            },
            status: 'closed',
            color: '#B83DBA',
            hourlyRate: 85
          }
        ]);
        setTotalCount(2);
        setTotalPages(1);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchJobInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authService.getToken();
      if (!token) return;
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const params = new URLSearchParams({ status: jobInviteFilter, page: jobInvitePage.toString(), pageSize: '10' });
      const res = await fetch(`${API_BASE_URL}/project/contractor/invitations?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { authService.logout(); navigate('/login'); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJobInvites(data.invitations || []);
      setJobInviteTotalPages(data.totalPages || 0);
    } catch (e) {
      setError('Failed to load job requests');
    } finally { setLoading(false); }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const updateInviteStatus = async (invitationId, action) => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const res = await fetch(`${API_BASE_URL}/project/invitations/${invitationId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.status === 401) { authService.logout(); navigate('/login'); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchJobInvites();
    } catch (e) {
      setError('Failed to update invite');
    }
  };

  const handleViewJobInvitation = (invitation) => {
    setSelectedInvitation(invitation);
    setShowInvitationModal(true);
    setShowJobActionsMenu(null);
  };

  const handleRejectJobProject = async (invitationId) => {
    setShowJobActionsMenu(null);
    await updateInviteStatus(invitationId, 'reject');
  };

  const handleJobModalStatusUpdate = () => {
    fetchJobInvites();
  };

  const handleProjectClick = (projectId) => {
    navigate(`/contractor-project-summary/${projectId}`);
  };

  const handleRequestInvoice = (project) => {
    console.log('Navigating with project data:', project); // Debug log

    // Safely extract hourly rate, handling different possible field names
    const hourlyRateField = project.hourlyRate ||
      project.HourlyRate ||
      project.rate ||
      project.Rate ||
      project.ratePerHour ||
      project.RatePerHour ||
      project.budget ||
      project.Budget ||
      '';

    let ratePerHour = '';
    if (hourlyRateField) {
      if (typeof hourlyRateField === 'string') {
        ratePerHour = hourlyRateField.replace('$', '').replace('/Hr', '').replace('/hr', '').trim();
      } else if (typeof hourlyRateField === 'number') {
        ratePerHour = hourlyRateField.toString();
      }
    }

    console.log('Extracted rate per hour:', ratePerHour); // Debug log

    // Format dates for HTML date input (yyyy-mm-dd format)
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';

      // Handle different date formats
      let date;
      if (dateStr.includes('/')) {
        // Handle dd/mm/yyyy or mm/dd/yyyy format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // Assume dd/mm/yyyy format based on the display in the table
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else if (dateStr.includes('-')) {
        // Handle yyyy-mm-dd or dd-mm-yyyy format
        date = new Date(dateStr);
      } else {
        // Try to parse as is
        date = new Date(dateStr);
      }

      // Return in yyyy-mm-dd format for HTML date input
      if (date && !isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return '';
    };

    const formattedStartDate = formatDateForInput(project.startDate);
    const formattedEndDate = formatDateForInput(project.endDate);

    console.log('Original dates:', { startDate: project.startDate, endDate: project.endDate });
    console.log('Formatted dates:', { startDate: formattedStartDate, endDate: formattedEndDate });

    navigate('/contractor/submit-invoice', {
      state: {
        prePopulateData: {
          projectId: project.id,
          projectName: project.name,
          ratePerHour: ratePerHour,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      }
    });
  };

  // @final getStatusColor function added and remove existing badge functions
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
      case 'paid':
        return {
          backgroundColor: '#E6E5FF',
          color: '#2320D7'
        };
      case 'active':
        return {
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      default:
        return {
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
    }
  };

  // Helper function to get client names (in real app, this would come from API)
  const getClientName = (clientId) => {
    const names = ['David White', 'Shawn Brown', 'John Smith', 'Sarah Johnson'];
    return names[clientId % names.length] || `Client ${clientId}`;
  };

  const getActionMenuItems = (project) => {
    const baseItems = [
      { label: 'View', icon: '👁️' }
    ];

    // Only show Request Invoice if project status is Active
    if (project.status?.toLowerCase() === 'active') {
      baseItems.push({ label: 'Request Invoice', icon: '📄' });
    }

    return baseItems;
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
      <div className="projects-container">
        <div className="projects-header">
          <h1>Manage <strong>Projects</strong></h1>
        </div>

        <div className="talent-tabs" style={{ marginTop: 8 }}>
          <button className={`tab-button ${activeTab==='projects'?'active':''}`} onClick={()=>setActiveTab('projects')}>Projects</button>
          <button className={`tab-button ${activeTab==='job'?'active':''}`} onClick={()=>setActiveTab('job')}>Job Request</button>
        </div>

        {error && (
          <div className="error-message">
            <h3>Error loading projects</h3>
            <p>{error}</p>
            <button onClick={fetchProjects} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Search Section */}
        <div className='contractor-my-projects'>
          {activeTab === 'projects' && (
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search projects by name or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* <div className="date-filters">
            <div className="date-filter-group">
              <label htmlFor="startDateFilter">From:</label>
              <input
                type="date"
                id="startDateFilter"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="date-input"
                title="Filter projects starting from this date"
              />
            </div>
            <div className="date-filter-group">
              <label htmlFor="endDateFilter">To:</label>
              <input
                type="date"
                id="endDateFilter"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="date-input"
                title="Filter projects ending up to this date"
              />
            </div>
          </div> */}
          </div>
          )}

          {/* Filter Section */}
          {activeTab === 'projects' ? (
            <div className="projects-filter">
              <div className="filter-options">
                <label className="filter-option">
                  <input type="radio" name="projectFilter" checked={activeFilter==='all'} onChange={()=>handleFilterChange('all')} />
                  <span className="filter-circle"></span>
                  All
                </label>
                <label className="filter-option">
                  <input type="radio" name="projectFilter" checked={activeFilter==='active'} onChange={()=>handleFilterChange('active')} />
                  <span className="filter-circle"></span>
                  Active
                </label>
                <label className="filter-option">
                  <input type="radio" name="projectFilter" checked={activeFilter==='closed'} onChange={()=>handleFilterChange('closed')} />
                  <span className="filter-circle"></span>
                  Closed
                </label>
              </div>
            </div>
          ) : (
            <div className="projects-filter">
              <div className="filter-options">
                {['pending','accepted','rejected','all'].map(s => (
                  <label key={s} className="filter-option">
                    <input type="radio" name="inviteFilter" checked={jobInviteFilter===s} onChange={()=>{ setJobInviteFilter(s); setJobInvitePage(1); }} />
                    <span className="filter-circle"></span>
                    {s.charAt(0).toUpperCase()+s.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'projects' ? (
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Start Date - End Date</th>
                <th style={{ textAlign: 'left' }}>Client Name</th>
                <th>Status</th>
                <th style={{ textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map(project => (
                  <tr key={project.id} className="project-row" onClick={() => handleProjectClick(project.id)} style={{ cursor: 'pointer' }}>
                    <td className="project-name-cell">
                      <div className="project-name-container">
                        <span className="project-name">{project.name}</span>
                      </div>
                    </td>
                    <td className="project-dates">
                      {project.startDate} - {project.endDate || 'Ongoing'}
                    </td>
                    <td className="project-client" style={{ textAlign: 'left' }}>
                      <div className="client-info h-contractor">
                        <div className="client-avatar">{project.client.avatar}</div>
                        <span className="client-name ">{project.client.name}</span>
                      </div>
                    </td>
                    <td className="project-status">
                      <span
                        className="status-badge"
                        style={getStatusColor(project.status)}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </td>
                    <td className="project-actions" style={{ textAlign: 'right' }}>
                      <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="actions-trigger"
                          onMouseEnter={createDropdownPositionHandler(120)}
                        >
                          ...
                        </button>
                        <div className="action-dropdown">
                          {getActionMenuItems(project).map((item, index) => (
                            <button
                              key={index}
                              className="action-item"
                              onClick={() => {
                                if (item.label === 'View') {
                                  handleProjectClick(project.id);
                                } else if (item.label === 'Request Invoice') {
                                  handleRequestInvoice(project);
                                }
                              }}
                            >
                              <span className="action-label">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-projects">
                    {error ? 'Unable to load projects' : 'No projects found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Start Date - End Date</th>
                <th style={{ textAlign: 'left' }}>Client</th>
                <th>Status</th>
                <th style={{ textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobInvites.length > 0 ? (
                jobInvites.map(inv => (
                  <tr key={inv.id} className="project-row">
                    <td className="project-name-cell">
                      <div className="project-name-container">
                        <span className="project-name">{inv.project?.name}</span>
                      </div>
                    </td>
                    <td className="project-dates">{inv.project?.startDate?.split('T')[0] || 'TBD'} - {inv.project?.endDate?.split('T')[0] || 'TBD'}</td>
                    <td className="project-client" style={{ textAlign: 'left' }}>
                      <div className="client-info h-contractor">
                        <img
                          src={getAvatarUrl({ name: getClientName(inv.project?.clientId || 1) }, 32)}
                          alt="Client"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginRight: '8px'
                          }}
                        />
                        <span className="client-name">{getClientName(inv.project?.clientId || 1)}</span>
                      </div>
                    </td>
                    <td className="project-status">
                      <span className="status-badge" style={getStatusColor(inv.status)}>{inv.status}</span>
                    </td>
                    <td className="project-actions" style={{ textAlign: 'right', position: 'relative' }}>
                      <button
                        onClick={() => setShowJobActionsMenu(showJobActionsMenu === inv.id ? null : inv.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          fontSize: '16px',
                          color: '#6c757d',
                          fontWeight: 'bold'
                        }}
                      >
                        ⋯
                      </button>
                      
                      {showJobActionsMenu === inv.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: '20px',
                          backgroundColor: 'white',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          zIndex: 1000,
                          minWidth: '140px'
                        }}>
                          <button
                            onClick={() => handleViewJobInvitation(inv)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#212529'
                            }}
                          >
                            View
                          </button>
                          <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #dee2e6' }} />
                          <button
                            onClick={() => handleRejectJobProject(inv.id)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#dc3545'
                            }}
                          >
                            Reject Project
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-projects">{error ? 'Unable to load job requests' : 'No job requests found'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {projects.length} of {totalCount} projects
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              <span className="pagination-current">Page {currentPage} of {totalPages}</span>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close job actions menu */}
      {showJobActionsMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowJobActionsMenu(null)}
        />
      )}

      {/* Job Invitation Modal */}
      <ContractorInvitationModal
        isOpen={showInvitationModal}
        onClose={() => {
          setShowInvitationModal(false);
          setSelectedInvitation(null);
        }}
        invitation={selectedInvitation}
        onStatusUpdate={handleJobModalStatusUpdate}
      />
    </ContractorDashboardLayout>
  );
};

export default ContractorProjects;