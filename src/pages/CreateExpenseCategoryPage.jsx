import React, { useState, useEffect } from "react";
import { Button, Form, Table, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaTags, FaEdit, FaTrashAlt } from "react-icons/fa";
import api from "../services/api";

function CreateExpenseCategoryPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/expense-categories");
      setCategories(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load categories.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      Swal.fire("Missing Info", "Category name is required.", "warning");
      return;
    }

    try {
      if (editId) {
        await api.put(`/expense-categories/${editId}`, form);
        Swal.fire("✅ Updated!", "Category updated successfully.", "success");
      } else {
        await api.post("/expense-categories", form);
        Swal.fire("✅ Created!", "Category created successfully.", "success");
      }

      setForm({ name: "", description: "" });
      setEditId(null);
      loadCategories();
      setMessage("✅ Operation successful!");
    } catch (err) {
      if (err.response?.status === 500) {
        Swal.fire("Duplicate!", "Category name already exists.", "warning");
      } else {
        Swal.fire("Error", "Failed to save category.", "error");
      }
      setMessage("❌ Failed to save category.");
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description });
    setEditId(cat.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the category.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/expense-categories/${id}`);
        Swal.fire("Deleted!", "Category deleted successfully.", "success");
        loadCategories();
      } catch {
        Swal.fire("Error", "Failed to delete category.", "error");
      }
    }
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaTags className="me-2" />{" "}
          {editId ? "Edit Expense Category" : "Create Expense Category"}
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

      {/* 🔹 Form Card */}
      <Card className="form-card p-4 mb-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Fuel, Rent, Customs Duty"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Form.Group>

          <div className="text-center">
            <Button className="btn-save" type="submit">
              {editId ? "Update Category" : "Save Category"}
            </Button>
          </div>
        </Form>
      </Card>

      {/* 🔹 Categories List */}
      <Card className="list-card shadow-sm border-0">
        <Card.Header className="list-header d-flex justify-content-between align-items-center">
          <h5>📋 Existing Categories</h5>
        </Card.Header>

        <Card.Body className="p-0">
          <Table hover responsive className="m-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>{cat.name}</td>
                    <td>{cat.description || "-"}</td>
                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(cat)}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <FaTrashAlt /> Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CreateExpenseCategoryPage;