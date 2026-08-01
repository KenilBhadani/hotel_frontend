import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../Componentcss/Registration.css";
import { setTabSession, SESSION_TYPES } from "../utils/tabSession";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// helper to safely parse JSON responses and handle HTML errors
async function parseApiResponse(res) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : {};
    return { ok: res.ok, status: res.status, data, text };
  } catch (e) {
    return { ok: res.ok, status: res.status, data: null, text };
  }
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isRecovery, setIsRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get("token") || params.get("resetToken");
    if (token) setResetToken(token);

    const googleToken = params.get("token");
    if (googleToken) {
      (async () => {
        try {
          const res = await fetch(`${API}/api/auth/me`, { credentials: 'include', headers: { Authorization: `Bearer ${googleToken}` } });
          const parsed = await parseApiResponse(res);
          if (!parsed.ok) return navigate('/login');

          const user = parsed.data;
          if (user.role === 'admin') {
            setTabSession(SESSION_TYPES.ADMIN, googleToken, user);
            navigate('/admin', { replace: true });
          } else {
            setTabSession(SESSION_TYPES.GUEST, googleToken, user);
            navigate('/', { replace: true });
          }
        } catch (e) {
          navigate('/login');
        }
      })();
    }
  }, [location.search, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Email and password are required");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const parsed = await parseApiResponse(res);
      if (!parsed.ok) throw new Error((parsed.data && parsed.data.message) || `Login failed (${parsed.status})`);

      const data = parsed.data;
      if (data.user.role === 'admin') {
        setTabSession(SESSION_TYPES.ADMIN, data.token, data.user);
        navigate('/admin');
      } else {
        setTabSession(SESSION_TYPES.GUEST, data.token, data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const parsed = await parseApiResponse(res);
      if (!parsed.ok) throw new Error((parsed.data && parsed.data.message) || `Failed to send email (${parsed.status})`);

      setMessage('Password reset link sent to your email.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken) return setError("Invalid or missing token");

    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: form.password }),
      });
      const parsed = await parseApiResponse(res);
      if (!parsed.ok) throw new Error((parsed.data && parsed.data.message) || `Reset failed (${parsed.status})`);

      setMessage('Password reset successful. You can login now.');
      setIsRecovery(false);
      setResetToken('');
      setForm({ email: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="reg-split-layout">
      <div className="reg-form-side">
        <div className="reg-form-container">
          <div className="reg-form-header">
            <h1 className="reg-main-title">
              {resetToken ? "Reset Password" : isRecovery ? "Recover Password" : "Welcome Back"}
            </h1>
            <p className="reg-sub-title">
              {resetToken
                ? "Enter your new password"
                : isRecovery
                  ? "Enter your email to receive reset link"
                  : "Please enter your details to sign in."}
            </p>
          </div>

          {!resetToken && !isRecovery && (
            <>
              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Continue with Google
              </button>
              <div className="reg-separator"><span>or use email</span></div>
            </>
          )}

          {error && <div className="reg-status-msg error">{error}</div>}
          {message && <div className="reg-status-msg success">{message}</div>}

          {/* Forms */}
          {resetToken ? (
            <form className="reg-main-form" onSubmit={handleResetPasswordSubmit}>
              <div className="input-field">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Reset Password</button>
            </form>
          ) : isRecovery ? (
            <form className="reg-main-form" onSubmit={handleRecoverySubmit}>
              <div className="input-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Send Reset Link</button>
              <div className="forgot-pass-link" onClick={() => setIsRecovery(false)}>← Back to Login</div>
            </form>
          ) : (
            <form className="reg-main-form" onSubmit={handleSubmit}>
              <div className="input-field">
                <label>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="input-field">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label>Password</label>
                  <span className="forgot-pass-link" onClick={() => setIsRecovery(true)}>Forgot Password?</span>
                </div>
                <input type="password" name="password" value={form.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="submit-btn">{loading ? "Signing in..." : "Login"}</button>
            </form>
          )}

          {!resetToken && !isRecovery && (
            <div className="reg-login-redirect">
              Don't have an account? <Link to="/register">Sign up</Link>
            </div>
          )}
        </div>
      </div>

      <div className="reg-image-side">
        <div className="reg-overlay">
          <div className="reg-glass-card">
            <h2 className="reg-brand-logo">Royal<span>Park</span></h2>
            <div className="reg-divider-gold"></div>
            <p className="reg-brand-tagline">Welcome back to your luxury escape.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
