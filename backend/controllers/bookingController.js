const db = require('../config/database');
const { isValidDate, isEndDateAfterStartDate, calculateNights } = require('../utils/validation');

// Create Booking Request (Traveler)
const createBooking = async (req, res) => {
  try {
    const travelerId = req.session.travelerId;
    const { propertyId, startDate, endDate, guests } = req.body;

    // Validate required fields
    if (!propertyId || !startDate || !endDate || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Property ID, start date, end date, and guests are required'
      });
    }

    // Validate dates
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (!isEndDateAfterStartDate(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
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

    // Check max guests
    if (guests > property.max_guests) {
      return res.status(400).json({
        success: false,
        message: 'Number of guests exceeds property maximum'
      });
    }

    // Check for conflicting accepted bookings
    const [conflictingBookings] = await db.query(`
      SELECT * FROM bookings 
      WHERE property_id = ? 
      AND status = 'ACCEPTED'
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `, [propertyId, startDate, startDate, endDate, endDate, startDate, endDate]);

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Property is not available for selected dates'
      });
    }

    // Calculate total price
    const nights = calculateNights(startDate, endDate);
    const totalPrice = nights * property.price;

    // Create booking
    const [result] = await db.query(`
      INSERT INTO bookings 
      (property_id, traveler_id, start_date, end_date, guests, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
    `, [propertyId, travelerId, startDate, endDate, guests, totalPrice]);

    const [bookings] = await db.query(
      'SELECT *, start_date as startDate, end_date as endDate, total_price as totalPrice, created_at as createdAt FROM bookings WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      booking: bookings[0]
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
    const travelerId = req.session.travelerId;
    const { status } = req.query;

    let query = `
      SELECT 
        b.*,
        b.start_date as startDate,
        b.end_date as endDate,
        b.total_price as totalPrice,
        b.created_at as createdAt,
        b.property_id as propertyId,
        p.name as propertyName,
        p.name as property_name,
        p.image_url as propertyImage,
        p.image_url as property_image,
        p.location as propertyLocation,
        p.location as property_location,
        p.type as propertyType,
        p.type as property_type,
        p.price as pricePerNight,
        p.price as price_per_night,
        p.owner_id,
        o.name as ownerName,
        o.name as owner_name,
        o.email as ownerEmail,
        o.email as owner_email,
        DATEDIFF(b.end_date, b.start_date) as nights
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN owners o ON p.owner_id = o.id
      WHERE b.traveler_id = ?
    `;

    const params = [travelerId];

    if (status) {
      query += ` AND b.status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY b.created_at DESC`;

    const [bookings] = await db.query(query, params);

    res.json({
      success: true,
      count: bookings.length,
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

// Get Traveler's History (Past Completed Bookings)
const getTravelerHistory = async (req, res) => {
  try {
    const travelerId = req.session.travelerId;

    // Query for past bookings (end_date < today and status = ACCEPTED or COMPLETED)
    const query = `
      SELECT 
        b.id,
        b.start_date as startDate,
        b.end_date as endDate,
        b.guests,
        b.total_price as totalPrice,
        b.status,
        b.created_at as createdAt,
        p.id as property_id,
        p.name as property_name,
        p.image_url,
        p.location,
        JSON_OBJECT(
          'id', p.id,
          'name', p.name,
          'imageUrl', p.image_url,
          'image_url', p.image_url,
          'location', p.location,
          'type', p.type,
          'price', p.price
        ) as property
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.traveler_id = ?
      AND b.end_date < CURDATE()
      AND b.status IN ('ACCEPTED', 'COMPLETED')
      ORDER BY b.end_date DESC
    `;

    const [bookings] = await db.query(query, [travelerId]);

    // Parse the JSON property field for each booking
    const historyWithParsedProperty = bookings.map(booking => ({
      ...booking,
      property: typeof booking.property === 'string' ? JSON.parse(booking.property) : booking.property
    }));

    res.json({
      success: true,
      count: historyWithParsedProperty.length,
      history: historyWithParsedProperty
    });

  } catch (error) {
    console.error('Get traveler history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
};

// Cancel Booking (Traveler)
const cancelBookingTraveler = async (req, res) => {
  try {
    const travelerId = req.session.travelerId;
    const { id } = req.params;

    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    if (booking.traveler_id !== travelerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }

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

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBookings[0]
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Bookings - 修复：返回嵌套的property和traveler对象
const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    const { status } = req.query;

    let query = `
      SELECT 
        b.id,
        b.property_id,
        b.traveler_id,
        b.start_date,
        b.end_date,
        b.guests,
        b.total_price,
        b.status,
        b.created_at,
        b.accepted_at,
        b.cancelled_at,
        DATEDIFF(b.end_date, b.start_date) as nights,
        p.id as p_id,
        p.name as p_name,
        p.image_url as p_image_url,
        p.location as p_location,
        p.type as p_type,
        p.price as p_price,
        p.max_guests as p_max_guests,
        t.id as t_id,
        t.name as t_name,
        t.email as t_email,
        t.phone as t_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN travelers t ON b.traveler_id = t.id
      WHERE p.owner_id = ?
    `;

    const params = [ownerId];

    if (status) {
      query += ` AND b.status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY b.created_at DESC`;

    const [rows] = await db.query(query, params);

    // 转换为嵌套结构
    const bookings = rows.map(row => ({
      id: row.id,
      propertyId: row.property_id,
      travelerId: row.traveler_id,
      startDate: row.start_date,
      endDate: row.end_date,
      start_date: row.start_date,
      end_date: row.end_date,
      guests: row.guests,
      totalPrice: row.total_price,
      total_price: row.total_price,
      status: row.status,
      createdAt: row.created_at,
      created_at: row.created_at,
      acceptedAt: row.accepted_at,
      accepted_at: row.accepted_at,
      cancelledAt: row.cancelled_at,
      cancelled_at: row.cancelled_at,
      nights: row.nights,
      property: {
        id: row.p_id,
        name: row.p_name,
        image_url: row.p_image_url,
        imageUrl: row.p_image_url,
        location: row.p_location,
        type: row.p_type,
        price: row.p_price,
        max_guests: row.p_max_guests
      },
      traveler: {
        id: row.t_id,
        name: row.t_name,
        email: row.t_email,
        phone: row.t_phone
      }
    }));

    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings
    });

  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
};

// Accept Booking (Owner) - 增强：确保日期冲突检查
const acceptBooking = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
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

    if (booking.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept bookings for your own properties'
      });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be accepted'
      });
    }

    // 再次检查日期冲突（防止并发接受）
    const [conflictingBookings] = await db.query(`
      SELECT * FROM bookings 
      WHERE property_id = ? 
      AND status = 'ACCEPTED'
      AND id != ?
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `, [
      booking.property_id, 
      id,
      booking.start_date, booking.start_date,
      booking.end_date, booking.end_date,
      booking.start_date, booking.end_date
    ]);

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot accept: Property is already booked for these dates'
      });
    }

    // 接受booking
    await db.query(
      'UPDATE bookings SET status = ?, accepted_at = NOW() WHERE id = ?',
      ['ACCEPTED', id]
    );

    const [updatedBookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Booking accepted successfully. Property is now blocked for these dates.',
      booking: updatedBookings[0]
    });

  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Cancel Booking (Owner) - 增强：释放日期
const cancelBookingOwner = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
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

    // 取消booking，释放日期
    await db.query(
      'UPDATE bookings SET status = ?, cancelled_at = NOW() WHERE id = ?',
      ['CANCELLED', id]
    );

    const [updatedBookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Dates have been released.',
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

module.exports = {
  createBooking,
  getTravelerBookings,
  getTravelerHistory,
  cancelBookingTraveler,
  getOwnerBookings,
  acceptBooking,
  cancelBookingOwner
};
