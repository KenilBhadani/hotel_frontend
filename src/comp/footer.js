import { Link } from "react-router-dom";
import "../Componentcss/footer.css";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* COLUMN 1 : BRAND */}
        <div className="footer-col">
          <h2 className="footer-logo">
            <span className="logo-dot"></span>Rayal Park
          </h2>

          <p className="footer-text">
            Discover a world of comfort, luxury, and adventure as you explore
            our curated selection of hotels, making every moment of your
            getaway truly extraordinary.
          </p>
        </div>

        {/* COLUMN 2 : QUICK LINKS */}
        <div className="footer-col">
          <h3 className="footer-title">QUICK LINKS</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/aboutpage">About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/explore">Explore</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/booking">Booking</Link></li>
          </ul>
        </div>

        {/* COLUMN 3 : SERVICES */}
        <div className="footer-col">
          <h3 className="footer-title">OUR SERVICES</h3>
          <ul>
            <li><Link to="/services#concierge">Concierge Assistance</Link></li>
            <li><Link to="/services#booking">Flexible Booking Options</Link></li>
            <li><Link to="/services#transfer">Airport Transfers</Link></li>
            <li><Link to="/services#wellness">Wellness & Recreation</Link></li>
          </ul>
        </div>

        {/* COLUMN 4 : CONTACT + SOCIAL */}
        <div className="footer-col">
          <h3 className="footer-title">CONTACT US</h3>

          <p className="footer-email">
            <a href="mailto:rayalpark@info.com">rayalpark@info.com</a>
          </p>

          {/* SOCIAL ICONS */}
          <div className="footer-social">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>

            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER BOTTOM */}
      <p className="footer-bottom">
        © {new Date().getFullYear()} Rayal Park. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
