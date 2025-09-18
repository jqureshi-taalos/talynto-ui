import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Dashboard.css';
import authService from '../services/authService';
import ClientHeader from './ClientHeader';
import contractorSuggestionService from '../services/contractorSuggestionService';
import { getAvatarUrl, getFallbackAvatarUrl } from '../utils/avatarUtils';
import DashboardIcon from './DashboardIcon';
import ProjectsIcon from './ProjectsIcon';
import NotificationsIcon from './NotificationsIcon';
import ProfileSettingsIcon from './ProfileSettingsIcon';
import LogoutIcon from './LogoutIcon';
import FindTalentIcon from './FindTalentIcon';
import MessagesIcon from './MessagesIcon';
import InvoicesIcon from './InvoicesIcon'
import InviteContractorModal from './InviteContractorModal'

const ClientViewProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

  const handleSidebarNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const [projectData, setProjectData] = useState(null);
  const [skillsData, setSkillsData] = useState(null);
  const [suggestedContractors, setSuggestedContractors] = useState([]);
  const [assignedContractor, setAssignedContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [generatingShareLink, setGeneratingShareLink] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null);


  useEffect(() => {
    fetchProjectData();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps


  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/project/${projectId}`, {
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
          setError('Project not found');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Set project data
      setProjectData({
        id: data.id,
        title: data.name || data.title,
        status: data.status,
        createdOn: data.createdAt || data.createdOn,
        startDate: data.startDate,
        endDate: data.endDate,
        assignedContractor: data.assignedContractor || null,
        workModel: data.workModel,
        hourlyRate: data.hourlyRate,
        availability: data.availability,
        location: data.location,
        projectLink: data.projectLink || `www.portal.taalos/${data.id}`,
        description: data.description,
        estimatedHours: data.estimatedHours,
        budget: data.budget,
        color: data.color,
        type: data.type,
        tool: data.tool
      });

      // Set share token if it exists
      setShareToken(data.shareToken);

      // Set skills data
      setSkillsData({
        skillsRequired: data.type || 'Not specified',
        certificationNeeded: data.certificationNeeded || data.certifications || data.certificationNeeds || data.certificationsRequired || 'No specific certifications required',
        softwareTools: data.tool || 'Not specified'
      });

      // Set assigned contractor
      setAssignedContractor(data.assignedContractor || null);

      // Fetch suggested contractors if project is pending
      if (data.status?.toLowerCase() === 'pending') {
        fetchSuggestedContractors(data);
      }

    } catch (error) {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedContractors = async (projectData = null) => {
    try {
      setLoadingSuggestions(true);

      // Parse project skills for matching
      const currentProjectData = projectData || projectData;
      const projectSkills = currentProjectData ?
        contractorSuggestionService.parseProjectSkills(currentProjectData) : [];

      // Use the new contractor suggestion service
      const suggestions = await contractorSuggestionService.getSuggestedContractors(
        projectId,
        3,
        projectSkills
      );

      setSuggestedContractors(suggestions);

    } catch (error) {
      // Set empty array on error
      setSuggestedContractors([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleBack = () => {
    navigate('/client-projects');
  };

  const handleEditProject = () => {
    navigate(`/client-edit-project/${projectId}`);
  };


  const handleViewProfile = (contractorId) => {
    navigate(`/client-wishlist-view-profile/${contractorId}`, {
      state: {
        from: 'project',
        previousPage: `/client-view-project/${projectId}`
      }
    });
  };

  const isValidNumericId = (value) => {
    const num = typeof value === 'string' ? Number(value) : value;
    return Number.isFinite(num) && Number.isInteger(num);
  };

  const handleMessage = (contractorId) => {
    navigate('/messages', { state: { openChatWithContractor: contractorId } });
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRemoveContractor = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/project/${projectId}/contractor`, {
        method: 'DELETE',
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh project data to show updated contractor assignment
      showToastMessage('Contractor removed successfully!');
      fetchProjectData();
    } catch (error) {
      showToastMessage('Failed to remove contractor');
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      setGeneratingShareLink(true);
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/project/${projectId}/generate-share-token`, {
        method: 'POST',
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setShareToken(data.shareToken);
      showToastMessage('Share link generated successfully!');
    } catch (error) {
      showToastMessage('Failed to generate share link');
    } finally {
      setGeneratingShareLink(false);
    }
  };

  const getStatusColor = (status) => {
    const styles = {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: '500'
    }
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          ...styles,
          backgroundColor: '#FFF8D8',
          color: '#DDB70B'
        };
      case 'accepted':
        return {
          ...styles,
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      case 'rejected':
        return {
          ...styles,
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
      case 'paid':
        return {
          ...styles,
          backgroundColor: '#E6E5FF',
          color: '#2320D7'
        };
      case 'active':
        return {
          ...styles,
          backgroundColor: '#E2FFD8',
          color: '#5DBD39'
        };
      default:
        return {
          ...styles,
          backgroundColor: '#FFE0DE',
          color: '#D72E20'
        };
    }
  };

  const getShareUrl = () => {
    if (!shareToken) return null;
    return `${window.location.origin}/share/${shareToken}`;
  };

  const handleCopyShareLink = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        showToastMessage('Share link copied to clipboard!');
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        showToastMessage('Share link copied to clipboard!');
      }
    } catch (err) {
      showToastMessage('Failed to copy link. Please copy manually.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <ClientHeader pageTitle="My Projects" />
        <div className="dashboard-layout">
          <div className="dashboard-sidebar">
            <div className="sidebar-nav">
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/dashboard')}>
                <span className="sidebar-icon"><DashboardIcon /></span>
                <span className="sidebar-label">Dashboard</span>
              </button>
              <button className="sidebar-item active" onClick={() => handleSidebarNavigation('/projects')}>
                <span className="sidebar-icon"><ProjectsIcon /></span>
                <span className="sidebar-label">My Projects</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/talent')}>
                <span className="sidebar-icon"><FindTalentIcon /></span>
                <span className="sidebar-label">Find Talent</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/invoices')}>
                <span className="sidebar-icon"><InvoicesIcon /></span>
                <span className="sidebar-label">Invoice Requests</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/messages')}>
                <span className="sidebar-icon"><MessagesIcon /></span>
                <span className="sidebar-label">Messages</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/settings')}>
                <span className="sidebar-icon"><ProfileSettingsIcon /></span>
                <span className="sidebar-label">Profile Settings</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/notifications')}>
                <span className="sidebar-icon"><NotificationsIcon /></span>
                <span className="sidebar-label">Notifications</span>
              </button>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="sidebar-icon"><LogoutIcon /></span>
              <span className="sidebar-label">Logout</span>
            </button>
          </div>
          <div className="dashboard-main">
            <div className="view-project-container">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading project data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <ClientHeader pageTitle="My Projects" />
        <div className="dashboard-layout">
          <div className="dashboard-sidebar">
            <div className="sidebar-nav">
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/dashboard')}>
                <span className="sidebar-icon"><DashboardIcon /></span>
                <span className="sidebar-label">Dashboard</span>
              </button>
              <button className="sidebar-item active" onClick={() => handleSidebarNavigation('/projects')}>
                <span className="sidebar-icon"><ProjectsIcon /></span>
                <span className="sidebar-label">My Projects</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/talent')}>
                <span className="sidebar-icon"><FindTalentIcon /></span>
                <span className="sidebar-label">Find Talent</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/invoices')}>
                <span className="sidebar-icon"><InvoicesIcon /></span>
                <span className="sidebar-label">Invoice Requests</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/messages')}>
                <span className="sidebar-icon"><MessagesIcon /></span>
                <span className="sidebar-label">Messages</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/settings')}>
                <span className="sidebar-icon"><ProfileSettingsIcon /></span>
                <span className="sidebar-label">Profile Settings</span>
              </button>
              <button className="sidebar-item" onClick={() => handleSidebarNavigation('/notifications')}>
                <span className="sidebar-icon"><NotificationsIcon /></span>
                <span className="sidebar-label">Notifications</span>
              </button>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="sidebar-icon"><LogoutIcon /></span>
              <span className="sidebar-label">Logout</span>
            </button>
          </div>
          <div className="dashboard-main">
            <div className="view-project-container">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Error: {error}</p>
                <button onClick={handleBack}>Back to Projects</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <ClientHeader pageTitle="My Projects" />

      {/* Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-nav">
            <button className="sidebar-item" onClick={() => handleSidebarNavigation('/dashboard')}>
              <span className="sidebar-icon"><DashboardIcon /></span>
              <span className="sidebar-label">Dashboard</span>
            </button>
            <button className="sidebar-item active" onClick={() => handleSidebarNavigation('/projects')}>
              <span className="sidebar-icon"><ProjectsIcon /></span>
              <span className="sidebar-label">My Projects</span>
            </button>
            <button className="sidebar-item" onClick={() => handleSidebarNavigation('/talent')}>
              <span className="sidebar-icon"><FindTalentIcon /></span>
              <span className="sidebar-label">Find Talent</span>
            </button>
            <button className="sidebar-item" onClick={() => handleSidebarNavigation('/invoices')}>
              <span className="sidebar-icon"><InvoicesIcon /></span>
              <span className="sidebar-label">Invoice Requests</span>
            </button>
            <button className="sidebar-item" onClick={() => handleSidebarNavigation('/messages')}>
              <span className="sidebar-icon"><MessagesIcon /></span>
              <span className="sidebar-label">Messages</span>
            </button>
            <button className="sidebar-item" onClick={() => handleSidebarNavigation('/settings')}>
              <span className="sidebar-icon"><ProfileSettingsIcon /></span>
              <span className="sidebar-label">Profile Settings</span>
            </button>
            <button className="sidebar-item" onClick={() => handleSidebarNavigation('/notifications')}>
              <span className="sidebar-icon"><NotificationsIcon /></span>
              <span className="sidebar-label">Notifications</span>
            </button>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="view-project-container h-client-project-view">
            {/* Header Section */}
            <div className="view-project-header">
              <div className="project-title-section">
                <h1>View <strong>Project</strong></h1>
              </div>
              <div className="project-actions">
                <div className="project-link">
                  {shareToken ? (
                    <>
                      <span className="link-label">Share Link</span>
                      <span className="link-url">{getShareUrl()}</span>
                      <button
                        className="copy-link-btn"
                        onClick={handleCopyShareLink}
                        title="Copy share link to clipboard"
                      >
                        📋
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-primary"
                        style={{ fontWeight: 'bolder', boxShadow: '0 2px 3px 0 #D9D9D9' }}
                        onClick={handleGenerateShareLink}
                        disabled={generatingShareLink}
                        title="Generate public share link"
                      >
                        {generatingShareLink ? '⏳ Generating...' : '🔗 Generate Share Link'}
                      </button>
                    </>
                  )}
                </div>

                {projectData.status?.toLowerCase() !== 'closed' && !projectData.assignedContractor && (
                  <>
                    <button className="btn-primary" style={{ fontWeight: 'bolder', boxShadow: '0 2px 3px 0 #D9D9D9' }} onClick={handleEditProject}>Edit Project</button>
                  </>
                )}

                <button className="tab-btn active" onClick={handleBack}>Back</button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="project-content-grid">
              {/* Left Column - Project Details */}
              <div className="project-details-column">
                <div className="project-info-card">
                  <div className="project-detail">
                    <span className="project-label">Project ID</span>
                    <span className='project-value'>
                      {projectData.id}
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Project Title</span>
                    <span className='project-value'>
                      {projectData.title}
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Status</span>
                    <span className='project-value'>
                      <span className="status-badge" style={getStatusColor(projectData.status?.toLowerCase())}>
                        {projectData.status}
                      </span>
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Created On</span>
                    <span className='project-value'>
                      {formatDate(projectData.createdOn)}
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Start Date - End Date</span>
                    <span className='project-value'>
                      {formatDate(projectData.startDate)} - {formatDate(projectData.endDate)}
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Assigned Contractor</span>
                    <span className='project-value'>
                      {projectData.assignedContractor ? (
                        <div className="contractor-info-inline" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          <img src={getAvatarUrl(projectData.assignedContractor, 32)} alt={projectData.assignedContractor.name} className="contractor-avatar-small" />
                          <span className="contractor-name">{projectData.assignedContractor.name}</span>
                        </div>
                      ) : (
                        "Not assigned"
                      )}
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Work Model</span>
                    <span className='project-value'>
                      {formatDate(projectData.startDate)} - {formatDate(projectData.endDate)}
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Rate</span>
                    <span className='project-value'>
                      {projectData.hourlyRate || 'Not specified'}
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Availability Needed</span>
                    <span className='project-value'>
                      {projectData.availability || 'Not specified'}
                    </span>
                  </div>
                  <div className="project-detail">
                    <span className="project-label">Location</span>
                    <span className='project-value'>
                      {projectData.location || 'Not specified'}
                    </span>
                  </div>

                  {/* <div className="info-row">
                    <span className="info-label">Project ID</span>
                    <span className="info-value">{projectData.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Project Title</span>
                    <span className="info-value">{projectData.title}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status</span>
                    <span className="info-value">
                      <span className="status-badge" style={{
                        backgroundColor: projectData.status?.toLowerCase() === 'active' ? '#d4edda' :
                          projectData.status?.toLowerCase() === 'pending' ? '#fff3cd' :
                            projectData.status?.toLowerCase() === 'closed' ? '#f8d7da' : '#e2e3e5',
                        color: projectData.status?.toLowerCase() === 'active' ? '#155724' :
                          projectData.status?.toLowerCase() === 'pending' ? '#856404' :
                            projectData.status?.toLowerCase() === 'closed' ? '#721c24' : '#495057',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {projectData.status}
                      </span>
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Created On</span>
                    <span className="info-value">{formatDate(projectData.createdOn)}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Start Date - End Date</span>
                    <span className="info-value">{formatDate(projectData.startDate)} - {formatDate(projectData.endDate)}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Assigned Contractor</span>
                    <span className="info-value">
                      {projectData.assignedContractor ? (
                        <div className="contractor-info-inline" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          <img src={getAvatarUrl(projectData.assignedContractor, 32)} alt={projectData.assignedContractor.name} className="contractor-avatar-small" />
                          <span className="contractor-name">{projectData.assignedContractor.name}</span>
                        </div>
                      ) : (
                        "Not assigned"
                      )}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Assigned Contractor</span>
                    <span className="info-value">
                      {projectData.assignedContractor ? (
                        <div className="contractor-info-inline" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          <img src={getAvatarUrl(projectData.assignedContractor, 32)} alt={projectData.assignedContractor.name} className="contractor-avatar-small" />
                          <span className="contractor-name">{projectData.assignedContractor.name}</span>
                        </div>
                      ) : (
                        "Not assigned"
                      )}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Work Model</span>
                    <span className="info-value">{projectData.workModel}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Rate</span>
                    <span className="info-value">{projectData.hourlyRate || 'Not specified'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Availability Needed</span>
                    <span className="info-value">{projectData.availability || 'Not specified'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Location</span>
                    <span className="info-value">{projectData.location || 'Not specified'}</span>
                  </div> */}

                </div>

                {/* Project Description */}
                <div className="project-description-card">
                  <h3>Project Description</h3>
                  <div className="description-content">
                    {projectData.description || 'No description provided'}
                  </div>
                </div>
              </div>

              {/* Right Column - Skills & Contractors */}
              <div className="project-sidebar-column">
                {/* Skills & Requirements */}
                <div className="skills-requirements-card">
                  <h3>Skills & <strong>Requirements</strong></h3>
                  {skillsData ? (
                    <div className="skills-section">
                      <div className="skills-detail-item">
                        <span className="skill-label">Skills Required</span>
                        <span className="skill-value">{skillsData.skillsRequired}</span>
                      </div>
                      <div className="skills-detail-item">
                        <span className="skill-label">Certifications Needed</span>
                        <span className="skill-value">{skillsData.certificationsNeeded}</span>
                      </div>
                      <div className="skills-detail-item">
                        <span className="skill-label">Software Tools</span>
                        <span className="skill-value">{skillsData.softwareTools}</span>
                      </div>
                      <div className="skills-detail-item">
                        <span className="skill-label">Weekly Availability</span>
                        <span className="skill-value">{skillsData.weeklyAvailability}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="skills-section">
                      <p>Loading skills data...</p>
                    </div>
                  )}
                  {/* {skillsData ? (
                    <div className="skills-section">
                      <div className="skill-row">
                        <span className="skill-label">Skills Required</span>
                        <span className="skill-value">{skillsData.skillsRequired || 'Not specified'}</span>
                      </div>
                      <div className="skill-row">
                        <span className="skill-label">Certification Needed</span>
                        <span className="skill-value">{skillsData.certificationNeeded || 'No specific certifications required'}</span>
                      </div>
                      <div className="skill-row">
                        <span className="skill-label">Software Tools</span>
                        <span className="skill-value">{skillsData.softwareTools || 'Not specified'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="skills-section">
                      <p>Loading skills data...</p>
                    </div>
                  )} */}
                </div>

                {/* Suggested Contractors - Only show for pending projects */}
                {projectData.status?.toLowerCase() === 'pending' && (
                  <div className="suggested-contractors-card">
                    <h3>Suggested <strong>Contractors</strong></h3>
                    <div className="contractors-list">
                      {loadingSuggestions ? (
                        <div className="contractor-item loading">
                          <div className="loading-spinner"></div>
                        </div>
                      ) : suggestedContractors.length > 0 ? (
                        suggestedContractors.map(contractor => (
                          <div key={contractor.id} className="suggested-contractor-item">
                            <div className="contractor-header">
                              <div className="contractor-info-inline">
                                <img
                                  src={getAvatarUrl(contractor, 40)}
                                  alt={contractor.name}
                                  className="contractor-avatar-small"
                                />
                                <span className="contractor-name">{contractor.name}</span>
                              </div>
                              <div className="contractor-actions">
                                <button
                                  className="contractor-action-btn primary"
                                  onClick={() => { handleViewProfile(contractor.id); }}
                                >
                                  View Profile
                                </button>
                                <button
                                  className="contractor-action-btn secondary"
                                  onClick={() => {
                                    if (isValidNumericId(contractor.userId)) {
                                      handleMessage(typeof contractor.userId === 'string' ? parseInt(contractor.userId) : contractor.userId);
                                    } else {
                                      navigate('/messages');
                                    }
                                  }}
                                >
                                  Message
                                </button>
                                <button
                                  className="contractor-action-btn primary"
                                  onClick={() => { setInviteTarget(contractor); setInviteOpen(true); }}
                                >
                                  Invite Contractor
                                </button>
                              </div>
                            </div>

                            {contractor.matchingSkills && contractor.matchingSkills.length > 0 && (
                              <div className="matching-skills">
                                <span className="skills-label">Matching skills:</span>
                                <div className="skills-tags">
                                  {contractor.matchingSkills.slice(0, 3).map((skill, index) => (
                                    <span key={index} className="skill-tag">{skill}</span>
                                  ))}
                                  {contractor.matchingSkills.length > 3 && (
                                    <span className="skill-tag more">+{contractor.matchingSkills.length - 3}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="contractor-item no-suggestions">
                          <p>No contractors found matching the project skills</p>
                          <span className="suggestion-tip">Try broadening the project requirements or skills</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned Contractor - Hide for Pending projects */}
                {projectData.status?.toLowerCase() !== 'pending' && (
                  <div className="assigned-contractor-card">
                    <div className="assigned-header">
                      <h3>Assigned <strong>Contractor</strong></h3>
                      {assignedContractor && projectData?.status?.toLowerCase() !== 'closed' && (
                        <button className="remove-btn" onClick={handleRemoveContractor}>
                          Remove
                        </button>
                      )}
                    </div>
                    {assignedContractor ? (
                      <div className="assigned-contractor-item">
                        <div className="contractor-info">
                          <img
                            src={getAvatarUrl(assignedContractor, 48)}
                            alt={assignedContractor.name}
                            className="contractor-avatar"
                            onError={(e) => {
                              e.target.src = getFallbackAvatarUrl(assignedContractor, 48);
                            }}
                          />
                          <div>
                            <span className="contractor-name">{assignedContractor.name}</span>
                            {assignedContractor.status && <span className="contractor-status">{assignedContractor.status}</span>}
                          </div>
                        </div>
                        <button
                          className="contractor-action-btn"
                          onClick={() => handleMessage(assignedContractor.id)}
                        >
                          Message
                        </button>
                      </div>
                    ) : (
                      <div className="assigned-contractor-item">
                        <p>No contractor assigned to this project</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '300px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .generate-share-btn {
          background-color: #4EC1EF;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
        }

        .generate-share-btn:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .generate-share-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
      <InviteContractorModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        project={{
          id: projectData.id,
          name: projectData.title,
          title: projectData.title,
          projectType: projectData.type,
          type: projectData.type,
          hourlyRate: projectData.hourlyRate,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          description: projectData.description
        }}
        contractor={inviteTarget}
        onInvited={() => showToastMessage('Invitation sent')}
      />
    </div>
  );
};

export default ClientViewProject;