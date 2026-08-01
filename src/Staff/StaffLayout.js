import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, CalendarCheck,
  Users, ClipboardList, BarChart3, LogOut, Search, Bell, Menu, X, Sparkles, Wrench
} from 'lucide-react';
import { getTabToken, getTabUser, logoutTab } from '../utils/tabSession';

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      localStorage.setItem('staffNotifSeenAt', String(Date.now()));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const markAllAsRead = () => {
    localStorage.setItem('staffNotifSeenAt', String(Date.now()));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Get user from tab session
  const user = getTabUser() || { name: 'Staff Member', role: 'Staff' };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/staff/auth/logout`, { credentials: 'include' });
    } catch (e) {
      // ignore
    }
    // Use tab session logout (only clears current tab)
    logoutTab();
    navigate('/');
  };

  // Define all possible menu items and attach allowed roles
  const allMenuItems = [
    { path: '/staff/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['Receptionist', 'Manager'] },
    { path: '/staff/housekeeping', name: 'Housekeeping', icon: <Sparkles size={20} />, roles: ['Housekeeping'] },
    { path: '/staff/rooms', name: 'Room Status', icon: <BedDouble size={20} />, roles: ['Receptionist'] },
    { path: '/staff/bookings', name: 'Bookings', icon: <CalendarCheck size={20} />, roles: ['Receptionist'] },
    { path: '/staff/checkinout', name: 'Check-in/Out', icon: <Users size={20} />, roles: ['Receptionist'] },
    { path: '/staff/guests', name: 'Guests', icon: <Users size={20} />, roles: ['Receptionist'] },
    { path: '/staff/tasks', name: 'Tasks', icon: <ClipboardList size={20} />, roles: ['Receptionist', 'Housekeeping', 'Maintenance', 'Manager'] },
    { path: '/staff/maintenance', name: 'Maintenance', icon: <Wrench size={20} />, roles: ['Maintenance', 'Manager', 'Admin'] },
  ];

  // Filter menu based on the logged-in staff role
  const menuItems = allMenuItems.filter(item => !item.roles || item.roles.includes(user.role));

  const getPageTitle = () => {
    const current = menuItems.find(item => item.path === location.pathname);
    return current ? current.name : 'Staff Portal';
  };

  useEffect(() => {
    if (!user || user.role !== 'Receptionist') return;
    let active = true;
    const fetchPanelAndBuildNotifications = async () => {
      try {
        const token = getTabToken();
        if (!token) return;

        const res = await fetch(`${API}/api/staff/panel`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const lastSeen = Number(localStorage.getItem('staffNotifSeenAt') || 0);
        const toDayStr = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isToday = (d) => new Date(d).toDateString() === new Date().toDateString();
        const list = [];
        (data.bookings || []).forEach(b => {
          if (b.bookingStatus === 'Confirmed' && isToday(b.checkIn)) {
            list.push({
              id: `arrive-${b._id}`,
              type: 'arrival',
              message: `Arrival today: ${b.firstName} ${b.lastName}`,
              time: toDayStr(b.checkIn),
              ts: new Date(b.checkIn).getTime()
            });
          }
          if (b.paymentMethod === 'Cash' && b.bookingStatus === 'Pending') {
            list.push({
              id: `cash-${b._id}`,
              type: 'cash',
              message: `Cash pending: ${b.firstName} ${b.lastName} • Rs.${b.totalAmount || 0}`,
              time: 'Pending',
              ts: Date.now() - 1000 // treat as recent
            });
          }
          if (b.bookingStatus === 'Checked-in' && isToday(b.actualCheckIn || b.checkIn)) {
            list.push({
              id: `checkin-${b._id}`,
              type: 'checkin',
              message: `Checked-in: ${b.firstName} ${b.lastName}`,
              time: toDayStr(b.actualCheckIn || b.checkIn),
              ts: new Date(b.actualCheckIn || b.checkIn).getTime()
            });
          }
          if (b.bookingStatus === 'Checked-out' && isToday(b.checkOut)) {
            list.push({
              id: `checkout-${b._id}`,
              type: 'checkout',
              message: `Checked-out: ${b.firstName} ${b.lastName}`,
              time: toDayStr(b.checkOut),
              ts: new Date(b.checkOut).getTime()
            });
          }
        });
        // Sort newest first
        list.sort((a, b) => b.ts - a.ts);
        const withRead = list.map(n => ({ ...n, read: n.ts <= lastSeen }));
        if (active) setNotifications(withRead.slice(0, 20));
      } catch (e) {
        // silent fail
      }
    };
    fetchPanelAndBuildNotifications();
    const id = setInterval(fetchPanelAndBuildNotifications, 60000);
    return () => { active = false; clearInterval(id); };
  }, [user?.role, API]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BedDouble className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight leading-none">LUXE</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Hotel Pro</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
              >
                <span className={`${isActive ? 'text-white' : 'group-hover:text-blue-400 text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Staff User Card */}
        <div className="p-4 mx-4 mb-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-inner">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt="avatar"
                className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F172A] rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">

          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 hidden sm:block">{getPageTitle()}</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Real-time Hotel Sync</p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 lg:pl-6 relative">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
                title="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] leading-[18px] text-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <div className="flex gap-2 text-xs">
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-blue-600 hover:underline">Mark read</button>
                      )}
                      <button onClick={clearNotifications} className="text-slate-400 hover:text-rose-500">Clear</button>
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div key={notification.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''}`}>
                          <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-slate-300'}`} />
                          <div>
                            <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <Link to="/staff/bookings" className="text-xs font-medium text-blue-600 hover:text-blue-800">Go to Bookings</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
