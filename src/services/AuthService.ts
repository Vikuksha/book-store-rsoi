import axios from "axios";
import { serverApi } from "../config";
import { User, LoginInput, UserInput } from "../lib/types/user";

export interface AuthResult {
  success: boolean;
  user?: User;
  message: string;
  redirectTo?: 'login' | 'register' | 'dashboard';
  basket?: any[]; // Корзина из таблицы Basket
  totalPayment?: number; // Общая сумма корзины
}

class AuthService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  // Проверяем существует ли пользователь с таким email
  public async checkUserExists(email: string): Promise<boolean> {
    try {
      const url = `${this.path}/api/user/email/${email}`;
      const result = await axios.get(url);
      console.log("checkUserExists:", result);
      
      return result.data.user ? true : false;
    } catch (err: any) {
      console.log("Error, checkUserExists: ", err);
      // Если пользователь не найден (404), возвращаем false
      if (err.response?.status === 404) {
        return false;
      }
      return false;
    }
  }

  // Логин пользователя с проверкой существования
  public async login(input: LoginInput): Promise<AuthResult> {
    try {
      // Спец-случай: admin/admin -> маппим на реальную админ-почту
      const effectiveEmail = (input.Email === 'admin' && input.Password === 'admin')
        ? 'admin@bookstore.com'
        : input.Email;

      // Сначала проверяем существует ли пользователь
      const userExists = await this.checkUserExists(effectiveEmail);
      
      if (!userExists) {
        return {
          success: false,
          message: "Пользователь не найден. Пожалуйста, зарегистрируйтесь.",
          redirectTo: 'register'
        };
      }

      // Если пользователь существует, проверяем логин и пароль
      const url = `${this.path}/api/user/login`;
      const result = await axios.post(url, { Email: effectiveEmail, Password: input.Password });
      console.log("login:", result);

      const user: User = result.data.user;
      const token = result.data.token;
      const basket = result.data.basket || [];
      const totalPayment = result.data.totalPayment || 0;
      
      // Сохраняем пользователя и токен
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("authToken", token);

      return {
        success: true,
        user: user,
        message: "Успешный вход в систему",
        redirectTo: 'dashboard',
        basket: basket,
        totalPayment: totalPayment
      };

    } catch (err: any) {
      console.log("Error, login: ", err);
      
      // Если ошибка аутентификации, возможно неправильный пароль
      if (err.response?.status === 401) {
        return {
          success: false,
          message: "Неверный пароль. Попробуйте еще раз.",
          redirectTo: 'login'
        };
      }

      return {
        success: false,
        message: "Ошибка при входе в систему",
        redirectTo: 'login'
      };
    }
  }

  // Регистрация нового пользователя
  public async register(input: UserInput): Promise<AuthResult> {
    try {
      // Проверяем не существует ли уже пользователь с таким email
      const userExists = await this.checkUserExists(input.Email);
      
      if (userExists) {
        return {
          success: false,
          message: "Пользователь с таким email уже существует. Попробуйте войти в систему.",
          redirectTo: 'login'
        };
      }

      const url = `${this.path}/api/user/create`;
      const result = await axios.post(url, input);
      console.log("register:", result);

      const user: User = result.data.user;
      localStorage.setItem("userData", JSON.stringify(user));

      return {
        success: true,
        user: user,
        message: "Регистрация прошла успешно",
        redirectTo: 'dashboard'
      };

    } catch (err) {
      console.log("Error, register: ", err);
      return {
        success: false,
        message: "Ошибка при регистрации",
        redirectTo: 'register'
      };
    }
  }

  // Выход из системы
  public async logout(): Promise<void> {
    try {
      // Очищаем локальные данные
      localStorage.removeItem("userData");
      localStorage.removeItem("authToken");
      
      console.log("logout: User logged out successfully");
    } catch (err) {
      console.log("Error, logout: ", err);
      throw err;
    }
  }

  // Получить текущего пользователя из localStorage
  public getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (err) {
      console.log("Error, getCurrentUser: ", err);
      return null;
    }
  }

  // Проверить, является ли пользователь администратором
  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? (user.isAdmin === true || user.Email === 'admin@bookstore.com' || user.Email === 'admin') : false;
  }

  // Проверить авторизован ли пользователь
  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Получить email текущего пользователя
  public getCurrentUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user ? user.Email : null;
  }

  // Получить токен авторизации
  public getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  // Проверить валидность токена
  public async validateToken(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) return false;

      // Можно добавить проверку токена на сервере
      // Пока просто проверяем наличие токена
      return true;
    } catch (err) {
      console.log("Error validating token:", err);
      return false;
    }
  }

  // Получить заголовки для авторизованных запросов
  public getAuthHeaders(): { [key: string]: string } {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export default AuthService;
