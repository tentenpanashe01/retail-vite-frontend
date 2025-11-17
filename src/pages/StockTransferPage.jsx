import React, { useState, useEffect } from "react";
import { Form, Button, Card, Spinner } from "react-bootstrap";
import { FaExchangeAlt, FaStore, FaBox } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import StockTransferService from "../services/stockTransfer";

function StockTransferPage() {
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fromShopId: "",
    toShopId: "",
    productId: "",
    quantity: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shopsRes, productsRes] = await Promise.all([
        api.get("/shops"),
        api.get("/products"),
      ]);
      setShops(shopsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      Swal.fire("❌ Error", "Failed to load shop or product data.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fromShopId || !form.toShopId || !form.productId || !form.quantity) {
      Swal.fire("Missing Info", "Please fill all required fields.", "warning");
      return;
    }

    if (form.fromShopId === form.toShopId) {
      Swal.fire("⚠️ Invalid Selection", "Source and destination shops cannot be the same.", "warning");
      return;
    }

    setLoading(true);

    try {
      await StockTransferService.create(
        form.fromShopId,
        form.toShopId,
        form.productId,
        form.quantity
      );

      Swal.fire({
        title: "✅ Transfer Created",
        text: "Stock transfer initiated successfully.",
        icon: "success",
        confirmButtonColor: "#003366",
      });

      setForm({ fromShopId: "", toShopId: "", productId: "", quantity: "" });
      navigate("/inventory");
    } catch (err) {
      console.error("Transfer Error:", err);
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Unknown error";

      if (
        backendMessage.toLowerCase().includes("insufficient") ||
        backendMessage.toLowerCase().includes("not enough stock")
      ) {
        Swal.fire({
          title: "⚠️ Insufficient Stock",
          text:
            "The source shop does not have enough stock for this transfer. Please adjust the quantity.",
          icon: "warning",
          confirmButtonColor: "#d32f2f",
        });
      } else {
        Swal.fire("❌ Error", backendMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaExchangeAlt className="me-2" /> Transfer Stock
        </h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate("/inventory")}
        >
          ← Back
        </Button>
      </div>

      {/* 🔹 Transfer Form */}
      <Card className="form-card mt-4 p-4 shadow-sm border-0">
        <Form onSubmit={handleSubmit}>
          {/* From Shop */}
          <Form.Group className="mb-3">
            <Form.Label>
              <FaStore className="me-1 text-secondary" /> From Shop
            </Form.Label>
            <Form.Select
              value={form.fromShopId}
              onChange={(e) => setForm({ ...form, fromShopId: e.target.value })}
              required
            >
              <option value="">Select Source Shop</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* To Shop */}
          <Form.Group className="mb-3">
            <Form.Label>
              <FaStore className="me-1 text-secondary" /> To Shop
            </Form.Label>
            <Form.Select
              value={form.toShopId}
              onChange={(e) => setForm({ ...form, toShopId: e.target.value })}
              required
            >
              <option value="">Select Destination Shop</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Product */}
          <Form.Group className="mb-3">
            <Form.Label>
              <FaBox className="me-1 text-secondary" /> Product
            </Form.Label>
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

          {/* Quantity */}
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min="1"
              placeholder="Enter quantity to transfer"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </Form.Group>

          {/* Submit */}
          <div className="text-center mt-4">
            <Button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Processing...
                </>
              ) : (
                "Initiate Transfer"
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default StockTransferPage;