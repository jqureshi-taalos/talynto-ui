import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import authService from '../services/authService';
import './Dashboard.css';

const ClientEditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

  const [formData, setFormData] = useState({
    projectTitle: '',
    expertiseRequired: [],
    certificationsNeeded: [],
    softwareTools: [],
    projectType: '',
    startDate: '',
    endDate: '',
    hourlyRate: '',
    country: '',
    state: '',
    workModel: 'remote',
    projectDescription: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetchCountries();
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    } else {
      setStates([]);
    }
  }, [formData.country]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
      const data = await response.json();
      let countryNames = data.map(country => country.name.common).sort();

      // @topCountryUS - Move priority countries to top
      const priorityCountries = ['United States', 'United States Minor Outlying Islands', 'United States Virgin Islands',];
      countryNames = countryNames.filter((country) => !priorityCountries.includes(country));
      countryNames = [...priorityCountries, ...countryNames];
      setCountries(countryNames);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries(['USA', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'India']);
    }
  };

  const fetchStates = async (countryName) => {
    try {
      // First try to get country ISO code
      const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,cca2`);
      const countryData = await countryResponse.json();
      const countryCode = countryData[0]?.cca2;

      if (countryCode) {
        // Use Countries States Cities API
        const statesResponse = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
          headers: {
            'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
          }
        });

        if (statesResponse.ok) {
          const statesData = await statesResponse.json();
          const stateNames = statesData.map(state => state.name).sort();
          setStates(stateNames.length > 0 ? stateNames : ['Not Available']);
        } else {
          setStates(getDefaultStates(countryName));
        }
      } else {
        setStates(getDefaultStates(countryName));
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates(getDefaultStates(countryName));
    }
  };

  const getDefaultStates = (countryName) => {
    const defaultStates = {
      'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
      'USA': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
      'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
      'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory', 'Northern Territory'],
      'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
      'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
      'UK': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
      'Germany': ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'],
      'France': ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire', 'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'],
      'Mexico': ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
      'Brazil': ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'],
      'Nigeria': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT']
    };

    // Try exact match first, then try case-insensitive match
    if (defaultStates[countryName]) {
      return defaultStates[countryName];
    }

    // Case-insensitive search
    const lowerCountryName = countryName.toLowerCase();
    for (const [key, value] of Object.entries(defaultStates)) {
      if (key.toLowerCase() === lowerCountryName) {
        return value;
      }
    }

    return ['Not Available'];
  };

  const fetchProjectData = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Project data from backend:', data); // Debug log
        console.log('Work model from backend:', data.workModel); // Debug work model

        // Format dates properly for input fields
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          } catch (error) {
            console.warn('Invalid date format:', dateString);
            return '';
          }
        };

        // Calculate hourly rate from budget if needed
        const hourlyRate = data.hourlyRate ||
          (data.budget && data.estimatedHours ? (data.budget / data.estimatedHours).toString() : '');

        setFormData({
          projectTitle: data.name || '',
          expertiseRequired: data.type ? data.type.split(',').map(s => s.trim()).filter(s => s) : [],
          certificationsNeeded: data.certifications ? data.certifications.split(',').map(s => s.trim()).filter(s => s) : [],
          softwareTools: data.tool ? data.tool.split(',').map(s => s.trim()).filter(s => s) : [],
          projectType: data.projectType || '',
          startDate: formatDateForInput(data.startDate),
          endDate: formatDateForInput(data.endDate),
          hourlyRate: hourlyRate,
          country: data.country || '',
          state: data.state || '',
          workModel: data.workModel?.toLowerCase() || 'remote',
          projectDescription: data.description || ''
        });

        console.log('Form data after setting:', {
          workModel: data.workModel?.toLowerCase() || 'remote'
        });
      } else {
        setError('Failed to fetch project data');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset state when country changes
      ...(name === 'country' && { state: '' })
    }));
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = authService.getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const projectData = {
        name: formData.projectTitle,
        type: formData.expertiseRequired.join(', '),
        tool: formData.softwareTools.join(', '),
        projectType: formData.projectType,
        certifications: formData.certificationsNeeded.join(', '),
        startDate: formData.startDate,
        endDate: formData.endDate,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        country: formData.country,
        state: formData.state,
        workModel: formData.workModel,
        description: formData.projectDescription
      };

      console.log('Sending project data:', projectData); // Debug log

      const response = await fetch(`${API_BASE_URL}/project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        navigate(`/client-view-project/${projectId}`);
      } else {
        const errorText = await response.text();
        console.error('Update failed:', response.status, errorText);
        let errorMessage = 'Failed to update project';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use the text directly
          errorMessage = errorText || errorMessage;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/client-view-project/${projectId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading">Loading project data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="projects-container">
        <div className="create-project-container">
          <div className="create-project-header">
            <h1>Edit <strong>Project</strong></h1>
            <div className="project-id-section">
              <span className="project-id-label">Project ID: {projectId} (System Generated)</span>
            </div>
          </div>

          {error && (
            <div className="error-message general-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-project-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="projectTitle">Project Title:</label>
                <input
                  type="text"
                  id="projectTitle"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="expertiseRequired">Expertise Required:</label>
                <div className="multi-select-container">
                  <div className="multi-select-dropdown">
                    <div className="selected-items">
                      {formData.expertiseRequired.map(item => (
                        <span key={item} className="selected-item">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleMultiSelectChange('expertiseRequired', item)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMultiSelectChange('expertiseRequired', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Select Expertise</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Technology">Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="certificationsNeeded">Certifications Needed:</label>
                <div className="multi-select-container">
                  <div className="multi-select-dropdown">
                    <div className="selected-items">
                      {formData.certificationsNeeded.map(item => (
                        <span key={item} className="selected-item">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleMultiSelectChange('certificationsNeeded', item)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMultiSelectChange('certificationsNeeded', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Select Certifications</option>
                      <option value="CPA">CPA</option>
                      <option value="CFA">CFA</option>
                      <option value="CIA">CIA</option>
                      <option value="CISA">CISA</option>
                      <option value="PMP">PMP</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="softwareTools">Software Tools:</label>
                <div className="multi-select-container">
                  <div className="multi-select-dropdown">
                    <div className="selected-items">
                      {formData.softwareTools.map(item => (
                        <span key={item} className="selected-item">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleMultiSelectChange('softwareTools', item)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMultiSelectChange('softwareTools', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Select Software Tools</option>
                      <option value="QuickBooks">QuickBooks</option>
                      <option value="Xero">Xero</option>
                      <option value="SAP">SAP</option>
                      <option value="Excel">Microsoft Excel</option>
                      <option value="Tableau">Tableau</option>
                      <option value="Power BI">Power BI</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="hourlyRate">Hourly Rate:</label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  placeholder="Enter hourly rate"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">Country:</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="state">State:</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!formData.country}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="workModel">Work Model:</label>
                <div className="work-model-radio">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="workModel"
                      value="remote"
                      checked={formData.workModel === 'remote'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-custom"></span>
                    Remote
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="workModel"
                      value="hybrid"
                      checked={formData.workModel === 'hybrid'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-custom"></span>
                    Hybrid
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="workModel"
                      value="on-site"
                      checked={formData.workModel === 'on-site'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-custom"></span>
                    On-site
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="projectDescription">Project Description:</label>
              <textarea
                id="projectDescription"
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleInputChange}
                placeholder="We're preparing for our upcoming Q3 financial audit and need support with pre-audit documentation and reconciliation tasks..."
                rows="6"
              />
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Project →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientEditProject;