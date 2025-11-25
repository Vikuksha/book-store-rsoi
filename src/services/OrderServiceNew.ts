import axios from "axios";
import { serverApi } from "../config";
import { 
  Order, 
  OrderInput, 
  OrderUpdateInput, 
  OrderInquiry, 
  OrderComposition, 
  OrderCompositionInput, 
  OrderCompositionUpdateInput,
  OrderWithComposition 
} from "../lib/types/order-new";

class OrderServiceNew {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  // Order operations
  public async getOrders(input: OrderInquiry): Promise<Order[]> {
    try {
      let url = `${this.path}/order/all?page=${input.page}&limit=${input.limit}`;
      
      if (input.ID_User) url += `&user_id=${input.ID_User}`;
      if (input.Order_status) url += `&order_status=${input.Order_status}`;
      if (input.start_date) url += `&start_date=${input.start_date.toISOString()}`;
      if (input.end_date) url += `&end_date=${input.end_date.toISOString()}`;

      const result = await axios.get(url);
      console.log("getOrders:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getOrders: ", err);
      throw err;
    }
  }

  public async getOrder(orderId: number): Promise<Order> {
    try {
      const url = `${this.path}/order/${orderId}`;
      const result = await axios.get(url);
      console.log("getOrder:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getOrder: ", err);
      throw err;
    }
  }

  public async createOrder(input: OrderInput): Promise<Order> {
    try {
      const url = `${this.path}/order/create`;
      const result = await axios.post(url, input);
      console.log("createOrder:", result);

      return result.data;
    } catch (err) {
      console.log("Error, createOrder: ", err);
      throw err;
    }
  }

  public async updateOrder(input: OrderUpdateInput): Promise<Order> {
    try {
      const url = `${this.path}/order/update`;
      const result = await axios.put(url, input);
      console.log("updateOrder:", result);

      return result.data;
    } catch (err) {
      console.log("Error, updateOrder: ", err);
      throw err;
    }
  }

  public async deleteOrder(orderId: number): Promise<void> {
    try {
      const url = `${this.path}/order/${orderId}`;
      const result = await axios.delete(url);
      console.log("deleteOrder:", result);
    } catch (err) {
      console.log("Error, deleteOrder: ", err);
      throw err;
    }
  }

  public async getOrdersByUser(userId: number): Promise<Order[]> {
    try {
      const token = localStorage.getItem('authToken');
      const url = `${this.path}/api/order/user/${userId}`;
      const result = await axios.get(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      console.log("getOrdersByUser:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getOrdersByUser: ", err);
      throw err;
    }
  }

  public async getOrderWithComposition(orderId: number): Promise<OrderWithComposition> {
    try {
      const url = `${this.path}/order/${orderId}/composition`;
      const result = await axios.get(url);
      console.log("getOrderWithComposition:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getOrderWithComposition: ", err);
      throw err;
    }
  }

  // Order composition operations
  public async getOrderCompositions(orderId: number): Promise<OrderComposition[]> {
    try {
      const url = `${this.path}/order/${orderId}/compositions`;
      const result = await axios.get(url);
      console.log("getOrderCompositions:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getOrderCompositions: ", err);
      throw err;
    }
  }

  public async addBookToOrder(input: OrderCompositionInput): Promise<OrderComposition> {
    try {
      const url = `${this.path}/order/composition/create`;
      const result = await axios.post(url, input);
      console.log("addBookToOrder:", result);

      return result.data;
    } catch (err) {
      console.log("Error, addBookToOrder: ", err);
      throw err;
    }
  }

  public async updateOrderComposition(input: OrderCompositionUpdateInput): Promise<OrderComposition> {
    try {
      const url = `${this.path}/order/composition/update`;
      const result = await axios.put(url, input);
      console.log("updateOrderComposition:", result);

      return result.data;
    } catch (err) {
      console.log("Error, updateOrderComposition: ", err);
      throw err;
    }
  }

  public async removeBookFromOrder(compositionId: number): Promise<void> {
    try {
      const url = `${this.path}/order/composition/${compositionId}`;
      const result = await axios.delete(url);
      console.log("removeBookFromOrder:", result);
    } catch (err) {
      console.log("Error, removeBookFromOrder: ", err);
      throw err;
    }
  }

  public async createCompleteOrder(orderData: OrderInput, compositions: OrderCompositionInput[]): Promise<OrderWithComposition> {
    try {
      const url = `${this.path}/order/create-complete`;
      const payload = {
        order: orderData,
        compositions: compositions
      };
      const result = await axios.post(url, payload);
      console.log("createCompleteOrder:", result);

      return result.data;
    } catch (err) {
      console.log("Error, createCompleteOrder: ", err);
      throw err;
    }
  }
}

export default OrderServiceNew;
