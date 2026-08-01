// src/Staff/ReceptionistDashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, UserCheck,
  UserX, Clock, Plus, Search, CheckCircle2,
  Calendar, BedDouble, ArrowRight, XCircle
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Room availability modal state
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // 🔐 Authorization - Receptionist ONLY
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null');
  const isAuthorized = user && user.role === 'Receptionist';

  useEffect(() => {
    if (isAuthorized) fetchDashboardData();
    else setLoading(false);
  }, [isAuthorized]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/staff/panel`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setGuests(data.guests || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = searchTerm === '' ||
        booking.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || booking.bookingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // Handle new booking button click - show room availability modal
  const handleNewBookingClick = () => setShowRoomModal(true);

  // Fetch available rooms from backend
  const fetchAvailableRooms = async () => {
    if (!checkInDate || !checkOutDate) return;
    setLoadingRooms(true);
    try {
      const res = await fetch(
        `${API}/rooms/available?checkIn=${checkInDate}&checkOut=${checkOutDate}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableRooms(data || []);
      } else {
        alert('Failed to fetch available rooms');
      }
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      alert('Error fetching available rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Handle room selection and navigate to booking form
  const handleRoomSelect = (room) => {
    const bookingData = {
      roomId: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: room.pricing?.standardRate || 0,
      checkIn: checkInDate,
      checkOut: checkOutDate
    };
    localStorage.setItem('selectedRoomForBooking', JSON.stringify(bookingData));
    setShowRoomModal(false);
    navigate('/staff/bookings/new');
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
              Receptionist Dashboard
            </h2>
            <p className="text-sm text-slate-500">Manage bookings, check-ins, and guest services</p>
          </div>
        </div>

        <button
          onClick={handleNewBookingClick}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          New Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="text-green-600" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase">Today's Check-ins</span>
          </div>
          <h3 className="text-2xl font-bold text-green-800">{stats.checkInsToday || 0}</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="text-red-600" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase">Today's Check-outs</span>
          </div>
          <h3 className="text-2xl font-bold text-red-800">{stats.checkOutsToday || 0}</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-blue-600" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase">Available Rooms</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-800">{stats.availableRooms || 0}</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-orange-600" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase">Occupied Rooms</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-800">{stats.occupiedRooms || 0}</h3>
        </div>
      </div>

      {/* Today's Check-ins */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserCheck className="text-green-600" size={20} />
          Today's Check-ins
        </h3>
        {guests.filter(g => new Date(g.checkIn).toDateString() === new Date().toDateString()).length > 0 ? (
          <div className="space-y-3">
            {guests.filter(g => new Date(g.checkIn).toDateString() === new Date().toDateString()).slice(0, 5).map(guest => (
              <div key={guest._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800">{guest.firstName} {guest.lastName}</h4>
                  <p className="text-sm text-slate-600">
                    Room {guest.roomId?.number || guest.roomId?._id?.slice(-4) || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-700">Check-in Today</p>
                  <p className="text-xs text-slate-500">{new Date(guest.checkIn).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No check-ins scheduled for today</p>
        )}
      </div>

      {/* Today's Check-outs */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserX className="text-red-600" size={20} />
          Today's Check-outs
        </h3>
        {guests.filter(g => new Date(g.checkOut).toDateString() === new Date().toDateString()).length > 0 ? (
          <div className="space-y-3">
            {guests.filter(g => new Date(g.checkOut).toDateString() === new Date().toDateString()).slice(0, 5).map(guest => (
              <div key={guest._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800">{guest.firstName} {guest.lastName}</h4>
                  <p className="text-sm text-slate-600">
                    Room {guest.roomId?.number || guest.roomId?._id?.slice(-4) || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-700">Check-out Today</p>
                  <p className="text-xs text-slate-500">{new Date(guest.checkOut).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No check-outs scheduled for today</p>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="text-blue-600" size={20} />
            Recent Bookings
          </h3>
          <Link to="/staff/bookings" className="text-sm text-blue-600 hover:text-blue-800">View All →</Link>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
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

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.slice(0, 5).map(booking => (
            <div key={booking._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  booking.bookingStatus === 'Checked-in' ? 'bg-green-500' :
                  booking.bookingStatus === 'Confirmed' ? 'bg-blue-500' :
                  booking.bookingStatus === 'Pending' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <div>
                  <h4 className="font-medium text-slate-800">
                    {booking.firstName} {booking.lastName}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {booking.email} • Room {booking.roomId?.number || booking.roomId?._id?.slice(-4) || '—'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.bookingStatus === 'Checked-in' ? 'bg-green-100 text-green-800' :
                  booking.bookingStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                  booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.bookingStatus}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {filteredBookings.length === 0 && (
            <p className="text-slate-500 text-center py-8">No bookings found</p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-slate-600">Loading receptionist dashboard...</span>
        </div>
      )}

      {/* Room Availability Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BedDouble className="text-blue-600" size={24} />
                Select Room for Booking
              </h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Check Availability Button */}
            <div className="mb-6">
              <button
                onClick={fetchAvailableRooms}
                disabled={!checkInDate || !checkOutDate || loadingRooms}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loadingRooms ? 'Checking...' : 'Check Availability'}
              </button>
            </div>

            {/* Available Rooms */}
            {availableRooms.length > 0 ? (
              <div className="space-y-3">
                {availableRooms.map(room => (
                  <div
                    key={room._id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-slate-800">
                          Room {room.roomNumber || '—'} - {room.roomType}
                        </h5>
                        <p className="text-sm text-slate-600">
                          {room.availableRooms} available • {room.description || 'Comfortable accommodation'}
                        </p>
                        {room.amenities && room.amenities.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            Amenities: {room.amenities.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-800">
                          ${room.pricing?.standardRate || 0}
                        </div>
                        <div className="text-sm text-slate-500">per night</div>
                        <button className="mt-2 flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          <ArrowRight size={14} />
                          Select Room
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : checkInDate && checkOutDate && !loadingRooms ? (
              <div className="text-center py-8 text-slate-500">
                <BedDouble className="mx-auto mb-2" size={32} />
                <p>No rooms available for selected dates</p>
                <p className="text-sm mt-1">Try different dates or contact management</p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="mx-auto mb-2" size={32} />
                <p>Select check-in and check-out dates to view available rooms</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
