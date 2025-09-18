import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class AdminDashboardService {
  async getDashboardStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/admin/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  }

  async getPendingContractors(limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/admin/pending-contractors?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending contractors:', error);
      throw error;
    }
  }

  async getRejectedInvoices(limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/admin/rejected-invoices?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rejected invoices:', error);
      throw error;
    }
  }

  async getAdminUserInfo() {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/admin/user-info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin user info:', error);
      throw error;
    }
  }
}

export default new AdminDashboardService();