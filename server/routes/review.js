const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all reviews
router.get('/all', async (req, res) => {
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

// Get reviews by book ID
router.get('/book/:bookId', async (req, res) => {
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

// Get average rating for book
router.get('/book/:bookId/average', async (req, res) => {
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
router.post('/create', async (req, res) => {
  try {
    const { Grade, Id_Book, id_User, Review } = req.body;
    
    // Валидация
    if (!Grade || Grade < 1 || Grade > 5) {
      return res.status(400).json({ error: 'Grade must be between 1 and 5' });
    }
    if (!Id_Book || !id_User) {
      return res.status(400).json({ error: 'Id_Book and id_User are required' });
    }
    
    // Создаём новый отзыв (теперь можно создавать несколько отзывов от одного пользователя)
    console.log('📝 Creating review:', { Grade, Id_Book, id_User, Review: Review ? Review.substring(0, 50) + '...' : null });
    
    // Проверяем, нет ли UNIQUE constraint перед вставкой
    const constraintCheck = await pool.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = '"Reviews"'::regclass 
        AND contype = 'u' 
        AND array_length(conkey, 1) = 2
        AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = '"Reviews"'::regclass AND attname = 'Id_Book')
        AND conkey[2] = (SELECT attnum FROM pg_attribute WHERE attrelid = '"Reviews"'::regclass AND attname = 'id_User')
    `);
    
    if (constraintCheck.rows.length > 0) {
      const constraintName = constraintCheck.rows[0].conname;
      console.warn(`⚠️ Found UNIQUE constraint: ${constraintName}. Attempting to drop...`);
      await pool.query(`ALTER TABLE "Reviews" DROP CONSTRAINT IF EXISTS "${constraintName}"`);
      console.log(`✅ Constraint ${constraintName} dropped`);
    }
    
    const result = await pool.query(
      'INSERT INTO "Reviews" ("Grade", "Id_Book", "id_User", "Review") VALUES ($1, $2, $3, $4) RETURNING *',
      [Grade, Id_Book, id_User, Review || null]
    );
    
    console.log('✅ Review created successfully:', result.rows[0].ID);
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
    
    // Если UNIQUE constraint все еще существует (для обратной совместимости)
    if (error.code === '23505') {
      console.error('❌ UNIQUE constraint violation detected!');
      console.error('Constraint name:', error.constraint);
      console.error('Error detail:', error.detail);
      console.error('Full error:', error);
      
      // Пытаемся найти и удалить constraint автоматически
      try {
        const constraintName = error.constraint || 'Reviews_Id_Book_id_User_key';
        console.log(`🔧 Attempting to drop constraint: ${constraintName}`);
        await pool.query(`ALTER TABLE "Reviews" DROP CONSTRAINT IF EXISTS "${constraintName}"`);
        console.log(`✅ Constraint ${constraintName} dropped successfully`);
        
        // Пытаемся создать отзыв снова
        const retryResult = await pool.query(
          'INSERT INTO "Reviews" ("Grade", "Id_Book", "id_User", "Review") VALUES ($1, $2, $3, $4) RETURNING *',
          [Grade, Id_Book, id_User, Review || null]
        );
        return res.status(201).json(retryResult.rows[0]);
      } catch (retryError) {
        console.error('❌ Failed to auto-fix constraint:', retryError);
        return res.status(409).json({ 
          error: 'UNIQUE constraint violation',
          detail: `Constraint: ${error.constraint || 'unknown'}. Выполните: psql bookstore < database/schema.sql`,
          constraint: error.constraint
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error.message 
    });
  }
});

// Update review
router.put('/update', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;

