// ✅ src/config/menuConfig.jsx
import {
  FaChartLine,
  FaStore,
  FaBoxes,
  FaShoppingCart,
  FaMoneyBill,
  FaClipboardList,
  FaCog,
  FaCashRegister,
  FaHistory,
  FaUserShield,
  FaTag,
  FaTruck,
  FaExchangeAlt,
  FaListAlt,
  FaChartPie,
  FaPlusCircle,
  FaTasks,
  FaCheckCircle,
  FaFileInvoiceDollar,
} from "react-icons/fa";

export const menuConfig = [
  // ──────────────── DASHBOARD ────────────────
  {
    title: "Dashboard",
    path: "/",
    icon: <FaChartLine />,
    roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
  },

  // ──────────────── SHOPS ────────────────
  {
    title: "Shops",
    path: "/shops",
    icon: <FaStore />,
    roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
  },

  // ──────────────── INVENTORY ────────────────
  {
    title: "Inventory",
    path: "/inventory",
    icon: <FaBoxes />,
    roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN", "ROLE_SUPERVISOR"],
    children: [
      {
        title: "Add Product",
        path: "/inventory/add",
        icon: <FaTag />,
        roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
      },
      {
        title: "Adjust Price",
        path: "/inventory/adjust-price",
        icon: <FaListAlt />,
        roles: ["ROLE_SUPERVISOR", "ROLE_ADMIN", "ROLE_SUPERADMIN"],
      },
      {
        title: "Stock Adjustment",
        path: "/inventory/adjust-stock",
        icon: <FaExchangeAlt />,
        roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
      },
      {
        title: "Stock Transfer",
        path: "/inventory/transfer",
        icon: <FaTruck />,
        roles: ["ROLE_SUPERVISOR"],
      },

      {
        title: "Shop Stock",
        path: "/inventory/shop-stock",
        icon: <FaBoxes />,
        roles: ["ROLE_SUPERVISOR", "ROLE_ADMIN", "ROLE_SUPERADMIN"],  
      },


      {
        title: "Stock Logs",
        path: "/inventory/logs",
        icon: <FaClipboardList />,
        roles: ["ROLE_SUPERVISOR", "ROLE_ADMIN", "ROLE_SUPERADMIN"],
      },
    ],
  },

  // ──────────────── PURCHASES ────────────────
  {
    title: "Purchases",
    path: "/purchases",
    icon: <FaShoppingCart />,
    roles: ["ROLE_SUPERVISOR", "ROLE_ADMIN", "ROLE_SUPERADMIN"],
    children: [
      // DASHBOARD
      {
        title: "Purchase Dashboard",
        path: "/purchases/dashboard",
        icon: <FaChartPie />,
        roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
      },
      // CREATE ORDER
      {
        title: "Create Purchase Order",
        path: "/purchase-orders/create",
        icon: <FaPlusCircle />,
        roles: ["ROLE_SUPERVISOR"],
      },
      // ADD ITEMS
      {
        title: "Add Purchase Items",
        path: "/purchase-orders/items/add",
        icon: <FaTasks />,
        roles: ["ROLE_SUPERVISOR"],
      },
      // RECORD EXPENSES
      {
        title: "Record Purchase Expenses",
        path: "/purchase-orders/expenses/add",
        icon: <FaFileInvoiceDollar />,
        roles: ["ROLE_SUPERVISOR"],
      },
      // VIEW & COMPLETE
      {
        title: "View / Complete Purchases",
        path: "/purchase-orders",
        icon: <FaCheckCircle />,
        roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
      },
    ],
  },

  // ──────────────── EXPENSES ────────────────
  {
    title: "Expenses",
    path: "/expenses",
    icon: <FaMoneyBill />,
    roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN", "ROLE_SUPERVISOR", "ROLE_CASHIER"],
    children: [
      {
        title: "Record Expense",
        path: "/expenses/record",
        icon: <FaClipboardList />,
        roles: ["ROLE_SUPERVISOR", "ROLE_CASHIER"],
      },
      {
        title: "Create Category",
        path: "/expenses/create",
        icon: <FaUserShield />,
        roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
      },
    ],
  },

  // ──────────────── REPORTS ────────────────
  {
    title: "Reports",
    path: "/reports",
    icon: <FaClipboardList />,
    roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN", "ROLE_MANAGER"],
  },

  // ──────────────── SETTINGS ────────────────
  {
    title: "Settings",
    path: "/settings",
    icon: <FaCog />,
    roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
    children: [
      {
        title: "User Management",
        path: "/settings/users",
        icon: <FaUserShield />,
        roles: ["ROLE_ADMIN", "ROLE_SUPERADMIN"],
      },
    ],
  },

  // ──────────────── CASHIER SECTION ────────────────
  {
    title: "Cashier POS",
    path: "/cashier",
    icon: <FaCashRegister />,
    roles: ["ROLE_CASHIER"],
  },
  {
    title: "Sales History",
    path: "/sales/history",
    icon: <FaHistory />,
    roles: ["ROLE_CASHIER", "ROLE_ADMIN", "ROLE_SUPERADMIN"],
  },
];