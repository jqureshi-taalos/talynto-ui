import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import adminService from '../services/adminService';
import authService from '../services/authService';
import ProfileAvatar from './ProfileAvatar';
import RejectionReasonPopup from './RejectionReasonPopup';
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

const AdminContractorProfile = () => {
  const navigate = useNavigate();
  const { contractorId } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'active';
  const fromTab = searchParams.get('tab') || 'contractor';

  const [contractor, setContractor] = useState({
    name: 'Loading...',
    email: 'Loading...',
    status: status.charAt(0).toUpperCase() + status.slice(1),
    emailVerified: 'Loading...',
    role: 'Contractor',
    accountCreated: 'Loading...',
    avatar: '👤',
    totalProjects: 0,
    activeProjects: 0,
    closedProjects: 0,
    companyName: '',
    // Intake form details
    intakeForm: {
      completed: false,
      submittedAt: null,
      skills: '',
      experience: '',
      portfolio: '',
      hourlyRate: '',
      availability: '',
      preferredWorkType: '',
      certifications: '',
      education: '',
      workPreference: '',
      phoneNumber: '',
      location: '',
      bio: '',
      linkedIn: '',
      github: '',
      linkedUrl: '',
      industryExperience: '',
      expertise: '',
      profession: '',
      domain: '',
      resumeUpload: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewAllProjects, setShowViewAllProjects] = useState(false);
  const [rejectionPopup, setRejectionPopup] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchContractorDetails();
  }, [contractorId]);

  const fetchContractorDetails = async () => {
    try {
      setLoading(true);

      // Fetch real contractor data from API
      const [contractorResponse, projectsResponse] = await Promise.allSettled([
        adminService.getContractorDetails(contractorId),
        adminService.getContractorProjects(contractorId)
      ]);

      if (contractorResponse.status === 'fulfilled' && contractorResponse.value) {
        const contractorData = contractorResponse.value.contractor || contractorResponse.value;

        // Debug: Log contractor data to see what fields are available
        console.log('Contractor data received:', contractorData);
        console.log('Available fields in contractor data:', Object.keys(contractorData));

        // Specifically check for resume fields
        console.log('Resume-related fields:');
        console.log('- resumeUpload:', contractorData.resumeUpload);
        console.log('- resume:', contractorData.resume);
        console.log('- resumeUrl:', contractorData.resumeUrl);
        console.log('- resumeFile:', contractorData.resumeFile);
        console.log('- ResumeFile:', contractorData.ResumeFile);
        console.log('- cv:', contractorData.cv);
        console.log('- CV:', contractorData.CV);
        console.log('- document:', contractorData.document);
        console.log('- attachments:', contractorData.attachments);

        // Also check if there's an intake form nested object
        if (contractorData.intakeForm) {
          console.log('Intake form resume fields:');
          console.log('- intakeForm.resumeUpload:', contractorData.intakeForm.resumeUpload);
          console.log('- intakeForm.resume:', contractorData.intakeForm.resume);
          console.log('- intakeForm.resumeFile:', contractorData.intakeForm.resumeFile);
          console.log('- intakeForm.ResumeFile:', contractorData.intakeForm.ResumeFile);
        }

        // Try to get additional profile data if resume is not found
        let additionalProfileData = null;
        const resumeFound = contractorData.resumeUpload || contractorData.resume || contractorData.resumeUrl ||
          contractorData.resumeFile || contractorData.ResumeFile || contractorData.cv || contractorData.CV ||
          contractorData.document || contractorData.resumePath || contractorData.filePath;

        if (!resumeFound) {
          console.log('Resume not found in contractor details, trying profile endpoint...');
          try {
            const profileResponse = await adminService.getContractorProfile(contractorId);
            additionalProfileData = profileResponse;
            console.log('Additional profile data:', additionalProfileData);
            console.log('Resume from profile data:', additionalProfileData?.resumeUpload);
          } catch (profileError) {
            console.log('Profile endpoint not available or failed:', profileError.message);
          }
        }

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
          workModel: project.projectType || 'Remote',
          client: project.clientName || project.client || 'Unknown Client'
        }));

        // Format the contractor data
        const formattedContractor = {
          id: contractorData.id || contractorId,
          name: contractorData.name || (contractorData.firstName && contractorData.lastName ? `${contractorData.firstName} ${contractorData.lastName}` : 'Unknown'),
          email: contractorData.email || 'No email provided',
          status: status.charAt(0).toUpperCase() + status.slice(1),
          emailVerified: contractorData.emailVerified ? 'Yes' : 'No',
          role: 'Contractor',
          accountCreated: contractorData.createdDate || contractorData.createdAt ? new Date(contractorData.createdDate || contractorData.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : 'Unknown',
          avatar: (contractorData.name || (contractorData.firstName && contractorData.lastName ? `${contractorData.firstName} ${contractorData.lastName}` : 'Contractor')).split(' ').map(n => n[0]).join('').toUpperCase(),
          totalProjects: totalProjects,
          activeProjects: activeProjects,
          closedProjects: closedProjects,
          companyName: contractorData.companyName || contractorData.company || '',
          projects: formattedProjects,
          // Intake form details - comprehensive mapping
          intakeForm: {
            completed: contractorData.intakeFormCompleted || contractorData.intakeCompleted || false,
            submittedAt: contractorData.intakeSubmittedAt || contractorData.submittedAt || contractorData.createdAt ?
              new Date(contractorData.intakeSubmittedAt || contractorData.submittedAt || contractorData.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : null,
            skills: contractorData.skills || contractorData.expertise || contractorData.technicalSkills || contractorData.skillSet || '',
            experience: contractorData.experience || contractorData.yearsOfExperience || contractorData.workExperience || contractorData.totalExperience || '',
            portfolio: contractorData.portfolioUrl || contractorData.portfolio || contractorData.portfolioLink || contractorData.websiteUrl || '',
            hourlyRate: contractorData.hourlyRate || contractorData.ratePerHour || contractorData.expectedRate || contractorData.rate || '',
            availability: contractorData.availability || contractorData.availabilityStatus || contractorData.currentAvailability || '',
            preferredWorkType: contractorData.preferredWorkType || contractorData.workType || contractorData.jobType || contractorData.employmentType || '',
            certifications: contractorData.certifications || contractorData.certificates || contractorData.qualifications || '',
            education: contractorData.education || contractorData.educationLevel || contractorData.degree || contractorData.qualification || '',
            workPreference: contractorData.workPreference || contractorData.remote || contractorData.workLocation || contractorData.locationPreference || '',
            phoneNumber: contractorData.phoneNumber || contractorData.phone || contractorData.contactNumber || '',
            location: contractorData.location || contractorData.city || contractorData.address || '',
            bio: contractorData.bio || contractorData.description || contractorData.summary || contractorData.about || '',
            linkedIn: contractorData.linkedIn || contractorData.linkedInUrl || contractorData.linkedin || '',
            github: contractorData.github || contractorData.githubUrl || contractorData.githubProfile || '',
            // New intake form fields
            linkedUrl: contractorData.linkedUrl || '',
            industryExperience: contractorData.industryExperience || '',
            expertise: contractorData.expertise || '',
            profession: contractorData.profession || '',
            domain: contractorData.domain || '',
            resumeUpload: contractorData.resumeUpload || contractorData.resume || contractorData.resumeUrl ||
              contractorData.resumeFile || contractorData.ResumeFile || contractorData.cv || contractorData.CV ||
              contractorData.document || contractorData.resumePath || contractorData.filePath ||
              (additionalProfileData?.resumeUpload) || ''
          }
        };

        setContractor(formattedContractor);
      } else {
        throw new Error('No contractor data received');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch contractor details');
      console.error('Error fetching contractor details:', err);
    } finally {
      setLoading(false);
    }
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
      default: return '';
    }
  };

  const navigateBack = () => {
    navigate(`/admin-user-management?tab=${fromTab}`);
  };

  const handleApprove = async () => {
    try {
      await adminService.approveContractor(contractorId, 'Approved by admin');
      navigateBack();
    } catch (err) {
      setError(err.message || 'Failed to approve contractor');
    }
  };

  const handleReject = () => {
    setRejectionPopup(true);
  };

  const handleRejectionSubmit = async (rejectionReason) => {
    try {
      setActionLoading(true);
      await adminService.rejectContractor(contractorId, rejectionReason);
      setRejectionPopup(false);
      navigateBack();
    } catch (err) {
      setError(err.message || 'Failed to reject contractor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectionCancel = () => {
    setRejectionPopup(false);
  };

  const handleActivate = async () => {
    try {
      await adminService.approveContractor(contractorId, 'Activated by admin');
      navigateBack();
    } catch (err) {
      setError(err.message || 'Failed to activate contractor');
    }
  };

  const handleDeactivate = async () => {
    try {
      // For contractors, we would use a deactivate contractor service method
      // Since it doesn't exist yet, we'll use the same pattern as clients
      console.log('Deactivating contractor:', contractorId);
      navigateBack();
    } catch (err) {
      setError(err.message || 'Failed to deactivate contractor');
    }
  };

  const handleDownloadResume = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

      // Use the new endpoint that fetches resume by userId
      const downloadUrl = `${API_BASE_URL}/ContractorApplication/resume/user/${contractor.id}`;

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert('Resume not found for this contractor.');
          return;
        }
        throw new Error('Failed to download resume');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      // Use contractor name for filename
      const filename = `${contractor.name}_resume.pdf`;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  const renderActionButtons = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="profile-actions">
            <button className="btn-secondary" onClick={handleReject}>Reject</button>
            <button className="btn-primary" onClick={handleApprove}>Approve</button>
          </div>
        );
      case 'active':
        return (
          <div className="profile-actions">
            <button className="btn-primary" onClick={handleDeactivate}>Deactivate</button>
          </div>
        );
      case 'inactive':
        return (
          <div className="profile-actions">
            <button className="btn-primary" onClick={handleActivate}>Active</button>
          </div>
        );
      default:
        return null;
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
            <div className="profile-header">
              <button className="back-link" onClick={() => setShowViewAllProjects(false)}>
                ← Back
              </button>
            </div>

            <div className="view-all-projects-layout">
              {/* Left side - Contractor info */}
              <div className="contractor-info-sidebar">
                <div className="contractor-profile-card">
                  <div className="contractor-avatar-section">
                    <ProfileAvatar
                      user={{
                        id: contractor.id,
                        firstName: contractor.firstName,
                        lastName: contractor.lastName,
                        name: contractor.name,
                        email: contractor.email
                      }}
                      size={80}
                      className="contractor-avatar-large"
                    />
                    <div className="contractor-basic-info">
                      <h2 className="contractor-name">{contractor.name}</h2>
                      <p className="contractor-email">{contractor.email}</p>
                    </div>
                  </div>

                  <div className="contractor-details">
                    <div className="detail-row">
                      <span className="detail-label">Status</span>
                      <span className={`detail-value status-badge status-${contractor.status.toLowerCase()}`}>
                        {contractor.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email Verified</span>
                      <span className="detail-value">{contractor.emailVerified}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Role</span>
                      <span className="detail-value">{contractor.role}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Account Created</span>
                      <span className="detail-value">{contractor.accountCreated}</span>
                    </div>
                    {status === 'active' && contractor.companyName && (
                      <div className="detail-row">
                        <span className="detail-label">Company</span>
                        <span className="detail-value">{contractor.companyName}</span>
                      </div>
                    )}
                  </div>

                  <div className="contractor-actions">
                    {status === 'active' && (
                      <button className="btn-primary" onClick={handleDeactivate}>Deactivate</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Projects */}
              <div className="projects-grid">
                {contractor.projects && contractor.projects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-detail">
                      <span className="project-label">Project Title</span>
                      <span className="project-value">{project.title}</span>
                    </div>
                    <div className="project-detail">
                      <span className="project-label">Project Status</span>
                      <span className={`project-value status-badge status-${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="project-detail">
                      <span className="project-label">Work Model</span>
                      <span className="project-value">{project.workModel}</span>
                    </div>
                    <div className="project-detail">
                      <span className="project-label">Client Name</span>
                      <span className="project-value">{project.client}</span>
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
          <div className="contractor-profile-container">
            {/* Back Button */}
            <div className="profile-header">
              <button className="back-link" onClick={navigateBack}>
                ← Back
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
                              id: contractor.id,
                              firstName: contractor.firstName,
                              lastName: contractor.lastName,
                              name: contractor.name,
                              email: contractor.email
                            }}
                            size={80}
                            className="contractor-avatar"
                          />
                        </div>
                        <div className="profile-basic-info">
                          <h2 className="profile-name">{contractor.name}</h2>
                          <p className="profile-email">{contractor.email}</p>
                        </div>
                      </div>
                      {renderActionButtons()}
                    </div>

                    <div className="profile-details">
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Status</span>
                          <span className={`detail-value status-badge ${getStatusClass(contractor.status)}`}>
                            {contractor.status}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Email Verified</span>
                          <span className="detail-value">{contractor.emailVerified}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Role</span>
                          <span className="detail-value">{contractor.role}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Account Created</span>
                          <span className="detail-value">{contractor.accountCreated}</span>
                        </div>
                      </div>
                      {status === 'active' && contractor.companyName && (
                        <div className="detail-row">
                          <div>
                            <span className="detail-label">Company</span>
                            <span className="detail-value">{contractor.companyName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Intake Form Details - Show for all contractors */}
                <div className="profile-card h-intake-form">
                  <h3>Contractor Intake Form</h3>
                  <div className="profile-main">
                    <div className="profile-details">
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Form Status</span>
                          <span className={`detail-value status-badge ${contractor.intakeForm.completed ? 'status-active' : 'status-pending'}`}>
                            {contractor.intakeForm.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      {contractor.intakeForm.submittedAt && (
                        <div className="detail-row">
                          <div>
                            <span className="detail-label">Submitted Date</span>
                            <span className="detail-value">{contractor.intakeForm.submittedAt}</span>
                          </div>
                        </div>
                      )}
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Skills/Expertise</span>
                          <span className="detail-value">
                            {contractor.intakeForm.skills ?
                              (Array.isArray(contractor.intakeForm.skills)
                                ? contractor.intakeForm.skills.join(', ')
                                : contractor.intakeForm.skills)
                              : 'Not provided'}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Certifications</span>
                          <span className="detail-value">
                            {contractor.intakeForm.certifications ?
                              (Array.isArray(contractor.intakeForm.certifications)
                                ? contractor.intakeForm.certifications.join(', ')
                                : contractor.intakeForm.certifications)
                              : 'Not provided'}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Hourly Rate</span>
                          <span className="detail-value">{contractor.intakeForm.hourlyRate || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Preferred Work Type</span>
                          <span className="detail-value">{contractor.intakeForm.preferredWorkType || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">LinkedIn URL (Intake Form)</span>
                          <span className="detail-value">
                            {contractor.intakeForm.linkedUrl ? (
                              <a href={contractor.intakeForm.linkedUrl} target="_blank" rel="noopener noreferrer">
                                View LinkedIn Profile
                              </a>
                            ) : 'Not provided'}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Industry Experience</span>
                          <span className="detail-value">{contractor.intakeForm.industryExperience || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Expertise</span>
                          <span className="detail-value">{contractor.intakeForm.expertise || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Profession</span>
                          <span className="detail-value">{contractor.intakeForm.profession || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Domain</span>
                          <span className="detail-value">{contractor.intakeForm.domain || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className='h-left-button-holder'>
                        <div>
                          <button
                            className="btn-primary" // "view-all-projects-btn"
                            onClick={handleDownloadResume}
                          >
                            Download Resume
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Summary - Only show for active contractors */}
                {status === 'active' && (
                  <div className='h-project-summary-card' style={{ marginTop: '10px' }}>
                    <div style={{ textAlign: 'start' }}>Project summary</div>
                    <div className="profile-details">
                      <div className="detail-row">
                        <div>
                          <span className="detail-label">Total Projects</span>
                          <span className="detail-value">{contractor.totalProjects}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div >
                          <span className="detail-label">Active Projects</span>
                          <span className="detail-value">{contractor.activeProjects}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div >
                          <span className="detail-label">Closed Projects</span>
                          <span className="detail-value">{contractor.closedProjects}</span>
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
              </>
            )}
          </div>
        </main>
      </div>

      {/* Rejection Reason Popup */}
      <RejectionReasonPopup
        isOpen={rejectionPopup}
        onClose={handleRejectionCancel}
        onSubmit={handleRejectionSubmit}
        userType="contractor"
        userName={contractor?.name}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminContractorProfile;