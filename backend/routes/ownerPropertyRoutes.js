// backend/routes/ownerPropertyRoutes.js
const express = require('express');
const router = express.Router();
const {
  getOwnerProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');

const { requireOwnerAuth } = require('../middleware/auth');

// All routes under /api/owner/properties require owner authentication
router.use(requireOwnerAuth);

// GET all properties owned by the logged-in owner
router.get('/', getOwnerProperties);

// GET a single property by ID (for editing)
router.get('/:id', getPropertyById);

// CREATE a new property
router.post('/', createProperty);

// UPDATE an existing property
router.put('/:id', updateProperty);

// DELETE a property
router.delete('/:id', deleteProperty);

/**
 * @route   POST /api/owner/properties/:id/image
 * @desc    Upload property image (Base64)
 * @access  Private (Owner)
 */
router.post('/:id/image', async (req, res) => {
  try {
    const propertyId = req.params.id;
    const ownerId = req.session.ownerId;
    const { imageData } = req.body;
    const db = req.app.get('db');

    // Validate image data
    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'No image data provided'
      });
    }

    // Validate base64 image format
    if (!imageData.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Please upload JPEG, PNG, GIF, or WebP'
      });
    }

    // Check size (limit to ~2MB base64 which is ~1.5MB actual)
    if (imageData.length > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Image too large. Maximum size is 1.5MB'
      });
    }

    // Verify property belongs to owner
    const [properties] = await db.query(
      'SELECT id FROM properties WHERE id = ? AND owner_id = ?',
      [propertyId, ownerId]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found or access denied'
      });
    }

    // Update database with new image
    await db.query(
      'UPDATE properties SET property_image = ? WHERE id = ? AND owner_id = ?',
      [imageData, propertyId, ownerId]
    );

    res.json({
      success: true,
      message: 'Property image uploaded successfully',
      imageUrl: imageData
    });

  } catch (error) {
    console.error('Property image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload property image',
      details: error.message
    });
  }
});

module.exports = router;
