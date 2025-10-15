// Additional training management functions

// @desc    Register for training
// @route   POST /api/trainings/:id/register
// @access  Private (Authenticated users)
const registerForTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    // Check if training is public or user has permission
    if (!training.isPublic && req.user.role === 'Volunteer') {
      return res.status(403).json({
        success: false,
        message: 'This training is not open for public registration'
      });
    }

    await training.registerUser(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Successfully registered for training',
      data: {
        trainingId: training._id,
        userId: req.user._id,
        registeredAt: new Date()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/trainings/:id/register
// @access  Private (Authenticated users)
const cancelRegistration = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    training.registrations = training.registrations.filter(
      reg => reg.user.toString() !== req.user._id.toString()
    );

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling registration',
      error: error.message
    });
  }
};

// @desc    Mark attendance
// @route   PUT /api/trainings/:id/attendance
// @access  Private (Organizer/Admin only)
const markAttendance = async (req, res) => {
  try {
    const { userId, checkIn } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    // Check permissions - only organizer or admin can mark attendance
    if (training.organizer.toString() !== req.user._id.toString() && 
        !['Admin', 'SuperAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark attendance for this training'
      });
    }

    await training.markAttendance(userId, checkIn);

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve training
// @route   PUT /api/trainings/:id/approve
// @access  Private (Admin/SuperAdmin only)
const approveTraining = async (req, res) => {
  try {
    const { approve, reason } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    // Check state permission for Admin
    if (req.user.role === 'Admin' && req.user.state !== 'All' && 
        training.state !== req.user.state) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve trainings in your assigned state'
      });
    }

    if (approve) {
      await training.approve(req.user._id);
    } else {
      await training.reject(req.user._id, reason);
    }

    res.status(200).json({
      success: true,
      message: `Training ${approve ? 'approved' : 'rejected'} successfully`,
      data: {
        approvalStatus: training.approvalStatus,
        approvedBy: req.user._id,
        approvalDate: training.approvalDate
      }
    });
  } catch (error) {
    console.error('Approve training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing training approval',
      error: error.message
    });
  }
};

// @desc    Get training registrations
// @route   GET /api/trainings/:id/registrations
// @access  Private (Organizer/Admin only)
const getTrainingRegistrations = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('registrations.user', 'name email phone organization role');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    // Check permissions
    if (training.organizer.toString() !== req.user._id.toString() && 
        !['Admin', 'SuperAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations for this training'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        trainingId: training._id,
        trainingTitle: training.title,
        totalRegistrations: training.registrations.length,
        maxParticipants: training.maxParticipants,
        registrations: training.registrations
      }
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message
    });
  }
};

module.exports = {
  registerForTraining,
  cancelRegistration,
  markAttendance,
  approveTraining,
  getTrainingRegistrations
};