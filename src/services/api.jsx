// src/services/api.js
console.log("api.js loaded");
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🪪 Automatically attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token attached to request:", config.url);
    } else {
      console.warn("⚠️ No token found for request:", config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Handle expired or invalid token responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Token expired or unauthorized — logging out...");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
