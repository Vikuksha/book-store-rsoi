import React, { useState } from 'react';
import ServiceManager from '../services/ServiceManager';

const DatabaseConnectionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const serviceManager = ServiceManager.getInstance();

  const testConnection = async () => {
    setLoading(true);
    const results = {};

    try {
      // Тест подключения к пользователям
      try {
        await serviceManager.userService.getUsers({ page: 1, limit: 1 });
        results.users = { status: 'success', message: 'Подключение к таблице Users успешно' };
      } catch (error) {
        results.users = { status: 'error', message: `Ошибка подключения к Users: ${error.message}` };
      }

      // Тест подключения к книгам
      try {
        await serviceManager.bookService.getBooks({ page: 1, limit: 1 });
        results.books = { status: 'success', message: 'Подключение к таблице Book успешно' };
      } catch (error) {
        results.books = { status: 'error', message: `Ошибка подключения к Book: ${error.message}` };
      }

      // Тест подключения к заказам
      try {
        await serviceManager.orderService.getOrders({ page: 1, limit: 1 });
        results.orders = { status: 'success', message: 'Подключение к таблице Order успешно' };
      } catch (error) {
        results.orders = { status: 'error', message: `Ошибка подключения к Order: ${error.message}` };
      }

      // Тест подключения к отзывам
      try {
        await serviceManager.reviewService.getReviews({ page: 1, limit: 1 });
        results.reviews = { status: 'success', message: 'Подключение к таблице Reviews успешно' };
      } catch (error) {
        results.reviews = { status: 'error', message: `Ошибка подключения к Reviews: ${error.message}` };
      }

    } catch (error) {
      console.error('Connection test error:', error);
    } finally {
      setLoading(false);
      setTestResults(results);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2>Тест подключения к базе данных</h2>
          
          <div className="mb-3">
            <button 
              className="btn btn-primary" 
              onClick={testConnection}
              disabled={loading}
            >
              {loading ? 'Тестирование...' : 'Проверить подключение'}
            </button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="row">
              {Object.entries(testResults).map(([table, result]) => (
                <div key={table} className="col-md-6 mb-3">
                  <div className={`card ${result.status === 'success' ? 'border-success' : 'border-danger'}`}>
                    <div className="card-header">
                      <h5 className="mb-0">
                        Таблица: {table}
                        <span className={`badge ms-2 ${result.status === 'success' ? 'bg-success' : 'bg-danger'}`}>
                          {result.status === 'success' ? '✓' : '✗'}
                        </span>
                      </h5>
                    </div>
                    <div className="card-body">
                      <p className={`mb-0 ${result.status === 'success' ? 'text-success' : 'text-danger'}`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <h4>Инструкции по подключению к базе данных:</h4>
            <div className="alert alert-info">
              <h5>1. PostgreSQL:</h5>
              <pre><code>psql -h localhost -p 5432 -U postgres -d bookstore</code></pre>
              
              <h5>2. MySQL:</h5>
              <pre><code>mysql -u root -p bookstore</code></pre>
              
              <h5>3. SQLite:</h5>
              <pre><code>sqlite3 bookstore.db</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionTest;
