const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/travelerController');
const { requireTravelerAuth } = require('../middleware/auth');

// Public routes
router.post('/signup', travelerController.signup);
router.post('/login', travelerController.login);

// Protected routes
router.post('/logout', requireTravelerAuth, travelerController.logout);
router.get('/profile', requireTravelerAuth, travelerController.getProfile);
router.put('/profile', requireTravelerAuth, travelerController.updateProfile);

module.exports = router;