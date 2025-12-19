import React, { useState, useEffect } from "react";
import { loginUser, setAuthToken } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });
      const token = res.data.token;
      localStorage.setItem("token", token);
      setAuthToken(token);
      setToken(token);
      navigate("/"); // Redirect to upload page
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>🔐 Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} disabled={!email || !password}>
        Login
      </button>
      {error && <div className="message error">{error}</div>}
      <div className="auth-link">
        Don't have an account? <a href="/register">Register here</a>
      </div>
    </div>
  );
}
