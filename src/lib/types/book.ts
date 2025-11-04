// Book entity types based on ERD schema
export interface Book {
  ID: number; // BIGINT primary key
  Title: string; // VARCHAR(255)
  Author: string; // VARCHAR(255)
  Price: number; // DECIMAL(10,2)
  Stock_quantity: number; // INT
  Publishing_year: number; // INT
}

export interface BookInput {
  Title: string;
  Author: string;
  Price: number;
  Stock_quantity: number;
  Publishing_year: number;
}

export interface BookUpdateInput {
  ID: number;
  Title?: string;
  Author?: string;
  Price?: number;
  Stock_quantity?: number;
  Publishing_year?: number;
}

export interface BookInquiry {
  page: number;
  limit: number;
  search?: string;
  author?: string;
  publishing_year?: number;
  min_price?: number;
  max_price?: number;
}
