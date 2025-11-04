import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import AuthService from '../services/AuthService';
import { User } from '../lib/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; redirectTo?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  checkUserExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = new AuthService();

  useEffect(() => {
    // Проверяем есть ли сохраненный пользователь при загрузке
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ Email: email, Password: password });
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return {
        success: result.success,
        message: result.message,
        redirectTo: result.redirectTo
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Произошла ошибка при входе в систему'
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const result = await authService.register(userData);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return {
        success: result.success,
        message: result.message,
        redirectTo: result.redirectTo
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Произошла ошибка при регистрации'
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если ошибка, очищаем локальное состояние
      setUser(null);
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      return await authService.checkUserExists(email);
    } catch (error) {
      console.error('Check user exists error:', error);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkUserExists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для проверки авторизации
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated
  };
};

// Хук для защищенных маршрутов
export const useProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    user,
    canAccess: !isLoading && isAuthenticated
  };
};
