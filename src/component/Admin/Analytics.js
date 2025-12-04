import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AnalyticsService from '../../services/AnalyticsService';
import { getBookImage } from '../../utils/bookImageLoader';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const analyticsService = new AnalyticsService();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading analytics...');
      const data = await analyticsService.getAllAnalytics();
      console.log('✅ Analytics loaded:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Неизвестная ошибка';
      let errorDetails = '';
      
      if (error.response) {
        // Сервер ответил с ошибкой
        errorMessage = error.response.data?.error || error.response.statusText || 'Ошибка сервера';
        errorDetails = `Статус: ${error.response.status}`;
        if (error.response.data?.details) {
          errorDetails += ` | Детали: ${error.response.data.details}`;
        }
      } else if (error.request) {
        // Запрос был отправлен, но ответа не получено
        errorMessage = 'Сервер не отвечает';
        errorDetails = 'Проверьте, что сервер запущен и доступен';
      } else {
        // Ошибка при настройке запроса
        errorMessage = error.message || 'Ошибка при выполнении запроса';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Ошибка загрузки аналитики',
        html: `
          <p><strong>${errorMessage}</strong></p>
          ${errorDetails ? `<p style="font-size: 12px; color: #666;">${errorDetails}</p>` : ''}
        `,
        width: '500px'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthName = (month) => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month - 1] || '';
  };

  if (loading) {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h3>Загрузка аналитики...</h3>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h3>Нет данных для отображения</h3>
      </div>
    );
  }

  return (
    <div className="analytics-container" style={{ padding: '20px 0' }}>
      {/* Сумма продаж за месяц */}
      <div className="analytics-card" style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '25px',
        marginBottom: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '24px' }}>
          📊 Сумма продаж за месяц
        </h3>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Период
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
              {getMonthName(analytics.monthlyRevenue.month)} {analytics.monthlyRevenue.year}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Общая сумма
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
              {formatCurrency(analytics.monthlyRevenue.totalRevenue)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Количество заказов
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>
              {analytics.monthlyRevenue.orderCount}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
          С {formatDate(analytics.monthlyRevenue.period.from)} по {formatDate(analytics.monthlyRevenue.period.to)}
        </div>
      </div>

      {/* Средний чек */}
      <div className="analytics-card" style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '25px',
        marginBottom: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '24px' }}>
          💰 Средний чек заказов
        </h3>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Средний чек
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e74c3c' }}>
              {formatCurrency(analytics.averageOrderValue.averageOrderValue)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Всего заказов
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>
              {analytics.averageOrderValue.totalOrders}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Общая выручка
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>
              {formatCurrency(analytics.averageOrderValue.totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Топ купленных книг */}
      <div className="analytics-card" style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '24px' }}>
          📚 Топ купленных книг
        </h3>
        {analytics.topBooks.topBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>Пока нет проданных книг</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered" style={{ backgroundColor: '#fff', marginTop: '20px' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '80px' }}>Изображение</th>
                  <th>Название</th>
                  <th>Автор</th>
                  <th>Жанр</th>
                  <th style={{ width: '120px' }}>Цена</th>
                  <th style={{ width: '120px' }}>Продано</th>
                  <th style={{ width: '150px' }}>Выручка</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topBooks.topBooks.map((book, index) => (
                  <tr key={book.id}>
                    <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>{index + 1}</td>
                    <td>
                      <img
                        src={getBookImage(book.id) || `/assets/img/book/${book.id}.png`}
                        alt={book.title}
                        style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          e.target.src = '/assets/img/common/placeholder.png';
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: '500' }}>{book.title}</td>
                    <td>{book.author}</td>
                    <td>
                      <span style={{
                        backgroundColor: '#e8f4f8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#2c3e50'
                      }}>
                        {book.genre || 'Не указан'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#2c3e50' }}>
                        {formatCurrency(book.price)}
                      </strong>
                    </td>
                    <td>
                      <span style={{
                        color: '#27ae60',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {book.totalSold} шт.
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#e74c3c', fontSize: '16px' }}>
                        {formatCurrency(book.totalRevenue)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

