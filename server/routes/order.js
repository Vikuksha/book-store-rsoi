const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const calculateDiscount = require('../utils/discount');

// Create complete order with stock check
router.post('/create-complete', async (req, res) => {
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
      
      // Рассчитываем скидку перед созданием заказа
      const subtotal = bookDetails.reduce((sum, item) => {
        return sum + (parseFloat(item.book.Price) * item.quantity);
      }, 0);
      
      const discountInfo = calculateDiscount(subtotal, order.Total_order_quantity || compositions.reduce((sum, c) => sum + c.Books_number, 0));
      
      // Общая сумма корзины с учетом всех скидок
      // Если Currency передан из фронтенда, используем его, иначе рассчитываем
      const totalAmount = order.Currency && order.Currency > 0 
        ? parseFloat(order.Currency) 
        : discountInfo.finalTotal;
      
      // Генерируем четырехзначный Tracking_number (от 1000 до 9999)
      let trackingNumber = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Убеждаемся, что Tracking_number - строка из 4 цифр
      if (!trackingNumber || trackingNumber.length !== 4) {
        trackingNumber = Math.floor(1000 + Math.random() * 9000).toString();
      }
      
      console.log('📦 Generated Tracking_number:', trackingNumber, 'Type:', typeof trackingNumber);
      
      // Подготавливаем данные для вставки
      const totalOrderQuantity = order.Total_order_quantity || compositions.reduce((sum, c) => sum + c.Books_number, 0);
      const orderStatus = order.Order_status || 'COLLECTING';
      
      console.log('📦 Order data before insert:', {
        Total_order_quantity: totalOrderQuantity,
        Currency: totalAmount,
        Order_status: orderStatus,
        Tracking_number: trackingNumber,
        Tracking_number_type: typeof trackingNumber,
        ID_User: order.ID_User
      });
      
      // Создаём заказ со статусом "COLLECTING" (собирается)
      // Currency содержит общую сумму корзины
      // Tracking_number - четырехзначное число
      const insertQuery = `INSERT INTO "Order" ("Total_order_quantity", "Currency", "Order_status", "Tracking_number", "ID_User")
         VALUES ($1, $2, $3, $4, $5) RETURNING *`;
      
      const insertParams = [
        totalOrderQuantity,
        totalAmount, // Общая сумма корзины с учетом всех скидок
        orderStatus, // Начинаем с состояния "собирается"
        trackingNumber, // Четырехзначный номер отслеживания
        order.ID_User
      ];
      
      console.log('📦 SQL Query:', insertQuery);
      console.log('📦 SQL Params:', insertParams);
      
      const orderResult = await client.query(insertQuery, insertParams);
      
      const createdOrder = orderResult.rows[0];
      const orderId = createdOrder.ID; // ID заказа из таблицы Order
      
      console.log('✅ Order created in table "Order":', {
        ID: createdOrder.ID,
        Tracking_number: createdOrder.Tracking_number,
        Order_status: createdOrder.Order_status,
        Currency: createdOrder.Currency
      });
      
      console.log('🔗 Order ID to use in Order_composition:', orderId);
      
      // Логируем входящие данные для отладки
      console.log('📥 Raw compositions received from frontend:', {
        count: compositions.length,
        compositions: compositions.map(c => ({
          ID_Book: c.ID_Book,
          ID_Book_type: typeof c.ID_Book,
          Books_number: c.Books_number,
          Books_number_type: typeof c.Books_number,
          raw: c
        }))
      });
      
      // Группируем книги по ID_Book и суммируем Books_number
      // Если в корзине есть несколько записей с одинаковым ID_Book, объединяем их
      const groupedCompositions = {};
      
      for (const composition of compositions) {
        // Приводим к числу для надежности
        const ID_Book = typeof composition.ID_Book === 'string' ? parseInt(composition.ID_Book) : composition.ID_Book;
        const Books_number = typeof composition.Books_number === 'string' ? parseInt(composition.Books_number) : (composition.Books_number || 1);
        
        if (!ID_Book || isNaN(ID_Book) || !Books_number || isNaN(Books_number) || Books_number <= 0) {
          console.error('❌ Invalid composition data:', {
            original: composition,
            parsed: { ID_Book, Books_number }
          });
          throw new Error(`Invalid composition data: ID_Book=${ID_Book}, Books_number=${Books_number}`);
        }
        
        console.log(`📚 Processing: ID_Book=${ID_Book}, Books_number=${Books_number}`);
        
        // Группируем по ID_Book и суммируем количество
        if (groupedCompositions[ID_Book]) {
          const oldValue = groupedCompositions[ID_Book];
          groupedCompositions[ID_Book] += Books_number;
          console.log(`  ➕ Book ${ID_Book}: ${oldValue} + ${Books_number} = ${groupedCompositions[ID_Book]}`);
        } else {
          groupedCompositions[ID_Book] = Books_number;
          console.log(`  ✨ Book ${ID_Book}: new entry with quantity ${Books_number}`);
        }
      }
      
      console.log('📦 Grouped compositions by ID_Book:', {
        orderId: orderId,
        originalCount: compositions.length,
        groupedCount: Object.keys(groupedCompositions).length,
        groupedCompositions: Object.entries(groupedCompositions).map(([ID_Book, Books_number]) => ({
          ID_Book: parseInt(ID_Book),
          Books_number: Books_number
        }))
      });
      
      // Создаём состав заказа и обновляем количество на складе
      const orderCompositions = [];
      
      // Создаем записи в Order_composition для каждой уникальной книги
      for (const [ID_Book, totalBooks_number] of Object.entries(groupedCompositions)) {
        const bookId = parseInt(ID_Book);
        const totalQuantity = parseInt(totalBooks_number);
        
        console.log('💾 Inserting into Order_composition:', {
          ID_Book: bookId,
          ID_Book_type: typeof bookId,
          ID_Order: orderId,
          ID_Order_type: typeof orderId,
          Books_number: totalQuantity,
          Books_number_type: typeof totalQuantity,
          raw_totalBooks_number: totalBooks_number,
          raw_totalBooks_number_type: typeof totalBooks_number
        });
        
        // Создаём запись в Order_composition
        // Записываем: ID_Book (ID книги), ID_Order (ID заказа из таблицы Order), Books_number (общее количество книг с этим ID)
        // ID_Order должен совпадать с ID из таблицы Order
        const insertQuery = `INSERT INTO "Order_composition" ("Books_number", "ID_Order", "ID_Book")
           VALUES ($1, $2, $3) RETURNING *`;
        const insertParams = [totalQuantity, orderId, bookId];
        
        console.log('💾 SQL Query:', insertQuery);
        console.log('💾 SQL Params:', insertParams);
        
        const compResult = await client.query(insertQuery, insertParams);
        
        const createdComposition = compResult.rows[0];
        orderCompositions.push(createdComposition);
        
        // Проверяем, что ID_Order в Order_composition совпадает с ID из Order
        if (createdComposition.ID_Order !== orderId) {
          console.error('❌ ERROR: ID_Order mismatch!', {
            expectedOrderId: orderId,
            actualID_Order: createdComposition.ID_Order
          });
          throw new Error(`ID_Order mismatch: expected ${orderId}, got ${createdComposition.ID_Order}`);
        }
        
        console.log('✅ Order_composition created with matching Order ID:', {
          Composition_ID: createdComposition.ID,
          ID_Book: createdComposition.ID_Book,
          ID_Order: createdComposition.ID_Order, // Должен совпадать с orderId
          Order_ID_from_Order_table: orderId, // ID из таблицы Order
          Match: createdComposition.ID_Order === orderId ? '✅ MATCH' : '❌ MISMATCH',
          Books_number: createdComposition.Books_number, // Общее количество книг с этим ID
          Note: `If user added ${totalQuantity} books with ID ${bookId}, Books_number = ${totalQuantity}`
        });
        
        // Уменьшаем количество на складе на общее количество
        await client.query(
          `UPDATE "Book" SET "Stock_quantity" = "Stock_quantity" - $1, "updated_at" = CURRENT_TIMESTAMP WHERE "ID" = $2`,
          [totalQuantity, bookId]
        );
        
        console.log(`📚 Book ${bookId} stock updated: -${totalQuantity} (total quantity for this book in order)`);
      }
      
      console.log(`✅ All ${orderCompositions.length} Order_composition entries created successfully`);
      
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

// Get orders by user ID
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNum = parseInt(userId);

    console.log(`📦 API: Requesting orders for user ID: ${userIdNum}`);
    console.log(`📦 API: Authenticated user from token:`, req.user);
    console.log(`📦 API: Authenticated user ID from token: ${req.user.userId}`);
    console.log(`📦 API: Is admin: ${req.user.isAdmin}`);

    // Приводим к числу для сравнения
    const authenticatedUserId = parseInt(req.user.userId) || req.user.userId;
    
    // Проверяем, что пользователь запрашивает свои заказы или является администратором
    if (authenticatedUserId !== userIdNum && !req.user.isAdmin) {
      console.error(`❌ API: Access denied. Requested user: ${userIdNum} (type: ${typeof userIdNum}), Authenticated user: ${authenticatedUserId} (type: ${typeof authenticatedUserId})`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Получаем заказы пользователя из таблицы Order
    const ordersQuery = `
      SELECT 
        "ID",
        "Order_date",
        "Currency",
        "Order_status",
        "Tracking_number",
        "ID_User"
      FROM "Order"
      WHERE "ID_User" = $1
      ORDER BY "Order_date" DESC
    `;

    console.log(`📦 API: Executing query for user ${userIdNum}`);
    const result = await pool.query(ordersQuery, [userIdNum]);
    console.log(`📦 API: Found ${result.rows.length} orders in database`);

    // Обрабатываем результаты
    const orders = result.rows.map(row => {
      return {
        ID: row.ID,
        Order_date: row.Order_date,
        Currency: parseFloat(row.Currency) || 0,
        Order_status: row.Order_status,
        Tracking_number: row.Tracking_number,
        ID_User: row.ID_User
      };
    });

    console.log(`✅ API: Retrieved ${orders.length} orders for user ${userIdNum}:`, orders);
    res.json(orders);

  } catch (error) {
    console.error('❌ API: Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
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
router.post('/check-stock', async (req, res) => {
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

module.exports = router;

