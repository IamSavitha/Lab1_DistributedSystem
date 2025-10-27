const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { isValidEmail } = require('../utils/validation');

// Owner Signup
const signup = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;  // 添加 location

    // 验证必填字段
    if (!name || !email || !password || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and location are required'  // 更新错误信息
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
      'SELECT id FROM owners WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 修复：插入时包含 location
    const [result] = await db.query(
      'INSERT INTO owners (name, email, location, password) VALUES (?, ?, ?, ?)',
      [name, email, location, hashedPassword]
    );

    // 修复：返回时包含 location
    const [owners] = await db.query(
      'SELECT id, name, email, location, created_at FROM owners WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Owner account created successfully',
      owner: owners[0]
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

    const [owners] = await db.query(
      'SELECT * FROM owners WHERE email = ?',
      [email]
    );

    if (owners.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const owner = owners[0];

    const isValidPassword = await bcrypt.compare(password, owner.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    req.session.ownerId = owner.id;
    req.session.userType = 'owner';

    delete owner.password;

    res.json({
      success: true,
      message: 'Login successful',
      owner
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
    const ownerId = req.session.ownerId;

    // 修复：查询时包含 location
    const [owners] = await db.query(
      'SELECT id, name, email, location, phone, profile_picture, about, created_at FROM owners WHERE id = ?',
      [ownerId]
    );

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    res.json({
      success: true,
      owner: owners[0]
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
    const ownerId = req.session.ownerId;
    const { name, phone, profilePicture, about, location } = req.body;  // 添加 location

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
    if (about !== undefined) {
      updates.push('about = ?');
      values.push(about);
    }
    // 添加：支持更新 location
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(ownerId);

    await db.query(
      `UPDATE owners SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // 修复：返回时包含 location
    const [owners] = await db.query(
      'SELECT id, name, email, location, phone, profile_picture, about, created_at, updated_at FROM owners WHERE id = ?',
      [ownerId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      owner: owners[0]
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
