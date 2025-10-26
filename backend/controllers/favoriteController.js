const db = require('../config/database');

// Add to Favorites
const addFavorite = async (req, res) => {
  try {
    const travelerId = req.session.travelerId;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    // Check if property exists
    const [properties] = await db.query(
      'SELECT id FROM properties WHERE id = ?',
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if already favorited
    const [existing] = await db.query(
      'SELECT id FROM favorites WHERE traveler_id = ? AND property_id = ?',
      [travelerId, propertyId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Property is already in your favorites'
      });
    }

    // Add to favorites
    const [result] = await db.query(
      'INSERT INTO favorites (traveler_id, property_id) VALUES (?, ?)',
      [travelerId, propertyId]
    );

    const [favorites] = await db.query(
      'SELECT * FROM favorites WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Property added to favorites',
      favorite: favorites[0]
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Remove from Favorites
const removeFavorite = async (req, res) => {
  try {
    const travelerId = req.session.travelerId;
    const { propertyId } = req.params;

    const [result] = await db.query(
      'DELETE FROM favorites WHERE traveler_id = ? AND property_id = ?',
      [travelerId, propertyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Property removed from favorites'
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get Traveler's Favorites
const getFavorites = async (req, res) => {
  try {
    const travelerId = req.session.travelerId;

    const [favorites] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.type,
        p.location,
        p.city,
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
        f.created_at as favoritedAt,
        f.created_at as favorited_at
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.traveler_id = ?
      ORDER BY f.created_at DESC
    `, [travelerId]);

    res.json({
      success: true,
      count: favorites.length,
      favorites
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Check if Property is Favorited (OPTIMIZATION)
const checkFavorite = async (req, res) => {
  try {
    const travelerId = req.session.travelerId;
    const { propertyId } = req.params;

    if (!propertyId || isNaN(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    const [result] = await db.query(
      'SELECT EXISTS(SELECT 1 FROM favorites WHERE traveler_id = ? AND property_id = ?) as isFavorite',
      [travelerId, propertyId]
    );

    res.json({
      success: true,
      isFavorite: result[0].isFavorite === 1
    });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};