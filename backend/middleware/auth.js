// Traveler Authentication Middleware
const requireTravelerAuth = (req, res, next) => {
    if (!req.session.travelerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login as a traveler.'
      });
    }
    next();
  };
  
  // Owner Authentication Middleware
  const requireOwnerAuth = (req, res, next) => {
    if (!req.session.ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login as an owner.'
      });
    }
    next();
  };
  
  
  module.exports = {
    requireTravelerAuth,
    requireOwnerAuth
  };