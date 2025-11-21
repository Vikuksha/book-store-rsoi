import { useState, useEffect } from "react";
import { CartItem } from "../lib/types/search";
import ServiceManager from "../services/ServiceManager";
import AuthService from "../services/AuthService";
import { getBookImage } from "../utils/bookImageLoader";

const useBasket = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Конвертировать BasketItem в CartItem
  const convertBasketItemToCartItem = (basketItem: any): CartItem => {
    const bookImage = getBookImage(basketItem.ID_Book);
    const price = basketItem.hasDiscount && basketItem.discountedPrice 
      ? basketItem.discountedPrice 
      : parseFloat(basketItem.Book_Price) || 0;

    return {
      _id: basketItem.ID_Book.toString(),
      quantity: basketItem.Books_number || 1,
      name: basketItem.Title || '',
      price: price,
      image: bookImage,
      hasDiscount: basketItem.hasDiscount || false,
      originalPrice: basketItem.originalPrice || parseFloat(basketItem.Book_Price) || 0,
      discountedPrice: basketItem.discountedPrice || price,
      discountPercent: basketItem.discountPercent || 0
    };
  };

  // Загрузить корзину из базы данных
  const loadBasketFromDB = async () => {
    const userId = getUserId();
    if (!userId) {
      // Если пользователь не авторизован, используем localStorage
      const cartJson: string | null = localStorage.getItem("cartData");
      const currentCart = cartJson ? JSON.parse(cartJson) : [];
      setCartItems(currentCart);
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔄 Loading basket from database for user:", userId);
      const basketItems = await serviceManager.basketService.getUserBasket(userId);
      
      if (basketItems && basketItems.length > 0) {
        // Конвертируем BasketItem в CartItem
        const cartItems = basketItems.map(convertBasketItemToCartItem);
        setCartItems(cartItems);
        
        // Синхронизируем с localStorage для обратной совместимости
        localStorage.setItem("cartData", JSON.stringify(cartItems));
        
        console.log("✅ Basket loaded from database:", cartItems.length, "items");
      } else {
        // Если корзина пуста в БД, очищаем localStorage
        setCartItems([]);
        localStorage.removeItem("cartData");
        console.log("ℹ️ Basket is empty in database");
      }
    } catch (error) {
      console.error("❌ Error loading basket from database:", error);
      // В случае ошибки используем localStorage как fallback
      const cartJson: string | null = localStorage.getItem("cartData");
      const currentCart = cartJson ? JSON.parse(cartJson) : [];
      setCartItems(currentCart);
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем корзину при инициализации
  useEffect(() => {
    loadBasketFromDB();
  }, []);

  /** HANDLERS **/
  // DEFINE
  const onAdd = async (input: CartItem) => {
    const exist: any = cartItems.find(
      (item: CartItem) => item._id === input._id
    );

    let cartUpdate: CartItem[];
    if (exist) {
      // Обновляем количество существующего товара
      cartUpdate = cartItems.map(
        (item: CartItem) =>
          item._id === input._id
            ? { ...exist, quantity: exist.quantity + 1 }
            : item
      );
    } else {
      // Добавляем новый товар
      cartUpdate = [...cartItems, { ...input }];
    }

    setCartItems(cartUpdate);
    localStorage.setItem("cartData", JSON.stringify(cartUpdate));

    // Обновляем базу данных Basket, если пользователь авторизован
    const userId = getUserId();
    if (userId) {
      try {
        const bookId = parseInt(input._id);
        if (!isNaN(bookId)) {
          const updatedItem = cartUpdate.find(item => item._id === input._id);
          await serviceManager.basketService.addToBasket({
            ID_User: userId,
            ID_Book: bookId,
            Books_number: updatedItem?.quantity || 1,
            hasDiscount: updatedItem?.hasDiscount || false,
            originalPrice: updatedItem?.originalPrice || updatedItem?.price,
            discountedPrice: updatedItem?.discountedPrice || updatedItem?.price,
          });
          console.log("✅ Basket updated in database");
          // Перезагружаем корзину из БД для синхронизации
          await loadBasketFromDB();
        }
      } catch (error) {
        console.error("❌ Error updating basket in database:", error);
        // Продолжаем работу даже если обновление БД не удалось
      }
    }
  };

  const onRemove = async (input: CartItem) => {
    const exist: any = cartItems.find(
      (item: CartItem) => item._id === input._id
    );

    let cartUpdate: CartItem[];
    if (exist.quantity === 1) {
      // Удаляем товар полностью
      cartUpdate = cartItems.filter(
        (item: CartItem) => item._id !== input._id
      );
    } else {
      // Уменьшаем количество
      cartUpdate = cartItems.map((item: CartItem) =>
        item._id === input._id
          ? { ...exist, quantity: exist.quantity - 1 }
          : item
      );
    }

    setCartItems(cartUpdate);
    localStorage.setItem("cartData", JSON.stringify(cartUpdate));

    // Обновляем базу данных Basket, если пользователь авторизован
    const userId = getUserId();
    if (userId) {
      try {
        const bookId = parseInt(input._id);
        if (!isNaN(bookId)) {
          if (exist.quantity === 1) {
            // Удаляем товар из базы данных
            await serviceManager.basketService.removeFromBasket(userId, bookId);
            console.log("✅ Basket item removed from database");
          } else {
            // Обновляем количество в базе данных
            const updatedItem = cartUpdate.find(item => item._id === input._id);
            await serviceManager.basketService.addToBasket({
              ID_User: userId,
              ID_Book: bookId,
              Books_number: updatedItem?.quantity || 1,
              hasDiscount: updatedItem?.hasDiscount || false,
              originalPrice: updatedItem?.originalPrice || updatedItem?.price,
              discountedPrice: updatedItem?.discountedPrice || updatedItem?.price,
            });
            console.log("✅ Basket updated in database");
          }
          // Перезагружаем корзину из БД для синхронизации
          await loadBasketFromDB();
        }
      } catch (error) {
        console.error("❌ Error updating basket in database:", error);
        // Продолжаем работу даже если обновление БД не удалось
      }
    }
  };

  const onDelete = async (input: CartItem) => {
    const cartUpdate = cartItems.filter(
      (item: CartItem) => item._id !== input._id
    );
    setCartItems(cartUpdate);
    localStorage.setItem("cartData", JSON.stringify(cartUpdate));

    // Удаляем товар из базы данных Basket, если пользователь авторизован
    const userId = getUserId();
    if (userId) {
      try {
        const bookId = parseInt(input._id);
        if (!isNaN(bookId)) {
          await serviceManager.basketService.removeFromBasket(userId, bookId);
          console.log("✅ Basket item deleted from database");
          // Перезагружаем корзину из БД для синхронизации
          await loadBasketFromDB();
        }
      } catch (error) {
        console.error("❌ Error deleting basket item from database:", error);
        // Продолжаем работу даже если удаление из БД не удалось
      }
    }
  };

  const onDeleteAll = async () => {
    setCartItems([]);
    localStorage.removeItem("cartData");

    // Очищаем корзину в базе данных, если пользователь авторизован
    const userId = getUserId();
    if (userId) {
      try {
        await serviceManager.basketService.clearBasket(userId);
        console.log("✅ Basket cleared in database");
        // Перезагружаем корзину из БД для синхронизации
        await loadBasketFromDB();
      } catch (error) {
        console.error("❌ Error clearing basket in database:", error);
        // Продолжаем работу даже если очистка БД не удалась
      }
    }
  };

  return {
    cartItems,
    isLoading,
    onAdd,
    onRemove,
    onDelete,
    onDeleteAll,
    reloadBasket: loadBasketFromDB, // Функция для ручной перезагрузки корзины
  };
};

export default useBasket;
