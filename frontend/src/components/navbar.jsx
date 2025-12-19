import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">📤 Upload PDF</Link>
      <Link to="/chat" className="nav-link">💬 Chat</Link>
      <Link to="/notes" className="nav-link">📝 Notes</Link>
      <Link to="/search" className="nav-link">🔍 Search</Link>
      <button 
        onClick={handleLogout}
        className="nav-link"
        style={{ 
          border: "none",
          cursor: "pointer",
          background: "#dc3545",
          color: "white"
        }}
      >
        🚪 Logout
      </button>
    </nav>
  );
}
