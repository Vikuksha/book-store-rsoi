// Service manager to handle all database services
import BookService from '../services/BookService';
import UserService from '../services/UserService';
import ReviewService from '../services/ReviewService';
import OrderServiceNew from '../services/OrderServiceNew';

class ServiceManager {
  private static instance: ServiceManager;
  
  public readonly bookService: BookService;
  public readonly userService: UserService;
  public readonly reviewService: ReviewService;
  public readonly orderService: OrderServiceNew;

  private constructor() {
    this.bookService = new BookService();
    this.userService = new UserService();
    this.reviewService = new ReviewService();
    this.orderService = new OrderServiceNew();
  }

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  // Helper methods for common operations
  public async getBookWithReviews(bookId: number) {
    try {
      const [book, reviews] = await Promise.all([
        this.bookService.getBook(bookId),
        this.reviewService.getReviewsByBook(bookId)
      ]);
      
      return {
        book,
        reviews,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.Grade, 0) / reviews.length 
          : 0
      };
    } catch (error) {
      console.error('Error getting book with reviews:', error);
      throw error;
    }
  }

  public async getUserWithOrders(userId: number) {
    try {
      const [user, orders] = await Promise.all([
        this.userService.getUser(userId),
        this.orderService.getOrdersByUser(userId)
      ]);
      
      return { user, orders };
    } catch (error) {
      console.error('Error getting user with orders:', error);
      throw error;
    }
  }

  public async getOrderWithDetails(orderId: number) {
    try {
      const orderWithComposition = await this.orderService.getOrderWithComposition(orderId);
      return orderWithComposition;
    } catch (error) {
      console.error('Error getting order with details:', error);
      throw error;
    }
  }

  public async createOrderWithBooks(userId: number, books: Array<{bookId: number, quantity: number}>) {
    try {
      // Create the order
      const orderData = {
        Total_order_quantity: books.reduce((sum, book) => sum + book.quantity, 0),
        Currency: 1, // Default currency
        Order_status: 'PENDING' as any,
        ID_User: userId
      };

      // Create order compositions
      const compositions = books.map(book => ({
        Books_number: book.quantity,
        ID_Order: 0, // Will be set by the backend
        ID_Book: book.bookId
      }));

      return await this.orderService.createCompleteOrder(orderData, compositions);
    } catch (error) {
      console.error('Error creating order with books:', error);
      throw error;
    }
  }
}

export default ServiceManager;
