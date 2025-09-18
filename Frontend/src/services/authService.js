import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:54193/api';

class InactivityManager {
  constructor() {
    this.inactivityTimer = null;
    this.inactivityPeriod = 60 * 60 * 1000; // 60 minutes in milliseconds
    this.events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    this.isActive = false;
  }

  startTracking() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.resetTimer();
    this.events.forEach(event => {
      document.addEventListener(event, this.resetTimer.bind(this), true);
    });
  }

  stopTracking() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.clearTimer();
    this.events.forEach(event => {
      document.removeEventListener(event, this.resetTimer.bind(this), true);
    });
  }

  resetTimer = () => {
    this.clearTimer();
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, this.inactivityPeriod);
  }

  clearTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  handleInactivity() {
    console.log('User inactive for 60 minutes, logging out...');
    authService.logout();
    window.location.href = '/login?reason=inactivity';
  }
}

const inactivityManager = new InactivityManager();

const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Clear logout flags on successful login
        sessionStorage.removeItem('loggedOut');
        localStorage.removeItem('loggedOut');
        
        inactivityManager.startTracking();
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(errorMessage);
    }
  },

  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        inactivityManager.startTracking();
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async logout() {
    console.log('LOGOUT CALLED - Stack trace:');
    console.trace();
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      inactivityManager.stopTracking();
      
      // Check user role before clearing session data
      const currentUser = this.getCurrentUser();
      const isAdmin = currentUser && currentUser.role && currentUser.role.toLowerCase() === 'admin';
      
      // Clear all session data
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('refreshToken');
      
      // Also clear localStorage if anything is stored there
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      // Clear any admin-specific cached data
      sessionStorage.removeItem('adminLoginRedirect');
      localStorage.removeItem('adminLoginRedirect');

      // Add a flag to indicate logout occurred (use localStorage for cross-tab sync)
      sessionStorage.setItem('loggedOut', 'true');
      localStorage.setItem('loggedOut', 'true');
      
      // Force redirect to appropriate login page based on user role
      if (isAdmin) {
        window.location.href = '/admin-login';
      } else {
        window.location.href = '/login';
      }
    }
  },

  getCurrentUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  updateCurrentUser(updatedUserData) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      // Merge the updated data with existing user data
      const updatedUser = { ...currentUser, ...updatedUserData };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  getToken() {
    return sessionStorage.getItem('token');
  },

  isAuthenticated() {
    console.log('isAuthenticated() called');
    
    // Check if user was explicitly logged out (check both session and local storage)
    const sessionLoggedOut = sessionStorage.getItem('loggedOut');
    const localLoggedOut = localStorage.getItem('loggedOut');
    if (sessionLoggedOut === 'true' || localLoggedOut === 'true') {
      console.log('User was explicitly logged out');
      this.clearAuthData();
      return false;
    }
    
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return false;
    }
    
    // TEMPORARILY DISABLED: Token expiration check to isolate logout issue
    /*
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token is expired - clearing auth data');
        this.clearAuthData();
        return false;
      }
    } catch (error) {
      console.log('Invalid token format:', error);
      this.clearAuthData();
      return false;
    }
    */
    
    console.log('Authentication check passed (token expiration check disabled)');
    return true;
  },
  
  clearAuthData() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    // Don't set logout flags here - only set them during explicit logout
  },

  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  initializeInactivityTracking() {
    // Temporarily disabled inactivity tracking to isolate logout issue
    // if (this.isAuthenticated()) {
    //   inactivityManager.startTracking();
    // }
    console.log('Inactivity tracking disabled for debugging');
  },

  // Initialize security event listeners
  initializeSecurityListeners() {
    // Listen for page visibility changes (tab switching, browser minimizing)
    // Disabled aggressive authentication checking on tab switch - was causing unwanted logouts
    // document.addEventListener('visibilitychange', () => {
    //   if (document.visibilityState === 'visible') {
    //     // Re-validate authentication when page becomes visible
    //     if (!this.isAuthenticated()) {
    //       const publicPaths = ['/login', '/admin/login', '/register', '/forgot-password', '/reset-password'];
    //       if (!publicPaths.includes(window.location.pathname)) {
    //         window.location.href = '/login';
    //       }
    //     }
    //   }
    // });

    // TEMPORARILY DISABLED: Listen for storage events (for cross-tab logout)
    // window.addEventListener('storage', (e) => {
    //   if (e.key === 'loggedOut' && e.newValue === 'true') {
    //     // User logged out in another tab
    //     this.clearAuthData();
    //     window.location.href = '/login';
    //   }
    // });
    console.log('Cross-tab logout listener disabled for debugging');

    // Listen for beforeunload to prevent browser caching
    window.addEventListener('beforeunload', (e) => {
      if (this.isAuthenticated()) {
        // Set cache control to prevent caching
        if (performance && performance.navigation) {
          // Don't cache authenticated pages
          const meta = document.createElement('meta');
          meta.httpEquiv = 'Cache-Control';
          meta.content = 'no-cache, no-store, must-revalidate';
          document.head.appendChild(meta);
        }
      }
    });
  }
};

axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 ERROR DETECTED - URL:', error.config?.url, 'Message:', error.response?.data?.message);
      
      // Don't auto-redirect for contractor status errors
      const message = error.response?.data?.message;
      if (message === 'CONTRACTOR_PENDING' || message === 'CONTRACTOR_REJECTED' || message === 'CONTRACTOR_INTAKE_INCOMPLETE' || message === 'CLIENT_PENDING' || message === 'CLIENT_REJECTED' || message === 'CLIENT_NOT_APPROVED' || message === 'CLIENT_DEACTIVATED') {
        return Promise.reject(error);
      }
      
      // TEMPORARILY DISABLED: Don't auto-logout on 401 errors during debugging
      // console.log('Triggering logout due to 401 error');
      // authService.logout();
      // window.location.href = '/login';
      console.log('401 error detected but auto-logout disabled for debugging');
    }
    return Promise.reject(error);
  }
);

export default authService;