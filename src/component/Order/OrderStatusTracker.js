import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import AuthService from "../../services/AuthService";

const OrderStatusTracker = ({ orderId, onComplete }) => {
  const [currentStatus, setCurrentStatus] = useState("COLLECTING");
  const [timeRemaining, setTimeRemaining] = useState(10);
  const dispatch = useDispatch();
  const authService = new AuthService();

  const statusLabels = {
    COLLECTING: "Собирается",
    DELIVERING: "Доставляется",
    DELIVERED: "Получен"
  };

  const statusColors = {
    COLLECTING: "#f39c12", // Оранжевый
    DELIVERING: "#3498db", // Синий
    DELIVERED: "#27ae60"   // Зеленый
  };

  // Обновление статуса заказа на сервере
  const updateOrderStatus = async (status) => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.ID) {
        console.error("User not authenticated");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_API || 'http://localhost:3003'}/api/order/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      console.log(`✅ Order status updated to ${status}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error updating order status to ${status}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    if (!orderId) return;

    let interval;
    let timeout;

    // Обновляем статус на сервере при изменении
    const updateStatusOnServer = async (status) => {
      try {
        await updateOrderStatus(status);
      } catch (error) {
        console.error(`Error updating status to ${status}:`, error);
      }
    };

    if (currentStatus === "COLLECTING") {
      // Обновляем статус на сервере
      updateStatusOnServer("COLLECTING");
      
      // Таймер обратного отсчета
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Переходим к следующему статусу
            updateStatusOnServer("DELIVERING").then(() => {
              setCurrentStatus("DELIVERING");
              setTimeRemaining(10);
            });
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (currentStatus === "DELIVERING") {
      // Обновляем статус на сервере
      updateStatusOnServer("DELIVERING");
      
      // Таймер обратного отсчета
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Переходим к финальному статусу
            updateStatusOnServer("DELIVERED").then(async () => {
              setCurrentStatus("DELIVERED");
              
              // Очищаем корзину после завершения
              dispatch({ type: "products/clearCart" });
              
              // Очищаем корзину в базе данных
              const user = authService.getCurrentUser();
              if (user && user.ID) {
                try {
                  const serviceManager = (await import("../../services/ServiceManager")).default.getInstance();
                  await serviceManager.basketService.clearBasket(user.ID);
                  console.log("✅ Basket cleared after order completion");
                } catch (error) {
                  console.error("❌ Error clearing basket:", error);
                }
              }
              
              // Вызываем callback при завершении
              if (onComplete) {
                onComplete();
              }
              
              // Показываем уведомление о завершении
              Swal.fire({
                icon: "success",
                title: "Заказ получен!",
                text: "Ваш заказ успешно доставлен и получен.",
                confirmButtonText: "OK",
              }).then(() => {
                window.location.href = "/";
              });
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [currentStatus, orderId, dispatch, onComplete]);

  return (
    <div style={{
      padding: "20px",
      margin: "20px 0",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      border: `2px solid ${statusColors[currentStatus]}`,
      textAlign: "center"
    }}>
      <h3 style={{ color: statusColors[currentStatus], marginBottom: "10px" }}>
        Статус заказа: {statusLabels[currentStatus]}
      </h3>
      <div style={{ fontSize: "18px", marginTop: "10px" }}>
        <p>Осталось времени: <strong>{timeRemaining}</strong> секунд</p>
        <div style={{ marginTop: "15px" }}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "15px"
          }}>
            <div style={{
              padding: "10px 20px",
              backgroundColor: currentStatus === "COLLECTING" ? statusColors.COLLECTING : "#e0e0e0",
              color: currentStatus === "COLLECTING" ? "white" : "#666",
              borderRadius: "5px",
              fontWeight: currentStatus === "COLLECTING" ? "bold" : "normal"
            }}>
              1. Собирается
            </div>
            <div style={{
              padding: "10px 20px",
              backgroundColor: currentStatus === "DELIVERING" ? statusColors.DELIVERING : "#e0e0e0",
              color: currentStatus === "DELIVERING" ? "white" : "#666",
              borderRadius: "5px",
              fontWeight: currentStatus === "DELIVERING" ? "bold" : "normal"
            }}>
              2. Доставляется
            </div>
            <div style={{
              padding: "10px 20px",
              backgroundColor: currentStatus === "DELIVERED" ? statusColors.DELIVERED : "#e0e0e0",
              color: currentStatus === "DELIVERED" ? "white" : "#666",
              borderRadius: "5px",
              fontWeight: currentStatus === "DELIVERED" ? "bold" : "normal"
            }}>
              3. Получен
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTracker;

