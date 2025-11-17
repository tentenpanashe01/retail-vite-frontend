// src/services/userService.js
import api from "./api";
import Swal from "sweetalert2";

export const UserService = {
  async login(username, password) {
    try {
      const res = await api.post("/users/login", { username, password });

      const {
        token,
        username: name,
        fullName,
        roles,
        userId,
        shopId,
        shopName
      } = res.data;

      // ✅ Save all to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", name);
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("userId", userId);

      // ✅ Save shop info if available
      if (shopId) {
        localStorage.setItem("shopId", shopId);
        localStorage.setItem("shopName", shopName);
      } else {
        localStorage.removeItem("shopId");
        localStorage.removeItem("shopName");
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return res.data;
    } catch (err) {
      Swal.fire(
        "Login Failed",
        err.response?.data?.error || "Invalid username or password",
        "error"
      );
      throw err;
    }
  },
};
