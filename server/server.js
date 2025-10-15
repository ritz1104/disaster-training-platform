// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

// Import error middleware
const { errorHandler, notFound } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', process.env.CLIENT_URL].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://ndma-training-client.onrender.com',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Additional CORS handling for preflight requests
app.options('*', cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-training', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Socket.IO connection handling with enhanced real-time features
const connectedUsers = new Map();
const activeTrainingSessions = new Map();

io.on('connection', (socket) => {
  console.log('👤 New client connected:', socket.id);

  // User authentication and room joining
  socket.on('authenticate', (userData) => {
    if (userData && userData.userId) {
      connectedUsers.set(socket.id, userData);
      
      // Join user-specific rooms based on role and state
      socket.join(`user:${userData.userId}`);
      socket.join(`role:${userData.role}`);
      
      if (userData.state && userData.state !== 'All') {
        socket.join(`state:${userData.state}`);
      }
      
      console.log(`👤 User ${userData.name} (${userData.role}) authenticated and joined rooms`);
      
      // Broadcast user online status to relevant rooms
      socket.to(`state:${userData.state}`).emit('userOnline', {
        userId: userData.userId,
        name: userData.name,
        role: userData.role
      });
    }
  });

  // Real-time training management
  socket.on('newTraining', (training) => {
    console.log('📢 Broadcasting new training:', training.title);
    
    // Broadcast to all users in the same state
    socket.to(`state:${training.state}`).emit('trainingAdded', training);
    
    // Broadcast to admins and superadmins
    socket.to('role:Admin').to('role:SuperAdmin').emit('trainingAdded', training);
    
    // If training needs approval, notify relevant approvers
    if (training.approvalStatus === 'Pending') {
      socket.to(`state:${training.state}`).to('role:Admin').emit('trainingPendingApproval', {
        trainingId: training._id,
        title: training.title,
        organizer: training.organizer,
        state: training.state
      });
    }
  });

  socket.on('updateTraining', (training) => {
    console.log('📝 Broadcasting training update:', training.title);
    
    // Notify registered participants
    if (training.registrations && training.registrations.length > 0) {
      training.registrations.forEach(reg => {
        socket.to(`user:${reg.user}`).emit('trainingUpdated', training);
      });
    }
    
    // Broadcast to state and role-based rooms
    socket.to(`state:${training.state}`).emit('trainingUpdated', training);
    socket.to('role:Admin').to('role:SuperAdmin').emit('trainingUpdated', training);
  });

  // Training registration events
  socket.on('userRegistered', (data) => {
    console.log('📝 User registered for training:', data.trainingId);
    
    // Notify organizer
    socket.to(`user:${data.organizer}`).emit('newRegistration', {
      trainingId: data.trainingId,
      userName: data.userName,
      userEmail: data.userEmail,
      registeredAt: new Date()
    });
    
    // Update real-time participant count
    socket.to(`training:${data.trainingId}`).emit('participantCountUpdated', {
      trainingId: data.trainingId,
      newCount: data.newCount,
      maxParticipants: data.maxParticipants
    });
  });

  // Live training session management
  socket.on('joinTrainingSession', (trainingId) => {
    socket.join(`training:${trainingId}`);
    
    if (!activeTrainingSessions.has(trainingId)) {
      activeTrainingSessions.set(trainingId, {
        participants: [],
        startTime: new Date(),
        status: 'active'
      });
    }
    
    const session = activeTrainingSessions.get(trainingId);
    const userData = connectedUsers.get(socket.id);
    
    if (userData) {
      session.participants.push({
        userId: userData.userId,
        name: userData.name,
        joinTime: new Date()
      });
      
      // Broadcast to all session participants
      socket.to(`training:${trainingId}`).emit('participantJoined', {
        participant: userData,
        totalParticipants: session.participants.length
      });
    }
  });

  // Real-time attendance tracking
  socket.on('markAttendance', (data) => {
    const { trainingId, userId, status, timestamp } = data;
    
    // Broadcast attendance update to training organizers and admins
    socket.to(`training:${trainingId}`).emit('attendanceMarked', {
      userId,
      status,
      timestamp,
      markedBy: connectedUsers.get(socket.id)?.name
    });
    
    // Update live session data
    if (activeTrainingSessions.has(trainingId)) {
      const session = activeTrainingSessions.get(trainingId);
      const participant = session.participants.find(p => p.userId === userId);
      if (participant) {
        participant.attendanceStatus = status;
        participant.attendanceTime = new Date(timestamp);
      }
    }
  });

  // Training approval workflow
  socket.on('trainingApproved', (data) => {
    const { trainingId, status, approvedBy, reason } = data;
    
    // Notify organizer
    socket.to(`user:${data.organizer}`).emit('trainingApprovalUpdate', {
      trainingId,
      status,
      approvedBy: approvedBy.name,
      reason,
      timestamp: new Date()
    });
    
    // Notify registered participants if approved
    if (status === 'Approved' && data.registrations) {
      data.registrations.forEach(reg => {
        socket.to(`user:${reg.user}`).emit('trainingApproved', {
          trainingId,
          trainingTitle: data.title,
          message: 'Your registered training has been approved!'
        });
      });
    }
  });

  // Real-time analytics updates
  socket.on('requestAnalyticsUpdate', (filters) => {
    const userData = connectedUsers.get(socket.id);
    if (userData && ['Admin', 'SuperAdmin'].includes(userData.role)) {
      // Emit analytics refresh request
      socket.emit('refreshAnalytics', { filters, timestamp: new Date() });
    }
  });

  // System notifications
  socket.on('systemNotification', (notification) => {
    const userData = connectedUsers.get(socket.id);
    if (userData && userData.role === 'SuperAdmin') {
      // Broadcast system-wide notifications
      io.emit('systemAlert', {
        message: notification.message,
        type: notification.type,
        timestamp: new Date(),
        from: 'System Administrator'
      });
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    
    if (userData) {
      console.log(`👋 User ${userData.name} disconnected`);
      
      // Notify relevant rooms about user going offline
      socket.to(`state:${userData.state}`).emit('userOffline', {
        userId: userData.userId,
        name: userData.name,
        role: userData.role
      });
      
      // Remove from active training sessions
      activeTrainingSessions.forEach((session, trainingId) => {
        const participantIndex = session.participants.findIndex(p => p.userId === userData.userId);
        if (participantIndex !== -1) {
          session.participants.splice(participantIndex, 1);
          socket.to(`training:${trainingId}`).emit('participantLeft', {
            userId: userData.userId,
            name: userData.name,
            totalParticipants: session.participants.length
          });
        }
      });
      
      connectedUsers.delete(socket.id);
    } else {
      console.log('👋 Unknown client disconnected:', socket.id);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Heartbeat to keep connection alive
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Disaster Training Platform API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Server startup
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Socket.IO ready for real-time updates`);
  console.log(`🔗 API Health Check: http://${HOST}:${PORT}/api/health`);
  console.log('🚀 ================================');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = { app, io };