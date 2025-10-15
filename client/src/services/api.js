import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Log request duration in development
    if (import.meta.env.DEV && response.config.metadata) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth data and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          toast.error('Access denied. You don\'t have permission for this action.');
          break;
          
        case 404:
          toast.error('Resource not found.');
          break;
          
        case 409:
          toast.error(data?.message || 'Conflict occurred.');
          break;
          
        case 422:
          // Validation errors
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.msg || err.message));
          } else {
            toast.error(data?.message || 'Validation failed.');
          }
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data?.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else {
        toast.error('Network error. Please check your internet connection.');
      }
    } else {
      // Something else went wrong
      toast.error('An unexpected error occurred.');
      console.error('API Error:', error);
    }

    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateProfile: (profileData) => api.put('/auth/profile', profileData),
    changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
    getUserStats: () => api.get('/auth/user-stats'),
    getUsers: (params) => api.get('/auth/users', { params }),
    updateUser: (userId, userData) => api.put(`/auth/users/${userId}`, userData),
    approveUser: (userId, approvalData) => api.put(`/auth/users/${userId}/approve`, approvalData),
    getPendingUsers: (params) => api.get('/auth/pending-users', { params }),
  },

  // Training endpoints
  trainings: {
    getAll: (params) => api.get('/trainings', { params }),
    getById: (id) => api.get(`/trainings/${id}`),
    create: (trainingData) => api.post('/trainings', trainingData),
    update: (id, trainingData) => api.put(`/trainings/${id}`, trainingData),
    delete: (id) => api.delete(`/trainings/${id}`),
    join: (id) => api.post(`/trainings/${id}/join`),
    leave: (id) => api.post(`/trainings/${id}/leave`),
    approve: (id, approvalData) => api.put(`/trainings/${id}/approve`, approvalData),
    getStats: () => api.get('/trainings/stats/analytics'),
    getStateStats: (state) => api.get(`/trainings/stats/state/${state}`),
  },

  // Analytics endpoints
  analytics: {
    getDashboard: () => api.get('/analytics/dashboard'),
    getTrainingStats: (params) => api.get('/analytics/training-stats', { params }),
    getUserStats: (params) => api.get('/analytics/user-stats', { params }),
    getStateAnalytics: (state) => api.get(`/analytics/state/${state}`),
  },

  // Reports endpoints
  reports: {
    generate: (reportType, params) => api.post(`/reports/${reportType}`, params),
    getAll: (params) => api.get('/reports', { params }),
    getById: (id) => api.get(`/reports/${id}`),
    download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  },
};

// Query key factory for React Query
export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
    users: (params) => ['auth', 'users', params],
    userStats: ['auth', 'user-stats'],
    pendingUsers: (params) => ['auth', 'pending-users', params],
  },
  trainings: {
    all: (params) => ['trainings', params],
    detail: (id) => ['trainings', id],
    stats: ['trainings', 'stats'],
    stateStats: (state) => ['trainings', 'state-stats', state],
  },
  analytics: {
    dashboard: ['analytics', 'dashboard'],
    trainingStats: (params) => ['analytics', 'training-stats', params],
    userStats: (params) => ['analytics', 'user-stats', params],
    stateAnalytics: (state) => ['analytics', 'state', state],
  },
  reports: {
    all: (params) => ['reports', params],
    detail: (id) => ['reports', id],
  },
};

// React Query mutation options with optimistic updates
export const mutationOptions = {
  onError: (error, variables, context) => {
    console.error('Mutation error:', error);
    
    // Rollback optimistic updates if context exists
    if (context?.previousData) {
      // This would be implemented per mutation
      console.log('Rolling back optimistic update');
    }
  },
  onSettled: (data, error, variables, context) => {
    // Invalidate and refetch queries after mutation
    // This would be implemented per mutation
  },
};

export default api;