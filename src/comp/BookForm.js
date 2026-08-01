// Bookformpage.js
import { useLocation, Navigate } from "react-router-dom";
import Header2 from "./Header2";
import BookingForm from "./Bookingcus";

function Bookformpage() {
  const location = useLocation();

  // Room data is the whole state
  const roomData = location.state;
  const searchParams = location.state?.searchParams;

  if (!roomData) {
    return <Navigate to="/rooms" replace />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header2 />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <BookingForm selectedRoom={roomData} dates={searchParams} />
      </div>
    </div>
  );
}

export default Bookformpage;
