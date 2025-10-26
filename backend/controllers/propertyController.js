const db = require('../config/database');
const { isValidDate, isEndDateAfterStartDate } = require('../utils/validation');

// Search Properties
const searchProperties = async (req, res) => {
  try {
    const { location, startDate, endDate, guests } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required'
      });
    }

    // Validate dates if provided
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (startDate && endDate && !isEndDateAfterStartDate(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Build query
    let query = `
      SELECT 
        p.id,
        p.name,
        p.name as title,
        p.type,
        p.location,
        p.city,
        p.state,
        p.country,
        p.price,
        p.price as price_per_night,
        p.bedrooms,
        p.bathrooms,
        p.max_guests,
        p.max_guests as maxGuests,
        p.image_url,
        p.image_url as imageUrl,
        p.description,
        p.amenities,
        p.available_from,
        p.available_from as availableFrom,
        p.available_to,
        p.available_to as availableTo,
        p.owner_id,
        p.owner_id as ownerId
      FROM properties p
      WHERE p.city LIKE ? OR p.country LIKE ? OR p.location LIKE ?
    `;
    
    const params = [`%${location}%`, `%${location}%`, `%${location}%`];

    // Filter by availability dates
    if (startDate && endDate) {
      query += ` AND p.available_from <= ? AND p.available_to >= ?`;
      params.push(startDate, endDate);

      // Exclude properties with conflicting accepted bookings
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
    }

    // Filter by guest count
    if (guests) {
      query += ` AND p.max_guests >= ?`;
      params.push(parseInt(guests));
    }

    query += ` ORDER BY p.created_at DESC`;

    const [properties] = await db.query(query, params);

    res.json({
      success: true,
      count: properties.length,
      properties
    });

  } catch (error) {
    console.error('Search properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Property Details
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    const [properties] = await db.query(`
      SELECT 
        p.*,
        p.name as title,
        p.price as price_per_night,
        p.max_guests as maxGuests,
        p.image_url as imageUrl,
        p.available_from as availableFrom,
        p.available_to as availableTo,
        p.owner_id as ownerId,
        p.created_at as createdAt,
        o.name as ownerName,
        o.name as owner_name
      FROM properties p
      LEFT JOIN owners o ON p.owner_id = o.id
      WHERE p.id = ?
    `, [id]);

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      property: properties[0]
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Create Property (Owner only)
const createProperty = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    const {
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

    // Validate required fields
    if (!name || !type || !city || !country || !price || !bedrooms || !bathrooms || !maxGuests) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, city, country, price, bedrooms, bathrooms, and maxGuests are required'
      });
    }

    // Validate numeric fields
    if (price <= 0 || bedrooms <= 0 || bathrooms <= 0 || maxGuests <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price, bedrooms, bathrooms, and maxGuests must be positive numbers'
      });
    }

    // Validate dates if provided
    if (availableFrom && !isValidDate(availableFrom)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availableFrom date format. Use YYYY-MM-DD'
      });
    }

    if (availableTo && !isValidDate(availableTo)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availableTo date format. Use YYYY-MM-DD'
      });
    }

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
      amenities || '[]',
      availableFrom || null,
      availableTo || null
    ]);

    const [properties] = await db.query(
      'SELECT * FROM properties WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: properties[0]
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update Property (Owner only)
const updateProperty = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    const { id } = req.params;

    // Check if property exists and belongs to owner
    const [properties] = await db.query(
      'SELECT * FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (properties[0].owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own properties'
      });
    }

    const {
      name, type, location, city, state, country, price,
      bedrooms, bathrooms, maxGuests, imageUrl, description,
      amenities, availableFrom, availableTo
    } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (city !== undefined) { updates.push('city = ?'); values.push(city); }
    if (state !== undefined) { updates.push('state = ?'); values.push(state); }
    if (country !== undefined) { updates.push('country = ?'); values.push(country); }
    if (price !== undefined) { 
      if (price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number'
        });
      }
      updates.push('price = ?'); 
      values.push(price); 
    }
    if (bedrooms !== undefined) { updates.push('bedrooms = ?'); values.push(bedrooms); }
    if (bathrooms !== undefined) { updates.push('bathrooms = ?'); values.push(bathrooms); }
    if (maxGuests !== undefined) { updates.push('max_guests = ?'); values.push(maxGuests); }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); values.push(imageUrl); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (amenities !== undefined) { updates.push('amenities = ?'); values.push(amenities); }
    if (availableFrom !== undefined) { updates.push('available_from = ?'); values.push(availableFrom); }
    if (availableTo !== undefined) { updates.push('available_to = ?'); values.push(availableTo); }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await db.query(
      `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedProperties] = await db.query(
      'SELECT * FROM properties WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: updatedProperties[0]
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete Property (Owner only)
const deleteProperty = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    const { id } = req.params;

    const [properties] = await db.query(
      'SELECT * FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (properties[0].owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own properties'
      });
    }

    await db.query('DELETE FROM properties WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Owner's Properties
const getOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;

    const [properties] = await db.query(`
      SELECT * FROM properties 
      WHERE owner_id = ? 
      ORDER BY created_at DESC
    `, [ownerId]);

    res.json({
      success: true,
      count: properties.length,
      properties
    });

  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
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