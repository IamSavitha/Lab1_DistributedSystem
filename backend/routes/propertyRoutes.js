const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateJWT, isOwner } = require('../middleware/authMiddleware');

// Combined middleware for owner authentication
const requireOwnerAuth = [authenticateJWT, isOwner];

// Public routes
router.get('/search', propertyController.searchProperties);

// Owner routes - MUST come BEFORE /:id to avoid conflicts
router.get('/owner', requireOwnerAuth, propertyController.getOwnerProperties);
router.post('/', requireOwnerAuth, propertyController.createProperty);
router.put('/:id', requireOwnerAuth, propertyController.updateProperty);
router.delete('/:id', requireOwnerAuth, propertyController.deleteProperty);

// Public route - This must be LAST
router.get('/:id', propertyController.getPropertyById);

module.exports = router;
