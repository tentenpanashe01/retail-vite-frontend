import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Button, Form, Card, Table, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PurchaseExpensesService from "../services/purchaseExpenses";
import PurchaseOrdersService from "../services/purchaseOrders";

function AddPurchaseOrderExpensesPage() {
  const [form, setForm] = useState({
    orderId: "",
    categoryId: "",
    amountUSD: "",
    amountZWL: "",
    description: "",
  });

  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const shopId = localStorage.getItem("shopId");
  const fullName = localStorage.getItem("fullName");

  // ✅ Load shop, orders, and categories when the page mounts
  useEffect(() => {
    if (!shopId) {
      Swal.fire("Access Restricted", "No shop assigned to this user.", "error");
      return;
    }
    loadShop();
    loadPendingOrdersForShop();
    loadCategories();
  }, [shopId]);

  // ✅ Load current shop details
  const loadShop = async () => {
    try {
      const res = await api.get(`/shops/${shopId}`);
      setShop(res.data);
    } catch {
      Swal.fire("Error", "Unable to load shop details.", "error");
    }
  };

  // ✅ Load pending orders for this shop
  const loadPendingOrdersForShop = async () => {
    try {
      setLoading(true);
      const res = await PurchaseOrdersService.getByShop(shopId);
      const pending = (res.data || []).filter((o) => o.status === "PENDING");
      setOrders(pending);
    } catch {
      Swal.fire("Error", "Failed to load purchase orders.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load expense categories
  const loadCategories = async () => {
    try {
      const res = await api.get("/expense-categories");
      setCategories(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load expense categories.", "error");
    }
  };

  // ✅ Load items and expenses when an order is selected
  useEffect(() => {
    if (form.orderId) {
      loadOrderItems(form.orderId);
      loadExpenses(form.orderId);
    }
  }, [form.orderId]);

  // ✅ Load purchased items (view only)
  const loadOrderItems = async (orderId) => {
    try {
      const res = await api.get(`/purchase-orders/${orderId}/items`);
      setItems(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load purchased items for this order.", "error");
    }
  };

  // ✅ Load order expenses
  const loadExpenses = async (orderId) => {
    try {
      const res = await PurchaseExpensesService.getByOrder(orderId);
      setExpenses(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load expenses for this order.", "error");
    }
  };

  // ✅ Add new expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.orderId || !form.categoryId || (!form.amountUSD && !form.amountZWL)) {
      Swal.fire("Missing Info", "Please fill in all required fields.", "warning");
      return;
    }

    const expenseData = {
      purchaseOrder: { purchaseOrderId: parseInt(form.orderId) },
      category: { id: parseInt(form.categoryId) },
      amountUSD: parseFloat(form.amountUSD || 0),
      amountZWL: parseFloat(form.amountZWL || 0),
      description: form.description,
      expenseType: "PURCHASE",
      date: new Date().toISOString(),
    };

    try {
      await PurchaseExpensesService.create(expenseData);
      Swal.fire("✅ Success", "Expense added to purchase order.", "success");
      setForm({
        ...form,
        categoryId: "",
        amountUSD: "",
        amountZWL: "",
        description: "",
      });
      loadExpenses(form.orderId);
    } catch {
      Swal.fire("❌ Error", "Failed to add expense.", "error");
    }
  };

  // ✅ Mark order as complete
  const markComplete = async () => {
    if (!form.orderId) {
      Swal.fire("Select Order", "Please choose an order first.", "info");
      return;
    }

    try {
      await PurchaseOrdersService.markComplete(form.orderId);
      Swal.fire("✅ Success", "Order marked as complete.", "success");
      setForm({
        orderId: "",
        categoryId: "",
        amountUSD: "",
        amountZWL: "",
        description: "",
      });
      setExpenses([]);
      setItems([]);
      loadPendingOrdersForShop();
    } catch (err) {
      const message =
        err.response?.data ||
        "Unable to complete order. Ensure items and expenses are recorded first.";
      Swal.fire("⚠️ Cannot Complete", message, "warning");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "950px" }}>
      <Card className="p-4 shadow-lg border-0" style={{ borderRadius: "10px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="text-primary mb-1">💰 Add Purchase Order Expenses</h3>
            <small className="text-muted">
              {fullName && `Welcome, ${fullName}`} <br />
              {shop ? (
                <>
                  Managing purchases for:{" "}
                  <strong className="text-dark">{shop.shopName}</strong>
                </>
              ) : (
                "Loading shop..."
              )}
            </small>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate("/purchases")}
          >
            ← Back
          </Button>
        </div>

        {/* Select Order */}
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
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              required
            >
              <option value="">Select Order</option>
              {orders.length > 0 ? (
                orders.map((o) => (
                  <option key={o.purchaseOrderId} value={o.purchaseOrderId}>
                    {o.orderNumber || `PO-${o.purchaseOrderId}`} —{" "}
                    {o.supplierName || "Unknown Supplier"}
                  </option>
                ))
              ) : (
                <option disabled>No pending orders for this shop</option>
              )}
            </Form.Select>
          )}
        </Form.Group>

        {/* ✅ Purchased Items Table */}
        {form.orderId && (
          <>
            <h5 className="mt-4 mb-3 text-dark">🧾 Purchased Items (View Only)</h5>
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                marginBottom: "1rem",
              }}
            >
              <Table bordered hover responsive className="mb-0">
                <thead style={{ background: "#003366", color: "#fff" }}>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Cost (USD)</th>
                    <th>Total Cost (USD)</th>
                    <th>Unit Cost (ZWL)</th>
                    <th>Total Cost (ZWL)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-3">
                        No items found for this order.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.purchaseOrderItemId || index}>
                        <td>{index + 1}</td>
                        <td>{item.product?.productName || "-"}</td>
                        <td>{item.quantity}</td>
                        <td>${item.unitCostUSD?.toFixed(2) || "0.00"}</td>
                        <td>${item.totalCostUSD?.toFixed(2) || "0.00"}</td>
                        <td>{item.unitCostZWL?.toFixed(2) || "0.00"}</td>
                        <td>{item.totalCostZWL?.toFixed(2) || "0.00"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}

        {/* ✅ Expense Form */}
        {form.orderId && (
          <>
            <Form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className="col-md-2">
                  <Form.Label>USD</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.amountUSD}
                    onChange={(e) =>
                      setForm({ ...form, amountUSD: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="col-md-2">
                  <Form.Label>ZWL</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.amountZWL}
                    onChange={(e) =>
                      setForm({ ...form, amountZWL: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="col-md-4">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="e.g., Transport, Customs Duty"
                  />
                </div>
              </div>

              <div className="text-end mt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 fw-semibold"
                  style={{ background: "#003366", border: "none" }}
                >
                  ➕ Add Expense
                </Button>
              </div>
            </Form>

            {/* ✅ Expense List */}
            <div
              className="mt-4"
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
                    <th>Category</th>
                    <th>USD</th>
                    <th>ZWL</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-3">
                        No expenses recorded for this order yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((ex, index) => (
                      <tr key={ex.expenseId || index}>
                        <td>{index + 1}</td>
                        <td>{ex.category?.name}</td>
                        <td>${ex.amountUSD?.toFixed(2)}</td>
                        <td>{ex.amountZWL?.toFixed(2)}</td>
                        <td>{ex.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* ✅ Complete Button */}
            <div className="text-center mt-4">
              <Button
                variant="success"
                size="lg"
                onClick={markComplete}
                style={{
                  fontWeight: "600",
                  background: "green",
                  border: "none",
                  padding: "10px 30px",
                }}
              >
                ✅ Mark Order as Complete
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AddPurchaseOrderExpensesPage;