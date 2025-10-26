const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { requireTravelerAuth } = require('../middleware/auth');

// All routes require traveler authentication
router.post('/', requireTravelerAuth, favoriteController.addFavorite);
router.delete('/:propertyId', requireTravelerAuth, favoriteController.removeFavorite);
router.get('/', requireTravelerAuth, favoriteController.getFavorites);
router.get('/check/:propertyId', requireTravelerAuth, favoriteController.checkFavorite);

module.exports = router;