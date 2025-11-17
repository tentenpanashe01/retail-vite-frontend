// ✅ src/pages/AddProductPage.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Table,
  InputGroup,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaDollarSign, FaTags } from "react-icons/fa";
import api from "../services/api";

function AddProductPage() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    productName: "",
    category: "",
    unit: "",
    reorderLevel: "",
    sellingPriceUSD: "",
    sellingPriceZWL: "",
    expiryDate: "",
  });

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/products", product);
      if (res.status === 200 || res.status === 201) {
        setMessage("✅ Product added successfully!");
        setProduct({
          productName: "",
          category: "",
          unit: "",
          reorderLevel: "",
          sellingPriceUSD: "",
          sellingPriceZWL: "",
          expiryDate: "",
        });
        fetchProducts();
      }
    } catch (error) {
      setMessage(`❌ Failed: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="theme-retail">
      {/* 🔹 Header Bar */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <h3>
          <FaBoxOpen className="me-2" /> Add New Product
        </h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate("/inventory")}
        >
          ← Back
        </Button>
      </div>

      {/* 🔹 Alert Message */}
      {message && (
        <div
          className={`alert-message text-center fw-bold mb-3 ${
            message.startsWith("✅") ? "text-success" : "text-danger"
          }`}
        >
          {message}
        </div>
      )}

      {/* 🔹 Form Card */}
      <Card className="form-card p-4 mb-4">
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  name="productName"
                  value={product.productName}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  placeholder="e.g. Food, Clothing"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Unit</Form.Label>
                <Form.Control
                  name="unit"
                  value={product.unit}
                  onChange={handleChange}
                  placeholder="e.g. kg, litre, pcs"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Reorder Level</Form.Label>
                <Form.Control
                  type="number"
                  name="reorderLevel"
                  value={product.reorderLevel}
                  onChange={handleChange}
                  placeholder="Minimum stock level"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Selling Price (USD)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaDollarSign />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="sellingPriceUSD"
                    value={product.sellingPriceUSD}
                    onChange={handleChange}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Selling Price (ZWL)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaTags />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="sellingPriceZWL"
                    value={product.sellingPriceZWL}
                    onChange={handleChange}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="expiryDate"
                  value={product.expiryDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button className="btn-save" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </Form>
      </Card>

      {/* 🔹 Product List */}
      <Card className="list-card shadow-sm border-0">
        <Card.Header className="list-header d-flex justify-content-between align-items-center">
          <h5>📋 Product List</h5>
          <Form.Control
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "260px" }}
          />
        </Card.Header>

        <Card.Body className="p-0">
          <Table hover responsive className="m-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Reorder</th>
                <th>USD</th>
                <th>ZWL</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p, i) => (
                  <tr key={p.productId}>
                    <td>{i + 1}</td>
                    <td>{p.productName}</td>
                    <td>{p.category || "-"}</td>
                    <td>{p.unit || "-"}</td>
                    <td>{p.reorderLevel || "-"}</td>
                    <td>${p.sellingPriceUSD?.toFixed(2) || "-"}</td>
                    <td>${p.sellingPriceZWL?.toFixed(2) || "-"}</td>
                    <td>
                      {p.expiryDate
                        ? new Date(p.expiryDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AddProductPage;