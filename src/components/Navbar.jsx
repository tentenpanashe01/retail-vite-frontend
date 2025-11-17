import React from "react";
import { useNavigate } from "react-router-dom";
import { UserService } from "../services/userService";

function Navbar() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  const handleLogout = async () => {
    await UserService.logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#003366",
        color: "#fff",
        padding: "10px 20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Left: Brand or Shop Info */}
      <div>
        <strong style={{ fontSize: "18px" }}>🏪 Retail POS System</strong>
        <div style={{ fontSize: "13px", opacity: 0.8 }}>
          {localStorage.getItem("shopName") || "Head Office"}
        </div>
      </div>

      {/* Center: Roles (Optional) */}
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: "14px" }}>
          {roles.length > 0 ? roles.join(", ").replaceAll("ROLE_", "") : "User"}
        </span>
      </div>

      {/* Right: User Info + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontWeight: "500" }}>{fullName || "Guest"}</span>
        <button
          onClick={handleLogout}
          style={{
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;