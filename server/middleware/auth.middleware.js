// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { asyncHandler } = require('./error.middleware');
const logger = require('../utils/logger');

// Enhanced JWT middleware with better error handling
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

  // Get user from the token
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No user found with this token'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'User account is deactivated'
    });
  }

  // Add user to request
  req.user = user;
  next();
});

// Generate JWT Token with enhanced security
const generateToken = (id, expiresIn = process.env.JWT_EXPIRE || '30d') => {
  return jwt.sign(
    { 
      id,
      iat: Math.floor(Date.now() / 1000),
      type: 'access'
    }, 
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn,
      issuer: process.env.JWT_ISSUER || 'disaster-training-platform',
      audience: process.env.JWT_AUDIENCE || 'disaster-training-users'
    }
  );
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign(
    { 
      id,
      iat: Math.floor(Date.now() / 1000),
      type: 'refresh'
    }, 
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
      issuer: process.env.JWT_ISSUER || 'disaster-training-platform',
      audience: process.env.JWT_AUDIENCE || 'disaster-training-users'
    }
  );
};

exports.protect = protect;
exports.generateToken = generateToken;
exports.generateRefreshToken = generateRefreshToken;

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Continue without user
      req.user = null;
    }
  }

  next();
};