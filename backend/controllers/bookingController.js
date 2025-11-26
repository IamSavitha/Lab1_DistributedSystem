const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Traveler = require('../models/Traveler');
const mongoose = require('mongoose');
const { sendBookingRequest, sendBookingStatusUpdate } = require('../config/kafka');

// Helper function to auto-update completed bookings
const autoUpdateCompletedBookings = async () => {
  try {
    await Booking.updateMany(
      {
        status: 'ACCEPTED',
        end_date: { $lt: new Date() }
      },
      { status: 'COMPLETED' }
    );
  } catch (error) {
    console.error('Error auto-updating completed bookings:', error);
  }
};

// Create Booking (Traveler)
const createBooking = async (req, res) => {
  try {
    const travelerId = req.user?.id || req.session.travelerId;
    const { propertyId, startDate, endDate, numGuests, specialRequests } = req.body;

    // Validation
    if (!propertyId || !startDate || !endDate || !numGuests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.price;

    // Check for overlapping ACCEPTED or COMPLETED bookings (blocked dates)
    const overlappingAccepted = await Booking.find({
      property_id: propertyId,
      status: { $in: ['ACCEPTED', 'COMPLETED'] },
      $or: [
        { start_date: { $lte: new Date(startDate) }, end_date: { $gte: new Date(startDate) } },
        { start_date: { $lte: new Date(endDate) }, end_date: { $gte: new Date(endDate) } },
        { start_date: { $gte: new Date(startDate) }, end_date: { $lte: new Date(endDate) } }
      ]
    });

    if (overlappingAccepted.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Property is not available for selected dates'
      });
    }

    // Create booking with PENDING status
    const booking = await Booking.create({
      property_id: propertyId,
      traveler_id: travelerId,
      start_date: startDate,
      end_date: endDate,
      num_guests: numGuests,
      total_price: totalPrice,
      special_requests: specialRequests || null,
      status: 'PENDING'
    });

    const bookingData = {
      id: booking._id,
      propertyId,
      travelerId,
      ownerId: property.owner_id.toString(),
      propertyName: property.name,
      startDate,
      endDate,
      numGuests,
      totalPrice,
      status: 'PENDING',
      createdAt: booking.created_at
    };

    // Publish to Kafka
    try {
      await sendBookingRequest(bookingData);
      console.log('Booking request sent to Kafka:', bookingData.id);
    } catch (kafkaError) {
      console.error('Kafka publish failed (non-blocking):', kafkaError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      booking: bookingData
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Traveler's Bookings
const getTravelerBookings = async (req, res) => {
  try {
    const travelerId = req.user?.id || req.session.travelerId;

    // Auto-update completed bookings first
    await autoUpdateCompletedBookings();

    const bookings = await Booking.find({
      traveler_id: travelerId,
      status: { $in: ['PENDING', 'ACCEPTED'] }
    })
      .populate({
        path: 'property_id',
        select: 'name location price image_url owner_id',
        populate: {
          path: 'owner_id',
          select: 'name email'
        }
      })
      .sort({ start_date: 1 });

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        price_per_night: obj.property_id?.price,
        property_image: obj.property_id?.image_url,
        owner_name: obj.property_id?.owner_id?.name,
        owner_email: obj.property_id?.owner_id?.email
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings
    });

  } catch (error) {
    console.error('Get traveler bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Traveler's Booking History
const getTravelerHistory = async (req, res) => {
  try {
    const travelerId = req.user?.id || req.session.travelerId;

    // Auto-update completed bookings first
    await autoUpdateCompletedBookings();

    const bookings = await Booking.find({
      traveler_id: travelerId,
      status: { $in: ['CANCELLED', 'COMPLETED'] }
    })
      .populate({
        path: 'property_id',
        select: 'name location price image_url owner_id',
        populate: {
          path: 'owner_id',
          select: 'name email'
        }
      })
      .sort({ start_date: -1 });

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        price_per_night: obj.property_id?.price,
        property_image: obj.property_id?.image_url,
        owner_name: obj.property_id?.owner_id?.name,
        owner_email: obj.property_id?.owner_id?.email
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings
    });

  } catch (error) {
    console.error('Get traveler history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Cancel Booking (Traveler)
const cancelBookingTraveler = async (req, res) => {
  try {
    const travelerId = req.user?.id || req.session.travelerId;
    const { id } = req.params;

    const booking = await Booking.findOne({
      _id: id,
      traveler_id: travelerId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: 'CANCELLED', cancelled_at: new Date() },
      { new: true }
    );

    // Publish status update to Kafka
    try {
      await sendBookingStatusUpdate({
        id: id,
        status: 'CANCELLED',
        cancelledBy: 'TRAVELER',
        travelerId,
        updatedAt: new Date().toISOString()
      });
      console.log('Booking cancellation sent to Kafka:', id);
    } catch (kafkaError) {
      console.error('Kafka publish failed (non-blocking):', kafkaError.message);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Cancel booking traveler error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Helper: Get owner's property IDs
const getOwnerPropertyIds = async (ownerId) => {
  const properties = await Property.find({ owner_id: ownerId }).select('_id');
  return properties.map(p => p._id);
};

// Get Owner's Booking Requests (PENDING only) - WITH PAGINATION
const getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const propertyIds = await getOwnerPropertyIds(ownerId);

    // Get total count
    const total = await Booking.countDocuments({
      property_id: { $in: propertyIds },
      status: 'PENDING'
    });

    // Get paginated bookings
    const bookings = await Booking.find({
      property_id: { $in: propertyIds },
      status: 'PENDING'
    })
      .populate('property_id', 'name location')
      .populate('traveler_id', 'name email phone')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        traveler_name: obj.traveler_id?.name,
        traveler_email: obj.traveler_id?.email,
        traveler_phone: obj.traveler_id?.phone
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get owner requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Accepted Bookings - WITH PAGINATION
const getOwnerAcceptedBookings = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Auto-update completed bookings first
    await autoUpdateCompletedBookings();

    const propertyIds = await getOwnerPropertyIds(ownerId);

    // Get total count
    const total = await Booking.countDocuments({
      property_id: { $in: propertyIds },
      status: 'ACCEPTED'
    });

    // Get paginated bookings
    const bookings = await Booking.find({
      property_id: { $in: propertyIds },
      status: 'ACCEPTED'
    })
      .populate('property_id', 'name location')
      .populate('traveler_id', 'name email phone')
      .sort({ start_date: 1 })
      .skip(skip)
      .limit(limit);

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        traveler_name: obj.traveler_id?.name,
        traveler_email: obj.traveler_id?.email,
        traveler_phone: obj.traveler_id?.phone
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get owner accepted bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Completed Bookings - WITH PAGINATION
const getOwnerCompletedBookings = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Auto-update completed bookings first
    await autoUpdateCompletedBookings();

    const propertyIds = await getOwnerPropertyIds(ownerId);

    // Get total count
    const total = await Booking.countDocuments({
      property_id: { $in: propertyIds },
      status: 'COMPLETED'
    });

    // Get paginated bookings
    const bookings = await Booking.find({
      property_id: { $in: propertyIds },
      status: 'COMPLETED'
    })
      .populate('property_id', 'name location')
      .populate('traveler_id', 'name email')
      .sort({ end_date: -1 })
      .skip(skip)
      .limit(limit);

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        traveler_name: obj.traveler_id?.name,
        traveler_email: obj.traveler_id?.email
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get owner completed bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Cancelled Bookings - WITH PAGINATION
const getOwnerCancelledBookings = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const propertyIds = await getOwnerPropertyIds(ownerId);

    // Get total count
    const total = await Booking.countDocuments({
      property_id: { $in: propertyIds },
      status: 'CANCELLED'
    });

    // Get paginated bookings
    const bookings = await Booking.find({
      property_id: { $in: propertyIds },
      status: 'CANCELLED'
    })
      .populate('property_id', 'name location')
      .populate('traveler_id', 'name email')
      .sort({ cancelled_at: -1 })
      .skip(skip)
      .limit(limit);

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        traveler_name: obj.traveler_id?.name,
        traveler_email: obj.traveler_id?.email
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get owner cancelled bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Previous Bookings (for Dashboard - COMPLETED only, limit 10)
const getOwnerPreviousBookings = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;

    // Auto-update completed bookings first
    await autoUpdateCompletedBookings();

    const propertyIds = await getOwnerPropertyIds(ownerId);

    const bookings = await Booking.find({
      property_id: { $in: propertyIds },
      status: 'COMPLETED'
    })
      .populate('property_id', 'name location')
      .populate('traveler_id', 'name email')
      .sort({ end_date: -1 })
      .limit(10);

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        traveler_name: obj.traveler_id?.name,
        traveler_email: obj.traveler_id?.email
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings
    });

  } catch (error) {
    console.error('Get owner previous bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Recent Requests (for Dashboard - PENDING only, limit 10)
const getOwnerRecentRequests = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;

    const propertyIds = await getOwnerPropertyIds(ownerId);

    const bookings = await Booking.find({
      property_id: { $in: propertyIds },
      status: 'PENDING'
    })
      .populate('property_id', 'name location')
      .populate('traveler_id', 'name email')
      .sort({ created_at: -1 })
      .limit(10);

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        traveler_name: obj.traveler_id?.name,
        traveler_email: obj.traveler_id?.email
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings
    });

  } catch (error) {
    console.error('Get owner recent requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Dashboard Stats
const getOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;

    // Auto-update completed bookings first
    await autoUpdateCompletedBookings();

    const propertyIds = await getOwnerPropertyIds(ownerId);

    const stats = await Booking.aggregate([
      { $match: { property_id: { $in: propertyIds } } },
      {
        $group: {
          _id: null,
          pending_count: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          accepted_count: { $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] } },
          completed_count: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          cancelled_count: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        pending_count: 0,
        accepted_count: 0,
        completed_count: 0,
        cancelled_count: 0
      }
    });

  } catch (error) {
    console.error('Get owner stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Accept Booking (Owner) - WITH AUTOMATIC CANCELLATION OF OVERLAPPING BOOKINGS
const acceptBooking = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;
    const { id } = req.params;

    // Get booking with property info
    const booking = await Booking.findById(id)
      .populate('property_id', 'owner_id name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify ownership
    if (!booking.property_id.owner_id.equals(ownerId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept bookings for your own properties'
      });
    }

    // Check current status
    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking with status: ${booking.status}`
      });
    }

    // Find all overlapping PENDING bookings
    const overlappingPendingBookings = await Booking.find({
      property_id: booking.property_id._id,
      _id: { $ne: id },
      status: 'PENDING',
      $or: [
        { start_date: { $lte: booking.start_date }, end_date: { $gte: booking.start_date } },
        { start_date: { $lte: booking.end_date }, end_date: { $gte: booking.end_date } },
        { start_date: { $gte: booking.start_date }, end_date: { $lte: booking.end_date } }
      ]
    }).populate('traveler_id', 'name email');

    // Check for overlapping ACCEPTED/COMPLETED bookings (safety check)
    const overlappingAcceptedBookings = await Booking.find({
      property_id: booking.property_id._id,
      _id: { $ne: id },
      status: { $in: ['ACCEPTED', 'COMPLETED'] },
      $or: [
        { start_date: { $lte: booking.start_date }, end_date: { $gte: booking.start_date } },
        { start_date: { $lte: booking.end_date }, end_date: { $gte: booking.end_date } },
        { start_date: { $gte: booking.start_date }, end_date: { $lte: booking.end_date } }
      ]
    }).populate('traveler_id', 'name');

    if (overlappingAcceptedBookings.length > 0) {
      const overlap = overlappingAcceptedBookings[0];
      return res.status(409).json({
        success: false,
        message: `Cannot accept: Property already has an accepted booking from ${new Date(overlap.start_date).toLocaleDateString()} to ${new Date(overlap.end_date).toLocaleDateString()}`,
        conflictingBooking: overlap
      });
    }

    // Accept the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: 'ACCEPTED', accepted_at: new Date() },
      { new: true }
    );

    // Automatically cancel all overlapping PENDING bookings
    let cancelledCount = 0;
    if (overlappingPendingBookings.length > 0) {
      const overlappingIds = overlappingPendingBookings.map(b => b._id);

      await Booking.updateMany(
        { _id: { $in: overlappingIds } },
        {
          status: 'CANCELLED',
          cancelled_at: new Date(),
          cancellation_reason: 'Automatically cancelled due to accepted overlapping booking'
        }
      );

      cancelledCount = overlappingIds.length;
      console.log(`Automatically cancelled ${cancelledCount} overlapping bookings:`, overlappingIds);
    }

    // Publish status update to Kafka
    try {
      await sendBookingStatusUpdate({
        id: id,
        status: 'ACCEPTED',
        ownerId,
        propertyName: booking.property_id.name,
        travelerId: booking.traveler_id,
        acceptedAt: new Date().toISOString()
      });
      console.log('Booking acceptance sent to Kafka:', id);
    } catch (kafkaError) {
      console.error('Kafka publish failed (non-blocking):', kafkaError.message);
    }

    res.json({
      success: true,
      message: 'Booking accepted successfully',
      booking: updatedBooking,
      cancelledBookings: cancelledCount,
      details: cancelledCount > 0
        ? `${cancelledCount} overlapping booking(s) were automatically cancelled`
        : null
    });

  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Cancel Booking (Owner) - Releases the dates
const cancelBookingOwner = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('property_id', 'owner_id name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.property_id.owner_id.equals(ownerId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel bookings for your own properties'
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    // Cancel the booking (this releases the dates)
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: 'CANCELLED', cancelled_at: new Date() },
      { new: true }
    );

    // Publish status update to Kafka
    try {
      await sendBookingStatusUpdate({
        id: id,
        status: 'CANCELLED',
        cancelledBy: 'OWNER',
        ownerId,
        propertyName: booking.property_id.name,
        travelerId: booking.traveler_id,
        cancelledAt: new Date().toISOString()
      });
      console.log('Booking cancellation sent to Kafka:', id);
    } catch (kafkaError) {
      console.error('Kafka publish failed (non-blocking):', kafkaError.message);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully. The dates are now available for new bookings.',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Cancel booking owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * OWNER: Get all bookings for owner (all statuses - for dashboard stats)
 */
const getOwnerAllBookings = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;
    await autoUpdateCompletedBookings();

    const propertyIds = await getOwnerPropertyIds(ownerId);

    const bookings = await Booking.find({
      property_id: { $in: propertyIds }
    })
      .populate('property_id', 'name location')
      .populate('traveler_id', 'name email')
      .sort({ created_at: -1 });

    // Format response
    const formattedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        property_name: obj.property_id?.name,
        property_location: obj.property_id?.location,
        traveler_name: obj.traveler_id?.name,
        traveler_email: obj.traveler_id?.email
      };
    });

    res.json({ success: true, bookings: formattedBookings });
  } catch (error) {
    console.error('Get owner all bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getOwnerAllBookings,
  createBooking,
  getTravelerBookings,
  getTravelerHistory,
  cancelBookingTraveler,
  getOwnerRequests,
  getOwnerAcceptedBookings,
  getOwnerCompletedBookings,
  getOwnerCancelledBookings,
  getOwnerPreviousBookings,
  getOwnerRecentRequests,
  getOwnerStats,
  acceptBooking,
  cancelBookingOwner
};
