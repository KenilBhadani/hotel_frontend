import '../Componentcss/Event.css'; // Ensure this matches your CSS filename

function Events() {
  const eventData = [
    {
      id: 1,
      title: "Dream Weddings",
      desc: "Create unforgettable memories with our bespoke wedding packages, featuring grand ballrooms and exquisite catering.",
      capacity: "Up to 500 Guests",
      // Updated high-quality wedding image
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "Corporate Meetings",
      desc: "Elevate your business with our state-of-the-art conference rooms, high-speed amenities, and professional support.",
      capacity: "10 - 200 Guests",
      // Updated conference image
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "Social Gatherings",
      desc: "From birthday bashes to anniversary dinners, our versatile venues set the perfect stage for your celebrations.",
      capacity: "Up to 150 Guests",
      // Updated social event image (Dinner party)
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section className="evt-section">
      <div className="evt-container">
        
        {/* Header */}
        <div className="evt-header">
          <p className="evt-tag">CELEBRATE WITH US</p>
          <h2 className="evt-title">Events & <span className="evt-gold">Conferences</span></h2>
          <p className="evt-subtitle">
            Experience flawless planning and execution for events that matter.
          </p>
        </div>

        {/* Grid */}
        <div className="evt-grid">
          {eventData.map((item) => (
            <div key={item.id} className="evt-card">
              
              {/* Image Layer */}
              <div className="evt-img-wrapper">
                <img src={item.image} alt={item.title} className="evt-img" />
                <div className="evt-overlay"></div>
              </div>

              {/* Content Layer */}
              <div className="evt-content">
                <div className="evt-capacity-badge">{item.capacity}</div>
                <h3 className="evt-card-title">{item.title}</h3>
                <p className="evt-card-desc">{item.desc}</p>
                <button className="evt-btn-arrow">Plan Event &rarr;</button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Events;