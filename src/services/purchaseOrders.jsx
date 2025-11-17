// ✅ src/services/purchaseOrders.js
import api from "./api";

const PurchaseOrdersService = {
  getAll: () => api.get("/purchase-orders"),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  getByShop: (shopId) => api.get(`/purchase-orders/shop/${shopId}`),
  create: (data) => api.post("/purchase-orders", data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  autoGenerate: () => api.post("/purchase-orders/auto-generate"),
  getExpenses: (orderId) => api.get(`/purchase-orders/${orderId}/expenses`),
  getTotalExpenses: (orderId) =>
    api.get(`/purchase-orders/${orderId}/expenses/total`),
  calculateLandingCost: (orderId) =>
    api.get(`/purchase-orders/${orderId}/landing-cost`),
  markComplete: (orderId) => api.patch(`/purchase-orders/${orderId}/complete`),
};

export default PurchaseOrdersService;
