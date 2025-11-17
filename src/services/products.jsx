// ✅ src/services/product.js
import api from "./api"; // secured Axios instance

const BASE_URL = "/products";
const PRICING_URL = "/pricing-adjustments";

const ProductService = {
  // 🔹 Fetch all products (global)
  getAll: () => api.get(BASE_URL),

  // 🔹 Fetch products belonging to a specific shop
  getByShop: (shopId) => api.get(`${BASE_URL}/shop/${shopId}`),

  // 🔹 Fetch products that are below reorder level
  getBelowReorder: (shopId) => api.get(`${BASE_URL}/reorder/${shopId}`),

  // 🔹 Get product by ID
  getById: (id) => api.get(`${BASE_URL}/${id}`),

  // 🔹 Create new product (applies globally)
  create: (product) => api.post(BASE_URL, product),

  // 🔹 Update general product details
  update: (id, product) => api.put(`${BASE_URL}/${id}`, product),

  // 💰 PRICE ADJUSTMENTS
  updateGlobalPricing: (productId, newSellingUSD, newSellingZWL, reason, userId) =>
    api.put(`${PRICING_URL}/global/${productId}/update-price`, {
      newSellingUSD,
      newSellingZWL,
      reason,
      userId,
    }),

  updateShopPricing: (shopId, productId, newSellingUSD, newSellingZWL, reason, userId) =>
    api.put(`${PRICING_URL}/shop/${shopId}/product/${productId}/update-price`, {
      newSellingUSD,
      newSellingZWL,
      reason,
      userId,
    }),

  // ⚙ STOCK ADJUSTMENTS
  // ✅ For global product-level adjustment
  adjustStock: (shopId, productId, deltaQty, costUSD, costZWL) =>
    api.patch(`/shop-stock/adjust`, null, {
      params: { shopId, productId, deltaQty, costUSD, costZWL },
    }),

  // ❌ (This function can stay for later per-shop logic)
  adjustShopStock: (shopId, productId, quantityChange) =>
    api.patch(`${BASE_URL}/shop/${shopId}/product/${productId}/stock`, {
      quantityChange,
    }),

  // ❌ DELETE PRODUCT
  remove: (id) => api.delete(`${BASE_URL}/${id}`),
};

export default ProductService;