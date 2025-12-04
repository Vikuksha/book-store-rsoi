import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import AuthService from '../../services/AuthService';
import { getBookImage } from '../../utils/bookImageLoader';
import Header from '../../component/Common/Header';
import Footer from '../../component/Common/Footer';
import Analytics from '../../component/Admin/Analytics';

const AdminPanel = () => {
  const history = useHistory();
  const authService = new AuthService();
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'analytics'
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    Price: '',
    Stock_quantity: '',
    Discount_percent: '',
    hasDiscount: false
  });

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    // Проверяем права администратора
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      Swal.fire({
        icon: 'error',
        title: 'Доступ запрещен',
        text: 'Только администраторы могут получить доступ к этой странице',
      }).then(() => {
        history.push('/login');
      });
      return;
    }

    // Загружаем книги только если активна вкладка "books"
    if (activeTab === 'books') {
      loadBooks();
    }
  }, [activeTab]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_SERVER_API || 'http://localhost:3003'}/api/book/all`);
      if (!response.ok) throw new Error('Failed to load books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
      Swal.fire({
        icon: 'error',
        title: 'Ошибка',
        text: 'Не удалось загрузить список книг',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    const discountPercent = parseFloat(book.Discount_percent) || 0;
    setFormData({
      Price: book.Price || '',
      Stock_quantity: book.Stock_quantity || '',
      Discount_percent: discountPercent,
      hasDiscount: discountPercent > 0
    });
  };

  const handleCancel = () => {
    setEditingBook(null);
    setFormData({
      Price: '',
      Stock_quantity: '',
      Discount_percent: '',
      hasDiscount: false
    });
  };

  const handleSave = async () => {
    if (!editingBook) return;

    try {
      const token = authService.getAuthToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const updateData = {};
      
      // Валидация и добавление цены
      if (formData.Price !== '' && formData.Price !== null) {
        const price = parseFloat(formData.Price);
        if (isNaN(price) || price < 0) {
          throw new Error('Цена должна быть положительным числом');
        }
        updateData.Price = price;
      }
      
      // Валидация и добавление количества
      if (formData.Stock_quantity !== '' && formData.Stock_quantity !== null) {
        const quantity = parseInt(formData.Stock_quantity);
        if (isNaN(quantity) || quantity < 0) {
          throw new Error('Количество должно быть неотрицательным числом');
        }
        updateData.Stock_quantity = quantity;
      }
      
      // Обработка скидки: если hasDiscount = false, устанавливаем 0, иначе используем значение
      if (formData.hasDiscount) {
        const discount = parseFloat(formData.Discount_percent) || 0;
        if (isNaN(discount) || discount < 0 || discount > 100) {
          throw new Error('Скидка должна быть числом от 0 до 100');
        }
        updateData.Discount_percent = discount;
      } else {
        // Если скидка отключена, устанавливаем 0
        updateData.Discount_percent = 0;
      }
      
      // Проверяем, что есть хотя бы одно поле для обновления
      if (Object.keys(updateData).length === 0) {
        throw new Error('Необходимо указать хотя бы одно поле для обновления');
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_API || 'http://localhost:3003'}/api/book/${editingBook.ID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update book');
      }

      const result = await response.json();
      
      Swal.fire({
        icon: 'success',
        title: 'Успешно',
        text: 'Книга обновлена. Изменения будут видны всем пользователям после обновления страницы.',
        timer: 3000
      });

      // Обновляем список книг
      await loadBooks();
      handleCancel();
      
      // Обновляем данные в Redux store для всех пользователей
      // Это можно сделать через перезагрузку страницы или обновление Redux store
      // Для простоты, можно добавить событие, которое обновит данные
      window.dispatchEvent(new Event('booksUpdated'));
    } catch (error) {
      console.error('Error updating book:', error);
      Swal.fire({
        icon: 'error',
        title: 'Ошибка',
        text: error.message || 'Не удалось обновить книгу',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading && activeTab === 'books') {
    return (
      <>
        <Header />
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Загрузка...</h2>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <section id="admin_panel" className="ptb-100">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section-title text-center mb-50">
                <h2>Панель администратора</h2>
                <p>Управление системой</p>
              </div>

              {/* Вкладки */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '30px',
                borderBottom: '2px solid #e0e0e0'
              }}>
                <button
                  onClick={() => setActiveTab('books')}
                  style={{
                    padding: '12px 30px',
                    marginRight: '10px',
                    border: 'none',
                    backgroundColor: activeTab === 'books' ? '#3498db' : '#ecf0f1',
                    color: activeTab === 'books' ? '#fff' : '#2c3e50',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s ease',
                    borderBottom: activeTab === 'books' ? '3px solid #2980b9' : 'none'
                  }}
                >
                  📚 Управление книгами
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  style={{
                    padding: '12px 30px',
                    border: 'none',
                    backgroundColor: activeTab === 'analytics' ? '#3498db' : '#ecf0f1',
                    color: activeTab === 'analytics' ? '#fff' : '#2c3e50',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s ease',
                    borderBottom: activeTab === 'analytics' ? '3px solid #2980b9' : 'none'
                  }}
                >
                  📊 Аналитика
                </button>
              </div>

              {/* Контент вкладок */}
              {activeTab === 'books' && (

              <div className="table-responsive" style={{ marginTop: '30px' }}>
                <table className="table table-bordered" style={{ backgroundColor: '#fff' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ width: '50px' }}>ID</th>
                      <th style={{ width: '80px' }}>Изображение</th>
                      <th>Название</th>
                      <th>Автор</th>
                      <th style={{ width: '120px' }}>Цена ($)</th>
                      <th style={{ width: '120px' }}>Количество</th>
                      <th style={{ width: '180px' }}>Скидка</th>
                      <th style={{ width: '150px' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.ID}>
                        <td>{book.ID}</td>
                        <td>
                          <img
                            src={getBookImage(book.ID) || `/assets/img/book/${book.ID}.png`}
                            alt={book.Title}
                            style={{ width: '50px', height: '70px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = '/assets/img/common/placeholder.png';
                            }}
                          />
                        </td>
                        <td>{book.Title}</td>
                        <td>{book.Author}</td>
                        <td>
                          {editingBook?.ID === book.ID ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              name="Price"
                              value={formData.Price}
                              onChange={handleInputChange}
                              className="form-control"
                              placeholder="Цена"
                              style={{ width: '100%' }}
                              required
                            />
                          ) : (
                            <strong style={{ color: '#2c3e50' }}>
                              ${parseFloat(book.Price || 0).toFixed(2)}
                            </strong>
                          )}
                        </td>
                        <td>
                          {editingBook?.ID === book.ID ? (
                            <input
                              type="number"
                              min="0"
                              name="Stock_quantity"
                              value={formData.Stock_quantity}
                              onChange={handleInputChange}
                              className="form-control"
                              placeholder="Количество"
                              style={{ width: '100%' }}
                              required
                            />
                          ) : (
                            <span style={{ 
                              color: (book.Stock_quantity || 0) > 0 ? '#27ae60' : '#e74c3c',
                              fontWeight: 'bold'
                            }}>
                              {book.Stock_quantity || 0}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingBook?.ID === book.ID ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                              <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                fontSize: '14px',
                                cursor: 'pointer',
                                userSelect: 'none'
                              }}>
                                <input
                                  type="checkbox"
                                  name="hasDiscount"
                                  checked={formData.hasDiscount}
                                  onChange={handleInputChange}
                                  style={{ cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: formData.hasDiscount ? 'bold' : 'normal' }}>
                                  {formData.hasDiscount ? '✓ Скидка активна' : 'Скидка неактивна'}
                                </span>
                              </label>
                              {formData.hasDiscount && (
                                <div>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    name="Discount_percent"
                                    value={formData.Discount_percent}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Процент скидки (0-100)"
                                    style={{ width: '100%' }}
                                  />
                                  <small style={{ color: '#666', fontSize: '11px' }}>
                                    Введите процент от 0 до 100
                                  </small>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              {(book.Discount_percent && parseFloat(book.Discount_percent) > 0) ? (
                                <span style={{ 
                                  color: '#e74c3c', 
                                  fontWeight: 'bold',
                                  fontSize: '16px'
                                }}>
                                  -{book.Discount_percent}%
                                </span>
                              ) : (
                                <span style={{ color: '#999', fontStyle: 'italic' }}>
                                  Нет скидки
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {editingBook?.ID === book.ID ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={handleSave}
                                style={{ width: '100%' }}
                              >
                                ✓ Сохранить
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={handleCancel}
                                style={{ width: '100%' }}
                              >
                                ✗ Отмена
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleEdit(book)}
                              style={{ width: '100%' }}
                            >
                              ✏️ Редактировать
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}

              {activeTab === 'analytics' && (
                <Analytics />
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default AdminPanel;

