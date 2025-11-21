import { Middleware } from '@reduxjs/toolkit';
import ServiceManager from '../../services/ServiceManager';
import AuthService from '../../services/AuthService';

const authService = new AuthService();
const serviceManager = ServiceManager.getInstance();

// Получить ID пользователя из localStorage
const getUserId = (): number | null => {
  try {
    const user = authService.getCurrentUser();
    return user?.ID || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

// Конвертировать продукт из Redux store в формат для API
const convertProductToBasketItem = (product: any) => {
  const bookId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
  const quantity = product.quantity || 1;
  const hasDiscount = product.hasDiscount || false;
  const originalPrice = product.originalPrice || product.price;
  const discountedPrice = product.discountedPrice || product.price;

  return {
    ID_Book: bookId,
    Books_number: quantity,
    hasDiscount,
    originalPrice: typeof originalPrice === 'number' ? originalPrice : parseFloat(originalPrice) || 0,
    discountedPrice: typeof discountedPrice === 'number' ? discountedPrice : parseFloat(discountedPrice) || 0,
  };
};

// Middleware для синхронизации корзины с базой данных
export const basketSyncMiddleware: Middleware = (store) => (next) => async (action) => {
  const result = next(action);
  const userId = getUserId();

  // Если пользователь не авторизован, просто пропускаем синхронизацию
  if (!userId) {
    return result;
  }

  // Получаем текущее состояние корзины после действия
  const state = store.getState();
  const carts = state.products?.carts || [];

  try {
    // Обрабатываем разные типы действий
    if (action.type === 'products/addToCart') {
      const productId = typeof action.payload.id === 'string' 
        ? parseInt(action.payload.id) 
        : action.payload.id;
      
      const product = carts.find((item: any) => {
        const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
        return itemId === productId;
      });

      if (product && !isNaN(productId)) {
        const basketItem = convertProductToBasketItem(product);
        await serviceManager.basketService.addToBasket({
          ID_User: userId,
          ...basketItem,
        });
        console.log("✅ Basket item added to database");
      }
    } else if (action.type === 'products/removeCart') {
      const productId = typeof action.payload.id === 'string' 
        ? parseInt(action.payload.id) 
        : action.payload.id;
      
      if (!isNaN(productId)) {
        await serviceManager.basketService.removeFromBasket(userId, productId);
        console.log("✅ Basket item removed from database");
      }
    } else if (action.type === 'products/updateCart') {
      const productId = typeof action.payload.id === 'string' 
        ? parseInt(action.payload.id) 
        : action.payload.id;
      
      const product = carts.find((item: any) => {
        const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
        return itemId === productId;
      });

      if (product && !isNaN(productId)) {
        const basketItem = convertProductToBasketItem(product);
        await serviceManager.basketService.addToBasket({
          ID_User: userId,
          ...basketItem,
        });
        console.log("✅ Basket item updated in database");
      }
    } else if (action.type === 'products/clearCart') {
      await serviceManager.basketService.clearBasket(userId);
      console.log("✅ Basket cleared in database");
    }
  } catch (error) {
    console.error("❌ Error syncing basket with database:", error);
    // Продолжаем работу даже если синхронизация не удалась
  }

  return result;
};

