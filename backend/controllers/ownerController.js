const bcrypt = require('bcryptjs');
const { isValidEmail } = require('../utils/validation');
const { generateToken } = require('../utils/jwt');
const Owner = require('../models/Owner');

// Owner Signup
const signup = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    if (!name || !email || !password || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and location are required'
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

    const existingUser = await Owner.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await Owner.create({
      name,
      email,
      location,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Owner account created successfully',
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        location: owner.location,
        created_at: owner.created_at
      }
    });

  } catch (error) {
    console.error('Owner signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Owner Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const owner = await Owner.findOne({ email });

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, owner.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    req.session.ownerId = owner._id;
    req.session.userType = 'owner';

    // Generate JWT token
    const token = generateToken({
      id: owner._id,
      email: owner.email,
      userType: 'owner'
    });

    // Return owner without password
    const ownerResponse = owner.toObject();
    delete ownerResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      owner: ownerResponse,
      token
    });

  } catch (error) {
    console.error('Owner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Owner Logout
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

// Get Owner Profile
const getProfile = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session?.ownerId;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const owner = await Owner.findById(ownerId)
      .select('-password');

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    res.json({
      success: true,
      owner
    });

  } catch (error) {
    console.error('Get owner profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update Owner Profile
const updateProfile = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.session?.ownerId;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { name, phone, profilePicture, about, location } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (profilePicture !== undefined) updateData.profile_picture = profilePicture;
    if (about !== undefined) updateData.about = about;
    if (location !== undefined) updateData.location = location;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const owner = await Owner.findByIdAndUpdate(
      ownerId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      owner
    });

  } catch (error) {
    console.error('Update owner profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile
};
