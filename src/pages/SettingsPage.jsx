import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsersCog, FaCogs } from "react-icons/fa";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaCogs className="me-2" /> System Settings
        </h3>
      </div>

      {/* 🔹 Settings Options */}
      <div
        className="d-flex flex-wrap gap-3 mt-4"
        style={{ justifyContent: "center" }}
      >
        {/* 👥 User Management */}
        <Card
          className="summary-card total text-center p-4 shadow-sm"
          style={{ width: "260px" }}
        >
          <FaUsersCog size={36} className="mb-3 text-primary" />
          <h5 className="mb-2">User Management</h5>
          <p className="text-muted small mb-3">
            Manage users, assign roles, and control access permissions.
          </p>
          <Button
            className="btn-save w-100"
            onClick={() => navigate("/settings/users")}
          >
            Open
          </Button>
        </Card>

        {/* ⚙ Configuration */}
        <Card
          className="summary-card completed text-center p-4 shadow-sm"
          style={{ width: "260px" }}
        >
          <FaCogs size={36} className="mb-3 text-primary" />
          <h5 className="mb-2">Configuration</h5>
          <p className="text-muted small mb-3">
            Manage global system preferences and core configurations.
          </p>
          <Button
            className="btn-save w-100"
            onClick={() => navigate("/settings/config")}
          >
            Open
          </Button>
        </Card>
      </div>
    </div>
  );
}