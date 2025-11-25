import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ServiceManager from '../../services/ServiceManager';
import AuthService from '../../services/AuthService';
import Swal from 'sweetalert2';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);
  const authService = new AuthService();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      
      console.log('🔍 Current user from localStorage:', currentUser);
      
      if (!currentUser || !currentUser.ID) {
        console.error('❌ User not found or ID missing:', currentUser);
        Swal.fire({
          icon: 'error',
          title: 'Ошибка',
          text: 'Пользователь не авторизован'
        });
        setLoading(false);
        return;
      }

      console.log(`📦 Loading orders for user ID: ${currentUser.ID}`);
      const serviceManager = ServiceManager.getInstance();
      const userOrders = await serviceManager.orderService.getOrdersByUser(currentUser.ID);
      
      console.log(`✅ Loaded ${userOrders?.length || 0} orders for user ${currentUser.ID}:`, userOrders);
      setOrders(userOrders || []);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Ошибка',
        text: error.response?.data?.error || error.message || 'Не удалось загрузить заказы'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'badge-warning', text: 'Ожидает' },
      'COLLECTING': { class: 'badge-info', text: 'Собирается' },
      'DELIVERING': { class: 'badge-primary', text: 'Доставляется' },
      'DELIVERED': { class: 'badge-success', text: 'Получен' },
      'CANCELLED': { class: 'badge-danger', text: 'Отменен' },
      'CONFIRMED': { class: 'badge-info', text: 'Подтвержден' },
      'SHIPPED': { class: 'badge-info', text: 'Отправлен' }
    };

    const statusInfo = statusMap[status] || { class: 'badge-secondary', text: status };
    return (
      <span className={`badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 col-12">
          <div className="vendor_order_boxed">
            <h4>All Orders</h4>
            <div className="text-center" style={{ padding: '50px' }}>
              <p>Загрузка заказов...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 col-12">
          <div className="vendor_order_boxed">
            <h4>All Orders</h4>
            {orders.length === 0 ? (
              <div className="text-center" style={{ padding: '50px' }}>
                <p>У вас пока нет заказов</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table pending_table">
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">Order Date</th>
                        <th scope="col">Currency</th>
                        <th scope="col">Order Status</th>
                        <th scope="col">Tracking Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.ID}>
                          <td>{formatDate(order.Order_date)}</td>
                          <td>
                            <strong>${parseFloat(order.Currency || 0).toFixed(2)}</strong>
                          </td>
                          <td>{getStatusBadge(order.Order_status)}</td>
                          <td>
                            {order.Tracking_number ? (
                              <strong>{order.Tracking_number}</strong>
                            ) : (
                              <span style={{ color: '#999' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;
