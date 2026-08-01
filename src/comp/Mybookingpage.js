// src/pages/MyBookingPage.js
import React, { useEffect, useState } from "react";
import HeaderOfCustomer from "./HeaderOfCustomer";
import Footer from "./footer";
import "../Componentcss/Mybooking.css";
import { getTabToken, hasTabSession } from "../utils/tabSession";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Placeholder if no image is available
const PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

// Helper: safely get the room image URL
function getRoomImageSrc(room) {
  if (!room || !room.images || room.images.length === 0) return PLACEHOLDER;

  const img = room.images[0];
  if (img.startsWith("http://") || img.startsWith("https://")) return img;

  const safeName = String(img).trim().replace(/^\/+/, "").replace(/^uploads\//, "");
  const base = API_BASE.replace(/\/$/, "");
  return `${base}/uploads/${encodeURIComponent(safeName)}`;
}

export default function MyBookingPage({ initialGuestEmail = "" }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("mine"); // "mine" | "history"
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState({});
  const [reviewStatus, setReviewStatus] = useState({});
  const [reviewSubmitted, setReviewSubmitted] = useState({});
  const [reviewOpen, setReviewOpen] = useState({});

  // Check if user is logged in using tab session
  useEffect(() => {
    if (!hasTabSession()) {
      // No active session in this tab, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  // Helper to get auth info from tab session
  const getAuthInfo = () => {
    const token = getTabToken();
    return { token };
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const { token } = getAuthInfo();
      const url = `${API_BASE}/api/bookings/my`;
      const options = { method: "GET", headers: {} };
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      } else {
        options.credentials = "include";
      }

      const res = await fetch(url, options);
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        const msg = data && data.error ? data.error : `Server error: ${res.status}`;
        throw new Error(msg);
      }

      const normalized = Array.isArray(data) ? data : [];
      setBookings(normalized);
    } catch (err) {
      console.error("Fetch My Bookings Error:", err);
      setError(err.message || "Unable to load bookings. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFlag]);

  const getBookingDate = (booking) => {
    if (booking?.checkOut) return new Date(booking.checkOut);
    if (booking?.checkIn) return new Date(booking.checkIn);
    return null;
  };

  const isPastBooking = (booking) => {
    if (booking?.bookingStatus === "Cancelled") return true;
    const endDate = getBookingDate(booking);
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  const visibleBookings =
    mode === "history"
      ? bookings.filter(isPastBooking)
      : bookings.filter((b) => !isPastBooking(b));

  // Cancel booking
  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setLoading(true);
    setError("");
    try {
      const { token } = getAuthInfo();
      const url = `${API_BASE}/api/bookings/${bookingId}/cancel`;
      const options = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: token ? undefined : "include",
      };
      if (token) options.headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, options);
      const body = await res.json();
      if (!res.ok) {
        const msg = body && body.error ? body.error : `Cancel failed: ${res.status}`;
        throw new Error(msg);
      }
      setRefreshFlag((f) => f + 1);
    } catch (err) {
      console.error("Cancel booking error:", err);
      setError(err.message || "Cancel failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateReviewDraft = (bookingId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [bookingId]: {
        rating: prev[bookingId]?.rating ?? 5,
        comment: prev[bookingId]?.comment ?? "",
        [field]: value,
      },
    }));
  };

  const submitReview = async (bookingId) => {
    const draft = reviewDrafts[bookingId] || { rating: 5, comment: "" };
    const rating = Number(draft.rating);

    if (!rating || rating < 1 || rating > 5) {
      setReviewStatus((prev) => ({
        ...prev,
        [bookingId]: { type: "error", text: "Please select a rating between 1 and 5." },
      }));
      return;
    }

    setReviewSubmitting((prev) => ({ ...prev, [bookingId]: true }));
    setReviewStatus((prev) => ({ ...prev, [bookingId]: { type: "", text: "" } }));

    try {
      const res = await fetch(`${API_BASE}/api/reviews/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rating,
          comment: (draft.comment || "").trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit review");
      }

      setReviewSubmitted((prev) => ({ ...prev, [bookingId]: true }));
      setReviewOpen((prev) => ({ ...prev, [bookingId]: true }));
      setReviewStatus((prev) => ({
        ...prev,
        [bookingId]: { type: "success", text: "Review submitted successfully." },
      }));
    } catch (err) {
      setReviewStatus((prev) => ({
        ...prev,
        [bookingId]: { type: "error", text: err.message || "Failed to submit review." },
      }));
    } finally {
      setReviewSubmitting((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const renderStarPicker = (bookingId) => {
    const currentRating = Number(reviewDrafts[bookingId]?.rating ?? 5);

    return (
      <div className="star-picker" role="radiogroup" aria-label="Select rating">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= currentRating;
          return (
            <button
              key={star}
              type="button"
              className={`star-btn ${active ? "active" : ""}`}
              onClick={() => updateReviewDraft(bookingId, "rating", star)}
              disabled={reviewSubmitted[bookingId] || reviewSubmitting[bookingId]}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              {"\u2605"}
            </button>
          );
        })}
        <span className="star-value">{currentRating}/5</span>
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <header className="app-header">
        <HeaderOfCustomer />
      </header>
      <main className="main-content">
        <div className="mybooking-container">
          <div className="mybooking-header">
            <h1 className="header-title">{mode === "history" ? "Booking History" : "My Bookings"}</h1>
          </div>

          <div className="tabs-container">
            <button
              className={`tab-btn ${mode === "mine" ? "active" : ""}`}
              onClick={() => {
                setMode("mine");
                setError("");
              }}
            >
              My Bookings
            </button>
            <button
              className={`tab-btn ${mode === "history" ? "active" : ""}`}
              onClick={() => {
                setMode("history");
                setError("");
              }}
            >
              History
            </button>
          </div>

          <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
            <button
              className="btn btn-details"
              onClick={() => {
                setError("");
                setRefreshFlag((f) => f + 1);
              }}
              disabled={loading}
            >
              Refresh
            </button>
            <button
              className="btn btn-dark"
              onClick={() => {
                setBookings([]);
                setError("");
              }}
            >
              Clear
            </button>
          </div>

          {loading && <p>Loading bookings...</p>}
          {error && <p style={{ color: "crimson" }}>{error}</p>}

          {!loading && !error && visibleBookings.length === 0 && (
            <div className="empty-state">
              <p>{mode === "history" ? "No past bookings found." : "No upcoming bookings found."}</p>
            </div>
          )}

          {!loading && !error && visibleBookings.length > 0 && (
            <div className="bookings-grid">
              {visibleBookings.map((b) => (
                <div key={b._id} className="booking-card">
                  <div className="card-image-wrapper">
                    <img
                      src={getRoomImageSrc(b.roomId)}
                      alt={b.roomId?.title || "Room"}
                      className="card-img"
                    />
                    <div className={`status-badge status-${(b.bookingStatus || "default").toLowerCase()}`}>
                      {b.bookingStatus || "Unknown"}
                    </div>
                  </div>
                  <div className="card-content">
                    <h3 className="hotel-name">{b.roomId?.title || b.roomTitle || "Room"}</h3>
                    <p className="hotel-location">{b.email}</p>
                    <div className="booking-details">
                      <div className="detail-row">
                        <span>Check-in:</span>
                        <span className="detail-value">
                          {b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span>Check-out:</span>
                        <span className="detail-value">
                          {b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span>Nights:</span>
                        <span className="detail-value">{b.nights ?? "—"}</span>
                      </div>
                      <div className="detail-row">
                        <span>Payment:</span>
                        <span className="detail-value">{b.paymentStatus}</span>
                      </div>
                    </div>
                    <div className="detail-footer">
                      <div className="price-tag">${b.totalAmount ?? "—"}</div>
                    </div>
                    <div className="card-actions">
                      {mode === "mine" && b.bookingStatus !== "Cancelled" && (
                        <button
                          className="btn btn-primary"
                          onClick={() => cancelBooking(b._id)}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      )}

                      {mode === "history" && b.bookingStatus !== "Cancelled" && (
                        <div className="review-box">
                          {!reviewOpen[b._id] ? (
                            <button
                              className="btn review-open-btn"
                              onClick={() => setReviewOpen((prev) => ({ ...prev, [b._id]: true }))}
                            >
                              Write a Review
                            </button>
                          ) : (
                            <div className="review-form-card">
                              <h4 className="review-title">Rate Your Stay</h4>
                              <div className="review-fields">
                                {renderStarPicker(b._id)}
                                <textarea
                                  rows="3"
                                  placeholder="Share your experience..."
                                  value={reviewDrafts[b._id]?.comment ?? ""}
                                  onChange={(e) => updateReviewDraft(b._id, "comment", e.target.value)}
                                  className="review-input review-textarea"
                                  disabled={reviewSubmitted[b._id] || reviewSubmitting[b._id]}
                                />
                              </div>
                              <div className="review-actions">
                                {!reviewSubmitted[b._id] && (
                                  <button
                                    type="button"
                                    className="btn btn-details"
                                    onClick={() =>
                                      setReviewOpen((prev) => ({ ...prev, [b._id]: false }))
                                    }
                                    disabled={reviewSubmitting[b._id]}
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  className="btn btn-primary"
                                  onClick={() => submitReview(b._id)}
                                  disabled={reviewSubmitted[b._id] || reviewSubmitting[b._id]}
                                >
                                  {reviewSubmitted[b._id]
                                    ? "Review Submitted"
                                    : reviewSubmitting[b._id]
                                      ? "Submitting..."
                                      : "Submit Review"}
                                </button>
                              </div>
                            </div>
                          )}
                          {reviewStatus[b._id]?.text && (
                            <p
                              className={
                                reviewStatus[b._id].type === "success"
                                  ? "review-msg review-success"
                                  : "review-msg review-error"
                              }
                            >
                              {reviewStatus[b._id].text}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="app-footers">
        <Footer />
      </footer>
    </div>
  );
}
