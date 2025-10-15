// server/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, organization, phone, state } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // For SuperAdmin role, automatically set approval status
  const isApproved = role === 'SuperAdmin' || role === 'Volunteer';

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Volunteer',
    organization,
    phone,
    state,
    isApproved,
    isActive: true,
    approvedBy: req.user?._id // If created by authenticated user
  });

  // Generate token
  const token = generateToken(user._id);

  logger.info(`New user registered: ${email} with role ${role || 'Volunteer'}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        isApproved: user.isApproved,
        needsApproval: !isApproved
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check if user is approved (SuperAdmin is auto-approved, Volunteers don't need approval for basic access)
    if (!user.isApproved && user.role !== 'SuperAdmin' && user.role !== 'Volunteer') {
      return res.status(401).json({
        success: false,
        message: 'Account is pending approval. Please wait for administrator approval.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          state: user.state,
          isApproved: user.isApproved,
          isActive: user.isActive,
          permissions: user.permissions
        },
        token
      }
    });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, organization, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, organization, phone },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  logger.info(`Profile updated for user: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Get pending users for approval
// @route   GET /api/auth/pending-users
// @access  Private (Admin/SuperAdmin)
exports.getPendingUsers = async (req, res) => {
  try {
    let query = { isApproved: false, role: { $in: ['ATI', 'NGO'] } };
    
    // State-level admin can only see users from their state
    if (req.user.role === 'Admin' && req.user.state !== 'All') {
      query.state = req.user.state;
    }

    const pendingUsers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pendingUsers
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending users',
      error: error.message
    });
  }
};

// @desc    Approve/Reject user
// @route   PUT /api/auth/approve-user/:id
// @access  Private (Admin/SuperAdmin)
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve, reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if admin can approve this user (state restriction)
    if (req.user.role === 'Admin' && req.user.state !== 'All' && user.state !== req.user.state) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve users from your assigned state'
      });
    }

    user.isApproved = approve;
    user.approvedBy = req.user._id;
    
    if (!approve) {
      user.isActive = false;
      user.rejectionReason = reason;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${approve ? 'approved' : 'rejected'} successfully`,
      data: {
        userId: user._id,
        approved: user.isApproved,
        approvedBy: req.user._id
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing user approval',
      error: error.message
    });
  }
};

// @desc    Get all users with filtering
// @route   GET /api/auth/users
// @access  Private (Admin/SuperAdmin)
exports.getUsers = async (req, res) => {
  try {
    const { role, state, status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Role filtering
    if (role) query.role = role;
    
    // State filtering
    if (state) query.state = state;
    
    // Status filtering
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    // Apply user-based filtering
    if (req.user.role === 'Admin' && req.user.state !== 'All') {
      query.state = req.user.state;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Update user role/permissions
// @route   PUT /api/auth/users/:id
// @access  Private (SuperAdmin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, state, isActive, permissions } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (role) user.role = role;
    if (state) user.state = state;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (permissions) user.permissions = { ...user.permissions, ...permissions };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: await User.findById(id).select('-password')
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/auth/user-stats
// @access  Private (Admin/SuperAdmin)
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const approvedUsers = await User.countDocuments({ isApproved: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingUsers = await User.countDocuments({ isApproved: false });

    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        approved: approvedUsers,
        active: activeUsers,
        pending: pendingUsers,
        byRole: stats.reduce((acc, stat) => {
          acc[stat._id] = stat;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};