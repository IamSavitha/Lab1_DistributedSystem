const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateJWT, isTraveler, isOwner } = require('../middleware/authMiddleware');

// Combined middleware for authentication
const requireTravelerAuth = [authenticateJWT, isTraveler];
const requireOwnerAuth = [authenticateJWT, isOwner];

// Traveler routes
router.post('/request', requireTravelerAuth, bookingController.createBooking);
router.get('/traveler', requireTravelerAuth, bookingController.getTravelerBookings);
router.get('/traveler/history', requireTravelerAuth, bookingController.getTravelerHistory);  // 新增路由
router.put('/:id/cancel', requireTravelerAuth, bookingController.cancelBookingTraveler);

// Owner routes
router.get('/owner', requireOwnerAuth, bookingController.getOwnerBookings);
router.put('/owner/:id/accept', requireOwnerAuth, bookingController.acceptBooking);
router.put('/owner/:id/cancel', requireOwnerAuth, bookingController.cancelBookingOwner);

module.exports = router;
