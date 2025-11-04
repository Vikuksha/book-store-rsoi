import React, { useState, useEffect } from 'react';

const CurrentUsersViewer = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Функция для получения пользователей из localStorage
  const getUsersFromStorage = () => {
    const users = [];
    
    // Проверяем разные ключи localStorage
    const keys = ['userData', 'memberData', 'cartData'];
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          users.push({
            source: key,
            data: parsedData,
            timestamp: new Date().toLocaleString()
          });
        } catch (error) {
          console.error(`Error parsing ${key}:`, error);
        }
      }
    });
    
    return users;
  };

  // Функция для получения пользователей из Redux store (если доступен)
  const getUsersFromRedux = () => {
    // Это будет работать только если Redux DevTools доступны
    try {
      const reduxState = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
        window.__REDUX_DEVTOOLS_EXTENSION__.getState() : null;
      
      if (reduxState && reduxState.user) {
        return [{
          source: 'Redux Store',
          data: reduxState.user,
          timestamp: new Date().toLocaleString()
        }];
      }
    } catch (error) {
      console.error('Error getting Redux state:', error);
    }
    
    return [];
  };

  const loadUsers = () => {
    setLoading(true);
    
    const localStorageUsers = getUsersFromStorage();
    const reduxUsers = getUsersFromRedux();
    
    const allUsers = [...localStorageUsers, ...reduxUsers];
    setUsers(allUsers);
    
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const clearUserData = (source) => {
    if (source === 'Redux Store') {
      // Для Redux нужно использовать dispatch
      console.log('Redux data cannot be cleared from this component');
      return;
    }
    
    localStorage.removeItem(source);
    loadUsers(); // Перезагружаем данные
  };

  const clearAllUserData = () => {
    const keys = ['userData', 'memberData', 'cartData'];
    keys.forEach(key => localStorage.removeItem(key));
    loadUsers();
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2>Текущие пользователи в проекте</h2>
          
          <div className="mb-3">
            <button 
              className="btn btn-primary me-2" 
              onClick={loadUsers}
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Обновить данные'}
            </button>
            <button 
              className="btn btn-warning me-2" 
              onClick={clearAllUserData}
            >
              Очистить все данные
            </button>
          </div>

          {users.length === 0 ? (
            <div className="alert alert-info">
              <h4>Нет данных пользователей</h4>
              <p>В проекте пока нет сохраненных данных пользователей.</p>
              <p>Данные могут быть в:</p>
              <ul>
                <li><strong>localStorage</strong> - после входа/регистрации</li>
                <li><strong>Redux Store</strong> - текущее состояние приложения</li>
                <li><strong>База данных</strong> - если бэкенд подключен</li>
              </ul>
            </div>
          ) : (
            <div className="row">
              {users.map((userGroup, index) => (
                <div key={index} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        Источник: {userGroup.source}
                        <span className="badge bg-secondary ms-2">
                          {userGroup.timestamp}
                        </span>
                      </h5>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => clearUserData(userGroup.source)}
                      >
                        Очистить
                      </button>
                    </div>
                    <div className="card-body">
                      <pre className="bg-light p-3 rounded">
                        <code>{JSON.stringify(userGroup.data, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <h4>Информация о пользователях в проекте:</h4>
            <div className="alert alert-info">
              <h5>1. Redux Store (src/app/slices/user.js):</h5>
              <pre><code>{`{
  status: false,
  user: {
    name: 'Jhon Doe',
    role: 'customer', 
    email: 'jhondoe@gmail.com',
    pass: 'jhondoe123'
  }
}`}</code></pre>
              
              <h5>2. localStorage ключи:</h5>
              <ul>
                <li><strong>userData</strong> - данные пользователя из AuthService</li>
                <li><strong>memberData</strong> - данные пользователя из MemberService</li>
                <li><strong>cartData</strong> - данные корзины</li>
              </ul>
              
              <h5>3. Типы пользователей:</h5>
              <ul>
                <li><strong>User</strong> - новая схема (ID, Email, First_name, Last_name, Phone, Address)</li>
                <li><strong>Member</strong> - старая схема (memberNick, memberPhone, memberAddress)</li>
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <h4>Как добавить тестовых пользователей:</h4>
            <div className="alert alert-warning">
              <h5>1. Через localStorage:</h5>
              <pre><code>{`// В консоли браузера
localStorage.setItem('userData', JSON.stringify({
  ID: 1,
  Email: 'test@example.com',
  First_name: 'Иван',
  Last_name: 'Иванов',
  Phone: '+1234567890',
  Address: 'Москва, ул. Тестовая, 1'
}));`}</code></pre>
              
              <h5>2. Через Redux:</h5>
              <pre><code>{`// В консоли браузера (если Redux DevTools доступны)
// Используйте Redux DevTools для изменения состояния`}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentUsersViewer;
