import React, { useState, useEffect } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { FaClipboardList, FaStore, FaUserTie } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PurchaseOrdersService from "../services/purchaseOrders";

function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ supplierName: "", shopId: "" });
  const [shops, setShops] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const res = await api.get("/shops");
      setShops(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load shops.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplierName || !form.shopId) {
      Swal.fire("Missing Info", "Please fill in all required fields.", "warning");
      return;
    }

    const orderData = {
      supplierName: form.supplierName,
      orderDate: new Date().toISOString(),
      status: "PENDING",
      shop: { id: parseInt(form.shopId) },
    };

    try {
      await PurchaseOrdersService.create(orderData);
      Swal.fire("✅ Success", "Purchase order created (Pending).", "success");
      setForm({ supplierName: "", shopId: "" });
      setMessage("✅ Purchase order successfully created!");
    } catch (err) {
      Swal.fire("❌ Error", "Failed to create purchase order.", "error");
      setMessage("❌ Failed to create purchase order.");
    }
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaClipboardList className="me-2" /> Create Purchase Order
        </h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate("/purchases")}
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
          <Form.Group className="mb-4">
            <Form.Label>
              <FaUserTie className="me-2 text-primary" />
              Supplier Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter supplier name"
              value={form.supplierName}
              onChange={(e) =>
                setForm({ ...form, supplierName: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>
              <FaStore className="me-2 text-primary" />
              Shop
            </Form.Label>
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

          <div className="text-center">
            <Button className="btn-save px-4" type="submit">
              Create Order
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default CreatePurchaseOrderPage;