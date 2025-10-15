// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getPendingUsers,
  approveUser,
  getUsers,
  updateUser,
  getUserStats
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { 
  authenticate, 
  authorizeRoles, 
  authorizePermissions 
} = require('../middleware/rbac.middleware');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Admin/SuperAdmin routes
router.get('/pending-users', authenticate, authorizePermissions('canManageUsers'), getPendingUsers);
router.put('/approve-user/:id', authenticate, authorizePermissions('canManageUsers'), approveUser);
router.get('/users', authenticate, authorizePermissions('canManageUsers'), getUsers);
router.get('/user-stats', authenticate, authorizePermissions('canManageUsers'), getUserStats);

// SuperAdmin only routes
router.put('/users/:id', authenticate, authorizeRoles('SuperAdmin'), updateUser);

module.exports = router;