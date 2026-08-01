import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../Componentcss/Login.css";

const API = process.env.REACT_APP_API_URL;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Get token from URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    if (!t) {
      setError("Invalid or missing token");
    } else {
      setToken(t);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setMessage("Password reset successful! You can now login.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-split-layout">
      <div className="reg-form-side">
        <div className="reg-form-container">
          <div className="reg-form-header">
            <h1 className="reg-main-title">Reset Password</h1>
            <p className="reg-sub-title">
              Enter your new password to continue.
            </p>
          </div>

          {error && <div className="reg-status-msg error">{error}</div>}
          {message && <div className="reg-status-msg success">{message}</div>}

          <form className="reg-main-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div style={{ marginTop: "12px" }}>
              <Link to="/login">← Back to Login</Link>
            </div>
          </form>
        </div>
      </div>

      <div className="reg-image-side">
        <div className="reg-overlay">
          <div className="reg-glass-card">
            <h2 className="reg-brand-logo">
              Royal<span>Park</span>
            </h2>
            <div className="reg-divider-gold"></div>
            <p className="reg-brand-tagline">Securely reset your password.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
