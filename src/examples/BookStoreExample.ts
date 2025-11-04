// Example usage of the new database implementation
import ServiceManager from '../services/ServiceManager';
import { BookInput } from '../lib/types/book';
import { UserInput } from '../lib/types/user';
import { ReviewInput } from '../lib/types/review';
import { OrderInput, OrderCompositionInput } from '../lib/types/order-new';

class BookStoreExample {
  private serviceManager: ServiceManager;

  constructor() {
    this.serviceManager = ServiceManager.getInstance();
  }

  // Example: Create a new book
  async createBook() {
    try {
      const bookData: BookInput = {
        Title: "The Great Gatsby",
        Author: "F. Scott Fitzgerald",
        Price: 12.99,
        Stock_quantity: 50,
        Publishing_year: 1925
      };

      const book = await this.serviceManager.bookService.createBook(bookData);
      console.log('Created book:', book);
      return book;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }

  // Example: Create a new user
  async createUser() {
    try {
      const userData: UserInput = {
        Email: "john.doe@example.com",
        Password: "securePassword123",
        First_name: "John",
        Last_name: "Doe",
        Phone: "+1234567890",
        Address: "123 Main St, City, State"
      };

      const user = await this.serviceManager.userService.createUser(userData);
      console.log('Created user:', user);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Example: Add a review for a book
  async addReview(bookId: number, userId: number) {
    try {
      const reviewData: ReviewInput = {
        Grade: 5,
        Id_Book: bookId,
        id_User: userId
      };

      const review = await this.serviceManager.reviewService.createReview(reviewData);
      console.log('Created review:', review);
      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Example: Create an order with multiple books
  async createOrder(userId: number) {
    try {
      const books = [
        { bookId: 1, quantity: 2 },
        { bookId: 2, quantity: 1 }
      ];

      const order = await this.serviceManager.createOrderWithBooks(userId, books);
      console.log('Created order:', order);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Example: Get book with reviews and average rating
  async getBookDetails(bookId: number) {
    try {
      const bookDetails = await this.serviceManager.getBookWithReviews(bookId);
      console.log('Book details:', bookDetails);
      return bookDetails;
    } catch (error) {
      console.error('Error getting book details:', error);
      throw error;
    }
  }

  // Example: Get user with their orders
  async getUserProfile(userId: number) {
    try {
      const userProfile = await this.serviceManager.getUserWithOrders(userId);
      console.log('User profile:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Example: Complete workflow - create user, book, review, and order
  async completeWorkflow() {
    try {
      console.log('Starting complete workflow...');

      // 1. Create a user
      const user = await this.createUser();
      console.log('✓ User created');

      // 2. Create a book
      const book = await this.createBook();
      console.log('✓ Book created');

      // 3. Add a review
      const review = await this.addReview(book.ID, user.ID);
      console.log('✓ Review added');

      // 4. Create an order
      const order = await this.createOrder(user.ID);
      console.log('✓ Order created');

      // 5. Get book details with reviews
      const bookDetails = await this.getBookDetails(book.ID);
      console.log('✓ Book details retrieved');

      // 6. Get user profile with orders
      const userProfile = await this.getUserProfile(user.ID);
      console.log('✓ User profile retrieved');

      console.log('Complete workflow finished successfully!');
      
      return {
        user,
        book,
        review,
        order,
        bookDetails,
        userProfile
      };
    } catch (error) {
      console.error('Error in complete workflow:', error);
      throw error;
    }
  }

  // Example: Search functionality
  async searchBooks(searchTerm: string) {
    try {
      const books = await this.serviceManager.bookService.searchBooks(searchTerm);
      console.log('Search results:', books);
      return books;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  // Example: Get books by author
  async getBooksByAuthor(author: string) {
    try {
      const books = await this.serviceManager.bookService.getBooksByAuthor(author);
      console.log('Books by author:', books);
      return books;
    } catch (error) {
      console.error('Error getting books by author:', error);
      throw error;
    }
  }

  // Example: Get average rating for a book
  async getBookRating(bookId: number) {
    try {
      const averageRating = await this.serviceManager.reviewService.getAverageRating(bookId);
      console.log('Average rating:', averageRating);
      return averageRating;
    } catch (error) {
      console.error('Error getting book rating:', error);
      throw error;
    }
  }
}

// Export singleton instance
const bookStoreExample = new BookStoreExample();
export default bookStoreExample;
