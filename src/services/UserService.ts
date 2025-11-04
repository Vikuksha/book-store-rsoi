import axios from "axios";
import { serverApi } from "../config";
import { User, UserInput, UserUpdateInput, LoginInput, UserInquiry } from "../lib/types/user";

class UserService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getUsers(input: UserInquiry): Promise<User[]> {
    try {
      let url = `${this.path}/user/all?page=${input.page}&limit=${input.limit}`;
      
      if (input.search) url += `&search=${input.search}`;

      const result = await axios.get(url);
      console.log("getUsers:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getUsers: ", err);
      throw err;
    }
  }

  public async getUser(userId: number): Promise<User> {
    try {
      const url = `${this.path}/user/${userId}`;
      const result = await axios.get(url);
      console.log("getUser:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getUser: ", err);
      throw err;
    }
  }

  public async createUser(input: UserInput): Promise<User> {
    try {
      const url = `${this.path}/user/create`;
      const result = await axios.post(url, input);
      console.log("createUser:", result);

      return result.data;
    } catch (err) {
      console.log("Error, createUser: ", err);
      throw err;
    }
  }

  public async updateUser(input: UserUpdateInput): Promise<User> {
    try {
      const url = `${this.path}/user/update`;
      const result = await axios.put(url, input);
      console.log("updateUser:", result);

      return result.data;
    } catch (err) {
      console.log("Error, updateUser: ", err);
      throw err;
    }
  }

  public async deleteUser(userId: number): Promise<void> {
    try {
      const url = `${this.path}/user/${userId}`;
      const result = await axios.delete(url);
      console.log("deleteUser:", result);
    } catch (err) {
      console.log("Error, deleteUser: ", err);
      throw err;
    }
  }

  public async login(input: LoginInput): Promise<User> {
    try {
      const url = `${this.path}/user/login`;
      const result = await axios.post(url, input, { withCredentials: true });
      console.log("login:", result);

      const user: User = result.data.user;
      localStorage.setItem("userData", JSON.stringify(user));

      return user;
    } catch (err) {
      console.log("Error, login: ", err);
      throw err;
    }
  }

  public async logout(): Promise<void> {
    try {
      const url = `${this.path}/user/logout`;
      const result = await axios.post(url, {}, { withCredentials: true });
      console.log("logout:", result);

      localStorage.removeItem("userData");
    } catch (err) {
      console.log("Error, logout: ", err);
      throw err;
    }
  }

  public async getUserByEmail(email: string): Promise<User> {
    try {
      const url = `${this.path}/user/email/${encodeURIComponent(email)}`;
      const result = await axios.get(url);
      console.log("getUserByEmail:", result);

      return result.data;
    } catch (err) {
      console.log("Error, getUserByEmail: ", err);
      throw err;
    }
  }
}

export default UserService;
