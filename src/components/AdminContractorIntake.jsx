import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AdminContractorIntake = () => {
  const navigate = useNavigate();
  const [contractors] = useState([
    {
      id: 1,
      name: 'David White',
      email: 'davidwhite@gmail.com',
      submittedOn: '22/5/2025',
      skills: 'Tax, Audit',
      location: 'USA',
      status: 'Accepted',
      avatar: '👤'
    },
    {
      id: 2,
      name: 'David White',
      email: 'davidwhite@gmail.com',
      submittedOn: '22/5/2025',
      skills: 'Tax, Audit',
      location: 'USA',
      status: 'Rejected',
      avatar: '👤'
    },
    {
      id: 3,
      name: 'David White',
      email: 'davidwhite@gmail.com',
      submittedOn: '22/5/2025',
      skills: 'Tax, Audit',
      location: 'USA',
      status: 'Pending',
      avatar: '👤'
    },
    {
      id: 4,
      name: 'David White',
      email: 'davidwhite@gmail.com',
      submittedOn: '22/5/2025',
      skills: 'Tax, Audit',
      location: 'USA',
      status: 'Accepted',
      avatar: '👤'
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedContractor, setSelectedContractor] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices' },
    // { id: 'contractor-intake', icon: '📝', label: 'Contractor Intake', path: '/admin-contractor-intake', active: true },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings' },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  const handleAction = (contractor, action) => {
    setSelectedContractor(contractor);
    setModalType(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContractor(null);
    setModalType('');
  };

  const filteredContractors = selectedStatus === 'All'
    ? contractors
    : contractors.filter(c => c.status === selectedStatus);

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <div className="logo">
            <img src={taalosLogo} alt="Taalos Logo" className="header-logo" />
            <span className="logo-text">taalos</span>
          </div>

          <h1 className="page-title">Contractor Intake</h1>
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
          <div className="contractor-intake-container">
            <div className="intake-header">
              <h2>Contractor Intake Review</h2>
              <div className="status-filters">
                <span className="filter-dot" onClick={() => setSelectedStatus('All')}>●</span>
                <span>All</span>
                <span className="filter-dot accepted" onClick={() => setSelectedStatus('Accepted')}>●</span>
                <span>Accepted</span>
                <span className="filter-dot rejected" onClick={() => setSelectedStatus('Rejected')}>●</span>
                <span>Rejected</span>
                <span className="filter-dot pending" onClick={() => setSelectedStatus('Pending')}>●</span>
                <span>Pending</span>
              </div>
            </div>

            {/* Table */}
            <div className="intake-table">
              <div className="table-header">
                <div className="th">Name</div>
                <div className="th">Email</div>
                <div className="th">Submitted On</div>
                <div className="th">Skills</div>
                <div className="th">Location</div>
                <div className="th">Status</div>
                <div className="th">Actions</div>
              </div>

              {filteredContractors.map(contractor => (
                <div key={contractor.id} className="table-row">
                  <div className="td">
                    <div className="contractor-name">
                      <span className="avatar">{contractor.avatar}</span>
                      <span>{contractor.name}</span>
                    </div>
                  </div>
                  <div className="td">{contractor.email}</div>
                  <div className="td">{contractor.submittedOn}</div>
                  <div className="td">{contractor.skills}</div>
                  <div className="td">{contractor.location}</div>
                  <div className="td">
                    <span className={`status-badge ${getStatusClass(contractor.status)}`}>
                      {contractor.status}
                    </span>
                  </div>
                  <div className="td">
                    <div className="actions-dropdown">
                      <button className="actions-btn">⋯</button>
                      <div className="dropdown-menu">
                        <div className="dropdown-item" onClick={() => handleAction(contractor, 'view')}>
                          View
                        </div>
                        <div className="dropdown-item" onClick={() => handleAction(contractor, 'approve')}>
                          Approve
                        </div>
                        <div className="dropdown-item" onClick={() => handleAction(contractor, 'reject')}>
                          Reject
                        </div>
                        <div className="dropdown-item" onClick={() => handleAction(contractor, 'requestEdit')}>
                          Request Edit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="page-btn">««</button>
              <button className="page-btn">‹</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">4</button>
              <button className="page-btn">5</button>
              <button className="page-btn">...</button>
              <button className="page-btn">›</button>
              <button className="page-btn">»</button>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === 'view' && (
              <ContractorDetailsModal contractor={selectedContractor} onClose={closeModal} />
            )}
            {modalType === 'reject' && (
              <RejectModal contractor={selectedContractor} onClose={closeModal} />
            )}
            {modalType === 'requestEdit' && (
              <RequestEditModal contractor={selectedContractor} onClose={closeModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Contractor Details Modal
const ContractorDetailsModal = ({ contractor, onClose }) => {
  const contractorDetails = {
    fullName: 'David White',
    dateOfBirth: 'July24@gmail.com',
    phoneNumber: '555 555 7693',
    location: 'USA',
    submittedOn: 'July 5 2025',
    status: 'Pending',
    certifications: 'CPA,CA',
    softwareProficiency: 'Microsoft,Quickbooks',
    hourlyRate: '$150',
    availability: '20 hrs/week',
    workPreference: '100% remote'
  };

  return (
    <div className="contractor-details-modal">
      <div className="modal-header">
        <h3>{contractorDetails.fullName}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <div className="details-grid">
          <div className="detail-row">
            <span className="label">Full Name:</span>
            <span className="value">{contractorDetails.fullName}</span>
          </div>
          <div className="detail-row">
            <span className="label">Date of Birth:</span>
            <span className="value">{contractorDetails.dateOfBirth}</span>
          </div>
          <div className="detail-row">
            <span className="label">Phone Number:</span>
            <span className="value">{contractorDetails.phoneNumber}</span>
          </div>
          <div className="detail-row">
            <span className="label">Location:</span>
            <span className="value">{contractorDetails.location}</span>
          </div>
          <div className="detail-row">
            <span className="label">Submitted On:</span>
            <span className="value">{contractorDetails.submittedOn}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className="value">{contractorDetails.status}</span>
          </div>
          <div className="detail-row">
            <span className="label">Certifications:</span>
            <span className="value">{contractorDetails.certifications}</span>
          </div>
          <div className="detail-row">
            <span className="label">Software Proficiency:</span>
            <span className="value">{contractorDetails.softwareProficiency}</span>
          </div>
          <div className="detail-row">
            <span className="label">Hourly Rate:</span>
            <span className="value">{contractorDetails.hourlyRate}</span>
          </div>
          <div className="detail-row">
            <span className="label">Availability:</span>
            <span className="value">{contractorDetails.availability}</span>
          </div>
          <div className="detail-row">
            <span className="label">Work Preference:</span>
            <span className="value">{contractorDetails.workPreference}</span>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Back</button>
          <button className="btn-primary">Approve</button>
          <button className="btn-danger">Reject</button>
        </div>
      </div>
    </div>
  );
};

// Reject Modal
const RejectModal = ({ contractor, onClose }) => {
  return (
    <div className="reject-modal">
      <div className="modal-header">
        <h3>Rejected Message</h3>
      </div>
      <div className="modal-body">
        <textarea
          placeholder="rejection message"
          rows={4}
          className="rejection-textarea"
        />
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Back</button>
          <button className="btn-primary">Rejected</button>
        </div>
      </div>
    </div>
  );
};

// Request Edit Modal
const RequestEditModal = ({ contractor, onClose }) => {
  return (
    <div className="request-edit-modal">
      <div className="modal-header">
        <h3>Request Edit Message</h3>
      </div>
      <div className="modal-body">
        <textarea
          placeholder="write message to edit details of intake form of contractor"
          rows={4}
          className="request-edit-textarea"
        />
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Back</button>
          <button className="btn-primary">Request</button>
        </div>
      </div>
    </div>
  );
};

export default AdminContractorIntake;