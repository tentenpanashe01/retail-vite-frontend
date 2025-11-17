import React, { useEffect, useState } from "react";
import { SaleService } from "../services/sales";
import { SaleItemService } from "../services/saleItemService";
import api from "../services/api";
import Swal from "sweetalert2";
import { Button, Spinner } from "react-bootstrap";
import {
  FaShoppingCart,
  FaBoxOpen,
  FaCashRegister,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function CashierPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [shop, setShop] = useState({});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const shopId = localStorage.getItem("shopId");

  // 🔹 Load user & shop
  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
      } catch {
        setUser({
          fullName: localStorage.getItem("fullName") || "Unknown Cashier",
        });
      }
    }

    async function fetchShopDetails() {
      try {
        const res = await api.get(`/shops/${shopId}`);
        setShop(res.data);
      } catch {
        setShop({
          shopName: localStorage.getItem("shopName") || "Unknown Shop",
        });
      }
    }

    fetchUserDetails();
    fetchShopDetails();
  }, [userId, shopId]);

  // 🔹 Load stock for this shop + global stock + price adjustments
  useEffect(() => {
    if (!shopId) {
      Swal.fire("Error", "No shop assigned to this user!", "error");
      return;
    }

    async function fetchProducts() {
      try {
        setLoading(true);

        // 🟩 Step 1️⃣ — Load shop stock
        const shopStockRes = await api.get(`/shop-stock/shop/${shopId}`);
        let shopStock = shopStockRes.data || [];

        shopStock = shopStock.filter((item) => item?.product?.productName);

        // 🟩 Step 2️⃣ — Load price adjustments
        let adjustments = [];
        try {
          const adjRes = await api.get(`/pricing-adjustments/shop/${shopId}`);
          adjustments = (adjRes.data || []).sort(
            (a, b) => new Date(b.adjustmentDate) - new Date(a.adjustmentDate)
          );
        } catch (e) {
          console.warn("⚠️ No price adjustments found for this shop.");
        }

        // 🟩 Step 3️⃣ — Merge adjusted prices (latest per product)
        let mergedData = shopStock.map((item) => {
          const latestAdjustment = adjustments
            .filter(
              (adj) =>
                Number(adj.product?.productId) ===
                  Number(item.product?.productId) &&
                Number(adj.shop?.id) === Number(shopId)
            )
            .sort(
              (a, b) => new Date(b.adjustmentDate) - new Date(a.adjustmentDate)
            )[0];

          if (latestAdjustment) {
            return {
              ...item,
              product: {
                ...item.product,
                sellingPriceUSD:
                  latestAdjustment.newPriceUSD ?? item.product.sellingPriceUSD,
                sellingPriceZWL:
                  latestAdjustment.newPriceZWL ?? item.product.sellingPriceZWL,
              },
            };
          }

          return item;
        });

        // 🟩 Step 4️⃣ — Load global products (for display even if not in stock)
        const allProductsRes = await api.get("/products");
        const allProducts = allProductsRes.data || [];

        const stockProductIds = new Set(
          mergedData.map((s) => s.product?.productId)
        );

        const missingProducts = allProducts
          .filter((p) => !stockProductIds.has(p.productId))
          .map((p) => ({
            product: p,
            quantityInStock: 0,
            notInShop: true,
          }));

        mergedData = [...mergedData, ...missingProducts];

        // 🟩 Step 5️⃣ — Sort: in-stock first
        mergedData.sort((a, b) => b.quantityInStock - a.quantityInStock);

        setProducts(mergedData);
      } catch (err) {
        console.error("Inventory load error:", err);
        Swal.fire("Error", "Failed to load products.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [shopId]);

  // 🛒 Cart
  const addToCart = (item) => {
    if (!item?.product) return;

    if (item.quantityInStock <= 0) {
      Swal.fire("Stock Alert", "Product not in stock!", "warning");
      return;
    }

    const existing = cart.find(
      (p) => p.product.productId === item.product.productId
    );
    if (existing) {
      if (existing.quantity + 1 > item.quantityInStock) {
        Swal.fire("Stock Alert", "Not enough stock!", "warning");
        return;
      }
      setCart(
        cart.map((p) =>
          p.product.productId === item.product.productId
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setCart([...cart, { product: item.product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) =>
    setCart(cart.filter((p) => p.product.productId !== productId));

  const totalUSD = cart.reduce(
    (sum, i) => sum + (i.product.sellingPriceUSD || 0) * i.quantity,
    0
  );
  const totalZWL = cart.reduce(
    (sum, i) => sum + (i.product.sellingPriceZWL || 0) * i.quantity,
    0
  );

  // 🧾 Checkout
  const handleCheckout = async () => {
    if (cart.length === 0)
      return Swal.fire("Notice", "Cart is empty.", "info");

    try {
      const sale = await SaleService.createSale(shopId, userId, {
        paymentMethod: "CASH",
        saleItems: cart.map((c) => ({
          product: { productId: c.product.productId },
          quantity: c.quantity,
        })),
      });

      for (const item of cart) {
        await SaleItemService.createSaleItem({
          product: { productId: item.product.productId },
          quantity: item.quantity,
          sale: { saleId: sale.saleId },
        });
      }

      Swal.fire("✅ Success", "Sale completed successfully!", "success");
      setCart([]);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to complete sale.", "error");
    }
  };

  const filtered = products.filter((p) =>
    p?.product?.productName?.toLowerCase().includes(search.toLowerCase())
  );

  // 🧭 Layout
  return (
    <div className="theme-retail">
      {/* Header */}
      <div className="header-bar d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <h3 className="m-0">
            <FaCashRegister className="me-2" />
            Cashier Terminal
          </h3>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate("/sales/history")}
          >
            <FaChartLine className="me-1" /> View Reports
          </Button>
        </div>

        <div className="text-end">
          <div className="fw-bold">{user.fullName || "Cashier"}</div>
          <small className="text-light">
            {shop.shopName ? `Shop: ${shop.shopName}` : "Shop not assigned"}
          </small>
        </div>
      </div>

      {/* Main Layout */}
      <div
        className="d-flex flex-wrap"
        style={{
          gap: "20px",
          padding: "20px",
          background: "#f9fbff",
          minHeight: "90vh",
        }}
      >
        {/* Left: Product Grid */}
        <div
          style={{
            flex: "2",
            background: "#fff",
            borderRadius: "8px",
            padding: "16px",
            minWidth: "360px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-primary mb-0">
              <FaBoxOpen className="me-2" />
              Available Products
            </h5>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product..."
              style={{
                padding: "6px 10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "12px",
              }}
            >
              {filtered.length ? (
                filtered.map((item) => (
                  <div
                    key={item.product.productId}
                    onClick={() => addToCart(item)}
                    className="p-2 text-center"
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      cursor:
                        item.quantityInStock > 0 ? "pointer" : "not-allowed",
                      background:
                        item.quantityInStock > 0 ? "#ffffff" : "#f0f0f0",
                      opacity: item.quantityInStock > 0 ? 1 : 0.5,
                      transition: "0.2s",
                    }}
                  >
                    <h6
                      className="mb-1"
                      style={{
                        color:
                          item.quantityInStock > 0 ? "#003366" : "#888888",
                      }}
                    >
                      {item.product.productName}
                    </h6>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      ${item.product.sellingPriceUSD?.toFixed(2)} | ZWL{" "}
                      {item.product.sellingPriceZWL?.toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color:
                          item.quantityInStock > 0 ? "green" : "crimson",
                      }}
                    >
                      {item.notInShop
                        ? "🚫 Not in shop"
                        : `In Stock: ${item.quantityInStock ?? 0}`}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">No products found.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Cart */}
        <div
          style={{
            flex: "1",
            background: "#fff",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            minWidth: "300px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h5 className="text-primary mb-3">
            <FaShoppingCart className="me-2" />
            Current Sale
          </h5>

          {cart.length === 0 ? (
            <p className="text-muted">No items added yet.</p>
          ) : (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {cart.map((c) => (
                <div
                  key={c.product.productId}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >
                  <div>
                    <strong>{c.product.productName}</strong>
                    <div className="small text-muted">
                      {c.quantity} × ${c.product.sellingPriceUSD?.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-end">
                    ${(c.quantity * c.product.sellingPriceUSD).toFixed(2)}
                    <div>
                      <button
                        onClick={() => removeFromCart(c.product.productId)}
                        className="btn btn-link text-danger p-0 small"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="pt-3 border-top mt-3">
            <p className="mb-1 fw-bold">Total USD: ${totalUSD.toFixed(2)}</p>
            <p className="mb-3 fw-bold">Total ZWL: {totalZWL.toFixed(2)}</p>
            <Button className="btn-save w-100" onClick={handleCheckout}>
              Complete Sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashierPage;