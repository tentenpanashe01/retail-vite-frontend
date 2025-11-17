import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Spinner,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaStore, FaTag } from "react-icons/fa";
import Swal from "sweetalert2";
import ProductService from "../services/products";
import api from "../services/api";

function AdjustPricePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    productId: "",
    shopId: "",
    sellingUSD: "",
    sellingZWL: "",
    reason: "MANUAL",
    adjustmentScope: "GLOBAL",
  });

  useEffect(() => {
    loadProducts();
    loadShops();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await ProductService.getAll();
      setProducts(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load products.", "error");
    }
  };

  const loadShops = async () => {
    try {
      const res = await api.get("/shops");
      setShops(res.data);
    } catch (err) {
      console.error("Failed to load shops:", err);
    }
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p.productId === parseInt(productId));

    setSelectedProduct(product || null);
    setForm({
      ...form,
      productId,
      sellingUSD: product?.sellingPriceUSD || "",
      sellingZWL: product?.sellingPriceZWL || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productId) {
      Swal.fire("Missing Info", "Please select a product.", "warning");
      return;
    }

    if (form.adjustmentScope === "SHOP" && !form.shopId) {
      Swal.fire("Missing Info", "Please select a shop.", "warning");
      return;
    }

    if (!form.sellingUSD && !form.sellingZWL) {
      Swal.fire("Missing Info", "Please enter at least one price.", "warning");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (form.adjustmentScope === "GLOBAL") {
        await ProductService.updateGlobalPricing(
          form.productId,
          parseFloat(form.sellingUSD),
          parseFloat(form.sellingZWL),
          form.reason,
          1
        );
      } else {
        await ProductService.updateShopPricing(
          form.shopId,
          form.productId,
          parseFloat(form.sellingUSD),
          parseFloat(form.sellingZWL),
          form.reason,
          1
        );
      }

      setMessage("✅ Price updated successfully!");
      Swal.fire({
        title: "✅ Price Updated",
        text:
          form.adjustmentScope === "GLOBAL"
            ? `Global price updated for ${selectedProduct?.productName}.`
            : `Price updated for ${selectedProduct?.productName} in selected shop.`,
        icon: "success",
        confirmButtonColor: "#003366",
      });

      navigate("/inventory");
    } catch (err) {
      Swal.fire("❌ Error", "Failed to update product price.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaMoneyBillWave className="me-2" /> Adjust Product Price
        </h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate("/inventory")}
        >
          ← Back
        </Button>
      </div>

      {/* 🔹 Alert Message */}
      {message && (
        <div
          className={`alert-message text-center fw-bold mb-3 ${
            message.startsWith("✅") ? "text-success" : "text-danger"
          }`}
        >
          {message}
        </div>
      )}

      {/* 🔹 Form Card */}
      <Card className="form-card p-4 mb-4">
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Adjustment Scope</Form.Label>
                <Form.Select
                  value={form.adjustmentScope}
                  onChange={(e) =>
                    setForm({ ...form, adjustmentScope: e.target.value })
                  }
                >
                  <option value="GLOBAL">Global (All Shops)</option>
                  <option value="SHOP">Specific Shop</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {form.adjustmentScope === "SHOP" && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select Shop</Form.Label>
                  <Form.Select
                    value={form.shopId}
                    onChange={(e) =>
                      setForm({ ...form, shopId: e.target.value })
                    }
                  >
                    <option value="">Select Shop</option>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shopName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            <Col md={12}>
              <Form.Group>
                <Form.Label>Select Product</Form.Label>
                <Form.Select
                  value={form.productId}
                  onChange={handleProductSelect}
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
            </Col>

            {selectedProduct && (
              <Col md={12}>
                <div className="bg-light border rounded p-3">
                  <strong>Current Prices:</strong>
                  <div>💵 USD: {selectedProduct.sellingPriceUSD?.toFixed(2)}</div>
                  <div>💴 ZWL: {selectedProduct.sellingPriceZWL?.toFixed(2)}</div>
                </div>
              </Col>
            )}

            <Col md={6}>
              <Form.Group>
                <Form.Label>New Price (USD)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaTag />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={form.sellingUSD}
                    onChange={(e) =>
                      setForm({ ...form, sellingUSD: e.target.value })
                    }
                    placeholder="Enter new USD price"
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>New Price (ZWL)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaStore />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={form.sellingZWL}
                    onChange={(e) =>
                      setForm({ ...form, sellingZWL: e.target.value })
                    }
                    placeholder="Enter new ZWL price"
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Reason for Adjustment</Form.Label>
                <Form.Select
                  value={form.reason}
                  onChange={(e) =>
                    setForm({ ...form, reason: e.target.value })
                  }
                >
                  <option value="MANUAL">Manual</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="SUPPLIER_CHANGE">Supplier Change</option>
                  <option value="EXPIRY">Expiry</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button className="btn-save" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Updating...
                </>
              ) : (
                "Update Price"
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default AdjustPricePage;