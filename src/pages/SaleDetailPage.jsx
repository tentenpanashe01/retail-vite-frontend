import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Spinner, Button } from "react-bootstrap";
import { FaReceipt, FaArrowLeft, FaStore, FaUser, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../services/api";

export default function SaleDetailPage() {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSaleDetails();
  }, [saleId]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      const [saleRes, itemRes] = await Promise.all([
        api.get(`/sales/${saleId}`),
        api.get(`/sale-items/sale/${saleId}`),
      ]);
      setSale(saleRes.data);
      setItems(itemRes.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load sale details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const totalProfitUSD = items.reduce((sum, i) => sum + (i.profitUSD || 0), 0);
  const totalProfitZWL = items.reduce((sum, i) => sum + (i.profitZWL || 0), 0);

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaReceipt className="me-2" /> Sale #{saleId} Details
        </h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate("/sales-history")}
        >
          <FaArrowLeft className="me-1" /> Back
        </Button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status" />
          <div className="mt-2">Loading sale details...</div>
        </div>
      ) : sale ? (
        <>
          {/* 🧾 Sale Summary Card */}
          <Card className="form-card p-4 mb-4 shadow-sm">
            <h5 className="mb-3 text-primary">
              <FaMoneyBillWave className="me-2" />
              Sale Summary
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <p>
                  <FaStore className="me-2 text-primary" />
                  <strong>Shop:</strong> {sale.shop?.shopName || "—"}
                </p>
                <p>
                  <FaUser className="me-2 text-primary" />
                  <strong>Cashier:</strong> {sale.cashier?.username || "—"}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <FaCalendarAlt className="me-2 text-primary" />
                  <strong>Date:</strong>{" "}
                  {new Date(sale.saleDate).toLocaleString()}
                </p>
                <p>
                  <strong>Payment:</strong> {sale.paymentMethod || "—"}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <strong>Total USD:</strong> ${sale.totalAmountUSD?.toFixed(2)}{" "}
              <strong>|</strong>{" "}
              <strong>Total ZWL:</strong> {sale.totalAmountZWL?.toFixed(2)}
            </div>
          </Card>

          {/* 🧮 Sale Items Table */}
          <Card className="list-card shadow-sm border-0 mb-4">
            <Card.Header className="list-header">
              <h5>🧾 Sale Items</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="m-0 text-center align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price (USD)</th>
                    <th>Total (USD)</th>
                    <th>Cost (USD)</th>
                    <th>Profit (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((i) => (
                      <tr key={i.saleItemId}>
                        <td>{i.product?.productName}</td>
                        <td>{i.quantity}</td>
                        <td>${i.sellingPriceUSD?.toFixed(2)}</td>
                        <td>${i.totalUSD?.toFixed(2)}</td>
                        <td>${i.costPriceUSD?.toFixed(2)}</td>
                        <td
                          style={{
                            color: i.profitUSD >= 0 ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          ${i.profitUSD?.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-muted py-3">
                        No sale items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* 💰 Profit Summary */}
          <Card className="form-card p-3 shadow-sm mb-4">
            <h6 className="fw-bold mb-0 text-success">
              Total Profit: ${totalProfitUSD.toFixed(2)} USD |{" "}
              {totalProfitZWL.toFixed(2)} ZWL
            </h6>
          </Card>
        </>
      ) : (
        <p className="text-center text-muted mt-5">Sale not found.</p>
      )}
    </div>
  );
}