const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import routes - only the ones that exist
const travelerRoutes = require('./routes/travelerRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const propertyRoutes = require('./routes/propertyRoutes');

//const bookingRoutes = require('./routes/bookingRoutes');
//const favoriteRoutes = require('./routes/favoriteRoutes');

// Middleware - ORDER MATTERS!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration 
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Cookie']
}));

// Session Configuration 
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true, // Prevents client-side JavaScript from accessing cookie
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  }
}));

// Health check route 
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Airbnb API Server', 
    version: '1.0.0',
    endpoints: {
      health: '/health',
      traveler: '/api/traveler/*',
      owner: '/api/owner/*',
      properties: '/api/properties/*'
    }
  });
});

// API Routes - Only include existing routes
app.use('/api/traveler', travelerRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/properties', propertyRoutes);

// app.use('/api/bookings', bookingRoutes);
// app.use('/api/favorites', favoriteRoutes);

// 404 handler 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.path,
    method: req.method
  });
});

// Error handler 
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});