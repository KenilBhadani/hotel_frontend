import '../Componentcss/About.css';
import Hero from '../images/traveling.jpg';   
import { Link } from 'react-router-dom';      // Main Image
// *** ACTION REQUIRED: Please add a second image for the grid effect ***
import SecondaryImg from '../images/traveling2.jpg'; // Replace this with a different image path later!

function AboutUs() {
  return (
    <section className="about-premium-section">
      <div className="about-content-container">
        
        {/* --- Left Side: Text Content --- */}
        <div className="about-text-side">
            <div className="tag-wrapper">
                 <span className="about-tag-line"></span>
                 <p className="about-tag">ABOUT US</p>
            </div>
          
          <h2 className="about-title">
            The Best Holidays <br/> Start Here.
          </h2>

          <p className="about-desc">
            We believe travel should be effortless and inspiring. With a focus on 
            curated quality accommodations, highly personalized experiences, 
            and seamless booking technology, our platform is dedicated to ensuring that 
            every traveler embarks on their dream holiday with confidence, 
            excitement, and peace of mind.
          </p>

          <button className="about-btn-premium"><Link to="/explore">Explore Our Story</Link></button>
        </div>

        {/* --- Right Side: 4:3 Photo Grid Overlap --- */}
        <div className="about-image-side">
            {/* Image 1: The Main underlying image */}
            <div className="img-frame frame-main">
                 <div className="ratio-box-4-3">
                    <img src={Hero} className="grid-img" alt="Luxury destination main" />
                 </div>
            </div>

             {/* Image 2: The Overlapping accent image */}
            <div className="img-frame frame-accent">
                <div className="ratio-box-4-3">
                    <img src={SecondaryImg} className="grid-img" alt="Luxury experience detail" />
                </div>
            </div>
             {/* Decorative background pattern element */}
            <div className="about-pattern-bg"></div>
        </div>

      </div>
    </section>
  );
}

export default AboutUs;