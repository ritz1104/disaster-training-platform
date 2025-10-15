// server/controllers/analytics.controller.js
const Training = require('../models/training.model');

// @desc    Get comprehensive analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Public
const getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, state, theme } = req.query;
    
    // Build filter query
    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }
    if (state) matchQuery.state = state;
    if (theme) matchQuery.theme = theme;

    // Parallel execution of all analytics queries
    const [
      totalStats,
      stateWiseData,
      themeWiseData,
      monthlyTrend,
      statusDistribution,
      trainingTypeData,
      audienceData,
      recentTrainings,
      topStates,
      participantTrends
    ] = await Promise.all([
      // Total statistics
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalTrainings: { $sum: 1 },
            totalPlannedParticipants: { $sum: '$participants.planned' },
            totalActualParticipants: { $sum: '$participants.actual' },
            totalMaleParticipants: { $sum: '$participants.male' },
            totalFemaleParticipants: { $sum: '$participants.female' },
            avgDuration: { $avg: '$duration.hours' },
            totalTrainingHours: { $sum: '$duration.hours' }
          }
        }
      ]),

      // State-wise statistics
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$state',
            count: { $sum: 1 },
            plannedParticipants: { $sum: '$participants.planned' },
            actualParticipants: { $sum: '$participants.actual' },
            totalHours: { $sum: '$duration.hours' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Theme-wise statistics
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$theme',
            count: { $sum: 1 },
            plannedParticipants: { $sum: '$participants.planned' },
            actualParticipants: { $sum: '$participants.actual' },
            avgDuration: { $avg: '$duration.hours' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Monthly trend
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            count: { $sum: 1 },
            plannedParticipants: { $sum: '$participants.planned' },
            actualParticipants: { $sum: '$participants.actual' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Status distribution
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Training type distribution
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$trainingType',
            count: { $sum: 1 },
            totalParticipants: { $sum: '$participants.actual' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Target audience distribution
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$targetAudience',
            count: { $sum: 1 },
            totalParticipants: { $sum: '$participants.actual' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Recent trainings
      Training.find(matchQuery)
        .populate('organizer', 'name organization')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title date state theme status participants location'),

      // Top performing states
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$state',
            totalTrainings: { $sum: 1 },
            totalParticipants: { $sum: '$participants.actual' },
            avgParticipants: { $avg: '$participants.actual' }
          }
        },
        { $sort: { totalParticipants: -1 } },
        { $limit: 5 }
      ]),

      // Gender-wise participation trends
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            maleParticipants: { $sum: '$participants.male' },
            femaleParticipants: { $sum: '$participants.female' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Calculate additional metrics
    const totalStatsData = totalStats[0] || {
      totalTrainings: 0,
      totalPlannedParticipants: 0,
      totalActualParticipants: 0,
      totalMaleParticipants: 0,
      totalFemaleParticipants: 0,
      avgDuration: 0,
      totalTrainingHours: 0
    };

    const participationRate = totalStatsData.totalPlannedParticipants > 0 
      ? (totalStatsData.totalActualParticipants / totalStatsData.totalPlannedParticipants * 100).toFixed(2)
      : 0;

    const genderRatio = totalStatsData.totalFemaleParticipants + totalStatsData.totalMaleParticipants > 0
      ? {
          male: ((totalStatsData.totalMaleParticipants / (totalStatsData.totalMaleParticipants + totalStatsData.totalFemaleParticipants)) * 100).toFixed(2),
          female: ((totalStatsData.totalFemaleParticipants / (totalStatsData.totalMaleParticipants + totalStatsData.totalFemaleParticipants)) * 100).toFixed(2)
        }
      : { male: 0, female: 0 };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          ...totalStatsData,
          participationRate: parseFloat(participationRate),
          genderRatio,
          avgParticipantsPerTraining: totalStatsData.totalTrainings > 0 
            ? Math.round(totalStatsData.totalActualParticipants / totalStatsData.totalTrainings)
            : 0
        },
        stateWise: stateWiseData,
        themeWise: themeWiseData,
        monthlyTrend,
        statusDistribution,
        trainingTypes: trainingTypeData,
        targetAudience: audienceData,
        recentTrainings,
        topStates,
        participantTrends
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
};

// @desc    Get map data for GIS visualization
// @route   GET /api/analytics/map-data
// @access  Public
const getMapData = async (req, res) => {
  try {
    const { status, theme, state, startDate, endDate } = req.query;

    let matchQuery = {};
    if (status) matchQuery.status = status;
    if (theme) matchQuery.theme = theme;
    if (state) matchQuery.state = state;
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const trainings = await Training.find(matchQuery)
      .populate('organizer', 'name organization')
      .select('title date state district theme status participants location trainer trainingType targetAudience')
      .lean();

    // Format data for GeoJSON
    const geoJsonData = {
      type: 'FeatureCollection',
      features: trainings.map(training => ({
        type: 'Feature',
        geometry: training.location,
        properties: {
          id: training._id,
          title: training.title,
          date: training.date,
          state: training.state,
          district: training.district,
          theme: training.theme,
          status: training.status,
          participants: training.participants,
          trainer: training.trainer,
          trainingType: training.trainingType,
          targetAudience: training.targetAudience,
          organizer: training.organizer
        }
      }))
    };

    // State-wise summary for choropleth mapping
    const stateSummary = await Training.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$state',
          totalTrainings: { $sum: 1 },
          totalParticipants: { $sum: '$participants.actual' },
          avgParticipants: { $avg: '$participants.actual' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        geoJson: geoJsonData,
        stateSummary,
        totalFeatures: trainings.length
      }
    });

  } catch (error) {
    console.error('Map data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching map data',
      error: error.message
    });
  }
};

// @desc    Get state-wise detailed analytics
// @route   GET /api/analytics/states/:state
// @access  Public
const getStateAnalytics = async (req, res) => {
  try {
    const { state } = req.params;
    const { startDate, endDate } = req.query;

    let matchQuery = { state };
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const [
      overview,
      districtWise,
      themeWise,
      monthlyTrend,
      trainingTypes
    ] = await Promise.all([
      // State overview
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalTrainings: { $sum: 1 },
            totalParticipants: { $sum: '$participants.actual' },
            avgParticipants: { $avg: '$participants.actual' },
            totalHours: { $sum: '$duration.hours' }
          }
        }
      ]),

      // District-wise breakdown
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$district',
            count: { $sum: 1 },
            participants: { $sum: '$participants.actual' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Theme-wise breakdown
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$theme',
            count: { $sum: 1 },
            participants: { $sum: '$participants.actual' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Monthly trend for the state
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            count: { $sum: 1 },
            participants: { $sum: '$participants.actual' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Training types in the state
      Training.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$trainingType',
            count: { $sum: 1 },
            participants: { $sum: '$participants.actual' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        state,
        overview: overview[0] || {},
        districtWise,
        themeWise,
        monthlyTrend,
        trainingTypes
      }
    });

  } catch (error) {
    console.error('State analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching state analytics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getMapData,
  getStateAnalytics
};