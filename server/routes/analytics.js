const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Получить сумму проданных книг за текущий месяц
router.get('/monthly-revenue', authenticateToken, async (req, res) => {
  try {
    // Проверяем, что пользователь - администратор
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Получаем первый и последний день текущего месяца
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const query = `
      SELECT 
        COALESCE(SUM("Currency"), 0) as total_revenue,
        COUNT(*) as order_count
      FROM "Order"
      WHERE "Order_date" >= $1 
        AND "Order_date" <= $2
        AND "Order_status" != 'CANCELLED'
    `;

    const result = await pool.query(query, [firstDay, lastDay]);
    
    res.json({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalRevenue: parseFloat(result.rows[0].total_revenue) || 0,
      orderCount: parseInt(result.rows[0].order_count) || 0,
      period: {
        from: firstDay.toISOString(),
        to: lastDay.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Получить средний чек заказов
router.get('/average-order-value', authenticateToken, async (req, res) => {
  try {
    // Проверяем, что пользователь - администратор
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const query = `
      SELECT 
        COALESCE(AVG("Currency"), 0) as average_value,
        COUNT(*) as total_orders,
        COALESCE(SUM("Currency"), 0) as total_revenue
      FROM "Order"
      WHERE "Order_status" != 'CANCELLED'
    `;

    const result = await pool.query(query);
    
    res.json({
      averageOrderValue: parseFloat(result.rows[0].average_value) || 0,
      totalOrders: parseInt(result.rows[0].total_orders) || 0,
      totalRevenue: parseFloat(result.rows[0].total_revenue) || 0
    });
  } catch (error) {
    console.error('Error fetching average order value:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Получить топ купленных книг
router.get('/top-books', authenticateToken, async (req, res) => {
  try {
    // Проверяем, что пользователь - администратор
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const limit = parseInt(req.query.limit) || 10;

    const query = `
      SELECT 
        b."ID",
        b."Title",
        b."Author",
        b."Price",
        b."Genre",
        COALESCE(SUM(
          CASE 
            WHEN o."ID" IS NULL THEN 0
            WHEN o."Order_status" = 'CANCELLED' THEN 0
            ELSE oc."Books_number"
          END
        ), 0) as total_sold,
        COALESCE(SUM(
          CASE 
            WHEN o."ID" IS NULL THEN 0
            WHEN o."Order_status" = 'CANCELLED' THEN 0
            ELSE oc."Books_number" * b."Price"
          END
        ), 0) as total_revenue
      FROM "Book" b
      LEFT JOIN "Order_composition" oc ON b."ID" = oc."ID_Book"
      LEFT JOIN "Order" o ON oc."ID_Order" = o."ID" AND (o."Order_status" IS NULL OR o."Order_status" != 'CANCELLED')
      GROUP BY b."ID", b."Title", b."Author", b."Price", b."Genre"
      ORDER BY total_sold DESC, total_revenue DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    
    const topBooks = result.rows.map(row => ({
      id: row.ID,
      title: row.Title,
      author: row.Author,
      price: parseFloat(row.Price) || 0,
      genre: row.Genre,
      totalSold: parseInt(row.total_sold) || 0,
      totalRevenue: parseFloat(row.total_revenue) || 0
    }));

    res.json({
      topBooks,
      limit
    });
  } catch (error) {
    console.error('Error fetching top books:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Получить всю аналитику сразу
router.get('/all', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Analytics request from user:', req.user);
    // Проверяем, что пользователь - администратор
    if (!req.user || !req.user.isAdmin) {
      console.log('❌ Access denied - user is not admin:', req.user);
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Получаем первый и последний день текущего месяца
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Сумма продаж за месяц
    const monthlyRevenueQuery = `
      SELECT 
        COALESCE(SUM("Currency"), 0) as total_revenue,
        COUNT(*) as order_count
      FROM "Order"
      WHERE "Order_date" >= $1 
        AND "Order_date" <= $2
        AND "Order_status" != 'CANCELLED'
    `;

    // 2. Средний чек
    const averageOrderQuery = `
      SELECT 
        COALESCE(AVG("Currency"), 0) as average_value,
        COUNT(*) as total_orders,
        COALESCE(SUM("Currency"), 0) as total_revenue
      FROM "Order"
      WHERE "Order_status" != 'CANCELLED'
    `;

    // 3. Топ книг
    const topBooksQuery = `
      SELECT 
        b."ID",
        b."Title",
        b."Author",
        b."Price",
        b."Genre",
        COALESCE(SUM(
          CASE 
            WHEN o."ID" IS NULL THEN 0
            WHEN o."Order_status" = 'CANCELLED' THEN 0
            ELSE oc."Books_number"
          END
        ), 0) as total_sold,
        COALESCE(SUM(
          CASE 
            WHEN o."ID" IS NULL THEN 0
            WHEN o."Order_status" = 'CANCELLED' THEN 0
            ELSE oc."Books_number" * b."Price"
          END
        ), 0) as total_revenue
      FROM "Book" b
      LEFT JOIN "Order_composition" oc ON b."ID" = oc."ID_Book"
      LEFT JOIN "Order" o ON oc."ID_Order" = o."ID" AND (o."Order_status" IS NULL OR o."Order_status" != 'CANCELLED')
      GROUP BY b."ID", b."Title", b."Author", b."Price", b."Genre"
      ORDER BY total_sold DESC, total_revenue DESC
      LIMIT 10
    `;

    const [monthlyResult, averageResult, topBooksResult] = await Promise.all([
      pool.query(monthlyRevenueQuery, [firstDay, lastDay]),
      pool.query(averageOrderQuery),
      pool.query(topBooksQuery)
    ]);

    const topBooks = topBooksResult.rows.map(row => ({
      id: row.ID,
      title: row.Title,
      author: row.Author,
      price: parseFloat(row.Price) || 0,
      genre: row.Genre,
      totalSold: parseInt(row.total_sold) || 0,
      totalRevenue: parseFloat(row.total_revenue) || 0
    }));

    console.log('✅ Analytics data prepared successfully');
    res.json({
      monthlyRevenue: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        totalRevenue: parseFloat(monthlyResult.rows[0].total_revenue) || 0,
        orderCount: parseInt(monthlyResult.rows[0].order_count) || 0,
        period: {
          from: firstDay.toISOString(),
          to: lastDay.toISOString()
        }
      },
      averageOrderValue: {
        averageOrderValue: parseFloat(averageResult.rows[0].average_value) || 0,
        totalOrders: parseInt(averageResult.rows[0].total_orders) || 0,
        totalRevenue: parseFloat(averageResult.rows[0].total_revenue) || 0
      },
      topBooks: {
        topBooks,
        limit: 10
      }
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

