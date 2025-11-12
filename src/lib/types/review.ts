// Review entity types based on ERD schema
export interface Review {
  ID: number; // BIGINT primary key
  Grade: number; // FLOAT (rating)
  Id_Book: number; // BIGINT foreign key to Book.ID
  id_User: number; // BIGINT foreign key to User.ID
  Review?: string; // TEXT (review text)
}

export interface ReviewInput {
  Grade: number;
  Id_Book: number;
  id_User: number;
  Review?: string;
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
