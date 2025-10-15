// checkSuperAdmin.js - Check SuperAdmin status
const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  organization: String,
  phone: String,
  state: String,
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: Date,
  permissions: {
    canCreateTraining: { type: Boolean, default: false },
    canApproveTraining: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canViewAllStates: { type: Boolean, default: false },
    canGenerateReports: { type: Boolean, default: false },
    canManageSystem: { type: Boolean, default: false }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const superAdmin = await User.findOne({ role: 'SuperAdmin' });
    
    if (!superAdmin) {
      console.log('❌ SuperAdmin not found');
      return;
    }

    console.log('👤 SuperAdmin Details:');
    console.log('   Name:', superAdmin.name);
    console.log('   Email:', superAdmin.email);
    console.log('   Role:', superAdmin.role);
    console.log('   isApproved:', superAdmin.isApproved);
    console.log('   isActive:', superAdmin.isActive);
    console.log('   State:', superAdmin.state);
    console.log('   Created:', superAdmin.createdAt);
    console.log('   Updated:', superAdmin.updatedAt);
    console.log('   Permissions:', JSON.stringify(superAdmin.permissions, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkSuperAdmin();