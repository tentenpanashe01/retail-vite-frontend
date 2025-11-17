import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Button, Form, Badge } from "react-bootstrap";
import { FaStore, FaBoxes } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function ShopStockPage() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState("");

  // ✅ Get user info (for supervisors)
  const shopIdFromStorage = localStorage.getItem("shopId");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const fullName = localStorage.getItem("fullName");

  useEffect(() => {
    if (roles.includes("SUPERVISOR")) {
      // Supervisor sees only their own shop
      loadShopStock(shopIdFromStorage);
    } else {
      // Admin or Superadmin can pick a shop
      loadAllShops();
    }
  }, []);

  // ✅ Load all shops for admins
  const loadAllShops = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shops");
      setShops(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load shop list.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load stock for selected shop
  const loadShopStock = async (shopId) => {
    if (!shopId) return;
    try {
      setLoading(true);
      const res = await api.get(`/shop-stock/shop/${shopId}`);
      setStocks(res.data || []);
      const shop = shops.find((s) => s.id === Number(shopId));
      setShopName(shop ? shop.shopName : "Shop");
    } catch (err) {
      Swal.fire("Error", "Failed to load stock for this shop.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle shop selection (for admin)
  const handleShopSelect = (e) => {
    const id = e.target.value;
    setSelectedShop(id);
    if (id) loadShopStock(id);
  };

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaStore className="me-2" /> Shop Stock Overview
        </h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate("/inventory")}
        >
          ← Back
        </Button>
      </div>

      {/* 🔹 Shop Selection (for Admins) */}
      {!roles.includes("SUPERVISOR") && (
        <Card className="form-card mt-3 p-3 shadow-sm border-0">
          <Form.Group>
            <Form.Label>Select Shop</Form.Label>
            <Form.Select
              value={selectedShop}
              onChange={handleShopSelect}
              required
            >
              <option value="">Choose Shop</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Card>
      )}

      {/* 🔹 Stock List */}
      <Card className="list-card mt-4 shadow-sm border-0">
        <Card.Header className="list-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-white">
            <FaBoxes className="me-2" />{" "}
            {shopName ? `${shopName} Stock Summary` : "Shop Stock Summary"}
          </h5>
          {roles.includes("SUPERVISOR") && (
            <span className="text-light small">
              Viewing as: <strong>{fullName}</strong>
            </span>
          )}
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="light" />
              <p className="mt-2 mb-0 text-white-50">Loading stock data...</p>
            </div>
          ) : stocks.length === 0 ? (
            <p className="text-center text-muted py-3 mb-0">
              No stock data found for this shop.
            </p>
          ) : (
            <Table hover responsive className="m-0 align-middle text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>In Stock</th>
                  <th>Avg Cost (USD)</th>
                  <th>Avg Cost (ZWL)</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((item, i) => (
                  <tr key={item.shopStockId || i}>
                    <td>{i + 1}</td>
                    <td>{item.product?.productName || "-"}</td>
                    <td>{item.product?.category || "-"}</td>
                    <td>{item.product?.unit || "-"}</td>
                    <td>
                      <Badge bg={item.quantityInStock > 0 ? "success" : "danger"}>
                        {item.quantityInStock || 0}
                      </Badge>
                    </td>
                    <td>
                      ${item.avgLandingCostUSD?.toFixed(2) || "0.00"}
                    </td>
                    <td>
                      {item.avgLandingCostZWL?.toFixed(2) || "0.00"}
                    </td>
                    <td>
                      {item.lastUpdated
                        ? new Date(item.lastUpdated).toLocaleDateString("en-ZA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
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

export default ShopStockPage;