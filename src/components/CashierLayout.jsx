import React from "react";

function CashierLayout({ children }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString();
  const timeStr = today.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#e9f1fb", // subtle pale blue-gray tone
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* 🔹 HEADER BAND */}
      <header
        style={{
          background: "linear-gradient(90deg, #004080, #007bff)",
          color: "white",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        {/* Left Side */}
        <div>
          <h4 style={{ margin: 0, fontWeight: 600 }}>🏪 Gold Masters Retail</h4>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
            Shop 3 — Harare CBD Branch
          </p>
        </div>

        {/* Right Side */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px" }}>👩‍💼 Cashier: <strong>John Moyo</strong></div>
          <div style={{ fontSize: "13px", opacity: 0.9 }}>
            {dateStr} | {timeStr}
          </div>
        </div>
      </header>

      {/* 🔸 MAIN WORK AREA */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "24px 32px",
          background: "#f9fafc",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            background: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            padding: "20px",
          }}
        >
          {children}
        </div>
      </main>

      {/* 🔹 FOOTER BAND */}
      <footer
        style={{
          background: "linear-gradient(90deg, #004080, #007bff)",
          color: "white",
          textAlign: "center",
          padding: "10px 0",
          fontSize: "13px",
          borderBottomLeftRadius: "6px",
          borderBottomRightRadius: "6px",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.15)",
        }}
      >
        © {new Date().getFullYear()} Gold Masters Retail System | Powered by RetailSuite
      </footer>
    </div>
  );
}

export default CashierLayout;