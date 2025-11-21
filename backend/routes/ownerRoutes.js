const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticateJWT, isOwner } = require('../middleware/authMiddleware');

// Combined middleware for owner authentication (JWT + session fallback)
const requireOwnerAuth = [authenticateJWT, isOwner];

// Public routes
router.post('/signup', ownerController.signup);
router.post('/login', ownerController.login);

// Protected routes
router.post('/logout', requireOwnerAuth, ownerController.logout);
router.get('/profile', requireOwnerAuth, ownerController.getProfile);
router.put('/profile', requireOwnerAuth, ownerController.updateProfile);

module.exports = router;