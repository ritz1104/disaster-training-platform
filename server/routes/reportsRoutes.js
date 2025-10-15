// server/routes/reportsRoutes.js
const express = require('express');
const router = express.Router();
const {
  generatePDFReport,
  generateCSVReport,
  getReportStats
} = require('../controllers/reports.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protected routes - Admin and SuperAdmin only
router.get('/pdf', protect, authorize('Admin', 'SuperAdmin'), generatePDFReport);
router.get('/csv', protect, authorize('Admin', 'SuperAdmin'), generateCSVReport);
router.get('/stats', protect, authorize('Admin', 'SuperAdmin'), getReportStats);

module.exports = router;