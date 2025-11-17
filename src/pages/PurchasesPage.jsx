import React, { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import PurchaseOrdersService from "../services/purchaseOrders";
import api from "../services/api";
import Swal from "sweetalert2";

export default function PurchasesPage() {
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const shopId = localStorage.getItem("shopId");
  const fullName = localStorage.getItem("fullName");

  useEffect(() => {
    if (!shopId) {
      Swal.fire("Access Restricted", "No shop assigned to this user.", "error");
      return;
    }
    loadShop();
    loadOrdersForShop();
  }, [shopId]);

  const loadShop = async () => {
    try {
      const res = await api.get(`/shops/${shopId}`);
      setShop(res.data);
    } catch (err) {
      console.error("Shop load error:", err);
      Swal.fire("Error", "Unable to load shop information.", "error");
    }
  };

  const loadOrdersForShop = async () => {
    try {
      setLoading(true);
      const res = await PurchaseOrdersService.getByShop(shopId);
      console.log("📦 Purchase Orders:", res.data);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load purchase orders:", err);
      Swal.fire("Error", "Failed to load purchase orders for this shop.", "error");
    } finally {
      setLoading(false);
    }
  };

  // View specific order when a row is clicked
  const viewOrder = (orderId) => {
    window.location.href = `/purchase-orders/view/${orderId}`;
  };

  return (
    <div className="theme-retail">
      <div className="container mt-4" style={{ minHeight: "90vh" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="text-primary mb-1">🛒 Purchases</h3>
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
          <Button variant="outline-secondary" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <Button
            variant="primary"
            href={`/purchase-orders/create?shopId=${shopId}`}
            style={{
              flex: "1",
              minWidth: "200px",
              fontWeight: 500,
              background: "#003366",
              border: "none",
            }}
          >
            ➕ Create Purchase Order
          </Button>

          <Button
            variant="primary"
            href={`/purchase-orders/items/add?shopId=${shopId}`}
            style={{
              flex: "1",
              minWidth: "200px",
              fontWeight: 500,
              background: "#003366",
              border: "none",
            }}
          >
            🧾 Add Purchase Items
          </Button>

          <Button
            variant="primary"
            href={`/purchase-orders/expenses/add?shopId=${shopId}`}
            style={{
              flex: "1",
              minWidth: "200px",
              fontWeight: 500,
              background: "#003366",
              border: "none",
            }}
          >
            💰 Record Purchase Expenses
          </Button>
        </div>

        {/* Orders Table */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h5 className="text-primary mb-3">📦 Purchase Orders for this Shop</h5>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted text-center py-3">
              No purchase orders found for this shop.
            </p>
          ) : (
            <Table striped bordered hover responsive>
              <thead style={{ background: "#003366", color: "#fff" }}>
                <tr>
                  <th>#</th>
                  <th>Order No.</th>
                  <th>Supplier</th>
                  <th>Total (USD)</th>
                  <th>Status</th>
                  <th>Order Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={o.purchaseOrderId || i}
                    onClick={() => viewOrder(o.purchaseOrderId)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{i + 1}</td>
                    <td>{o.orderNumber || `PO-${o.purchaseOrderId}`}</td>
                    <td>{o.supplierName || "—"}</td>
                    <td>
                      {o.totalCostUSD
                        ? `$${o.totalCostUSD.toFixed(2)}`
                        : o.totalCostZWL
                        ? `${o.totalCostZWL.toLocaleString()} ZWL`
                        : "—"}
                    </td>
                    <td
                      style={{
                        color:
                          o.status === "COMPLETED"
                            ? "green"
                            : o.status === "PENDING"
                            ? "#d19a00"
                            : "gray",
                        fontWeight: 600,
                      }}
                    >
                      {o.status || "UNKNOWN"}
                    </td>
                    <td>
                      {o.orderDate
                        ? new Date(o.orderDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}