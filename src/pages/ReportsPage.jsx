import React from "react";
import { Button, Card } from "react-bootstrap";
import { FaChartBar, FaBoxes, FaFileInvoiceDollar, FaShoppingCart, FaStore, FaTag, FaFileExport, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ReportsPage() {
  const navigate = useNavigate();

  const reports = [
    {
      title: "Sales Reports",
      description: "Generate all sales reports",
      icon: <FaChartBar size={22} className="text-primary me-2" />,
      path: "/reports/sales",
    },
    {
      title: "Stock Report",
      description: "Generate stock report",
      icon: <FaBoxes size={22} className="text-primary me-2" />,
      path: "/reports/stock",
    },
    {
      title: "Expense Report",
      description: "Generate expense report",
      icon: <FaFileInvoiceDollar size={22} className="text-primary me-2" />,
      path: "/reports/expenses",
    },
    {
      title: "Purchases Reports",
      description: "Generate all purchases reports",
      icon: <FaShoppingCart size={22} className="text-primary me-2" />,
      path: "/reports/purchases",
    },
    {
      title: "Shop Reports",
      description: "Generate shop-level reports",
      icon: <FaStore size={22} className="text-primary me-2" />,
      path: "/reports/shops",
    },
    {
      title: "Products & Pricing",
      description: "Generate products and pricing report",
      icon: <FaTag size={22} className="text-primary me-2" />,
      path: "/reports/products-pricing",
    },
    {
      title: "General Exports",
      description: "Generate exports of various reports",
      icon: <FaFileExport size={22} className="text-primary me-2" />,
      path: "/reports/exports",
    },
    {
      title: "Financial Reports",
      description: "Generate financial summaries and breakdowns",
      icon: <FaMoneyBillWave size={22} className="text-primary me-2" />,
      path: "/reports/financial",
    },
  ];

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaChartBar className="me-2" /> Reports Dashboard
        </h3>
        <Button variant="outline-light" size="sm" onClick={() => navigate("/")}>
          ← Back
        </Button>
      </div>

      {/* 🔹 Reports Grid */}
      <div
        className="mt-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {reports.map((r, idx) => (
          <Card
            key={idx}
            className="report-card p-3 shadow-sm border-0"
            style={{
              borderRadius: "10px",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => navigate(r.path)}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            <div className="d-flex align-items-center mb-2">
              {r.icon}
              <h5 className="mb-0 fw-bold">{r.title}</h5>
            </div>
            <p className="text-muted mb-3">{r.description}</p>
            <Button className="btn-save w-100">Open</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}