// backend/controllers/propertyController.js
const db = require('../config/database');
const { isValidDate, isEndDateAfterStartDate } = require('../utils/validation');

/**
 * PUBLIC: Search properties
 * Query params: location (required), startDate?, endDate?, guests?
 */
const searchProperties = async (req, res) => {
  try {
    const { location, startDate, endDate, guests } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required'
      });
    }

    // Validate dates
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    if (startDate && endDate && !isEndDateAfterStartDate(startDate, endDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    // Base query — parentheses around OR clause to avoid logic surprises with later ANDs
    let query = `
      SELECT 
        p.id,
        p.name,
        p.name AS title,
        p.type,
        p.location,
        p.city,
        p.state,
        p.country,
        p.price,
        p.price AS price_per_night,
        p.bedrooms,
        p.bathrooms,
        p.max_guests,
        p.max_guests AS maxGuests,
        p.image_url,
        p.image_url AS imageUrl,
        p.description,
        p.amenities,
        p.available_from,
        p.available_from AS availableFrom,
        p.available_to,
        p.available_to AS availableTo,
        p.owner_id,
        p.owner_id AS ownerId
      FROM properties p
      WHERE (p.city LIKE ? OR p.country LIKE ? OR p.location LIKE ?)
    `;
    const params = [`%${location}%`, `%${location}%`, `%${location}%`];

    // Date window
    if (startDate && endDate) {
      query += ` AND p.available_from <= ? AND p.available_to >= ?`;
      params.push(startDate, endDate);

      // Exclude properties with conflicting ACCEPTED bookings
      query += ` AND p.id NOT IN (
        SELECT property_id FROM bookings 
        WHERE status = 'ACCEPTED' 
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
      )`;
      params.push(startDate, startDate, endDate, endDate, startDate, endDate);
    } else if (startDate && !endDate) {
      query += ` AND p.available_to >= ?`;
      params.push(startDate);
    } else if (!startDate && endDate) {
      query += ` AND p.available_from <= ?`;
      params.push(endDate);
    }

    // Guests
    if (guests) {
      const g = parseInt(guests, 10);
      if (!Number.isNaN(g)) {
        query += ` AND p.max_guests >= ?`;
        params.push(g);
      }
    }

    query += ` ORDER BY p.created_at DESC`;

    const [properties] = await db.query(query, params);
    res.json({ success: true, count: properties.length, properties });
  } catch (error) {
    console.error('Search properties error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

/**
 * PUBLIC: Get property details by ID
 * Route param: :id
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    const [properties] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.name AS title,
        p.type,
        p.location,
        p.city,
        p.state,
        p.country,
        p.price,
        p.price AS price_per_night,
        p.bedrooms,
        p.bathrooms,
        p.max_guests,
        p.max_guests AS maxGuests,
        p.image_url,
        p.image_url AS imageUrl,
        p.description,
        p.amenities,
        p.available_from,
        p.available_from AS availableFrom,
        p.available_to,
        p.available_to AS availableTo,
        p.owner_id,
        p.owner_id AS ownerId,
        p.created_at AS createdAt,
        o.name AS ownerName
      FROM properties p
      LEFT JOIN owners o ON p.owner_id = o.id
      WHERE p.id = ?
    `, [id]);

    if (properties.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, property: properties[0] });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

/**
 * OWNER (protected): Create property
 * Body: name, type, location?, city, state?, country, price, bedrooms, bathrooms, maxGuests,
 *       imageUrl?, description?, amenities? (array|string), availableFrom?, availableTo?
 */
const createProperty = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: 'Owner not authenticated' });
    }

    let {
      name,
      type,
      location,
      city,
      state,
      country,
      price,
      bedrooms,
      bathrooms,
      maxGuests,
      imageUrl,
      description,
      amenities,
      availableFrom,
      availableTo
    } = req.body;

    // Required fields
    if (!name || !type || !city || !country || price == null || bedrooms == null || bathrooms == null || maxGuests == null) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, city, country, price, bedrooms, bathrooms, and maxGuests are required'
      });
    }

    // Coerce numbers
    price = Number(price);
    bedrooms = Number(bedrooms);
    bathrooms = Number(bathrooms);
    maxGuests = Number(maxGuests);

    if (price <= 0 || bedrooms <= 0 || bathrooms <= 0 || maxGuests <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price, bedrooms, bathrooms, and maxGuests must be positive numbers'
      });
    }

    // Dates
    if (availableFrom && !isValidDate(availableFrom)) {
      return res.status(400).json({ success: false, message: 'Invalid availableFrom date format. Use YYYY-MM-DD' });
    }
    if (availableTo && !isValidDate(availableTo)) {
      return res.status(400).json({ success: false, message: 'Invalid availableTo date format. Use YYYY-MM-DD' });
    }
    if (availableFrom && availableTo && !isEndDateAfterStartDate(availableFrom, availableTo)) {
      return res.status(400).json({ success: false, message: 'availableTo must be after availableFrom' });
    }

    // Normalize amenities to JSON string if array/object
    if (amenities && typeof amenities !== 'string') {
      try { amenities = JSON.stringify(amenities); } catch { amenities = '[]'; }
    }
    if (!amenities) amenities = '[]';

    const [result] = await db.query(`
      INSERT INTO properties 
      (owner_id, name, type, location, city, state, country, price, bedrooms, bathrooms, max_guests, image_url, description, amenities, available_from, available_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ownerId,
      name,
      type,
      location || `${city}, ${country}`,
      city,
      state || null,
      country,
      price,
      bedrooms,
      bathrooms,
      maxGuests,
      imageUrl || 'https://via.placeholder.com/400x300',
      description || '',
      amenities,
      availableFrom || null,
      availableTo || null
    ]);

    // Return a consistent, aliased shape
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.name AS title,
        p.type,
        p.location,
        p.city,
        p.state,
        p.country,
        p.price,
        p.price AS price_per_night,
        p.bedrooms,
        p.bathrooms,
        p.max_guests,
        p.max_guests AS maxGuests,
        p.image_url,
        p.image_url AS imageUrl,
        p.description,
        p.amenities,
        p.available_from,
        p.available_from AS availableFrom,
        p.available_to,
        p.available_to AS availableTo,
        p.owner_id,
        p.owner_id AS ownerId,
        p.created_at AS createdAt
      FROM properties p
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: rows[0]
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

/**
 * OWNER (protected): Update property
 * Params: :id
 * Body: any subset of fields from createProperty
 */
const updateProperty = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Owner not authenticated' });

    const { id } = req.params;

    // Verify ownership
    const [properties] = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
    if (properties.length === 0) return res.status(404).json({ success: false, message: 'Property not found' });
    if (properties[0].owner_id !== ownerId) {
      return res.status(403).json({ success: false, message: 'You can only update your own properties' });
    }

    let {
      name, type, location, city, state, country, price,
      bedrooms, bathrooms, maxGuests, imageUrl, description,
      amenities, availableFrom, availableTo
    } = req.body;

    const updates = [];
    const values = [];

    // Validate/normalize dates if present
    if (availableFrom && !isValidDate(availableFrom)) {
      return res.status(400).json({ success: false, message: 'Invalid availableFrom date format. Use YYYY-MM-DD' });
    }
    if (availableTo && !isValidDate(availableTo)) {
      return res.status(400).json({ success: false, message: 'Invalid availableTo date format. Use YYYY-MM-DD' });
    }
    if (availableFrom && availableTo && !isEndDateAfterStartDate(availableFrom, availableTo)) {
      return res.status(400).json({ success: false, message: 'availableTo must be after availableFrom' });
    }

    // Numbers (validate if present)
    if (price !== undefined) {
      price = Number(price);
      if (price <= 0) return res.status(400).json({ success: false, message: 'Price must be a positive number' });
      updates.push('price = ?'); values.push(price);
    }
    if (bedrooms !== undefined) { bedrooms = Number(bedrooms); updates.push('bedrooms = ?'); values.push(bedrooms); }
    if (bathrooms !== undefined) { bathrooms = Number(bathrooms); updates.push('bathrooms = ?'); values.push(bathrooms); }
    if (maxGuests !== undefined) { maxGuests = Number(maxGuests); updates.push('max_guests = ?'); values.push(maxGuests); }

    // Strings
    if (name !== undefined)        { updates.push('name = ?'); values.push(name); }
    if (type !== undefined)        { updates.push('type = ?'); values.push(type); }
    if (location !== undefined)    { updates.push('location = ?'); values.push(location); }
    if (city !== undefined)        { updates.push('city = ?'); values.push(city); }
    if (state !== undefined)       { updates.push('state = ?'); values.push(state); }
    if (country !== undefined)     { updates.push('country = ?'); values.push(country); }
    if (imageUrl !== undefined)    { updates.push('image_url = ?'); values.push(imageUrl); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }

    // Amenities — normalize to JSON string if array/object
    if (amenities !== undefined) {
      if (typeof amenities !== 'string') {
        try { amenities = JSON.stringify(amenities); } catch { amenities = '[]'; }
      }
      updates.push('amenities = ?'); values.push(amenities);
    }

    // Dates
    if (availableFrom !== undefined) { updates.push('available_from = ?'); values.push(availableFrom); }
    if (availableTo !== undefined)   { updates.push('available_to = ?'); values.push(availableTo); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await db.query(`UPDATE properties SET ${updates.join(', ')} WHERE id = ?`, values);

    // Return aliased shape
    const [updated] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.name AS title,
        p.type,
        p.location,
        p.city,
        p.state,
        p.country,
        p.price,
        p.price AS price_per_night,
        p.bedrooms,
        p.bathrooms,
        p.max_guests,
        p.max_guests AS maxGuests,
        p.image_url,
        p.image_url AS imageUrl,
        p.description,
        p.amenities,
        p.available_from,
        p.available_from AS availableFrom,
        p.available_to,
        p.available_to AS availableTo,
        p.owner_id,
        p.owner_id AS ownerId,
        p.created_at AS createdAt
      FROM properties p
      WHERE p.id = ?
    `, [id]);

    res.json({ success: true, message: 'Property updated successfully', property: updated[0] });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

/**
 * OWNER (protected): Delete property
 * Params: :id
 */
const deleteProperty = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Owner not authenticated' });

    const { id } = req.params;

    const [properties] = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
    if (properties.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (properties[0].owner_id !== ownerId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own properties' });
    }

    await db.query('DELETE FROM properties WHERE id = ?', [id]);
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

/**
 * OWNER (protected): Get properties owned by the logged-in owner
 */
const getOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: 'Owner not authenticated' });
    }

    const [properties] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.name AS title,
        p.type,
        p.location,
        p.city,
        p.state,
        p.country,
        p.price,
        p.price AS price_per_night,
        p.bedrooms,
        p.bathrooms,
        p.max_guests,
        p.max_guests AS maxGuests,
        p.image_url,
        p.image_url AS imageUrl,
        p.description,
        p.amenities,
        p.available_from,
        p.available_from AS availableFrom,
        p.available_to,
        p.available_to AS availableTo,
        p.owner_id,
        p.owner_id AS ownerId,
        p.created_at AS createdAt
      FROM properties p
      WHERE p.owner_id = ?
      ORDER BY p.created_at DESC
    `, [ownerId]);

    res.json({ success: true, count: properties.length, properties });
  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

module.exports = {
  searchProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties
};
