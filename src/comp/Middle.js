import React from "react";
import vidofile from "../images/Middle.jpg"; // Ensure this path is correct
import "../Componentcss/Middle.css";
import { Ri24HoursLine } from "react-icons/ri";
import { IoMdBook } from "react-icons/io";
import { GiHeadphones } from "react-icons/gi";
import { PiSecurityCameraFill } from "react-icons/pi";

function Middle() {
  return (
    <section className="mid-luxury-section">
      
      {/* Background Layer */}
      <div className="mid-bg-layer">
        <img src={vidofile} alt="Hotel Amenities" className="mid-bg-image" />
        <div className="mid-overlay-dark"></div>
      </div>

      {/* Content Layer */}
      <div className="mid-content-wrapper">
        
        {/* Header Section */}
        <div className="mid-header-center">
          <p className="mid-tagline">OUR SERVICES</p>
          <h2 className="mid-headline">
            Strive Only For The <span className="mid-text-gold">Best.</span>
          </h2>
          <div className="mid-divider"></div>
        </div>

        {/* Cards Grid */}
        <div className="mid-cards-grid">
          
          {/* Card 1 */}
          <div className="mid-glass-card">
            <div className="mid-icon-circle">
              <PiSecurityCameraFill />
            </div>
            <h3>High Class Security</h3>
            <p>Advanced security systems and personnel to ensure your complete safety and peace of mind.</p>
          </div>

          {/* Card 2 */}
          <div className="mid-glass-card">
            <div className="mid-icon-circle">
              <Ri24HoursLine />
            </div>
            <h3>24 Hours Service</h3>
            <p>Whatever you need, whenever you need it. Our dedicated staff is just a call away, day or night.</p>
          </div>

          {/* Card 3 */}
          <div className="mid-glass-card">
            <div className="mid-icon-circle">
              <GiHeadphones />
            </div>
            <h3>Conference Room</h3>
            <p>State-of-the-art business facilities equipped with high-speed internet and audio-visual tech.</p>
          </div>

          {/* Card 4 */}
          <div className="mid-glass-card">
            <div className="mid-icon-circle">
              <IoMdBook />
            </div>
            <h3>Tourist Guide</h3>
            <p>Explore the city like a local with our curated tours and expert guide support services.</p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Middle;