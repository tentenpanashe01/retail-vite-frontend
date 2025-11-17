// ✅ src/services/SaleItemService.js
import api from "./api";
import Swal from "sweetalert2";

const API_URL = "http://localhost:8080/api/sale-items";

const handleError = (error, action = "operation") => {
  const message =
    error?.response?.data || error?.message || "Unexpected error occurred";
  Swal.fire("Error", `Failed to ${action}: ${message}`, "error");
  console.error(`[SaleItemService] ${action} error:`, error);
  throw error;
};

export const SaleItemService = {
  // 🔹 Get all sale items
  async getAllSaleItems() {
    try {
      const res = await api.get(API_URL);
      return res.data;
    } catch (err) {
      handleError(err, "fetch all sale items");
    }
  },

  // 🔹 Get single sale item
  async getSaleItemById(id) {
    try {
      const res = await api.get(`${API_URL}/${id}`);
      return res.data;
    } catch (err) {
      handleError(err, "fetch sale item");
    }
  },

  // 🔹 Get all sale items for a specific sale
  async getItemsBySale(saleId) {
    try {
      const res = await api.get(`${API_URL}/sale/${saleId}`);
      return res.data;
    } catch (err) {
      handleError(err, "fetch sale items for sale");
    }
  },

  // 🔹 Create sale item
  async createSaleItem(itemData) {
    try {
      const res = await api.post(API_URL, itemData);
      Swal.fire("Success", "Item added successfully!", "success");
      return res.data;
    } catch (err) {
      handleError(err, "add sale item");
    }
  },

  // 🔹 Update sale item
  async updateSaleItem(id, itemData) {
    try {
      const res = await api.put(`${API_URL}/${id}`, itemData);
      Swal.fire("Updated", "Sale item updated successfully!", "success");
      return res.data;
    } catch (err) {
      handleError(err, "update sale item");
    }
  },

  // 🔹 Delete sale item
  async deleteSaleItem(id) {
    try {
      await api.delete(`${API_URL}/${id}`);
      Swal.fire("Deleted", "Sale item removed successfully.", "success");
    } catch (err) {
      handleError(err, "delete sale item");
    }
  },
};
export default SaleItemService;