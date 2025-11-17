import React from "react";
import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import { FaCashRegister, FaHistory, FaChartBar } from "react-icons/fa";

export default function SalesPage() {
  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaCashRegister className="me-2" /> Sales Management
        </h3>
      </div>

      {/* 🔹 Quick Actions */}
      <div
        className="d-flex flex-wrap gap-3 mt-4"
        style={{ justifyContent: "center" }}
      >
        {/* 🟩 POS Terminal */}
        <Card className="summary-card total text-center p-4 shadow-sm" style={{ width: "260px" }}>
          <FaCashRegister size={36} className="mb-3 text-primary" />
          <h5 className="mb-2">Open POS</h5>
          <p className="text-muted small mb-3">
            Launch the cashier terminal to process sales
          </p>
          <Link to="/cashier">
            <Button className="btn-save w-100">Open</Button>
          </Link>
        </Card>

        {/* 🟦 Sales History */}
        <Card className="summary-card completed text-center p-4 shadow-sm" style={{ width: "260px" }}>
          <FaHistory size={36} className="mb-3 text-primary" />
          <h5 className="mb-2">Sales History</h5>
          <p className="text-muted small mb-3">
            Review past sales transactions by date or cashier
          </p>
          <Link to="/sales/history">
            <Button className="btn-save w-100">Open</Button>
          </Link>
        </Card>

        {/* 🟧 Sales Reports */}
        <Card className="summary-card pending text-center p-4 shadow-sm" style={{ width: "260px" }}>
          <FaChartBar size={36} className="mb-3 text-primary" />
          <h5 className="mb-2">Sales Reports</h5>
          <p className="text-muted small mb-3">
            Generate daily, weekly, and monthly reports
          </p>
          <Link to="/reports/sales">
            <Button className="btn-save w-100">Open</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}