const db = require('../config/database');
const { sendBookingRequest, sendBookingStatusUpdate } = require('../config/kafka');

// Helper function to auto-update completed bookings
const autoUpdateCompletedBookings = async () => {
  try {
    await db.query(`
      UPDATE bookings
      SET status = 'COMPLETED'
      WHERE status = 'ACCEPTED'
      AND end_date < CURDATE()
    `);
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
    const [properties] = await db.query(
      'SELECT * FROM properties WHERE id = ?',
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const property = properties[0];

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.price;

    // Check for overlapping ACCEPTED or COMPLETED bookings (blocked dates)
    const [overlappingAccepted] = await db.query(`
      SELECT * FROM bookings
      WHERE property_id = ?
      AND status IN ('ACCEPTED', 'COMPLETED')
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `, [propertyId, startDate, startDate, endDate, endDate, startDate, endDate]);

    if (overlappingAccepted.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Property is not available for selected dates'
      });
    }

    // Create booking with PENDING status
    const [result] = await db.query(
      'INSERT INTO bookings (property_id, traveler_id, start_date, end_date, num_guests, total_price, special_requests, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [propertyId, travelerId, startDate, endDate, numGuests, totalPrice, specialRequests || null, 'PENDING']
    );

    const bookingData = {
      id: result.insertId,
      propertyId,
      travelerId,
      propertyName: property.name,
      startDate,
      endDate,
      numGuests,
      totalPrice,
      status: 'PENDING',
      createdAt: new Date().toISOString()
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

    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        p.price AS price_per_night,
          p.image_url as property_image,
          o.name as owner_name,
        o.email as owner_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN owners o ON p.owner_id = o.id
      WHERE b.traveler_id = ?
      AND b.status IN ('PENDING', 'ACCEPTED')
      ORDER BY b.start_date ASC
    `, [travelerId]);

    res.json({
      success: true,
      bookings
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

    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        p.price AS price_per_night,
          p.image_url as property_image,
          o.name as owner_name,
        o.email as owner_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN owners o ON p.owner_id = o.id
      WHERE b.traveler_id = ?
      AND b.status IN ('CANCELLED', 'COMPLETED')
      ORDER BY b.start_date DESC
    `, [travelerId]);

    res.json({
      success: true,
      bookings
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

    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ? AND traveler_id = ?',
      [id, travelerId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    await db.query(
      'UPDATE bookings SET status = ?, cancelled_at = NOW() WHERE id = ?',
      ['CANCELLED', id]
    );

    const [updatedBookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    // Publish status update to Kafka
    try {
      await sendBookingStatusUpdate({
        id: parseInt(id),
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
      booking: updatedBookings[0]
    });

  } catch (error) {
    console.error('Cancel booking traveler error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Booking Requests (PENDING only) - WITH PAGINATION
const getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session.ownerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
      AND b.status = 'PENDING'
    `, [ownerId]);

    const total = countResult[0].total;

    // Get paginated bookings
    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        t.name as traveler_name,
        t.email as traveler_email,
        t.phone as traveler_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN travelers t ON b.traveler_id = t.id
      WHERE p.owner_id = ?
      AND b.status = 'PENDING'
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [ownerId, limit, offset]);

    res.json({
      success: true,
      bookings,
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
    const offset = (page - 1) * limit;

    // Auto-update completed bookings first
    await autoUpdateCompletedBookings();

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
      AND b.status = 'ACCEPTED'
    `, [ownerId]);

    const total = countResult[0].total;

    // Get paginated bookings
    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        t.name as traveler_name,
        t.email as traveler_email,
        t.phone as traveler_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN travelers t ON b.traveler_id = t.id
      WHERE p.owner_id = ?
      AND b.status = 'ACCEPTED'
      ORDER BY b.start_date ASC
      LIMIT ? OFFSET ?
    `, [ownerId, limit, offset]);

    res.json({
      success: true,
      bookings,
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
    const offset = (page - 1) * limit;

    // Auto-update completed bookings first
    await autoUpdateCompletedBookings();

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
      AND b.status = 'COMPLETED'
    `, [ownerId]);

    const total = countResult[0].total;

    // Get paginated bookings
    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        t.name as traveler_name,
        t.email as traveler_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN travelers t ON b.traveler_id = t.id
      WHERE p.owner_id = ?
      AND b.status = 'COMPLETED'
      ORDER BY b.end_date DESC
      LIMIT ? OFFSET ?
    `, [ownerId, limit, offset]);

    res.json({
      success: true,
      bookings,
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
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
      AND b.status = 'CANCELLED'
    `, [ownerId]);

    const total = countResult[0].total;

    // Get paginated bookings
    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        t.name as traveler_name,
        t.email as traveler_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN travelers t ON b.traveler_id = t.id
      WHERE p.owner_id = ?
      AND b.status = 'CANCELLED'
      ORDER BY b.cancelled_at DESC
      LIMIT ? OFFSET ?
    `, [ownerId, limit, offset]);

    res.json({
      success: true,
      bookings,
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

    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        t.name as traveler_name,
        t.email as traveler_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN travelers t ON b.traveler_id = t.id
      WHERE p.owner_id = ?
      AND b.status = 'COMPLETED'
      ORDER BY b.end_date DESC
      LIMIT 10
    `, [ownerId]);

    res.json({
      success: true,
      bookings
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

    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        t.name as traveler_name,
        t.email as traveler_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN travelers t ON b.traveler_id = t.id
      WHERE p.owner_id = ?
      AND b.status = 'PENDING'
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [ownerId]);

    res.json({
      success: true,
      bookings
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

    const [stats] = await db.query(`
      SELECT
        COUNT(CASE WHEN b.status = 'PENDING' THEN 1 END) as pending_count,
        COUNT(CASE WHEN b.status = 'ACCEPTED' THEN 1 END) as accepted_count,
        COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) as completed_count,
        COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) as cancelled_count
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
    `, [ownerId]);

    res.json({
      success: true,
      stats: stats[0]
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
    const [bookings] = await db.query(`
      SELECT b.*, p.owner_id, p.name as property_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Verify ownership
    if (booking.owner_id !== ownerId) {
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
    const [overlappingPendingBookings] = await db.query(`
      SELECT
        b.id,
        b.start_date,
        b.end_date,
        t.name as traveler_name,
        t.email as traveler_email
      FROM bookings b
      JOIN travelers t ON b.traveler_id = t.id
      WHERE b.property_id = ?
      AND b.id != ?
      AND b.status = 'PENDING'
      AND (
        (b.start_date <= ? AND b.end_date >= ?) OR
        (b.start_date <= ? AND b.end_date >= ?) OR
        (b.start_date >= ? AND b.end_date <= ?)
      )
    `, [
      booking.property_id,
      id,
      booking.start_date, booking.start_date,
      booking.end_date, booking.end_date,
      booking.start_date, booking.end_date
    ]);

    // Check for overlapping ACCEPTED/COMPLETED bookings (safety check)
    const [overlappingAcceptedBookings] = await db.query(`
      SELECT
        b.id,
        b.start_date,
        b.end_date,
        t.name as traveler_name
      FROM bookings b
      JOIN travelers t ON b.traveler_id = t.id
      WHERE b.property_id = ?
      AND b.id != ?
      AND b.status IN ('ACCEPTED', 'COMPLETED')
      AND (
        (b.start_date <= ? AND b.end_date >= ?) OR
        (b.start_date <= ? AND b.end_date >= ?) OR
        (b.start_date >= ? AND b.end_date <= ?)
      )
    `, [
      booking.property_id,
      id,
      booking.start_date, booking.start_date,
      booking.end_date, booking.end_date,
      booking.start_date, booking.end_date
    ]);

    if (overlappingAcceptedBookings.length > 0) {
      const overlap = overlappingAcceptedBookings[0];
      return res.status(409).json({
        success: false,
        message: `Cannot accept: Property already has an accepted booking from ${new Date(overlap.start_date).toLocaleDateString()} to ${new Date(overlap.end_date).toLocaleDateString()}`,
        conflictingBooking: overlap
      });
    }

    // Begin transaction
    await db.query('START TRANSACTION');

    try {
      // Accept the booking
      await db.query(
        'UPDATE bookings SET status = ?, accepted_at = NOW() WHERE id = ?',
        ['ACCEPTED', id]
      );

      // Automatically cancel all overlapping PENDING bookings
      if (overlappingPendingBookings.length > 0) {
        const overlappingIds = overlappingPendingBookings.map(b => b.id);

        await db.query(
          `UPDATE bookings
           SET status = 'CANCELLED',
               cancelled_at = NOW(),
               cancellation_reason = 'Automatically cancelled due to accepted overlapping booking'
           WHERE id IN (${overlappingIds.join(',')})`,
          []
        );

        console.log(`Automatically cancelled ${overlappingIds.length} overlapping bookings:`, overlappingIds);
      }

      // Commit transaction
      await db.query('COMMIT');

      // Get updated booking
      const [updatedBookings] = await db.query(
        'SELECT * FROM bookings WHERE id = ?',
        [id]
      );

      // Publish status update to Kafka
      try {
        await sendBookingStatusUpdate({
          id: parseInt(id),
          status: 'ACCEPTED',
          ownerId,
          propertyName: booking.property_name,
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
        booking: updatedBookings[0],
        cancelledBookings: overlappingPendingBookings.length,
        details: overlappingPendingBookings.length > 0
          ? `${overlappingPendingBookings.length} overlapping booking(s) were automatically cancelled`
          : null
      });

    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK');
      throw error;
    }

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

    const [bookings] = await db.query(`
      SELECT b.*, p.owner_id, p.name as property_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    if (booking.owner_id !== ownerId) {
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
    await db.query(
      'UPDATE bookings SET status = ?, cancelled_at = NOW() WHERE id = ?',
      ['CANCELLED', id]
    );

    const [updatedBookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    // Publish status update to Kafka
    try {
      await sendBookingStatusUpdate({
        id: parseInt(id),
        status: 'CANCELLED',
        cancelledBy: 'OWNER',
        ownerId,
        propertyName: booking.property_name,
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
      booking: updatedBookings[0]
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
    const [bookings] = await db.query(`
      SELECT
        b.*,
        p.name as property_name,
        p.location as property_location,
        t.name as traveler_name,
        t.email as traveler_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN travelers t ON b.traveler_id = t.id
      WHERE p.owner_id = ?
      ORDER BY b.created_at DESC
    `, [ownerId]);
    res.json({ success: true, bookings });
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
