// Adapter service to bridge old and new data models
import { Member, MemberInput, LoginInput as OldLoginInput } from '../lib/types/member';
import { Product, ProductInquiry } from '../lib/types/product';
import { Order, OrderInquiry, OrderUpdateInput } from '../lib/types/order';
import { User, UserInput, LoginInput as NewLoginInput } from '../lib/types/user';
import { Book, BookInquiry } from '../lib/types/book';
import { Order as NewOrder, OrderInquiry as NewOrderInquiry, OrderUpdateInput as NewOrderUpdateInput } from '../lib/types/order-new';
import ServiceManager from './ServiceManager';

class DataAdapterService {
  private serviceManager: ServiceManager;

  constructor() {
    this.serviceManager = ServiceManager.getInstance();
  }

  // Convert new User to old Member format
  private convertUserToMember(user: User): Member {
    return {
      _id: user.ID.toString(),
      memberType: 'USER' as any,
      memberStatus: 'ACTIVE' as any,
      memberNick: `${user.First_name} ${user.Last_name}`,
      memberPhone: user.Phone,
      memberPassword: user.Password,
      memberAddress: user.Address,
      memberDesc: '',
      memberImage: '',
      memberPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Convert old Member to new User format
  private convertMemberToUser(member: Member): User {
    const nameParts = member.memberNick.split(' ');
    return {
      ID: parseInt(member._id),
      Email: '', // Will need to be handled separately
      Password: member.memberPassword || '',
      First_name: nameParts[0] || '',
      Last_name: nameParts.slice(1).join(' ') || '',
      Phone: member.memberPhone,
      Address: member.memberAddress || ''
    };
  }

  // Convert new Book to old Product format
  private convertBookToProduct(book: Book): Product {
    // Генерируем путь к изображению на основе ID книги
    const bookImagePath = `/assets/img/book/${book.ID}.png`;
    
    return {
      _id: book.ID.toString(),
      productStatus: 'PROCESS' as any,
      productCollection: 'BOOK' as any,
      productName: book.Title,
      productPrice: book.Price,
      productLeftCount: book.Stock_quantity,
      productSize: 'MEDIUM' as any,
      productVolume: 1,
      productDesc: book.Description || `Author: ${book.Author}, Published: ${book.Publishing_year}`,
      productImages: [bookImagePath], // Добавляем путь к изображению
      productViews: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Convert Book to ProductCard format (for UI components)
  // index: позиция книги в списке (0, 1, 2...) - для первых 3 книг будет показана метка "New"
  public convertBookToProductCard(book: Book, index: number = 0): any {
    try {
      // Импортируем функцию для загрузки изображений
      const getBookImage = require('../utils/bookImageLoader').getBookImage;
      
      // Загружаем изображение книги
      const bookImage = getBookImage(book.ID);
      
      // Используем Description из БД, если оно есть, иначе пустую строку
      const fullDescription = book.Description || '';
      
      // Показываем метку "New" только на первых трех книгах (индекс 0, 1, 2)
      const labels = index < 3 ? "New" : null;
      
      // Получаем скидку из базы данных
      const discountPercent = book.Discount_percent || 0;
      const hasDiscount = discountPercent > 0;
      const originalPrice = typeof book.Price === 'number' ? book.Price : parseFloat(String(book.Price)) || 0;
      const discountedPrice = hasDiscount 
        ? originalPrice * (1 - discountPercent / 100) 
        : originalPrice;

      const productCard = {
        id: book.ID,
        labels: labels,
        category: "book",
        img: bookImage,
        hover_img: bookImage, // Используем то же изображение для hover
        title: book.Title,
        price: discountedPrice, // Используем цену со скидкой, если есть
        originalPrice: originalPrice, // Оригинальная цена
        discountedPrice: discountedPrice, // Цена со скидкой
        discountPercent: discountPercent, // Процент скидки из БД
        hasDiscount: hasDiscount, // Есть ли скидка
        stock_quantity: book.Stock_quantity || 0, // Сохраняем количество на складе из БД
        description: `Author: ${book.Author}, Published: ${book.Publishing_year}`, // Краткое описание для карточки
        fullDescription: fullDescription, // Полное описание из БД (пустая строка, если его нет)
        rating: {
          rate: 4.5,
          count: 0
        },
        color: []
      };
      
      console.log(`📝 Book ${book.ID} - Description from DB:`, book.Description ? `Yes (${book.Description.length} chars)` : 'No (empty string)');
      
      console.log(`✅ Converted book ${book.ID} to product card:`, productCard);
      return productCard;
    } catch (error) {
      console.error(`❌ Error converting book ${book.ID}:`, error);
      // Возвращаем базовую структуру даже при ошибке
      const labels = index < 3 ? "New" : null;
      // Получаем скидку из базы данных (в блоке catch)
      const discountPercent = book.Discount_percent || 0;
      const hasDiscount = discountPercent > 0;
      const originalPrice = typeof book.Price === 'number' ? book.Price : parseFloat(String(book.Price)) || 0;
      const discountedPrice = hasDiscount 
        ? originalPrice * (1 - discountPercent / 100) 
        : originalPrice;

      return {
        id: book.ID,
        labels: labels,
        category: "book",
        img: '',
        hover_img: '',
        title: book.Title,
        price: discountedPrice, // Используем цену со скидкой, если есть
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discountPercent: discountPercent,
        hasDiscount: hasDiscount,
        stock_quantity: book.Stock_quantity || 0,
        description: `Author: ${book.Author}, Published: ${book.Publishing_year}`,
        rating: {
          rate: 4.5,
          count: 0
        },
        color: []
      };
    }
  }

  // Convert old Product to new Book format
  private convertProductToBook(product: Product): Book {
    return {
      ID: parseInt(product._id),
      Title: product.productName,
      Author: '', // Will need to be extracted from description or handled separately
      Price: product.productPrice,
      Stock_quantity: product.productLeftCount,
      Publishing_year: new Date().getFullYear() // Default value
    };
  }

  // Convert new Order to old Order format
  private convertNewOrderToOldOrder(newOrder: NewOrder): Order {
    return {
      _id: newOrder.ID.toString(),
      orderTotal: 0, // Will need to be calculated
      orderDelivery: 0,
      orderStatus: newOrder.Order_status as any,
      memberid: newOrder.ID_User.toString(),
      createdAt: newOrder.Order_date,
      updatedAt: newOrder.Order_date,
      orderItems: [], // Will need to be populated from order compositions
      productData: [] // Will need to be populated from order compositions
    };
  }

  // Member service adapters
  public async getTopUsers(): Promise<Member[]> {
    try {
      const users = await this.serviceManager.userService.getUsers({ page: 1, limit: 10 });
      return users.map(user => this.convertUserToMember(user));
    } catch (error) {
      console.error('Error in getTopUsers adapter:', error);
      throw error;
    }
  }

  public async getRestaurant(): Promise<Member> {
    // This seems to be a specific business logic method
    // For now, return a default member or handle as needed
    throw new Error('getRestaurant method needs specific implementation');
  }

  public async signup(input: MemberInput): Promise<Member> {
    try {
      const userInput: UserInput = {
        Email: '', // Will need to be provided
        Password: input.memberPassword,
        First_name: input.memberNick.split(' ')[0] || '',
        Last_name: input.memberNick.split(' ').slice(1).join(' ') || '',
        Phone: input.memberPhone,
        Address: input.memberAddress || ''
      };

      const user = await this.serviceManager.userService.createUser(userInput);
      return this.convertUserToMember(user);
    } catch (error) {
      console.error('Error in signup adapter:', error);
      throw error;
    }
  }

  public async login(input: OldLoginInput): Promise<Member> {
    try {
      const loginInput: NewLoginInput = {
        Email: '', // Will need to be handled differently since old system uses memberNick
        Password: input.memberPassword
      };

      // For now, we'll need to find user by phone or implement a different approach
      const users = await this.serviceManager.userService.getUsers({ page: 1, limit: 1000 });
      const user = users.find(u => u.Phone === input.memberNick);
      
      if (!user) {
        throw new Error('User not found');
      }

      return this.convertUserToMember(user);
    } catch (error) {
      console.error('Error in login adapter:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.serviceManager.userService.logout();
    } catch (error) {
      console.error('Error in logout adapter:', error);
      throw error;
    }
  }

  public async updateMember(input: any): Promise<Member> {
    try {
      const userUpdateInput = {
        ID: parseInt(input._id || '0'),
        First_name: input.memberNick?.split(' ')[0] || '',
        Last_name: input.memberNick?.split(' ').slice(1).join(' ') || '',
        Phone: input.memberPhone || '',
        Address: input.memberAddress || ''
      };

      const user = await this.serviceManager.userService.updateUser(userUpdateInput);
      return this.convertUserToMember(user);
    } catch (error) {
      console.error('Error in updateMember adapter:', error);
      throw error;
    }
  }

  // Product service adapters
  public async getProducts(input: ProductInquiry): Promise<Product[]> {
    try {
      const bookInquiry: BookInquiry = {
        page: input.page,
        limit: input.limit,
        search: input.search
      };

      const books = await this.serviceManager.bookService.getBooks(bookInquiry);
      return books.map(book => this.convertBookToProduct(book));
    } catch (error) {
      console.error('Error in getProducts adapter:', error);
      throw error;
    }
  }

  public async getProduct(productId: string): Promise<Product> {
    try {
      const book = await this.serviceManager.bookService.getBook(parseInt(productId));
      return this.convertBookToProduct(book);
    } catch (error) {
      console.error('Error in getProduct adapter:', error);
      throw error;
    }
  }

  // Order service adapters
  public async createOrder(input: any[]): Promise<Order> {
    try {
      // This will need to be implemented based on the cart items structure
      throw new Error('createOrder adapter needs implementation based on cart structure');
    } catch (error) {
      console.error('Error in createOrder adapter:', error);
      throw error;
    }
  }

  public async getMyOrders(input: OrderInquiry): Promise<Order[]> {
    try {
      const newOrderInquiry: NewOrderInquiry = {
        page: input.page,
        limit: input.limit,
        Order_status: input.orderStatus as any
      };

      const orders = await this.serviceManager.orderService.getOrders(newOrderInquiry);
      return orders.map(order => this.convertNewOrderToOldOrder(order));
    } catch (error) {
      console.error('Error in getMyOrders adapter:', error);
      throw error;
    }
  }

  public async updateOrder(input: OrderUpdateInput): Promise<Order> {
    try {
      const newOrderUpdateInput: NewOrderUpdateInput = {
        ID: parseInt(input.orderId),
        Order_status: input.orderStatus as any
      };

      const order = await this.serviceManager.orderService.updateOrder(newOrderUpdateInput);
      return this.convertNewOrderToOldOrder(order);
    } catch (error) {
      console.error('Error in updateOrder adapter:', error);
      throw error;
    }
  }
}

export default DataAdapterService;
