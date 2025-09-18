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

const adminService = {
  async getPaginatedClients(page = 1, pageSize = 10, status = null, searchTerm = null, dateFilter = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      if (status && status !== 'All') {
        params.append('status', status);
      }
      
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }
      
      if (dateFilter && dateFilter.trim() !== '') {
        params.append('dateFilter', dateFilter.trim());
      }
      
      const response = await axios.get(`${API_BASE_URL}/user/admin/clients?${params}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getPaginatedContractors(page = 1, pageSize = 10, status = null, searchTerm = null, dateFilter = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      if (status && status !== 'All') {
        params.append('status', status);
      }
      
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }
      
      if (dateFilter && dateFilter.trim() !== '') {
        params.append('dateFilter', dateFilter.trim());
      }
      
      const response = await axios.get(`${API_BASE_URL}/user/admin/contractors?${params}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async approveClient(clientId, notes = '') {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/admin/clients/${clientId}/approve`, {
        notes: notes
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async rejectClient(clientId, notes = '') {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/admin/clients/${clientId}/reject`, {
        notes: notes
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async approveContractor(contractorId, notes = '') {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/admin/contractors/${contractorId}/approve`, {
        notes: notes
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async rejectContractor(contractorId, notes = '') {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/admin/contractors/${contractorId}/reject`, {
        notes: notes
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async deactivateClient(clientId, notes = '') {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/admin/clients/${clientId}/deactivate`, {
        notes: notes
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  // New Account Management Methods (using AccountController)
  async adminDeactivateAccount(targetUserId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/account/admin/deactivate/${targetUserId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async adminReactivateAccount(targetUserId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/account/admin/reactivate/${targetUserId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getContractorDetails(contractorId) {
    try {
      // Use the new dedicated contractor details endpoint
      const response = await axios.get(`${API_BASE_URL}/user/admin/contractors/${contractorId}`);
      return { contractor: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getContractorProfile(contractorId) {
    try {
      // Try additional profile endpoint for more detailed data
      const response = await axios.get(`${API_BASE_URL}/contractor/profile/${contractorId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getClientDetails(clientId) {
    try {
      // Since individual client endpoint doesn't exist, get from paginated list
      // This is a temporary solution until the proper endpoint is implemented
      const response = await axios.get(`${API_BASE_URL}/user/admin/clients?page=1&pageSize=100`);
      const clients = response.data.clients || [];
      const client = clients.find(c => c.id == clientId);
      
      if (client) {
        return { client };
      } else {
        throw new Error('Client not found');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getClientProjects(clientId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/admin/clients/${clientId}/project-summary`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getContractorProjects(contractorId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/admin/contractors/${contractorId}/project-summary`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  // Configuration Management
  async getAllConfigurationCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/configuration/categories`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getConfigurationCategory(categoryName) {
    try {
      const response = await axios.get(`${API_BASE_URL}/configuration/categories/${categoryName}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getCategoryItems(categoryName) {
    try {
      const response = await axios.get(`${API_BASE_URL}/configuration/categories/${categoryName}/items`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async createConfigurationItem(categoryId, name, description = '', sortOrder = 0) {
    try {
      const response = await axios.post(`${API_BASE_URL}/configuration/items`, {
        categoryId,
        name,
        description,
        sortOrder
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async updateConfigurationItem(itemId, name, description = '', sortOrder = 0, isActive = true) {
    try {
      const response = await axios.put(`${API_BASE_URL}/configuration/items/${itemId}`, {
        name,
        description,
        sortOrder,
        isActive
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async deleteConfigurationItem(itemId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/configuration/items/${itemId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  // Admin Settings Management
  async getAdminSettings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/configuration/admin-settings`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async updateAdminSettings(settings) {
    try {
      const response = await axios.put(`${API_BASE_URL}/configuration/admin-settings`, settings);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getCountries() {
    try {
      const response = await axios.get(`${API_BASE_URL}/configuration/countries`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  // Notifications with pagination
  async getPaginatedNotifications(page = 1, pageSize = 10) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      const response = await axios.get(`${API_BASE_URL}/notification/admin/notifications?${params}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  // Project Configuration Options (client authentication required)
  async getProjectConfigurationOptions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/project/configuration-options`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  // Public Contractor Configuration Options (no authentication required)
  async getContractorConfigurationOptions() {
    try {
      // Use axios without interceptors for this public endpoint
      const response = await axios.get(`${API_BASE_URL}/configuration/public/contractor-options`, {
        headers: {
          'Content-Type': 'application/json'
        },
        // Don't include auth header for this public endpoint
        transformRequest: [(data, headers) => {
          delete headers.Authorization;
          return data;
        }]
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  // Public Client Configuration Options (no authentication required)
  async getClientConfigurationOptions() {
    try {
      // Use axios without interceptors for this public endpoint
      const response = await axios.get(`${API_BASE_URL}/configuration/public/client-options`, {
        headers: {
          'Content-Type': 'application/json'
        },
        // Don't include auth header for this public endpoint
        transformRequest: [(data, headers) => {
          delete headers.Authorization;
          return data;
        }]
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  // Admin Project Management
  async getAllProjectsForAdmin(page = 1, pageSize = 10, status = null, sortBy = 'createdAt', sortOrder = 'desc', search = null, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      
      if (status && status !== 'All') {
        params.append('status', status);
      }
      
      if (search && search.trim() !== '') {
        params.append('search', search.trim());
      }
      
      if (startDate && startDate.trim() !== '') {
        params.append('startDate', startDate.trim());
      }
      
      if (endDate && endDate.trim() !== '') {
        params.append('endDate', endDate.trim());
      }
      
      const response = await axios.get(`${API_BASE_URL}/project/admin/all?${params}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getProjectByIdForAdmin(projectId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/project/admin/${projectId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getAvailableContractorsForAssignment() {
    try {
      const response = await axios.get(`${API_BASE_URL}/project/admin/available-contractors`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async getShortlistedContractorsForProject(projectId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/project/admin/${projectId}/shortlisted-contractors`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async assignContractorToProject(contractorId, projectId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/project/admin/assign-contractor`, {
        contractorId: contractorId,
        projectId: projectId
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async closeProject(projectId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/project/admin/close/${projectId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async updateProjectForAdmin(projectId, updateData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/project/admin/${projectId}`, updateData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

};

export default adminService;