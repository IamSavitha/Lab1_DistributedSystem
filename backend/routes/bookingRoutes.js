const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireTravelerAuth, requireOwnerAuth } = require('../middleware/auth');

// Traveler routes
router.post('/request', requireTravelerAuth, bookingController.createBooking);
router.get('/traveler', requireTravelerAuth, bookingController.getTravelerBookings);
router.get('/traveler/history', requireTravelerAuth, bookingController.getTravelerHistory);
router.put('/:id/cancel', requireTravelerAuth, bookingController.cancelBookingTraveler);

// Owner routes - Requests (PENDING only)
router.get('/owner/requests', requireOwnerAuth, bookingController.getOwnerRequests);

// Owner routes - Bookings by status (with pagination)
router.get('/owner/accepted', requireOwnerAuth, bookingController.getOwnerAcceptedBookings);
router.get('/owner/completed', requireOwnerAuth, bookingController.getOwnerCompletedBookings);
router.get('/owner/cancelled', requireOwnerAuth, bookingController.getOwnerCancelledBookings);

// Owner routes - Dashboard data (limited to 10 items)
router.get('/owner/previous', requireOwnerAuth, bookingController.getOwnerPreviousBookings);
router.get('/owner/recent-requests', requireOwnerAuth, bookingController.getOwnerRecentRequests);
router.get('/owner/stats', requireOwnerAuth, bookingController.getOwnerStats);

// Owner routes - Actions
router.put('/owner/:id/accept', requireOwnerAuth, bookingController.acceptBooking);
router.put('/owner/:id/cancel', requireOwnerAuth, bookingController.cancelBookingOwner);

module.exports = router;
