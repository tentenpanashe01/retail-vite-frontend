import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

/**
 * ProtectedRoute — role-based route guard for your retail system
 *
 * @param {ReactNode} children — Page component to render if authorized
 * @param {Array} allowedRoles — Optional list of roles allowed to access the page
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const location = useLocation();

  // 🟠 If user is not logged in, redirect to login
  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Session Expired",
      text: "Please log in again to continue.",
      timer: 2000,
      showConfirmButton: false,
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🟢 Check role access (if route specifies allowedRoles)
  if (allowedRoles.length > 0) {
    const hasAccess = roles.some((role) => allowedRoles.includes(role));
    if (!hasAccess) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You are not authorized to view this page.",
        timer: 2500,
        showConfirmButton: false,
      });

      // 🚫 Redirect user to their dashboard
      const redirectPath = getDashboardForRole(roles);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // ✅ Authorized — render the page
  return children;
};

/**
 * Smart redirection based on user's primary role
 */
function getDashboardForRole(roles) {
  if (roles.includes("ROLE_SUPERADMIN") || roles.includes("ROLE_ADMIN"))
    return "/dashboard";
  if (roles.includes("ROLE_SUPERVISOR")) return "/purchases";
  if (roles.includes("ROLE_CASHIER")) return "/cashier";
  return "/"; // fallback route
}

export default ProtectedRoute;