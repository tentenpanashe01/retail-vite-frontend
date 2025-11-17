// ✅ src/services/StockService.js
import api from "./api";

const BASE_URL = "/stocks";

const StockService = {
  /**
   * ✅ Record a stock movement (IN, OUT, ADJUSTMENT, TRANSFER)
   */
  recordMovement: (data) =>
    api.post(`${BASE_URL}/record`, null, {
      params: {
        productId: data.productId,
        shopId: data.shopId,
        qty: data.qty,
        type: data.transactionType,
        reason: data.reason,
        referenceId: data.referenceId,
        unitCostUSD: data.unitCostUSD,
        unitCostZWL: data.unitCostZWL,
      },
    }),

  /**
   * ✅ Get all stock logs for a specific shop
   */
  getByShop: (shopId) => api.get(`${BASE_URL}/shop/${shopId}`),

  /**
   * ✅ Get all stock logs for a specific product
   */
  getByProduct: (productId) => api.get(`${BASE_URL}/product/${productId}`),

  /**
   * ✅ Delete a specific stock log (for corrections)
   */
  deleteLog: (id) => api.delete(`${BASE_URL}/${id}`),

  /**
   * ✅ Adjust stock for a product in a shop
   * Automatically fetches the latest shop/product prices before adjusting.
   */
  adjustStock: async (data) => {
  try {
    // Step 1️⃣ — Fetch product pricing for this shop
    const priceRes = await api.get(`/shop-stock/shop/${data.shopId}`);
    const shopStockList = priceRes.data || [];

    // Step 2️⃣ — Find this product in the shop stock
    const stockItem = shopStockList.find(
      (item) => item.product?.productId === Number(data.productId)
    );

    // Step 3️⃣ — Use product price if available, else fallback to zero
    const costUSD = stockItem?.product?.sellingPriceUSD || 0;
    const costZWL = stockItem?.product?.sellingPriceZWL || 0;

    // Step 4️⃣ — Send PATCH with correct parameter names expected by backend
   const url = `/shop-stock/adjust?shopId=${data.shopId}&productId=${data.productId}&deltaQty=${data.deltaQty}&costUSD=${costUSD}&costZWL=${costZWL}`;
console.log("📤 PATCH URL:", url); // <- you’ll see exactly what’s sent
const res = await api.patch(url);

    return res.data;
  } catch (err) {
    console.error("❌ Stock adjustment failed:", err);
    throw err;
  }
},
};

export default StockService;