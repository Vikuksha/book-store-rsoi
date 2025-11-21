import axios from "axios";
import { serverApi } from "../config";
import { Review, ReviewInput, ReviewUpdateInput, ReviewInquiry } from "../lib/types/review";

class ReviewService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getReviews(input: ReviewInquiry): Promise<Review[]> {
    try {
      let url = `${this.path}/api/review/all?page=${input.page}&limit=${input.limit}`;
      
      if (input.Id_Book) url += `&book_id=${input.Id_Book}`;
      if (input.id_User) url += `&user_id=${input.id_User}`;
      if (input.min_grade) url += `&min_grade=${input.min_grade}`;
      if (input.max_grade) url += `&max_grade=${input.max_grade}`;

      const result = await axios.get(url);
      console.log("getReviews:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getReviews: ", err);
      throw err;
    }
  }

  public async getReview(reviewId: number): Promise<Review> {
    try {
      const url = `${this.path}/api/review/${reviewId}`;
      const result = await axios.get(url);
      console.log("getReview:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getReview: ", err);
      throw err;
    }
  }

  public async createReview(input: ReviewInput): Promise<Review> {
    try {
      const url = `${this.path}/api/review/create`;
      const result = await axios.post(url, input);
      console.log("createReview:", result);

      return result.data;
    } catch (err) {
      console.log("Error, createReview: ", err);
      throw err;
    }
  }

  public async updateReview(input: ReviewUpdateInput): Promise<Review> {
    try {
      const url = `${this.path}/api/review/update`;
      const result = await axios.put(url, input);
      console.log("updateReview:", result);

      return result.data;
    } catch (err) {
      console.log("Error, updateReview: ", err);
      throw err;
    }
  }

  public async deleteReview(reviewId: number): Promise<void> {
    try {
      const url = `${this.path}/api/review/${reviewId}`;
      const result = await axios.delete(url);
      console.log("deleteReview:", result);
    } catch (err) {
      console.log("Error, deleteReview: ", err);
      throw err;
    }
  }

  public async getReviewsByBook(bookId: number): Promise<Review[]> {
    try {
      const url = `${this.path}/api/review/book/${bookId}`;
      console.log(`🔄 ReviewService: Fetching reviews for book ${bookId} from ${url}`);
      const result = await axios.get(url);
      console.log(`✅ ReviewService: Received ${result.data?.length || 0} reviews for book ${bookId}`, result.data);

      return result.data || [];
    } catch (err: any) {
      console.error("❌ ReviewService: Error in getReviewsByBook:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      // Возвращаем пустой массив вместо выброса ошибки, чтобы не ломать UI
      return [];
    }
  }

  public async getReviewsByUser(userId: number): Promise<Review[]> {
    try {
      const url = `${this.path}/api/review/user/${userId}`;
      const result = await axios.get(url);
      console.log("getReviewsByUser:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getReviewsByUser: ", err);
      throw err;
    }
  }

  public async getAverageRating(bookId: number): Promise<{ averageRating: number; reviewCount: number }> {
    try {
      const url = `${this.path}/api/review/book/${bookId}/average`;
      console.log(`🔄 ReviewService: Fetching average rating for book ${bookId} from ${url}`);
      const result = await axios.get(url);
      console.log(`✅ ReviewService: Average rating for book ${bookId}:`, result.data);

      return result.data || { averageRating: 0, reviewCount: 0 };
    } catch (err: any) {
      console.warn(`⚠️ ReviewService: Error getting average rating for book ${bookId}:`, err);
      if (err.response) {
        console.warn("Response status:", err.response.status);
        console.warn("Response data:", err.response.data);
      }
      // Возвращаем значения по умолчанию вместо выброса ошибки
      return { averageRating: 0, reviewCount: 0 };
    }
  }
}

export default ReviewService;
