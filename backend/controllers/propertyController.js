const { isValidDate, isEndDateAfterStartDate } = require('../utils/validation');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Helper: format property response with aliases
const formatProperty = (p) => {
  if (!p) return null;
  const obj = p.toObject ? p.toObject() : p;
  return {
    ...obj,
    id: obj._id,
    title: obj.name,
    price_per_night: obj.price,
    maxGuests: obj.max_guests,
    imageUrl: obj.image_url,
    availableFrom: obj.available_from,
    availableTo: obj.available_to,
    ownerId: obj.owner_id,
    createdAt: obj.created_at,
    ownerName: obj.owner_id?.name || null
  };
};

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

    // Build query
    const locationRegex = new RegExp(location, 'i');
    const query = {
      $or: [
        { city: locationRegex },
        { country: locationRegex },
        { location: locationRegex }
      ]
    };

    // Date window
    if (startDate && endDate) {
      query.available_from = { $lte: new Date(startDate) };
      query.available_to = { $gte: new Date(endDate) };

      // Find properties with conflicting ACCEPTED bookings
      const conflictingBookings = await Booking.find({
        status: 'ACCEPTED',
        $or: [
          { start_date: { $lte: new Date(startDate) }, end_date: { $gte: new Date(startDate) } },
          { start_date: { $lte: new Date(endDate) }, end_date: { $gte: new Date(endDate) } },
          { start_date: { $gte: new Date(startDate) }, end_date: { $lte: new Date(endDate) } }
        ]
      }).select('property_id');

      const excludeIds = conflictingBookings.map(b => b.property_id);
      if (excludeIds.length > 0) {
        query._id = { $nin: excludeIds };
      }
    } else if (startDate && !endDate) {
      query.available_to = { $gte: new Date(startDate) };
    } else if (!startDate && endDate) {
      query.available_from = { $lte: new Date(endDate) };
    }

    // Guests
    if (guests) {
      const g = parseInt(guests, 10);
      if (!Number.isNaN(g)) {
        query.max_guests = { $gte: g };
      }
    }

    const properties = await Property.find(query)
      .sort({ created_at: -1 });

    res.json({
      success: true,
      count: properties.length,
      properties: properties.map(formatProperty)
    });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    const property = await Property.findById(id)
      .populate('owner_id', 'name email');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, property: formatProperty(property) });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

/**
 * OWNER (protected): Create property
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

    // Normalize amenities
    if (amenities && typeof amenities !== 'string') {
      try { amenities = JSON.stringify(amenities); } catch { amenities = '[]'; }
    }
    if (!amenities) amenities = '[]';

    const property = await Property.create({
      owner_id: ownerId,
      name,
      type,
      location: location || `${city}, ${country}`,
      city,
      state: state || null,
      country,
      price,
      bedrooms,
      bathrooms,
      max_guests: maxGuests,
      image_url: imageUrl || 'https://via.placeholder.com/400x300',
      description: description || '',
      amenities,
      available_from: availableFrom || null,
      available_to: availableTo || null
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: formatProperty(property)
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

/**
 * OWNER (protected): Update property
 */
const updateProperty = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Owner not authenticated' });

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    // Verify ownership
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (!property.owner_id.equals(ownerId)) {
      return res.status(403).json({ success: false, message: 'You can only update your own properties' });
    }

    let {
      name, type, location, city, state, country, price,
      bedrooms, bathrooms, maxGuests, imageUrl, description,
      amenities, availableFrom, availableTo
    } = req.body;

    // Validate dates if present
    if (availableFrom && !isValidDate(availableFrom)) {
      return res.status(400).json({ success: false, message: 'Invalid availableFrom date format. Use YYYY-MM-DD' });
    }
    if (availableTo && !isValidDate(availableTo)) {
      return res.status(400).json({ success: false, message: 'Invalid availableTo date format. Use YYYY-MM-DD' });
    }
    if (availableFrom && availableTo && !isEndDateAfterStartDate(availableFrom, availableTo)) {
      return res.status(400).json({ success: false, message: 'availableTo must be after availableFrom' });
    }

    const updateData = {};

    // Numbers
    if (price !== undefined) {
      price = Number(price);
      if (price <= 0) return res.status(400).json({ success: false, message: 'Price must be a positive number' });
      updateData.price = price;
    }
    if (bedrooms !== undefined) updateData.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) updateData.bathrooms = Number(bathrooms);
    if (maxGuests !== undefined) updateData.max_guests = Number(maxGuests);

    // Strings
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (location !== undefined) updateData.location = location;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (description !== undefined) updateData.description = description;

    // Amenities
    if (amenities !== undefined) {
      if (typeof amenities !== 'string') {
        try { amenities = JSON.stringify(amenities); } catch { amenities = '[]'; }
      }
      updateData.amenities = amenities;
    }

    // Dates
    if (availableFrom !== undefined) updateData.available_from = availableFrom;
    if (availableTo !== undefined) updateData.available_to = availableTo;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const updated = await Property.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: formatProperty(updated)
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

/**
 * OWNER (protected): Delete property
 */
const deleteProperty = async (req, res) => {
  try {
    const ownerId = req.session.ownerId;
    if (!ownerId) return res.status(401).json({ success: false, message: 'Owner not authenticated' });

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid property ID' });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (!property.owner_id.equals(ownerId)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own properties' });
    }

    await Property.findByIdAndDelete(id);
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

    const properties = await Property.find({ owner_id: ownerId })
      .sort({ created_at: -1 });

    res.json({
      success: true,
      count: properties.length,
      properties: properties.map(formatProperty)
    });
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
