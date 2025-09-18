import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

const AdminViewProjectManagement = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shortlist, setShortlist] = useState([]);
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [closing, setClosing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [configOptions, setConfigOptions] = useState({
    expertise: [],
    certifications: [],
    softwareTools: [],
    projectTypes: []
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

  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // This will be handled by individual dropdown components
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get project details from API
      const projectData = await adminService.getProjectByIdForAdmin(projectId);
      console.log('Loaded project data:', projectData);
      console.log('Project status:', projectData?.status);
      console.log('Assigned contractor ID:', projectData?.assignedContractorId);
      setProject(projectData);

      // Initialize edit data with current project data
      setEditData({
        name: projectData.name || '',
        startDate: projectData.startDate ? projectData.startDate.split('T')[0] : '',
        type: projectData.type ? projectData.type.split(',').map(s => s.trim()) : [],
        certifications: projectData.certifications ? projectData.certifications.split(',').map(s => s.trim()) : [],
        tool: projectData.tool ? projectData.tool.split(',').map(s => s.trim()) : [],
        estimatedHours: projectData.estimatedHours || 0,
        projectType: projectData.projectType ? projectData.projectType.split(',').map(s => s.trim()) : [],
        workModel: projectData.workModel || ''
      });

      // Get shortlisted contractors for this project
      try {
        const shortlistedContractors = await adminService.getShortlistedContractorsForProject(projectId);
        setShortlist(shortlistedContractors);
      } catch (shortlistError) {
        console.error('Error loading shortlisted contractors:', shortlistError);
        // Continue loading the project even if shortlist fails
        setShortlist([]);
      }

      // Load configuration options for dropdowns (always load for potential edit mode)
      try {
        const options = await adminService.getProjectConfigurationOptions();
        console.log('Configuration options loaded:', options);

        setConfigOptions({
          expertise: options.expertise || options.Expertise || [],
          certifications: options.certifications || options.Certifications || [],
          softwareTools: options.softwareTools || options.SoftwareTools || [],
          projectTypes: options.projectTypes || options.ProjectTypes || []
        });
      } catch (configError) {
        console.error('Error loading configuration options:', configError);
      }
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

  const handleAssignContractor = (contractorId) => {
    // Find the contractor from the shortlist
    const contractor = shortlist.find(c => c.id === contractorId);
    setSelectedContractor(contractor);
    setConfirmAssignOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedContractor) {
      setErrorMsg('No contractor selected for assignment.');
      return;
    }

    try {
      setAssigning(true);
      setErrorMsg(null);

      // Call the assignment API
      console.log('Calling assignment API:', { contractorId: selectedContractor.id, projectId: project.id });
      const result = await adminService.assignContractorToProject(selectedContractor.id, project.id);
      console.log('Assignment API result:', result);

      // Show success message
      setSuccess(`${selectedContractor.name} has been successfully assigned to "${project.name}".`);

      // Close confirmation popup
      setConfirmAssignOpen(false);
      setSelectedContractor(null);

      // Reload project details to reflect the assignment
      console.log('Reloading project details after assignment...');
      await loadProjectDetails();
      console.log('Project details reloaded, new status:', project?.status);

    } catch (error) {
      console.error('Error assigning contractor:', error);
      setErrorMsg('Failed to assign contractor: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleCancelAssign = () => {
    setConfirmAssignOpen(false);
    setSelectedContractor(null);
  };

  const handleViewProfile = (contractorId) => {
    // Navigate to contractor profile page with return path
    const returnPath = encodeURIComponent(`/admin-project-management/view-project/${projectId}`);
    navigate(`/admin-user-management/contractor/${contractorId}?status=Approved&tab=contractor&returnPath=${returnPath}`);
  };

  const handleCloseProject = async () => {
    const projectStatus = project?.status || 'this project';
    const confirmMessage = projectStatus === 'Pending'
      ? 'Are you sure you want to close this pending project? This will mark it as closed without assigning a contractor.'
      : 'Are you sure you want to close this project?';

    if (!window.confirm(confirmMessage)) {
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



  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setSuccess(null);
      setErrorMsg(null);

      // Prepare update data
      const updateData = {
        name: editData.name,
        type: Array.isArray(editData.type) ? editData.type.join(', ') : editData.type,
        tool: Array.isArray(editData.tool) ? editData.tool.join(', ') : editData.tool,
        projectType: Array.isArray(editData.projectType) ? editData.projectType.join(', ') : editData.projectType,
        certifications: Array.isArray(editData.certifications) ? editData.certifications.join(', ') : editData.certifications,
        estimatedHours: parseInt(editData.estimatedHours) || 0,
        status: project.status,
        color: project.color,
        description: project.description,
        budget: project.budget,
        hourlyRate: project.hourlyRate,
        startDate: editData.startDate ? new Date(editData.startDate).toISOString() : null,
        endDate: project.endDate,
        country: project.country,
        state: project.state,
        workModel: editData.workModel,
        availability: project.availability,
        assignedContractorId: project.assignedContractorId
      };

      // Call update API
      await adminService.updateProjectForAdmin(projectId, updateData);

      setSuccess('Project updated successfully!');

      // Exit edit mode and reload data
      setTimeout(() => {
        navigate(`/admin-project-management/view-project/${projectId}`);
        loadProjectDetails();
      }, 1500);
    } catch (error) {
      console.error('Error updating project:', error);
      setErrorMsg('Failed to update project: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset edit data and exit edit mode
    navigate(`/admin-project-management/view-project/${projectId}`);
  };

  const handleEditFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field, selectedValues) => {
    setEditData(prev => ({
      ...prev,
      [field]: selectedValues
    }));
  };

  const SingleSelectDropdown = ({ field, value, options, placeholder, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionSelect = (option) => {
      onChange(field, option);
      setIsOpen(false);
    };

    const displayText = value || placeholder;

    return (
      <div style={{ position: 'relative', flex: 1, marginLeft: '10px' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '6px 10px',
            border: '1px solid #000000',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '32px'
          }}
        >
          <span style={{
            color: value ? '#000000' : '#999',
            flex: 1,
            marginRight: '8px'
          }}>
            {displayText}
          </span>
          <span style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0
          }}>
            ▼
          </span>
        </div>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #000000',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {options.length === 0 ? (
              <div style={{ padding: '8px 12px', color: '#999' }}>No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: value === option ? '#e7f3ff' : 'transparent',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{option}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const MultiSelectDropdown = ({ field, value, options, placeholder, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    console.log(`MultiSelectDropdown ${field}:`, { value, options, optionsLength: options?.length });

    const handleOptionToggle = (option) => {
      const currentValues = value || [];
      const newValues = currentValues.includes(option)
        ? currentValues.filter(v => v !== option)
        : [...currentValues, option];
      onChange(field, newValues);
    };

    const displayText = value && value.length > 0
      ? value.length === 1
        ? value[0]
        : value.join(', ')
      : placeholder;

    return (
      <div style={{ position: 'relative', flex: 1, marginLeft: '10px' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '6px 10px',
            border: '1px solid #000000',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '32px'
          }}
        >
          <span style={{
            color: value && value.length > 0 ? '#000000' : '#999',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            flex: 1,
            marginRight: '8px'
          }}>
            {displayText}
          </span>
          <span style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0
          }}>
            ▼
          </span>
        </div>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #000000',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {options.length === 0 ? (
              <div style={{ padding: '8px 12px', color: '#999' }}>No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleOptionToggle(option)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: value && value.includes(option) ? '#e7f3ff' : 'transparent',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!(value && value.includes(option))) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(value && value.includes(option))) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={value && value.includes(option)}
                    onChange={() => { }} // Handled by div click
                    style={{ margin: 0 }}
                  />
                  <span>{option}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
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
          <div className="admin-view-project-container">
            {/* Header */}
            <div
              className="admin-view-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                {isEditMode ? 'Edit Project' : 'Manage Projects'}
              </h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        background: '#f8f9fa',
                        border: '1px solid #000000',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
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
                      Back
                    </button>
                    {project?.status !== 'Closed' && (
                      <button
                        onClick={handleCloseProject}
                        disabled={closing}
                        style={{
                          background: '#ffc107',
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
                    )}
                  </>
                )}
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
              <div className="project-details-panel  h-box-shadow"
                style={{
                  flex: '1',
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  // @add height
                  height: 'fit-content'
                }}>
                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Project Title</div>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => handleEditFieldChange('name', e.target.value)}
                      // style={{
                      //   width: '100%',
                      //   padding: '8px 12px',
                      //   border: '1px solid #000000',
                      //   borderRadius: '4px',
                      //   fontSize: '16px'
                      // }}
                      />
                    ) : (
                      <div
                      // @remove inline style
                      // style={{ fontSize: '16px', color: '#f00' }}
                      >{project?.name}</div>
                    )}
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Project Status</div>
                    <div className={`status-badge ${project?.status === 'Pending' ? 'status-pending' : 'status-closed'}`}
                    >
                      {project?.status}
                    </div>
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div
                    // @remove inline style
                    // style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}
                    >Created On</div>
                    <div
                    // @remove inline style
                    // style={{ fontSize: '16px', color: '#000000' }}
                    >{formatDate(project?.createdAt)}</div>
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Start Date</div>
                    {isEditMode ? (
                      <input
                        type="date"
                        value={editData.startDate}
                        onChange={(e) => handleEditFieldChange('startDate', e.target.value)}
                      // style={{
                      //   width: '100%',
                      //   padding: '8px 12px',
                      //   border: '1px solid #000000',
                      //   borderRadius: '4px',
                      //   fontSize: '16px'
                      // }}
                      />
                    ) : (
                      <div
                      // @remove inline style
                      // style={{ fontSize: '16px', color: '#000000' }}
                      >{formatDate(project?.startDate)}</div>
                    )}
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Work Model</div>
                    {isEditMode ? (
                      <div
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <SingleSelectDropdown
                          field="workModel"
                          value={editData.workModel}
                          options={['Remote', 'On-site', 'Hybrid']}
                          placeholder="Select work model..."
                          onChange={handleEditFieldChange}
                        />
                      </div>
                    ) : (
                      <div
                      // @remove inline style
                      // style={{ fontSize: '16px', color: '#000000' }}
                      >{project?.workModel}</div>
                    )}
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Client Name</div>
                    <div
                    // @remove style inline
                    // style={{ fontSize: '16px', color: '#000000' }}
                    >{project?.clientName}</div>
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Rate Range</div>
                    <div
                    // @remove style inline
                    // style={{ fontSize: '16px', color: '#000000' }}
                    >${project?.hourlyRate}/hr</div>
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#000000', marginBottom: '5px' }}>Project Type</div>
                    {isEditMode ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <MultiSelectDropdown
                          field="projectType"
                          value={editData.projectType}
                          options={configOptions.projectTypes}
                          placeholder="Select project types..."
                          onChange={handleMultiSelectChange}
                        />
                      </div>
                    ) : (
                      <div
                      // @remove style inline
                      // style={{ fontSize: '16px', color: '#000000' }}
                      >{project?.projectType}</div>
                    )}
                  </div>
                </div>

                <div className="project-detail-item" style={{ marginBottom: '15px' }}>
                  <div>
                    <div style={{ minWidth: '150px' }}>Project Description</div>
                    <div style={{ textAlign: 'right' }}>
                      {project?.description || 'No description provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Skills and Wishlist */}
              <div className="skills-wishlist-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Skills & Requirements */}
                <div className="skills-panel h-box-shadow" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h3 style={{ margin: '5% 10% 5%', textAlign: 'left', fontSize: '18px', fontWeight: '600' }}>Skills & Requirement</h3>
                  <div className="skills-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <div className="skill-row"
                    // style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '500', color: '#000000', minWidth: '150px' }}>Skills Required</div>
                        {isEditMode ? (
                          <MultiSelectDropdown
                            field="type"
                            value={editData.type}
                            options={configOptions.expertise}
                            placeholder="Select skills..."
                            onChange={handleMultiSelectChange}
                          />
                        ) : (
                          <div style={{ color: '#000000', textAlign: 'right' }}>{project?.type}</div>
                        )}
                      </div>
                    </div>

                    <div className="skill-row"
                    // style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '500', color: '#000000', minWidth: '150px' }}>Certifications Needed</div>
                        {isEditMode ? (
                          <MultiSelectDropdown
                            field="certifications"
                            value={editData.certifications}
                            options={configOptions.certifications}
                            placeholder="Select certifications..."
                            onChange={handleMultiSelectChange}
                          />
                        ) : (
                          <div style={{ color: '#000000', textAlign: 'right' }}>{project?.certifications}</div>
                        )}
                      </div>
                    </div>

                    <div className="skill-row"
                    // style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <span style={{ fontWeight: '500', color: '#000000', minWidth: '150px' }}>Software Tools</span>
                        {isEditMode ? (
                          <MultiSelectDropdown
                            field="tool"
                            value={editData.tool}
                            options={configOptions.softwareTools}
                            placeholder="Select tools..."
                            onChange={handleMultiSelectChange}
                          />
                        ) : (
                          <span style={{ color: '#000000', textAlign: 'right' }}>{project?.tool}</span>
                        )}
                      </div>
                    </div>

                    <div className="skill-row"
                    // style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <span style={{ fontWeight: '500', color: '#000000', minWidth: '150px' }}>Weekly Availability</span>
                        {isEditMode ? (
                          <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginLeft: '10px' }}>
                            <input
                              type="number"
                              value={editData.estimatedHours}
                              onChange={(e) => handleEditFieldChange('estimatedHours', e.target.value)}
                              style={{
                                width: '80px',
                                padding: '6px 10px',
                                border: '1px solid #000000',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                            <span style={{ marginLeft: '5px', color: '#000000' }}>Hrs/Week</span>
                          </div>
                        ) : (
                          <span style={{ color: '#000000', textAlign: 'right' }}>{project?.estimatedHours}Hrs/Week</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shortlist */}
                <div className="shortlist-panel h-box-shadow" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h3 style={{ margin: '5% 10% 5%', textAlign: 'left', fontSize: '18px', fontWeight: '600' }}>
                    {project?.status === 'Closed' ? 'Assigned Contractor' : 'Suggested Contractors'}
                  </h3>

                  {project?.status === 'Closed' ? (
                    // Show only assigned contractor for closed projects
                    // project?.assignedContractorId ? (
                    project?.assignedContractorId ? (
                      <div className="contractor-shortlist-item" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
                        <div className="contractor-row">
                          <div>
                            <span style={{ fontWeight: '500', color: '#000000' }}>Contractor Name</span>
                            <span style={{ color: '#000000' }}>{project.assignedContractorName || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="contractor-row">
                          <div>
                            <span style={{ fontWeight: '500', color: '#000000' }}>Status</span>
                            <span style={{ color: '#000000' }}>Assigned</span>
                          </div>
                        </div>

                        <div className="contractor-row">
                          <div>
                            <span style={{ fontWeight: '500', color: '#000000' }}>Email</span>
                            <span style={{ color: '#000000' }}>{project.assignedContractorEmail || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="contractor-row">
                          <div>
                            <span style={{ fontWeight: '500', color: '#000000' }}>Hourly Rate</span>
                            <span style={{ color: '#000000' }}>${project.hourlyRate || 'Not specified'}/hr</span>
                          </div>
                        </div>

                        <div className='h-contractor-row-btn-holder'>
                          <button
                            onClick={() => handleViewProfile(project.assignedContractorId)}
                            className='btn-primary'
                          >
                            View Profile
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#000000', padding: '20px' }}>
                        No contractor was assigned to this closed project.
                      </div>
                    )
                  ) : (
                    // Show shortlist for non-closed projects
                    shortlist.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#000000', padding: '20px' }}>
                        No contractors shortlisted for this project yet.
                      </div>
                    ) : (
                      shortlist.map((contractor) => (
                        <div key={contractor.id} className="contractor-shortlist-item" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
                          <div className="contractor-row"
                          // @remove inline styles
                          // style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                          >
                            <div>
                              <span style={{ fontWeight: '500', color: '#000000' }}>Contractor Name</span>
                              <span style={{ color: '#000000' }}>{contractor.name}</span>
                            </div>
                          </div>

                          <div className="contractor-row"
                          // @remove inline styles
                          // style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                          >
                            <div>
                              <span style={{ fontWeight: '500', color: '#000000' }}>Status</span>
                              <span style={{ color: '#000000' }}>{contractor.status}</span>
                            </div>
                          </div>

                          <div className="contractor-row"
                          // @remove inline styles
                          // style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                          >
                            <div>
                              <span style={{ fontWeight: '500', color: '#000000' }}>Hourly Rate</span>
                              <span style={{ color: '#000000' }}>${contractor.hourlyRate || 'Not specified'}/hr</span>
                            </div>
                          </div>

                          <div className="contractor-row"
                          // @remove inline styles
                          // style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                          >
                            <div>
                              <span style={{ minWidth: '150px' }}>Skills</span>
                              <span style={{ textAlign: 'right' }}>{contractor.skills || 'Not specified'}</span>
                            </div>
                          </div>

                          <div className="contractor-row" style={{ marginBottom: '15px' }}>
                            <div>
                              <div style={{ fontWeight: '500', color: '#000000' }}>Job Title</div>
                              <div style={{ color: '#000000' }}>{contractor.jobTitle || 'Not specified'}</div>
                            </div>
                          </div>

                          <div className='h-contractor-row-btn-holder'>
                            <button
                              onClick={() => handleViewProfile(contractor.id)}
                              className='btn-primary'
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div >

      {/* Confirmation Dialog */}
      {
        confirmAssignOpen && (
          <>
            <style>
              {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
            </style>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '480px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Header */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '28px'
                  }}>
                    ⚠️
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 8px 0'
                  }}>
                    Confirm Contractor Assignment
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    This action will assign the project to the selected contractor
                  </p>
                </div>

                {/* Content */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Project: </span>
                    <span style={{ color: '#111827' }}>{project?.name}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Contractor: </span>
                    <span style={{ color: '#111827' }}>{selectedContractor?.name}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Skills: </span>
                    <span style={{ color: '#111827' }}>{selectedContractor?.skills || 'Not specified'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Hourly Rate: </span>
                    <span style={{ color: '#111827' }}>${selectedContractor?.hourlyRate || 'Not specified'}/hr</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleCancelAssign}
                    style={{
                      backgroundColor: 'white',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAssign}
                    disabled={assigning}
                    style={{
                      backgroundColor: assigning ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: assigning ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!assigning) {
                        e.target.style.backgroundColor = '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!assigning) {
                        e.target.style.backgroundColor = '#3b82f6';
                      }
                    }}
                  >
                    {assigning && (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    )}
                    {assigning ? 'Assigning...' : 'Yes, Assign Contractor'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )
      }

    </div >
  );
};

export default AdminViewProjectManagement;