// Database configuration and connection setup
export const databaseConfig = {
  // Database connection settings
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bookstore',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  
  // Database options
  dialect: 'postgres', // or 'mysql', 'sqlite', etc.
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Migration settings
  migrationStorageTableName: 'sequelize_meta',
  
  // Timezone
  timezone: '+00:00',
};

// API endpoints configuration
export const apiEndpoints = {
  // Book endpoints
  books: {
    getAll: '/book/all',
    getById: '/book/:id',
    create: '/book/create',
    update: '/book/update',
    delete: '/book/:id',
    search: '/book/search',
    getByAuthor: '/book/author/:author',
  },
  
  // User endpoints
  users: {
    getAll: '/user/all',
    getById: '/user/:id',
    create: '/user/create',
    update: '/user/update',
    delete: '/user/:id',
    login: '/user/login',
    logout: '/user/logout',
    getByEmail: '/user/email/:email',
  },
  
  // Order endpoints
  orders: {
    getAll: '/order/all',
    getById: '/order/:id',
    create: '/order/create',
    update: '/order/update',
    delete: '/order/:id',
    getByUser: '/order/user/:userId',
    getWithComposition: '/order/:id/composition',
    createComplete: '/order/create-complete',
  },
  
  // Order composition endpoints
  orderCompositions: {
    getByOrder: '/order/:orderId/compositions',
    create: '/order/composition/create',
    update: '/order/composition/update',
    delete: '/order/composition/:id',
  },
  
  // Review endpoints
  reviews: {
    getAll: '/review/all',
    getById: '/review/:id',
    create: '/review/create',
    update: '/review/update',
    delete: '/review/:id',
    getByBook: '/review/book/:bookId',
    getByUser: '/review/user/:userId',
    getAverageRating: '/review/book/:bookId/average',
  },
};

// Database schema validation
export const schemaValidation = {
  // Book validation
  book: {
    title: { minLength: 1, maxLength: 255 },
    author: { minLength: 1, maxLength: 255 },
    price: { min: 0, max: 999999.99 },
    stock_quantity: { min: 0 },
    publishing_year: { min: 1000, max: new Date().getFullYear() + 1 },
  },
  
  // User validation
  user: {
    email: { maxLength: 500, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { minLength: 6, maxLength: 255 },
    first_name: { minLength: 1, maxLength: 255 },
    last_name: { minLength: 1, maxLength: 255 },
    phone: { maxLength: 255 },
    address: { maxLength: 255 },
  },
  
  // Review validation
  review: {
    grade: { min: 1, max: 5 },
  },
  
  // Order validation
  order: {
    total_order_quantity: { min: 1 },
    currency: { min: 0 },
    tracking_number: { maxLength: 255 },
  },
  
  // Order composition validation
  orderComposition: {
    books_number: { min: 1 },
  },
};

export default databaseConfig;
