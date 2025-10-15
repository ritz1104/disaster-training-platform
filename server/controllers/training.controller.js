// server/controllers/trainingController.js
const Training = require('../models/training.model');

// @desc    Get all trainings
// @route   GET /api/trainings
// @access  Public
exports.getAllTrainings = async (req, res) => {
  try {
    const { theme, institution, status, startDate, endDate, limit, page } = req.query;

    // Build query
    let query = {};

    if (theme) query.theme = theme;
    if (institution) query.institution = institution;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 100;
    const skip = (pageNum - 1) * limitNum;

    const trainings = await Training.find(query)
      .populate('organizer', 'name email organization')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Training.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trainings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: trainings
    });
  } catch (error) {
    console.error('Get trainings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trainings',
      error: error.message
    });
  }
};

// @desc    Get single training
// @route   GET /api/trainings/:id
// @access  Public
exports.getTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('organizer', 'name email organization')
      .populate('feedback.user', 'name');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    res.status(200).json({
      success: true,
      data: training
    });
  } catch (error) {
    console.error('Get training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching training',
      error: error.message
    });
  }
};

// @desc    Create new training
// @route   POST /api/trainings
// @access  Private (Admin, SDMA)
exports.createTraining = async (req, res) => {
  try {
    const trainingData = {
      ...req.body,
      organizer: req.user.id
    };

    const training = await Training.create(trainingData);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit('trainingAdded', training);

    res.status(201).json({
      success: true,
      message: 'Training created successfully',
      data: training
    });
  } catch (error) {
    console.error('Create training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating training',
      error: error.message
    });
  }
};

// @desc    Update training
// @route   PUT /api/trainings/:id
// @access  Private (Admin, SDMA, Organizer)
exports.updateTraining = async (req, res) => {
  try {
    let training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    // Check if user is organizer or admin
    if (training.organizer.toString() !== req.user.id && 
        req.user.role !== 'Admin' && 
        req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this training'
      });
    }

    training = await Training.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit('trainingUpdated', training);

    res.status(200).json({
      success: true,
      message: 'Training updated successfully',
      data: training
    });
  } catch (error) {
    console.error('Update training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating training',
      error: error.message
    });
  }
};

// @desc    Delete training
// @route   DELETE /api/trainings/:id
// @access  Private (Admin, SDMA, Organizer)
exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    // Check if user is organizer or admin
    if (training.organizer.toString() !== req.user.id && 
        req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this training'
      });
    }

    await training.deleteOne();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit('trainingDeleted', { id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Training deleted successfully'
    });
  } catch (error) {
    console.error('Delete training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting training',
      error: error.message
    });
  }
};

// @desc    Get trainings statistics
// @route   GET /api/trainings/stats/analytics
// @access  Public
exports.getStatistics = async (req, res) => {
  try {
    const totalTrainings = await Training.countDocuments();
    const totalParticipants = await Training.aggregate([
      { $group: { _id: null, total: { $sum: '$participants' } } }
    ]);

    const trainingsByTheme = await Training.aggregate([
      { $group: { _id: '$theme', count: { $sum: 1 }, participants: { $sum: '$participants' } } },
      { $sort: { count: -1 } }
    ]);

    const trainingsByInstitution = await Training.aggregate([
      { $group: { _id: '$institution', count: { $sum: 1 }, participants: { $sum: '$participants' } } },
      { $sort: { count: -1 } }
    ]);

    const trainingsByStatus = await Training.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const monthlyTrend = await Training.aggregate([
      { 
        $group: { 
          _id: { 
            year: { $year: '$date' }, 
            month: { $month: '$date' } 
          },
          count: { $sum: 1 },
          participants: { $sum: '$participants' }
        } 
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTrainings,
        totalParticipants: totalParticipants[0]?.total || 0,
        trainingsByTheme,
        trainingsByInstitution,
        trainingsByStatus,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get nearby trainings
// @route   GET /api/trainings/nearby/:lng/:lat
// @access  Public
exports.getNearbyTrainings = async (req, res) => {
  try {
    const { lng, lat } = req.params;
    const maxDistance = req.query.maxDistance || 100000; // 100km default

    const trainings = await Training.findNearby(
      parseFloat(lng), 
      parseFloat(lat), 
      parseInt(maxDistance)
    );

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings
    });
  } catch (error) {
    console.error('Get nearby trainings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby trainings',
      error: error.message
    });
  }
};

// @desc    Add feedback to training
// @route   POST /api/trainings/:id/feedback
// @access  Private
exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    // Check if user already gave feedback
    const existingFeedback = training.feedback.find(
      f => f.user.toString() === req.user.id
    );

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already provided feedback for this training'
      });
    }

    training.feedback.push({
      user: req.user.id,
      rating,
      comment
    });

    await training.save();

    res.status(201).json({
      success: true,
      message: 'Feedback added successfully',
      data: training
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding feedback',
      error: error.message
    });
  }
};