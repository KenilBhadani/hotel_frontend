// src/Staff/CheckInOut.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, UserCheck, UserX, Search,
  Clock, CheckCircle, Phone, Mail, CreditCard
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CheckInOut = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(null); // Track which action is being processed

  // 🔐 Authorization - Receptionist ONLY
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null');
  const isAuthorized = user && user.role === 'Receptionist';

  useEffect(() => {
    if (isAuthorized) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/staff/panel`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings for check-in/check-out
  const availableForCheckIn = bookings.filter(b =>
    b.bookingStatus === 'Confirmed' &&
    new Date(b.checkIn).toDateString() === new Date().toDateString()
  );

  const availableForCheckOut = bookings.filter(b =>
    b.bookingStatus === 'Checked-in' &&
    new Date(b.checkOut).toDateString() === new Date().toDateString()
  );

  // Handle check-in/check-out
  const handleAction = async (bookingId, action) => {
    if (processingAction) return; // Prevent multiple clicks

    setProcessingAction(`${bookingId}-${action}`);
    try {
      const endpoint = action === 'checkin' 
        ? `${API}/api/staff/rooms/check-in` 
        : `${API}/api/staff/rooms/check-out`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify({ bookingId })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchBookings(); // Refresh data
        alert(`Guest ${action === 'checkin' ? 'checked in' : 'checked out'} successfully!`);
      } else {
        alert(data.message || `Failed to ${action} guest`);
      }
    } catch (err) {
      console.error(`Error during ${action}:`, err);
      alert(`Error during ${action}`);
    } finally {
      setProcessingAction(null);
    }
  };



  // Handle payment
  const handlePayment = async (bookingId) => {
    if (!window.confirm("Confirm payment collection? This will mark the booking as Paid.")) return;

    setProcessingAction(`${bookingId}-payment`);
    try {
      const res = await fetch(`${API}/api/staff/rooms/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify({ bookingId })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchBookings(); // Refresh data
        alert("Payment marked as Paid successfully!");
      } else {
        alert(data.message || "Failed to update payment");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Error updating payment");
    } finally {
      setProcessingAction(null);
    }
  };

  // 🔴 Render unauthorized
  if (!isAuthorized) {
    return (
      <div className="p-20 text-center text-red-600 font-bold">
        Access Denied: Receptionist role required
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/staff" className="p-2 hover:bg-slate-200 rounded-full">
            <LayoutDashboard size={22} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <UserCheck className="text-green-600" size={24} />
              Check-in / Check-out
            </h2>
            <p className="text-sm text-slate-500">Manage guest arrivals and departures</p>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Ready for Check-in</h3>
              <p className="text-sm text-slate-500">Confirmed bookings today</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{availableForCheckIn.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Ready for Check-out</h3>
              <p className="text-sm text-slate-500">Departures today</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{availableForCheckOut.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Current Time</h3>
              <p className="text-sm text-slate-500">Hotel operations</p>
            </div>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by guest name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Check-in Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserCheck className="text-green-600" size={20} />
          Ready for Check-in
        </h3>

        {availableForCheckIn.length > 0 ? (
          <div className="space-y-4">
            {availableForCheckIn.filter(booking =>
              searchTerm === '' ||
              booking.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.email?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(booking => (
              <div key={booking._id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-slate-800">
                      {booking.firstName} {booking.lastName}
                    </h4>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Mail size={12} />
                      {booking.email}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Phone size={12} />
                      {booking.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-800">
                    Room {booking.assignedRoomNumber || booking.roomId?.number || booking.roomId?._id?.slice(-4) || '—'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Check-in: {new Date(booking.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex flex-col gap-2 items-end mt-2">
                    {booking.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => handlePayment(booking._id)}
                        disabled={processingAction === `${booking._id}-payment`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard size={16} />
                        {processingAction === `${booking._id}-payment` ? 'Updating...' : 'Mark Paid'}
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(booking._id, 'checkin')}
                      disabled={processingAction === `${booking._id}-checkin`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      {processingAction === `${booking._id}-checkin` ? 'Processing...' : 'Check-in Guest'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No guests ready for check-in today</p>
        )}
      </div>

      {/* Check-out Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserX className="text-red-600" size={20} />
          Ready for Check-out
        </h3>

        {availableForCheckOut.length > 0 ? (
          <div className="space-y-4">
            {availableForCheckOut.filter(booking =>
              searchTerm === '' ||
              booking.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.email?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(booking => (
              <div key={booking._id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-slate-800">
                      {booking.firstName} {booking.lastName}
                    </h4>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Mail size={12} />
                      {booking.email}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Phone size={12} />
                      {booking.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-800">
                    Room {booking.roomId?.number || booking.roomId?._id?.slice(-4) || '—'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Check-out: {new Date(booking.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex flex-col gap-2 items-end">
                    {booking.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => handlePayment(booking._id)}
                        disabled={processingAction === `${booking._id}-payment`}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard size={16} />
                        {processingAction === `${booking._id}-payment` ? 'Updating...' : 'Mark Paid'}
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(booking._id, 'checkout')}
                      disabled={processingAction === `${booking._id}-checkout`}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserX size={16} />
                      {processingAction === `${booking._id}-checkout` ? 'Processing...' : 'Check-out Guest'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No guests ready for check-out today</p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-slate-600">Loading check-in/check-out data...</span>
        </div>
      )}
    </div>
  );
};

export default CheckInOut;