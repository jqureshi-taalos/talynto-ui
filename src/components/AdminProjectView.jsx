import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';
import authService from '../services/authService';
import taalosLogo from '../assets/taalos logo.png';
import DashboardIcon from './DashboardIcon'; // Dashboard SVG icon
import UserManagementIcon from './UserManagementIcon';
import ProjectManagementIcon from './ProjectManagementIcon';
import InvoicesIcon from './InvoicesIcon';
import NotificationsIcon from './NotificationsIcon';
import SettingsIcon from './SettingsIcon';
import ConfigurationIcon from './ConfigurationIcon';
import LogoutIcon from './LogoutIcon';
import HeaderNotificationIcon from './HeaderNotificationIcon'
import './Dashboard.css';

const AdminProjectView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  // Handle edit functionality - same as dropdown edit action
  const handleEdit = () => {
    const currentPath = location.pathname;
    const isActive = project.projectStatus === 'Active';

    if (isActive) {
      navigate(`/admin-project-management/view-project-active/${projectId}?edit=true`);
    } else {
      navigate(`${currentPath}?edit=true`);
    }
  };

  const [project] = useState({
    projectTitle: 'Q3 Financial Audit',
    projectStatus: 'Active',
    createdOn: '25/02/2025',
    startDate: '28/02/2025',
    workModel: 'Remote',
    clientName: 'David White',
    rateRange: '$90/Hr',
    projectType: 'BI Development',
    skillsRequired: 'Audit,SOX',
    certificationsNeeded: 'CPA, CFA',
    softwareTools: 'NetSuite, QuickBook',
    weeklyAvailability: '20Hrs/Week'
  });

  const [client] = useState({
    name: 'Aqua',
    email: 'aqua@gmail.com',
    logo: '🏢'
  });

  const [contractor] = useState({
    name: 'David White',
    email: 'davidwhite@gmail.com',
    avatar: '👤',
    skills: 'Audit,SOX',
    certifications: 'CPA, CFA',
    softwareTools: 'NetSuite, QuickBook'
  });

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
          <div className="project-view-container">
            {/* Header */}
            <div className="project-view-header">
              <h2>Manage Projects - TESTING EDIT BUTTON</h2>
              <div className="project-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="tab-btn active" onClick={() => navigate('/admin-project-management')}>
                  ← Back
                </button>
                <button className="edit-btn" onClick={handleEdit} style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#4EC1EF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Edit
                </button>
                <button className="close-project-btn" style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Close Project
                </button>
              </div>
            </div>

            {/* Project Content */}
            <div className="project-view-content">
              {/* Left Column - Project Details */}
              <div className="project-details-section">
                <div className="project-info-card">
                  <div className="project-title-section">
                    <div className="project-title-badge">
                      <span className="project-icon">📊</span>
                      <span className="project-title">{project.projectTitle}</span>
                    </div>
                  </div>

                  <div className="project-details-grid">
                    <div className="detail-item">
                      <span className="label">Project Status</span>
                      <span className="value status-active">{project.projectStatus}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Created On</span>
                      <span className="value">{project.createdOn}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Start Date</span>
                      <span className="value">{project.startDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Work Model</span>
                      <span className="value">{project.workModel}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Client Name</span>
                      <span className="value">{project.clientName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Rate Range</span>
                      <span className="value">{project.rateRange}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Project Type</span>
                      <span className="value">{project.projectType}</span>
                    </div>
                  </div>
                </div>

                {/* Client Section */}
                <div className="client-section">
                  <h3>Client</h3>
                  <div className="client-card">
                    <div className="client-logo">{client.logo}</div>
                    <div className="client-info">
                      <div className="client-name">{client.name}</div>
                      <div className="client-email">{client.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Skills and Contractor */}
              <div className="skills-contractor-section">
                {/* Skills & Requirements */}
                <div className="skills-requirements-card">
                  <h3>Skills & Requirement</h3>
                  <div className="skills-grid">
                    <div className="skill-item">
                      <span className="skill-label">Skills Required</span>
                      <span className="skill-value">{project.skillsRequired}</span>
                    </div>
                    <div className="skill-item">
                      <span className="skill-label">Certifications Needed</span>
                      <span className="skill-value">{project.certificationsNeeded}</span>
                    </div>
                    <div className="skill-item">
                      <span className="skill-label">Software Tools</span>
                      <span className="skill-value">{project.softwareTools}</span>
                    </div>
                    <div className="skill-item">
                      <span className="skill-label">Weekly Availability</span>
                      <span className="skill-value">{project.weeklyAvailability}</span>
                    </div>
                  </div>
                </div>

                {/* Contractor Section */}
                <div className="contractor-section">
                  <h3>Contractor</h3>
                  <div className="contractor-card">
                    <div className="contractor-header">
                      <ProfileAvatar
                        user={{
                          id: contractor.id,
                          firstName: contractor.firstName,
                          lastName: contractor.lastName,
                          name: contractor.name,
                          email: contractor.email
                        }}
                        size={48}
                        className="contractor-avatar"
                      />
                      <div className="contractor-info">
                        <div className="contractor-name">{contractor.name}</div>
                        <div className="contractor-email">{contractor.email}</div>
                      </div>
                    </div>
                    <div className="contractor-details">
                      <div className="contractor-detail-item">
                        <span className="label">Skills</span>
                        <span className="value">{contractor.skills}</span>
                      </div>
                      <div className="contractor-detail-item">
                        <span className="label">Certifications</span>
                        <span className="value">{contractor.certifications}</span>
                      </div>
                      <div className="contractor-detail-item">
                        <span className="label">Software Tools</span>
                        <span className="value">{contractor.softwareTools}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProjectView;