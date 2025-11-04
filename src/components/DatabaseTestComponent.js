import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DatabaseTestComponent = () => {
  const [serverStatus, setServerStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3003";

  // Проверка статуса сервера
  const checkServerStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/health`);
      setServerStatus(response.data);
      setError(null);
    } catch (err) {
      setServerStatus({ status: 'ERROR', error: err.message });
      setError('Сервер недоступен');
    }
  };

  // Проверка статуса базы данных
  const checkDatabaseStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/database/status`);
      setDbStatus(response.data);
      setError(null);
    } catch (err) {
      setDbStatus({ status: 'ERROR', error: err.message });
      setError('База данных недоступна');
    }
  };

  // Получение списка пользователей
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/user/all`);
      setUsers(response.data.users || []);
      setError(null);
    } catch (err) {
      setUsers([]);
      setError('Ошибка получения пользователей: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Тест создания пользователя
  const testCreateUser = async () => {
    const testUser = {
      Email: `test${Date.now()}@example.com`,
      Password: 'test123',
      First_name: 'Тест',
      Last_name: 'Тестов',
      Phone: '+7-999-123-45-67',
      Address: 'Москва, ул. Тестовая, 1'
    };

    try {
      const response = await axios.post(`${API_BASE}/api/user/create`, testUser);
      alert('Пользователь создан: ' + JSON.stringify(response.data.user, null, 2));
      fetchUsers(); // Обновляем список
    } catch (err) {
      alert('Ошибка создания пользователя: ' + err.response?.data?.error || err.message);
    }
  };

  // Тест входа в систему
  const testLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/user/login`, {
        Email: 'admin@bookstore.com',
        Password: 'admin123'
      });
      
      alert('Вход успешен!\nТокен: ' + response.data.token.substring(0, 50) + '...');
      
      // Сохраняем токен для дальнейших запросов
      localStorage.setItem('authToken', response.data.token);
      
    } catch (err) {
      alert('Ошибка входа: ' + err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    checkServerStatus();
    checkDatabaseStatus();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2>🧪 Тестирование базы данных PostgreSQL</h2>
          
          {/* Статус сервера */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Статус сервера</h5>
                </div>
                <div className="card-body">
                  {serverStatus ? (
                    <div>
                      <p><strong>Статус:</strong> 
                        <span className={`badge ms-2 ${serverStatus.status === 'OK' ? 'bg-success' : 'bg-danger'}`}>
                          {serverStatus.status}
                        </span>
                      </p>
                      <p><strong>Время:</strong> {serverStatus.timestamp}</p>
                      <p><strong>База данных:</strong> {serverStatus.database}</p>
                    </div>
                  ) : (
                    <p>Проверка...</p>
                  )}
                  <button className="btn btn-sm btn-outline-primary" onClick={checkServerStatus}>
                    Обновить
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Статус базы данных</h5>
                </div>
                <div className="card-body">
                  {dbStatus ? (
                    <div>
                      <p><strong>Статус:</strong> 
                        <span className={`badge ms-2 ${dbStatus.status === 'Connected' ? 'bg-success' : 'bg-danger'}`}>
                          {dbStatus.status}
                        </span>
                      </p>
                      <p><strong>Время БД:</strong> {dbStatus.database?.current_time}</p>
                      <p><strong>Пользователей:</strong> {dbStatus.database?.user_count}</p>
                      <p><strong>Версия:</strong> {dbStatus.database?.version?.split(' ')[0]}</p>
                    </div>
                  ) : (
                    <p>Проверка...</p>
                  )}
                  <button className="btn btn-sm btn-outline-primary" onClick={checkDatabaseStatus}>
                    Обновить
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Тестовые операции */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Тестовые операции</h5>
            </div>
            <div className="card-body">
              <div className="btn-group me-2" role="group">
                <button className="btn btn-success" onClick={testCreateUser}>
                  Создать тестового пользователя
                </button>
                <button className="btn btn-primary" onClick={testLogin}>
                  Тест входа (admin@bookstore.com)
                </button>
                <button className="btn btn-info" onClick={fetchUsers}>
                  Получить всех пользователей
                </button>
              </div>
            </div>
          </div>

          {/* Список пользователей */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Пользователи в базе данных</h5>
              <span className="badge bg-secondary">{users.length} пользователей</span>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <strong>Ошибка:</strong> {error}
                </div>
              ) : users.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Телефон</th>
                        <th>Адрес</th>
                        <th>Создан</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.ID}>
                          <td>{user.ID}</td>
                          <td>{user.Email}</td>
                          <td>{user.First_name}</td>
                          <td>{user.Last_name}</td>
                          <td>{user.Phone}</td>
                          <td>{user.Address}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  <strong>Информация:</strong> Пользователи не найдены. Создайте тестового пользователя.
                </div>
              )}
            </div>
          </div>

          {/* Инструкции */}
          <div className="mt-4">
            <div className="alert alert-info">
              <h5>📋 Инструкции по запуску:</h5>
              <ol>
                <li><strong>Установите PostgreSQL:</strong> <code>brew install postgresql</code></li>
                <li><strong>Создайте базу данных:</strong> <code>createdb bookstore</code></li>
                <li><strong>Запустите скрипт схемы:</strong> <code>psql bookstore &lt; database/schema.sql</code></li>
                <li><strong>Установите зависимости бэкенда:</strong> <code>cd server && npm install</code></li>
                <li><strong>Запустите сервер:</strong> <code>npm start</code></li>
              </ol>
              <p><strong>Тестовые пользователи:</strong></p>
              <ul>
                <li>admin@bookstore.com / admin123</li>
                <li>user1@bookstore.com / user123</li>
                <li>user2@bookstore.com / user123</li>
                <li>customer@bookstore.com / customer123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTestComponent;
