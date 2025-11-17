import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

/**
 * RoleRedirect
 * Automatically sends users to the correct page after login
 */
export default function RoleRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please log in again.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/login");
      return;
    }

    // 🚦 Determine destination based on roles
    if (roles.includes("ROLE_SUPERADMIN") || roles.includes("ROLE_ADMIN")) {
      navigate("/"); // dashboard
    } else if (roles.includes("ROLE_SUPERVISOR")) {
      navigate("/purchases");
    } else if (roles.includes("ROLE_CASHIER")) {
      navigate("/cashier");
    } else {
      navigate("/unauthorized");
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px", color: "#003366" }}>
      <h3>Redirecting to your dashboard...</h3>
    </div>
  );
}