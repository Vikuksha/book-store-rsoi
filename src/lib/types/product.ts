import { ProductCollection, ProductSize, ProductStatus } from "../enums/product.enum";

// db dan keladgan malumot un
export interface Product {
  _id: string;
  productStatus: ProductStatus; // krtmasa default valuesini oladi
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize: ProductSize;
  productVolume: number;
  productDesc?: string; // bolshi ham, bomasligi ham mn => ?
  productImages: string[];
  productViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  search?: string;
}
