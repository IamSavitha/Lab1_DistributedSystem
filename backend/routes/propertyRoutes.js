const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { requireOwnerAuth } = require('../middleware/auth');

// Public routes
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getPropertyById);

// Owner protected routes
router.post('/', requireOwnerAuth, propertyController.createProperty);
router.put('/:id', requireOwnerAuth, propertyController.updateProperty);
router.delete('/:id', requireOwnerAuth, propertyController.deleteProperty);
router.get('/', requireOwnerAuth, propertyController.getOwnerProperties);

module.exports = router;