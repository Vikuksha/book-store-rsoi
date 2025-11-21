const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bookstore',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Ensure default admin user exists
async function ensureAdminUser() {
  try {
    const adminEmailPrimary = process.env.ADMIN_EMAIL || 'admin@bookstore.com';
    const adminEmailAlias = 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const targets = [
      { email: adminEmailPrimary, first: 'Admin', last: 'User', phone: '+0-000-000-00-00', address: 'Admin Panel' },
      { email: adminEmailAlias, first: 'admin', last: 'admin', phone: '111111111', address: 'admin' },
    ];

    for (const t of targets) {
      const existing = await pool.query('SELECT "ID" FROM "Users" WHERE "Email" = $1', [t.email]);
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO "Users" ("Email", "Password", "First_name", "Last_name", "Phone", "Address")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [t.email, hashedPassword, t.first, t.last, t.phone, t.address]
        );
        console.log(`👑 Admin user created: ${t.email}`);
      }
    }
  } catch (e) {
    console.error('Failed to ensure admin user exists:', e.message);
  }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// User Routes
app.post('/api/user/create', async (req, res) => {
  try {
    const { Email, Password, First_name, Last_name, Phone, Address } = req.body;

    // Validation
    if (!Email || !Password || !First_name || !Last_name || !Phone || !Address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT "ID" FROM "Users" WHERE "Email" = $1',
      [Email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // Insert user
    const result = await pool.query(
      `INSERT INTO "Users" ("Email", "Password", "First_name", "Last_name", "Phone", "Address") 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING "ID", "Email", "First_name", "Last_name", "Phone", "Address", "created_at"`,
      [Email, hashedPassword, First_name, Last_name, Phone, Address]
    );

    const user = result.rows[0];
    delete user.Password; // Don't return password

    res.status(201).json({
      message: 'User created successfully',
      user: user
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT "ID", "Email", "Password", "First_name", "Last_name", "Phone", "Address" FROM "Users" WHERE "Email" = $1',
      [Email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(Password, user.Password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.ID, 
        email: user.Email,
        firstName: user.First_name,
        lastName: user.Last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete user.Password;

    // Загружаем корзину пользователя из таблицы Basket
    let basketItems = [];
    try {
      const basketResult = await pool.query(
        `SELECT b.*, bk."Title", bk."Author", bk."Price" as "Book_Price", bk."Description", bk."Stock_quantity"
         FROM "Basket" b
         INNER JOIN "Book" bk ON b."ID_Book" = bk."ID"
         INNER JOIN "Users" u ON b."ID_User" = u."ID"
         WHERE b."ID_User" = $1
         ORDER BY b."created_at" DESC`,
        [user.ID]
      );

      // Формируем данные корзины с информацией о скидках
      basketItems = basketResult.rows.map(item => {
        const bookPrice = parseFloat(item.Book_Price) || 0;
        const discountPayment = parseFloat(item.Discount_payment) || 0;
        const hasDiscount = discountPayment > 0;
        
        // Рассчитываем оригинальную цену и цену со скидкой
        const originalPrice = bookPrice;
        const discountedPrice = hasDiscount 
          ? bookPrice - (discountPayment / item.Books_number)
          : bookPrice;

        return {
          ...item,
          hasDiscount,
          originalPrice,
          discountedPrice,
          discountPercent: hasDiscount ? Math.round((discountPayment / (originalPrice * item.Books_number)) * 100) : 0
        };
      });

      console.log(`✅ Login: Loaded ${basketItems.length} items from Basket for user ${user.ID}`);
    } catch (basketError) {
      console.error('Error loading basket during login:', basketError);
      // Продолжаем логин даже если корзина не загрузилась
    }

    res.json({
      message: 'Login successful',
      token: token,
      user: user,
      basket: basketItems,
      totalPayment: basketItems.length > 0 ? parseFloat(basketItems[0].Payment) || 0 : 0
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/all', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT "ID", "Email", "First_name", "Last_name", "Phone", "Address", "created_at", "updated_at" 
       FROM "Users" 
       ORDER BY "created_at" DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM "Users"');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT "ID", "Email", "First_name", "Last_name", "Phone", "Address", "created_at", "updated_at" FROM "Users" WHERE "ID" = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const result = await pool.query(
      'SELECT "ID", "Email", "First_name", "Last_name", "Phone", "Address", "created_at" FROM "Users" WHERE "Email" = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user/update', authenticateToken, async (req, res) => {
  try {
    const { ID, Email, First_name, Last_name, Phone, Address } = req.body;

    if (!ID) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT "ID" FROM "Users" WHERE "ID" = $1', [ID]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    const result = await pool.query(
      `UPDATE "Users" 
       SET "Email" = COALESCE($1, "Email"),
           "First_name" = COALESCE($2, "First_name"),
           "Last_name" = COALESCE($3, "Last_name"),
           "Phone" = COALESCE($4, "Phone"),
           "Address" = COALESCE($5, "Address"),
           "updated_at" = CURRENT_TIMESTAMP
       WHERE "ID" = $6
       RETURNING "ID", "Email", "First_name", "Last_name", "Phone", "Address", "updated_at"`,
      [Email, First_name, Last_name, Phone, Address, ID]
    );

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/user/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await pool.query('SELECT "ID" FROM "Users" WHERE "ID" = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (cascade will handle related records)
    await pool.query('DELETE FROM "Users" WHERE "ID" = $1', [id]);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// Book Routes
app.get('/api/book/all', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, author, publishing_year, min_price, max_price, in_stock, sort_by } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM "Book" WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND ("Title" ILIKE $${paramCount} OR "Author" ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (author) {
      query += ` AND "Author" ILIKE $${paramCount}`;
      params.push(`%${author}%`);
      paramCount++;
    }
    
    if (publishing_year) {
      query += ` AND "Publishing_year" = $${paramCount}`;
      params.push(publishing_year);
      paramCount++;
    }
    
    if (min_price) {
      query += ` AND "Price" >= $${paramCount}`;
      params.push(min_price);
      paramCount++;
    }
    
    if (max_price) {
      query += ` AND "Price" <= $${paramCount}`;
      params.push(max_price);
      paramCount++;
    }
    
    // Фильтрация по наличию на складе
    if (in_stock === 'true' || in_stock === true) {
      query += ` AND "Stock_quantity" > 0`;
    }
    
    // Сортировка
    let orderBy = 'ORDER BY "created_at" DESC'; // По умолчанию по дате создания
    if (sort_by) {
      switch (sort_by) {
        case 'price_asc':
          orderBy = 'ORDER BY "Price" ASC';
          break;
        case 'price_desc':
          orderBy = 'ORDER BY "Price" DESC';
          break;
        case 'newest':
          orderBy = 'ORDER BY "created_at" DESC';
          break;
        case 'oldest':
          orderBy = 'ORDER BY "created_at" ASC';
          break;
        case 'publishing_year_desc':
          orderBy = 'ORDER BY "Publishing_year" DESC';
          break;
        case 'publishing_year_asc':
          orderBy = 'ORDER BY "Publishing_year" ASC';
          break;
        case 'title_asc':
          orderBy = 'ORDER BY "Title" ASC';
          break;
        case 'title_desc':
          orderBy = 'ORDER BY "Title" DESC';
          break;
        default:
          orderBy = 'ORDER BY "created_at" DESC';
      }
    }
    
    query += ` ${orderBy} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/book/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM "Book" WHERE "ID" = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Review Routes
app.get('/api/review/all', async (req, res) => {
  try {
    const { page = 1, limit = 100, book_id, user_id, min_grade, max_grade } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM "Reviews" WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (book_id) {
      query += ` AND "Id_Book" = $${paramCount}`;
      params.push(book_id);
      paramCount++;
    }
    
    if (user_id) {
      query += ` AND "id_User" = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }
    
    if (min_grade) {
      query += ` AND "Grade" >= $${paramCount}`;
      params.push(min_grade);
      paramCount++;
    }
    
    if (max_grade) {
      query += ` AND "Grade" <= $${paramCount}`;
      params.push(max_grade);
      paramCount++;
    }
    
    query += ` ORDER BY "created_at" DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/review/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    console.log(`📝 Fetching reviews for book ID: ${bookId}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'bookstore'}`);
    
    const result = await pool.query(
      'SELECT * FROM "Reviews" WHERE "Id_Book" = $1 ORDER BY "created_at" DESC',
      [bookId]
    );
    
    console.log(`✅ Found ${result.rows.length} reviews for book ${bookId}`);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Error fetching reviews by book:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message 
    });
  }
});

app.get('/api/review/book/:bookId/average', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    console.log(`📊 Fetching average rating for book ID: ${bookId}`);
    
    const result = await pool.query(
      'SELECT COALESCE(AVG("Grade"), 0) as "averageRating", COUNT(*) as "reviewCount" FROM "Reviews" WHERE "Id_Book" = $1',
      [bookId]
    );
    
    const averageRating = parseFloat(result.rows[0].averageRating) || 0;
    const reviewCount = parseInt(result.rows[0].reviewCount) || 0;
    
    console.log(`✅ Average rating for book ${bookId}: ${averageRating} (${reviewCount} reviews)`);
    
    res.json({
      averageRating: averageRating,
      reviewCount: reviewCount
    });
    
  } catch (error) {
    console.error('❌ Error fetching average rating:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message 
    });
  }
});

// Create review
app.post('/api/review/create', async (req, res) => {
  try {
    const { Grade, Id_Book, id_User, Review } = req.body;
    
    // Валидация
    if (!Grade || Grade < 1 || Grade > 5) {
      return res.status(400).json({ error: 'Grade must be between 1 and 5' });
    }
    if (!Id_Book || !id_User) {
      return res.status(400).json({ error: 'Id_Book and id_User are required' });
    }
    
    // Проверяем, существует ли уже отзыв от этого пользователя для этой книги
    const existingReview = await pool.query(
      'SELECT "ID" FROM "Reviews" WHERE "Id_Book" = $1 AND "id_User" = $2',
      [Id_Book, id_User]
    );
    
    if (existingReview.rows.length > 0) {
      // Обновляем существующий отзыв
      const result = await pool.query(
        'UPDATE "Reviews" SET "Grade" = $1, "Review" = $2, "updated_at" = CURRENT_TIMESTAMP WHERE "Id_Book" = $3 AND "id_User" = $4 RETURNING *',
        [Grade, Review || null, Id_Book, id_User]
      );
      return res.json(result.rows[0]);
    }
    
    // Создаём новый отзыв
    const result = await pool.query(
      'INSERT INTO "Reviews" ("Grade", "Id_Book", "id_User", "Review") VALUES ($1, $2, $3, $4) RETURNING *',
      [Grade, Id_Book, id_User, Review || null]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating review:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    
    // Более детальные сообщения об ошибках
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Foreign key constraint failed',
        detail: error.detail || 'Book or User does not exist'
      });
    }
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Review already exists',
        detail: 'This user has already reviewed this book'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message 
    });
  }
});

// Update review
app.put('/api/review/update', async (req, res) => {
  try {
    const { ID, Grade, Review } = req.body;
    
    if (!ID) {
      return res.status(400).json({ error: 'Review ID is required' });
    }
    
    let query = 'UPDATE "Reviews" SET "updated_at" = CURRENT_TIMESTAMP';
    const params = [];
    let paramCount = 1;
    
    if (Grade !== undefined) {
      if (Grade < 1 || Grade > 5) {
        return res.status(400).json({ error: 'Grade must be between 1 and 5' });
      }
      query += `, "Grade" = $${paramCount}`;
      params.push(Grade);
      paramCount++;
    }
    
    if (Review !== undefined) {
      query += `, "Review" = $${paramCount}`;
      params.push(Review);
      paramCount++;
    }
    
    query += ` WHERE "ID" = $${paramCount} RETURNING *`;
    params.push(ID);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete review
app.delete('/api/review/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM "Reviews" WHERE "ID" = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Алгоритм расчёта скидки
function calculateDiscount(subtotal, orderQuantity) {
  let discount = 0;
  let discountPercent = 0;
  
  // Скидка 5% при заказе от 50$
  if (subtotal >= 50) {
    discountPercent = 5;
  }
  
  // Скидка 10% при заказе от 100$
  if (subtotal >= 100) {
    discountPercent = 10;
  }
  
  // Скидка 15% при заказе от 200$
  if (subtotal >= 200) {
    discountPercent = 15;
  }
  
  // Дополнительная скидка 2% при заказе 5+ книг
  if (orderQuantity >= 5) {
    discountPercent += 2;
  }
  
  // Максимальная скидка 20%
  if (discountPercent > 20) {
    discountPercent = 20;
  }
  
  discount = (subtotal * discountPercent) / 100;
  
  return {
    discount,
    discountPercent,
    finalTotal: subtotal - discount
  };
}

// Order Routes - Create complete order with stock check
app.post('/api/order/create-complete', async (req, res) => {
  try {
    const { order, compositions } = req.body;
    
    if (!order || !compositions || !Array.isArray(compositions) || compositions.length === 0) {
      return res.status(400).json({ error: 'Order and compositions are required' });
    }
    
    // Проверка наличия книг на складе перед созданием заказа
    const stockErrors = [];
    const bookDetails = [];
    
    for (const composition of compositions) {
      const { ID_Book, Books_number } = composition;
      
      if (!ID_Book || !Books_number || Books_number <= 0) {
        return res.status(400).json({ error: 'Invalid composition data' });
      }
      
      // Получаем информацию о книге
      const bookResult = await pool.query('SELECT * FROM "Book" WHERE "ID" = $1', [ID_Book]);
      
      if (bookResult.rows.length === 0) {
        return res.status(404).json({ error: `Book with ID ${ID_Book} not found` });
      }
      
      const book = bookResult.rows[0];
      
      // Проверяем наличие на складе
      if (book.Stock_quantity < Books_number) {
        stockErrors.push({
          bookId: ID_Book,
          bookTitle: book.Title,
          requested: Books_number,
          available: book.Stock_quantity
        });
      }
      
      bookDetails.push({
        book,
        quantity: Books_number
      });
    }
    
    // Если есть ошибки с наличием, возвращаем их
    if (stockErrors.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock',
        details: stockErrors
      });
    }
    
    // Начинаем транзакцию
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Создаём заказ со статусом "COLLECTING" (собирается)
      const orderResult = await client.query(
        `INSERT INTO "Order" ("Total_order_quantity", "Currency", "Order_status", "ID_User")
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [order.Total_order_quantity || compositions.reduce((sum, c) => sum + c.Books_number, 0),
         order.Currency || 1,
         order.Order_status || 'COLLECTING', // Начинаем с состояния "собирается"
         order.ID_User]
      );
      
      const createdOrder = orderResult.rows[0];
      const orderId = createdOrder.ID;
      
      // Рассчитываем скидку
      const subtotal = bookDetails.reduce((sum, item) => {
        return sum + (parseFloat(item.book.Price) * item.quantity);
      }, 0);
      
      const discountInfo = calculateDiscount(subtotal, order.Total_order_quantity || compositions.reduce((sum, c) => sum + c.Books_number, 0));
      
      // Создаём состав заказа и обновляем количество на складе
      const orderCompositions = [];
      
      for (const composition of compositions) {
        const { ID_Book, Books_number } = composition;
        
        // Создаём запись в Order_composition
        const compResult = await client.query(
          `INSERT INTO "Order_composition" ("Books_number", "ID_Order", "ID_Book")
           VALUES ($1, $2, $3) RETURNING *`,
          [Books_number, orderId, ID_Book]
        );
        
        orderCompositions.push(compResult.rows[0]);
        
        // Уменьшаем количество на складе
        await client.query(
          `UPDATE "Book" SET "Stock_quantity" = "Stock_quantity" - $1, "updated_at" = CURRENT_TIMESTAMP WHERE "ID" = $2`,
          [Books_number, ID_Book]
        );
      }
      
      await client.query('COMMIT');
      
      // Возвращаем полную информацию о заказе
      res.status(201).json({
        order: createdOrder,
        compositions: orderCompositions,
        pricing: {
          subtotal: subtotal.toFixed(2),
          discount: discountInfo.discount.toFixed(2),
          discountPercent: discountInfo.discountPercent,
          total: discountInfo.finalTotal.toFixed(2)
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update order status
app.put('/api/order/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['COLLECTING', 'DELIVERING', 'DELIVERED', 'PENDING', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') });
    }

    const result = await pool.query(
      `UPDATE "Order" 
       SET "Order_status" = $1, "updated_at" = CURRENT_TIMESTAMP 
       WHERE "ID" = $2 
       RETURNING *`,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check stock availability before order
app.post('/api/order/check-stock', async (req, res) => {
  try {
    const { compositions } = req.body;
    
    if (!compositions || !Array.isArray(compositions) || compositions.length === 0) {
      return res.status(400).json({ error: 'Compositions array is required' });
    }
    
    const stockCheck = [];
    let allAvailable = true;
    
    for (const composition of compositions) {
      const { ID_Book, Books_number } = composition;
      
      if (!ID_Book || !Books_number) {
        continue;
      }
      
      const bookResult = await pool.query('SELECT "ID", "Title", "Stock_quantity" FROM "Book" WHERE "ID" = $1', [ID_Book]);
      
      if (bookResult.rows.length === 0) {
        stockCheck.push({
          bookId: ID_Book,
          available: false,
          error: 'Book not found'
        });
        allAvailable = false;
        continue;
      }
      
      const book = bookResult.rows[0];
      const available = book.Stock_quantity >= Books_number;
      
      if (!available) {
        allAvailable = false;
      }
      
      stockCheck.push({
        bookId: ID_Book,
        bookTitle: book.Title,
        requested: Books_number,
        available: book.Stock_quantity,
        sufficient: available
      });
    }
    
    res.json({
      allAvailable,
      stockCheck
    });
    
  } catch (error) {
    console.error('Error checking stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basket Routes - Add/Update item in basket
app.post('/api/basket/add', async (req, res) => {
  try {
    const { ID_User, ID_Book, Books_number, hasDiscount, originalPrice, discountedPrice } = req.body;

    if (!ID_User || !ID_Book || !Books_number) {
      return res.status(400).json({ error: 'ID_User, ID_Book, and Books_number are required' });
    }

    // Проверяем, существует ли пользователь в таблице Users по ID_User
    const userCheck = await pool.query(
      'SELECT "ID" FROM "Users" WHERE "ID" = $1',
      [ID_User]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in Users table' });
    }

    // Получаем цену книги из базы данных
    const bookResult = await pool.query('SELECT "Price" FROM "Book" WHERE "ID" = $1', [ID_Book]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Рассчитываем Discount_payment (сумма скидки)
    const bookPrice = parseFloat(bookResult.rows[0].Price);
    const discountPayment = hasDiscount && originalPrice && discountedPrice
      ? (originalPrice - discountedPrice) * Books_number
      : 0;

    // Проверяем, существует ли уже запись в корзине
    const existingResult = await pool.query(
      'SELECT "ID", "Books_number" FROM "Basket" WHERE "ID_User" = $1 AND "ID_Book" = $2',
      [ID_User, ID_Book]
    );

    if (existingResult.rows.length > 0) {
      // Обновляем существующую запись
      const existingId = existingResult.rows[0].ID;
      const newQuantity = Books_number;
      
      await pool.query(
        `UPDATE "Basket" 
         SET "Books_number" = $1, 
             "Discount_payment" = $2,
             "updated_at" = CURRENT_TIMESTAMP
         WHERE "ID" = $3`,
        [newQuantity, discountPayment, existingId]
      );
    } else {
      // Создаем новую запись
      await pool.query(
        `INSERT INTO "Basket" ("ID_User", "ID_Book", "Books_number", "Payment", "Discount_payment")
         VALUES ($1, $2, $3, $4, $5)`,
        [ID_User, ID_Book, Books_number, 0, discountPayment]
      );
    }

    // Рассчитываем общую сумму корзины для пользователя
    const basketItemsResult = await pool.query(
      `SELECT b."ID_Book", b."Books_number", b."Discount_payment",
              COALESCE(bk."Price", 0) as "Book_Price"
       FROM "Basket" b
       LEFT JOIN "Book" bk ON b."ID_Book" = bk."ID"
       WHERE b."ID_User" = $1`,
      [ID_User]
    );

    // Рассчитываем общую сумму корзины
    let totalPayment = 0;
    for (const item of basketItemsResult.rows) {
      const itemPrice = parseFloat(item.Book_Price) || 0;
      const itemQuantity = parseInt(item.Books_number) || 1;
      const itemDiscount = parseFloat(item.Discount_payment) || 0;
      
      // Цена товара с учетом скидки
      const itemTotal = (itemPrice * itemQuantity) - itemDiscount;
      totalPayment += itemTotal;
    }

    // Обновляем Payment для всех записей корзины пользователя (общая сумма)
    await pool.query(
      `UPDATE "Basket" 
       SET "Payment" = $1,
           "updated_at" = CURRENT_TIMESTAMP
       WHERE "ID_User" = $2`,
      [totalPayment, ID_User]
    );

    // Возвращаем обновленную корзину
    const updatedBasketResult = await pool.query(
      `SELECT b.*, bk."Title", bk."Author", bk."Price" as "Book_Price"
       FROM "Basket" b
       LEFT JOIN "Book" bk ON b."ID_Book" = bk."ID"
       WHERE b."ID_User" = $1
       ORDER BY b."created_at" DESC`,
      [ID_User]
    );

    return res.json({
      success: true,
      message: 'Basket item added/updated',
      basket: updatedBasketResult.rows,
      totalPayment: totalPayment
    });

  } catch (error) {
    console.error('Error adding/updating basket item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basket Routes - Remove item from basket
app.delete('/api/basket/remove/:userId/:bookId', async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    if (!userId || !bookId) {
      return res.status(400).json({ error: 'ID_User and ID_Book are required' });
    }

    // Проверяем, существует ли пользователь в таблице Users по ID_User
    const userCheck = await pool.query(
      'SELECT "ID" FROM "Users" WHERE "ID" = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in Users table' });
    }

    const result = await pool.query(
      'DELETE FROM "Basket" WHERE "ID_User" = $1 AND "ID_Book" = $2 RETURNING *',
      [userId, bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Basket item not found' });
    }

    // Пересчитываем общую сумму корзины после удаления
    const basketItemsResult = await pool.query(
      `SELECT b."ID_Book", b."Books_number", b."Discount_payment",
              COALESCE(bk."Price", 0) as "Book_Price"
       FROM "Basket" b
       LEFT JOIN "Book" bk ON b."ID_Book" = bk."ID"
       WHERE b."ID_User" = $1`,
      [userId]
    );

    // Рассчитываем общую сумму корзины
    let totalPayment = 0;
    for (const item of basketItemsResult.rows) {
      const itemPrice = parseFloat(item.Book_Price) || 0;
      const itemQuantity = parseInt(item.Books_number) || 1;
      const itemDiscount = parseFloat(item.Discount_payment) || 0;
      
      // Цена товара с учетом скидки
      const itemTotal = (itemPrice * itemQuantity) - itemDiscount;
      totalPayment += itemTotal;
    }

    // Обновляем Payment для всех записей корзины пользователя (общая сумма)
    await pool.query(
      `UPDATE "Basket" 
       SET "Payment" = $1,
           "updated_at" = CURRENT_TIMESTAMP
       WHERE "ID_User" = $2`,
      [totalPayment, userId]
    );

    res.json({
      success: true,
      message: 'Basket item removed',
      basket: result.rows[0],
      totalPayment: totalPayment
    });

  } catch (error) {
    console.error('Error removing basket item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basket Routes - Clear all items from basket for user
app.delete('/api/basket/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'ID_User is required' });
    }

    // Проверяем, существует ли пользователь в таблице Users по ID_User
    const userCheck = await pool.query(
      'SELECT "ID" FROM "Users" WHERE "ID" = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in Users table' });
    }

    const result = await pool.query(
      'DELETE FROM "Basket" WHERE "ID_User" = $1 RETURNING *',
      [userId]
    );

    res.json({
      success: true,
      message: 'Basket cleared',
      deletedCount: result.rows.length,
      totalPayment: 0
    });

  } catch (error) {
    console.error('Error clearing basket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basket Routes - Get user's basket
app.get('/api/basket/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'ID_User is required' });
    }

    // Проверяем, существует ли пользователь в таблице Users по ID_User
    const userCheck = await pool.query(
      'SELECT "ID" FROM "Users" WHERE "ID" = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in Users table' });
    }

    // Получаем корзину пользователя, проверяя что ID_User из Basket существует в Users
    const result = await pool.query(
      `SELECT b.*, bk."Title", bk."Author", bk."Price" as "Book_Price", bk."Description", bk."Stock_quantity"
       FROM "Basket" b
       INNER JOIN "Book" bk ON b."ID_Book" = bk."ID"
       INNER JOIN "Users" u ON b."ID_User" = u."ID"
       WHERE b."ID_User" = $1
       ORDER BY b."created_at" DESC`,
      [userId]
    );

    // Формируем данные корзины с информацией о скидках
    const basketItems = result.rows.map(item => {
      const bookPrice = parseFloat(item.Book_Price) || 0;
      const discountPayment = parseFloat(item.Discount_payment) || 0;
      const hasDiscount = discountPayment > 0;
      
      // Рассчитываем оригинальную цену и цену со скидкой
      const originalPrice = bookPrice;
      const discountedPrice = hasDiscount 
        ? bookPrice - (discountPayment / item.Books_number)
        : bookPrice;

      return {
        ...item,
        hasDiscount,
        originalPrice,
        discountedPrice,
        discountPercent: hasDiscount ? Math.round((discountPayment / (originalPrice * item.Books_number)) * 100) : 0
      };
    });

    res.json({
      success: true,
      basket: basketItems,
      totalPayment: result.rows.length > 0 ? parseFloat(result.rows[0].Payment) || 0 : 0
    });

  } catch (error) {
    console.error('Error fetching user basket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
