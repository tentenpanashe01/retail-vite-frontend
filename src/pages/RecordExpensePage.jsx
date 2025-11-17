import React, { useState, useEffect } from "react";
import { Button, Form, Card, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaTags, FaStore } from "react-icons/fa";
import api from "../services/api";
import ExpenseService from "../services/expenses";

function RecordExpensePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopId: "",
    categoryId: "",
    amountUSD: "",
    amountZWL: "",
    description: "",
  });

  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadShops();
    loadCategories();
  }, []);

  const loadShops = async () => {
    try {
      const res = await api.get("/shops");
      setShops(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load shops.", "error");
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/expense-categories");
      setCategories(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load expense categories.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.shopId || !form.categoryId || (!form.amountUSD && !form.amountZWL)) {
      Swal.fire("Missing Info", "Please fill in all required fields.", "warning");
      return;
    }

    const expenseData = {
      shop: { id: parseInt(form.shopId) },
      category: { id: parseInt(form.categoryId) },
      amountUSD: parseFloat(form.amountUSD || 0),
      amountZWL: parseFloat(form.amountZWL || 0),
      description: form.description,
      expenseType: "OPERATIONAL",
      date: new Date().toISOString(),
    };

    try {
      await ExpenseService.createOperational(expenseData);
      Swal.fire("✅ Success", "Operational expense recorded successfully.", "success");
      setMessage("✅ Expense saved successfully!");
      setForm({
        shopId: "",
        categoryId: "",
        amountUSD: "",
        amountZWL: "",
        description: "",
      });
    } catch (err) {
      Swal.fire("❌ Error", "Failed to record expense.", "error");
      setMessage("❌ Failed to record expense.");
    }
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaMoneyBillWave className="me-2" /> Record Operational Expense
        </h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate("/expenses")}
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

      {/* 🔹 Expense Form */}
      <Card className="form-card p-4 mb-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>
              <FaStore className="me-2 text-primary" /> Select Shop
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

          <Form.Group className="mb-4">
            <Form.Label>
              <FaTags className="me-2 text-primary" /> Category
            </Form.Label>
            <Form.Select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Amount (USD)</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                value={form.amountUSD}
                onChange={(e) => setForm({ ...form, amountUSD: e.target.value })}
                placeholder="0.00"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Amount (ZWL)</Form.Label>
            <InputGroup>
              <InputGroup.Text>Z$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                value={form.amountZWL}
                onChange={(e) => setForm({ ...form, amountZWL: e.target.value })}
                placeholder="0.00"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g., Fuel for delivery truck"
            />
          </Form.Group>

          <div className="text-center">
            <Button className="btn-save px-4" type="submit">
              Save Expense
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default RecordExpensePage;