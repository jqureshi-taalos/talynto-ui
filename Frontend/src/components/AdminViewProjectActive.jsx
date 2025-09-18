import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import taalosLogo from '../assets/taalos logo.png';
import adminService from '../services/adminService';
import ProfileAvatar from './ProfileAvatar';
import authService from '../services/authService';
import UserManagementIcon from './UserManagementIcon';
import ProjectManagementIcon from './ProjectManagementIcon';
import DashboardIcon from './DashboardIcon';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import SettingsIcon from './SettingsIcon';
import ConfigurationIcon from './ConfigurationIcon';
import LogoutIcon from './LogoutIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import './Dashboard.css';

const AdminViewProjectActive = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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

  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const projectData = await adminService.getProjectByIdForAdmin(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project details:', error);
      setError('Failed to load project details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCloseProject = async () => {
    if (!window.confirm('Are you sure you want to close this project?')) {
      return;
    }

    try {
      setClosing(true);
      setSuccess(null);
      setErrorMsg(null);

      await adminService.closeProject(projectId);
      setSuccess('Project closed successfully!');

      // Navigate back after showing success message
      setTimeout(() => {
        navigate('/admin-project-management');
      }, 2000);
    } catch (error) {
      console.error('Error closing project:', error);
      setErrorMsg('Failed to close project: ' + error.message);
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'red' }}>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <div className="logo">
            <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
            <span className="logo-text">taalos</span>
          </div>

          <h1 className="page-title">Project Management</h1>
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
          <div className="admin-view-project-container">
            {/* Header */}
            <div className="admin-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Manage Projects</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => navigate('/admin-project-management')}
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #000000',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  back
                </button>
                <button
                  onClick={() => navigate(`/admin-project-management/edit/${projectId}`)}
                  style={{
                    background: '#4EC1EF',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleCloseProject}
                  disabled={closing}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: closing ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {closing ? 'Closing...' : 'Close Project'}
                </button>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '12px 20px',
                borderRadius: '4px',
                marginBottom: '20px',
                border: '1px solid #c3e6cb',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '16px' }}>✓</span>
                {success}
              </div>
            )}

            {errorMsg && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '12px 20px',
                borderRadius: '4px',
                marginBottom: '20px',
                border: '1px solid #f5c6cb',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '16px' }}>✗</span>
                {errorMsg}
              </div>
            )}

            {/* Project Content */}
            <div className="admin-view-content" style={{ display: 'flex', gap: '30px' }}>
              {/* Left Column - Project Details */}
              <div className="project-details-panel" style={{ flex: '1', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Project Title</div>
                  <div style={{ fontSize: '16px', color: '#000000', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#4EC1EF', borderRadius: '2px' }}></span>
                    {project?.name}
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Project Status</div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    {project?.status}
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Created On</div>
                  <div style={{ fontSize: '16px', color: '#000000' }}>{formatDate(project?.createdAt)}</div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Start Date</div>
                  <div style={{ fontSize: '16px', color: '#000000' }}>{formatDate(project?.startDate)}</div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Work Model</div>
                  <div style={{ fontSize: '16px', color: '#000000' }}>{project?.workModel}</div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Client Name</div>
                  <div style={{ fontSize: '16px', color: '#000000' }}>{project?.clientName}</div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Rate Range</div>
                  <div style={{ fontSize: '16px', color: '#000000' }}>${project?.hourlyRate}/hr</div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Project Type</div>
                  <div style={{ fontSize: '16px', color: '#000000' }}>{project?.projectType}</div>
                </div>
              </div>

              {/* Right Column - Skills */}
              <div className="skills-panel" style={{ flex: '1', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Skills & Requirement</h3>

                <div className="skills-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="skill-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#000000' }}>Skills Required</span>
                    <span style={{ color: '#000000' }}>{project?.type}</span>
                  </div>

                  <div className="skill-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#000000' }}>Certifications Needed</span>
                    <span style={{ color: '#000000' }}>{project?.certifications}</span>
                  </div>

                  <div className="skill-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#000000' }}>Software Tools</span>
                    <span style={{ color: '#000000' }}>{project?.tool}</span>
                  </div>

                  <div className="skill-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#000000' }}>Weekly Availability</span>
                    <span style={{ color: '#000000' }}>{project?.estimatedHours}Hrs/Week</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Client and Contractor */}
            <div className="bottom-section" style={{ display: 'flex', gap: '30px', marginTop: '30px' }}>
              {/* Client Section */}
              <div className="client-panel" style={{ flex: '1', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Client</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#4EC1EF',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    {project?.clientName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginBottom: '4px' }}>
                      {project?.clientName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#000000' }}>
                      {project?.clientEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contractor Section */}
              <div className="contractor-panel" style={{ flex: '1', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Contractor</h3>
                {project?.assignedContractorName ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#28a745',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {project?.assignedContractorName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginBottom: '4px' }}>
                          {project?.assignedContractorName}
                        </div>
                        <div style={{ fontSize: '14px', color: '#000000' }}>
                          {project?.assignedContractorEmail}
                        </div>
                      </div>
                    </div>

                    <div className="contractor-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '500', color: '#000000' }}>Skills</span>
                        <span style={{ color: '#000000' }}>{project?.type}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '500', color: '#000000' }}>Certifications</span>
                        <span style={{ color: '#000000' }}>{project?.certifications}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '500', color: '#000000' }}>Software Tools</span>
                        <span style={{ color: '#000000' }}>{project?.tool}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#000000', padding: '20px' }}>
                    No contractor assigned
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminViewProjectActive;