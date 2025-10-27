// backend/routes/ownerPropertyRoutes.js
const express = require('express');
const router = express.Router();
const {
  getOwnerProperties,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');



const { requireOwnerAuth } = require('../middleware/auth');

// All routes under /api/owner/properties require owner authentication
router.use(requireOwnerAuth);

// GET all properties owned by the logged-in owner
router.get('/', getOwnerProperties);

// CREATE a new property
router.post('/', createProperty);

// UPDATE an existing property
router.put('/:id', updateProperty);

// DELETE a property
router.delete('/:id', deleteProperty);
// backend/routes/ownerPropertyRoutes.js

router.use(requireOwnerAuth);
router.get('/', getOwnerProperties);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

module.exports = router;
