import { serverApi } from '../config';

export interface BasketItem {
  ID?: number;
  ID_User: number;
  ID_Book: number;
  Books_number: number;
  Payment: number;
  Discount_payment: number;
  created_at?: string;
  updated_at?: string;
  // Дополнительные поля из JOIN с Book
  Title?: string;
  Author?: string;
  Book_Price?: number;
  Description?: string;
  Stock_quantity?: number;
  // Вычисляемые поля
  hasDiscount?: boolean;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;
}

export interface BasketAddInput {
  ID_User: number;
  ID_Book: number;
  Books_number: number;
  hasDiscount?: boolean;
  originalPrice?: number;
  discountedPrice?: number;
}

class BasketService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${serverApi}/api`;
  }

  // Добавить или обновить товар в корзине
  public async addToBasket(input: BasketAddInput): Promise<BasketItem> {
    try {
      const response = await fetch(`${this.baseUrl}/basket/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.basket;
    } catch (error) {
      console.error('Error adding to basket:', error);
      throw error;
    }
  }

  // Удалить товар из корзины
  public async removeFromBasket(userId: number, bookId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/basket/remove/${userId}/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
    } catch (error) {
      console.error('Error removing from basket:', error);
      throw error;
    }
  }

  // Очистить всю корзину пользователя
  public async clearBasket(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/basket/clear/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
    } catch (error) {
      console.error('Error clearing basket:', error);
      throw error;
    }
  }

  // Получить корзину пользователя
  public async getUserBasket(userId: number): Promise<BasketItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/basket/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.basket || [];
    } catch (error) {
      console.error('Error fetching user basket:', error);
      throw error;
    }
  }
}

export default BasketService;

