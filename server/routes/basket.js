const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Add/Update item in basket
router.post('/add', async (req, res) => {
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

// Remove item from basket
router.delete('/remove/:userId/:bookId', async (req, res) => {
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

// Clear all items from basket for user
router.delete('/clear/:userId', async (req, res) => {
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

// Get user's basket
router.get('/user/:userId', async (req, res) => {
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

module.exports = router;

