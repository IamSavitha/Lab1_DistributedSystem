const bcrypt = require('bcryptjs');
const { isValidEmail, isValidStateCode } = require('../utils/validation');
const { generateToken } = require('../utils/jwt');
const Traveler = require('../models/Traveler');

// Traveler Signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await Traveler.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const traveler = await Traveler.create({
      name,
      email,
      password: hashedPassword
    });

    // Set session
    req.session.travelerId = traveler._id;
    req.session.userType = 'traveler';

    res.status(201).json({
      success: true,
      message: 'Traveler account created successfully',
      traveler: {
        id: traveler._id,
        name: traveler.name,
        email: traveler.email,
        created_at: traveler.created_at
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Traveler Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const traveler = await Traveler.findOne({ email });

    if (!traveler) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, traveler.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Set session
    req.session.travelerId = traveler._id;
    req.session.userType = 'traveler';

    // Generate JWT token
    const token = generateToken({
      id: traveler._id,
      email: traveler.email,
      userType: 'traveler'
    });

    // Return traveler without password
    const travelerResponse = traveler.toObject();
    delete travelerResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      traveler: travelerResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Traveler Logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to logout'
      });
    }

    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

// Get Traveler Profile
const getProfile = async (req, res) => {
  try {
    const travelerId = req.user?.id || req.session?.travelerId;

    if (!travelerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const traveler = await Traveler.findById(travelerId)
      .select('-password');

    if (!traveler) {
      return res.status(404).json({
        success: false,
        message: 'Traveler not found'
      });
    }

    res.json({
      success: true,
      traveler
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update Traveler Profile
const updateProfile = async (req, res) => {
  try {
    const travelerId = req.user?.id || req.session?.travelerId;

    if (!travelerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const {
      name,
      phone,
      profilePicture,
      city,
      state,
      country,
      about,
      languages,
      gender
    } = req.body;

    if (state && !isValidStateCode(state)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state code. Must be 2 letters.'
      });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (profilePicture !== undefined) updateData.profile_picture = profilePicture;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (about !== undefined) updateData.about = about;
    if (languages !== undefined) updateData.languages = languages;
    if (gender !== undefined) updateData.gender = gender;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const traveler = await Traveler.findByIdAndUpdate(
      travelerId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      traveler
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Upload profile picture
const uploadProfileImage = async (req, res) => {
  try {
    const travelerId = req.user?.id || req.session?.travelerId;

    if (!travelerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    if (!imageData.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Please upload JPEG, PNG, GIF, or WebP'
      });
    }

    if (imageData.length > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image too large. Maximum size is 1.5MB'
      });
    }

    await Traveler.findByIdAndUpdate(travelerId, {
      profile_picture: imageData
    });

    res.json({
      success: true,
      message: 'Profile picture updated',
      imageUrl: imageData
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    });
  }
};

// Delete profile picture
const deleteProfileImage = async (req, res) => {
  try {
    const travelerId = req.user?.id || req.session.travelerId;

    if (!travelerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await Traveler.findByIdAndUpdate(travelerId, {
      profile_picture: null
    });

    res.json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile image'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage
};
