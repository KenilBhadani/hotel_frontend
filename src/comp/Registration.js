import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Componentcss/Registration.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const pendingEmail = String(localStorage.getItem("pendingMembershipEmail") || "").trim();
    if (pendingEmail) {
      setForm((prev) => ({ ...prev, email: pendingEmail }));
    }
  }, []);

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setFieldErrors({});
    setSuccess(null);
  };

  // ================= LOCAL REGISTER =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setFieldErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(form.phone)) {
      setError("Invalid phone number");
      setFieldErrors({ phone: "Invalid phone number (must start with 6-9 and be 10 digits)" });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle field-specific errors
        if (data.field) {
          setFieldErrors({ [data.field]: data.message });
        }
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      localStorage.removeItem("pendingMembershipEmail");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE SIGNUP =================
  const handleGoogleSignup = () => {
    setError(null);
    setSuccess(null);
    window.location.href = `${API}/api/auth/google`;
  };

  // ================= UI =================
  return (
    <div className="reg-split-layout">
      {/* LEFT SIDE */}
      <div className="reg-image-side">
        <div className="reg-overlay">
          <div className="reg-glass-card">
            <h2 className="reg-brand-logo">
              Royal<span>Park</span>
            </h2>
            <div className="reg-divider-gold"></div>
            <p className="reg-brand-tagline">
              Experience the Art of Hospitality
            </p>
            <ul className="reg-features-list">
              <li>✦ Member-only luxury suites</li>
              <li>✦ 24/7 Concierge at your service</li>
              <li>✦ Seamless booking experience</li>
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="reg-form-side">
        <div className="reg-form-container">
          <div className="reg-form-header">
            <h1 className="reg-main-title">Create Account</h1>
            <p className="reg-sub-title">
              Welcome! Please enter your details.
            </p>
          </div>

          {/* GOOGLE SIGNUP */}
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />
            Continue with Google
          </button>

          <div className="reg-separator">
            <span>or use email</span>
          </div>

          {error && <div className="reg-status-msg error">{error}</div>}
          {success && <div className="reg-status-msg success">{success}</div>}

          {/* LOCAL REGISTER */}
          <form className="reg-main-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <label>Full Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className={fieldErrors.name ? "error-input" : ""}
                required
              />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>

            <div className="input-field">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={fieldErrors.email ? "error-input" : ""}
                required
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="input-field">
              <label>Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={fieldErrors.phone ? "error-input" : ""}
                placeholder="10-digit mobile number"
                required
              />
              {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
            </div>

            <div className="form-row">
              <div className="input-field">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? "error-input" : ""}
                  placeholder="Min 6 characters"
                  required
                />
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              </div>

              <div className="input-field">
                <label>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={fieldErrors.confirmPassword ? "error-input" : ""}
                  required
                />
                {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : "Create Account"}
            </button>
          </form>

          <p className="reg-login-redirect">
            Already a member? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
