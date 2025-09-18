import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import adminService from '../services/adminService';
import authService from '../services/authService';
import ProfileAvatar from './ProfileAvatar';
import taalosLogo from '../assets/taalos logo.png';
import './Dashboard.css';
import DashboardIcon from './DashboardIcon';
import UserManagementIcon from './UserManagementIcon';
import ProjectManagementIcon from './ProjectManagementIcon';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import SettingsIcon from './SettingsIcon';
import ConfigurationIcon from './ConfigurationIcon';
import LogoutIcon from './LogoutIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import BackLinkIcon from './BackLinkIcon';

const AdminClientProfile = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'active';
  const fromTab = searchParams.get('tab') || 'client';

  const [client, setClient] = useState({
    name: 'Loading...',
    email: 'Loading...',
    status: status.charAt(0).toUpperCase() + status.slice(1),
    emailVerified: 'Loading...',
    role: 'Client',
    accountCreated: 'Loading...',
    companyName: 'Loading...',
    totalProjects: 0,
    activeProjects: 0,
    closedProjects: 0,
    projects: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);

      // Fetch real client data from API
      const [clientResponse, projectsResponse] = await Promise.allSettled([
        adminService.getClientDetails(clientId),
        adminService.getClientProjects(clientId)
      ]);

      if (clientResponse.status === 'fulfilled' && clientResponse.value) {
        const clientData = clientResponse.value.client || clientResponse.value;

        // Get projects data if available
        let projectsData = [];
        let totalProjects = 0;
        let activeProjects = 0;
        let closedProjects = 0;

        if (projectsResponse.status === 'fulfilled' && projectsResponse.value) {
          const projectSummary = projectsResponse.value;
          totalProjects = projectSummary.totalProjects || 0;
          activeProjects = projectSummary.activeProjects || 0;
          closedProjects = projectSummary.closedProjects || 0;
          projectsData = projectSummary.projects || [];
        }

        // Format projects data dynamically
        const formattedProjects = projectsData.map(project => ({
          id: project.id,
          title: project.name || project.title || 'Unnamed Project',
          status: project.status || 'Unknown',
          contractor: project.contractorName || 'Unassigned',
          workModel: project.workModel || 'Remote'
        }));

        // Format the client data
        const formattedClient = {
          id: clientData.id || clientId,
          name: clientData.name || clientData.companyName || (clientData.firstName && clientData.lastName ? `${clientData.firstName} ${clientData.lastName}` : 'Unknown'),
          email: clientData.email || 'No email provided',
          status: status.charAt(0).toUpperCase() + status.slice(1),
          emailVerified: clientData.emailVerified ? 'Yes' : 'No',
          role: 'Client',
          accountCreated: clientData.createdDate || clientData.createdAt ? new Date(clientData.createdDate || clientData.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : 'Unknown',
          companyName: clientData.companyName || clientData.name || '',
          avatar: (clientData.name || clientData.companyName || 'Client').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          totalProjects: totalProjects,
          activeProjects: activeProjects,
          closedProjects: closedProjects,
          projects: formattedProjects
        };

        setClient(formattedClient);
      } else {
        throw new Error('No client data received');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch client details');
      console.error('Error fetching client details:', err);
    } finally {
      setLoading(false);
    }
  };

  const [showViewAllProjects, setShowViewAllProjects] = useState(false);

  const navigateBack = () => {
    navigate(`/admin-user-management?tab=${fromTab}`);
  };

  const handleApprove = async () => {
    try {
      await adminService.approveClient(clientId, 'Approved by admin');
      navigateBack();
    } catch (err) {
      setError(err.message || 'Failed to approve client');
    }
  };

  const handleReject = async () => {
    try {
      await adminService.rejectClient(clientId, 'Rejected by admin');
      navigateBack();
    } catch (err) {
      setError(err.message || 'Failed to reject client');
    }
  };

  const handleDeactivate = async () => {
    try {
      await adminService.deactivateClient(clientId, 'Deactivated by admin');
      navigateBack();
    } catch (err) {
      setError(err.message || 'Failed to deactivate client');
    }
  };

  const handleActivate = async () => {
    try {
      await adminService.approveClient(clientId, 'Activated by admin');
      navigateBack();
    } catch (err) {
      setError(err.message || 'Failed to activate client');
    }
  };

  if (showViewAllProjects) {
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
            <div className="sidebar-item" onClick={() => navigate('/admin-dashboard')}>
              <span className="sidebar-icon"><DashboardIcon /></span>
              <span className="sidebar-label">Dashboard</span>
            </div>
            <div className="sidebar-item active">
              <span className="sidebar-icon"><UserManagementIcon /></span>
              <span className="sidebar-label">User Management</span>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/admin-project-management')}>
              <span className="sidebar-icon"><ProjectManagementIcon /></span>
              <span className="sidebar-label">Project Management</span>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/admin-invoices')}>
              <span className="sidebar-icon"><InvoicesIcon /></span>
              <span className="sidebar-label">Invoices</span>
            </div>
            {/* <div className="sidebar-item" onClick={() => navigate('/admin-contractor-intake')}>
              <span className="sidebar-icon">📝</span>
              <span className="sidebar-label">Contractor Intake</span>
            </div> */}
            <div className="sidebar-item" onClick={() => navigate('/admin-notifications')}>
              <span className="sidebar-icon"><NotificationsIcon /></span>
              <span className="sidebar-label">Notifications</span>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/admin-settings')}>
              <span className="sidebar-icon"><SettingsIcon /></span>
              <span className="sidebar-label">Settings</span>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/admin-configuration')}>
              <span className="sidebar-icon"><ConfigurationIcon /></span>
              <span className="sidebar-label">Configuration</span>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/admin-login')}>
              <span className="sidebar-icon"><LogoutIcon /></span>
              <span className="sidebar-label">Logout</span>
            </div>
          </aside>

          {/* Main Content */}
          <main className="admin-main">
            <div className="profile-header">
              <button className="back-link" onClick={() => setShowViewAllProjects(false)}>
                <BackLinkIcon /> Back
              </button>
            </div>

            <div className="view-all-projects-layout">
              {/* Left side - Client info */}
              <div className="client-info-sidebar">
                <div className="client-profile-card">
                  <div className="client-avatar-section">
                    <ProfileAvatar
                      user={{
                        id: client.id,
                        firstName: client.firstName,
                        lastName: client.lastName,
                        name: client.name,
                        email: client.email
                      }}
                      size={80}
                      className="client-avatar-large"
                    />
                    <div className="client-basic-info">
                      <h2 className="client-name">{client.name}</h2>
                      <p className="client-email">{client.email}</p>
                    </div>
                  </div>

                  <div className="client-details">
                    <div className="detail-row">
                      <div>
                        <span className="detail-label">Status</span>
                        <span className={`detail-value status-badge status-${client.status.toLowerCase()}`}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div>
                        <span className="detail-label">Email Verified</span>
                        <span className="detail-value">{client.emailVerified}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div>
                        <span className="detail-label">Role</span>
                        <span className="detail-value">{client.role}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div>
                        <span className="detail-label">Account Created</span>
                        <span className="detail-value">{client.accountCreated}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div>
                        <span className="detail-label">Company</span>
                        <span className="detail-value">{client.companyName}</span>
                      </div>
                    </div>
                  </div>

                  {status === 'active' && (
                    <div className="h-left-button-holder"> {/* "client-actions"*/}
                      <button className="btn-primary" onClick={handleDeactivate}>
                        Deactivate
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Projects */}
              <div className="projects-grid">
                {client.projects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-detail">
                      <span className="project-label">Project Title</span>
                      <span className="project-value">{project.title}</span>
                    </div>
                    <div className="project-detail">
                      <span className="project-label">Project Status</span>
                      <span className={`project-value status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="project-detail">
                      <span className="project-label">Work Model</span>
                      <span className="project-value">{project.workModel}</span>
                    </div>
                    <div className="project-detail">
                      <span className="project-label">Contractor Name</span>
                      <span className="project-value">{project.contractor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          <div className="sidebar-item" onClick={() => navigate('/admin-dashboard')}>
            <span className="sidebar-icon"><DashboardIcon /></span>
            <span className="sidebar-label">Dashboard</span>
          </div>
          <div className="sidebar-item active">
            <span className="sidebar-icon"><UserManagementIcon /></span>
            <span className="sidebar-label">User Management</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/admin-project-management')}>
            <span className="sidebar-icon"><ProjectManagementIcon /></span>
            <span className="sidebar-label">Project Management</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/admin-invoices')}>
            <span className="sidebar-icon"><InvoicesIcon /></span>
            <span className="sidebar-label">Invoices</span>
          </div>
          {/* <div className="sidebar-item" onClick={() => navigate('/admin-contractor-intake')}>
            <span className="sidebar-icon">📝</span>
            <span className="sidebar-label">Contractor Intake</span>
          </div> */}
          <div className="sidebar-item" onClick={() => navigate('/admin-notifications')}>
            <span className="sidebar-icon"><NotificationsIcon /></span>
            <span className="sidebar-label">Notifications</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/admin-settings')}>
            <span className="sidebar-icon"><SettingsIcon /></span>
            <span className="sidebar-label">Settings</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/admin-configuration')}>
            <span className="sidebar-icon"><ConfigurationIcon /></span>
            <span className="sidebar-label">Configuration</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/admin-login')}>
            <span className="sidebar-icon"><LogoutIcon /></span>
            <span className="sidebar-label">Logout</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="client-profile-container">
            {/* Back Button */}
            <div className="profile-header">
              <button className="back-link" onClick={navigateBack}>
                <BackLinkIcon /> Back
              </button>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            ) : error ? (
              <div className="error-container">
                <p>Error: {error}</p>
              </div>
            ) : (
              <>
                {/* Profile Card */}
                <div className="profile-card">
                  <div className="profile-main">
                    <div className="profile-info">
                      <div className="profile-avatar-section">
                        <div className="profile-avatar-large">
                          <ProfileAvatar
                            user={{
                              id: client.id,
                              firstName: client.firstName,
                              lastName: client.lastName,
                              name: client.name,
                              email: client.email
                            }}
                            size={80}
                            className="client-avatar"
                          />
                        </div>
                        <div className="profile-basic-info">
                          <h2 className="profile-name">{client.name}</h2>
                          <p className="profile-email">{client.email}</p>
                        </div>
                      </div>
                      <div className="profile-actions">
                        {status === 'pending' && (
                          <>
                            <button className="btn-secondary" onClick={handleReject}>Reject</button>
                            <button className="btn-primary" onClick={handleApprove}>Approve</button>
                          </>
                        )}
                        {status === 'active' && (
                          <button className="btn-primary" onClick={handleDeactivate}>Deactivate</button>
                        )}
                        {status === 'inactive' && (
                          <button className="btn-primary" onClick={handleActivate}>Active</button>
                        )}
                      </div>
                    </div>

                    <div className="profile-details">
                      <div className="detail-row">
                        <div >
                          <span className="detail-label">Status</span>
                          <span className={`detail-value status-badge status-${client.status.toLowerCase()}`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div >
                          <span className="detail-label">Email Verified</span>
                          <span className="detail-value">{client.emailVerified}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div >
                          <span className="detail-label">Role</span>
                          <span className="detail-value">{client.role}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div >
                          <span className="detail-label">Account Created</span>
                          <span className="detail-value">{client.accountCreated}</span>
                        </div>
                      </div>
                      {status === 'active' && (
                        <div className="detail-row">
                          <div >
                            <span className="detail-label">Company</span>
                            <span className="detail-value">{client.companyName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {status === 'active' && (
                  <div className='h-project-summary-card' style={{ marginTop: '10px' }}>
                    <div style={{ textAlign: 'start' }}>Project summary</div>
                    <div className="profile-details">
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Total Projects</span>
                          <span className="detail-value">{client.totalProjects}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div >
                          <span className="detail-label">Active Projects</span>
                          <span className="detail-value">{client.activeProjects}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div >
                          <span className="detail-label">Closed Projects</span>
                          <span className="detail-value">{client.closedProjects}</span>
                        </div>
                      </div>
                    </div>
                    <div className='h-left-button-holder'>
                      <div>
                        <button
                          className="btn-primary" // "view-all-projects-btn"
                          onClick={() => setShowViewAllProjects(true)}
                        >
                          View All Projects
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Summary - Only show for active clients */}
                {/* {status === 'active' && (
                  <div className="project-summary-section">
                    <h3>Project Summary</h3>
                    <div className="project-stats">
                      <div className="stat-row">
                        <span className="stat-label">Total Projects</span>
                        <span className="stat-value">{client.totalProjects}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Active Projects</span>
                        <span className="stat-value">{client.activeProjects}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Closed Projects</span>
                        <span className="stat-value">{client.closedProjects}</span>
                      </div>
                    </div>
                    <button
                      className="view-all-projects-btn"
                      onClick={() => setShowViewAllProjects(true)}
                    >
                      View All Projects
                    </button>
                  </div>
                )} */}
              </>
            )}
          </div>
        </main>
      </div >
    </div >
  );
};

export default AdminClientProfile;