// pages/Reports.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Download, 
  TrendingUp, 
  Bed, 
  UserCheck, 
  Sparkles,
  PieChart
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Reports = () => {
  const [stats, setStats] = useState({ 
    totalRooms: 0, 
    occupied: 0, 
    cleaning: 0, 
    available: 0,
    revenueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('staffUser') || 'null') || { role: '' };

  // Fetch reports data
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/api/staff/panel`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        });
        if (!res.ok) throw new Error(`Failed to fetch reports (${res.status})`);
        const data = await res.json();
        setStats({
          totalRooms: data.stats?.totalRooms || 0,
          occupied: data.stats?.activeGuests || 0,
          cleaning: 0, // Not available
          available: data.stats?.availableRooms || 0,
          revenueToday: 0 // Not available
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (user.role !== 'Manager') {
    return <div className="p-10 text-center">You are not authorized to view this page.</div>;
  }

  const occupancyRate = stats.totalRooms > 0 
    ? ((stats.occupied / stats.totalRooms) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div className="p-10 text-center">Loading reports...</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/staff/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft size={24} className="text-slate-600" />
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Performance Analytics</h2>
                <p className="text-sm text-slate-500">Real-time occupancy and operational metrics</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
              <Download size={18} /> Export Report
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Capacity" value={stats.totalRooms} icon={<Bed />} color="blue" />
            <StatCard title="In-House Guests" value={stats.occupied} icon={<UserCheck />} color="rose" />
            <StatCard title="Ready for Sale" value={stats.available} icon={<TrendingUp />} color="emerald" />
            <StatCard title="Maintenance" value={stats.cleaning} icon={<Sparkles />} color="amber" />
          </div>

          {/* Occupancy + Operational Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Occupancy Card */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <PieChart size={20} className="text-blue-500" /> Occupancy Percentage
                </h3>
                <span className="text-2xl font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                  {occupancyRate}%
                </span>
              </div>

              <div className="overflow-hidden h-6 mb-4 text-xs flex rounded-2xl bg-slate-100">
                <div 
                  style={{ width: `${occupancyRate}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000"
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Available</p>
                   <p className="text-lg font-bold text-slate-700">{stats.available}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Occupied</p>
                   <p className="text-lg font-bold text-slate-700">{stats.occupied}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Cleaning</p>
                   <p className="text-lg font-bold text-slate-700">{stats.cleaning}</p>
                </div>
              </div>
            </div>

            {/* Operational Health Card */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
               <div>
                  <h3 className="text-lg font-bold mb-2">Operational Health</h3>
                  <p className="text-slate-400 text-sm">Real-time status of housekeeping and maintenance flow.</p>
               </div>
               
               <div className="space-y-6 my-8">
                  <ProgressMini label="Housekeeping" val={88} color="bg-emerald-400" />
                  <ProgressMini label="Maintenance" val={42} color="bg-amber-400" />
                  <ProgressMini label="Front Desk" val={95} color="bg-blue-400" />
               </div>

               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-xs text-slate-400 italic font-medium">
                    "Productivity is up 12% compared to last week's average."
                  </p>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  );
};

// Progress Mini Component
const ProgressMini = ({ label, val, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{val}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }}></div>
    </div>
  </div>
);

export default Reports;
