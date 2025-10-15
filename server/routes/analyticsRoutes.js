// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getMapData,
  getStateAnalytics
} = require('../controllers/analytics.controller');

// Public routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/map-data', getMapData);
router.get('/states/:state', getStateAnalytics);

module.exports = router;