// approveSuper.js - Script to approve SuperAdmin
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

async function approveSuper() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find SuperAdmin user
    const superAdmin = await User.findOne({ role: 'SuperAdmin' });
    
    if (!superAdmin) {
      console.log('❌ SuperAdmin not found');
      return;
    }

    console.log('👤 SuperAdmin found:', superAdmin.name, superAdmin.email);
    console.log('📋 Current status:');
    console.log('   - Approved:', superAdmin.isApproved);
    console.log('   - Active:', superAdmin.isActive);
    console.log('   - Role:', superAdmin.role);

    // Update SuperAdmin with full approval and permissions
    const updatedUser = await User.findByIdAndUpdate(
      superAdmin._id,
      {
        $set: {
          isApproved: true,
          isActive: true,
          approvalDate: new Date(),
          permissions: {
            canCreateTraining: true,
            canApproveTraining: true,
            canManageUsers: true,
            canViewAllStates: true,
            canGenerateReports: true,
            canManageSystem: true
          }
        }
      },
      { new: true }
    );

    console.log('✅ SuperAdmin approved successfully!');
    console.log('📋 Updated status:');
    console.log('   - Approved:', updatedUser.isApproved);
    console.log('   - Active:', updatedUser.isActive);
    console.log('   - Permissions:', JSON.stringify(updatedUser.permissions, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

approveSuper();