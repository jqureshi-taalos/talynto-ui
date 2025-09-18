// Utility functions for testing API connectivity and debugging

export const testApiConnectivity = async () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
  
  try {
    console.log('Testing API connectivity...');
    console.log('API Base URL:', API_BASE_URL);
    
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/auth/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Test Response:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('API Test Error Response:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('API Connectivity Test Failed:', error);
    return { success: false, error: error.message };
  }
};

export const testContractorDashboardEndpoint = async (token) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';
  
  try {
    console.log('Testing contractor dashboard endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/dashboard/contractor`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Dashboard Endpoint Response Status:', response.status);
    console.log('Dashboard Endpoint Response Headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Dashboard Endpoint Response:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('Dashboard Endpoint Error Response:', errorText);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('Dashboard Endpoint Test Failed:', error);
    return { success: false, error: error.message };
  }
};

export const debugApiRequest = async (url, options = {}) => {
  console.log('=== API Request Debug ===');
  console.log('URL:', url);
  console.log('Options:', options);
  
  try {
    const response = await fetch(url, options);
    
    console.log('Response Status:', response.status);
    console.log('Response StatusText:', response.statusText);
    console.log('Response Headers:', [...response.headers.entries()]);
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response Data:', data);
      return { success: response.ok, data, status: response.status };
    } else {
      const text = await response.text();
      console.log('Response Text:', text);
      return { success: response.ok, text, status: response.status };
    }
  } catch (error) {
    console.error('API Request Failed:', error);
    return { success: false, error: error.message };
  }
};