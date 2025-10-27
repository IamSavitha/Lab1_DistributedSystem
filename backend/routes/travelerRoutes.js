/**
 * Traveler Routes
 * Handles all traveler-related endpoints including authentication, profile, and image upload
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Middleware to check if user is authenticated as traveler
const requireTravelerAuth = (req, res, next) => {
  if (!req.session.travelerId) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  next();
};

/**
 * @route   POST /api/traveler/signup
 * @desc    Register a new traveler
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, city, state, country } = req.body;
    const db = req.app.get('db');

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and password are required' 
      });
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      'SELECT id FROM travelers WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new traveler
    const [result] = await db.query(
      'INSERT INTO travelers (name, email, password, city, state, country) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, city, state, country]
    );

    // Set session
    req.session.travelerId = result.insertId;
    req.session.userType = 'traveler';

    res.status(201).json({
      success: true,
      message: 'Traveler registered successfully',
      travelerId: result.insertId
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register traveler' 
    });
  }
});

/**
 * @route   POST /api/traveler/login
 * @desc    Login traveler
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.get('db');

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
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
        error: 'Invalid email or password' 
      });
    }

    const traveler = travelers[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, traveler.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Set session
    req.session.travelerId = traveler.id;
    req.session.userType = 'traveler';

    res.json({
      success: true,
      message: 'Login successful',
      traveler: {
        id: traveler.id,
        name: traveler.name,
        email: traveler.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to login' 
    });
  }
});

/**
 * @route   POST /api/traveler/logout
 * @desc    Logout traveler
 * @access  Private
 */
router.post('/logout', requireTravelerAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to logout' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

/**
 * @route   GET /api/traveler/profile
 * @desc    Get traveler profile
 * @access  Private
 */
router.get('/profile', requireTravelerAuth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const [travelers] = await db.query(
      'SELECT id, name, email, city, state, country, about, languages, profile_image, created_at FROM travelers WHERE id = ?',
      [req.session.travelerId]
    );

    if (travelers.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Traveler not found' 
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
      error: 'Failed to get profile' 
    });
  }
});

/**
 * @route   PUT /api/traveler/profile
 * @desc    Update traveler profile
 * @access  Private
 */
router.put('/profile', requireTravelerAuth, async (req, res) => {
  try {
    const { name, city, state, country, about, languages } = req.body;
    const db = req.app.get('db');

    await db.query(
      'UPDATE travelers SET name = ?, city = ?, state = ?, country = ?, about = ?, languages = ? WHERE id = ?',
      [name, city, state, country, about, languages, req.session.travelerId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update profile' 
    });
  }
});

/**
 * @route   POST /api/traveler/profile/image
 * @desc    Upload traveler profile image (Base64)
 * @access  Private
 */
router.post('/profile/image', requireTravelerAuth, async (req, res) => {
  try {
    const travelerId = req.session.travelerId;
    const { imageData } = req.body;
    const db = req.app.get('db');

    // Validate image data
    if (!imageData) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image data provided' 
      });
    }

    // Validate base64 image format
    if (!imageData.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid image format. Please upload JPEG, PNG, GIF, or WebP' 
      });
    }

    // Check size (limit to ~2MB base64 which is ~1.5MB actual)
    if (imageData.length > 2 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        error: 'Image too large. Maximum size is 1.5MB' 
      });
    }

    // Update database with new image
    await db.query(
      'UPDATE travelers SET profile_image = ? WHERE id = ?',
      [imageData, travelerId]
    );

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: imageData
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile image',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/traveler/profile/image
 * @desc    Delete traveler profile image
 * @access  Private
 */
router.delete('/profile/image', requireTravelerAuth, async (req, res) => {
  try {
    const travelerId = req.session.travelerId;
    const db = req.app.get('db');

    // Remove image from database
    await db.query(
      'UPDATE travelers SET profile_image = NULL WHERE id = ?',
      [travelerId]
    );

    res.json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    console.error('Profile image delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete profile image'
    });
  }
});

/**
 * @route   GET /api/traveler/check-auth
 * @desc    Check if traveler is authenticated
 * @access  Private
 */
router.get('/check-auth', requireTravelerAuth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const [travelers] = await db.query(
      'SELECT id, name, email FROM travelers WHERE id = ?',
      [req.session.travelerId]
    );

    if (travelers.length === 0) {
      return res.status(401).json({ 
        success: false, 
        authenticated: false 
      });
    }

    res.json({
      success: true,
      authenticated: true,
      traveler: travelers[0]
    });

  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check authentication' 
    });
  }
});

module.exports = router;
