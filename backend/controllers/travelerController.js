const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { isValidEmail, isValidStateCode } = require('../utils/validation');

// Traveler Signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM travelers WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert traveler
    const [result] = await db.query(
      'INSERT INTO travelers (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Get created traveler
    const [travelers] = await db.query(
      'SELECT id, name, email, created_at FROM travelers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Traveler account created successfully',
      traveler: travelers[0]
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

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find traveler
    const [travelers] = await db.query(
      'SELECT * FROM travelers WHERE email = ?',
      [email]
    );

    if (travelers.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const traveler = travelers[0];

    // Compare password
    const isValidPassword = await bcrypt.compare(password, traveler.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Set session
    req.session.travelerId = traveler.id;
    req.session.userType = 'traveler';

    // Remove password from response
    delete traveler.password;

    res.json({
      success: true,
      message: 'Login successful',
      traveler
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
    const travelerId = req.session.travelerId;

    const [travelers] = await db.query(
      'SELECT id, name, email, phone, profile_picture, city, state, country, about, languages, gender, created_at FROM travelers WHERE id = ?',
      [travelerId]
    );

    if (travelers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Traveler not found'
      });
    }

    res.json({
      success: true,
      traveler: travelers[0]
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
    const travelerId = req.session.travelerId;
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

    // Validate state code if provided
    if (state && !isValidStateCode(state)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state code. Must be 2 letters.'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (profilePicture !== undefined) {
      updates.push('profile_picture = ?');
      values.push(profilePicture);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      values.push(city);
    }
    if (state !== undefined) {
      updates.push('state = ?');
      values.push(state);
    }
    if (country !== undefined) {
      updates.push('country = ?');
      values.push(country);
    }
    if (about !== undefined) {
      updates.push('about = ?');
      values.push(about);
    }
    if (languages !== undefined) {
      updates.push('languages = ?');
      values.push(languages);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      values.push(gender);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(travelerId);

    await db.query(
      `UPDATE travelers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated profile
    const [travelers] = await db.query(
      'SELECT id, name, email, phone, profile_picture, city, state, country, about, languages, gender, created_at, updated_at FROM travelers WHERE id = ?',
      [travelerId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      traveler: travelers[0]
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
    if (!req.session.travelerId) return res.status(401).json({ success:false, message:'Unauthorized' });
    if (!req.file) return res.status(400).json({ success:false, message:'No file uploaded' });

    const db = require('../config/database');
    await db.query('UPDATE travelers SET profile_picture=? WHERE id=?', [req.file.buffer.toString('base64'), req.session.travelerId]);
    res.json({ success: true, message: 'Profile picture updated' });
  } catch (e) {
    res.status(500).json({ success:false, message:'Upload failed' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
  uploadProfileImage
};