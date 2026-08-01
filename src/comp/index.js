import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Componentcss/index.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginButton from "./LoginButton";
import { hasTabSession, getTabToken } from "../utils/tabSession";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Horosection() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    roomType: "",
    guests: 1,
  });

  // Fetch room types from backend
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await fetch(`${API}/api/rooms/types`);
        if (res.ok) {
          const types = await res.json();
          if (types && types.length > 0) {
            setRoomTypes(types);
          } else {
            // Fallback to default types if no types in database
            setRoomTypes(["Single", "Double", "Twin", "Deluxe", "Suite", "Family", "Standard", "Executive", "Presidential"]);
          }
        } else {
          // Fallback if API fails
          setRoomTypes(["Single", "Double", "Twin", "Deluxe", "Suite", "Family", "Standard", "Executive", "Presidential"]);
        }
      } catch (err) {
        console.error("Failed to fetch room types:", err);
        // Fallback to default types on error
        setRoomTypes(["Single", "Double", "Twin", "Deluxe", "Suite", "Family", "Standard", "Executive", "Presidential"]);
      }
    };
    fetchRoomTypes();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  /* =========================
     CHECK AVAILABILITY
  ========================= */
  const handleSearch = (e) => {
    e.preventDefault();


    /* 🔐 BLOCK GUEST USERS */
    if (!hasTabSession() && !getTabToken()) {
      // Save booking data
      sessionStorage.setItem(
        "pendingSearch",
        JSON.stringify(bookingData)
      );

      // ✅ SHOW ALERT ONLY ONCE
      const alertShown = sessionStorage.getItem("guestAlertShown");

      if (!alertShown) {
        toast.warning("Please login first to check availability", {
          position: "top-center",
          autoClose: 2000,
        });
        sessionStorage.setItem("guestAlertShown", "true");
      }

      navigate("/login");
      return;
    }

    /* DATE VALIDATION */
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error("Please select both check-in and check-out dates");
      return;
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);

    if (checkInDate >= checkOutDate) {
      toast.error("Check-out date must be after Check-in date");
      return;
    }

    /* ✅ USER LOGGED IN */
    navigate("/booking", {
      state: { searchParams: bookingData },
    });
  };

  return (
    <div className="h-hero-container">
      <ToastContainer />

      <header className="h-header">
        {/* ===== NAVBAR ===== */}
        <div className="h-nav-container">
          <div className="h-nav-bar">
            <div className="h-navbar-logo">
              <span className="h-logo-icon">👑</span> RoyalPark
            </div>

            <div className="h-hamburger" onClick={toggleMenu}>
              <span className={isMenuOpen ? "h-bar active" : "h-bar"} />
              <span className={isMenuOpen ? "h-bar active" : "h-bar"} />
              <span className={isMenuOpen ? "h-bar active" : "h-bar"} />
            </div>

            <ul className={`h-nav-menu ${isMenuOpen ? "active" : ""}`}>
              <li className="h-nav-item">
                <Link to="/" onClick={closeMenu}>Home</Link>
              </li>
              <li className="h-nav-item">
                <Link to="/aboutpage" onClick={closeMenu}>About</Link>
              </li>
              <li className="h-nav-item">
                <Link to="/services" onClick={closeMenu}>Services</Link>
              </li>
              <li className="h-nav-item">
                <Link to="/explore" onClick={closeMenu}>Explore</Link>
              </li>
              <li className="h-nav-item">
                <Link to="/contact" onClick={closeMenu}>Contact</Link>
              </li>
              <li className="h-nav-item">
                <Link to="/booking" onClick={closeMenu}>Bookings</Link>
              </li>

              {/* MOBILE LOGIN */}
              <li className="h-nav-item h-mobile-only">
                <LoginButton isMobile={true} closeMenu={closeMenu} />
              </li>
            </ul>

            {/* DESKTOP LOGIN */}
            <LoginButton isMobile={false} />
          </div>
        </div>

        {/* HERO CONTENT */}
        <div className="h-hero-wrapper">
          <div className="h-hero-text h-fade-in-up">
            <p className="h-hero-tagline">WELCOME TO ROYALPARK</p>
            <h1 className="h-hero-title">
              A Place Where Comfort Feels Like{" "}
              <span className="h-highlight">Home.</span>
            </h1>
            <p className="h-hero-desc">
              Experience luxury accommodation redefined.
            </p>
          </div>
        </div>

        {/* SEARCH FORM */}
        <div className="h-booking-container h-fade-in-up h-delay-200">
          <form className="h-booking-form" onSubmit={handleSearch}>
            <div className="h-input-group">
              <label>Check In</label>
              <input
                type="date"
                name="checkIn"
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.checkIn}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="h-input-group">
              <label>Check Out</label>
              <input
                type="date"
                name="checkOut"
                min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                value={bookingData.checkOut}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="h-input-group">
              <label>Room Type</label>
              <select
                name="roomType"
                value={bookingData.roomType}
                onChange={handleInputChange}
              >
                <option value="">Optional</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-input-group h-small-group">
              <label>Members</label>
              <input
                type="number"
                name="guests"
                min="1"
                max="10"
                value={bookingData.guests}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="h-search-btn">
              Check Availability
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default Horosection;
