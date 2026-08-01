import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BedDouble,
  CalendarCheck,
  Users,
  ClipboardList,
  Clock,
  LayoutGrid
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const StaffDashboard = () => {
  const navigate = useNavigate();

  // use staffUser if available, fallback to old user key
  const user = JSON.parse(localStorage.getItem('staffUser') || localStorage.getItem('user') || 'null');

  // 🔄 Role-based redirection
  useEffect(() => {
    if (user?.role === 'Receptionist') {
      navigate('/staff/receptionist', { replace: true });
    } else if (user?.role === 'Housekeeping') {
      navigate('/staff/housekeeping', { replace: true });
    } else if (user?.role === 'Manager') {
      navigate('/staff/manager', { replace: true });
    }
  }, [user, navigate]);

  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawPanel, setRawPanel] = useState(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPanel = async () => {
      setLoading(true);
      setError('');
      setRawPanel(null);
      try {
        const res = await fetch(`${API}/api/staff/panel`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        });

        const text = await res.text();
        // Save raw body for debugging
        setRawPanel(text);

        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (parseErr) {
          // keep data null if not JSON
          data = null;
        }

        if (!res.ok) {
          const msg = (data && data.message) || `Server error (${res.status})`;
          throw new Error(msg);
        }

        // Use backend stats for counts, calculate occupancy properly
        let stats = data?.stats || { availableRooms: 0, checkInsToday: 0, activeGuests: 0, pendingTasks: 0, totalRooms: 0, occupancy: 0 };
        stats.occupancy = stats.totalRooms > 0 ? Math.round((stats.activeGuests / stats.totalRooms) * 100) : 0;

        setStats(stats);
      } catch (err) {
        console.error('Panel fetch error', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPanel();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPanel, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: 'Available', value: () => stats?.availableRooms ?? '—', icon: <BedDouble size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Check-ins', value: () => stats?.checkInsToday ?? '—', icon: <CalendarCheck size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Guests', value: () => stats?.activeGuests ?? '—', icon: <Users size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Tasks', value: () => stats?.pendingTasks ?? '—', icon: <ClipboardList size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading panel...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-4 text-center text-red-600 font-bold">{error}</div>
        {rawPanel && (
          <details className="bg-slate-50 p-4 rounded-lg border">
            <summary className="cursor-pointer font-mono text-sm text-slate-700">Show raw response</summary>
            <pre className="mt-2 text-xs whitespace-pre-wrap">{rawPanel}</pre>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-800">Main Dashboard</h1>
          </div>
        </div>

        {/* Live Clock Widget */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-md">
          <Clock size={18} className="text-blue-400" />
          <span className="text-sm font-mono font-medium tracking-wider">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold">Welcome back, {user?.name || 'Staff'}!</h2>
          <p className="text-blue-100 mt-2 max-w-md">
            The hotel has {stats?.totalRooms || 0} total rooms and is currently at {Math.round(stats?.occupancy || 0)}% occupancy. You have {stats?.pendingTasks || 0} urgent maintenance tasks pending for this shift.
          </p>
        </div>
        {/* Decorative Background Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value()}</p>
          </div>
        ))}
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MenuCard 
          to="/staff/rooms" 
          title="Room Management" 
          desc="Monitor room cleaning, occupancy, and status." 
          icon={<BedDouble size={32} />}
          color="blue"
        />
        <MenuCard 
          to="/staff/bookings" 
          title="Reservation Desk" 
          desc="Manage guest check-ins, check-outs, and new bookings." 
          icon={<LayoutGrid size={32} />}
          color="indigo"
        />
      </div>
    </div>
  );
};

// Reusable Menu Card Component
const MenuCard = ({ to, title, desc, icon, color }) => (
  <Link to={to} className={`group p-1 bg-gradient-to-r hover:from-${color}-500 hover:to-${color}-600 rounded-2xl transition-all duration-300`}>
    <div className="bg-white p-6 rounded-[14px] h-full transition-all group-hover:bg-white/90">
      <div className={`mb-4 text-${color}-600`}>{icon}</div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-slate-500 text-sm mt-2">{desc}</p>
    </div>
  </Link>
);

export default StaffDashboard;