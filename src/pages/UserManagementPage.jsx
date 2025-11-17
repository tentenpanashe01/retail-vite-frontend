import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { FaUsersCog, FaUserPlus } from "react-icons/fa";
import api from "../services/api";
import Swal from "sweetalert2";

const ROLE_OPTIONS = [
  { value: "ROLE_CASHIER", label: "Cashier" },
  { value: "ROLE_SUPERVISOR", label: "Supervisor" },
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_SUPERADMIN", label: "Super Admin" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    roles: ["ROLE_CASHIER"],
    shopId: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchShops();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const res = await api.get("/shops");
      setShops(res.data || []);
    } catch {
      setShops([]);
    }
  };

  const handleRoleToggle = (roleValue) => {
    setForm((prev) => {
      const exists = prev.roles.includes(roleValue);
      const roles = exists
        ? prev.roles.filter((r) => r !== roleValue)
        : [...prev.roles, roleValue];
      return { ...prev, roles };
    });
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({
        fullName: user.fullName || "",
        username: user.username || "",
        password: "",
        roles: Array.isArray(user.roles) ? user.roles : [],
        shopId: user.shop?.shopId || user.shop?.id || "",
      });
    } else {
      setEditingUser(null);
      setForm({
        fullName: "",
        username: "",
        password: "",
        roles: ["ROLE_CASHIER"],
        shopId: "",
      });
    }
    setShowModal(true);
  };

  const requireShop = (roles) =>
    roles.includes("ROLE_CASHIER") || roles.includes("ROLE_SUPERVISOR");

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.username.trim()) {
      Swal.fire("Missing Info", "Full name and username are required.", "warning");
      return;
    }
    if (!editingUser && !form.password) {
      Swal.fire("Missing Info", "Password is required for new users.", "warning");
      return;
    }
    if (!form.roles.length) {
      Swal.fire("Missing Info", "Select at least one role.", "warning");
      return;
    }
    if (requireShop(form.roles) && !form.shopId) {
      Swal.fire("Missing Info", "Cashier/Supervisor must be assigned to a shop.", "warning");
      return;
    }

    const payload = {
      fullName: form.fullName,
      username: form.username,
      roles: form.roles,
      ...(form.password ? { password: form.password } : {}),
      ...(form.shopId ? { shopId: Number(form.shopId) } : { shopId: null }),
    };

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.userId}`, payload);
        Swal.fire("✅ Updated", "User updated successfully", "success");
      } else {
        await api.post("/users", payload);
        Swal.fire("✅ Created", "User added successfully", "success");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save user";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete user?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d32f2f",
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/users/${id}`);
      Swal.fire("Deleted", "User removed successfully", "success");
      fetchUsers();
    } catch {
      Swal.fire("Error", "Failed to delete user", "error");
    }
  };

  const handleResetPassword = async (user) => {
    const { isConfirmed } = await Swal.fire({
      title: "Reset Password?",
      text: `Reset password for ${user.username}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, reset it",
    });

    if (!isConfirmed) return;

    try {
      const res = await api.put(`/users/${user.userId}/reset-password`);
      const tempPassword = res.data?.temporaryPassword || "N/A";
      Swal.fire({
        icon: "success",
        title: "Password Reset",
        html: `<p>Password for <b>${user.username}</b> has been reset.</p>
               <p><b>Temporary Password:</b> <code>${tempPassword}</code></p>`,
      });
    } catch {
      Swal.fire("Error", "Failed to reset password", "error");
    }
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaUsersCog className="me-2" /> User Management
        </h3>
        <Button className="btn-save" onClick={() => openModal()}>
          <FaUserPlus className="me-2" /> Add User
        </Button>
      </div>

      {/* 🔹 Users Table */}
      <Card className="list-card mt-4 shadow-sm border-0">
        <Card.Header className="list-header d-flex align-items-center">
          <FaUsersCog className="me-2 text-white" />
          <h5 className="mb-0 text-white">System Users</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="light" />
            </div>
          ) : (
            <Table hover responsive className="m-0 text-center align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Roles</th>
                  <th>Shop</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((u, i) => (
                    <tr key={u.userId}>
                      <td>{i + 1}</td>
                      <td>{u.fullName}</td>
                      <td>{u.username}</td>
                      <td>
                        {u.roles?.map((r) => (
                          <Badge key={r} bg="secondary" className="me-1">
                            {ROLE_OPTIONS.find((o) => o.value === r)?.label || r}
                          </Badge>
                        ))}
                      </td>
                      <td>{u.shop?.shopName || "—"}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-light"
                          className="me-2"
                          onClick={() => openModal(u)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          className="me-2"
                          onClick={() => handleResetPassword(u)}
                        >
                          🔑 Reset
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(u.userId)}
                        >
                          🗑 Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* 🔹 Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? "✏️ Edit User" : "➕ Add New User"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {editingUser ? "New Password (optional)" : "Password"}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder={
                      editingUser ? "Leave blank to keep current" : ""
                    }
                    required={!editingUser}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Roles</Form.Label>
              <div className="d-flex flex-wrap" style={{ gap: "8px 16px" }}>
                {ROLE_OPTIONS.map((opt) => (
                  <Form.Check
                    key={opt.value}
                    type="checkbox"
                    label={opt.label}
                    checked={form.roles.includes(opt.value)}
                    onChange={() => handleRoleToggle(opt.value)}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Shop{" "}
                {requireShop(form.roles) ? (
                  <span className="text-danger">*</span>
                ) : (
                  <span className="text-muted">(optional)</span>
                )}
              </Form.Label>
              <Form.Select
                value={form.shopId}
                onChange={(e) => setForm({ ...form, shopId: e.target.value })}
                disabled={!requireShop(form.roles) && !form.shopId}
              >
                <option value="">— No Shop —</option>
                {shops.map((s) => (
                  <option key={s.shopId || s.id} value={s.shopId || s.id}>
                    {s.shopName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="text-center mt-3">
              <Button type="submit" className="btn-save">
                💾 Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}