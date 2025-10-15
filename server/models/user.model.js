// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'Admin', 'ATI', 'NGO', 'Volunteer'],
    default: 'Volunteer'
  },
  organization: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    enum: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry', 'All'
    ],
    required: function() { return this.role === 'Admin' || this.role === 'ATI' || this.role === 'NGO'; }
  },
  permissions: {
    canCreateTraining: { type: Boolean, default: false },
    canApproveTraining: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canViewAllStates: { type: Boolean, default: false },
    canGenerateReports: { type: Boolean, default: false },
    canManageSystem: { type: Boolean, default: false }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch(this.role) {
      case 'SuperAdmin':
        this.permissions = {
          canCreateTraining: true,
          canApproveTraining: true,
          canManageUsers: true,
          canViewAllStates: true,
          canGenerateReports: true,
          canManageSystem: true
        };
        this.isApproved = true;
        this.state = 'All';
        break;
      case 'Admin':
        this.permissions = {
          canCreateTraining: true,
          canApproveTraining: true,
          canManageUsers: true,
          canViewAllStates: false,
          canGenerateReports: true,
          canManageSystem: false
        };
        this.isApproved = true;
        break;
      case 'ATI':
        this.permissions = {
          canCreateTraining: true,
          canApproveTraining: false,
          canManageUsers: false,
          canViewAllStates: false,
          canGenerateReports: true,
          canManageSystem: false
        };
        break;
      case 'NGO':
        this.permissions = {
          canCreateTraining: true,
          canApproveTraining: false,
          canManageUsers: false,
          canViewAllStates: false,
          canGenerateReports: false,
          canManageSystem: false
        };
        break;
      case 'Volunteer':
        this.permissions = {
          canCreateTraining: false,
          canApproveTraining: false,
          canManageUsers: false,
          canViewAllStates: false,
          canGenerateReports: false,
          canManageSystem: false
        };
        this.isApproved = true;
        break;
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Add compound indexes for better query performance
userSchema.index({ role: 1, isApproved: 1 });
userSchema.index({ state: 1, role: 1 });
userSchema.index({ isActive: 1, isApproved: 1 });
userSchema.index({ createdAt: -1 });

// Add text index for search functionality
userSchema.index({ 
  name: 'text', 
  email: 'text', 
  organization: 'text' 
});

module.exports = mongoose.model('User', userSchema);