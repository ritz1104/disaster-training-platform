// server/models/training.model.js
const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Training date is required']
  },
  endDate: {
    type: Date,
    required: false
  },
  theme: {
    type: String,
    required: [true, 'Theme is required'],
    enum: [
      'Flood Management',
      'Earthquake Safety', 
      'Cyclone Management',
      'Fire Safety',
      'Landslide Prevention',
      'Drought Management',
      'Tsunami Preparedness',
      'Medical Emergency',
      'Search and Rescue',
      'Community Awareness',
      'CBDRR (Community Based Disaster Risk Reduction)',
      'IRS (Incident Response System)',
      'Emergency Operations Center (EOC)',
      'Early Warning Systems',
      'School Safety'
    ]
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    enum: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ]
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  trainer: {
    name: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true
    },
    qualification: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    }
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true
  },
  participants: {
    planned: {
      type: Number,
      required: [true, 'Planned participants count is required'],
      min: [1, 'Must have at least 1 participant'],
      max: [10000, 'Participants cannot exceed 10000']
    },
    actual: {
      type: Number,
      min: [0, 'Actual participants cannot be negative'],
      max: [10000, 'Participants cannot exceed 10000'],
      default: 0
    },
    male: {
      type: Number,
      min: [0, 'Male participants cannot be negative'],
      default: 0
    },
    female: {
      type: Number,
      min: [0, 'Female participants cannot be negative'],
      default: 0
    }
  },
  duration: {
    hours: {
      type: Number,
      required: [true, 'Duration in hours is required'],
      min: [0.5, 'Minimum duration is 0.5 hours'],
      max: [720, 'Maximum duration is 720 hours (30 days)']
    },
    days: {
      type: Number,
      default: 1,
      min: [1, 'Minimum duration is 1 day']
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - GeoJSON format
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= 68.7 && v[0] <= 97.25 && // India longitude bounds
                 v[1] >= 8.4 && v[1] <= 37.6;      // India latitude bounds
        },
        message: 'Coordinates must be within India boundaries'
      }
    },
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    pincode: {
      type: String,
      validate: {
        validator: function(v) {
          return /^[1-9][0-9]{5}$/.test(v);
        },
        message: 'Invalid pincode format'
      }
    }
  },
  trainingType: {
    type: String,
    required: [true, 'Training type is required'],
    enum: ['Workshop', 'Drill', 'Simulation', 'Seminar', 'Mock Exercise', 'Awareness Program', 'Capacity Building']
  },
  targetAudience: {
    type: String,
    required: [true, 'Target audience is required'],
    enum: ['Government Officials', 'NGO Workers', 'Volunteers', 'School Students', 'Community Members', 'First Responders', 'Mixed Audience']
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resources: [{
    name: String,
    url: String,
    type: String
  }],
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Approval workflow
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Auto-Approved'],
    default: function() {
      // Auto-approve for Admin and SuperAdmin created trainings
      if (this.organizer) {
        const User = require('./user.model');
        return User.findById(this.organizer).then(user => {
          return ['Admin', 'SuperAdmin'].includes(user.role) ? 'Auto-Approved' : 'Pending';
        });
      }
      return 'Pending';
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  rejectionReason: String,
  
  // Participant registration
  registrations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Registered', 'Attended', 'Absent', 'Cancelled'],
      default: 'Registered'
    },
    attendance: {
      checkIn: Date,
      checkOut: Date,
      present: { type: Boolean, default: false }
    },
    certificate: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      certificateId: String
    }
  }],
  
  // Enhanced tracking
  maxParticipants: {
    type: Number,
    validate: {
      validator: function(v) {
        return v >= this.participants.planned;
      },
      message: 'Maximum participants cannot be less than planned participants'
    }
  },
  registrationDeadline: Date,
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  
  // Notification settings
  notifications: {
    reminderSent: { type: Boolean, default: false },
    followupSent: { type: Boolean, default: false },
    reportGenerated: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
trainingSchema.index({ location: '2dsphere' });

// Index for faster queries
trainingSchema.index({ date: -1 });
trainingSchema.index({ theme: 1 });
trainingSchema.index({ institution: 1 });
trainingSchema.index({ status: 1 });

// Virtual for formatting date
trainingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to find nearby trainings
trainingSchema.statics.findNearby = function(longitude, latitude, maxDistance = 100000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Method to register a user for training
trainingSchema.methods.registerUser = async function(userId) {
  // Check if already registered
  const existingRegistration = this.registrations.find(reg => 
    reg.user.toString() === userId.toString()
  );
  
  if (existingRegistration) {
    throw new Error('User already registered for this training');
  }

  // Check capacity
  if (this.maxParticipants && this.registrations.length >= this.maxParticipants) {
    throw new Error('Training is at full capacity');
  }

  // Check registration deadline
  if (this.registrationDeadline && new Date() > this.registrationDeadline) {
    throw new Error('Registration deadline has passed');
  }

  // Add registration
  this.registrations.push({ user: userId });
  return this.save();
};

// Method to mark attendance
trainingSchema.methods.markAttendance = function(userId, checkIn = true) {
  const registration = this.registrations.find(reg => 
    reg.user.toString() === userId.toString()
  );
  
  if (!registration) {
    throw new Error('User not registered for this training');
  }

  if (checkIn) {
    registration.attendance.checkIn = new Date();
    registration.attendance.present = true;
    registration.status = 'Attended';
  } else {
    registration.attendance.checkOut = new Date();
  }

  return this.save();
};

// Method to approve training
trainingSchema.methods.approve = function(approvedBy, reason = null) {
  this.approvalStatus = 'Approved';
  this.approvedBy = approvedBy;
  this.approvalDate = new Date();
  return this.save();
};

// Method to reject training
trainingSchema.methods.reject = function(approvedBy, reason) {
  this.approvalStatus = 'Rejected';
  this.approvedBy = approvedBy;
  this.rejectionReason = reason;
  this.approvalDate = new Date();
  return this.save();
};

// Add compound indexes for better query performance
trainingSchema.index({ state: 1, date: -1 });
trainingSchema.index({ theme: 1, approvalStatus: 1 });
trainingSchema.index({ createdBy: 1, approvalStatus: 1 });
trainingSchema.index({ approvalStatus: 1, date: -1 });
trainingSchema.index({ date: -1 });
trainingSchema.index({ location: '2dsphere' }); // For geospatial queries

// Add text index for search functionality
trainingSchema.index({ 
  title: 'text', 
  description: 'text',
  theme: 'text',
  venue: 'text'
});

module.exports = mongoose.model('Training', trainingSchema);