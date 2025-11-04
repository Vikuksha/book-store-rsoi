import { Book } from './book';

// Order entity types based on ERD schema
export interface Order {
  ID: number; // BIGINT primary key
  Total_order_quantity: number; // INT
  Order_date: Date; // DATETIME
  Currency: number; // INT
  Order_status: OrderStatus; // ENUM
  Tracking_number: string; // VARCHAR(255)
  ID_User: number; // BIGINT foreign key to User.ID
}

export interface OrderInput {
  Total_order_quantity: number;
  Currency: number;
  Order_status: OrderStatus;
  Tracking_number?: string;
  ID_User: number;
}

export interface OrderUpdateInput {
  ID: number;
  Total_order_quantity?: number;
  Currency?: number;
  Order_status?: OrderStatus;
  Tracking_number?: string;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  ID_User?: number;
  Order_status?: OrderStatus;
  start_date?: Date;
  end_date?: Date;
}

// Order composition entity types (many-to-many relationship)
export interface OrderComposition {
  ID: number; // BIGINT primary key
  Books_number: number; // INT (quantity)
  ID_Order: number; // BIGINT foreign key to Order.ID
  ID_Book: number; // BIGINT foreign key to Book.ID
}

export interface OrderCompositionInput {
  Books_number: number;
  ID_Order: number;
  ID_Book: number;
}

export interface OrderCompositionUpdateInput {
  ID: number;
  Books_number?: number;
}

// Order with composition details
export interface OrderWithComposition extends Order {
  orderCompositions: OrderComposition[];
  books: Book[];
}

// Order status enum
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
