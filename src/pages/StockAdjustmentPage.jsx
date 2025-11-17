import React, { useState, useEffect } from "react";
import { Form, Button, Card, Spinner, Badge } from "react-bootstrap";
import { FaBalanceScale, FaBoxes } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../services/api";
import StockService from "../services/stock";
import { useNavigate } from "react-router-dom";

function StockAdjustmentPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(null); 
  const [form, setForm] = useState({
    productId: "",
    shopId: "",
    quantity: "",
    transactionType: "ADJUSTMENT",
    reason: "",
    unitCostUSD: "",
    unitCostZWL: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Load products and shops
  const loadData = async () => {
    try {
      setLoading(true);
      const [productRes, shopRes] = await Promise.all([
        api.get("/products"),
        api.get("/shops"),
      ]);
      setProducts(productRes.data);
      setShops(shopRes.data);
    } catch {
      Swal.fire("Error", "Failed to load products or shops.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-fetch product price and stock quantity when product or shop changes
  useEffect(() => {
    if (form.shopId && form.productId) {
      fetchShopProductPriceAndStock(form.shopId, form.productId);
    }
  }, [form.shopId, form.productId]);

  // ✅ Fetch both prices and current stock for selected shop & product
  const fetchShopProductPriceAndStock = async (shopId, productId) => {
    try {
      const res = await api.get(`/shop-stock/shop/${shopId}`);
      const stockItems = res.data || [];

      // Find the selected product’s stock data for this shop
      const stockItem = stockItems.find(
        (item) => item.product?.productId === Number(productId)
      );

      if (stockItem && stockItem.product) {
        // ✅ Product exists in that shop → use shop-level data
        setForm((prev) => ({
          ...prev,
          unitCostUSD: stockItem.product.sellingPriceUSD || 0,
          unitCostZWL: stockItem.product.sellingPriceZWL || 0,
        }));
        setCurrentStock(stockItem.quantityInStock ?? 0);
      } else {
        // ✅ Product not yet in that shop → fallback to global product data
        const prod = products.find((p) => p.productId === Number(productId));
        if (prod) {
          setForm((prev) => ({
            ...prev,
            unitCostUSD: prod.sellingPriceUSD || 0,
            unitCostZWL: prod.sellingPriceZWL || 0,
          }));
        }
        setCurrentStock(0); // new product → no stock yet
      }
    } catch (err) {
      console.error("Error fetching shop product data:", err);
      Swal.fire("Error", "Failed to fetch product data for shop.", "error");
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productId || !form.shopId || !form.quantity) {
      Swal.fire("Missing Info", "Please complete all required fields.", "warning");
      return;
    }

    try {
     await StockService.adjustStock({
  productId: form.productId,
  shopId: form.shopId,
  deltaQty: parseFloat(form.quantity), 
  transactionType: form.transactionType,
  reason: form.reason || "Manual adjustment",
  referenceId: "ADJ-" + new Date().getTime(),
  unitCostUSD: parseFloat(form.unitCostUSD || 0),
  unitCostZWL: parseFloat(form.unitCostZWL || 0),
});

      Swal.fire("✅ Success", "Stock adjustment recorded successfully.", "success");
      navigate("/inventory");
    } catch (err) {
      Swal.fire("❌ Error", "Failed to record stock adjustment.", "error");
    }
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaBalanceScale className="me-2" /> Adjust Stock
        </h3>
        <Button variant="outline-light" size="sm" onClick={() => navigate("/inventory")}>
          ← Back
        </Button>
      </div>

      {/* 🔹 Form Section */}
      <Card className="form-card mt-4 p-4 shadow-sm border-0">
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" />
            <p className="mt-2 text-muted">Loading data...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* Shop */}
            <Form.Group className="mb-3">
              <Form.Label>Shop</Form.Label>
              <Form.Select
                value={form.shopId}
                onChange={(e) => setForm({ ...form, shopId: e.target.value })}
                required
              >
                <option value="">Select Shop</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shopName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Product */}
            <Form.Group className="mb-3">
              <Form.Label>Product</Form.Label>
              <Form.Select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* 🔹 Show current stock */}
            {currentStock !== null && (
              <div className="mb-3 text-muted">
                <FaBoxes className="me-1 text-secondary" />
                <strong>Current Stock:</strong>{" "}
                <Badge bg={currentStock > 0 ? "success" : "danger"}>
                  {currentStock} units
                </Badge>
              </div>
            )}

            {/* Quantity Change */}
            <Form.Group className="mb-3">
              <Form.Label>Quantity Change (+/-)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Use negative value to reduce stock"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </Form.Group>

            {/* Reason */}
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Damage correction or stocktake adjustment"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </Form.Group>

            {/* Unit Costs (auto-filled) */}
            <Form.Group className="mb-3">
              <Form.Label>Unit Cost (USD)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={form.unitCostUSD}
                onChange={(e) => setForm({ ...form, unitCostUSD: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unit Cost (ZWL)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={form.unitCostZWL}
                onChange={(e) => setForm({ ...form, unitCostZWL: e.target.value })}
              />
            </Form.Group>

            {/* Submit */}
            <div className="text-center mt-4">
              <Button type="submit" className="btn-save">
                Save Adjustment
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}

export default StockAdjustmentPage;