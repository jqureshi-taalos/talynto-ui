import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';
import DashboardLayout from './DashboardLayout';
import InviteContractorModal from './InviteContractorModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:54192/api';

const ClientProjects = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('projects');
  const [activeFilter, setActiveFilter] = useState(location.state?.tab ?? 'all');
  const [inviteStatusFilter, setInviteStatusFilter] = useState('all');
  const [invites, setInvites] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesPage, setInvitesPage] = useState(1);
  const [invitesTotalPages, setInvitesTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showInvitationActionsMenu, setShowInvitationActionsMenu] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedInvitationForModal, setSelectedInvitationForModal] = useState(null);
  const navigate = useNavigate();

  const pageSize = 10;

  // Load projects on component mount and when filters change
  useEffect(() => {
    if (activeTab === 'projects') {
      fetchProjects();
    }
  }, [activeTab, activeFilter, currentPage, sortBy, sortOrder, startDateFilter, endDateFilter]);

  useEffect(() => {
    if (activeTab === 'invitation') {
      fetchInvitations();
    }
  }, [activeTab, inviteStatusFilter, invitesPage]);

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
      const token = authService.getToken();

      if (!token) {
        navigate('/login');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder
      });

      if (activeFilter !== 'all') {
        queryParams.append('status', activeFilter);
      }

      if (searchTerm && searchTerm.trim() !== '') {
        queryParams.append('search', searchTerm.trim());
      }

      if (startDateFilter && startDateFilter.trim() !== '') {
        queryParams.append('startDate', startDateFilter.trim());
      }

      if (endDateFilter && endDateFilter.trim() !== '') {
        queryParams.append('endDate', endDateFilter.trim());
      }

      const response = await fetch(`${API_BASE_URL}/project?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } else if (response.status === 401) {
        authService.logout();
        navigate('/login');
      } else {
        console.error('Failed to fetch projects:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const token = authService.getToken();

      const response = await fetch(`${API_BASE_URL}/project/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchProjects(); // Refresh the projects list
      } else {
        console.error('Failed to update project status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };


  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchInvitations = async () => {
    try {
      setInvitesLoading(true);
      const token = authService.getToken();
      if (!token) { navigate('/login'); return; }
      const params = new URLSearchParams({ status: inviteStatusFilter, page: invitesPage.toString(), pageSize: '10' });
      const response = await fetch(`${API_BASE_URL}/project/invitations?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) { authService.logout(); navigate('/login'); return; }
      const data = await response.json();
      setInvites(data.invitations || []);
      setInvitesTotalPages(data.totalPages || 0);
    } catch (e) {
      // Soft fail
    } finally { setInvitesLoading(false); }
  };

  const cancelInvite = async (invitationId) => {
    const token = authService.getToken();
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/project/invitations/${invitationId}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' })
    });
    if (res.ok) fetchInvitations();
  };

  const handleViewInvitation = (invitation) => {
    // Create a mock project and contractor for the InviteContractorModal
    const mockProject = {
      id: invitation.project?.id,
      name: invitation.project?.name,
      projectType: invitation.project?.projectType,
      startDate: invitation.project?.startDate,
      endDate: invitation.project?.endDate,
      hourlyRate: invitation.project?.hourlyRate,
      description: invitation.project?.description,
      clientId: invitation.project?.clientId
    };
    
    const mockContractor = {
      id: invitation.contractorId,
      userId: invitation.contractorId,
      name: invitation.contractor?.name || `Contractor ${invitation.contractorId}`,
      firstName: invitation.contractor?.firstName,
      lastName: invitation.contractor?.lastName,
      email: invitation.contractor?.email,
      profilePicture: invitation.contractor?.profilePicture
    };
    
    setSelectedInvitationForModal({ 
      project: mockProject, 
      contractor: mockContractor,
      invitation: invitation
    });
    setShowInviteModal(true);
    setShowInvitationActionsMenu(null);
  };

  const handleEditInvitation = (invitation) => {
    console.log('Edit invitation:', invitation);
    // TODO: Implement edit invitation functionality
    // This could open the invite contractor modal in edit mode
    setShowInvitationActionsMenu(null);
  };

  const handleCancelInvitation = async (invitationId) => {
    setShowInvitationActionsMenu(null);
    await cancelInvite(invitationId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleProjectClick = (projectId) => {
    navigate(`/client-view-project/${projectId}`);
  };

  const handleAddNewProject = () => {
    navigate('/create-project');
  };

  const handleEditProject = (project) => {
    navigate(`/client-edit-project/${project.id}`);
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


  const getActionMenuItems = (project) => {
    const baseItems = [
      { label: 'View', icon: '👁️', action: () => handleProjectClick(project.id) }
    ];

    // Only show edit option if project is not closed and no contractor is assigned
    if (project.status?.toLowerCase() !== 'closed' && !project.assignedContractor) {
      baseItems.splice(1, 0, { label: 'Edit', icon: '✏️', action: () => handleEditProject(project) });
    }


    if (project.status?.toLowerCase() === 'draft') {
      baseItems.push({ label: 'Activate', icon: '▶️', action: () => handleStatusChange(project.id, 'Active') });
    }

    return baseItems;
  };

  return (
    <DashboardLayout>
      <div className="projects-container">
        <div className="projects-header">
          <h1>Manage <strong>Projects</strong></h1>
          <button className="add-project-btn" onClick={handleAddNewProject}>
            + Add New Project
          </button>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search projects by name or assigned contractor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              </div>
              <div className="date-filter">
                <label htmlFor="endDateFilter">End Date until:</label>
                <input
                  type="date"
                  id="endDateFilter"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="date-input"
                  title="Filter projects by end date until this date"
                />
              </div>
            </div> */}
          </div>
        </div>

        {/* Tabs */}
        <div className="talent-tabs" style={{ marginTop: 8 }}>
          <button className={`tab-button ${activeTab==='projects'?'active':''}`} onClick={()=>setActiveTab('projects')}>Projects</button>
          <button className={`tab-button ${activeTab==='invitation'?'active':''}`} onClick={()=>setActiveTab('invitation')}>Invitation</button>
        </div>

        {/* Filter Section */}
        <div className="projects-filter">
          {activeTab === 'projects' ? (
          <div className="filter-options">
            <label className="filter-option">
              <input
                type="radio"
                name="projectFilter"
                checked={activeFilter === 'all'}
                onChange={() => handleFilterChange('all')}
              />
              <span className="filter-circle"></span>
              All ({totalCount})
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="projectFilter"
                checked={activeFilter === 'active'}
                onChange={() => handleFilterChange('active')}
              />
              <span className="filter-circle"></span>
              Active
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="projectFilter"
                checked={activeFilter === 'closed'}
                onChange={() => handleFilterChange('closed')}
              />
              <span className="filter-circle"></span>
              Closed
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="projectFilter"
                checked={activeFilter === 'pending'}
                onChange={() => handleFilterChange('pending')}
              />
              <span className="filter-circle"></span>
              Pending
            </label>
          </div>
          ) : (
          <div className="filter-options">
            {['all','pending','rejected','cancelled','accepted'].map(s => (
              <label key={s} className="filter-option">
                <input type="radio" name="inviteFilter" checked={inviteStatusFilter===s} onChange={()=>{ setInviteStatusFilter(s); setInvitesPage(1); }} />
                <span className="filter-circle"></span>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </label>
            ))}
          </div>
          )}
        </div>

        {/* Projects Table */}
        {activeTab === 'projects' ? (
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Project Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('startDate')} style={{ cursor: 'pointer' }}>
                  Start / End Date {sortBy === 'startDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Assigned Contractor</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <td colSpan="5">
                  <div className='loading-container'>
                    <div className="loading-spinner"></div>
                  </div>
                </td>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map(project => (
                  <tr key={project.id} className="project-row" onClick={() => handleProjectClick(project.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="project-name-cell">
                        <span className="project-name">{project.name}</span>
                      </div>
                    </td>
                    <td className="project-date">
                      {project.endDate ?
                        `${formatDate(project.startDate)} - ${formatDate(project.endDate)}` :
                        formatDate(project.startDate) || 'TBD'
                      }
                    </td>
                    <td>
                      <div className="contractor-info">
                        <div className="contractor-avatar">
                          {project.assignedContractor?.avatar || 'TBA'}
                        </div>
                        <span className="contractor-name">
                          {project.assignedContractor?.name || 'To Be Assigned'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge`}
                        style={getStatusColor(project.status)}
                      >
                        {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="actions-menu" onClick={(e) => e.stopPropagation()}>
                        <button className="actions-trigger">⋯</button>
                        <div className="actions-dropdown">
                          {getActionMenuItems(project).map((item, index) => (
                            <button
                              key={index}
                              className="action-item"
                              onClick={item.action}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
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
                <th>Project Type</th>
                <th>Start / End Date</th>
                <th>Invited To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitesLoading ? (
                <tr><td colSpan="6"><div className='loading-container'><div className="loading-spinner"></div></div></td></tr>
              ) : invites.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign:'center', padding:'20px' }}>No invitations</td></tr>
              ) : invites.map(inv => (
                <tr key={inv.id} className="project-row">
                  <td><div className="project-name-cell"><span className="project-name">{inv.project?.name}</span></div></td>
                  <td>{inv.project?.projectType || ''}</td>
                  <td>{inv.project?.startDate?.split('T')[0] || ''} - {inv.project?.endDate?.split('T')[0] || ''}</td>
                  <td>{inv.contractor?.name || inv.contractorId}</td>
                  <td><span className="status-badge">{inv.status}</span></td>
                  <td style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowInvitationActionsMenu(showInvitationActionsMenu === inv.id ? null : inv.id)}
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
                    
                    {showInvitationActionsMenu === inv.id && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: '20px',
                        backgroundColor: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        minWidth: '120px'
                      }}>
                        <button
                          onClick={() => handleViewInvitation(inv)}
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
                        <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #dee2e6' }} />
                        {inv.status?.toLowerCase() === 'pending' && (
                          <button
                            onClick={() => handleCancelInvitation(inv.id)}
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
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} projects
            </div>
          </div>
        )}
      </div>

      {/* Invite Contractor Modal */}
      {selectedInvitationForModal && (
        <InviteContractorModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedInvitationForModal(null);
          }}
          project={selectedInvitationForModal.project}
          contractor={selectedInvitationForModal.contractor}
          onInvited={() => {
            fetchInvitations();
            setShowInviteModal(false);
            setSelectedInvitationForModal(null);
          }}
        />
      )}

      {/* Click outside to close invitation actions menu */}
      {showInvitationActionsMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowInvitationActionsMenu(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ClientProjects;