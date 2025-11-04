import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreUser } from '../app/slices/user';

const UserInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Проверяем localStorage при загрузке приложения
    const initializeUser = () => {
      try {
        const userData = localStorage.getItem('userData');
        const authToken = localStorage.getItem('authToken');
        
        if (userData && authToken) {
          const user = JSON.parse(userData);
          
          // Создаем упрощенный объект пользователя для Redux
          const simplifiedUser = {
            name: `${user.First_name} ${user.Last_name}`,
            role: 'customer',
            email: user.Email
          };
          
          // Восстанавливаем пользователя в Redux store
          dispatch(restoreUser(simplifiedUser));
          
          console.log('✅ Пользователь восстановлен из localStorage:', simplifiedUser);
        } else {
          console.log('ℹ️ Пользователь не найден в localStorage');
        }
      } catch (error) {
        console.error('❌ Ошибка при восстановлении пользователя:', error);
        // Очищаем поврежденные данные
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
      }
    };

    initializeUser();
  }, [dispatch]);

  return children;
};

export default UserInitializer;
