import "../Admin/admin_dashboard.css";
import { Link } from "react-router-dom";

function Dash() {
  return (
    <div className="admin-container">
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/manage-room">Manage Room</Link>
        <Link to="/admin/manage-booking">Manage Bookings</Link>
        <Link to="/admin/manage-user">Manage User</Link>
        <Link to="/admin/manage-payment">Payment & Reports</Link>
        <Link to="/admin/dashboard-stats">Dashboard Stats</Link>
        <Link to="/admin/manage-staff">Manage Staff</Link>
      </div>
      <div className="main">
        <div className="top-bar">
          <h2>Welcome, Admin</h2>
        </div>
      </div>
    </div>
  );
}

export default Dash;
