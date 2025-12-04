import axios from "axios";
import { serverApi } from "../config";
import AuthService from "./AuthService";

export interface MonthlyRevenue {
  month: number;
  year: number;
  totalRevenue: number;
  orderCount: number;
  period: {
    from: string;
    to: string;
  };
}

export interface AverageOrderValue {
  averageOrderValue: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface TopBook {
  id: number;
  title: string;
  author: string;
  price: number;
  genre: string | null;
  totalSold: number;
  totalRevenue: number;
}

export interface TopBooks {
  topBooks: TopBook[];
  limit: number;
}

export interface AnalyticsData {
  monthlyRevenue: MonthlyRevenue;
  averageOrderValue: AverageOrderValue;
  topBooks: TopBooks;
}

class AnalyticsService {
  private readonly path: string;
  private authService: AuthService;

  constructor() {
    this.path = serverApi;
    this.authService = new AuthService();
  }

  private getAuthHeaders() {
    const token = this.authService.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  public async getMonthlyRevenue(): Promise<MonthlyRevenue> {
    try {
      const url = `${this.path}/api/analytics/monthly-revenue`;
      const result = await axios.get(url, {
        headers: this.getAuthHeaders(),
        withCredentials: true
      });
      return result.data;
    } catch (err) {
      console.log("Error, getMonthlyRevenue: ", err);
      throw err;
    }
  }

  public async getAverageOrderValue(): Promise<AverageOrderValue> {
    try {
      const url = `${this.path}/api/analytics/average-order-value`;
      const result = await axios.get(url, {
        headers: this.getAuthHeaders(),
        withCredentials: true
      });
      return result.data;
    } catch (err) {
      console.log("Error, getAverageOrderValue: ", err);
      throw err;
    }
  }

  public async getTopBooks(limit: number = 10): Promise<TopBooks> {
    try {
      const url = `${this.path}/api/analytics/top-books?limit=${limit}`;
      const result = await axios.get(url, {
        headers: this.getAuthHeaders(),
        withCredentials: true
      });
      return result.data;
    } catch (err) {
      console.log("Error, getTopBooks: ", err);
      throw err;
    }
  }

  public async getAllAnalytics(): Promise<AnalyticsData> {
    try {
      const url = `${this.path}/api/analytics/all`;
      const result = await axios.get(url, {
        headers: this.getAuthHeaders(),
        withCredentials: true
      });
      return result.data;
    } catch (err) {
      console.log("Error, getAllAnalytics: ", err);
      throw err;
    }
  }
}

export default AnalyticsService;

