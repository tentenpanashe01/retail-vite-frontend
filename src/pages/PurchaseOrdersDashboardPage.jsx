// ✅ src/pages/PurchaseOrdersDashboardPage.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Table,
  Button,
  Spinner,
  Badge,
  Card,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import {
  FaShoppingCart,
  FaDollarSign,
  FaTruck,
  FaClipboardList,
} from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Title
);

function PurchaseOrdersDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [supplierTotals, setSupplierTotals] = useState({});

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterStatus = queryParams.get("status");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get("/purchase-orders");
      let data = res.data;

      if (filterStatus) data = data.filter((o) => o.status === filterStatus);

      const total = data.length;
      const pending = data.filter((o) => o.status === "PENDING").length;
      const completed = data.filter((o) => o.status === "COMPLETED").length;

      const supplierSummary = {};
      data.forEach((o) => {
        const supplier = o.supplierName || "Unknown";
        supplierSummary[supplier] =
          (supplierSummary[supplier] || 0) + (o.totalCostUSD || 0);
      });

      setSupplierTotals(supplierSummary);
      setStats({ total, pending, completed });
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async (id) => {
    try {
      await api.put(`/purchase-orders/${id}/complete`);
      Swal.fire("Success", "Order marked as Completed.", "success");
      loadOrders();
    } catch {
      Swal.fire(
        "Error",
        "Ensure items and expenses exist before completing.",
        "error"
      );
    }
  };

  const deleteOrder = async (id) => {
    Swal.fire({
      title: "Delete Order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await api.delete(`/purchase-orders/${id}`);
        Swal.fire("Deleted", "Purchase order removed.", "success");
        loadOrders();
      }
    });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  // ===== Chart Data =====
  const barData = {
    labels: Object.keys(supplierTotals),
    datasets: [
      {
        label: "Total Spend (USD)",
        data: Object.values(supplierTotals),
        backgroundColor: ["#004c99", "#0077cc", "#00bfff", "#3399ff"],
        borderRadius: 6,
      },
    ],
  };

  const donutData = {
    labels: ["Pending", "Completed"],
    datasets: [
      {
        label: "Orders",
        data: [stats.pending, stats.completed],
        backgroundColor: ["#ffcc00", "#00bfff"],
        borderColor: ["#e6b800", "#00bfff"],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    animation: { duration: 1500, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Supplier Spending (USD)",
        color: "#003366",
        font: { size: 15, weight: "bold" },
      },
    },
    scales: {
      x: { ticks: { color: "#003366" }, grid: { display: false } },
      y: { ticks: { color: "#003366" }, grid: { color: "#e0e0e0" } },
    },
  };

  const donutOptions = {
    animation: { animateScale: true, animateRotate: true },
    plugins: {
      legend: { position: "bottom", labels: { color: "#003366" } },
      title: {
        display: true,
        text: "Order Status Distribution",
        color: "#003366",
        font: { size: 15, weight: "bold" },
      },
    },
  };

  return (
    <div className="theme-retail purchase-dashboard">
      {/* ===== Header ===== */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaShoppingCart className="me-2" /> Purchase Orders Dashboard
        </h3>
      </div>

      {/* ===== Summary Cards ===== */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="summary-card total text-white shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaClipboardList className="icon me-3" />
              <div>
                <h5 className="m-0 fw-semibold">Total Orders</h5>
                <h2 className="fw-bold">{stats.total}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card pending text-white shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaTruck className="icon me-3" />
              <div>
                <h5 className="m-0 fw-semibold">Pending Orders</h5>
                <h2 className="fw-bold">{stats.pending}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card completed text-white shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaDollarSign className="icon me-3" />
              <div>
                <h5 className="m-0 fw-semibold">Completed Orders</h5>
                <h2 className="fw-bold">{stats.completed}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Table ===== */}
      <Card className="list-card mb-4">
        <Card.Header className="list-header">
          <h5 className="mb-0 text-white">
            All Purchase Orders {filterStatus && `(${filterStatus})`}
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="m-0 align-middle">
            <thead>
              <tr className="text-white bg-navy">
                <th>#</th>
                <th>Supplier</th>
                <th>Shop</th>
                <th>Status</th>
                <th>Total (USD)</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-3">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o, idx) => (
                  <tr key={o.purchaseOrderId} className="table-row">
                    <td>{idx + 1}</td>
                    <td>{o.supplierName}</td>
                    <td>{o.shop?.shopName}</td>
                    <td>
                      <Badge
                        bg={
                          o.status === "PENDING"
                            ? "warning"
                            : o.status === "COMPLETED"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td>${o.totalCostUSD?.toFixed(2) || "0.00"}</td>
                    <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                    <td>
                      {o.status === "PENDING" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => markAsComplete(o.purchaseOrderId)}
                        >
                          ✅ Complete
                        </Button>
                      )}{" "}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteOrder(o.purchaseOrderId)}
                      >
                        🗑 Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* ===== Charts Section ===== */}
      <Container fluid className="charts-section mt-4">
        <Row className="g-4">
          <Col md={7}>
            <Card className="chart-card shadow-sm">
              <Card.Body>
                <Bar data={barData} options={barOptions} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={5}>
            <Card className="chart-card shadow-sm">
              <Card.Body>
                <Doughnut data={donutData} options={donutOptions} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PurchaseOrdersDashboardPage;