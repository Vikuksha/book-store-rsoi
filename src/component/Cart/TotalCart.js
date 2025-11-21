import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import ServiceManager from "../../services/ServiceManager";
import AuthService from "../../services/AuthService";
import OrderStatusTracker from "../Order/OrderStatusTracker";

const TotalCart = (props) => {
  let carts = useSelector((state) => state.products.carts);
  const dispatch = useDispatch();
  const authService = new AuthService();
  const [discountInfo, setDiscountInfo] = useState({ 
    discount: 0, 
    discountPercent: 0, 
    finalTotal: 0 
  });
  const [orderId, setOrderId] = useState(null);
  const [showOrderTracker, setShowOrderTracker] = useState(false);

  // Алгоритм расчёта скидки
  const calculateDiscount = (subtotal, orderQuantity) => {
    let discountPercent = 0;
    
    // Скидка 5% при заказе от 50$
    if (subtotal >= 50) {
      discountPercent = 5;
    }
    
    // Скидка 10% при заказе от 100$
    if (subtotal >= 100) {
      discountPercent = 10;
    }
    
    // Скидка 15% при заказе от 200$
    if (subtotal >= 200) {
      discountPercent = 15;
    }
    
    // Дополнительная скидка 2% при заказе 5+ книг
    if (orderQuantity >= 5) {
      discountPercent += 2;
    }
    
    // Максимальная скидка 20%
    if (discountPercent > 20) {
      discountPercent = 20;
    }
    
    const discount = (subtotal * discountPercent) / 100;
    
    return {
      discount,
      discountPercent,
      finalTotal: subtotal - discount
    };
  };

  useEffect(() => {
    const subtotal = cartTotal();
    const orderQuantity = carts.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const discount = calculateDiscount(subtotal, orderQuantity);
    setDiscountInfo({
      discount: discount.discount || 0,
      discountPercent: discount.discountPercent || 0,
      finalTotal: discount.finalTotal || subtotal
    });
  }, [carts]);

  // Рассчитываем оригинальную сумму без скидок на товары
  const originalSubtotal = () => {
    return carts.reduce(function (total, item) {
      const originalPrice = item.originalPrice 
        ? item.originalPrice 
        : (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
      return total + (item.quantity || 1) * originalPrice;
    }, 0);
  };

  // Рассчитываем сумму со скидками на товары
  const cartTotal = () => {
    return carts.reduce(function (total, item) {
      // Используем цену со скидкой, если есть скидка, иначе обычную цену
      const price = item.hasDiscount && item.discountedPrice 
        ? item.discountedPrice 
        : (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
      return total + (item.quantity || 1) * price;
    }, 0);
  };

  // Рассчитываем общую сумму скидок на товары
  const productDiscountsTotal = () => {
    return carts.reduce(function (total, item) {
      if (item.hasDiscount && item.originalPrice && item.discountedPrice) {
        const originalTotal = (item.quantity || 1) * item.originalPrice;
        const discountedTotal = (item.quantity || 1) * item.discountedPrice;
        return total + (originalTotal - discountedTotal);
      }
      return total;
    }, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Проверка авторизации
    const user = authService.getCurrentUser();
    if (!user || !user.ID) {
      Swal.fire({
        icon: "warning",
        title: "Требуется авторизация",
        text: "Пожалуйста, войдите в систему для оформления заказа.",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.href = "/login";
      });
      return;
    }
    
    // Проверка наличия на складе перед оформлением заказа
    try {
      const serviceManager = ServiceManager.getInstance();
      const compositions = carts.map(item => ({
        ID_Book: typeof item.id === 'string' ? parseInt(item.id) : item.id,
        Books_number: item.quantity || 1
      }));
      
      // Проверяем наличие на складе
      const stockCheckResponse = await fetch(`${process.env.REACT_APP_SERVER_API || 'http://localhost:3003'}/api/order/check-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ compositions })
      });
      
      const stockCheck = await stockCheckResponse.json();
      
      if (!stockCheck.allAvailable) {
        const unavailableBooks = stockCheck.stockCheck
          .filter(item => !item.sufficient)
          .map(item => `"${item.bookTitle}" (запрошено: ${item.requested}, доступно: ${item.available})`)
          .join('\n');
        
        Swal.fire({
          icon: "error",
          title: "Недостаточно товара на складе",
          text: `Следующие книги недоступны в нужном количестве:\n${unavailableBooks}`,
          confirmButtonText: "OK",
        });
        return;
      }
      
      // Создаем заказ
      const orderQuantity = carts.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const subtotal = cartTotal();
      const orderQuantityForDiscount = orderQuantity;
      const discount = calculateDiscount(subtotal, orderQuantityForDiscount);
      const totalAmount = discountInfo?.finalTotal ?? discount.finalTotal ?? subtotal;
      
      const orderData = {
        order: {
          Total_order_quantity: orderQuantity,
          Currency: totalAmount, // Общая сумма корзины с учетом всех скидок
          Order_status: 'COLLECTING', // Начинаем с состояния "собирается"
          ID_User: user.ID
        },
        compositions: compositions
      };

      const createOrderResponse = await fetch(
        `${process.env.REACT_APP_SERVER_API || 'http://localhost:3003'}/api/order/create-complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(orderData)
        }
      );

      if (!createOrderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await createOrderResponse.json();
      const createdOrderId = orderResult.order.ID;

      console.log("✅ Order created with ID:", createdOrderId);

      // Показываем трекер состояний заказа
      setOrderId(createdOrderId);
      setShowOrderTracker(true);

      Swal.fire({
        icon: "success",
        title: "Заказ создан!",
        text: "Ваш заказ начал обрабатываться.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      Swal.fire({
        icon: "error",
        title: "Ошибка",
        text: "Не удалось оформить заказ. Попробуйте позже.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleOrderComplete = () => {
    setShowOrderTracker(false);
    setOrderId(null);
  };

  return (
    <div
      className={props.fullGrid ? "col-lg-12 col-md-12" : "col-lg-6 col-md-6"}
    >
      <div className="coupon_code right">
        <h3>Cart Total</h3>
        <div className="coupon_inner">
          {/* Оригинальная сумма без скидок на товары */}
          <div className="cart_subtotal">
            <p>Original Subtotal</p>
            <p className="cart_amount">${(originalSubtotal() || 0).toFixed(2)}</p>
          </div>
          
          {/* Скидки на отдельные товары (25% на каждую 3-ю книгу) */}
          {productDiscountsTotal() > 0 && (
            <div className="cart_subtotal">
              <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>Product Discounts (25% off)</p>
              <p className="cart_amount" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                -${(productDiscountsTotal() || 0).toFixed(2)}
              </p>
            </div>
          )}
          
          {/* Сумма после скидок на товары */}
          <div className="cart_subtotal">
            <p>Subtotal</p>
            <p className="cart_amount">${(cartTotal() || 0).toFixed(2)}</p>
          </div>
          
          {/* Общая скидка на заказ (если применима) */}
          {discountInfo && discountInfo.discountPercent > 0 && (
            <div className="cart_subtotal">
              <p>Order Discount ({discountInfo.discountPercent || 0}%)</p>
              <p className="cart_amount" style={{ color: '#28a745' }}>
                -${(discountInfo.discount || 0).toFixed(2)}
              </p>
            </div>
          )}

          <div className="cart_subtotal">
            <p>Total</p>
            <p className="cart_amount">
              <strong>${((discountInfo?.finalTotal ?? cartTotal()) || 0).toFixed(2)}</strong>
            </p>
          </div>
          <div className="checkout_btn">
            {!showOrderTracker ? (
              <Link
                to="#!"
                className="theme-btn-one btn-black-overlay btn_sm"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Link>
            ) : (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <p style={{ color: "#28a745", fontWeight: "bold" }}>
                  Заказ обрабатывается...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Отображение трекера состояний заказа */}
      {showOrderTracker && orderId && (
        <OrderStatusTracker 
          orderId={orderId} 
          onComplete={handleOrderComplete}
        />
      )}
    </div>
  );
};

export default TotalCart;
