// User entity types based on ERD schema
export interface User {
  ID: number; // BIGINT primary key
  Email: string; // VARCHAR(500)
  Password: string; // VARCHAR(255)
  First_name: string; // VARCHAR(255)
  Last_name: string; // VARCHAR(255)
  Phone: string; // VARCHAR(255)
  Address: string; // VARCHAR(255)
}

export interface UserInput {
  Email: string;
  Password: string;
  First_name: string;
  Last_name: string;
  Phone: string;
  Address: string;
}

export interface UserUpdateInput {
  ID: number;
  Email?: string;
  Password?: string;
  First_name?: string;
  Last_name?: string;
  Phone?: string;
  Address?: string;
}

export interface LoginInput {
  Email: string;
  Password: string;
}

export interface UserInquiry {
  page: number;
  limit: number;
  search?: string;
}
