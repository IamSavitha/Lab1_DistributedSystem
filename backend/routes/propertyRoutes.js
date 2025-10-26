const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
//const { requireOwnerAuth } = require('../middleware/auth');

// Public routes - must come BEFORE owner routes to avoid conflicts
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getPropertyById);

module.exports = router;