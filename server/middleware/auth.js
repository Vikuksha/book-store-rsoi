const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ Token verification error:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('✅ Token verified, user data:', user);
    req.user = user;
    next();
  });
};

// Middleware для проверки прав администратора
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};

