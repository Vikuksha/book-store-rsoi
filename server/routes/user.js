const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const JWT_SECRET = require('../config/jwt');
const { authenticateToken } = require('../middleware/auth');

// Create user
router.post('/create', async (req, res) => {
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

// Login
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Специальная обработка для admin/admin
    let effectiveEmail = Email;
    let isAdminLogin = false;
    
    if (Email === 'admin' && Password === 'admin') {
      effectiveEmail = 'admin@bookstore.com';
      isAdminLogin = true;
    }

    // Find user
    const result = await pool.query(
      'SELECT "ID", "Email", "Password", "First_name", "Last_name", "Phone", "Address" FROM "Users" WHERE "Email" = $1',
      [effectiveEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    let isValidPassword = false;
    if (isAdminLogin) {
      // Для admin/admin проверяем пароль напрямую
      isValidPassword = await bcrypt.compare('admin', user.Password);
    } else {
      isValidPassword = await bcrypt.compare(Password, user.Password);
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Проверяем, является ли пользователь администратором
    const isAdmin = user.Email === 'admin@bookstore.com' || user.Email === 'admin';

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.ID, 
        email: user.Email,
        firstName: user.First_name,
        lastName: user.Last_name,
        isAdmin: isAdmin
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
      user: {
        ...user,
        isAdmin: isAdmin
      },
      basket: basketItems,
      totalPayment: basketItems.length > 0 ? parseFloat(basketItems[0].Payment) || 0 : 0
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/all', authenticateToken, async (req, res) => {
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

// Get user by ID
router.get('/:id', async (req, res) => {
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

// Get user by email
router.get('/email/:email', async (req, res) => {
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

// Update user
router.put('/update', authenticateToken, async (req, res) => {
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

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
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

module.exports = router;

