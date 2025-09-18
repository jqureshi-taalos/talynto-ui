import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import ContractorDashboardLayout from './ContractorDashboardLayout';
import authService from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import Notification from './Notification';
import notificationService from '../services/notificationService';
import RightArrowIcon from './RightArrowIcon';
import BackLinkIcon from './BackLinkIcon';

const ContractorSubmitNewInvoice = () => {
  const [formData, setFormData] = useState({
    projectId: '',
    startDate: '',
    endDate: '',
    hoursWorked: '',
    ratePerHour: ''
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Helper function to parse billing period string like "JULY 1 - JULY 15, 2025"
  const parseBillingPeriod = (billingPeriod) => {
    try {
      if (!billingPeriod || typeof billingPeriod !== 'string') {
        return { startDate: '', endDate: '' };
      }

      // Handle formats like "JULY 1 - JULY 15, 2025" or "Jul 01 - Jul 15, 2025"
      const periodRegex = /(\w+)\s+(\d+)\s*-\s*(\w+)\s+(\d+),\s*(\d{4})/i;
      const match = billingPeriod.match(periodRegex);

      if (match) {
        const [, startMonth, startDay, endMonth, endDay, year] = match;

        // Create date objects
        const startDate = new Date(`${startMonth} ${startDay}, ${year}`);
        const endDate = new Date(`${endMonth} ${endDay}, ${year}`);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          return {
            startDate: formatDateForInput(startDate),
            endDate: formatDateForInput(endDate)
          };
        }
      }

      console.warn('Could not parse billing period:', billingPeriod);
      return { startDate: '', endDate: '' };
    } catch (error) {
      console.error('Error parsing billing period:', error);
      return { startDate: '', endDate: '' };
    }
  };

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  // Handle pre-population and data loading after projects are fetched
  useEffect(() => {
    if (projects.length === 0) return; // Wait for projects to be loaded

    if (location.state?.prePopulateData) {
      const { projectId, ratePerHour, startDate, endDate } = location.state.prePopulateData;
      setFormData(prevData => ({
        ...prevData,
        projectId: projectId || '',
        ratePerHour: ratePerHour || '',
        startDate: startDate || '',
        endDate: endDate || ''
      }));
    }

    // Handle resubmit invoice scenario
    if (location.state?.resubmit && location.state?.invoiceData) {
      const invoice = location.state.invoiceData;
      console.log('Resubmit invoice data:', invoice); // Debug log

      // Now that ProjectId is included in the API response, we can use it directly
      let projectId = invoice.projectId || invoice.ProjectId || '';

      // If projectId is still not available, try to find by name as fallback
      if (!projectId && (invoice.projectName || invoice.ProjectName)) {
        const projectName = invoice.projectName || invoice.ProjectName;
        console.log('Looking for project by name:', projectName); // Debug log
        console.log('Available projects:', projects.map(p => ({ id: p.id || p.Id, name: p.name || p.Name }))); // Debug log
        const matchingProject = projects.find(p =>
          (p.name || p.Name) === projectName
        );
        projectId = matchingProject ? (matchingProject.id || matchingProject.Id) : '';
        console.log('Found matching project ID:', projectId); // Debug log
      }

      setFormData(prevData => ({
        ...prevData,
        projectId: projectId.toString(),
        startDate: formatDateForInput(invoice.billingPeriodStart || invoice.BillingPeriodStart || invoice.startDate || invoice.StartDate),
        endDate: formatDateForInput(invoice.billingPeriodEnd || invoice.BillingPeriodEnd || invoice.endDate || invoice.EndDate),
        hoursWorked: (invoice.hoursWorked || invoice.HoursWorked || '').toString(),
        ratePerHour: (invoice.hourlyRate || invoice.HourlyRate || invoice.ratePerHour || '').toString().replace('$', '')
      }));
    }

    // Handle edit mode scenario (from View -> Edit Invoice)
    if (location.state?.editMode && location.state?.invoiceData) {
      const invoice = location.state.invoiceData;
      console.log('Edit mode invoice data:', invoice); // Debug log
      console.log('Invoice keys:', Object.keys(invoice)); // Debug log

      // For edit mode, InvoiceDetailDto has nested Project object and string-formatted values
      let projectId = '';
      if (invoice.project?.id) {
        projectId = invoice.project.id;
      } else if (invoice.Project?.Id) {
        projectId = invoice.Project.Id;
      } else if (invoice.projectId || invoice.ProjectId) {
        projectId = invoice.projectId || invoice.ProjectId;
      }

      // Parse hours worked - InvoiceDetailDto returns it as a string like "40.00 hours"
      let hoursWorked = '';
      if (invoice.hoursWorked) {
        hoursWorked = invoice.hoursWorked.toString().replace(' hours', '').replace(' hrs', '');
      } else if (invoice.HoursWorked) {
        hoursWorked = invoice.HoursWorked.toString();
      }

      // Parse rate per hour - InvoiceDetailDto returns it as a string like "$25.00/hr"
      let ratePerHour = '';
      if (invoice.ratePerHour) {
        ratePerHour = invoice.ratePerHour.toString().replace('$', '').replace('/hr', '').replace('/hour', '');
      } else if (invoice.RatePerHour) {
        ratePerHour = invoice.RatePerHour.toString().replace('$', '').replace('/hr', '').replace('/hour', '');
      } else if (invoice.hourlyRate) {
        ratePerHour = invoice.hourlyRate.toString();
      } else if (invoice.HourlyRate) {
        ratePerHour = invoice.HourlyRate.toString();
      }

      // Handle dates - prioritize backend InvoiceDetailDto fields first, then other fallbacks
      let startDate = formatDateForInput(invoice.BillingPeriodStart || invoice.billingPeriodStart || invoice.startDate || invoice.StartDate);
      let endDate = formatDateForInput(invoice.BillingPeriodEnd || invoice.billingPeriodEnd || invoice.endDate || invoice.EndDate);

      // If we don't have individual dates, try to parse from billingPeriod
      if (!startDate && !endDate && invoice.billingPeriod) {
        console.log('Parsing dates from billingPeriod:', invoice.billingPeriod);
        const parsedDates = parseBillingPeriod(invoice.billingPeriod);
        startDate = parsedDates.startDate;
        endDate = parsedDates.endDate;
      }

      setFormData(prevData => ({
        ...prevData,
        projectId: projectId.toString(),
        startDate: startDate,
        endDate: endDate,
        hoursWorked: hoursWorked,
        ratePerHour: ratePerHour
      }));
    }
  }, [location.state, projects]);

  const fetchAssignedProjects = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

      const response = await fetch(`${API_BASE_URL}/project/contractor/assigned`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched projects data:', data); // Debug log
        if (data.length > 0) {
          console.log('First project structure:', JSON.stringify(data[0], null, 2)); // Debug log
          console.log('Available fields in first project:', Object.keys(data[0])); // Debug log
        }
        setProjects(data);
      } else {
        showError('Failed to fetch assigned projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      showError('Error fetching assigned projects');

      // Fallback to mock data in development for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback mock data for submit invoice due to API error');
        setProjects([
          {
            id: 1,
            name: 'Q3 Financial Audit',
            hourlyRate: 75,
            client: { name: 'David White' }
          },
          {
            id: 2,
            name: 'Year-End Tax Review',
            hourlyRate: 85,
            client: { name: 'Shawn Brown' }
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectRate = async (projectId) => {
    try {
      // Try to get rate from a more detailed project endpoint
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
      const response = await fetch(`${API_BASE_URL}/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const projectDetails = await response.json();
        console.log('Detailed project data:', projectDetails); // Debug log

        // Check for rate in detailed project data
        const possibleRateFields = [
          'hourlyRate', 'HourlyRate', 'rate', 'Rate', 'ratePerHour', 'RatePerHour',
          'budget', 'Budget', 'contractorRate', 'ContractorRate', 'clientRate', 'ClientRate',
          'payRate', 'PayRate', 'billRate', 'BillRate', 'projectRate', 'ProjectRate'
        ];

        for (const field of possibleRateFields) {
          if (projectDetails && projectDetails[field] !== undefined && projectDetails[field] !== null && projectDetails[field] !== '') {
            const rate = typeof projectDetails[field] === 'string' ?
              projectDetails[field].replace('$', '').replace('/Hr', '').replace('/hr', '').trim() :
              projectDetails[field].toString();
            console.log(`Found rate ${rate} in detailed project field: ${field}`);
            return rate;
          }
        }
      }

      console.log('No rate found in detailed project endpoint');
      return '';
    } catch (error) {
      console.error('Error fetching project details:', error);
      return '';
    }
  };

  const handleInputChange = async (field, value) => {
    if (field === 'projectId') {
      // When project is selected, try multiple approaches to get the hourly rate
      const selectedProject = projects.find(project => project.id === parseInt(value));
      console.log('Selected project:', selectedProject); // Debug log
      console.log('All available project fields:', Object.keys(selectedProject || {})); // Debug log

      // First, try to get rate from the project list data
      const possibleRateFields = [
        'hourlyRate', 'HourlyRate', 'rate', 'Rate', 'ratePerHour', 'RatePerHour',
        'budget', 'Budget', 'contractorRate', 'ContractorRate', 'clientRate', 'ClientRate',
        'payRate', 'PayRate', 'billRate', 'BillRate', 'projectRate', 'ProjectRate'
      ];

      let hourlyRate = '';
      let foundField = '';

      for (const fieldName of possibleRateFields) {
        if (selectedProject && selectedProject[fieldName] !== undefined && selectedProject[fieldName] !== null && selectedProject[fieldName] !== '') {
          hourlyRate = selectedProject[fieldName];
          foundField = fieldName;
          break;
        }
      }

      console.log(`Found hourly rate: ${hourlyRate} in field: ${foundField}`); // Debug log

      // If no rate found in project list, try detailed project endpoint
      if (!hourlyRate && value) {
        console.log('No rate in project list, trying detailed project endpoint...');
        hourlyRate = await fetchProjectRate(parseInt(value));
      }

      let cleanRate = '';
      if (hourlyRate) {
        cleanRate = typeof hourlyRate === 'string' ?
          hourlyRate.replace('$', '').replace('/Hr', '').replace('/hr', '').trim() :
          hourlyRate.toString();
      }

      console.log('Final clean rate:', cleanRate); // Debug log

      setFormData(prev => ({
        ...prev,
        projectId: value,
        ratePerHour: cleanRate
      }));
    } else if (field === "startDate") {
      setFormData((prev) => {
        const newStartDate = value
        let newEndDate = prev.endDate

        // If end date is set and is before or equal to the new start date, clear it
        if (newEndDate && newStartDate && new Date(newEndDate) <= new Date(newStartDate)) {
          newEndDate = ""
        }

        return {
          ...prev,
          startDate: newStartDate,
          endDate: newEndDate,
        }
      })
    } else if (field !== "ratePerHour") {
      // Don't allow changing ratePerHour - it should only be set by project selection
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  };

  const getEndDateMin = () => {
    const today = new Date().toISOString().split("T")[0]

    if (formData.startDate) {
      // If start date is selected, end date should be after start date
      const dayAfterStart = new Date(formData.startDate)
      dayAfterStart.setDate(dayAfterStart.getDate() + 1)
      const dayAfterStartString = dayAfterStart.toISOString().split("T")[0]

      // Return the later of tomorrow or day after start date
      return dayAfterStartString > today
        ? dayAfterStartString
        : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    } else {
      // If no start date selected, end date should be after today
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      return tomorrow.toISOString().split("T")[0]
    }
  }

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.startDate || !formData.endDate || !formData.hoursWorked) {
      showError('Please fill in all required fields');
      return;
    }

    if (!formData.ratePerHour) {
      showError('Hourly rate not found for selected project. Please contact the client to set the project rate.');
      return;
    }

    if (parseFloat(formData.hoursWorked) <= 0) {
      showError('Hours worked must be greater than 0');
      return;
    }

    if (parseFloat(formData.ratePerHour) <= 0) {
      showError('Rate per hour must be greater than 0');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      showError('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

      // If we are resubmitting a rejected invoice, call update endpoint to preserve Invoice ID
      const isResubmit = !!(location.state?.resubmit && location.state?.invoiceData?.id);
      const endpoint = isResubmit
        ? `${API_BASE_URL}/invoice/${location.state.invoiceData.id}`
        : `${API_BASE_URL}/invoice`;
      const method = isResubmit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isResubmit ? {
          hoursWorked: parseFloat(formData.hoursWorked),
          hourlyRate: parseFloat(formData.ratePerHour),
          billingPeriodStart: formData.startDate,
          billingPeriodEnd: formData.endDate,
          description: ''
        } : {
          projectId: parseInt(formData.projectId),
          hoursWorked: parseFloat(formData.hoursWorked),
          hourlyRate: parseFloat(formData.ratePerHour),
          billingPeriodStart: formData.startDate,
          billingPeriodEnd: formData.endDate,
          description: ''
        })
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(isResubmit ? 'Invoice resubmitted successfully!' : 'Invoice submitted successfully!');

        // Find project name for notification
        const selectedProject = projects.find(p => p.id === parseInt(formData.projectId));
        const projectName = selectedProject ? selectedProject.name : 'Unknown Project';

        // Create notification for invoice submission
        await notificationService.notifyInvoiceSubmitted(projectName);

        setTimeout(() => {
          navigate('/contractor-invoices');
        }, 1500);
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to submit invoice');
      }
    } catch (error) {
      console.error('Error submitting invoice:', error);
      showError('Error submitting invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Check if we came from contractor-projects page via Request Invoice
    if (location.state?.prePopulateData) {
      navigate('/contractor-projects');
    } else {
      navigate('/contractor-invoices');
    }
  };

  const calculateSubtotal = () => {
    if (formData.hoursWorked && formData.ratePerHour) {
      return (parseFloat(formData.hoursWorked) * parseFloat(formData.ratePerHour)).toFixed(0);
    }
    return '0';
  };

  const calculateTaalosFee = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * 0.30).toFixed(0);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const taalosFee = parseFloat(calculateTaalosFee());
    return (subtotal - taalosFee).toFixed(0);
  };

  if (loading) {
    return (
      <ContractorDashboardLayout>
        <div className="loading-container">
          <div className="loading-spinner">Loading projects...</div>
        </div>
      </ContractorDashboardLayout>
    );
  }

  return (
    <ContractorDashboardLayout>
      <div className="submit-invoice-page">
        <div className="submit-invoice-header">
          <h1>Submit New <strong>Invoice</strong></h1>
        </div>

        <div className="invoice-form-layout">
          {/* Left Column - Form Fields */}
          <div className="form-left-column">
            {/* Row 1: Select Project and Hours Worked */}
            <div className="form-row-dual">
              <div className="form-group">
                <label htmlFor="project">Select Project:</label>
                <div className="select-wrapper">
                  <select
                    id="project"
                    value={formData.projectId}
                    onChange={(e) => handleInputChange('projectId', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="hoursWorked">Hours Worked:</label>
                <input
                  type="number"
                  id="hoursWorked"
                  placeholder="Enter Hours"
                  value={formData.hoursWorked}
                  onChange={(e) => handleInputChange('hoursWorked', e.target.value)}
                  className="form-input"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            {/* Row 2: Start Date and End Date */}
            <div className="form-row-dual">
              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <div className="select-wrapper">
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="form-input date-input calendar-input"
                    min={new Date().toISOString().split('T')[0]}
                    disabled
                    required
                  />
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <div className="select-wrapper">
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="form-input date-input calendar-input"
                    min={getEndDateMin()}
                    disabled
                    required
                  />
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>
            </div>

            {/* Row 3: Rate Per Hour */}
            <div className="form-row-single">
              <div className="form-group">
                <label htmlFor="ratePerHour">
                  Rate Per Hour:
                  {formData.ratePerHour && formData.projectId && (
                    <span style={{ color: '#28a745', fontSize: '12px', marginLeft: '8px' }}>
                      ✓ Set by client
                    </span>
                  )}
                  {formData.projectId && !formData.ratePerHour && (
                    <span style={{ color: '#dc3545', fontSize: '12px', marginLeft: '8px' }}>
                      ⚠ Rate not found - contact client
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="ratePerHour"
                  placeholder="Rate will be populated when you select a project"
                  value={formData.ratePerHour}
                  className="form-input"
                  min="0"
                  step="0.01"
                  readOnly
                  style={{
                    backgroundColor: '#f8f9fa',
                    cursor: 'not-allowed',
                    borderColor: formData.ratePerHour && formData.projectId ? '#28a745' :
                      formData.projectId && !formData.ratePerHour ? '#dc3545' : undefined,
                  }}
                />
                <small className="help-text" style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  This rate is set by the client and cannot be modified
                </small>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="form-right-column">
            <div className="invoice-summary-box">
              <h3>Summary:</h3>

              <div className="summary-table-simple">
                <div className="summary-row-header">
                  <div className="summary-cell">Rate</div>
                  <div className="summary-cell">Hrs Worked</div>
                  <div className="summary-cell">Total</div>
                </div>

                <div className="summary-row-data">
                  <div className="summary-cell">${formData.ratePerHour || '0'}/Hr</div>
                  <div className="summary-cell">{formData.hoursWorked || '0'}</div>
                  <div className="summary-cell">${calculateSubtotal()}</div>
                </div>

                <div className="summary-row-fee">
                  <div className="summary-cell-wide">Taalos Fee (30%)</div>
                  <div className="summary-cell">${calculateTaalosFee()}</div>
                </div>

                <div className="summary-row-total">
                  <div className="summary-cell-wide"><strong>Total</strong></div>
                  <div className="summary-cell"><strong>${calculateTotal()}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="invoice-form-actions">
          <button
            className="cancel-btn-invoice"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <BackLinkIcon /> Cancel
          </button>
          <button
            className="generate-invoice-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Generating...' : <>
              Generate Invoice <RightArrowIcon />
            </>}
          </button>
        </div>

        {/* Toast Notification */}
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideNotification}
          duration={notification.duration}
        />
      </div>
    </ContractorDashboardLayout>
  );
};

export default ContractorSubmitNewInvoice;