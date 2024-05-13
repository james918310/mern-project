//扮演一個服務器的角色
import axios from "axios";
const API_URL = "https://project9-m-8c9af52ea241.herokuapp.com/api/user";

class AuthService {
  //登入系統
  login(email, password) {
    return axios.post(API_URL + "/login", {
      email,
      password,
    });
  }

  //登出系統
  logout() {
    localStorage.removeItem("user");
  }
  //創建帳號
  register(username, email, password, role) {
    return axios.post(API_URL + "/register", {
      username,
      email,
      password,
      role,
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
