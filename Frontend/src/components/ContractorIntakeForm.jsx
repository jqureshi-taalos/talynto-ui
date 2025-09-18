import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';
import signPagePicture from '../assets/sign page picture.png';
import taalosLogo from '../assets/taalos logo.png';
import contractorApplicationService from '../services/contractorApplicationService';
import adminService from '../services/adminService';

const ContractorIntakeForm = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    email: '', // Add email field to initial state
    resumeFile: null,
    linkedinUrl: '',
    industryExperience: [],
    expertise: [],
    profession: [],
    domain: [],
    hourlyRate: '',
    workModel: 'remote',
    certifications: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [configOptions, setConfigOptions] = useState({
    industryExperience: [],
    expertise: [],
    profession: [],
    domain: [],
    certifications: []
  });
  const [configLoading, setConfigLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state or localStorage
  const userEmail = location.state?.email ||
    location.state?.userData?.email ||
    location.state?.userData?.Email ||
    localStorage.getItem('userEmail') || '';

  console.log('ContractorIntakeForm - userEmail from state:', userEmail);
  console.log('ContractorIntakeForm - location.state?.email:', location.state?.email);
  console.log('ContractorIntakeForm - userData.email:', location.state?.userData?.email);
  console.log('ContractorIntakeForm - userData.Email:', location.state?.userData?.Email);

  // Check if we're in editing mode
  const isEditing = location.state?.isEditing || false;
  const userData = location.state?.userData || null;

  useEffect(() => {
    fetchConfigurationOptions();
  }, []);

  useEffect(() => {
    // Pre-populate form if editing
    if (isEditing && userData) {
      console.log('Pre-populating form with user data:', userData);
      console.log('LinkedIn URL debugging:', {
        LinkedUrl: userData.LinkedUrl,
        linkedUrl: userData.linkedUrl,
        LinkedinUrl: userData.LinkedinUrl,
        type_LinkedUrl: typeof userData.LinkedUrl,
        value_LinkedUrl: JSON.stringify(userData.LinkedUrl)
      });
      console.log('Resume debugging:', {
        ResumeFileName: userData.ResumeFileName,
        ResumeContentType: userData.ResumeContentType,
        type_ResumeFileName: typeof userData.ResumeFileName,
        value_ResumeFileName: JSON.stringify(userData.ResumeFileName)
      });

      // Helper function to parse string to array
      const parseToArray = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        return [];
      };

      const linkedinUrlValue = userData.LinkedUrl || userData.linkedUrl || userData.LinkedinUrl || '';
      // Handle existing resume - don't try to create a File object, just track that one exists
      const resumeFileValue = userData.ResumeFileName ? {
        name: userData.ResumeFileName,
        type: userData.ResumeContentType || 'application/pdf',
        isExisting: true,
        existingFileName: userData.ResumeFileName
      } : null;

      console.log('Computed values:', {
        linkedinUrlValue,
        resumeFileValue
      });

      setFormData(prev => ({
        ...prev,
        email: userData.Email || '', // Add email to form data
        linkedinUrl: linkedinUrlValue,
        hourlyRate: userData.HourlyRate ? userData.HourlyRate.toString() : (userData.hourlyRate ? userData.hourlyRate.toString() : ''),
        workModel: userData.WorkModel || userData.workModel || 'remote',
        // Parse contractor application arrays
        industryExperience: parseToArray(userData.IndustryExperience || userData.industryExperience),
        expertise: parseToArray(userData.Expertise || userData.expertise),
        profession: parseToArray(userData.Profession || userData.profession),
        domain: parseToArray(userData.Domain || userData.domain),
        certifications: parseToArray(userData.Certifications || userData.certifications),
        // Handle resume file
        resumeFile: resumeFileValue
      }));

      console.log('Final form data after pre-population - checking specific fields:', {
        email: userData.Email || '',
        linkedinUrl: linkedinUrlValue,
        resumeFile: resumeFileValue
      });
    }
  }, [isEditing, userData]);

  // @checkpoint - Pull Industries
  const fetchConfigurationOptions = async () => {
    try {
      setConfigLoading(true);
      console.log('Fetching configuration options for contractor intake...');

      // Use the new public endpoint for contractor registration
      const options = await adminService.getContractorConfigurationOptions();

      setConfigOptions(options);
      console.log('Loaded contractor configuration options:', options);
    } catch (error) {
      console.error('Error fetching configuration options:', error);
      // Fallback to hardcoded options if API fails
      setConfigOptions({
        industryExperience: ['Healthcare', 'Finance', 'Technology', 'Manufacturing', 'Retail'],
        expertise: ['Financial Analysis', 'Project Management', 'Software Development', 'Data Analysis', 'Marketing'],
        profession: ['Consultant', 'Analyst', 'Manager', 'Developer', 'Specialist'],
        domain: ['Tax & Compliance', 'Audit & Assurance', 'Financial Reporting', 'Risk Management'],
        certifications: ['CPA', 'CFA', 'PMP', 'CISSP', 'AWS Certified']
      });
    } finally {
      setConfigLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // @checkpoint: for industry handling
  const handleMultiSelectChange = (fieldName, selectedValue) => {
    if (!selectedValue) return;

    setFormData(prev => {
      const currentValues = prev[fieldName] || [];
      const displayValue = configOptions[fieldName].find(option =>
        option.toLowerCase().replace(/\s+/g, '-') === selectedValue
      ) || selectedValue;

      if (!currentValues.includes(displayValue)) {
        return {
          ...prev,
          [fieldName]: [...currentValues, displayValue]
        };
      }
      return prev;
    });

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const removeMultiSelectItem = (fieldName, itemToRemove) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter(item => item !== itemToRemove)
    }));
  };

  // @modified method - with resume validation.
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = ['pdf', 'doc', 'docx'];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        setErrors(prev => ({
          ...prev,
          resumeFile: 'Invalid file format. Allowed: PDF, DOC, DOCX'
        }));
        setFormData(prev => ({
          ...prev,
          resumeFile: null
        }));
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      resumeFile: file
    }));
    setErrors(prev => ({ ...prev, resumeFile: '' }));
  };

  // @modified method - with resume validation.
  const validatePage1 = () => {
    const newErrors = {};

    // Resume validation
    if (!formData.resumeFile) {
      newErrors.resumeFile = 'Resume upload is required';
    }

    // LinkedIn validation
    if (!formData.linkedinUrl) {
      newErrors.linkedinUrl = 'LinkedIn URL is required';
    } else {
      const linkedInRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/;
      if (!linkedInRegex.test(formData.linkedinUrl.trim())) {
        newErrors.linkedinUrl = 'Enter valid LinkedIn URL';
      }
    }

    if (!formData.industryExperience || formData.industryExperience.length === 0) {
      newErrors.industryExperience = 'At least one industry experience is required';
    }

    if (!formData.expertise || formData.expertise.length === 0) {
      newErrors.expertise = 'At least one expertise is required';
    }

    if (!formData.profession || formData.profession.length === 0) {
      newErrors.profession = 'At least one profession is required';
    }

    if (!formData.domain || formData.domain.length === 0) {
      newErrors.domain = 'At least one domain is required';
    }

    return newErrors;
  };

  // @modified method - with resume validation.
  const validatePage2 = () => {
    const newErrors = {};

    // Hourly rate validation
    if (!formData.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    } else if (parseFloat(formData.hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Enter valid hourly rate';
    }

    if (!formData.workModel) {
      newErrors.workModel = 'Work model is required';
    }

    if (!formData.certifications || formData.certifications.length === 0) {
      newErrors.certifications = 'At least one certification is required';
    }

    return newErrors;
  };

  const handleNext = () => {
    const formErrors = validatePage1();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setCurrentPage(2);
    setErrors({});
  };

  const handleBack = () => {
    setCurrentPage(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validatePage2();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Map form data to backend DTO format
      const emailToUse = formData.email || userEmail; // Use form email first, fallback to userEmail
      console.log('Email being sent to backend:', emailToUse);
      console.log('Form data email:', formData.email);
      console.log('User email from state:', userEmail);

      const applicationData = {
        Email: emailToUse,
        Profession: Array.isArray(formData.profession) ? formData.profession.join(', ') : formData.profession,
        Domain: Array.isArray(formData.domain) ? formData.domain.join(', ') : formData.domain,
        Expertise: Array.isArray(formData.expertise) ? formData.expertise.join(', ') : formData.expertise,
        HourlyRate: parseFloat(formData.hourlyRate),
        WorkModel: formData.workModel,
        IndustryExperience: Array.isArray(formData.industryExperience) ? formData.industryExperience.join(', ') : formData.industryExperience,
        LinkedUrl: formData.linkedinUrl,
        Certifications: Array.isArray(formData.certifications) ? formData.certifications.join(', ') : formData.certifications
      };

      console.log('Complete application data being sent:', applicationData);

      // Submit application to backend with file
      await contractorApplicationService.submitApplicationWithFile(applicationData, formData.resumeFile);

      // Navigate to success page
      navigate('/profile-submitted-successfully');
    } catch (error) {
      setErrors({
        general: error.message || 'Submission failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-image">
            <img src={signPagePicture} alt="Contractor intake illustration" />
          </div>
          <div className="auth-form-section">
            <div className="auth-header">
              <div className="header-with-logo">
                <img src={taalosLogo} alt="Taalos Logo" className="taalos-logo" />
                <h1>taalos</h1>
              </div>
              <h2>Complete your <strong>Account</strong></h2>
              <p className="tagline">Matches that Matter, For Companies and Careers.</p>
            </div>

            {currentPage === 1 ? (
              <form className="auth-form">
                {errors.general && (
                  <div className="error-message general-error">
                    {errors.general}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="resumeFile">Resume Upload:</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="resumeFile"
                      name="resumeFile"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className={`file-input ${errors.resumeFile ? 'error' : ''}`}
                    />
                    <label htmlFor="resumeFile" className="file-upload-label">
                      <span className="file-upload-icon">📎</span>
                      <span className="file-upload-text">
                        {formData.resumeFile ? formData.resumeFile.name : 'Attach Document'}
                      </span>
                    </label>
                  </div>
                  {errors.resumeFile && (
                    <span className="error-message">{errors.resumeFile}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="linkedinUrl">LinkedIn URL:</label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className={errors.linkedinUrl ? 'error' : ''}
                    placeholder="Enter LinkedIn URL"
                  />
                  {errors.linkedinUrl && (
                    <span className="error-message">{errors.linkedinUrl}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="industryExperience">Industry Experience:</label>
                  <div className="multi-select-wrapper">
                    <select
                      id="industryExperience"
                      name="industryExperience"
                      value=""
                      onChange={(e) => handleMultiSelectChange('industryExperience', e.target.value)}
                      className={errors.industryExperience ? 'error' : ''}
                      disabled={configLoading}
                    >
                      <option value="">{configLoading ? 'Loading...' : 'Select Industry Experience'}</option>
                      {configOptions.industryExperience.map(option => (
                        <option key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>{option}</option>
                      ))}
                    </select>
                    <div className="selected-tags">
                      {formData.industryExperience.map((item, index) => (
                        <span key={index} className="tag">
                          {item}
                          <button type="button" onClick={() => removeMultiSelectItem('industryExperience', item)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {errors.industryExperience && (
                    <span className="error-message">{errors.industryExperience}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="expertise">Expertise:</label>
                  <div className="multi-select-wrapper">
                    <select
                      id="expertise"
                      name="expertise"
                      value=""
                      onChange={(e) => handleMultiSelectChange('expertise', e.target.value)}
                      className={errors.expertise ? 'error' : ''}
                      disabled={configLoading}
                    >
                      <option value="">{configLoading ? 'Loading...' : 'Select Expertise'}</option>
                      {configOptions.expertise.map(option => (
                        <option key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>{option}</option>
                      ))}
                    </select>
                    <div className="selected-tags">
                      {formData.expertise.map((item, index) => (
                        <span key={index} className="tag">
                          {item}
                          <button type="button" onClick={() => removeMultiSelectItem('expertise', item)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {errors.expertise && (
                    <span className="error-message">{errors.expertise}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="profession">Profession:</label>
                  <div className="multi-select-wrapper">
                    <select
                      id="profession"
                      name="profession"
                      value=""
                      onChange={(e) => handleMultiSelectChange('profession', e.target.value)}
                      className={errors.profession ? 'error' : ''}
                      disabled={configLoading}
                    >
                      <option value="">{configLoading ? 'Loading...' : 'Select Profession'}</option>
                      {configOptions.profession.map(option => (
                        <option key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>{option}</option>
                      ))}
                    </select>
                    <div className="selected-tags">
                      {formData.profession.map((item, index) => (
                        <span key={index} className="tag">
                          {item}
                          <button type="button" onClick={() => removeMultiSelectItem('profession', item)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {errors.profession && (
                    <span className="error-message">{errors.profession}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="domain">Domain:</label>
                  <div className="multi-select-wrapper">
                    <select
                      id="domain"
                      name="domain"
                      value=""
                      onChange={(e) => handleMultiSelectChange('domain', e.target.value)}
                      className={errors.domain ? 'error' : ''}
                      disabled={configLoading}
                    >
                      <option value="">{configLoading ? 'Loading...' : 'Select Domain'}</option>
                      {configOptions.domain.map(option => (
                        <option key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>{option}</option>
                      ))}
                    </select>
                    <div className="selected-tags">
                      {formData.domain.map((item, index) => (
                        <span key={index} className="tag">
                          {item}
                          <button type="button" onClick={() => removeMultiSelectItem('domain', item)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {errors.domain && (
                    <span className="error-message">{errors.domain}</span>
                  )}
                </div>

                <div className='form-group'>Page 1 of 2</div>

                <button
                  type="button"
                  className="auth-button"
                  onClick={handleNext}
                >
                  Next →
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="back-link">
                  <button type="button" onClick={handleBack} className="back-button">
                    ← Back
                  </button>
                </div>

                {errors.general && (
                  <div className="error-message general-error">
                    {errors.general}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="hourlyRate">Hourly Rate</label>
                  <label htmlFor='preferredHourlyRate'>Preferred Hourly Rate:</label>
                  <div className="hourly-rate-section">
                    <div className="rate-input">
                      <span className="currency"></span>
                      <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className={errors.hourlyRate ? 'error' : ''}
                        placeholder='$'
                      />
                    </div>
                  </div>
                  {errors.hourlyRate && (
                    <span className="error-message">{errors.hourlyRate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Work Model</label>
                  <div className="radio-group work-model">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="workModel"
                        value="remote"
                        checked={formData.workModel === 'remote'}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      Remote
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="workModel"
                        value="on-site"
                        checked={formData.workModel === 'on-site'}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      On-Site
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="workModel"
                        value="hybrid"
                        checked={formData.workModel === 'hybrid'}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      Hybrid
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="certifications">Certifications</label>
                  <div className="certifications-section">
                    <div className="multi-select-wrapper">
                      <select
                        id="certifications"
                        name="certifications"
                        value=""
                        onChange={(e) => handleMultiSelectChange('certifications', e.target.value)}
                        className={errors.certifications ? 'error' : ''}
                        disabled={configLoading}
                      >
                        <option value="">{configLoading ? 'Loading...' : 'Select Certification'}</option>
                        {configOptions.certifications.map(option => (
                          <option key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>{option}</option>
                        ))}
                      </select>
                      <div className="selected-tags">
                        {formData.certifications.map((item, index) => (
                          <span key={index} className="tag">
                            {item}
                            <button type="button" onClick={() => removeMultiSelectItem('certifications', item)}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.certifications && (
                    <span className="error-message">{errors.certifications}</span>
                  )}
                </div>

                <div className='form-group'>Page 2 of 2</div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorIntakeForm;