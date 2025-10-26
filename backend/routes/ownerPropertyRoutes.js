const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { requireOwnerAuth } = require('../middleware/auth');

// All routes here require owner authentication
// Base path: /api/owner/properties

// Get all owner's properties
router.get('/', requireOwnerAuth, propertyController.getOwnerProperties);

// Create new property
router.post('/', requireOwnerAuth, propertyController.createProperty);

// Update property
router.put('/:id', requireOwnerAuth, propertyController.updateProperty);

// Delete property
router.delete('/:id', requireOwnerAuth, propertyController.deleteProperty);

module.exports = router;