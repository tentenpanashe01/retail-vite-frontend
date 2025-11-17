// src/services/shops.js
import api from "./api";

const SHOPS_URL = "/shops";

const ShopService = {
  getAll: () => api.get(SHOPS_URL),
  getById: (id) => api.get(`${SHOPS_URL}/${id}`),
  create: (data) => api.post(SHOPS_URL, data),
  update: (id, data) => api.put(`${SHOPS_URL}/${id}`, data),
  delete: (id) => api.delete(`${SHOPS_URL}/${id}`)
};

export default ShopService;
