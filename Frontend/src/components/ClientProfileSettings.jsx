import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import Notification from './Notification';
import { useNotification } from '../hooks/useNotification';
import DashboardLayout from './DashboardLayout';
import ProfileAvatar from './ProfileAvatar';
import ProfileSettings from './ProfileSettings';

const ClientProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    country: '',
    state: '',
    role: '',
    profilePicture: null,
    profilePictureTimestamp: null,
    // @added-new: 9-16-2025
    companySize: '',
    industry: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [securityData, setSecurityData] = useState({
    oldPassword: '',
    newPassword: '',
    loginAlerts: false
  });
  const [deactivationData, setDeactivationData] = useState({
    eligibility: null,
    loading: false,
    showConfirmation: false
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  // @added-new: 9-16-2025
  const [options, setOptions] = useState({
    expertise: [],
    certification: [],
    tools: [],
    // Legacy support
    certifications: [],
    skills: [],
    softwareTools: []
  });

  useEffect(() => {
    fetchUserProfile();
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
      const data = await response.json();
      const countryOptions = data.map(country => ({
        name: country.name.common,
        code: country.cca2
      })).sort((a, b) => a.name.localeCompare(b.name));
      setCountries(countryOptions);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    }
  };

  const fetchStates = async (countryName) => {
    if (!countryName) {
      setStates([]);
      return;
    }

    try {
      const country = countries.find(c => c.name === countryName);
      if (!country) {
        setStates([]);
        return;
      }

      const statesResponse = await fetch(`https://api.countrystatecity.in/v1/countries/${country.code}/states`, {
        headers: {
          'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
        }
      });

      if (statesResponse.ok) {
        const statesData = await statesResponse.json();
        const stateNames = statesData.map(state => state.name).sort();
        setStates(stateNames);
      } else {
        throw new Error('Failed to fetch states');
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    }
  };

  useEffect(() => {
    if (profileData.country && countries.length > 0) {
      fetchStates(profileData.country);
    }
  }, [profileData.country, countries]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Profile data from backend:', data);
      const xData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
        email: data.email || '',
        companyName: data.companyName || '',
        phoneNumber: data.phoneNumber || '',
        country: data.country || '',
        state: data.state || '',
        role: data.role || '',
        profilePicture: data.profilePicture,
        // @added-new: 9-16-2025
        companySize: data.companySize || '',
        industry: data.industry || '',
      }
      setProfileData(xData);
      setOriginalData(xData);
      console.log('Profile picture URL will be:', data.profilePicture ? `http://localhost:54193${data.profilePicture}` : 'No profile picture');

      setSecurityData(prev => ({
        ...prev,
        loginAlerts: data.loginAlerts || false
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Clear state when country changes
      if (field === 'country') {
        newData.state = '';
      }

      console.log('@newData ===>', newData)

      return newData;
    });
  };

  const handleSecurityInputChange = (field, value) => {
    console.log("@shayan", field, value)
    setSecurityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const updatedProfileData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        fullName: `${profileData.firstName ?? ''} ${profileData.lastName ?? ''}`.trim(),
        phoneNumber: profileData.phoneNumber,
        companyName: profileData.companyName,
        country: profileData.country,
        state: profileData.state,
        // @new-added: 9-16-2025
        companySize: profileData.companySize,
        industry: profileData.industry,
      }

      console.log('@newData (sending In API)===>', updatedProfileData)

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProfileData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Profile updated:', result);

      // Update the user data in auth service to reflect in header
      authService.updateCurrentUser(updatedProfileData);

      showSuccess('Profile updated successfully!');
      setIsEditing(false);
      await fetchUserProfile(); // Refresh the profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePictureUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setIsSaving(true);
          const token = authService.getToken();
          if (!token) {
            authService.logout();
            navigate('/login');
            return;
          }

          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${API_BASE_URL}/fileupload/profile-picture`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Picture uploaded:', result);

          // Update the user data in auth service to trigger header refresh
          authService.updateCurrentUser({
            profilePictureTimestamp: Date.now()
          });

          showSuccess('Profile picture uploaded successfully!');

          // Update timestamp to trigger ProfileAvatar refresh
          setProfileData(prev => ({
            ...prev,
            profilePictureTimestamp: Date.now()
          }));
        } catch (error) {
          console.error('Error uploading picture:', error);
          showError('Error uploading picture. Please try again.');
        } finally {
          setIsSaving(false);
        }
      }
    };
    input.click();
  };

  const handleSecuritySave = async () => {
    setIsSaving(true);
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      // Update security settings
      const response = await fetch(`${API_BASE_URL}/user/security`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loginAlerts: securityData.loginAlerts,
          twoFactorEnabled: false // Add this if you want to support 2FA later
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Security settings updated:', result);
      showSuccess('Security settings updated successfully!');
    } catch (error) {
      console.error('Error updating security settings:', error);
      showError('Error updating security settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!securityData.oldPassword || !securityData.newPassword) {
      showError('Please enter both old and new passwords');
      return;
    }

    setIsSaving(true);
    try {
      const token = authService.getToken();
      if (!token) {
        authService.logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword: securityData.oldPassword,
          newPassword: securityData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Password changed:', result);
      showSuccess('Password changed successfully!');

      // Clear password fields
      setSecurityData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: ''
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      showError(error.message || 'Error changing password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  const checkDeactivationEligibility = async () => {
    try {
      setDeactivationData(prev => ({ ...prev, loading: true }));

      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/account/deactivation-eligibility`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const eligibility = await response.json();
      setDeactivationData(prev => ({
        ...prev,
        eligibility,
        loading: false
      }));

    } catch (error) {
      console.error('Error checking deactivation eligibility:', error);
      showError('Failed to check account deactivation eligibility');
      setDeactivationData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteAccount = async () => {
    if (!deactivationData.eligibility) {
      await checkDeactivationEligibility();
      return;
    }

    if (!deactivationData.eligibility?.isEligible) {
      showError('Account cannot be deactivated. Please resolve the listed issues first.');
      return;
    }

    setDeactivationData(prev => ({ ...prev, showConfirmation: true }));
  };

  const confirmDeactivation = async () => {
    try {
      setIsSaving(true);

      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/account/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to deactivate account');
      }

      showSuccess('Account deactivated successfully. You will be logged out.');

      // Log out after 2 seconds
      setTimeout(() => {
        authService.logout();
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error deactivating account:', error);
      showError(error.message || 'Failed to deactivate account');
    } finally {
      setIsSaving(false);
      setDeactivationData(prev => ({ ...prev, showConfirmation: false }));
    }
  };

  const cancelDeactivation = () => {
    setDeactivationData(prev => ({ ...prev, showConfirmation: false }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };


  return (
    <DashboardLayout>
      <ProfileSettings
        userId={authService.getCurrentUser()?.id}
        formData={profileData}
        setFormData={setProfileData}
        userRole={"client"}
        securityData={securityData}
        handlePassword={handleSecurityInputChange}
        handleDeleteAccount={handleDeleteAccount}
        deactivationData={deactivationData}
        isSaving={isSaving}
        handleChangePassword={handleChangePassword}
        setDeactivationData={setDeactivationData}
        notification={notification}
        hideNotification={hideNotification}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleSave={handleSaveChanges}
        isEditing={isEditing}
        handleChange={handleInputChange}
        handlePictureUpload={handlePictureUpload}

      // saving={saving}
      // isEditing={isEditing}
      // handleEdit={handleEdit}
      // handleSave={handleSave}
      // getDisplayValue={getDisplayValue}
      />


      {deactivationData.showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Account Deactivation</h3>
            <p>Are you sure you want to deactivate your account?</p>
            <div className="confirmation-details">
              <p><strong>:warning: Important:</strong></p>
              <ul>
                <li>You will not be able to log in after deactivation</li>
                <li>Only an admin can reactivate your account</li>
                <li>Your data will be preserved but inaccessible to you</li>
                <li>Associated contractors will not be able to see your projects</li>
              </ul>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={cancelDeactivation}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={confirmDeactivation}
                disabled={isSaving}
              >
                {isSaving ? 'Deactivating...' : 'Yes, Deactivate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <div className="profile-settings-container">
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideNotification}
          duration={notification.duration}
        />
        <div className="profile-settings-header">
          <h1>Profile <strong>Settings</strong></h1>
        </div>


        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Info
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security Settings
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="client-profile-form-container">
            <div className="client-profile-form">
              <div className="client-profile-field">
                <span className="client-field-label">Full Name</span>
                <input
                  type="text"
                  value={profileData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="client-field-value"
                  placeholder="Enter full name"
                />
              </div>

              <div className="client-profile-field">
                <span className="client-field-label">Email address</span>
                <span className="client-field-value">{profileData.email}</span>
              </div>

              <div className="client-profile-field">
                <span className="client-field-label">Company Name</span>
                <input
                  type="text"
                  value={profileData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="client-field-value"
                  placeholder="Enter company name"
                />
              </div>

              <div className="client-profile-field">
                <span className="client-field-label">Phone Number</span>
                <input
                  type="tel"
                  value={profileData.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="client-field-value"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="client-profile-field">
                <span className="client-field-label">Profile Picture</span>
                <div className="client-field-value client-picture-section">
                  <ProfileAvatar
                    user={{
                      id: authService.getCurrentUser()?.id,
                      firstName: profileData.firstName,
                      lastName: profileData.lastName,
                      email: profileData.email
                    }}
                    size={35}
                    className="client-profile-avatar"
                    timestamp={profileData.profilePictureTimestamp}
                  />
                  <button
                    className="client-change-picture-btn"
                    onClick={handlePictureUpload}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Uploading...' : 'Change / Upload New Picture'}
                  </button>
                </div>
              </div>

              <div className="client-profile-field">
                <span className="client-field-label">Country</span>
                <select
                  value={profileData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="client-field-value"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="client-profile-field">
                <span className="client-field-label">State</span>
                <select
                  value={profileData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="client-field-value"
                  disabled={!profileData.country || states.length === 0}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-left-button-holder">
              <button
                className="btn-primary"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-settings-container">
            <div className="security-form">
              <div className='security-form-row'>
                <div className='security-box'>
                  <div className="label">Change Password</div>
                  <div className='value'>
                    <input
                      type="password"
                      placeholder="Old Password Here"
                      value={securityData.oldPassword}
                      onChange={(e) => handleSecurityInputChange('oldPassword', e.target.value)}
                      className="security-input"
                    />
                    <input
                      type="password"
                      placeholder="New Password Here"
                      value={securityData.newPassword}
                      onChange={(e) => handleSecurityInputChange('newPassword', e.target.value)}
                      className="security-input"
                    />
                  </div>
                </div>
                <div className='h-left-button-holder'>
                  <button
                    className="client-change-password-btn"
                    onClick={handleChangePassword}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
              <div className='security-form-row'>
                <div className='security-box'>
                  <div className="label">Deactivate Account</div>
                  <div className='value'>

                    {!deactivationData.eligibility ? (
                      <>
                        <div>
                          Account deactivation is only allowed when all projects are closed and all invoices are accepted and paid by admin.

                          <div className='h-left-button-holder'>
                            <button
                              className="delete-btn"
                              onClick={handleDeleteAccount}
                              disabled={deactivationData.loading}
                            >
                              {deactivationData.loading ? 'Checking...' : 'Check Eligibility'}
                            </button>
                          </div>
                        </div>

                      </>
                    ) : (
                      <>
                        <div className="eligibility-status">
                          {deactivationData.eligibility?.isEligible ? (
                            <>
                              <div className="eligible-message">
                                <span className="success-icon">✓</span>
                                <p>{deactivationData.eligibility.message}</p>
                              </div>
                              <div className="account-summary">
                                <p><strong>Projects:</strong> {deactivationData.eligibility.closedProjects}/{deactivationData.eligibility.totalProjects} closed</p>
                                <p><strong>Invoices:</strong> {deactivationData.eligibility.paidInvoices}/{deactivationData.eligibility.totalInvoices} paid</p>
                              </div>
                              <button
                                className="delete-btn"
                                onClick={handleDeleteAccount}
                                disabled={isSaving}
                              >
                                {isSaving ? 'Processing...' : 'Deactivate Account'}
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="ineligible-message">
                                <span className="error-icon">⚠</span>
                                <p>{deactivationData.eligibility.message}</p>
                              </div>
                              <ul className="blocking-reasons">
                                {deactivationData.eligibility.blockingReasons.map((reason, index) => (
                                  <li key={index}>{reason}</li>
                                ))}
                              </ul>
                              <div className="account-summary">
                                <p><strong>Projects:</strong> {deactivationData.eligibility.closedProjects}/{deactivationData.eligibility.totalProjects} closed</p>
                                <p><strong>Invoices:</strong> {deactivationData.eligibility.paidInvoices}/{deactivationData.eligibility.totalInvoices} paid</p>
                              </div>

                              <button
                                className="secondary-btn"
                                onClick={() => setDeactivationData(prev => ({ ...prev, eligibility: null }))}
                              >
                                Check Again
                              </button>

                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>



              <div className="security-form-actions">
                <button
                  className="btn-primary"
                  onClick={handleSecuritySave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div> */}
    </DashboardLayout >
  );
};

export default ClientProfileSettings;