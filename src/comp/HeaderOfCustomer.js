import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginButton from "./LoginButton";
import "../Componentcss/index.css";

export default function HeaderOfCustomer() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Bookings", path: "/booking" },
    { name: "Services", path: "/services" },
    { name: "Explore", path: "/explore" },
    { name: "Contact", path: "/contact" },
    { name: "About", path: "/aboutpage" },
  ];

  return (
    <>
      <header className="h-header">
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
              {navLinks.map((link) => (
                <li key={link.path} className="h-nav-item">
                  <Link to={link.path} onClick={closeMenu}>
                    {link.name}
                  </Link>
                </li>
              ))}

              <li className="h-nav-item h-mobile-only">
                <LoginButton isMobile={true} closeMenu={closeMenu} />
              </li>
            </ul>

            <LoginButton isMobile={false} />
          </div>
        </div>
      </header>
      <div className="h-header-spacer" />
    </>
  );
}
