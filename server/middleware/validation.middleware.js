const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['SuperAdmin', 'Admin', 'ATI', 'NGO', 'Volunteer'])
    .withMessage('Invalid role specified'),
  
  body('organization')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  validate
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Training creation validation
const validateTrainingCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('type')
    .isIn(['simulation', 'workshop', 'drill', 'seminar', 'field-exercise'])
    .withMessage('Invalid training type'),
  
  body('disasterType')
    .isIn(['earthquake', 'flood', 'fire', 'tornado', 'hurricane', 'chemical-spill', 'medical-emergency', 'cyber-attack'])
    .withMessage('Invalid disaster type'),
  
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('duration')
    .isInt({ min: 15, max: 1440 })
    .withMessage('Duration must be between 15 minutes and 24 hours'),
  
  body('maxParticipants')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max participants must be between 1 and 1000'),
  
  body('location.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  
  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('scheduledDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  
  validate
];

// User update validation
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('role')
    .optional()
    .isIn(['SuperAdmin', 'Admin', 'ATI', 'NGO', 'Volunteer'])
    .withMessage('Invalid role specified'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('isApproved')
    .optional()
    .isBoolean()
    .withMessage('isApproved must be a boolean'),
  
  validate
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  validate
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

module.exports = {
  validate,
  validateUserRegistration,
  validateUserLogin,
  validateTrainingCreation,
  validateUserUpdate,
  validateObjectId,
  validatePagination
};