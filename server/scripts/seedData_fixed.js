// server/scripts/seedData.js
const mongoose = require('mongoose');
const Training = require('../models/training.model');
const User = require('../models/user.model');
require('dotenv').config();

const sampleTrainings = [
  {
    title: "Flood Management Training - Delhi",
    description: "Comprehensive training on flood disaster management and response protocols",
    date: new Date('2024-12-15'),
    state: "Delhi",
    district: "New Delhi",
    theme: "Flood Management",
    trainingType: "Workshop",
    targetAudience: "Government Officials",
    institution: "NDMA Training Institute",
    participants: {
      planned: 50,
      actual: 45,
      male: 28,
      female: 17
    },
    duration: {
      hours: 8,
      days: 1
    },
    status: "Completed",
    location: {
      type: "Point",
      coordinates: [77.2090, 28.6139],
      address: "NDMA Training Institute, New Delhi"
    },
    trainer: {
      name: "Dr. Rajesh Kumar",
      organization: "NDMA",
      contact: "+91-9876543210"
    }
  },
  {
    title: "Earthquake Safety Workshop - Mumbai",
    description: "Earthquake preparedness and safety measures training",
    date: new Date('2024-12-20'),
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
    duration: {
      hours: 16,
      days: 2
    },
    status: "Scheduled",
    location: {
      type: "Point",
      coordinates: [72.8777, 19.0760],
      address: "IIT Bombay Campus, Mumbai"
    },
    trainer: {
      name: "Prof. Priya Sharma",
      organization: "IIT Bombay",
      contact: "+91-9876543211"
    }
  },
  {
    title: "Cyclone Preparedness - Chennai",
    description: "Cyclone disaster management and coastal area safety",
    date: new Date('2024-11-25'),
    state: "Tamil Nadu",
    district: "Chennai",
    theme: "Cyclone Management",
    trainingType: "Seminar",
    targetAudience: "First Responders",
    institution: "Coast Guard Training Center",
    participants: {
      planned: 60,
      actual: 58,
      male: 32,
      female: 26
    },
    duration: {
      hours: 12,
      days: 1
    },
    status: "Completed",
    location: {
      type: "Point",
      coordinates: [80.2707, 13.0827],
      address: "Coast Guard Training Center, Chennai"
    },
    trainer: {
      name: "Cmdr. Anita Rao",
      organization: "Coast Guard",
      contact: "+91-9876543212"
    }
  },
  {
    title: "Fire Safety Training - Bangalore",
    description: "Industrial fire safety and prevention measures",
    date: new Date('2024-12-10'),
    state: "Karnataka",
    district: "Bengaluru Urban",
    theme: "Fire Safety",
    trainingType: "Workshop",
    targetAudience: "Mixed Audience",
    institution: "Karnataka Fire Services",
    participants: {
      planned: 40,
      actual: 38,
      male: 25,
      female: 13
    },
    duration: {
      hours: 6,
      days: 1
    },
    status: "Ongoing",
    location: {
      type: "Point",
      coordinates: [77.5946, 12.9716],
      address: "Fire Training Institute, Bangalore"
    },
    trainer: {
      name: "Chief Fire Officer Suresh Babu",
      organization: "Karnataka Fire Services",
      contact: "+91-9876543213"
    }
  },
  {
    title: "Landslide Risk Assessment - Shimla",
    description: "Landslide risk assessment and mitigation strategies",
    date: new Date('2024-12-05'),
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
    duration: {
      hours: 20,
      days: 3
    },
    status: "Completed",
    location: {
      type: "Point",
      coordinates: [77.1025, 31.1048],
      address: "Geological Survey Office, Shimla"
    },
    trainer: {
      name: "Dr. Himalaya Singh",
      organization: "Geological Survey of India",
      contact: "+91-9876543214"
    }
  }
];

const sampleUser = {
  name: "Admin User",
  email: "admin@ndma.gov.in",
  password: "admin123",
  role: "Admin",
  organization: "NDMA",
  phone: "+91-9876543210"
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ndma-training-monitor');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Training.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create sample user
    const user = new User(sampleUser);
    await user.save();
    console.log('Created sample user');

    // Create sample trainings with the user as organizer
    const trainingsWithOrganizer = sampleTrainings.map(training => ({
      ...training,
      organizer: user._id
    }));

    await Training.insertMany(trainingsWithOrganizer);
    console.log(`Created ${trainingsWithOrganizer.length} sample trainings`);

    console.log('Database seeded successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@ndma.gov.in');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();