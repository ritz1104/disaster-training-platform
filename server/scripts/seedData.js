// server/scripts/seedData.js
const mongoose = require('mongoose');
const Training = require('../models/training.model');
const User = require('../models/user.model');
require('dotenv').config();

const sampleTrainings = [
  {
    title: "Advanced Flood Management Training - Delhi",
    description: "Comprehensive training on flood disaster management and response protocols including early warning systems and community evacuation procedures",
    date: new Date('2024-12-15'),
    endDate: new Date('2024-12-17'),
    state: "Delhi",
    district: "New Delhi",
    theme: "Flood Management",
    trainingType: "Workshop",
    targetAudience: "Government Officials",
    institution: "NDMA Training Institute",
    participants: {
      planned: 50,
      actual: 0,
      male: 0,
      female: 0
    },
    maxParticipants: 60,
    duration: {
      hours: 24,
      days: 3
    },
    status: "Scheduled",
    location: {
      type: "Point",
      coordinates: [77.2090, 28.6139],
      name: "NDMA Training Institute",
      address: "Safdarjung Enclave, New Delhi - 110029"
    },
    trainer: {
      name: "Dr. Rajesh Kumar",
      organization: "NDMA",
      contact: "+91-9876543210",
      qualification: "PhD in Disaster Management"
    },
    registrations: [],
    isPublic: true,
    tags: ["flood", "management", "advanced"]
  },
  {
    title: "Earthquake Safety and Preparedness Workshop - Mumbai",
    description: "Comprehensive earthquake preparedness and safety measures training for urban communities",
    date: new Date('2025-01-15'),
    endDate: new Date('2025-01-16'),
    state: "Maharashtra",
    district: "Mumbai",
    theme: "Earthquake Safety",
    trainingType: "Workshop",
    targetAudience: "Community Members",
    institution: "IIT Bombay",
    participants: {
      planned: 75,
      actual: 0,
      male: 0,
      female: 0
    },
    maxParticipants: 80,
    duration: {
      hours: 16,
      days: 2
    },
    status: "Scheduled",
    location: {
      type: "Point",
      coordinates: [72.8777, 19.0760],
      name: "IIT Bombay Campus",
      address: "Powai, Mumbai - 400076"
    },
    trainer: {
      name: "Prof. Priya Sharma",
      organization: "IIT Bombay",
      contact: "+91-9876543221",
      qualification: "PhD in Seismology"
    },
    registrations: [],
    isPublic: true,
    tags: ["earthquake", "safety", "community"]
  },
  {
    title: "Cyclone Preparedness and Coastal Safety - Chennai",
    description: "Advanced cyclone disaster management and coastal area safety protocols for emergency responders",
    date: new Date('2024-11-25'),
    endDate: new Date('2024-11-25'),
    state: "Tamil Nadu",
    district: "Chennai",
    theme: "Cyclone Management",
    trainingType: "Seminar",
    targetAudience: "First Responders",
    institution: "Coast Guard Training Academy",
    participants: {
      planned: 60,
      actual: 58,
      male: 32,
      female: 26
    },
    maxParticipants: 60,
    duration: {
      hours: 12,
      days: 1
    },
    status: "Completed",
    location: {
      type: "Point",
      coordinates: [80.2707, 13.0827],
      name: "Coast Guard Training Academy",
      address: "Marina Beach Road, Chennai - 600001"
    },
    trainer: {
      name: "Cmdr. Anita Rao",
      organization: "Indian Coast Guard",
      contact: "+91-9876543222",
      qualification: "Maritime Operations Specialist"
    },
    registrations: [],
    isPublic: true,
    tags: ["cyclone", "coastal", "emergency"]
  },
  {
    title: "Industrial Fire Safety and Prevention - Bangalore",
    description: "Comprehensive industrial fire safety and prevention measures for manufacturing facilities",
    date: new Date('2024-12-10'),
    endDate: new Date('2024-12-10'),
    state: "Karnataka", 
    district: "Bengaluru Urban",
    theme: "Fire Safety",
    trainingType: "Workshop",
    targetAudience: "Government Officials",
    institution: "Karnataka Fire Services Training Center",
    participants: {
      planned: 40,
      actual: 38,
      male: 25,
      female: 13
    },
    maxParticipants: 45,
    duration: {
      hours: 8,
      days: 1
    },
    status: "Ongoing",
    location: {
      type: "Point",
      coordinates: [77.5946, 12.9716],
      name: "Fire Services Training Center",
      address: "Vidhana Soudha Area, Bengaluru - 560001"
    },
    trainer: {
      name: "Chief Fire Officer Suresh Babu",
      organization: "Karnataka Fire Services",
      contact: "+91-9876543223",
      qualification: "Fire Safety Engineering"
    },
    registrations: [],
    isPublic: true,
    tags: ["fire", "safety", "industrial"]
  },
  {
    title: "Advanced Landslide Risk Assessment - Shimla",
    description: "Comprehensive landslide risk assessment and mitigation strategies for mountainous regions",
    date: new Date('2024-12-05'),
    endDate: new Date('2024-12-07'),
    state: "Himachal Pradesh",
    district: "Shimla",
    theme: "Landslide Prevention", 
    trainingType: "Capacity Building",
    targetAudience: "Government Officials",
    institution: "Geological Survey of India",
    participants: {
      planned: 30,
      actual: 28,
      male: 18,
      female: 10
    },
    maxParticipants: 35,
    duration: {
      hours: 24,
      days: 3
    },
    status: "Completed",
    location: {
      type: "Point",
      coordinates: [77.1025, 31.1048],
      name: "GSI Regional Office",
      address: "The Mall Road, Shimla - 171001"
    },
    trainer: {
      name: "Dr. Himalaya Singh",
      organization: "Geological Survey of India",
      contact: "+91-9876543224",
      qualification: "PhD in Geological Engineering"
    },
    registrations: [],
    isPublic: true,
    tags: ["landslide", "assessment", "mountains"]
  },
  // Additional training for variety
  {
    title: "Community-Based Disaster Preparedness - Kerala",
    description: "Training local communities on disaster preparedness and response coordination",
    date: new Date('2025-01-20'),
    endDate: new Date('2025-01-21'),
    state: "Kerala",
    district: "Kochi",
    theme: "Community Awareness",
    trainingType: "Awareness Program", 
    targetAudience: "Community Members",
    institution: "Kerala State Disaster Management Authority",
    participants: {
      planned: 100,
      actual: 0,
      male: 0,
      female: 0
    },
    maxParticipants: 120,
    duration: {
      hours: 16,
      days: 2
    },
    status: "Scheduled",
    location: {
      type: "Point",
      coordinates: [76.2673, 9.9312],
      name: "Community Hall",
      address: "Marine Drive, Kochi - 682031"
    },
    trainer: {
      name: "Mrs. Lakshmi Menon",
      organization: "Kerala State Disaster Management Authority",
      contact: "+91-9876543225",
      qualification: "Community Development Specialist"
    },
    registrations: [],
    isPublic: true,
    tags: ["community", "preparedness", "awareness"]
  }
];

const sampleUsers = [
  // SuperAdmin
  {
    name: "Dr. Rajesh Kumar",
    email: "superadmin@ndma.gov.in",
    password: "super123",
    role: "SuperAdmin",
    organization: "NDMA Headquarters",
    phone: "+91-9876543210",
    state: "All", // SuperAdmin has national access
    isApproved: true,
    isActive: true,
    approvedBy: null,
    approvalDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Admin Users
  {
    name: "Priya Sharma",
    email: "admin@ndma.gov.in",
    password: "admin123",
    role: "Admin",
    organization: "NDMA Regional Office",
    phone: "+91-9876543211",
    state: "Delhi",
    isApproved: true,
    approvedBy: null,
    approvalDate: new Date()
  },
  {
    name: "Amit Singh",
    email: "admin.west@ndma.gov.in",
    password: "admin123",
    role: "Admin",
    organization: "NDMA Western Region",
    phone: "+91-9876543212",
    state: "Maharashtra",
    isApproved: true,
    approvedBy: null,
    approvalDate: new Date()
  },
  // ATI Users
  {
    name: "Dr. Sunita Verma",
    email: "ati.delhi@ndma.gov.in",
    password: "ati123",
    role: "ATI",
    organization: "Administrative Training Institute - Delhi",
    phone: "+91-9876543213",
    state: "Delhi",
    isApproved: true,
    approvedBy: null,
    approvalDate: new Date()
  },
  {
    name: "Prof. Ramesh Gupta",
    email: "ati.mumbai@ndma.gov.in",
    password: "ati123",
    role: "ATI",
    organization: "Administrative Training Institute - Mumbai",
    phone: "+91-9876543214",
    state: "Maharashtra",
    isApproved: true,
    approvedBy: null,
    approvalDate: new Date()
  },
  // NGO Users
  {
    name: "Meera Patel",
    email: "ngo.relief@gmail.com",
    password: "ngo123",
    role: "NGO",
    organization: "Disaster Relief Foundation",
    phone: "+91-9876543215",
    state: "Gujarat",
    isApproved: true,
    approvedBy: null,
    approvalDate: new Date()
  },
  {
    name: "Arjun Reddy",
    email: "ngo.response@gmail.com",
    password: "ngo123",
    role: "NGO",
    organization: "Emergency Response Network",
    phone: "+91-9876543216",
    state: "Karnataka",
    isApproved: false, // Pending approval
    approvedBy: null,
    approvalDate: null
  },
  // Volunteer Users
  {
    name: "Kavitha Nair",
    email: "volunteer1@gmail.com",
    password: "vol123",
    role: "Volunteer",
    organization: "Community Volunteer",
    phone: "+91-9876543217",
    state: "Kerala",
    isApproved: true,
    approvedBy: null,
    approvalDate: new Date()
  },
  {
    name: "Rohit Sharma",
    email: "volunteer2@gmail.com",
    password: "vol123",
    role: "Volunteer",
    organization: "Youth Disaster Response Team",
    phone: "+91-9876543218",
    state: "Rajasthan",
    isApproved: true,
    approvedBy: null,
    approvalDate: new Date()
  },
  {
    name: "Anjali Das",
    email: "volunteer3@gmail.com",
    password: "vol123",
    role: "Volunteer",
    organization: "Student Volunteer Corps",
    phone: "+91-9876543219",
    state: "West Bengal",
    isApproved: false, // Pending approval
    approvedBy: null,
    approvalDate: null
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ndma-training-monitor');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Training.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`   ✓ Created ${user.role}: ${user.name} (${user.email})`);
    }

    // Set up approval relationships
    const superAdmin = createdUsers.find(u => u.role === 'SuperAdmin');
    const admins = createdUsers.filter(u => u.role === 'Admin');
    
    // SuperAdmin approves the admins
    for (const admin of admins) {
      admin.approvedBy = superAdmin._id;
      await admin.save();
    }

    // Admin approves ATI, NGO, and Volunteers in their state
    for (const user of createdUsers) {
      if (['ATI', 'NGO', 'Volunteer'].includes(user.role) && user.isApproved) {
        const stateAdmin = admins.find(a => a.state === user.state);
        if (stateAdmin) {
          user.approvedBy = stateAdmin._id;
          await user.save();
        }
      }
    }

    console.log('✅ User relationships established');

    // Create sample trainings with appropriate organizers
    console.log('📚 Creating sample trainings...');
    const trainingsWithOrganizers = sampleTrainings.map((training, index) => {
      let organizer;
      
      // Assign organizers based on training type and state
      if (training.targetAudience === 'Government Officials') {
        organizer = createdUsers.find(u => u.role === 'Admin' && u.state === training.state);
      } else if (training.targetAudience === 'Community Members') {
        organizer = createdUsers.find(u => u.role === 'ATI' && u.state === training.state);
      } else {
        organizer = createdUsers.find(u => u.role === 'NGO' && u.state === training.state);
      }
      
      // Fallback to SuperAdmin if no state-specific organizer found
      if (!organizer) {
        organizer = superAdmin;
      }

      // Set approval status based on organizer role
      let approvalStatus = 'Pending';
      if (['Admin', 'SuperAdmin'].includes(organizer.role)) {
        approvalStatus = 'Auto-Approved';
      }

      return {
        ...training,
        organizer: organizer._id,
        createdBy: organizer._id,
        approvalStatus: approvalStatus
      };
    });

    await Training.insertMany(trainingsWithOrganizers);
    console.log(`✅ Created ${trainingsWithOrganizers.length} sample trainings`);

    // Display summary
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 SAMPLE LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════');
    console.log('🔴 SuperAdmin:');
    console.log('   Email: superadmin@ndma.gov.in');
    console.log('   Password: super123');
    console.log('\n🟣 Admin (Delhi):');
    console.log('   Email: admin@ndma.gov.in');
    console.log('   Password: admin123');
    console.log('\n🔵 ATI (Delhi):');
    console.log('   Email: ati.delhi@ndma.gov.in');
    console.log('   Password: ati123');
    console.log('\n🟢 NGO (Approved):');
    console.log('   Email: ngo.relief@gmail.com');
    console.log('   Password: ngo123');
    console.log('\n🟡 Volunteer:');
    console.log('   Email: volunteer1@gmail.com');
    console.log('   Password: vol123');
    console.log('\n📊 SUMMARY:');
    console.log(`   👥 Users created: ${createdUsers.length}`);
    console.log(`   📚 Trainings created: ${trainingsWithOrganizers.length}`);
    console.log(`   ✅ Approved users: ${createdUsers.filter(u => u.isApproved).length}`);
    console.log(`   ⏳ Pending approvals: ${createdUsers.filter(u => !u.isApproved).length}`);
    console.log('═══════════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();