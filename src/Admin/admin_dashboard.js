import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  CreditCard,
  UserCog,
  LogOut,
  ClipboardCheck
} from "lucide-react";
import "./admin_dashboard.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { getTabToken, getTabUser, logoutTab } from "../utils/tabSession";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ================= HELPERS ================= */

function getLastNMonths(n = 12) {
  const months = [];
  const now = new Date();

  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    months.push({ key, label });
  }
  return months;
}

function buildTrendSeries(trends, days) {
  if (!trends) return [];

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  const bookingsMap = (trends.bookings || []).reduce((a, b) => {
    a[b._id] = b.count;
    return a;
  }, {});

  const revenueMap = (trends.revenue || []).reduce((a, r) => {
    a[r._id] = r.total;
    return a;
  }, {});

  const data = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    data.push({
      date: key,
      bookings: bookingsMap[key] || 0,
      revenue: revenueMap[key] || 0,
    });
  }
  return data;
}

/* ================= DASHBOARD ================= */

export function DashboardHome() {
  const [token, setToken] = useState(null);
  const [tokenReady, setTokenReady] = useState(false);

  // Initialize token from tab session
  useEffect(() => {
    const initToken = () => {
      const t = getTabToken();
      setToken(t);
      setTokenReady(true);
    };
    initToken();
  }, []);

  const months = getLastNMonths(12);
  const [selectedMonth, setSelectedMonth] = useState(months[0].key);

  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [trendDays] = useState(30);

  const [loading, setLoading] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = useMemo(() =>
    token ? { Authorization: `Bearer ${token}` } : {},
    [token]
  );

  /* ================= FETCHERS ================= */

  const fetchOverview = useCallback(async (month) => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const res = await fetch(
        `${API}/api/admin/overview?month=${month}`,
        { headers: authHeaders, credentials: "include" }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load overview (${res.status})`);
      }
      setOverview(await res.json());
    } catch (err) {
      console.error("Overview fetch error:", err);
      setError(err.message);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: authHeaders,
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setStats(null);
    }
  }, [authHeaders]);

  const fetchTrends = useCallback(async () => {
    try {
      setLoadingTrends(true);
      const res = await fetch(
        `${API}/api/admin/trends?days=${trendDays}`,
        { headers: authHeaders, credentials: "include" }
      );
      if (!res.ok) throw new Error();
      setTrends(await res.json());
    } catch {
      setTrends(null);
    } finally {
      setLoadingTrends(false);
    }
  }, [authHeaders, trendDays]);

  useEffect(() => {
    if (!token) return;
    fetchOverview(selectedMonth);
    fetchStats();
    fetchTrends();
  }, [selectedMonth, fetchOverview, fetchStats, fetchTrends, token]);

  /* ================= UI ================= */

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <header className="top-bar">
        <div>
          <h2>Admin Dashboard</h2>
          <span className="subtitle">Overview & analytics</span>
        </div>

        <select
          className="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </header>

      {error && <div className="error-box">{error}</div>}

      {/* ===== KPI CARDS ===== */}
      <section className="cards-grid">
        <div className="kpi-card accent-indigo">
          <h4>Total Bookings</h4>
          <h2>{loading ? "—" : overview?.totalBookings ?? "—"}</h2>
        </div>

        <div className="kpi-card accent-green">
          <h4>Rooms Available</h4>
          <h2>{loading ? "—" : overview?.roomsAvailable ?? "—"}</h2>
        </div>

        <div className="kpi-card accent-yellow">
          <h4>Monthly Revenue</h4>
          <h2>{stats ? `₹${stats.revenueMonth?.toLocaleString()}` : "—"}</h2>
        </div>

        <div className="kpi-card accent-purple">
          <h4>Occupancy</h4>
          <h2>{stats ? `${stats.occupancy}%` : "—"}</h2>
        </div>
      </section>

      {/* ===== CHART ===== */}
      <section className="card">
        <div className="card-header">
          <h3>Bookings & Revenue Trends</h3>
          <span>{trendDays} days</span>
        </div>

        {loadingTrends ? (
          <p className="muted">Loading trends...</p>
        ) : trends ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={buildTrendSeries(trends, trendDays)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="bookings" stroke="#6366F1" dot={false} />
              <Line dataKey="revenue" stroke="#F59E0B" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="muted center">No trend data</p>
        )}
      </section>
    </>
  );
}

/* ================= LAYOUT ================= */

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutTab();
    navigate("/");
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/manage-room", label: "Rooms", icon: <BedDouble size={20} /> },
    { path: "/admin/manage-booking", label: "Bookings", icon: <CalendarDays size={20} /> },
    { path: "/admin/manage-user", label: "Users", icon: <Users size={20} /> },
    { path: "/admin/manage-payment", label: "Payments", icon: <CreditCard size={20} /> },
    { path: "/admin/manage-staff", label: "Staff", icon: <UserCog size={20} /> },
    { path: "/admin/room-status", label: "Room Status", icon: <ClipboardCheck size={20} /> },
    { path: "/admin/tasks", label: "Tasks", icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-mark">RP</div>
          <div>
            <h1 className="logo">RoyalPark Admin</h1>
            <p className="logo-subtitle">Control Center</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-title">Navigation</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/admin" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="nav-dot" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon"><LogOut size={18} /></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
