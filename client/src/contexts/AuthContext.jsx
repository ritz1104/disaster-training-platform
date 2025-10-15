// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  socket: null,
  permissions: {
    canCreateTraining: false,
    canApproveTraining: false,
    canManageUsers: false,
    canViewAllStates: false,
    canGenerateReports: false,
    canManageSystem: false
  }
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        permissions: action.payload.permissions || state.permissions,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        permissions: action.payload.user?.permissions || state.permissions,
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      // Disconnect socket on logout
      if (state.socket) {
        state.socket.disconnect();
      }
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        socket: null,
        permissions: initialState.permissions,
      };
    case 'SOCKET_CONNECTED':
      return {
        ...state,
        socket: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Set default axios config
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Set base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize socket connection
  const initializeSocket = (userData) => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Authenticate user with socket
    socket.emit('authenticate', {
      userId: userData._id,
      name: userData.name,
      role: userData.role,
      state: userData.state,
      email: userData.email
    });

    // Handle real-time notifications
    socket.on('trainingAdded', (training) => {
      // Handle new training notification
      console.log('New training added:', training.title);
    });

    socket.on('trainingUpdated', (training) => {
      // Handle training update notification
      console.log('Training updated:', training.title);
    });

    socket.on('trainingApprovalUpdate', (data) => {
      // Handle approval status updates
      console.log('Training approval update:', data);
    });

    socket.on('newRegistration', (data) => {
      // Handle new registration notification for organizers
      console.log('New registration:', data);
    });

    dispatch({
      type: 'SOCKET_CONNECTED',
      payload: socket
    });

    return socket;
  };

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const res = await axios.get('/auth/me');
        const userData = res.data.data;
        
        dispatch({
          type: 'USER_LOADED',
          payload: userData,
        });

        // Initialize socket connection after user is loaded
        initializeSocket(userData);
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/auth/register', formData);
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data.data,
      });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'REGISTER_FAIL' });
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/auth/login', formData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data.data,
      });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile
  const updateProfile = async (formData) => {
    try {
      const res = await axios.put('/auth/profile', formData);
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
      };
    }
  };

  // Helper functions for role and permission checking
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const hasPermission = (permission) => {
    return state.permissions[permission] === true;
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => state.permissions[permission] === true);
  };

  const canAccessState = (targetState) => {
    if (!state.user) return false;
    if (state.user.role === 'SuperAdmin' || state.user.state === 'All') return true;
    return state.user.state === targetState;
  };

  const isApproved = () => {
    if (!state.user) return false;
    return state.user.isApproved || ['SuperAdmin', 'Volunteer'].includes(state.user.role);
  };

  const getRoleHierarchy = () => {
    const hierarchy = {
      'SuperAdmin': 5,
      'Admin': 4,
      'ATI': 3,
      'NGO': 2,
      'Volunteer': 1
    };
    return hierarchy[state.user?.role] || 0;
  };

  const canManageUser = (targetUser) => {
    if (!hasPermission('canManageUsers')) return false;
    
    const currentLevel = getRoleHierarchy();
    const targetLevel = getRoleHierarchy(targetUser.role);
    
    return currentLevel > targetLevel;
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        updateProfile,
        loadUser,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        canAccessState,
        isApproved,
        getRoleHierarchy,
        canManageUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;