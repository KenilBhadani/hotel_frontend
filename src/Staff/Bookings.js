import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, Search, Filter, ArrowRight } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // current logged in staff user
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null') || { role: '' };

  useEffect(() => {
    const fetchPanel = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API}/api/staff/panel`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        });
        if (!res.ok) throw new Error('Failed to load panel');
        const data = await res.json();
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchPanel();
  }, []);

  // Filter bookings by guest name
  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(b => {
    const name = ((b && (b.guestName || `${b.firstName || ''} ${b.lastName || ''}`)) || '').trim();
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Authorization guard
  if (!['Receptionist','Manager'].includes(user.role)) {
    return <div className="p-10 text-center">You are not authorized to view this page.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {loading && <div className="p-4">Loading bookings...</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/staff/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reservations</h2>
            <p className="text-sm text-slate-500">View all guest bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search guest name..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Guest</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Room</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Stay Dates</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {(booking.guestName || `${booking.firstName || ''} ${booking.lastName || ''}`).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{booking.guestName || `${booking.firstName || ''} ${booking.lastName || ''}`}</p>
                        <p className="text-xs text-slate-500 italic">Reference: #{booking._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      {booking.roomNumber ? `Room ${booking.roomNumber}` : booking.roomId?.title || booking.roomTitle || '—'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="text-xs">
                        <p className="font-bold">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="opacity-60">{new Date(booking.checkIn).getFullYear()}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-300" />
                      <div className="text-xs">
                        <p className="font-bold">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="opacity-60">{new Date(booking.checkOut).getFullYear()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${booking.bookingStatus === 'Checked-in' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : booking.bookingStatus === 'Checked-out' ? 'bg-slate-100 text-slate-700 border border-slate-200' : booking.bookingStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                      {booking.bookingStatus || booking.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-slate-300" size={32} />
            </div>
            <h3 className="text-slate-800 font-bold">No reservations found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
