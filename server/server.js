const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Load .env from project root
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import config
const pool = require('./config/database');
const limiter = require('./middleware/rateLimit');
const ensureAdminUser = require('./utils/admin');

// Import routes
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const reviewRoutes = require('./routes/review');
const orderRoutes = require('./routes/order');
const basketRoutes = require('./routes/basket');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Database status endpoint
app.get('/api/database/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    const userCount = await pool.query('SELECT COUNT(*) as count FROM "Users"');
    
    res.json({
      status: 'Connected',
      database: {
        current_time: result.rows[0].current_time,
        version: result.rows[0].postgres_version,
        user_count: parseInt(userCount.rows[0].count)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      error: error.message 
    });
  }
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/basket', basketRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'bookstore'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  await ensureAdminUser();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  pool.end(() => {
    console.log('✅ Database connections closed');
    process.exit(0);
  });
});

module.exports = app;
