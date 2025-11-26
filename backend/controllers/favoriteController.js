const Favorite = require('../models/Favorite');
const Property = require('../models/Property');
const mongoose = require('mongoose');

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

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
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

    // Check if already favorited
    const existing = await Favorite.findOne({
      traveler_id: travelerId,
      property_id: propertyId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Property is already in your favorites'
      });
    }

    // Add to favorites
    const favorite = await Favorite.create({
      traveler_id: travelerId,
      property_id: propertyId
    });

    res.status(201).json({
      success: true,
      message: 'Property added to favorites',
      favorite
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

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    const result = await Favorite.findOneAndDelete({
      traveler_id: travelerId,
      property_id: propertyId
    });

    if (!result) {
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

    const favorites = await Favorite.find({ traveler_id: travelerId })
      .populate('property_id', 'name type location city country price bedrooms bathrooms max_guests image_url description')
      .sort({ created_at: -1 });

    // Format response to match expected structure
    const formattedFavorites = favorites.map(f => {
      const obj = f.toObject();
      const property = obj.property_id;
      return {
        id: property?._id,
        name: property?.name,
        type: property?.type,
        location: property?.location,
        city: property?.city,
        country: property?.country,
        price: property?.price,
        price_per_night: property?.price,
        bedrooms: property?.bedrooms,
        bathrooms: property?.bathrooms,
        max_guests: property?.max_guests,
        maxGuests: property?.max_guests,
        image_url: property?.image_url,
        imageUrl: property?.image_url,
        description: property?.description,
        favoritedAt: obj.created_at,
        favorited_at: obj.created_at
      };
    });

    res.json({
      success: true,
      count: formattedFavorites.length,
      favorites: formattedFavorites
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

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    const favorite = await Favorite.findOne({
      traveler_id: travelerId,
      property_id: propertyId
    });

    res.json({
      success: true,
      isFavorite: !!favorite
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
