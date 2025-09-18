import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

const ClientCreateProjectDashboard = () => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    expertiseRequired: '',
    certificationsNeeded: '',
    softwareTools: '',
    startDate: '',
    endDate: '',
    hourlyRate: '',
    country: '',
    state: '',
    workModel: 'remote',
    projectDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!formData.projectTitle) newErrors.projectTitle = 'Project title is required';
    if (!formData.expertiseRequired) newErrors.expertiseRequired = 'Expertise is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required';
    if (!formData.projectDescription) newErrors.projectDescription = 'Project description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const token = authService.getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Create project data object matching the API expected format
      const projectData = {
        name: formData.projectTitle,
        type: formData.expertiseRequired,
        tool: formData.softwareTools,
        estimatedHours: 40, // Default estimated hours
        status: 'Draft',
        color: '#4EC1EF',
        description: formData.projectDescription,
        budget: parseFloat(formData.hourlyRate) * 40, // Calculate budget based on hourly rate
        startDate: formData.startDate,
        endDate: formData.endDate,
        assignedContractorId: null
      };

      const response = await fetch(`${API_BASE_URL}/project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        // Navigate back to client dashboard projects page
        navigate('/client-dashboard/projects');
      } else if (response.status === 401) {
        authService.logout();
        navigate('/login');
      } else {
        const errorData = await response.json();
        setErrors({
          general: errorData.message || 'Project creation failed. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        general: error.message || 'Project creation failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/client-dashboard/projects');
  };

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Create <strong>New Project</strong></h1>
      </div>
      
      <div className="create-project-content">
        <form onSubmit={handleSubmit} className="create-project-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="projectTitle">Project Title:</label>
                <input
                  type="text"
                  id="projectTitle"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleChange}
                  className={errors.projectTitle ? 'error' : ''}
                  placeholder="Enter project title"
                />
                {errors.projectTitle && (
                  <span className="error-message">{errors.projectTitle}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="expertiseRequired">Expertise Required:</label>
                <select
                  id="expertiseRequired"
                  name="expertiseRequired"
                  value={formData.expertiseRequired}
                  onChange={handleChange}
                  className={errors.expertiseRequired ? 'error' : ''}
                >
                  <option value="">Select expertise</option>
                  <option value="Financial Accounting">Financial Accounting</option>
                  <option value="Management Accounting">Management Accounting</option>
                  <option value="Tax Accounting">Tax Accounting</option>
                  <option value="Audit & Assurance">Audit & Assurance</option>
                  <option value="Bookkeeping">Bookkeeping</option>
                  <option value="Payroll Management">Payroll Management</option>
                  <option value="Financial Analysis">Financial Analysis</option>
                  <option value="Budget Planning">Budget Planning</option>
                  <option value="Cost Accounting">Cost Accounting</option>
                  <option value="Financial Consulting">Financial Consulting</option>
                  <option value="Forensic Accounting">Forensic Accounting</option>
                  <option value="Financial Planning">Financial Planning</option>
                  <option value="Investment Analysis">Investment Analysis</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Compliance & Regulatory">Compliance & Regulatory</option>
                </select>
                {errors.expertiseRequired && (
                  <span className="error-message">{errors.expertiseRequired}</span>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="certificationsNeeded">Certifications Needed:</label>
                <select
                  id="certificationsNeeded"
                  name="certificationsNeeded"
                  value={formData.certificationsNeeded}
                  onChange={handleChange}
                >
                  <option value="">Select certification</option>
                  <option value="CPA (Certified Public Accountant)">CPA (Certified Public Accountant)</option>
                  <option value="CMA (Certified Management Accountant)">CMA (Certified Management Accountant)</option>
                  <option value="CIA (Certified Internal Auditor)">CIA (Certified Internal Auditor)</option>
                  <option value="CFA (Chartered Financial Analyst)">CFA (Chartered Financial Analyst)</option>
                  <option value="ACCA (Association of Chartered Certified Accountants)">ACCA</option>
                  <option value="CFP (Certified Financial Planner)">CFP (Certified Financial Planner)</option>
                  <option value="FRM (Financial Risk Manager)">FRM (Financial Risk Manager)</option>
                  <option value="EA (Enrolled Agent)">EA (Enrolled Agent)</option>
                  <option value="QuickBooks ProAdvisor">QuickBooks ProAdvisor</option>
                  <option value="Xero Certified Advisor">Xero Certified Advisor</option>
                  <option value="No specific certification required">No specific certification required</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? 'error' : ''}
                />
                {errors.startDate && (
                  <span className="error-message">{errors.startDate}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'error' : ''}
                />
                {errors.endDate && (
                  <span className="error-message">{errors.endDate}</span>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hourlyRate">Hourly Rate ($):</label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className={errors.hourlyRate ? 'error' : ''}
                  placeholder="Enter hourly rate"
                  min="0"
                  step="0.01"
                />
                {errors.hourlyRate && (
                  <span className="error-message">{errors.hourlyRate}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="softwareTools">Software Tools:</label>
                <input
                  type="text"
                  id="softwareTools"
                  name="softwareTools"
                  value={formData.softwareTools}
                  onChange={handleChange}
                  placeholder="e.g., QuickBooks, Xero, SAP, Excel, Sage"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="projectDescription">Project Description:</label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  className={errors.projectDescription ? 'error' : ''}
                  placeholder="Describe your project requirements..."
                  rows="4"
                />
                {errors.projectDescription && (
                  <span className="error-message">{errors.projectDescription}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-project-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientCreateProjectDashboard;