// Review entity types based on ERD schema
export interface Review {
  ID: number; // BIGINT primary key
  Grade: number; // INT (rating)
  Id_Book: number; // BIGINT foreign key to Book.ID
  id_User: number; // BIGINT foreign key to User.ID
}

export interface ReviewInput {
  Grade: number;
  Id_Book: number;
  id_User: number;
}

export interface ReviewUpdateInput {
  ID: number;
  Grade?: number;
}

export interface ReviewInquiry {
  page: number;
  limit: number;
  Id_Book?: number;
  id_User?: number;
  min_grade?: number;
  max_grade?: number;
}
