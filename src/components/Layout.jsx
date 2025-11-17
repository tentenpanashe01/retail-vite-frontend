// ✅ src/components/Layout.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaClock,
  FaBars,
  FaTimes,
  FaAngleDown,
} from "react-icons/fa";
import { menuConfig } from "../config/menuConfig";
import "./Layout.css";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 👤 User info
  const fullName = localStorage.getItem("fullName") || "User";
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const roleLabel = roles.join(", ").replace(/ROLE_/g, "");

  // 🕒 UI state
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [openDropdown, setOpenDropdown] = useState(null);

  // ⏱️ Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🚪 Logout
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ Role filtering
  const visibleMenu = menuConfig.filter((item) =>
    item.roles.some((r) => roles.includes(r))
  );

  return (
    <div className="layout-container">
      {/* 🧭 Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>Retail POS</h2>
          <FaTimes className="close-btn" onClick={() => setSidebarOpen(false)} />
        </div>

        <nav className="menu">
          {visibleMenu.map((item) => {
            const isDropdown = item.children && item.children.length > 0;
            const isActive =
              location.pathname === item.path ||
              (isDropdown &&
                item.children.some((child) => child.path === location.pathname));

            return (
              <div key={item.title} className="menu-section">
                {isDropdown ? (
                  <>
                    {/* Dropdown parent */}
                    <button
                      className={`menu-item dropdown ${isActive ? "active" : ""}`}
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.title ? null : item.title
                        )
                      }
                    >
                      <div className="menu-left">
                        {item.icon} {/* ✅ directly render JSX icon */}
                        <span>{item.title}</span>
                      </div>
                      <FaAngleDown
                        className={`arrow ${
                          openDropdown === item.title ? "rotated" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown content */}
                    <div
                      className={`submenu-container ${
                        openDropdown === item.title ? "open" : ""
                      }`}
                    >
                      <div className="submenu">
                        {item.children
                          .filter((child) =>
                            child.roles.some((r) => roles.includes(r))
                          )
                          .map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`submenu-item ${
                                location.pathname === child.path ? "active" : ""
                              }`}
                              onClick={() =>
                                window.innerWidth <= 768 && setSidebarOpen(false)
                              }
                            >
                              {child.icon} {/* ✅ child icon */}
                              <span>{child.title}</span>
                            </Link>
                          ))}
                      </div>
                    </div>
                  </>
                ) : (
                  // Regular link
                  <Link
                    to={item.path}
                    className={`menu-item ${isActive ? "active" : ""}`}
                    onClick={() =>
                      window.innerWidth <= 768 && setSidebarOpen(false)
                    }
                  >
                    {item.icon} {/* ✅ fixed here */}
                    <span>{item.title}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{fullName}</strong>
            <small>{roleLabel}</small>
          </div>
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* 📄 Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="left">
            {!sidebarOpen && (
              <FaBars className="menu-toggle" onClick={() => setSidebarOpen(true)} />
            )}
            <div className="clock">
              <FaClock color="#003366" />
              <span>{time.toLocaleString()}</span>
            </div>
          </div>
          <div className="right">
            <FaUserCircle size={22} color="#003366" />
            <div className="user-role">
              <div>{fullName}</div>
              <small>{roleLabel}</small>
            </div>
          </div>
        </header>

        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}