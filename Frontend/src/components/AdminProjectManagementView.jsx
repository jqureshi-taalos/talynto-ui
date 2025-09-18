import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';
import authService from '../services/authService';
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

const AdminProjectManagementView = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project] = useState({
    projectTitle: 'Q3 Financial Audit',
    projectStatus: 'Pending',
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

  const [wishlistContractors] = useState([
    {
      id: 1,
      name: 'Sarah Lee',
      assignmentStatus: 'Not Assigned',
      hourlyRate: '$85/hr',
      actions: ['Assign', 'View Profile', 'Message']
    }
  ]);

  const [showAssignModal, setShowAssignModal] = useState(false);

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
          <div className="project-management-view-container">
            {/* Header */}
            <div className="project-management-view-header">
              <h2>Manage Projects</h2>
              <button className="tab-btn active" onClick={() => navigate('/admin-project-management')}>
                Back
              </button>
            </div>

            {/* Project Content Layout */}
            <div className="project-management-content">
              {/* Left Side - Project Details */}
              <div className="project-details-card">
                <div className="project-detail-item">
                  <span className="detail-label">Project Title</span>
                  <span className="detail-value">{project.projectTitle}</span>
                </div>
                <div className="project-detail-item">
                  <span className="detail-label">Project Status</span>
                  <span className={`detail-value status-${project.projectStatus.toLowerCase()}`}>
                    {project.projectStatus}
                  </span>
                </div>
                <div className="project-detail-item">
                  <span className="detail-label">Created On</span>
                  <span className="detail-value">{project.createdOn}</span>
                </div>
                <div className="project-detail-item">
                  <span className="detail-label">Start Date</span>
                  <span className="detail-value">{project.startDate}</span>
                </div>
                <div className="project-detail-item">
                  <span className="detail-label">Work Model</span>
                  <span className="detail-value">{project.workModel}</span>
                </div>
                <div className="project-detail-item">
                  <span className="detail-label">Client Name</span>
                  <span className="detail-value">{project.clientName}</span>
                </div>
                <div className="project-detail-item">
                  <span className="detail-label">Rate Range</span>
                  <span className="detail-value">{project.rateRange}</span>
                </div>
                <div className="project-detail-item">
                  <span className="detail-label">Project Type</span>
                  <span className="detail-value">{project.projectType}</span>
                </div>
              </div>

              {/* Right Side - Skills & Wishlist */}
              <div className="skills-wishlist-section">
                {/* Skills & Requirements */}
                <div className="skills-requirements-section">
                  <h3>Skills & Requirement</h3>
                  <div className="skills-detail-item">
                    <span className="skill-label">Skills Required</span>
                    <span className="skill-value">{project.skillsRequired}</span>
                  </div>
                  <div className="skills-detail-item">
                    <span className="skill-label">Certifications Needed</span>
                    <span className="skill-value">{project.certificationsNeeded}</span>
                  </div>
                  <div className="skills-detail-item">
                    <span className="skill-label">Software Tools</span>
                    <span className="skill-value">{project.softwareTools}</span>
                  </div>
                  <div className="skills-detail-item">
                    <span className="skill-label">Weekly Availability</span>
                    <span className="skill-value">{project.weeklyAvailability}</span>
                  </div>
                </div>

                {/* Wishlist */}
                <div className="wishlist-section">
                  <h3>Wishlist <span className="wishlist-subtitle">(According to the Project)</span></h3>
                  {wishlistContractors.map(contractor => (
                    <div key={contractor.id} className="wishlist-contractor">
                      <div className="contractor-detail-item">
                        <span className="contractor-label">Contractor Name</span>
                        <span className="contractor-value">{contractor.name}</span>
                      </div>
                      <div className="contractor-detail-item">
                        <span className="contractor-label">Assignment Status</span>
                        <span className="contractor-value assignment-status">
                          {contractor.assignmentStatus} ▼
                        </span>
                      </div>
                      <div className="contractor-detail-item">
                        <span className="contractor-label">Hourly Rate</span>
                        <span className="contractor-value">{contractor.hourlyRate}</span>
                      </div>
                      <div className="contractor-actions">
                        <button
                          className="action-link assign-link"
                          onClick={() => setShowAssignModal(true)}
                        >
                          Assign
                        </button>
                        <span className="action-separator">|</span>
                        <button className="action-link">View Profile</button>
                        <span className="action-separator">|</span>
                        <button className="action-link">Message</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Assign Project Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content assign-project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign to Project</h3>
            </div>
            <div className="modal-body">
              <div className="assign-form">
                <label htmlFor="contractor-select">Select Contractor</label>
                <select id="contractor-select" className="contractor-select">
                  <option value="">Select Contractor</option>
                  <option value="sarah">Sarah Lee</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                </select>
                <p className="contractor-help-text">Showing contractor list (suggested contractors)</p>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Back
                </button>
                <button className="btn-primary">
                  Assign Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectManagementView;