const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireTravelerAuth, requireOwnerAuth } = require('../middleware/auth');

// Traveler routes
router.post('/request', requireTravelerAuth, bookingController.createBooking);
router.get('/traveler', requireTravelerAuth, bookingController.getTravelerBookings);
router.put('/:id/cancel', requireTravelerAuth, bookingController.cancelBookingTraveler);

// Owner routes
router.get('/owner', requireOwnerAuth, bookingController.getOwnerBookings);
router.put('/owner/:id/accept', requireOwnerAuth, bookingController.acceptBooking);
router.put('/owner/:id/cancel', requireOwnerAuth, bookingController.cancelBookingOwner);

module.exports = router;