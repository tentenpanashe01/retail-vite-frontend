import React, { useEffect, useState } from "react";
import { Table, Button, Card, Spinner, Form } from "react-bootstrap";
import { FaClipboardList, FaSyncAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function StockLogPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const shopId = localStorage.getItem("shopId");
  const fullName = localStorage.getItem("fullName");

  useEffect(() => {
    if (!shopId) {
      Swal.fire("Access Restricted", "No shop assigned to this user.", "error");
      return;
    }
    loadLogs();
  }, [shopId]);

  // 🔹 Load stock logs for this shop
  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/stocks/shop/${shopId}`);
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setLogs(sorted);
    } catch (err) {
      console.error("Error loading logs:", err);
      Swal.fire("Error", "Failed to load stock movement logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Manual refresh
  const handleRefresh = async () => {
    Swal.fire({
      title: "Refreshing Logs...",
      timer: 1200,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    await loadLogs();
  };

  // 🔹 Search filter
  const filteredLogs = logs.filter(
    (log) =>
      log.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.transactionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <div>
          <h3 className="mb-0">
            <FaClipboardList className="me-2" /> Stock Movement Logs
          </h3>
          <small className="text-light">
            {fullName && `Welcome, ${fullName}`}{" "}
            {shopId && <span> | Shop ID: {shopId}</span>}
          </small>
        </div>
        <div>
          <Button
            variant="outline-light"
            size="sm"
            className="me-2"
            onClick={handleRefresh}
          >
            <FaSyncAlt className="me-1" />
            Refresh
          </Button>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate("/inventory")}
          >
            ← Back
          </Button>
        </div>
      </div>

      {/* 🔹 Search & Filter */}
      <Card className="form-card p-3 mt-4">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary">📦 Stock Movement Summary</h5>
          <Form.Control
            type="text"
            placeholder="Search by product, type, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>
      </Card>

      {/* 🔹 Logs List */}
      <Card className="list-card shadow-sm border-0 mt-4">
        <Card.Header className="list-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0 text-white">
            <FaClipboardList className="me-2" /> All Stock Movements
          </h5>
          <span className="text-white-50 small">
            {new Date().toLocaleDateString()}
          </span>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading stock logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">
              No stock logs found for this shop.
            </p>
          ) : (
            <Table hover responsive className="m-0 align-middle text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>USD</th>
                  <th>ZWL</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={log.stockLogId || i}>
                    <td>{i + 1}</td>
                    <td>{log.product?.productName || "-"}</td>
                    <td
                      style={{
                        color:
                          log.transactionType === "IN"
                            ? "green"
                            : log.transactionType === "OUT"
                            ? "red"
                            : "#333",
                        fontWeight: "bold",
                      }}
                    >
                      {log.quantityChanged > 0 ? "+" : ""}
                      {log.quantityChanged}
                    </td>
                    <td>{log.transactionType}</td>
                    <td>{log.reason || "-"}</td>
                    <td>{log.referenceId || "-"}</td>
                    <td>
                      {new Date(log.date).toLocaleString("en-ZA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>${log.totalCostUSD?.toFixed(2) || "0.00"}</td>
                    <td>{log.totalCostZWL?.toFixed(2) || "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default StockLogPage;