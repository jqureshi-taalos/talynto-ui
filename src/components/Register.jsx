import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';
import './Auth.css';
import signPagePicture from '../assets/sign page picture.png';
import taalosLogo from '../assets/taalos logo.png';

const Register = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    country: '',
    state: '',
    city: '',
    availability: '',
    userType: 'client',
    // Client-specific fields
    industry: '',
    companySize: '',
    estimatedRevenue: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  // Client configuration options
  const [clientOptions, setClientOptions] = useState({
    industry: [],
    companySize: [],
    estimatedRevenue: []
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCountries();

    // Check if we're editing and pre-populate form
    if (location.state?.isEditing && location.state?.userData) {
      const userData = location.state.userData;
      setIsEditing(true);

      // Pre-populate form with existing user data
      setFormData({
        fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email || '',
        companyName: userData.companyName || '',
        password: '', // Keep password fields empty for security
        confirmPassword: '',
        country: userData.country || '',
        state: userData.state || '',
        city: userData.city || '',
        availability: userData.availability || '',
        userType: userData.role?.toLowerCase() || 'client',
        // Client-specific fields
        industry: userData.industry || '',
        companySize: userData.companySize || '',
        estimatedRevenue: userData.estimatedRevenue || ''
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (formData.userType === 'client') {
      fetchClientConfigurationOptions();
    }
  }, [formData.userType]);

  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    } else {
      setStates([]);
      setCities([]);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.state) {
      fetchCities(formData.country, formData.state);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.country, formData.state]);

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

  const fetchClientConfigurationOptions = async () => {
    setConfigLoading(true);
    try {
      const options = await adminService.getClientConfigurationOptions();
      setClientOptions({
        industry: Array.isArray(options.industry) ? options.industry : [],
        companySize: Array.isArray(options.companySize) ? options.companySize : [],
        estimatedRevenue: Array.isArray(options.estimatedRevenue) ? options.estimatedRevenue : []
      });
    } catch (error) {
      console.error('Error fetching client configuration options:', error);
      // Show no options on error
      setClientOptions({
        industry: [],
        companySize: [],
        estimatedRevenue: []
      });
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchStates = async (countryName) => {
    try {
      // First try to get country ISO code
      const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,cca2`);
      const countryData = await countryResponse.json();
      const countryCode = countryName === 'United States' ? 'US' : countryData[0]?.cca2;

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


          console.log('@response ===>', {
            countryCode: countryCode,
            statesResponse: statesData,
            states: states
          });
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

  const fetchCities = async (countryName, stateName) => {
    setIsLoadingCities(true);
    try {
      // First get country ISO code
      const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,cca2`);
      const countryData = await countryResponse.json();
      const countryCode = countryName === 'United States' ? 'US' : countryData[0]?.cca2;

      if (countryCode) {
        // Get state ISO code from the states data
        const statesResponse = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
          headers: {
            'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
          }
        });

        if (statesResponse.ok) {
          const statesData = await statesResponse.json();
          const state = statesData.find(s => s.name === stateName);
          const stateCode = state?.iso2;

          if (stateCode) {
            // Now fetch cities for this state
            const citiesResponse = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`, {
              headers: {
                'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
              }
            });

            if (citiesResponse.ok) {
              const citiesData = await citiesResponse.json();
              const cityNames = citiesData.map(city => city.name).sort();
              setCities(cityNames.length > 0 ? cityNames : []);
            } else {
              setCities([]);
            }
          } else {
            setCities([]);
          }
        } else {
          setCities([]);
        }
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setIsLoadingCities(false);
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

  // @modified - email validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    // @fix
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.userType === 'client' && !formData.companyName) {
      newErrors.companyName = 'Company name is required';
    }

    // @fix
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

      if (!strongPasswordRegex.test(formData.password)) {
        newErrors.password = 'Password is too weak';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (formData.userType === 'contractor' && !formData.availability) {
      newErrors.availability = 'Availability is required';
    }

    // Client-specific validation
    if (formData.userType === 'client') {
      if (!formData.industry) {
        newErrors.industry = 'Industry is required';
      }

      if (!formData.companySize) {
        newErrors.companySize = 'Company size is required';
      }

      if (!formData.estimatedRevenue) {
        newErrors.estimatedRevenue = 'Estimated revenue is required';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'N/A';

      // Call the backend registration API
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.userType.charAt(0).toUpperCase() + formData.userType.slice(1),
          // Additional profile fields
          companyName: formData.companyName,
          country: formData.country,
          state: formData.state,
          // Client-specific fields (only sent if user is a client)
          industry: formData.userType === 'client' ? formData.industry : undefined,
          companySize: formData.userType === 'client' ? formData.companySize : undefined,
          estimatedRevenue: formData.userType === 'client' ? formData.estimatedRevenue : undefined
        })
      });

      if (response.ok) {
        const result = await response.json();

        // Check if user has authentication tokens (this shouldn't happen now until email verification)
        if (result.token && result.token.trim() !== '') {
          // This should not happen with the new security fix
          console.error('SECURITY WARNING: User received token before email verification');
        }

        // SECURITY FIX: ALL users must verify email before accessing the system
        // Navigate to email verification regardless of user type
        navigate('/email-verification', {
          state: {
            email: formData.email,
            userType: formData.userType,
            requiresVerification: true
          }
        });
      } else {
        const errorData = await response.json();
        setErrors({
          general: errorData.message || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Network error. Please check your connection and try again.'
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
            <img src={signPagePicture} alt="Registration illustration" />
          </div>
          <div className="auth-form-section">
            <div className="auth-header">
              <div className="header-with-logo">
                <img src={taalosLogo} alt="Taalos Logo" className="taalos-logo" />
                <h1>taalos</h1>
              </div>
              <h2>{isEditing ? 'Update your Profile' : 'Create your'} <strong>{isEditing ? 'Details' : 'Account'}</strong></h2>
              <p className="tagline">{isEditing ? 'Please update your information and resubmit for review.' : 'Matches that Matter, For Companies and Careers.'}</p>

              <div className="user-type-selection">
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="userType"
                      value="client"
                      checked={formData.userType === 'client'}
                      onChange={handleChange}
                      disabled={isEditing}
                    />
                    <span className="radio-custom"></span>
                    Client
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="userType"
                      value="contractor"
                      checked={formData.userType === 'contractor'}
                      onChange={handleChange}
                      disabled={isEditing}
                    />
                    <span className="radio-custom"></span>
                    Contractor
                  </label>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && (
                <div className="error-message general-error">
                  {errors.general}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="fullName">Full Name: <span className="required">*</span></label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                  placeholder="Enter Full Name"
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address: <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter Email Address"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {
                formData.userType != 'contractor' ? (
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name: <span className="required">*</span></label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={errors.companyName ? 'error' : ''}
                      placeholder="Enter Company Name"
                    />
                    {errors.companyName && (
                      <span className="error-message">{errors.companyName}</span>
                    )}
                  </div>
                ) :
                  null
              }
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password: <span className="required">*</span></label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Enter Password"
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password: <span className="required">*</span></label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Enter Confirm Password"
                  />
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={errors.country ? 'error' : ''}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && (
                    <span className="error-message">{errors.country}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? 'error' : ''}
                    disabled={!formData.country}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <span className="error-message">{errors.state}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                {cities.length > 0 ? (
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'error' : ''}
                    disabled={!formData.country || !formData.state || isLoadingCities}
                  >
                    <option value="">
                      {isLoadingCities
                        ? 'Loading cities...'
                        : !formData.country || !formData.state
                          ? 'Please select country and state first'
                          : 'Select City'
                      }
                    </option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'error' : ''}
                    disabled={!formData.country || !formData.state || isLoadingCities}
                    placeholder={
                      isLoadingCities
                        ? 'Loading cities...'
                        : !formData.country || !formData.state
                          ? 'Please select country and state first'
                          : 'Enter your city name'
                    }
                  />
                )}
                {errors.city && (
                  <span className="error-message">{errors.city}</span>
                )}
              </div>

              {formData.userType === 'contractor' && (
                <div className="form-group">
                  <label htmlFor="availability">Availability</label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className={errors.availability ? 'error' : ''}
                  >
                    <option value="">Select Availability</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                  {errors.availability && (
                    <span className="error-message">{errors.availability}</span>
                  )}
                </div>
              )}

              {formData.userType === 'client' && (
                <>
                  <div className="form-group">
                    <label htmlFor="industry">Industry: <span className="required">*</span></label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className={errors.industry ? 'error' : ''}
                      disabled={configLoading}
                    >
                      <option value="">{configLoading ? 'Loading...' : 'Select Industry'}</option>
                      {clientOptions.industry.map(industry => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    {errors.industry && (
                      <span className="error-message">{errors.industry}</span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="companySize">Company Size: <span className="required">*</span></label>
                      <select
                        id="companySize"
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        className={errors.companySize ? 'error' : ''}
                        disabled={configLoading}
                      >
                        <option value="">{configLoading ? 'Loading...' : 'Select Company Size'}</option>
                        {clientOptions.companySize.map(size => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      {errors.companySize && (
                        <span className="error-message">{errors.companySize}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="estimatedRevenue">Estimated Revenue: <span className="required">*</span></label>
                      <select
                        id="estimatedRevenue"
                        name="estimatedRevenue"
                        value={formData.estimatedRevenue}
                        onChange={handleChange}
                        className={errors.estimatedRevenue ? 'error' : ''}
                        disabled={configLoading}
                      >
                        <option value="">{configLoading ? 'Loading...' : 'Select Revenue Range'}</option>
                        {clientOptions.estimatedRevenue.map(revenue => (
                          <option key={revenue} value={revenue}>
                            {revenue}
                          </option>
                        ))}
                      </select>
                      {errors.estimatedRevenue && (
                        <span className="error-message">{errors.estimatedRevenue}</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? (isEditing ? 'Updating...' : 'Signing Up...') : (isEditing ? 'Update Profile →' : 'Sign Up →')}
              </button>

              {!isEditing && (
                <div className="auth-links">
                  <Link to="/login">Already have an account? Sign In</Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;