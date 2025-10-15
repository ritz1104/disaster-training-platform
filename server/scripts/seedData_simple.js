// Simple seed data to test basic functionality
const mongoose = require('mongoose');
const Training = require('../models/training.model');
const User = require('../models/user.model');
require('dotenv').config();

async function seedSimple() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ndma-training-monitor');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Training.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create a simple admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@ndma.gov.in",
      password: "admin123",
      role: "Admin",
      organization: "NDMA",
      phone: "+91-9876543210",
      state: "Delhi",
      isApproved: true
    });
    await adminUser.save();
    console.log('✅ Created admin user');

    // Create a simple training
    const training = new Training({
      title: "Basic Flood Management Training",
      description: "Basic training on flood disaster management",
      date: new Date('2024-12-15'),
      state: "Delhi",
      district: "New Delhi",
      theme: "Flood Management",
      trainingType: "Workshop",
      targetAudience: "Government Officials",
      institution: "NDMA Training Institute",
      participants: {
        planned: 30,
        actual: 0,
        male: 0,
        female: 0
      },
      duration: {
        hours: 8,
        days: 1
      },
      status: "Scheduled",
      location: {
        type: "Point",
        coordinates: [77.2090, 28.6139],
        address: "NDMA Training Institute, New Delhi"
      },
      trainer: {
        name: "Dr. Test Trainer",
        organization: "NDMA",
        contact: "+91-9876543210"
      },
      organizer: adminUser._id,
      approvalStatus: "Auto-Approved"
    });

    await training.save();
    console.log('✅ Created sample training');

    console.log('\n🎉 Simple seed completed successfully!');
    console.log('Login: admin@ndma.gov.in / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedSimple();