import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function HeaderOfCustomer() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/aboutpage" },
    { name: "Contact Us", path: "/contact" },
    { name: "Booking", path: "/booking" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-0 left-0 w-full h-20 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md border-b border-slate-100"
            : "bg-black/50 backdrop-blur"
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className={`text-2xl font-bold tracking-[0.25em] ${
              isScrolled ? "text-slate-900" : "text-white"
            }`}
          >
            ROYAL<span className="text-amber-500">PARK</span>
          </Link>

          {/* Navigation (Desktop + Mobile Same) */}
          <nav>
            <ul className="flex items-center gap-10">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative group ${
                      isScrolled ? "text-slate-600" : "text-white"
                    } ${
                      isActive(link.path) ? "text-amber-500" : ""
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-[1px] bg-amber-500 transition-all duration-300 ${
                        isActive(link.path)
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                </li>
              ))}

              {/* CTA Button */}
              <li>
                <Link
                  to="/booking"
                  className="px-6 py-2.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-slate-900 transition-all duration-300"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Space for Fixed Header */}
      <div className="pt-20" />
    </>
  );
}
