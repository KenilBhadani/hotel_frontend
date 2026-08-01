// src/Staff/SystemStatus.js - System-wide status overview for Receptionists
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, Users, BedDouble, Clock, Shield,
  Activity
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SystemStatus = () => {
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  // 🔐 Authorization - Manager ONLY
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null');
  const isAuthorized = user && user.role === 'Manager';

  useEffect(() => {
    if (isAuthorized) {
      fetchSystemStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);

      // Fetch comprehensive system data
      const [panelRes, roomsRes, bookingsRes] = await Promise.all([
        fetch(`${API}/api/staff/panel`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        }),
        fetch(`${API}/api/staff/rooms`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        }),
        fetch(`${API}/api/staff/bookings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        })
      ]);

      if (panelRes.ok && roomsRes.ok && bookingsRes.ok) {
        const panelData = await panelRes.json();
        const roomsData = await roomsRes.json();
        const bookingsData = await bookingsRes.json();

        setSystemData({
          panel: panelData,
          rooms: roomsData,
          bookings: bookingsData
        });

        // Generate system alerts
        generateAlerts(panelData, roomsData, bookingsData);
      }
    } catch (err) {
      console.error('Failed to load system status:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (panel, rooms, bookings) => {
    const newAlerts = [];

    // Critical alerts
    if (panel.stats?.activeGuests > panel.stats?.totalRooms * 1.2) {
      newAlerts.push({
        type: 'critical',
        message: 'Overbooking detected! More guests than available rooms.',
        action: 'Check room assignments immediately'
      });
    }

    // High priority alerts
    const cleaningRooms = rooms.filter(r => r.roomStatus === 'cleaning').length;
    if (cleaningRooms > rooms.length * 0.3) {
      newAlerts.push({
        type: 'high',
        message: `${cleaningRooms} rooms need cleaning - Housekeeping overloaded`,
        action: 'Reassign housekeeping tasks'
      });
    }

    // Medium priority alerts
    const pendingBookings = bookings.filter(b => b.bookingStatus === 'Pending').length;
    if (pendingBookings > 5) {
      newAlerts.push({
        type: 'medium',
        message: `${pendingBookings} bookings pending confirmation`,
        action: 'Review pending bookings'
      });
    }

    // Low priority alerts
    const maintenanceRooms = rooms.filter(r => r.roomStatus === 'maintenance').length;
    if (maintenanceRooms > 0) {
      newAlerts.push({
        type: 'low',
        message: `${maintenanceRooms} rooms under maintenance`,
        action: 'Monitor maintenance progress'
      });
    }

    setAlerts(newAlerts);
  };

  // System health score calculation
  const systemHealth = useMemo(() => {
    if (!systemData) return { score: 0, status: 'Unknown' };

    const { panel, rooms, bookings } = systemData;
    let score = 100;

    // Deduct points for issues
    if (panel.stats?.activeGuests > panel.stats?.totalRooms) score -= 30; // Overbooking
    if (rooms.filter(r => r.roomStatus === 'cleaning').length > rooms.length * 0.2) score -= 15; // Cleaning backlog
    if (bookings.filter(b => b.bookingStatus === 'Pending').length > 3) score -= 10; // Pending bookings
    if (rooms.filter(r => r.roomStatus === 'maintenance').length > rooms.length * 0.1) score -= 10; // Maintenance

    let status = 'Excellent';
    if (score < 70) status = 'Critical';
    else if (score < 80) status = 'Poor';
    else if (score < 90) status = 'Fair';
    else if (score < 95) status = 'Good';

    return { score: Math.max(0, score), status };
  }, [systemData]);

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
              <Shield className="text-blue-600" size={24} />
              System Status Overview
            </h2>
            <p className="text-sm text-slate-500">Real-time hotel operations monitoring</p>
          </div>
        </div>
      </div>

      {/* System Health Score */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-green-600" size={20} />
            System Health
          </h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-800">{systemHealth.score}%</div>
            <div className={`text-sm font-medium ${
              systemHealth.status === 'Excellent' ? 'text-green-600' :
              systemHealth.status === 'Good' ? 'text-blue-600' :
              systemHealth.status === 'Fair' ? 'text-yellow-600' :
              systemHealth.status === 'Poor' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {systemHealth.status}
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              systemHealth.score >= 90 ? 'bg-green-500' :
              systemHealth.score >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${systemHealth.score}%` }}
          ></div>
        </div>

        <p className="text-sm text-slate-600">
          Overall system performance based on room availability, booking status, and operational efficiency
        </p>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            System Alerts
          </h3>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                alert.type === 'high' ? 'bg-orange-50 border-orange-200' :
                alert.type === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded ${
                    alert.type === 'critical' ? 'bg-red-100' :
                    alert.type === 'high' ? 'bg-orange-100' :
                    alert.type === 'medium' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {alert.type === 'critical' ? <XCircle className="text-red-600" size={16} /> :
                     alert.type === 'high' ? <AlertTriangle className="text-orange-600" size={16} /> :
                     <CheckCircle className="text-blue-600" size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{alert.message}</p>
                    <p className="text-sm text-slate-600 mt-1">{alert.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Metrics Grid */}
      {systemData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <BedDouble className="text-blue-600" size={18} />
              <span className="text-xs font-bold text-slate-500 uppercase">Total Rooms</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{systemData.panel.stats?.totalRooms || 0}</h3>
            <p className="text-xs text-slate-500">
              {systemData.panel.stats?.availableRooms || 0} available
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-green-600" size={18} />
              <span className="text-xs font-bold text-slate-500 uppercase">Active Guests</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{systemData.panel.stats?.activeGuests || 0}</h3>
            <p className="text-xs text-slate-500">
              {systemData.panel.stats?.occupancy || 0}% occupancy
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-yellow-600" size={18} />
              <span className="text-xs font-bold text-slate-500 uppercase">Pending Tasks</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{systemData.panel.stats?.pendingTasks || 0}</h3>
            <p className="text-xs text-slate-500">
              Requires attention
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-600" size={18} />
              <span className="text-xs font-bold text-slate-500 uppercase">Today's Check-ins</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{systemData.panel.stats?.checkInsToday || 0}</h3>
            <p className="text-xs text-slate-500">
              Arrivals today
            </p>
          </div>
        </div>
      )}

      {/* Operational Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BedDouble className="text-blue-600" size={20} />
            Room Status Distribution
          </h3>

          {systemData?.rooms && (
            <div className="space-y-3">
              {[
                { status: 'available', label: 'Available', color: 'bg-green-500' },
                { status: 'occupied', label: 'Occupied', color: 'bg-blue-500' },
                { status: 'cleaning', label: 'Cleaning', color: 'bg-yellow-500' },
                { status: 'maintenance', label: 'Maintenance', color: 'bg-red-500' }
              ].map(({ status, label, color }) => {
                const count = systemData.rooms.filter(r => r.roomStatus === status).length;
                const percentage = systemData.rooms.length > 0 ? (count / systemData.rooms.length) * 100 : 0;

                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-800 w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="text-green-600" size={20} />
            Booking Status Overview
          </h3>

          {systemData?.bookings && (
            <div className="space-y-3">
              {[
                { status: 'Confirmed', label: 'Confirmed', color: 'bg-green-500' },
                { status: 'Checked-in', label: 'Checked-in', color: 'bg-blue-500' },
                { status: 'Pending', label: 'Pending', color: 'bg-yellow-500' },
                { status: 'Checked-out', label: 'Checked-out', color: 'bg-gray-500' }
              ].map(({ status, label, color }) => {
                const count = systemData.bookings.filter(b => b.bookingStatus === status).length;
                const percentage = systemData.bookings.length > 0 ? (count / systemData.bookings.length) * 100 : 0;

                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-800 w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-slate-600">Loading system status...</span>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;