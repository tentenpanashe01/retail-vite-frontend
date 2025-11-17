// ✅ src/services/purchaseOrderItems.js
import api from "./api";

const PurchaseOrderItemsService = {
  getAll: () => api.get("/purchase-order-items"),
  getById: (id) => api.get(`/purchase-order-items/${id}`),
  getByOrder: (orderId) => api.get(`/purchase-order-items/order/${orderId}`),
  create: (data) => api.post("/purchase-order-items", data),
  update: (id, data) => api.put(`/purchase-order-items/${id}`, data),
  delete: (id) => api.delete(`/purchase-order-items/${id}`),
};

export default PurchaseOrderItemsService;
