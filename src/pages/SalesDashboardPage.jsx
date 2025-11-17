import React, { useEffect, useState } from "react";
import { Card, Table, Button, Spinner, Form } from "react-bootstrap";
import { FaChartLine, FaDollarSign, FaCalendarAlt, FaStore, FaSync } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../services/api";

export default function SalesDashboardPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchDailySales();
  }, [date]);

  const fetchDailySales = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sales/range`, {
        params: {
          start: `${date}T00:00:00`,
          end: `${date}T23:59:59`,
        },
      });
      setSales(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load sales data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalUSD = sales.reduce((sum, s) => sum + (s.totalAmountUSD || 0), 0);
  const totalZWL = sales.reduce((sum, s) => sum + (s.totalAmountZWL || 0), 0);

  const groupedByShop = sales.reduce((acc, s) => {
    const shopName = s.shop?.shopName || "Unknown Shop";
    acc[shopName] = (acc[shopName] || 0) + (s.totalAmountUSD || 0);
    return acc;
  }, {});

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaChartLine className="me-2" /> Sales Dashboard
        </h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={fetchDailySales}
          disabled={loading}
        >
          <FaSync className={`me-1 ${loading ? "fa-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* 🔹 Date Selector */}
      <Card className="form-card p-3 mb-4 shadow-sm">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <Form.Label className="fw-bold mb-0">
            <FaCalendarAlt className="me-2 text-primary" /> Select Date:
          </Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "200px" }}
          />
        </div>
      </Card>

      {/* 🔹 Loading State */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status" />
          <div className="mt-2">Loading dashboard data...</div>
        </div>
      ) : (
        <>
          {/* 🔹 Summary Cards */}
          <div className="d-flex flex-wrap gap-3 mb-4">
            <Card className="summary-card total flex-fill p-3 text-center shadow-sm">
              <h6 className="mb-2 text-uppercase">Total Sales</h6>
              <h3>{sales.length}</h3>
            </Card>

            <Card className="summary-card completed flex-fill p-3 text-center shadow-sm">
              <h6 className="mb-2 text-uppercase">Total USD</h6>
              <h3>${totalUSD.toFixed(2)}</h3>
            </Card>

            <Card className="summary-card pending flex-fill p-3 text-center shadow-sm">
              <h6 className="mb-2 text-uppercase">Total ZWL</h6>
              <h3>{totalZWL.toFixed(2)}</h3>
            </Card>
          </div>

          {/* 🔹 Per-Shop Breakdown */}
          <Card className="list-card shadow-sm border-0">
            <Card.Header className="list-header d-flex align-items-center">
              <FaStore className="me-2 text-white" />
              <h5 className="mb-0 text-white">Shop Breakdown (USD)</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {Object.keys(groupedByShop).length === 0 ? (
                <p className="text-center text-muted py-3 m-0">
                  No data for this date.
                </p>
              ) : (
                <Table hover responsive className="m-0 text-center align-middle">
                  <thead>
                    <tr>
                      <th>Shop</th>
                      <th>Total Sales (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedByShop).map(([shop, total]) => (
                      <tr key={shop}>
                        <td>{shop}</td>
                        <td>${total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}