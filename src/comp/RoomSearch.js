import React from "react";
import { Calendar, Home, Users, ArrowRight, Search } from "lucide-react";

const RoomSearch = ({ filters, setFilters, onSearch }) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-12">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-2 flex flex-col lg:flex-row items-center gap-2">
        {/* Dates */}
        <div className="flex-1 flex items-center w-full px-6 py-3 border-b lg:border-b-0 lg:border-r border-slate-100">
          <Calendar className="text-amber-600 mr-4" size={20} />
          <div className="flex flex-col flex-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Check In</label>
            <input type="date" value={filters.checkIn} min={new Date().toISOString().split('T')[0]} onChange={e => setFilters({ ...filters, checkIn: e.target.value, checkOut: filters.checkOut && filters.checkOut <= e.target.value ? '' : filters.checkOut })} className="text-sm font-bold focus:outline-none bg-transparent" />
          </div>
          <ArrowRight className="mx-2 text-slate-300" size={16} />
          <div className="flex flex-col flex-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Check Out</label>
            <input type="date" value={filters.checkOut} min={filters.checkIn || new Date().toISOString().split('T')[0]} onChange={e => setFilters({ ...filters, checkOut: e.target.value })} className="text-sm font-bold focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* Room Type */}
        <div className="flex-1 flex items-center w-full px-6 py-3 border-b lg:border-b-0 lg:border-r border-slate-100">
          <Home className="text-amber-600 mr-4" size={20} />
          <div className="flex flex-col w-full">
            <label className="text-[10px] font-black uppercase text-slate-400">Room Type</label>
            <select value={filters.roomType} onChange={e => setFilters({ ...filters, roomType: e.target.value })} className="text-sm font-bold focus:outline-none bg-transparent appearance-none">
              <option value="">All Categories</option>
              <option value="Deluxe">Deluxe Room</option>
              <option value="Suite">Executive Suite</option>
            </select>
          </div>
        </div>

        {/* Members */}
        <div className="flex-1 flex items-center w-full px-6 py-3">
          <Users className="text-amber-600 mr-4" size={20} />
          <div className="flex flex-col w-full">
            <label className="text-[10px] font-black uppercase text-slate-400">Members</label>
            <input type="number" min="1" value={filters.members} onChange={e => setFilters({ ...filters, members: e.target.value })} className="text-sm font-bold focus:outline-none bg-transparent" />
          </div>
        </div>

        <button onClick={onSearch} className="w-full lg:w-auto px-8 py-4 bg-slate-900 hover:bg-amber-600 text-white rounded-[2rem] font-bold transition-all flex items-center justify-center gap-2 group shadow-lg active:scale-95">
          <Search size={18} /><span>Find Room</span>
        </button>
      </div>
    </div>
  );
};

export default RoomSearch;
