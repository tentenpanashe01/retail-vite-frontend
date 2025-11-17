// src/services/expenses.js
import api from "./api";

const API_URL = "http://localhost:8080/api/expenses";

// ✅ Create a new operational expense
const createOperational = (expenseData) =>
  api.post(`${API_URL}`, {
    ...expenseData,
    expenseType: "OPERATIONAL", // auto-assign type
  });

// ✅ Get all expenses 
const getAll = () => api.get(API_URL);

export default {
  createOperational,
  getAll,
};
