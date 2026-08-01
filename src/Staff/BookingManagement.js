// src/Staff/BookingManagement.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, UserCheck, UserX,
  Search, Edit, CheckCircle, XCircle,
  Plus, Eye, Phone, Mail
} from 'lucide-react';
import { getTabToken, getTabUser } from '../utils/tabSession';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionError, setActionError] = useState('');

  // 🔐 Authorization - Receptionist ONLY
  const user = getTabUser();
  const token = getTabToken();
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
      const res = await fetch(`${API}/api/staff/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = searchTerm === '' ||
        booking.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone?.includes(searchTerm);

      const matchesStatus = statusFilter === 'All' || booking.bookingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // Handle status updates
  const updateBookingStatus = async (bookingId, newStatus) => {
    setActionError('');
    try {
      const res = await fetch(`${API}/api/staff/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        await fetchBookings();
        setSelectedBooking(null);
      } else {
        const msg = data.message || `Failed to update booking status (${res.status})`;
        setActionError(msg);
        alert(msg);
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      const msg = 'Network error. Please try again.';
      setActionError(msg);
      alert(msg);
    }
  };

  // Handle cash payment confirmation
  const handleCashTaken = async (bookingId) => {
    if (!window.confirm("Confirm cash payment received?")) return;
    updateBookingStatus(bookingId, 'Confirmed');
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
              <CalendarCheck className="text-blue-600" size={24} />
              Booking Management
            </h2>
            <p className="text-sm text-slate-500">Handle check-ins, check-outs, and booking operations</p>
          </div>
        </div>

        <Link
          to="/staff/bookings/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New Booking
        </Link>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex justify-between items-center">
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in</option>
            <option value="Checked-out">Checked-out</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Room</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.map(booking => (
                <tr key={booking._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">
                        {booking.firstName} {booking.lastName}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail size={12} />
                        {booking.email}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone size={12} />
                        {booking.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {booking.assignedRoomNumber ? `Room ${booking.assignedRoomNumber}` : <span className="text-amber-600 italic">Unassigned</span>}
                    </div>
                    <div className="text-sm text-slate-500">
                      {booking.roomTitle || booking.roomId?.title || booking.roomId?.roomType || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-500">
                      to {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.bookingStatus === 'Checked-in' ? 'bg-green-100 text-green-800' :
                      booking.bookingStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Confirm Pending booking */}
                      {booking.bookingStatus === 'Pending' && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'Confirmed')}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          <CheckCircle size={12} />
                          Confirm
                        </button>
                      )}

                      {/* Check-in Action */}
                      {booking.bookingStatus === 'Confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'Checked-in')}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          <UserCheck size={12} />
                          Check-in
                        </button>
                      )}

                      {/* Cancelled Status - No Actions */}
                      {booking.bookingStatus === 'Cancelled' && (
                        <span className="px-3 py-1 text-xs font-bold text-red-500 bg-red-50 rounded border border-red-100">
                          Cancelled
                        </span>
                      )}

                      {/* Check-out Action */}
                      {booking.bookingStatus === 'Checked-in' && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'Checked-out')}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          <UserX size={12} />
                          Check-out
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <CalendarCheck className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No bookings found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm || statusFilter !== 'All' ? 'Try adjusting your search or filter.' : 'Get started by creating a new booking.'}
            </p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-slate-200 rounded-full"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Guest Name</label>
                  <p className="text-slate-900">{selectedBooking.firstName} {selectedBooking.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <p className="text-slate-900">{selectedBooking.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <p className="text-slate-900">{selectedBooking.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Room</label>
                  <p className="text-slate-900">Room {selectedBooking.roomId?.number || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Check-in</label>
                  <p className="text-slate-900">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Check-out</label>
                  <p className="text-slate-900">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedBooking.bookingStatus === 'Checked-in' ? 'bg-green-100 text-green-800' :
                    selectedBooking.bookingStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                      selectedBooking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedBooking.bookingStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Payment Status</label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedBooking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedBooking.paymentStatus || 'Pending'}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({selectedBooking.paymentMethod || 'Unknown'})
                    </span>
                  </div>
                </div>

                {/* Always Show Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Total Amount</label>
                  <p className="text-slate-900 font-bold">Rs. {selectedBooking.totalAmount || '0'}</p>
                </div>

                {/* Cash Taken Button */}
                {selectedBooking.paymentMethod === 'Cash' && selectedBooking.bookingStatus === 'Pending' && (
                  <div className="col-span-2 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 flex justify-between items-center">
                    <div className="text-sm text-amber-800">
                      <span className="font-bold">Cash Payment Pending:</span> Rs.{selectedBooking.totalAmount}
                    </div>
                    <button
                      onClick={() => handleCashTaken(selectedBooking._id)}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-sm"
                    >
                      Cash Taken
                    </button>
                  </div>
                )}
              </div>

              {selectedBooking.specialRequests && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Special Requests</label>
                  <p className="text-slate-900">{selectedBooking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-slate-600">Loading bookings...</span>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;