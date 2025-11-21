const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Traveler Authentication Middleware - supports both JWT and session
const requireTravelerAuth = (req, res, next) => {
  // First check session (for backward compatibility)
  if (req.session && req.session.travelerId) {
    req.travelerId = req.session.travelerId;
    return next();
  }

  // Then check JWT token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login as a traveler.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.userType !== 'traveler') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Traveler account required.'
      });
    }
    
    req.travelerId = decoded.travelerId;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Owner Authentication Middleware - supports both JWT and session
const requireOwnerAuth = (req, res, next) => {
  // First check session (for backward compatibility)
  if (req.session && req.session.ownerId) {
    req.ownerId = req.session.ownerId;
    return next();
  }

  // Then check JWT token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login as an owner.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.userType !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Owner account required.'
      });
    }
    
    req.ownerId = decoded.ownerId;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  requireTravelerAuth,
  requireOwnerAuth
};
