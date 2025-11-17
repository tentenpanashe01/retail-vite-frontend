// src/services/StockTransferService.js
import api from "./api";

const BASE_URL = "/stock-transfers";

const StockTransferService = {
  /**
   * ✅ Fetch all transfers
   */
  getAll: () => api.get(BASE_URL),

  /**
   * ✅ Fetch transfers for a specific shop
   */
  getByShop: (shopId) => api.get(`${BASE_URL}/shop/${shopId}`),

  /**
   * ✅ Create a pending stock transfer
   */
  create: (fromShopId, toShopId, productId, quantity) =>
    api.post(BASE_URL, null, { params: { fromShopId, toShopId, productId, quantity } }),

  /**
   * ✅ Approve a stock transfer
   */
  approve: (id) => api.put(`${BASE_URL}/${id}/approve`),

  /**
   * ✅ Delete a transfer
   */
  remove: (id) => api.delete(`${BASE_URL}/${id}`),
};

export default StockTransferService;