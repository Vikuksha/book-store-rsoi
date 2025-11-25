const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all books
router.get('/all', async (req, res) => {
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

// Get book by ID
router.get('/:id', async (req, res) => {
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

// Update book (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { Price, Stock_quantity, Discount_percent } = req.body;

    // Проверяем существование книги
    const bookCheck = await pool.query('SELECT * FROM "Book" WHERE "ID" = $1', [id]);
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (Price !== undefined) {
      updateFields.push(`"Price" = $${paramCount}`);
      updateValues.push(Price);
      paramCount++;
    }

    if (Stock_quantity !== undefined) {
      updateFields.push(`"Stock_quantity" = $${paramCount}`);
      updateValues.push(Stock_quantity);
      paramCount++;
    }

    if (Discount_percent !== undefined) {
      // Проверяем, существует ли колонка Discount_percent, если нет - добавляем
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Book' AND column_name = 'Discount_percent'
      `);
      
      if (columnCheck.rows.length === 0) {
        // Добавляем колонку если её нет
        await pool.query(`
          ALTER TABLE "Book" 
          ADD COLUMN IF NOT EXISTS "Discount_percent" DECIMAL(5,2) DEFAULT 0 CHECK ("Discount_percent" >= 0 AND "Discount_percent" <= 100)
        `);
        console.log('✅ Added Discount_percent column to Book table');
      }
      
      updateFields.push(`"Discount_percent" = $${paramCount}`);
      updateValues.push(Discount_percent);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`"updated_at" = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE "Book" 
      SET ${updateFields.join(', ')} 
      WHERE "ID" = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    console.log(`✅ Admin ${req.user.email} updated book ${id}:`, {
      Price: Price !== undefined ? Price : 'unchanged',
      Stock_quantity: Stock_quantity !== undefined ? Stock_quantity : 'unchanged',
      Discount_percent: Discount_percent !== undefined ? Discount_percent : 'unchanged'
    });

    res.json({
      message: 'Book updated successfully',
      book: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

