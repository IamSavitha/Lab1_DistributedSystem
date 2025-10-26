const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/travelerController');
const { requireTravelerAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/signup', travelerController.signup);
router.post('/login', travelerController.login);

// Protected routes
router.post('/logout', requireTravelerAuth, travelerController.logout);
router.get('/profile', requireTravelerAuth, travelerController.getProfile);
router.put('/profile', requireTravelerAuth, travelerController.updateProfile);

router.post('/upload-image', requireTravelerAuth, upload.single('image'), travelerController.uploadProfileImage);

module.exports = router;