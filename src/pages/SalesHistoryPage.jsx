import React, { useEffect, useState } from "react";
import {
  Card, Table, Button, Spinner, Form, Row, Col
} from "react-bootstrap";
import {
  FaHistory, FaSearch, FaMoneyBillWave, FaFilter
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import SaleService from "../services/sales";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const [shopId, setShopId] = useState("");
  const [cashierId, setCashierId] = useState("");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("all");

  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userShopId, setUserShopId] = useState(null);

  const navigate = useNavigate();

  // -----------------------------------------------------
  // Load User From Token
  // -----------------------------------------------------
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        console.log("🟩 Token Decoded:", decoded);

        setRole(decoded.role); // e.g. "ROLE_CASHIER"
        setUserId(decoded.userId);
        setUserShopId(decoded.shopId);
      }
    } catch (err) {
      console.error("❌ Could not decode token:", err);
    }
  }, []);

  // -----------------------------------------------------
  // Auto-fetch on filter change
  // -----------------------------------------------------
  useEffect(() => {
    if (role) fetchSales();
  }, [role, filter, shopId, cashierId, date]);

  // -----------------------------------------------------
  // FETCH SALES (Role Aware)
  // -----------------------------------------------------
  const fetchSales = async () => {
    if (!role) return;
    setLoading(true);

    console.log("======================================");
    console.log("FETCH START");
    console.log("ROLE:", role);
    console.log("FILTER:", filter);
    console.log("userId:", userId);
    console.log("userShopId:", userShopId);
    console.log("======================================");

    try {
      let data;

      // ----------------------------------------------
      // CASHIER MODE — always own daily sales
      // ----------------------------------------------
      if (role === "ROLE_CASHIER") {
        const selected = date || new Date().toISOString().split("T")[0];
        console.log("➡️ Cashier → getCashierDailySales(", userId, ",", selected, ")");
        data = await SaleService.getCashierDailySales(userId, selected);
        setSales(data || []);
        return;
      }

      // ----------------------------------------------
      // SUPERVISOR MODE — own shop only
      // ----------------------------------------------
      if (role === "ROLE_SUPERVISOR") {
        if (filter === "date" && date) {
          const start = `${date}T00:00:00`;
          const end = `${date}T23:59:59`;

          console.log("➡️ Supervisor → getSalesByRange()", start, end);
          data = await SaleService.getSalesByRange(start, end);
        } else {
          console.log("➡️ Supervisor → getSalesByShop(", userShopId, ")");
          data = await SaleService.getSalesByShop(userShopId);
        }

        setSales(data || []);
        return;
      }

      // ----------------------------------------------
      // ADMIN / SUPERADMIN — full access
      // ----------------------------------------------
      if (role === "ROLE_ADMIN" || role === "ROLE_SUPERADMIN") {

        if (filter === "shop" && shopId) {
          console.log("➡️ Admin → getSalesByShop(", shopId, ")");
          data = await SaleService.getSalesByShop(Number(shopId));
        }
        else if (filter === "cashier" && cashierId && date) {
          console.log("➡️ Admin → getCashierDailySales(", cashierId, date, ")");
          data = await SaleService.getCashierDailySales(Number(cashierId), date);
        }
        else if (filter === "date" && date) {
          const start = `${date}T00:00:00`;
          const end = `${date}T23:59:59`;

          console.log("➡️ Admin → getSalesByRange(", start, end, ")");
          data = await SaleService.getSalesByRange(start, end);
        }
        else {
          console.log("➡️ Admin → getAllSales()");
          data = await SaleService.getAllSales();
        }
      }

      setSales(data || []);

    } catch (err) {
      console.error("❌ Fetch error:", err);
      Swal.fire("Error", "Failed to load sales.", "error");
    } finally {
      setLoading(false);
      console.log("FETCH END");
    }
  };

  // -----------------------------------------------------
  // Totals
  // -----------------------------------------------------
  const totalUSD = sales.reduce((sum, s) => sum + (s.totalAmountUSD || 0), 0);
  const totalZWL = sales.reduce((sum, s) => sum + (s.totalAmountZWL || 0), 0);

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <div className="theme-retail">
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3><FaHistory className="me-2" /> Sales History</h3>
        <Button variant="outline-light" size="sm" onClick={() => navigate("/sales-dashboard")}>
          ← Back
        </Button>
      </div>

      {/* FILTERS (not for cashier) */}
      {role !== "ROLE_CASHIER" && (
        <Card className="form-card p-4 mb-4 shadow-sm">
          <Row className="g-3 align-items-end">

            {/* FILTER TYPE */}
            <Col md={3}>
              <Form.Group>
                <Form.Label><FaFilter className="me-2 text-primary" /> Filter Type</Form.Label>
                <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  {(role === "ROLE_ADMIN" || role === "ROLE_SUPERADMIN") ? (
                    <>
                      <option value="all">All Sales</option>
                      <option value="shop">By Shop</option>
                      <option value="cashier">By Cashier (Daily)</option>
                      <option value="date">By Date</option>
                    </>
                  ) : (
                    <option value="date">By Date</option>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* SHOP FILTER */}
            {filter === "shop" && (role === "ROLE_ADMIN" || role === "ROLE_SUPERADMIN") && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Shop ID</Form.Label>
                  <Form.Control type="number" value={shopId} onChange={(e) => setShopId(e.target.value)} />
                </Form.Group>
              </Col>
            )}

            {/* CASHIER FILTER */}
            {filter === "cashier" && (role === "ROLE_ADMIN" || role === "ROLE_SUPERADMIN") && (
              <>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Cashier ID</Form.Label>
                    <Form.Control type="number" value={cashierId} onChange={(e) => setCashierId(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Form.Group>
                </Col>
              </>
            )}

            {/* DATE FILTER */}
            {filter === "date" && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Form.Group>
              </Col>
            )}

            <Col md="auto">
              <Button className="btn-save mt-2" onClick={fetchSales} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : <><FaSearch /> Load Sales</>}
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* SUMMARY */}
      <div className="d-flex gap-3 mb-4">
        <Card className="summary-card total flex-fill p-3 text-center shadow-sm">
          <h6>Total Sales</h6>
          <h3>{sales.length}</h3>
        </Card>
        <Card className="summary-card completed flex-fill p-3 text-center shadow-sm">
          <h6>Total USD</h6>
          <h3>${totalUSD.toFixed(2)}</h3>
        </Card>
        <Card className="summary-card pending flex-fill p-3 text-center shadow-sm">
          <h6>Total ZWL</h6>
          <h3>{totalZWL.toFixed(2)}</h3>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="list-card shadow-sm">
        <Card.Header className="list-header d-flex align-items-center">
          <FaMoneyBillWave className="me-2 text-white" />
          <h5 className="text-white mb-0">Sales Records</h5>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : sales.length === 0 ? (
            <p className="text-center py-3">No sales found.</p>
          ) : (
            <Table hover responsive className="text-center m-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Shop</th>
                  <th>Cashier</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>USD</th>
                  <th>ZWL</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.saleId}>
                    <td>{s.saleId}</td>

                    {/* SAFE rendering to avoid null errors */}
                    <td>{s.shop?.shopName || "—"}</td>
                    <td>{s.cashier?.username || "—"}</td>

                    <td>{new Date(s.saleDate).toLocaleString()}</td>
                    <td>{s.paymentMethod}</td>
                    <td>${s.totalAmountUSD?.toFixed(2)}</td>
                    <td>{s.totalAmountZWL?.toFixed(2)}</td>

                    <td>
                      <Button size="sm" variant="outline-primary"
                        onClick={() => navigate(`/sales/${s.saleId}`)}
                      >
                        View
                      </Button>
                    </td>
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