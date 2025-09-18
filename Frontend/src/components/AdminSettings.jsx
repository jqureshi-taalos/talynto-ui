import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AdminSettings = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);

  const [profileData, setProfileData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    profilePicture: '',
    countryId: null,
    countryName: ''
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    systemAlerts: true,
    emailForActivityLogs: true,
    invoiceNotifications: true,
    userApprovalNotifications: true
  });

  const [adminSettings, setAdminSettings] = useState(null);

  const sidebarItems = [
    { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/admin-dashboard' },
    { id: 'user-management', icon: <UserManagementIcon />, label: 'User Management', path: '/admin-user-management' },
    { id: 'project-management', icon: <ProjectManagementIcon />, label: 'Project Management', path: '/admin-project-management' },
    { id: 'invoices', icon: <InvoicesIcon />, label: 'Invoices', path: '/admin-invoices' },
    // { id: 'contractor-intake', icon: '📝', label: 'Contractor Intake', path: '/admin-contractor-intake' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notifications', path: '/admin-notifications' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/admin-settings', active: true },
    { id: 'configuration', icon: <ConfigurationIcon />, label: 'Configuration', path: '/admin-configuration' }
  ];

  // Load data on component mount
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Load admin settings
      const settings = await adminService.getAdminSettings();
      setAdminSettings(settings);

      // Load countries
      const countriesData = await adminService.getCountries();
      setCountries(countriesData);

      // Set notification preferences from settings
      setNotificationPreferences({
        systemAlerts: settings.systemAlerts,
        emailForActivityLogs: settings.emailForActivityLogs,
        invoiceNotifications: settings.invoiceNotifications,
        userApprovalNotifications: settings.userApprovalNotifications
      });

      // Set security data
      setSecurityData(prev => ({
        ...prev,
      }));

      // Set profile data from API response
      setProfileData({
        fullName: `${settings.firstName || ''} ${settings.lastName || ''}`.trim(),
        emailAddress: settings.email || '',
        phoneNumber: settings.phoneNumber || '',
        profilePicture: settings.profilePicturePath || '',
        countryId: settings.countryId,
        countryName: settings.countryName || ''
      });

      setError(null);
    } catch (err) {
      setError('Failed to load admin settings: ' + err.message);
      console.error('Error loading admin settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (section, field) => {
    if (section === 'notifications') {
      setNotificationPreferences(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updatedSettings = {
        firstName: profileData.fullName.split(' ')[0] || '',
        lastName: profileData.fullName.split(' ').slice(1).join(' ') || '',
        email: profileData.emailAddress,
        phoneNumber: profileData.phoneNumber,
        profilePicturePath: profileData.profilePicture,
        countryId: profileData.countryId,
        invoiceNotifications: notificationPreferences.invoiceNotifications,
        userApprovalNotifications: notificationPreferences.userApprovalNotifications,
        systemAlerts: notificationPreferences.systemAlerts,
        emailForActivityLogs: notificationPreferences.emailForActivityLogs
      };

      console.log('Saving admin settings:', updatedSettings);

      const result = await adminService.updateAdminSettings(updatedSettings);
      console.log('Save result:', result);

      // Reload data to reflect changes
      await loadAdminData();

      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Detailed error saving settings:', err);
      console.error('Error response:', err.response);
      setError('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileDataChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/fileupload/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        handleProfileDataChange('profilePicture', result.profilePictureUrl);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Upload failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="loading-container">
          <div className="loading-spinner"></div>
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
          <span className="header-page">Settings</span>
        </div>
        <div className="header-right">
          <div className="notification-icon" onClick={() => navigate('/admin-notifications')} style={{ cursor: 'pointer' }}><HeaderNotificationIcon /></div>
          <div className="user-profile">
            <div>
              <div className="user-name">{authService.getCurrentUser()?.firstName && authService.getCurrentUser()?.lastName ? `${authService.getCurrentUser().firstName} ${authService.getCurrentUser().lastName}` : 'Admin'}</div>
              <div className="user-role">{authService.getCurrentUser()?.role || 'Super Admin'}</div>
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
          {error && (
            <div className="error-message" style={{ background: '#ff4444', color: 'white', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
              {error}
              <button
                onClick={() => setError(null)}
                style={{ float: 'right', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          )}

          <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Admin Settings</h2>
            <div className="settings-actions">
              {!isEditing ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                  style={{ padding: '8px 16px', backgroundColor: '#4EC1EF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Edit Settings
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      loadAdminData(); // Reset data
                    }}
                    disabled={saving}
                    style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="settings-container">
            <div className="settings-sections">
              {/* Profile Information */}
              <div className="settings-section">
                <h2>Profile Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleProfileDataChange('fullName', e.target.value)}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profileData.emailAddress}
                      onChange={(e) => handleProfileDataChange('emailAddress', e.target.value)}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleProfileDataChange('phoneNumber', e.target.value)}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Picture</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ marginBottom: '8px' }}
                        />
                        {profileData.profilePicture && (
                          <div style={{ fontSize: '14px', color: '#000000' }}>
                            Current: {profileData.profilePicture}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={profileData.profilePicture || 'No profile picture uploaded'}
                        readOnly
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    {isEditing ? (
                      <select
                        value={profileData.countryId || ''}
                        onChange={(e) => {
                          const countryId = e.target.value ? parseInt(e.target.value) : null;
                          const country = countries.find(c => c.id === countryId);
                          handleProfileDataChange('countryId', countryId);
                          handleProfileDataChange('countryName', country?.name || '');
                        }}
                      >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={profileData.countryName || 'No country selected'}
                        readOnly
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="settings-section">
                <h2>Security Settings</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      readOnly={!isEditing}
                      placeholder={isEditing ? "Enter current password" : "••••••••"}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                      readOnly={!isEditing}
                      placeholder={isEditing ? "Enter new password" : "••••••••"}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      readOnly={!isEditing}
                      placeholder={isEditing ? "Confirm new password" : "••••••••"}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                <div className="notification-toggles">
                  <div className="toggle-item">
                    <label>System Alerts</label>
                    <div className={`toggle-switch ${notificationPreferences.systemAlerts ? 'on' : 'off'}`}
                      onClick={() => isEditing && handleToggle('notifications', 'systemAlerts')}
                      style={{ cursor: isEditing ? 'pointer' : 'not-allowed', opacity: isEditing ? 1 : 0.6 }}>
                      <div className="toggle-slider"></div>
                    </div>
                  </div>
                  <div className="toggle-item">
                    <label>Email for activity logs</label>
                    <div className={`toggle-switch ${notificationPreferences.emailForActivityLogs ? 'on' : 'off'}`}
                      onClick={() => isEditing && handleToggle('notifications', 'emailForActivityLogs')}
                      style={{ cursor: isEditing ? 'pointer' : 'not-allowed', opacity: isEditing ? 1 : 0.6 }}>
                      <div className="toggle-slider"></div>
                    </div>
                  </div>
                  <div className="toggle-item">
                    <label>Invoice Notifications</label>
                    <div className={`toggle-switch ${notificationPreferences.invoiceNotifications ? 'on' : 'off'}`}
                      onClick={() => isEditing && handleToggle('notifications', 'invoiceNotifications')}
                      style={{ cursor: isEditing ? 'pointer' : 'not-allowed', opacity: isEditing ? 1 : 0.6 }}>
                      <div className="toggle-slider"></div>
                    </div>
                  </div>
                  <div className="toggle-item">
                    <label>User Approvals</label>
                    <div className={`toggle-switch ${notificationPreferences.userApprovalNotifications ? 'on' : 'off'}`}
                      onClick={() => isEditing && handleToggle('notifications', 'userApprovalNotifications')}
                      style={{ cursor: isEditing ? 'pointer' : 'not-allowed', opacity: isEditing ? 1 : 0.6 }}>
                      <div className="toggle-slider"></div>
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

export default AdminSettings;