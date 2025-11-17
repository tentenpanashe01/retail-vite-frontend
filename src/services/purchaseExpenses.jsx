// ✅ src/services/purchaseExpenses.js
import api from "./api";

// Centralized backend API base URL
const API_URL = "http://localhost:8080/api";

/**
 * Handles all API interactions for Purchase Order Expenses.
 * These endpoints link operational costs (like transport, customs, etc.)
 * to purchase orders before marking them complete.
 */
const PurchaseExpensesService = {
  /**
   * ✅ Create a new expense linked to a purchase order
   * Example payload:
   * {
   *   purchaseOrder: { purchaseOrderId: 1 },
   *   category: { id: 3 },
   *   shop: { id: 2 },
   *   amountUSD: 50,
   *   amountZWL: 30000,
   *   description: "Fuel for truck"
   * }
   */
  create(data) {
    return api.post(`${API_URL}/expenses`, data);
  },

  /**
   * ✅ Get all recorded expenses (system-wide)
   */
  getAll() {
    return api.get(`${API_URL}/expenses`);
  },

  /**
   * ✅ Get all expenses associated with a specific Purchase Order
   */
  getByOrder(orderId) {
    return api.get(`${API_URL}/purchase-orders/${orderId}/expenses`);
  },

  /**
   * ✅ Get total expense amount for a specific Purchase Order
   */
  getTotalByOrder(orderId) {
    return api.get(`${API_URL}/purchase-orders/${orderId}/expenses/total`);
  },

  /**
   * ✅ Delete a specific expense (if needed)
   */
  delete(expenseId) {
    return api.delete(`${API_URL}/expenses/${expenseId}`);
  },
};

export default PurchaseExpensesService;
