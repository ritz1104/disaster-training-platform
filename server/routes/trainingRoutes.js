// server/routes/trainingRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  getStatistics,
  getNearbyTrainings,
  addFeedback
} = require('../controllers/training.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllTrainings);
router.get('/stats/analytics', getStatistics);
router.get('/nearby/:lng/:lat', getNearbyTrainings);
router.get('/:id', getTraining);

// Protected routes
router.post('/', protect, authorize('Admin', 'SuperAdmin', 'ATI', 'NGO'), createTraining);
router.put('/:id', protect, updateTraining);
router.delete('/:id', protect, deleteTraining);
router.post('/:id/feedback', protect, addFeedback);

module.exports = router;