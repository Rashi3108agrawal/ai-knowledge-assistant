import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import UploadPage from "./pages/upload";
import ChatPage from "./pages/chat";
import NotesPage from "./pages/notes";
import SearchPage from "./pages/search";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import { setAuthToken } from "./api/api";
import "./styles.css";

const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds
const TOKEN_EXPIRY_WARNING = 2 * 60 * 1000; // Warn 2 minutes before expiry

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [showWarning, setShowWarning] = useState(false);
  const inactivityTimer = useRef(null);
  const warningTimer = useRef(null);

  // Reset inactivity timer on user activity
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowWarning(false);

    if (token) {
      // Warn user 2 minutes before logout
      warningTimer.current = setTimeout(() => {
        setShowWarning(true);
      }, SESSION_TIMEOUT - TOKEN_EXPIRY_WARNING);

      // Logout after 30 minutes of inactivity
      inactivityTimer.current = setTimeout(() => {
        handleLogout();
      }, SESSION_TIMEOUT);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setShowWarning(false);
  };

  const extendSession = () => {
    setShowWarning(false);
    resetInactivityTimer();
  };

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem("token", token);
      resetInactivityTimer();
    } else {
      localStorage.removeItem("token");
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    }

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [token]);

  // Add event listeners for user activity
  useEffect(() => {
    if (!token) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [token]);

  // Protect routes: redirect to login if not authenticated
  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/register" />;
    return children;
  };

  // Redirect logged-in users away from login/register pages
  const AuthRoute = ({ children }) => {
    if (token) return <Navigate to="/" />;
    return children;
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>📚 AI Knowledge Assistant</h1>
      </div>

      {/* Session Expiry Warning */}
      {showWarning && (
        <div className="message warning" style={{ marginBottom: "20px" }}>
          <strong>⏰ Session expiring soon!</strong> You'll be logged out in 2 minutes due to inactivity.
          <button 
            onClick={extendSession}
            style={{ 
              marginLeft: "15px", 
              padding: "8px 16px",
              fontSize: "0.9rem",
              background: "#ffc107",
              color: "#333"
            }}
          >
            Stay Logged In
          </button>
        </div>
      )}

      {token && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage setToken={setToken} />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <UploadPage token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage token={token} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={token ? "/" : "/register"} />} />
      </Routes>
    </div>
  );
}

export default App;