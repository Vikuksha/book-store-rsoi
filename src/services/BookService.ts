import axios from "axios";
import { serverApi } from "../config";
import { Book, BookInput, BookUpdateInput, BookInquiry } from "../lib/types/book";

class BookService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getBooks(input: BookInquiry): Promise<Book[]> {
    try {
      let url = `${this.path}/book/all?page=${input.page}&limit=${input.limit}`;
      
      if (input.search) url += `&search=${input.search}`;
      if (input.author) url += `&author=${input.author}`;
      if (input.publishing_year) url += `&publishing_year=${input.publishing_year}`;
      if (input.min_price) url += `&min_price=${input.min_price}`;
      if (input.max_price) url += `&max_price=${input.max_price}`;

      const result = await axios.get(url);
      console.log("getBooks:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getBooks: ", err);
      throw err;
    }
  }

  public async getBook(bookId: number): Promise<Book> {
    try {
      const url = `${this.path}/book/${bookId}`;
      const result = await axios.get(url);
      console.log("getBook:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getBook: ", err);
      throw err;
    }
  }

  public async createBook(input: BookInput): Promise<Book> {
    try {
      const url = `${this.path}/book/create`;
      const result = await axios.post(url, input);
      console.log("createBook:", result);

      return result.data;
    } catch (err) {
      console.log("Error, createBook: ", err);
      throw err;
    }
  }

  public async updateBook(input: BookUpdateInput): Promise<Book> {
    try {
      const url = `${this.path}/book/update`;
      const result = await axios.put(url, input);
      console.log("updateBook:", result);

      return result.data;
    } catch (err) {
      console.log("Error, updateBook: ", err);
      throw err;
    }
  }

  public async deleteBook(bookId: number): Promise<void> {
    try {
      const url = `${this.path}/book/${bookId}`;
      const result = await axios.delete(url);
      console.log("deleteBook:", result);
    } catch (err) {
      console.log("Error, deleteBook: ", err);
      throw err;
    }
  }

  public async getBooksByAuthor(author: string): Promise<Book[]> {
    try {
      const url = `${this.path}/book/author/${encodeURIComponent(author)}`;
      const result = await axios.get(url);
      console.log("getBooksByAuthor:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getBooksByAuthor: ", err);
      throw err;
    }
  }

  public async searchBooks(searchTerm: string): Promise<Book[]> {
    try {
      const url = `${this.path}/book/search?q=${encodeURIComponent(searchTerm)}`;
      const result = await axios.get(url);
      console.log("searchBooks:", result);

      return result.data;
    } catch (err) {
      console.log("Error, searchBooks: ", err);
      throw err;
    }
  }
}

export default BookService;
