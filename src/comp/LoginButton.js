import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getTabToken, getTabUser, logoutTab, hasTabSession } from "../utils/tabSession";

function LoginButton({ isMobile = false, closeMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  /* ✅ Check tab session on mount and route change */
  useEffect(() => {
    const checkTabSession = () => {
      const hasSession = hasTabSession();
      const token = getTabToken();
      setIsLoggedIn(hasSession && !!token);
    };
    checkTabSession();
  }, [location.pathname]);

  /* ✅ Listen for tab session changes (custom event) */
  useEffect(() => {
    const checkTabSession = () => {
      const hasSession = hasTabSession();
      const token = getTabToken();
      setIsLoggedIn(hasSession && !!token);
    };

    // Check periodically for session changes in this tab
    const interval = setInterval(checkTabSession, 500);

    return () => clearInterval(interval);
  }, []);

  /* ✅ Close dropdown outside */
  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const logout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/logout`, { credentials: 'include' });
    } catch (e) {
      // ignore network errors
    }

    // Use tab session logout (only clears current tab)
    logoutTab();

    setIsLoggedIn(false);
    setOpen(false);
    closeMenu?.();
    navigate("/");
  };

  /* ================= MOBILE ================= */
  if (isMobile) {
    return isLoggedIn ? (
      <button onClick={logout} className="h-mobile-logout-btn">
        Logout
      </button>
    ) : (
      <>
        <p className="h-mobile-label">Login as:</p>
        <div className="h-mobile-options">
          <Link to="/login" onClick={closeMenu}>Customer</Link>
          <Link to="/login/staff" onClick={closeMenu}>Staff</Link>
        </div>
      </>
    );
  }

  /* ================= DESKTOP ================= */
  return (
    <div className="h-nav-actions h-desktop-only" ref={dropdownRef}>
      {isLoggedIn ? (
        <button onClick={logout} className="h-login-btn">
          Logout
        </button>
      ) : (
        <>
          <button onClick={() => setOpen(!open)} className="h-login-btn">
            Login ▾
          </button>
          {open && (
            <div className="h-login-dropdown-menu">
              <Link to="/login" className="h-dropdown-item">Customer Login</Link>
              <Link to="/login/staff" className="h-dropdown-item">Staff Login</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LoginButton;
