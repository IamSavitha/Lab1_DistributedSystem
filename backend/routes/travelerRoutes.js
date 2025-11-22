/**
 * Traveler Routes
 * Routes for traveler authentication and profile management
 * Architecture: Routes -> Controller (consistent with Owner routes)
 */

const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/travelerController');
const { authenticateJWT, isTraveler } = require('../middleware/authMiddleware');

// Combined middleware for traveler authentication (JWT + session fallback)
const requireTravelerAuth = [authenticateJWT, isTraveler];

// Public routes
router.post('/signup', travelerController.signup);
router.post('/login', travelerController.login);

// Protected routes
router.post('/logout', requireTravelerAuth, travelerController.logout);
router.get('/profile', requireTravelerAuth, travelerController.getProfile);
router.put('/profile', requireTravelerAuth, travelerController.updateProfile);
router.post('/profile/image', requireTravelerAuth, travelerController.uploadProfileImage);
router.delete('/profile/image', requireTravelerAuth, travelerController.deleteProfileImage);

// Check authentication status
router.get('/check-auth', requireTravelerAuth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const travelerId = req.user?.id || req.session.travelerId;
    
    const [travelers] = await db.query(
      'SELECT id, name, email FROM travelers WHERE id = ?',
      [travelerId]
    );

    if (travelers.length === 0) {
      return res.status(401).json({ 
        success: false, 
        authenticated: false 
      });
    }

    res.json({
      success: true,
      authenticated: true,
      traveler: travelers[0]
    });

  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check authentication' 
    });
  }
});

module.exports = router;
