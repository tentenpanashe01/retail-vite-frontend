// src/services/sales.js
import api from "./api";
import Swal from "sweetalert2";

const API_URL = "/sales";

const handleError = (error, action = "operation") => {
  const message =
    error?.response?.data || error?.message || "Unexpected error occurred";
  Swal.fire("Error", `Failed to ${action}: ${message}`, "error");
  console.error(`[SaleService] ${action} error:`, error);
  throw error;
};

export const SaleService = {
  // Create Sale
  async createSale(shopId, cashierId, saleData) {
    try {
      const res = await api.post(`${API_URL}/${shopId}/${cashierId}`, saleData);
      Swal.fire("Success", "Sale created successfully!", "success");
      return res.data;
    } catch (err) {
      handleError(err, "create sale");
    }
  },

  // Admin only
  async getAllSales() {
    try {
      const res = await api.get(API_URL);
      return res.data;
    } catch (err) {
      handleError(err, "fetch all sales");
    }
  },

  async getSaleById(id) {
    try {
      const res = await api.get(`${API_URL}/${id}`);
      return res.data;
    } catch (err) {
      handleError(err, "fetch sale details");
    }
  },

  async getSalesByShop(shopId) {
    try {
      const res = await api.get(`${API_URL}/shop/${shopId}`);
      return res.data;
    } catch (err) {
      handleError(err, "fetch shop sales");
    }
  },

  async getShopDailySales(shopId, date) {
    try {
      const res = await api.get(`${API_URL}/shop/${shopId}/daily`, {
        params: { date },
      });
      return res.data;
    } catch (err) {
      handleError(err, "fetch shop daily sales");
    }
  },

  async getCashierDailySales(userId, date) {
    try {
      const res = await api.get(`${API_URL}/user/${userId}/daily`, {
        params: { date },
      });
      return res.data;
    } catch (err) {
      handleError(err, "fetch cashier daily sales");
    }
  },

  async getSalesByRange(start, end) {
    try {
      const res = await api.get(`${API_URL}/range`, {
        params: { start, end },
      });
      return res.data;
    } catch (err) {
      handleError(err, "filter sales by range");
    }
  },

  async deleteSale(id) {
    try {
      await api.delete(`${API_URL}/${id}`);
      Swal.fire("Deleted", "Sale deleted successfully", "success");
    } catch (err) {
      handleError(err, "delete sale");
    }
  },
};

export default SaleService;