import React, { useEffect, useRef, useState } from "react";
import "../Admin/Manage_Room.css";
import { getTabToken } from "../utils/tabSession";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const token = getTabToken();

  const mainRef = useRef(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/admin/bookings/recent-bookings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed: ${res.status} - ${text}`);
      }

      const data = await res.json();
      const mapped = (data.bookings || []).map((b) => ({
        _id: b._id,
        guestName: `${b.firstName} ${b.lastName}`,
        phoneNumber: b.phone,
        roomType: b.roomTitle || b.roomId?.title || "—",
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        bookingStatus: b.bookingStatus,
      }));

      setBookings(mapped);
    } catch (err) {
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const filteredBookings = bookings.filter((b) => {
    const q = query.toLowerCase();
    return (
      b.guestName.toLowerCase().includes(q) ||
      (b.phoneNumber || "").toLowerCase().includes(q) ||
      (b.roomType || "").toLowerCase().includes(q) ||
      (b.bookingStatus || "").toLowerCase().includes(q)
    );
  });

  const highlight = (text = "", q = "") => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ background: "#fde68a", padding: "0 4px", borderRadius: 2 }}>
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const statusBadge = (status) => {
    const map = {
      Confirmed: "status-checkedin",
      Pending: "status-upcoming",
      Cancelled: "status-cancelled",
    };
    return <span className={map[status] || "status-checkedout"}>{status}</span>;
  };

  return (
    <div className="admin-container">
      <div className="main" ref={mainRef}>
        <div className="top-bar">
          <h2>Manage Bookings</h2>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="card">
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="card-title">Recent Bookings</h3>
            <div>{filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}</div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
            <input
              className="search-input"
              placeholder="Search guest, phone, room type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={() => setQuery(search)} className="secondary-btn">Search</button>
            <button onClick={() => { setSearch(""); setQuery(""); mainRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }} className="secondary-btn">Clear</button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>No bookings found</div>
          ) : (
            <table className="room-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Phone Number</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>{highlight(b.guestName, query)}</td>
                    <td>{b.phoneNumber}</td>
                    <td>{b.roomType}</td>
                    <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                    <td>{statusBadge(b.bookingStatus)}</td>
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

export default ManageBookings;
