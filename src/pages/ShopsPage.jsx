import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Card, Table, Spinner } from "react-bootstrap";
import { FaStore, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import ShopService from "../services/shops";
import AlertHelper from "../utils/AlertHelper";

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ shopName: "", location: "", contactNumber: "" });
  const [editId, setEditId] = useState(null);

  const loadShops = async () => {
    try {
      setLoading(true);
      const res = await ShopService.getAll();
      setShops(res.data);
    } catch {
      AlertHelper.error("Load Error", "Failed to load shops!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleSave = async () => {
    try {
      if (editId) {
        await ShopService.update(editId, form);
        AlertHelper.success("Shop Updated", "The shop was updated successfully.");
      } else {
        await ShopService.create(form);
        AlertHelper.success("Shop Created", "The new shop was added successfully!");
      }
      setShow(false);
      setForm({ shopName: "", location: "", contactNumber: "" });
      setEditId(null);
      loadShops();
    } catch (err) {
      if (err.response && (err.response.status === 409 || err.response.status === 400)) {
        AlertHelper.warning("Duplicate Shop", "A shop with this name already exists!");
      } else {
        AlertHelper.error("Save Failed", "Unable to save shop. Please try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await AlertHelper.confirmDelete("shop");
    if (result.isConfirmed) {
      try {
        await ShopService.delete(id);
        AlertHelper.success("Deleted!", "Shop deleted successfully!");
        loadShops();
      } catch {
        AlertHelper.error("Delete Failed", "Could not delete this shop.");
      }
    }
  };

  const handleEdit = (shop) => {
    setForm(shop);
    setEditId(shop.id);
    setShow(true);
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaStore className="me-2" /> Shop Management
        </h3>
        <Button className="btn-save d-flex align-items-center gap-2" onClick={() => setShow(true)}>
          <FaPlus /> Add Shop
        </Button>
      </div>

      {/* 🔹 Shops Table */}
      <Card className="list-card mt-4 shadow-sm border-0">
        <Card.Header className="list-header d-flex align-items-center">
          <FaStore className="me-2 text-white" />
          <h5 className="mb-0 text-white">Registered Shops</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2 mb-0">Loading shops...</p>
            </div>
          ) : shops.length === 0 ? (
            <p className="text-center text-muted py-3 mb-0">No shops found.</p>
          ) : (
            <Table hover responsive className="m-0 text-center align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Shop Name</th>
                  <th>Location</th>
                  <th>Contact Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.shopName}</td>
                    <td>{s.location}</td>
                    <td>{s.contactNumber}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-warning"
                        className="me-2"
                        onClick={() => handleEdit(s)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(s.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* 🔹 Add/Edit Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Shop" : "Add New Shop"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Shop Name</Form.Label>
              <Form.Control
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                placeholder="e.g., Main Branch"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Harare CBD"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="e.g., +263 77 123 4567"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button className="btn-save" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}