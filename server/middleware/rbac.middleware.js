// server/middleware/rbac.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    if (!user.isApproved && user.role !== 'Volunteer' && user.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Account pending approval.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const authorizePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const hasPermission = permissions.some(permission => 
      req.user.permissions[permission] === true
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permissions: ${permissions.join(', ')}`
      });
    }

    next();
  };
};

// State-based authorization (users can only access their assigned state data)
const authorizeState = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // SuperAdmin can access all states
  if (req.user.role === 'SuperAdmin' || req.user.state === 'All') {
    return next();
  }

  // Check if user is trying to access data from their assigned state
  const requestedState = req.params.state || req.query.state || req.body.state;
  
  if (requestedState && requestedState !== req.user.state) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access data from your assigned state.'
    });
  }

  next();
};

// Combined authorization for training management
const authorizeTrainingAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // SuperAdmin and Admin can access all trainings
  if (req.user.role === 'SuperAdmin' || 
      (req.user.role === 'Admin' && req.user.permissions.canViewAllStates)) {
    return next();
  }

  // State-level Admin can access trainings in their state
  if (req.user.role === 'Admin' && req.user.state) {
    const requestedState = req.params.state || req.query.state || req.body.state;
    if (requestedState && requestedState !== req.user.state) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access trainings from your assigned state.'
      });
    }
    return next();
  }

  // ATI and NGO can only access their own trainings
  if (req.user.role === 'ATI' || req.user.role === 'NGO') {
    return next(); // Further filtering will be done in controller
  }

  // Volunteers can view all trainings (read-only)
  if (req.user.role === 'Volunteer' && req.method === 'GET') {
    return next();
  }

  res.status(403).json({
    success: false,
    message: 'Access denied. Insufficient permissions.'
  });
};

// Middleware to add user-based query filters
const addUserFilter = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  // Add user context to request for filtering
  req.userFilter = {};

  switch (req.user.role) {
    case 'SuperAdmin':
      // No filters - can see everything
      break;
    case 'Admin':
      if (!req.user.permissions.canViewAllStates) {
        req.userFilter.state = req.user.state;
      }
      break;
    case 'ATI':
    case 'NGO':
      req.userFilter.organizer = req.user._id;
      break;
    case 'Volunteer':
      // Can see all trainings but can't create/modify
      break;
  }

  next();
};

module.exports = {
  authenticate,
  authorizeRoles,
  authorizePermissions,
  authorizeState,
  authorizeTrainingAccess,
  addUserFilter
};