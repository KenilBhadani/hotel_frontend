import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Admin/Manage_Room.css";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { getTabToken } from "../utils/tabSession";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function PaymentReports() {
  const navigate = useNavigate();
  const token = getTabToken();

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [distribution, setDistribution] = useState(null);
  const [distributionBy, setDistributionBy] = useState("amount");
  const [trendSeries, setTrendSeries] = useState([]);
  const [trendDays, setTrendDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH SUMMARY ================= */
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/summary?month=${month}`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to load summary");

      const data = await res.json();

      // Normalize backend data
      const paid = Number(data.paid || 0);
      const pending = Number(data.pending || 0);

      setSummary({
        totalRevenue: paid + pending,
        paidAmount: paid,
        pendingAmount: pending,
        totalBookings: Number(data.bookings || 0),
      });
    } catch (err) {
      setError(err.message || "Failed to load payment summary");
      setSummary(null);
    }
  }, [month, token]);

  /* ================= FETCH DISTRIBUTION ================= */
  const fetchDistribution = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/status-distribution?month=${month}&by=${distributionBy}`,
        { credentials: "include", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        setDistribution(null);
        return;
      }

      const d = await res.json();
      setDistribution(d);
    } catch (err) {
      console.error(err);
      setDistribution(null);
    }
  }, [month, distributionBy, token]);

  /* ================= FETCH TRENDS ================= */
  const fetchTrends = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/trends?days=${trendDays}`,
        { credentials: "include", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        setTrendSeries([]);
        return;
      }

      const data = await res.json();
      const series = (data.series || []).map((s) => ({ date: s._id, total: s.total }));
      setTrendSeries(series);
    } catch (err) {
      console.error(err);
      setTrendSeries([]);
    }
  }, [trendDays, token]);

  /* ================= FETCH TRANSACTIONS ================= */
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/transactions?month=${month}`,
        { credentials: "include", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        setTransactions([]);
        return;
      }

      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
  }, [month, token]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    Promise.all([fetchSummary(), fetchTransactions(), fetchDistribution(), fetchTrends()])
      .finally(() => setLoading(false));
  }, [month, fetchSummary, fetchTransactions, fetchDistribution, fetchTrends, trendDays, distributionBy, token, navigate]);

  /* ================= VERIFY HANDLER ================= */
  // Removed verify button handler as it is no longer used in UI
  async function handleVerify(id) {
    // ... kept for reference or if needed later
  }

  return (
    <div className="admin-container">
      <div className="main">
        <div className="top-bar">
          <h2>Payment & Reports</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label>Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* ===== SUMMARY ===== */}
        {summary && (
          <div className="card">
            <h3 className="card-title">Monthly Summary</h3>
            <div className="form-row">
              <div>
                <p><b>Total Revenue</b></p>
                <h3>₹ {summary.totalRevenue}</h3>
              </div>
              <div>
                <p><b>Paid Amount</b></p>
                <h3 style={{ color: "#16a34a" }}>₹ {summary.paidAmount}</h3>
              </div>
              <div>
                <p><b>Pending Amount</b></p>
                <h3 style={{ color: "#dc2626" }}>₹ {summary.pendingAmount}</h3>
              </div>
              <div>
                <p><b>Total Bookings</b></p>
                <h3>{summary.totalBookings}</h3>
              </div>
            </div>
          </div>
        )}

        {/* ===== TRANSACTIONS & CHARTS ===== */}
        <div className="card">
          <h3 className="card-title">Payment Overview</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
            {/* Distribution Pie Chart */}
            <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
              <h4 style={{ marginBottom: 8 }}>Status Distribution</h4>
              {distribution ? (
                <ResponsiveContainer width={300} height={220}>
                  <PieChart>
                    <Pie
                      data={Object.entries(distribution).map(([k, v]) => ({ name: k, value: v }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {Object.keys(distribution).map((k, i) => (
                        <Cell key={k} fill={["#10b981", "#f97316", "#ef4444", "#60a5fa"][i % 4]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p>No distribution data</p>}
            </div>

            {/* Revenue Trend */}
            <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
              <h4 style={{ marginBottom: 8 }}>Revenue Trend ({trendDays} days)</h4>
              {trendSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ReTooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p>No trend data</p>}
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="card">
          <h3 className="card-title">Recent Transactions</h3>
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p>No transactions found</p>
          ) : (
            <table className="room-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Booking</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{t.firstName} {t.lastName}</td>
                    <td>₹{t.totalAmount}</td>
                    <td>
                      {/* Check if marked paid by reception or completed via gateway */}
                      <span
                        className={t.paymentStatus === "Paid" ? "available" : "not-available"}
                        style={{
                          backgroundColor: t.paymentStatus === "Paid" ? "#dcfce7" : "#fee2e2",
                          color: t.paymentStatus === "Paid" ? "#166534" : "#991b1b",
                          padding: "4px 12px",
                          borderRadius: "99px",
                          fontWeight: "bold",
                          fontSize: "12px"
                        }}
                      >
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td>{t.bookingStatus}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      {/* Removed Verify Button */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentReports;
