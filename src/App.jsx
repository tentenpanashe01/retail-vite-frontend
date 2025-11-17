// ================================================
// src/App.js  (Vite + React Router v6)
// STARTS AT LOGIN PAGE
// ================================================
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Swal from "sweetalert2";

import Layout from "./components/Layout";
import CashierLayout from "./components/CashierLayout";
import RoleRedirect from "./components/RoleRedirect";
import DashboardPage from "./pages/DashboardPage";
import ShopsPage from "./pages/ShopsPage";
import InventoryPage from "./pages/InventoryPage";
import PurchasesPage from "./pages/PurchasesPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import UserManagementPage from "./pages/UserManagementPage";
import CashierPage from "./pages/CashierPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import SaleDetailPage from "./pages/SaleDetailPage";
import RecordExpensePage from "./pages/RecordExpensePage";
import CreateExpenseCategoryPage from "./pages/CreateExpenseCategoryPage";
import CreatePurchaseOrderPage from "./pages/CreatePurchaseOrderPage";
import AddPurchaseOrderItemPage from "./pages/AddPurchaseOrderItemsPage";
import AddOrderExpensePage from "./pages/AddPurchaseOrderExpensesPage";
import PurchaseOrdersDashboardPage from "./pages/PurchaseOrdersDashboardPage";
import AddProductPage from "./pages/AddProductPage";
import AdjustPricePage from "./pages/AdjustPricePage";
import StockAdjustmentPage from "./pages/StockAdjustmentPage";
import StockTransferPage from "./pages/StockTransferPage";
import StockLogPage from "./pages/StockLogPage";
import LoginPage from "./pages/LoginPage";
import ShopStockPage from "./pages/ShopStockPage";

import "./theme.css";

/* -----------------------------------------------
   🛡 ProtectedRoute Component
------------------------------------------------ */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
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
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !roles.some((r) => allowedRoles.includes(r))) {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "You do not have permission to access this section.",
      timer: 2000,
      showConfirmButton: false,
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/* -----------------------------------------------
   📌 MAIN APPLICATION ROUTES
   Always Redirect "/" → "/login"
------------------------------------------------ */
export default function App() {
  return (
    <Routes>
      {/* 🔐 LOGIN FIRST ALWAYS */}
      <Route path="/login" element={<LoginPage />} />

      {/* 🔁 User role-based redirect */}
      <Route path="/redirect" element={<RoleRedirect />} />

      {/* ❌ Unauthorized Page */}
      <Route
        path="/unauthorized"
        element={
          <h2 style={{ textAlign: "center", marginTop: "80px", color: "#c00" }}>
            🚫 Access Denied
          </h2>
        }
      />

      {/* ======================================================
          🧭 ADMIN & SUPERADMIN ROUTES
      ======================================================= */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shops"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <Layout>
              <ShopsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <Layout>
              <InventoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/add"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <Layout>
              <AddProductPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/adjust-price"
        element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERVISOR", "ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <Layout>
              <AdjustPricePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/adjust-stock"
        element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <Layout>
              <StockAdjustmentPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/transfer"
        element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERVISOR", "ROLE_ADMIN"]}>
            <Layout>
              <StockTransferPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/logs"
        element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERVISOR", "ROLE_ADMIN", "ROLE_SUPERADMIN"]}>
            <Layout>
              <StockLogPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/shop-stock"
        element={
          <ProtectedRoute
            allowedRoles={[
              "ROLE_SUPERVISOR",
              "ROLE_ADMIN",
              "ROLE_SUPERADMIN",
            ]}
          >
            <Layout>
              <ShopStockPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          📦 PURCHASES / SUPERVISOR
      ======================================================= */}
      <Route
        path="/purchases"
        element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERVISOR"]}>
            <Layout>
              <PurchasesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERVISOR"]}>
            <Layout>
              <PurchaseOrdersDashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders/create"
        element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERVISOR"]}>
            <Layout>
              <CreatePurchaseOrderPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders/items/add"
        element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERVISOR"]}>
            <Layout>
              <AddPurchaseOrderItemPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders/expenses/add"
        element={
          <ProtectedRoute allowedRoles={["ROLE_SUPERVISOR"]}>
            <Layout>
              <AddOrderExpensePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          💵 CASHIER ROUTES
      ======================================================= */}
      <Route
        path="/cashier"
        element={
          <ProtectedRoute allowedRoles={["ROLE_CASHIER"]}>
            <CashierPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales/history"
        element={
          <ProtectedRoute allowedRoles={["ROLE_CASHIER", "ROLE_ADMIN","ROLE_SUPERADMIN"]}>
            <Layout>
              <SalesHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales/:saleId"
        element={
          <ProtectedRoute allowedRoles={["ROLE_CASHIER"]}>
            <SaleDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 🔚 Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
