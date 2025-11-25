import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ServiceManager from '../services/ServiceManager';
import DataAdapterService from '../services/DataAdapterService';

const BookLoader = () => {
  const dispatch = useDispatch();
  const dataAdapter = new DataAdapterService();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        console.log('🔄 BookLoader: Starting to load books...');
        const serviceManager = ServiceManager.getInstance();
        
        // Загружаем все книги из базы данных (limit: 1000 для больших каталогов)
        console.log('🔄 BookLoader: Calling bookService.getBooks...');
        const books = await serviceManager.bookService.getBooks({ page: 1, limit: 1000 });
        
        console.log(`📚 BookLoader: Loaded ${books.length} books from database`, books);
        
        if (!books || books.length === 0) {
          console.warn('⚠️ BookLoader: No books found in database');
          return;
        }
        
        // Загружаем средние оценки для всех книг
        console.log('🔄 BookLoader: Loading average ratings for books...');
        const booksWithRatings = await Promise.all(
          books.map(async (book) => {
            try {
              if (!book || !book.ID) {
                console.warn(`⚠️ BookLoader: Invalid book data for rating:`, book);
                return { book, rating: { rate: 0, count: 0 } };
              }
              const ratingData = await serviceManager.reviewService.getAverageRating(book.ID);
              const rating = {
                rate: ratingData?.averageRating || 0,
                count: ratingData?.reviewCount || 0
              };
              console.log(`✅ BookLoader: Rating for book ${book.ID}:`, rating);
              return {
                book,
                rating
              };
            } catch (error) {
              console.warn(`⚠️ BookLoader: Error loading rating for book ${book?.ID}:`, error);
              return { book, rating: { rate: 0, count: 0 } };
            }
          })
        );
        
        // Конвертируем книги в формат для ProductCard с оценками и скидками
        console.log('🔄 BookLoader: Converting books to product format...');
        const bookProducts = booksWithRatings.map(({ book, rating }, index) => {
          try {
            if (!book || !book.ID) {
              console.warn('⚠️ BookLoader: Invalid book data:', book);
              return null;
            }
            const product = dataAdapter.convertBookToProductCard(book, index);
            // Обновляем рейтинг из базы данных
            product.rating = {
              rate: rating.rate || 0,
              count: rating.count || 0
            };
            
            // Используем данные из базы данных (цена, скидка, количество уже установлены в convertBookToProductCard)
            // Проверяем, что данные правильно установлены
            const discountPercent = product.discountPercent || 0;
            const hasDiscount = product.hasDiscount || false;
            
            if (hasDiscount && discountPercent > 0) {
              console.log(`🎯 BookLoader: Product ${product.id} - Discount ${discountPercent}% from DB. Original: $${(product.originalPrice || 0).toFixed(2)}, Discounted: $${(product.discountedPrice || 0).toFixed(2)}`);
            } else {
              console.log(`ℹ️ BookLoader: Product ${product.id} - No discount (from DB)`);
            }
            
            console.log(`✅ BookLoader: Product ${product.id} - Rating set to:`, product.rating);
            return product;
          } catch (error) {
            console.error(`❌ BookLoader: Error converting book ${book?.ID}:`, error);
            return null;
          }
        }).filter(book => book !== null);
        
        console.log(`📚 BookLoader: Converted ${bookProducts.length} books to products`, bookProducts);
        
        // Добавляем книги в Redux store
        if (bookProducts.length > 0) {
          console.log('🔄 BookLoader: Dispatching books to Redux store...');
          dispatch({ type: 'products/loadBooksFromDB', payload: bookProducts });
          console.log(`✅ BookLoader: Successfully added ${bookProducts.length} books to Redux store`);
        } else {
          console.warn('⚠️ BookLoader: No valid book products to add to store');
        }
      } catch (error) {
        console.error('❌ BookLoader: Error loading books:', error);
        if (error.response) {
          console.error('❌ BookLoader: API Error Response:', error.response.data);
          console.error('❌ BookLoader: API Error Status:', error.response.status);
        } else if (error.request) {
          console.error('❌ BookLoader: No response from server. Is the server running?');
        } else {
          console.error('❌ BookLoader: Error details:', error.message);
        }
      }
    };

    // Небольшая задержка, чтобы убедиться, что Redux store инициализирован
    const timer = setTimeout(() => {
      loadBooks();
    }, 100);

    // Слушаем событие обновления книг (когда администратор обновляет книгу)
    const handleBooksUpdate = () => {
      console.log('🔄 BookLoader: Books updated event received, reloading books...');
      loadBooks();
    };

    window.addEventListener('booksUpdated', handleBooksUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('booksUpdated', handleBooksUpdate);
    };
  }, [dispatch, dataAdapter]);

  return null; // Этот компонент не рендерит ничего
};

export default BookLoader;

