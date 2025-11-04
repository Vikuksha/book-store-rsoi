// Пример использования новой системы аутентификации
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute, AuthOnly, GuestOnly } from '../components/AuthComponents';

// Пример компонента с проверкой существования пользователя
const LoginWithUserCheck: React.FC = () => {
  const { login, checkUserExists } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      // Сначала проверяем существует ли пользователь
      const userExists = await checkUserExists(email);
      
      if (!userExists) {
        alert('Пользователь не найден. Пожалуйста, зарегистрируйтесь.');
        // Перенаправляем на страницу регистрации
        window.location.href = '/register';
        return;
      }

      // Если пользователь существует, пытаемся войти
      const result = await login(email, password);
      
      if (result.success) {
        alert('Успешный вход!');
        window.location.href = '/dashboard';
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Произошла ошибка при входе');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Пароль:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isChecking}>
        {isChecking ? 'Проверка...' : 'Войти'}
      </button>
    </form>
  );
};

// Пример защищенной страницы
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
      <h1>Добро пожаловать, {user?.First_name}!</h1>
      <p>Email: {user?.Email}</p>
      <p>Телефон: {user?.Phone}</p>
      <p>Адрес: {user?.Address}</p>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
};

// Пример главного компонента с маршрутизацией
const AppWithAuth: React.FC = () => {
  return (
    <div>
      {/* Показываем только неавторизованным пользователям */}
      <GuestOnly>
        <LoginWithUserCheck />
      </GuestOnly>

      {/* Показываем только авторизованным пользователям */}
      <AuthOnly>
        <Dashboard />
      </AuthOnly>

      {/* Защищенный маршрут */}
      <ProtectedRoute redirectTo="/login">
        <div>
          <h2>Это защищенная страница</h2>
          <p>Только авторизованные пользователи могут видеть этот контент</p>
        </div>
      </ProtectedRoute>
    </div>
  );
};

export default AppWithAuth;
