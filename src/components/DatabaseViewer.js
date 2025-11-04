import React, { useState, useEffect } from 'react';
import ServiceManager from '../services/ServiceManager';

const DatabaseViewer = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const serviceManager = ServiceManager.getInstance();

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, booksData, ordersData, reviewsData] = await Promise.all([
        serviceManager.userService.getUsers({ page: 1, limit: 100 }),
        serviceManager.bookService.getBooks({ page: 1, limit: 100 }),
        serviceManager.orderService.getOrders({ page: 1, limit: 100 }),
        serviceManager.reviewService.getReviews({ page: 1, limit: 100 })
      ]);

      setUsers(usersData);
      setBooks(booksData);
      setOrders(ordersData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderTable = (data, columns) => {
    if (!data || data.length === 0) {
      return <p>Нет данных</p>;
    }

    return (
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {typeof row[column.toLowerCase()] === 'object' 
                      ? JSON.stringify(row[column.toLowerCase()])
                      : row[column.toLowerCase()] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2>Просмотр базы данных</h2>
          
          <div className="mb-3">
            <button 
              className="btn btn-primary me-2" 
              onClick={loadData}
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Обновить данные'}
            </button>
          </div>

          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Пользователи ({users.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'books' ? 'active' : ''}`}
                onClick={() => setActiveTab('books')}
              >
                Книги ({books.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Заказы ({orders.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Отзывы ({reviews.length})
              </button>
            </li>
          </ul>

          <div className="tab-content mt-3">
            {activeTab === 'users' && renderTable(users, ['ID', 'Email', 'First_name', 'Last_name', 'Phone', 'Address'])}
            {activeTab === 'books' && renderTable(books, ['ID', 'Title', 'Author', 'Price', 'Stock_quantity', 'Publishing_year'])}
            {activeTab === 'orders' && renderTable(orders, ['ID', 'Total_order_quantity', 'Order_date', 'Currency', 'Order_status', 'Tracking_number', 'ID_User'])}
            {activeTab === 'reviews' && renderTable(reviews, ['ID', 'Grade', 'Id_Book', 'id_User'])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;
