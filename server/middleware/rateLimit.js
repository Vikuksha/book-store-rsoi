const rateLimit = require('express-rate-limit');

// Rate limiting - более мягкий для разработки
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (увеличено для разработки)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Пропускаем rate limiting для определенных важных endpoints
    const importantEndpoints = ['/api/book/all', '/api/book/'];
    return importantEndpoints.some(endpoint => req.path.startsWith(endpoint));
  }
});

module.exports = limiter;

