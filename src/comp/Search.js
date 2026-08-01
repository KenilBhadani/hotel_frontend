import '../Componentcss/Search.css';

function BookingHeader() {
  return (
    <div className="booking-header">
      <div className="header-box">
        <input type="text" placeholder="Hotel / Destination" />
        <input type="text" placeholder="Check-in — Check-out" />
        <input type="text" placeholder="Guests & Rooms" />
        <button>SEARCH</button>
      </div>
    </div>
  );
}

export default BookingHeader;
