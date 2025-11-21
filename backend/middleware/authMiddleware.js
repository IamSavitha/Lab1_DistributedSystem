const { verifyToken } = require('../utils/jwt');

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 * Adds decoded user info to req.user
 */
const authenticateJWT = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Fallback to session-based auth if no JWT token
      if (req.session && (req.session.travelerId || req.session.ownerId)) {
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Add user info to request
    req.user = decoded;

    // Also set session for backward compatibility
    if (decoded.userType === 'traveler') {
      req.session.travelerId = decoded.id;
      req.session.userType = 'traveler';
    } else if (decoded.userType === 'owner') {
      req.session.ownerId = decoded.id;
      req.session.userType = 'owner';
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

/**
 * Middleware to check if user is a traveler
 */
const isTraveler = (req, res, next) => {
  if (req.user && req.user.userType === 'traveler') {
    return next();
  }

  // Fallback to session check
  if (req.session && req.session.userType === 'traveler') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Traveler access required.'
  });
};

/**
 * Middleware to check if user is an owner
 */
const isOwner = (req, res, next) => {
  if (req.user && req.user.userType === 'owner') {
    return next();
  }

  // Fallback to session check
  if (req.session && req.session.userType === 'owner') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Owner access required.'
  });
};

/**
 * Optional JWT authentication
 * Does not block if no token, but adds user info if token exists
 */
const optionalAuthenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      if (token) {
        const decoded = verifyToken(token);
        req.user = decoded;
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
    console.log('Optional JWT auth failed:', error.message);
  }

  next();
};

module.exports = {
  authenticateJWT,
  isTraveler,
  isOwner,
  optionalAuthenticateJWT
};
