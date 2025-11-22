const bcrypt = require('bcryptjs');
const { isValidEmail, isValidStateCode } = require('../utils/validation');
const { generateToken } = require('../utils/jwt');

// Traveler Signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = req.app.get('db');

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO travelers (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Set session
    req.session.travelerId = result.insertId;
    req.session.userType = 'traveler';

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
    const db = req.app.get('db');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

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

    // Generate JWT token
    const token = generateToken({
      id: traveler.id,
      email: traveler.email,
      userType: 'traveler'
    });

    delete traveler.password;

    res.json({
      success: true,
      message: 'Login successful',
      traveler,
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
    const db = req.app.get('db');
    // 从 JWT token 获取 travelerId (优先)
    const travelerId = req.user?.id || req.session?.travelerId;

    if (!travelerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const [travelers] = await db.query(
      'SELECT id, name, email, location, phone, city, state, country, about, languages, gender, profile_picture, created_at FROM travelers WHERE id = ?',
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
    const db = req.app.get('db');
    // 从 JWT token 获取 travelerId (优先)
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

    const [travelers] = await db.query(
      'SELECT id, name, email, location, phone, city, state, country, about, languages, gender, profile_picture, created_at, updated_at FROM travelers WHERE id = ?',
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
    const db = req.app.get('db');
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

    await db.query(
      'UPDATE travelers SET profile_picture = ? WHERE id = ?', 
      [imageData, travelerId]
    );
    
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
    const db = req.app.get('db');
    const travelerId = req.user?.id || req.session.travelerId;

    if (!travelerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await db.query(
      'UPDATE travelers SET profile_picture = NULL WHERE id = ?',
      [travelerId]
    );

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
