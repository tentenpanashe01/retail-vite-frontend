import api from "./api";

const BASE_URL = "http://localhost:8080/api/pricing-adjustments";

const PriceAdjustmentService = {
  getByProduct: (productId) => api.get(`${BASE_URL}/product/${productId}`),
  getByShop: (shopId) => api.get(`${BASE_URL}/shop/${shopId}`),
};

export default PriceAdjustmentService;
