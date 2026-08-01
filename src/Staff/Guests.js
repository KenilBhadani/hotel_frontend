import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Search, 
  Mail, 
  Phone, 
  MoreHorizontal,
  Download
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await fetch(`${API}/api/staff/guests`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Map guests to have consistent properties
          const mappedGuests = (Array.isArray(data) ? data : []).map(guest => ({
            ...guest,
            name: `${guest.firstName || ''} ${guest.lastName || ''}`.trim(),
            assignedRoomNumber: guest.assignedRoomNumber || guest.roomId?.number || guest.roomId?.title || '—',
            isCheckedIn: guest.bookingStatus === 'Checked-in',
            isExpected: guest.bookingStatus === 'Confirmed',
            isCheckedOut: guest.bookingStatus === 'Checked-out'
          }));
          setGuests(mappedGuests);
        } else {
          console.error('Failed to load guests');
          setGuests([]);
        }
      } catch (err) {
        console.error('Failed to load guests', err);
        setGuests([]);
      }
    };
    fetchGuests();
  }, []);

  // Filter + Search logic
  const filteredGuests = guests
    .filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // User requested order: Expected -> In-House -> Departed
      const getPriority = (guest) => {
        if (guest.isExpected) return 1;   // Confirmed (Expected)
        if (guest.isCheckedIn) return 2;  // Checked-in (In-House)
        if (guest.isCheckedOut) return 3; // Checked-out (Departed)
        return 4;
      };
      
      return getPriority(a) - getPriority(b);
    });

  // Authorization guard
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null') || { role: '' };
  if (!['Receptionist'].includes(user.role)) {
    return <div className="p-10 text-center">You are not authorized to view this page.</div>;
  }

  const handleExport = () => {
    if (!filteredGuests.length) return alert('No data to export');

    const headers = ['Guest Name', 'Email', 'Phone', 'Room', 'Check-In', 'Check-Out', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredGuests.map(g => [
        `"${g.name}"`,
        `"${g.email || ''}"`,
        `"${g.phone || ''}"`,
        `"${g.assignedRoomNumber}"`,
        `"${new Date(g.checkIn).toLocaleDateString()}"`,
        `"${new Date(g.checkOut).toLocaleDateString()}"`,
        `"${g.isCheckedIn ? 'In-House' : g.isExpected ? 'Expected' : 'Departed'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `guest_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/staff/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Guest Directory</h2>
            <p className="text-sm text-slate-500">Manage {guests.length} customer records</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Guest Information</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Contact</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Assigned</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Status</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredGuests.map((guest) => (
                <tr key={guest._id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold border border-white shadow-sm">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{guest.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Guest ID: {guest._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 cursor-pointer">
                        <Mail size={14} className="text-slate-300" />
                        {guest.email || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone size={14} className="text-slate-300" />
                        {guest.phone || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="inline-flex items-center px-3 py-1 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs">
                      Room {guest.assignedRoomNumber || '—'}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        guest.isCheckedIn ? 'bg-emerald-500 animate-pulse' : 
                        guest.isExpected ? 'bg-blue-500' : 'bg-slate-300'
                      }`}></div>
                      <span className={`text-[11px] font-black uppercase ${
                        guest.isCheckedIn ? 'text-emerald-600' : 
                        guest.isExpected ? 'text-blue-600' : 'text-slate-400'
                      }`}>
                        {guest.isCheckedIn ? 'In-House' : guest.isExpected ? 'Expected' : 'Departed'}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGuests.length === 0 && (
          <div className="p-20 text-center">
            <Users className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-slate-800 font-bold">No Guests Found</h3>
            <p className="text-slate-500 text-sm">We couldn't find any guests matching your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guests;
