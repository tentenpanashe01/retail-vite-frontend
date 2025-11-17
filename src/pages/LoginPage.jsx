import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserService } from "../services/userService";
import Swal from "sweetalert2";
import "./LoginPage.css"; // 🎨 Import animation styles

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await UserService.login(username, password);

      localStorage.setItem("token", res.token);
      localStorage.setItem("roles", JSON.stringify(res.roles));
      localStorage.setItem("username", res.username);
      localStorage.setItem("fullName", res.fullName);

      if (res.shopId) {
        localStorage.setItem("shopId", res.shopId);
        localStorage.setItem("shopName", res.shopName);
      } else {
        localStorage.removeItem("shopId");
        localStorage.removeItem("shopName");
      }

      Swal.fire({
        icon: "success",
        title: "Welcome",
        text: `Logged in as ${res.fullName}`,
        timer: 1200,
        showConfirmButton: false,
      });

      navigate("/redirect");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.error || "Invalid username or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background bubbles */}
      <ul className="bubbles">
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i}></li>
        ))}
      </ul>

      {/* Login form */}
      <form onSubmit={handleLogin} className="login-form">
        <h2>Retail POS Login</h2>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;