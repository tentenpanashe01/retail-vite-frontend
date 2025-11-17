// ✅ src/pages/ExpensesPage.js
import React from "react";
import { Link } from "react-router-dom";

function ExpensesPage() {
  return (
    <div
      style={{
        background: "#f9fbff",
        padding: "20px",
        borderRadius: "8px",
        minHeight: "90vh",
      }}
    >
      <h2 style={{ marginBottom: "16px", color: "#003366" }}>Expenses</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {/* 🔹 Card 1: Create Category */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h5 style={{ marginBottom: "6px", color: "#003366" }}>
            Create Expense Category
          </h5>
          <p style={{ marginBottom: "12px", opacity: 0.8 }}>
            Define categories e.g. Transport, Rent, Fuel, etc.
          </p>
          <Link
            to="/expenses/create"
            style={{
              background: "#003366",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Open
          </Link>
        </div>

        {/* 🔹 Card 2: Record Expense */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h5 style={{ marginBottom: "6px", color: "#003366" }}>
            Record Operational Expense
          </h5>
          <p style={{ marginBottom: "12px", opacity: 0.8 }}>
            Log operational expenses such as daily running costs.
          </p>
          <Link
            to="/expenses/record"
            style={{
              background: "#003366",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Open
          </Link>
        </div>

        {/* 🔹 Card 3: View Reports */}
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h5 style={{ marginBottom: "6px", color: "#003366" }}>
            Expense Reports
          </h5>
          <p style={{ marginBottom: "12px", opacity: 0.8 }}>
            View summary and detailed expense reports per category.
          </p>
          <Link
            to="/expenses/reports"
            style={{
              background: "#003366",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ExpensesPage;