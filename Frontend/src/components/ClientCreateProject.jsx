import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import adminService from '../services/adminService';
import './Dashboard.css';
import DashboardLayout from './DashboardLayout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const ClientCreateProject = () => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    expertiseRequired: [],
    certificationsNeeded: [],
    softwareTools: [],
    projectType: '',
    startDate: '',
    endDate: '',
    hourlyRate: '',
    hoursPerWeek: '',
    country: '',
    state: '',
    workModel: 'remote',
    projectDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  // Dynamic configuration options
  const [configOptions, setConfigOptions] = useState({
    expertise: [],
    certifications: [],
    softwareTools: [],
    projectTypes: []
  });
  const [configLoading, setConfigLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCountries();
    fetchConfigurationOptions();
  }, []);

  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    } else {
      setStates([]);
      setFormData(prev => ({ ...prev, state: '' }));
    }
  }, [formData.country]);

  const fetchConfigurationOptions = async () => {
    try {
      setConfigLoading(true);
      console.log('Fetching configuration options from project endpoint...');

      const options = await adminService.getProjectConfigurationOptions();

      console.log('Raw options from public API:', options);

      setConfigOptions({
        expertise: options.expertise || [],
        certifications: options.certifications || [],
        softwareTools: options.softwareTools || [],
        projectTypes: options.projectTypes || []
      });

      console.log('Loaded configuration options:', options);
    } catch (error) {
      console.error('Error fetching configuration options:', error);
      // Fallback to hardcoded options if API fails
      setConfigOptions({
        expertise: ['Financial Analysis', 'Audit & Compliance', 'Tax Planning', 'Risk Management', 'Project Management'],
        certifications: ['CPA', 'CFA', 'CIA', 'CISA', 'PMP'],
        softwareTools: ['Microsoft Excel', 'QuickBooks', 'SAP', 'Tableau', 'Power BI'],
        projectTypes: ['BI Development', 'BI Engineering', 'Project Management BI', 'Data Science']
      });
    } finally {
      setConfigLoading(false);
    }
  };

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
      setCountries(['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'India']);
    }
  };

  const fetchStates = async (countryName) => {
    try {
      console.log("@shayan", countryName)
      // First try to get country ISO code
      const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,cca2`);
      const countryData = await countryResponse.json();
      const countryCode = countryData[0]?.cca2;

      if (countryCode) {
        // Use Countries States Cities API
        const statesResponse = await fetch(`https://api.countrystatecity.in/v1/countries/${countryName}/states`, {
          headers: {
            'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
          }
        });

        if (statesResponse.ok) {
          const statesData = await statesResponse.json();
          console.log("@shayan", statesData);
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

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "startDate") {
      const newFormData = {
        ...formData,
        [name]: value,
      }

      // If end date is set and is not after the new start date, reset it
      if (formData.endDate && value && formData.endDate <= value) {
        newFormData.endDate = ""
      }

      setFormData(newFormData)
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

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

    const newErrors = {};

    if (!formData.projectTitle) newErrors.projectTitle = 'Project title is required';
    if (!formData.expertiseRequired) newErrors.expertiseRequired = 'Expertise is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    // Hourly rate validation
    if (!formData.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    } else if (parseFloat(formData.hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Enter valid hourly rate';
    }

    if (!formData.hoursPerWeek) newErrors.hoursPerWeek = 'Hours per week is required';
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
        type: formData.expertiseRequired.join(', '),
        tool: formData.softwareTools.join(', '),
        projectType: formData.projectType,
        certifications: formData.certificationsNeeded.join(', '),
        estimatedHours: parseInt(formData.hoursPerWeek),
        status: 'Pending',
        color: '#4EC1EF',
        description: formData.projectDescription,
        budget: parseFloat(formData.hourlyRate) * parseInt(formData.hoursPerWeek),
        hourlyRate: parseFloat(formData.hourlyRate),
        workModel: formData.workModel,
        country: formData.country,
        state: formData.state,
        startDate: formData.startDate,
        endDate: formData.endDate,
        assignedContractorId: null
      };

      console.log('Project data being sent to backend:', projectData);

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
        navigate('/projects');
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
    navigate('/projects');
  };

  const getMinEndDate = () => {
    if (formData.startDate) {
      // If start date is selected, end date should be at least the day after start date
      const startDate = new Date(formData.startDate)
      startDate.setDate(startDate.getDate() + 1)
      return startDate.toISOString().split("T")[0]
    } else {
      // If no start date selected, end date should be at least tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split("T")[0]
    }
  }

  return (
    <DashboardLayout>
      <div className="projects-container">
        <div className="create-project-container">
          <div className="create-project-header">
            <h1>Add New <strong>Project</strong></h1>
            <div className="project-id-section">
              <span className="project-id-label">Project ID</span>
              <span className="project-id-value">(System Generated)</span>
            </div>
          </div>

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
                    placeholder="Enter Full Name"
                  />
                  {errors.projectTitle && (
                    <span className="error-message">{errors.projectTitle}</span>
                  )}
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
                        disabled={configLoading}
                      >
                        <option value="">{configLoading ? 'Loading...' : 'Select Expertise'}</option>
                        {configOptions.expertise.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors.expertiseRequired && (
                    <span className="error-message">{errors.expertiseRequired}</span>
                  )}
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
                        disabled={configLoading}
                      >
                        <option value="">{configLoading ? 'Loading...' : 'Select Certifications'}</option>
                        {configOptions.certifications.length === 0 && !configLoading && (
                          <option value="" disabled>No certifications configured</option>
                        )}
                        {configOptions.certifications.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
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
                        disabled={configLoading}
                      >
                        <option value="">{configLoading ? 'Loading...' : 'Select Software Tools'}</option>
                        {configOptions.softwareTools.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="projectType">Project Type:</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    disabled={configLoading}
                  >
                    <option value="">{configLoading ? 'Loading...' : 'Select Project Type'}</option>
                    {configOptions.projectTypes.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
                    onChange={handleChange}
                    className={errors.startDate ? 'error' : ''}
                    min={new Date().toISOString().split('T')[0]}
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
                    min={getMinEndDate()}
                  />
                  {errors.endDate && (
                    <span className="error-message">{errors.endDate}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="hourlyRate">Hourly Rate:</label>
                  <div className="hourly-rate-input">
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className={errors.hourlyRate ? 'error' : ''}
                      placeholder="$"
                    />
                  </div>
                  {errors.hourlyRate && (
                    <span className="error-message">{errors.hourlyRate}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="hoursPerWeek">Hours per Week:</label>
                  <input
                    type="number"
                    id="hoursPerWeek"
                    name="hoursPerWeek"
                    value={formData.hoursPerWeek}
                    onChange={handleChange}
                    className={errors.hoursPerWeek ? 'error' : ''}
                    placeholder="40"
                    min="1"
                    max="168"
                  />
                  {errors.hoursPerWeek && (
                    <span className="error-message">{errors.hoursPerWeek}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country:</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    disabled={!formData.country}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Work Model:</label>
                  <div className="work-model-radio">
                    <label className="radio-option">
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
                    <label className="radio-option">
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
                    <label className="radio-option">
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
              </div>

              <div className="form-group full-width">
                <label htmlFor="projectDescription">Project Description:</label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleChange}
                  className={errors.projectDescription ? 'error' : ''}
                  placeholder="Enter Project Description"
                  rows="4"
                />
                {errors.projectDescription && (
                  <span className="error-message">{errors.projectDescription}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="tab-btn active"
              >
                ← Cancel
              </button>
              <button
                type="submit"
                className="create-project-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Project →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientCreateProject;