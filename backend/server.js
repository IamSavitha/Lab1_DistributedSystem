const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config();

// Kafka setup
const { initProducer, initConsumers, disconnectKafka } = require('./config/kafka');
const { startAllConsumers } = require('./kafka/consumers');

// Database connection
const mysql = require('mysql2/promise');

const app = express();

// Create database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'airbnb_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your .env file and MySQL server');
  });

// Make database available to routes
app.set('db', db);

// Import routes - only the ones that exist
const travelerRoutes = require('./routes/travelerRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const ownerPropertyRoutes = require('./routes/ownerPropertyRoutes');


// swaggerUi
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Airbnb Prototype API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:4000' }]
  },
  apis: ['./routes/*.js'], // add JSDoc comments in route files
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Middleware - ORDER MATTERS!
// Increase body size limits for file uploads (base64 images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS Configuration - MUST BE BEFORE ROUTES
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Cookie', 'Authorization']
}));

// Session Configuration with MongoDB - MUST BE BEFORE ROUTES
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL || 'mongodb://admin:mongopassword@mongodb:27017/airbnb_sessions?authSource=admin',
    ttl: 24 * 60 * 60, // 1 day in seconds
    touchAfter: 24 * 3600, // Lazy session update
    crypto: {
      secret: process.env.SESSION_SECRET || 'your-secret-key'
    }
  }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true, // Prevents client-side JavaScript from accessing cookie
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  }
}));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Airbnb API Server', 
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      traveler: '/api/traveler/*',
      owner: '/api/owner/*',
      properties: '/api/properties/*',
      bookings: '/api/bookings/*',
      favorites: '/api/favorites/*'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes - Only include existing routes
app.use('/api/traveler', travelerRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use('/api/owner/properties', ownerPropertyRoutes);



// 404 handler - AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.path,
    method: req.method
  });
});

// Error handler - MUST BE LAST
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize Kafka and start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Initialize Kafka producer
    await initProducer();

    // Initialize Kafka consumers
    await initConsumers();

    // Start all consumer listeners
    await startAllConsumers();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
      console.log('✅ Kafka integration initialized successfully');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await disconnectKafka();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await disconnectKafka();
  process.exit(0);
});

// Start the server
startServer();
