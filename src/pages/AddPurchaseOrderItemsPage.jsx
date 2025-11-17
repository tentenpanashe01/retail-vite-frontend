import React, { useState, useEffect } from "react";
import { Button, Form, Card, Table, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PurchaseOrdersService from "../services/purchaseOrders";
import PurchaseOrderItemsService from "../services/purchaseOrderItems";
import api from "../services/api";

function AddPurchaseOrderItemsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orderId: "",
    productId: "",
    quantity: "",
    unitUSD: "",
    unitZWL: "",
  });

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);

  const shopId = localStorage.getItem("shopId");
  const fullName = localStorage.getItem("fullName");

  // 🔹 Load initial data
  useEffect(() => {
    if (!shopId) {
      Swal.fire("Access Restricted", "No shop assigned to this user.", "error");
      return;
    }
    loadShop();
    loadPendingOrdersForShop();
    loadProducts();
  }, [shopId]);

  // 🔹 Load shop details
  const loadShop = async () => {
    try {
      const res = await api.get(`/shops/${shopId}`);
      setShop(res.data);
    } catch (err) {
      Swal.fire("Error", "Unable to load shop details.", "error");
    }
  };

  // 🔹 Load pending orders for this shop only
  const loadPendingOrdersForShop = async () => {
    try {
      setLoading(true);
      const res = await PurchaseOrdersService.getByShop(shopId);
      const pending = (res.data || []).filter((o) => o.status === "PENDING");
      setOrders(pending);
    } catch (err) {
      Swal.fire("Error", "Failed to load purchase orders.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load all products
  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load products.", "error");
    }
  };

  // 🔹 Load order items for selected order
  const loadOrderItems = async (orderId) => {
    try {
      const res = await PurchaseOrderItemsService.getByOrder(orderId);
      setOrderItems(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load order items.", "error");
    }
  };

  // 🔹 Handle order select
  const handleOrderSelect = (orderId) => {
    setForm({ ...form, orderId });
    setSelectedOrder(orderId);
    loadOrderItems(orderId);
  };

  // 🔹 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderId || !form.productId || !form.quantity) {
      Swal.fire("Missing Info", "Please fill all required fields.", "warning");
      return;
    }

    const itemData = {
      purchaseOrder: { purchaseOrderId: parseInt(form.orderId) },
      product: { productId: parseInt(form.productId) },
      quantity: parseInt(form.quantity),
      unitPurchasePriceUSD: parseFloat(form.unitUSD || 0),
      unitPurchasePriceZWL: parseFloat(form.unitZWL || 0),
    };

    try {
      await PurchaseOrderItemsService.create(itemData);
      Swal.fire("✅ Added", "Item added successfully!", "success");
      loadOrderItems(form.orderId);
      setForm({ ...form, productId: "", quantity: "", unitUSD: "", unitZWL: "" });
    } catch (err) {
      Swal.fire("❌ Error", "Failed to add item.", "error");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "950px" }}>
      <Card
        className="shadow-lg border-0 p-4"
        style={{
          background: "#fff",
          borderRadius: "10px",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="text-primary mb-1">🧾 Add Purchase Order Items</h3>
            <small className="text-muted">
              {fullName && `Welcome, ${fullName}`} <br />
              {shop ? (
                <>
                  Adding items for shop:{" "}
                  <strong className="text-dark">{shop.shopName}</strong>
                </>
              ) : (
                "Loading shop..."
              )}
            </small>
          </div>
          <Button variant="outline-secondary" onClick={() => navigate("/purchases")}>
            ← Back
          </Button>
        </div>

        {/* Pending Orders Selection */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold text-dark">
            Select Pending Order
          </Form.Label>
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Form.Select
              value={form.orderId}
              onChange={(e) => handleOrderSelect(e.target.value)}
              required
            >
              <option value="">Select Order</option>
              {orders.length > 0 ? (
                orders.map((o) => (
                  <option key={o.purchaseOrderId} value={o.purchaseOrderId}>
                    {o.orderNumber || `PO-${o.purchaseOrderId}`} —{" "}
                    {o.supplier?.supplierName || "Unknown Supplier"}
                  </option>
                ))
              ) : (
                <option disabled>No pending orders for this shop</option>
              )}
            </Form.Select>
          )}
        </Form.Group>

        {selectedOrder && (
          <>
            {/* Add Item Form */}
            <Form onSubmit={handleSubmit} className="mb-4">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <Form.Label>Product</Form.Label>
                  <Form.Select
                    value={form.productId}
                    onChange={(e) =>
                      setForm({ ...form, productId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.productId} value={p.productId}>
                        {p.productName}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className="col-md-2">
                  <Form.Label>Qty</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-2">
                  <Form.Label>Unit USD</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.unitUSD}
                    onChange={(e) =>
                      setForm({ ...form, unitUSD: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="col-md-2">
                  <Form.Label>Unit ZWL</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.unitZWL}
                    onChange={(e) =>
                      setForm({ ...form, unitZWL: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="col-md-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 fw-semibold"
                    style={{ background: "#003366", border: "none" }}
                  >
                    + Add
                  </Button>
                </div>
              </div>
            </Form>

            {/* Items Table */}
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <Table bordered hover responsive className="mb-0">
                <thead style={{ background: "#003366", color: "#fff" }}>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit USD</th>
                    <th>Unit ZWL</th>
                    <th>Total USD</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No items added yet.
                      </td>
                    </tr>
                  ) : (
                    orderItems.map((item, index) => (
                      <tr key={item.purchaseOrderItemId}>
                        <td>{index + 1}</td>
                        <td>{item.product?.productName}</td>
                        <td>{item.quantity}</td>
                        <td>${item.unitPurchasePriceUSD?.toFixed(2)}</td>
                        <td>{item.unitPurchasePriceZWL?.toFixed(2)}</td>
                        <td className="fw-semibold text-primary">
                          ${(item.totalCostUSD || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AddPurchaseOrderItemsPage;