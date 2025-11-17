// ✅ src/pages/InventoryPage.js
import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Row,
  Col,
  Badge,
  Accordion,
  Spinner,
  Form,
  InputGroup,
  Container,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  FaBoxes,
  FaWarehouse,
  FaExclamationTriangle,
  FaChartPie,
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

function InventoryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [shopStocks, setShopStocks] = useState({});
  const [loading, setLoading] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadProducts();
    loadShops();
  }, []);

  useEffect(() => {
    if (selectedShopId) loadLowStockCount(selectedShopId);
  }, [selectedShopId]);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      extractCategories(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  const extractCategories = (data) => {
    const uniqueCategories = [
      "All",
      ...new Set(data.map((p) => p.category || "Uncategorized")),
    ];
    setCategories(uniqueCategories);
  };

  const loadShops = async () => {
    try {
      const res = await api.get("/shops");
      setShops(res.data);
    } catch (err) {
      console.error("Failed to load shops:", err);
    }
  };

  const loadLowStockCount = async (shopId) => {
    try {
      const res = await api.get(`/products/reorder/${shopId}`);
      setLowStockCount(res.data.length);
    } catch (err) {
      console.error("Failed to load low stock items:", err);
    }
  };

  const loadShopStockForProduct = async (productId) => {
    if (shopStocks[productId]) return;
    setLoading(true);
    try {
      const res = await api.get(`/shop-stocks/by-product/${productId}`);
      setShopStocks((prev) => ({ ...prev, [productId]: res.data }));
    } catch (err) {
      console.error("Failed to load shop stock:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.productName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const calculateTotals = (productId) => {
    const entries = shopStocks[productId] || [];
    if (!entries.length) return { totalQty: 0, avgLandingUSD: 0 };

    const totalQty = entries.reduce((sum, s) => sum + s.quantityInStock, 0);
    const avgLandingUSD =
      entries.reduce((sum, s) => sum + (s.avgLandingCostUSD || 0), 0) /
      entries.length;

    return { totalQty, avgLandingUSD: avgLandingUSD.toFixed(2) };
  };

  // ===== Dashboard Stats =====
  const totalProducts = products.length;
  const totalCategories = categories.length - 1; // minus "All"

  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat === "All") return acc;
    acc[cat] = products.filter((p) => p.category === cat).length;
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: "Products per Category",
        data: Object.values(categoryCounts),
        backgroundColor: "#004c99",
        borderRadius: 6,
      },
    ],
  };

  const donutData = {
    labels: ["Low Stock", "Healthy Stock"],
    datasets: [
      {
        data: [lowStockCount, totalProducts - lowStockCount],
        backgroundColor: ["#ff6600", "#007a33"],
        borderColor: ["#ff6600", "#007a33"],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    animation: { duration: 1500, easing: "easeOutCubic" },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Product Distribution by Category",
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
        text: "Stock Health Overview",
        color: "#003366",
        font: { size: 15, weight: "bold" },
      },
    },
  };

  return (
    <div className="theme-retail inventory-dashboard">
      {/* ===== Header ===== */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaBoxes className="me-2" /> Inventory Management Dashboard
        </h3>
        <div>
          <Button variant="primary" className="me-2" onClick={() => navigate("/inventory/add")}>
            ➕ Add Product
          </Button>
          <Button
            variant="outline-light"
            className="me-2"
            onClick={() => navigate("/inventory/adjust-price")}
          >
            💰 Adjust Price
          </Button>
          <Button
            variant="outline-warning"
            className="me-2"
            onClick={() => navigate("/inventory/adjust-stock")}
          >
            ⚙ Adjust Stock
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/inventory/transfer")}
          >
            🔄 Transfer Stock
          </Button>
        </div>
      </div>

      {/* ===== Summary Cards ===== */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="summary-card total text-white shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaWarehouse className="icon me-3" />
              <div>
                <h6 className="m-0 fw-semibold">Total Products</h6>
                <h2 className="fw-bold">{totalProducts}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card pending text-white shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaChartPie className="icon me-3" />
              <div>
                <h6 className="m-0 fw-semibold">Product Categories</h6>
                <h2 className="fw-bold">{totalCategories}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card completed text-white shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaExclamationTriangle className="icon me-3" />
              <div>
                <h6 className="m-0 fw-semibold">Low Stock Items</h6>
                <h2 className="fw-bold">{lowStockCount}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Charts Section ===== */}
      <Container fluid className="charts-section mb-4">
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

      {/* ===== Filters ===== */}
      <Card className="p-3 shadow-sm border-0 mb-4">
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Select Shop</Form.Label>
              <Form.Select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
              >
                <option value="">-- Choose a Shop --</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.shopName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-end">
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                placeholder="Search product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ maxWidth: "180px" }}
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>
      </Card>

      {/* ===== Inventory Accordion ===== */}
      {selectedShopId ? (
        <Card className="shadow-sm border-0">
          <Card.Header className="list-header text-white">
            <h5 className="mb-0">📦 Product Inventory Details</h5>
          </Card.Header>
          <Card.Body>
            <Accordion alwaysOpen>
              {filteredProducts.map((product, index) => {
                const { totalQty, avgLandingUSD } = calculateTotals(product.productId);
                return (
                  <Accordion.Item
                    key={product.productId}
                    eventKey={String(index)}
                    onClick={() => loadShopStockForProduct(product.productId)}
                  >
                    <Accordion.Header>
                      <div className="w-100 d-flex justify-content-between align-items-center">
                        <div>
                          <b>{product.productName}</b>{" "}
                          <small className="text-muted">
                            ({product.category || "Uncategorized"})
                          </small>
                          <div className="text-muted small">
                            🧮 {totalQty} units | 💲 Avg Landing: {avgLandingUSD} USD
                          </div>
                        </div>
                        <div>
                          <b className="text-success">
                            {product.sellingPriceUSD?.toFixed(2)} USD
                          </b>
                        </div>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      {loading && !shopStocks[product.productId] ? (
                        <div className="text-center my-3">
                          <Spinner animation="border" variant="primary" size="sm" />{" "}
                          Loading shop data...
                        </div>
                      ) : shopStocks[product.productId] &&
                        shopStocks[product.productId].length > 0 ? (
                        <Table hover responsive className="align-middle mt-2">
                          <thead className="bg-navy text-white">
                            <tr>
                              <th>#</th>
                              <th>Shop</th>
                              <th>Quantity</th>
                              <th>Reorder Level</th>
                              <th>Landing Cost (USD)</th>
                              <th>Landing Cost (ZWL)</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shopStocks[product.productId].map((stock, i) => (
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{stock.shop?.shopName}</td>
                                <td>{stock.quantityInStock}</td>
                                <td>{stock.product?.reorderLevel}</td>
                                <td>{stock.avgLandingCostUSD?.toFixed(2) || "-"}</td>
                                <td>{stock.avgLandingCostZWL?.toFixed(2) || "-"}</td>
                                <td>
                                  {stock.quantityInStock <= stock.product?.reorderLevel ? (
                                    <Badge bg="danger">Low</Badge>
                                  ) : (
                                    <Badge bg="success">OK</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="text-muted text-center py-2">
                          No stock data available for this product.
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Card.Body>
        </Card>
      ) : (
        <div className="text-center text-muted py-5">
          🏪 Please select a shop to view inventory.
        </div>
      )}
    </div>
  );
}

export default InventoryPage;