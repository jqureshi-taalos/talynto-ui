import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './ProfileSettings.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';
import adminService from '../services/adminService';
import { useNotification } from '../hooks/useNotification';
import Notification from './Notification';
import notificationService from '../services/notificationService';
import ProfileAvatar from './ProfileAvatar';
import EmailIcon from './EmailIcon';
import LocationIcon from './LocationIcon';
import ProfileSettings from './ProfileSettings';

const ContractorEditProfile = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState({
    expertise: [],
    certification: [],
    tools: [],
    // Legacy support
    certifications: [],
    skills: [],
    softwareTools: []
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const { notification, showSuccess, showError, showWarning, hideNotification } = useNotification();

  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    location: '',
    profilePicture: '',
    linkedinUrl: '',
    resumeUpload: '',
    certifications: [],
    skills: [],
    softwareTools: [],
    hourlyRate: '',
    availability: '',
    workModel: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfileData();
    loadConfigurationOptions();
  }, []);

  const loadConfigurationOptions = async () => {
    try {
      setOptionsLoading(true);
      console.log('Loading contractor configuration options...');

      // Use the public contractor configuration endpoint
      const configOptions = await adminService.getContractorConfigurationOptions();
      console.log('Loaded configuration options:', configOptions);

      setOptions({
        expertise: configOptions.expertise || [],
        certification: configOptions.certifications || [],
        tools: configOptions.tools || [],
        // Legacy support - map to the expected field names
        certifications: configOptions.certifications || [],
        skills: configOptions.expertise || [],
        softwareTools: configOptions.tools || []
      });
    } catch (error) {
      console.error('Error loading configuration options:', error);
      // Keep empty arrays if loading fails
      setOptions({
        expertise: [],
        certification: [],
        tools: [],
        certifications: [],
        skills: [],
        softwareTools: []
      });
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const user = authService.getCurrentUser();
      const token = authService.getToken();

      if (!user || !token) {
        navigate('/login');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const response = await fetch(`${API_BASE_URL}/contractor/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        const initialData = {
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          phoneNumber: profileData.phone || '',
          location: profileData.location || '',
          profilePicture: profileData.profilePicture || '',
          linkedinUrl: profileData.linkedinUrl || '',
          resumeUpload: profileData.resumeUpload || '',
          certifications: profileData.qualifications ? profileData.qualifications.split(',').map(s => s.trim()).filter(s => s) : [],
          skills: profileData.skills ? profileData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
          softwareTools: profileData.softwareTools ? profileData.softwareTools.split(',').map(s => s.trim()).filter(s => s) : [],
          hourlyRate: profileData.hourlyRate ? `$${profileData.hourlyRate}` : '',
          availability: profileData.availability ? `${profileData.availability}Hr/week` : '',
          workModel: profileData.workModel || '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        setFormData(initialData);
        setOriginalData(initialData);
      } else {
        throw new Error('Failed to fetch profile data');
      }
    } catch (err) {
      // setError(err.message);
      showError(err.message)
      console.log('Using fallback to empty data due to API error');
      // Initialize with empty data - no hardcoded values
      const emptyData = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        location: '',
        profilePicture: '',
        linkedinUrl: '',
        resumeUpload: '',
        certifications: [],
        skills: [],
        softwareTools: [],
        hourlyRate: '',
        availability: '',
        workModel: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      setFormData(emptyData);
      setOriginalData(emptyData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        handleFileUpload(file, name);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = async (file, fieldName) => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

      const formData = new FormData();
      formData.append('file', file);

      let endpoint = '';
      if (fieldName === 'profilePicture') {
        endpoint = `${API_BASE_URL}/fileupload/profile-picture`;
      } else if (fieldName === 'resumeUpload') {
        endpoint = `${API_BASE_URL}/fileupload/resume`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          [fieldName]: result.profilePictureUrl || result.fileName || result.filePath
        }));
        showSuccess(`${fieldName === 'profilePicture' ? 'Profile picture' : 'Resume'} uploaded successfully!`);

        // For profile picture, trigger a re-render by updating a timestamp
        if (fieldName === 'profilePicture') {
          // Update the user data in auth service to trigger header refresh
          authService.updateCurrentUser({
            profilePictureTimestamp: Date.now()
          });

          // The ProfileAvatar component will automatically pick up the new image
          // from the database endpoint on next render
          setFormData(prev => ({ ...prev, profilePictureTimestamp: Date.now() }));
        }
      } else {
        const error = await response.json();
        showError(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      showError(`Failed to upload ${fieldName}. Please try again.`);
    }
  };

  const handleViewResume = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

      const response = await fetch(`${API_BASE_URL}/fileupload/resume`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');

        // Clean up the blob URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        showError('Unable to view resume. Please try again.');
      }
    } catch (error) {
      console.error('Error viewing resume:', error);
      showError('Failed to open resume. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // @fixed
    if (!formData.firstName || formData.firstName.trim() === '') {
      // setError('Name is mandatory');
      showError('Name is mandatory');
      return;
    }

    // @fixed
    if (formData.linkedinUrl) {
      const linkedInRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/;
      if (!linkedInRegex.test(formData.linkedinUrl.trim())) {
        // setError('Enter valid LinkedIn URL');
        showError('Enter valid LinkedIn URL');
        return;
      }
    }



    // @fixed
    if (parseFloat(formData.hourlyRate.replace('$', '')) <= 0) {
      // setError('Enter valid hourly rate');
      showError('Enter valid hourly rate');
      return;
    }



    try {
      setSaving(true);
      // setError(null);


      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

      // Transform data to match backend DTO
      // Note: Email is excluded as it cannot be changed by contractors
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phoneNumber,
        location: formData.location,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate.replace('$', '')) : null,
        availability: formData.availability ? parseInt(formData.availability.replace(/\D/g, '')) : null,
        skills: Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills,
        certifications: Array.isArray(formData.certifications) ? formData.certifications.join(', ') : formData.certifications,
        bio: formData.bio || '',
        softwareTools: Array.isArray(formData.softwareTools) ? formData.softwareTools.join(', ') : formData.softwareTools,
        workModel: formData.workModel,
        linkedinUrl: formData.linkedinUrl,
        resumeUpload: formData.resumeUpload,
        profilePicture: formData.profilePicture
      };

      const response = await fetch(`${API_BASE_URL}/contractor/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setOriginalData(formData);
        setIsEditing(false);

        // Update the user data in auth service to reflect in header
        authService.updateCurrentUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`.trim()
        });

        showSuccess('Profile updated successfully!');
        // Create persistent notification for profile update
        await notificationService.notifyContractorProfileUpdated();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError(err.message);
      console.log('Profile save error:', err.message);
      // Don't simulate success in case of error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      showError('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    try {
      // Implement password change API call
      console.log('Password change requested');
      showWarning('Password change functionality not yet implemented');
    } catch (err) {
      showError('Failed to change password');
    }
  };

  if (loading || optionsLoading) {
    return (
      <ContractorDashboardLayout>
        <div className="loading-container">
          <div className="loading-spinner">
          </div>
        </div>
      </ContractorDashboardLayout>
    );
  }

  const getDisplayValue = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Not specified';
    }
    return value || 'Not specified';
  };

  const getFullName = () => {
    return `${formData.firstName} ${formData.lastName}`.trim();
  };

  const addToArray = (fieldName, value) => {
    if (!value || formData[fieldName].includes(value)) return;

    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], value]
    }));
  };

  const addManualEntry = (fieldName, value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue || formData[fieldName].includes(trimmedValue)) return;

    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], trimmedValue]
    }));
  };

  const removeFromArray = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter(item => item !== value)
    }));
  };

  // Multi-select dropdown component similar to admin project management
  const MultiSelectDropdown = ({ field, value, options, placeholder, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleOptionToggle = (option) => {
      const currentValues = value || [];
      const newValues = currentValues.includes(option)
        ? currentValues.filter(v => v !== option)
        : [...currentValues, option];
      onChange(field, newValues);
    };

    const handleAddCustom = () => {
      const trimmedValue = customInput.trim();
      if (trimmedValue && !value.includes(trimmedValue)) {
        const newValues = [...(value || []), trimmedValue];
        onChange(field, newValues);
        setCustomInput('');
      }
    };

    const displayText = value && value.length > 0
      ? value.length === 1
        ? value[0]
        : `${value.length} selected`
      : placeholder;

    return (
      <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '8px 12px',
            border: '1px solid #000000',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '36px'
          }}
        >
          <span style={{
            color: value && value.length > 0 ? '#000000' : '#999',
            flex: 1
          }}>
            {displayText}
          </span>
          <span style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
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
            maxHeight: '250px',
            overflowY: 'auto'
          }}>
            {/* Custom input section */}
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Add custom entry"
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    border: '1px solid #000000',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustom();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #4EC1EF',
                    backgroundColor: '#4EC1EF',
                    color: 'white',
                    borderRadius: '3px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Options list */}
            {options && options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value || option}
                  onClick={() => handleOptionToggle(option.value || option)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: value && value.includes(option.value || option) ? '#e7f3ff' : 'transparent',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!(value && value.includes(option.value || option))) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(value && value.includes(option.value || option))) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={value && value.includes(option.value || option)}
                    onChange={() => { }} // Handled by div click
                    style={{ margin: 0 }}
                  />
                  <span>{option.label || option}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '8px 12px', color: '#999', fontSize: '12px' }}>
                No predefined options available. Use the input above to add custom entries.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleMultiSelectChange = (field, selectedValues) => {
    setFormData(prev => ({
      ...prev,
      [field]: selectedValues
    }));
  };

  return (
    <>

      <ContractorDashboardLayout>
        <ProfileSettings
          userId={authService.getCurrentUser()?.id}
          formData={formData}
          setFormData={setFormData}
          saving={saving}
          userRole={authService.getCurrentUser()?.role}
          isEditing={isEditing}
          options={options}
          handleEdit={handleEdit}
          handleSave={handleSave}
          // getDisplayValue={getDisplayValue}
          handleCancel={handleCancel}
          handleChange={handleChange}
          notification={notification}
          hideNotification={hideNotification}
          handleViewResume={handleViewResume}
        />
        {/* <div className='x-profile-settings'>
          <div className='x-header'>
            <h1>Profile</h1>
            <div>
              {!isEditing ? (
                <button className="x-button" onClick={handleEdit}>Edit</button>
              ) : (

                <button className="x-button" onClick={handleSave} disabled={saving}>
                  {saving ? <div className='x-loading-spinner'></div> : 'Save'}
                </button>

              )}
            </div>
          </div>
          <div className='x-profile-header'>
            <div className='x-profile-title'>
              <div className='x-avatar-and-name'>
                <ProfileAvatar
                  user={{
                    id: authService.getCurrentUser()?.id,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email
                  }}
                  size={150}
                  className='x-avatar'
                  timestamp={formData.profilePictureTimestamp}
                />
                <div className='x-name x-title-font'>
                  {formData.firstName} <strong>{formData.lastName}</strong>
                </div>
              </div>
              <div className='x-email-and-location'>
                <div className='x-email'> <EmailIcon /> {formData.email}</div>
                <div className='x-location'> <LocationIcon /> {formData.location}</div>
              </div>
            </div>
          </div>

          <div className='x-profile-details'>
            <div className='x-profile-details-holder'>
              <div className='x-detail'>
                <div className='x-detail-label'>LinkedIn URL</div>
                <div className='x-detail-value'>https://www.linkedin.com/in/the-designer-19686a27a/
                </div>
              </div>
            </div>

            <div className='x-title-font'>Professional <strong>Info</strong></div>

            <div className='x-profile-details-holder'>
              <div className='x-detail'>
                <div className='x-detail-label'>Certifications</div>
                <div className='x-detail-value'>
                  {formData.certifications.map(cert => <span key={cert} className="x-badge"> {cert} </span>)}
                </div>
              </div>
            </div>
            <div className='x-profile-details-holder'>
              <div className='x-detail'>
                <div className='x-detail-label'>Skills / Experience</div>
                <div className='x-detail-value'>
                  {formData.skills.map(skill => <span key={skill} className="x-badge"> {skill} </span>)}
                </div>
              </div>
            </div>
            <div className='x-profile-details-holder'>
              <div className='x-detail'>
                <div className='x-detail-label'>Software Tools</div>
                <div className='x-detail-value'>
                  {formData.softwareTools.map(tool => <span key={tool} className="x-badge">{tool}</span>)}
                </div>
              </div>
            </div>
            <div className='x-profile-details-holder'>
              <div className='x-detail'>
                <div className='x-detail-label'>Hourly Rate</div>
                <div className='x-detail-value'>
                  <div className="x-badge">{getDisplayValue(formData.hourlyRate)} </div>
                </div>
              </div>
            </div>
            <div className='x-profile-details-holder'>
              <div className='x-detail'>
                <div className='x-detail-label'>Availability</div>
                <div className='x-detail-value'>
                  <div className="x-badge"> {getDisplayValue(formData.availability)} </div>
                </div>
              </div>
            </div>
            <div className='x-profile-details-holder'>
              <div className='x-detail'>
                <div className='x-detail-label'>Work model</div>
                <div className='x-detail-value'>
                  <div className="x-badge"> {getDisplayValue(formData.workModel)} </div>
                </div>
              </div>
            </div>
          </div>


        </div> */}
      </ContractorDashboardLayout>


      {/* Old version */}
      {/* <ContractorDashboardLayout>
        <div className="edit-profile-page">
          <div className="edit-profile-header">
            <h1>Edit <strong>Profile</strong></h1>
            <div className="header-actions">
              {!isEditing ? (
                <button className="edit-btn" onClick={handleEdit}>Edit</button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          )}

          <div className="profile-cards-container">
            <div className="profile-card personal-info-card">
              <h3>Personal Info</h3>

              <div className="profile-field">
                <label>Full Name</label>
                <div className="field-group">
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={`${formData.firstName} ${formData.lastName}`.trim()}
                      onChange={(e) => {
                        const nameParts = e.target.value.split(' ');
                        setFormData(prev => ({
                          ...prev,
                          firstName: nameParts[0] || '',
                          lastName: nameParts.slice(1).join(' ') || ''
                        }));
                      }}
                      className="profile-input"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <div className="field-value">{getDisplayValue(getFullName())}</div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <div className="field-group">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="profile-input disabled"
                      placeholder="Enter email address"
                      disabled
                      title="Email address cannot be changed"
                    />
                  ) : (
                    <div className="field-value">
                      {getDisplayValue(formData.email)}
                      <span className="disabled-text"> (cannot be changed)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Phone Number</label>
                <div className="field-group">
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="profile-input"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="field-value">{getDisplayValue(formData.phoneNumber)}</div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Location</label>
                <div className="field-group">
                  {isEditing ? (
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="profile-select"
                    >
                      <option value="">Select country</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Italy">Italy</option>
                      <option value="Spain">Spain</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Norway">Norway</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Finland">Finland</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Austria">Austria</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Greece">Greece</option>
                      <option value="Poland">Poland</option>
                      <option value="Czech Republic">Czech Republic</option>
                      <option value="Hungary">Hungary</option>
                      <option value="Romania">Romania</option>
                      <option value="Bulgaria">Bulgaria</option>
                      <option value="Croatia">Croatia</option>
                      <option value="Slovenia">Slovenia</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Malta">Malta</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Japan">Japan</option>
                      <option value="South Korea">South Korea</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Hong Kong">Hong Kong</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Israel">Israel</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="India">India</option>
                      <option value="China">China</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Chile">Chile</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Peru">Peru</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Ecuador">Ecuador</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Panama">Panama</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="Honduras">Honduras</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Belize">Belize</option>
                      <option value="Jamaica">Jamaica</option>
                      <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                      <option value="Barbados">Barbados</option>
                      <option value="Bahamas">Bahamas</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Namibia">Namibia</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="Mauritius">Mauritius</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Madagascar">Madagascar</option>
                      <option value="Russia">Russia</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="Belarus">Belarus</option>
                      <option value="Kazakhstan">Kazakhstan</option>
                      <option value="Uzbekistan">Uzbekistan</option>
                      <option value="Kyrgyzstan">Kyrgyzstan</option>
                      <option value="Tajikistan">Tajikistan</option>
                      <option value="Turkmenistan">Turkmenistan</option>
                      <option value="Mongolia">Mongolia</option>
                      <option value="Azerbaijan">Azerbaijan</option>
                      <option value="Armenia">Armenia</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Oman">Oman</option>
                      <option value="Yemen">Yemen</option>
                      <option value="Iraq">Iraq</option>
                      <option value="Iran">Iran</option>
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Maldives">Maldives</option>
                      <option value="Nepal">Nepal</option>
                      <option value="Bhutan">Bhutan</option>
                      <option value="Myanmar">Myanmar</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Cambodia">Cambodia</option>
                      <option value="Laos">Laos</option>
                      <option value="Brunei">Brunei</option>
                      <option value="East Timor">East Timor</option>
                      <option value="Papua New Guinea">Papua New Guinea</option>
                      <option value="Fiji">Fiji</option>
                      <option value="Solomon Islands">Solomon Islands</option>
                      <option value="Vanuatu">Vanuatu</option>
                      <option value="Samoa">Samoa</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Palau">Palau</option>
                      <option value="Marshall Islands">Marshall Islands</option>
                      <option value="Micronesia">Micronesia</option>
                      <option value="Nauru">Nauru</option>
                      <option value="Kiribati">Kiribati</option>
                      <option value="Tuvalu">Tuvalu</option>
                    </select>
                  ) : (
                    <div className="field-value">{getDisplayValue(formData.location)}</div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Profile Photo</label>
                <div className="field-group photo-field">
                  <div className="profile-photo-container">
                    <div className="profile-photo">
                      <ProfileAvatar
                        user={{
                          id: authService.getCurrentUser()?.id,
                          firstName: formData.firstName,
                          lastName: formData.lastName,
                          email: formData.email
                        }}
                        size={100}
                        timestamp={formData.profilePictureTimestamp}
                      />
                    </div>
                    {isEditing && (
                      <div className="profile-photo-upload">
                        <input
                          type="file"
                          name="profilePicture"
                          onChange={handleChange}
                          accept="image/*"
                          className="file-input"
                          id="profile-picture-upload"
                        />
                        <label htmlFor="profile-picture-upload" className="change-photo-btn">
                          <span className="upload-icon">🔺</span>
                          Change/Upload Picture
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-field">
                <label>LinkedIn URL</label>
                <div className="field-group">
                  {isEditing ? (
                    <input
                      type="text"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="in/yourprofile"
                      className="profile-input"
                    />
                  ) : (
                    <div className="field-value">{getDisplayValue(formData.linkedinUrl)}</div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Resume Upload</label>
                <div className="field-group">
                  {isEditing ? (
                    <div className="file-upload-field">
                      <input
                        type="file"
                        name="resumeUpload"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx"
                        className="file-input"
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className="file-label">
                        {formData.resumeUpload ? 'Change File' : 'Choose File'}
                      </label>
                      {formData.resumeUpload && (
                        <span className="file-name">{formData.resumeUpload}</span>
                      )}
                    </div>
                  ) : (
                    <div className="field-value">
                      {formData.resumeUpload ? (
                        <div className="resume-display">
                          <span>{formData.resumeUpload}</span>
                          <button
                            className="view-resume-btn"
                            onClick={handleViewResume}
                            type="button"
                          >
                            View Resume
                          </button>
                        </div>
                      ) : (
                        'No resume uploaded'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div className="profile-card professional-profile-card">
              <h3>Professional Profile</h3>

              <div className="profile-field">
                <label>Certifications</label>
                <div className="field-group">
                  {isEditing ? (
                    <div className="multi-select-container">
                      <MultiSelectDropdown
                        field="certifications"
                        value={formData.certifications}
                        options={options.certifications}
                        placeholder="Select certifications..."
                        onChange={handleMultiSelectChange}
                      />
                      <div className="selected-tags">
                        {formData.certifications.map(cert => (
                          <span key={cert} className="tag">
                            {cert}
                            <button
                              type="button"
                              onClick={() => removeFromArray('certifications', cert)}
                              className="tag-remove"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="field-value">
                      {formData.certifications.length > 0 ? (
                        <div className="display-tags">
                          {formData.certifications.map(cert => (
                            <span key={cert} className="display-tag">{cert}</span>
                          ))}
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Skills/Experience</label>
                <div className="field-group">
                  {isEditing ? (
                    <div className="multi-select-container">
                      <MultiSelectDropdown
                        field="skills"
                        value={formData.skills}
                        options={options.skills}
                        placeholder="Select skills..."
                        onChange={handleMultiSelectChange}
                      />
                      <div className="selected-tags">
                        {formData.skills.map(skill => (
                          <span key={skill} className="tag">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeFromArray('skills', skill)}
                              className="tag-remove"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="field-value">
                      {formData.skills.length > 0 ? (
                        <div className="display-tags">
                          {formData.skills.map(skill => (
                            <span key={skill} className="display-tag">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Software Tools</label>
                <div className="field-group">
                  {isEditing ? (
                    <div className="multi-select-container">
                      <MultiSelectDropdown
                        field="softwareTools"
                        value={formData.softwareTools}
                        options={options.softwareTools}
                        placeholder="Select software tools..."
                        onChange={handleMultiSelectChange}
                      />
                      <div className="selected-tags">
                        {formData.softwareTools.map(tool => (
                          <span key={tool} className="tag">
                            {tool}
                            <button
                              type="button"
                              onClick={() => removeFromArray('softwareTools', tool)}
                              className="tag-remove"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="field-value">
                      {formData.softwareTools.length > 0 ? (
                        <div className="display-tags">
                          {formData.softwareTools.map(tool => (
                            <span key={tool} className="display-tag">{tool}</span>
                          ))}
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Hourly Rate</label>
                <div className="field-group">
                  {isEditing ? (
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      placeholder="$90/hr"
                      className="profile-input"
                    />
                  ) : (
                    <div className="field-value">{getDisplayValue(formData.hourlyRate)}</div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Availability</label>
                <div className="field-group">
                  {isEditing ? (
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      placeholder="20Hr/week, Full Time"
                      className="profile-input"
                    />
                  ) : (
                    <div className="field-value">{getDisplayValue(formData.availability)}</div>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <label>Work Model</label>
                <div className="field-group">
                  {isEditing ? (
                    <select
                      name="workModel"
                      value={formData.workModel}
                      onChange={handleChange}
                      className="profile-select"
                    >
                      <option value="">Select work model</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  ) : (
                    <div className="field-value">{getDisplayValue(formData.workModel)}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-card security-settings-card">
              <h3>Security Settings</h3>

              <div className="password-section">
                <h4>Change Password</h4>

                <div className="password-fields">
                  <div className="password-field">
                    <label>Old Password</label>
                    <div>
                      <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        className="profile-input password-input"
                        placeholder="Enter old password"
                      />
                    </div>
                  </div>

                  <div className="password-field">
                    <label>New Password</label>
                    <div>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="profile-input password-input"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div className="password-field">
                    <label>Confirm New Password</label>
                    <div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="profile-input password-input"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className='h-left-button-holder'>
                  <button
                    className="change-password-btn"
                    onClick={handlePasswordChange}
                    type="button"
                  >
                    Change Password
                  </button>
                </div>

              </div>
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button className="cancel-btn" onClick={handleCancel} type="button">
                Cancel
              </button>
            </div>
          )}

          <Notification
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
            onClose={hideNotification}
            duration={notification.duration}
          />
        </div>
      </ContractorDashboardLayout> */}
    </>

  );
};

export default ContractorEditProfile;