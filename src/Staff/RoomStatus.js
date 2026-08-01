// src/Staff/RoomStatus.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bed, CheckCircle2, Brush, ChevronLeft, Wrench } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const RoomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Authorization (NO early return)
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null');
  const isAuthorized = user && ['Housekeeping', 'Receptionist'].includes(user.role);
  const isReadOnly = user?.role === 'Receptionist';

  // Default filter based on role
  const defaultFilter = user?.role === 'Housekeeping' ? 'Cleaning' : 'All';
  const [filter, setFilter] = useState(defaultFilter);

  // ✅ Hooks ALWAYS run
  useEffect(() => {
    if (isAuthorized) fetchRooms();
    else setLoading(false);
  }, [isAuthorized]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/staff/rooms/instances`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        }
      });
      if (!res.ok) throw new Error("Failed to load rooms");
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safe memo
  const filteredRooms = useMemo(() => {
    let filtered = rooms;

    // Filter by Assignment (Housekeeping/Maintenance only see their rooms)
    if (user && (user.role === 'Housekeeping' || user.role === 'Maintenance')) {
      // Use userId or id or staffId depending on what's in local storage
      const userId = user.userId || user.id || user.staffId;
      filtered = filtered.filter(room => room.assignedTo === userId);
    }

    if (filter === "All") return filtered;
    if (filter === "Available") return filtered.filter(room => room.status === "FREE");
    if (filter === "Occupied") return filtered.filter(room => room.status === "STAY");
    if (filter === "Cleaning") return filtered.filter(room => room.status === "CLEANING");
    if (filter === "Clean") return filtered.filter(room => room.status === "CLEAN");
    if (filter === "Maintenance") return filtered.filter(room => room.status === "MAINTENANCE");
    return filtered;
  }, [rooms, filter, user]);

  const updateStatus = async (roomId, status) => {
    try {
      const res = await fetch(`${API}/api/staff/rooms/instance/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.message || "Status update failed");
      }
    } catch {
      alert("Status update failed");
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "FREE": return "bg-emerald-100 text-emerald-700";
      case "STAY": return "bg-rose-100 text-rose-700";
      case "CLEANING": return "bg-amber-100 text-amber-700";
      case "CLEAN": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const statusIcon = (status) => {
    if (status === "FREE") return <CheckCircle2 size={22} />;
    if (status === "STAY") return <Bed size={22} />;
    if (status === "CLEAN") return <CheckCircle2 size={22} />;
    return <Brush size={22} />;
  };

  // 🔴 Render unauthorized AFTER hooks
  if (!isAuthorized) {
    return (
      <div className="p-20 text-center text-red-600 font-bold">
        You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/staff/dashboard" className="p-2 hover:bg-slate-200 rounded-full">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Room Inventory</h2>
            <p className="text-sm text-slate-500">
              {rooms.length} total physical units
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex bg-white border rounded-xl p-1 shadow-sm">
          <Filter label="All" active={filter === "All"} onClick={() => setFilter("All")} />
          <Filter label="Available" active={filter === "Available"} onClick={() => setFilter("Available")} />
          <Filter label="Occupied" active={filter === "Occupied"} onClick={() => setFilter("Occupied")} />
          <Filter label="Cleaning" active={filter === "Cleaning"} onClick={() => setFilter("Cleaning")} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map(room => (
            <div key={room._id} className="bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition">

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold">Room</p>
                  <h3 className="text-3xl font-black">
                    {room.roomNumber || room._id.slice(-4)}
                  </h3>
                </div>
                <div className={`p-3 rounded-2xl ${statusBadge(room.status)}`}>
                  {statusIcon(room.status)}
                </div>
              </div>

              <p className="text-xs font-bold uppercase text-slate-500 mb-4">
                {room.roomListing?.title || room.roomListing?.roomType || "—"}
              </p>

              <div className="grid grid-cols-3 gap-2">
                {/* Housekeeping Actions */}
                {user?.role === 'Housekeeping' && (
                  <>
                    {room.status === 'DIRTY' && (
                      <ActionButton 
                        label="Start Cleaning" 
                        active={false} 
                        onClick={() => updateStatus(room._id, "CLEANING")} 
                        activeClass="bg-amber-100 text-amber-700"
                        disabled={false}
                      />
                    )}
                    {room.status === 'CLEANING' && (
                      <ActionButton 
                        label="Clean Completed" 
                        active={false} 
                        onClick={() => updateStatus(room._id, "CLEAN")} 
                        activeClass="bg-blue-100 text-blue-700"
                        disabled={false}
                      />
                    )}
                    {(room.status === 'CLEAN' || room.status === 'READY') && (
                      <div className="col-span-2 text-xs text-center font-bold text-slate-500 bg-slate-100 py-2 rounded-lg">
                        Waiting for Admin Approval
                      </div>
                    )}
                    {(room.status === 'DIRTY' || room.status === 'CLEANING') && (
                      <ActionButton 
                        label="Report Issue" 
                        active={false} 
                        onClick={() => updateStatus(room._id, "MAINTENANCE")} 
                        activeClass="bg-orange-100 text-orange-700"
                        disabled={false}
                      />
                    )}
                  </>
                )}

                {/* Maintenance Actions */}
                {user?.role === 'Maintenance' && (
                  <>
                    {room.status === 'MAINTENANCE' ? (
                      <ActionButton 
                        label="Repair Complete" 
                        active={false} 
                        onClick={() => updateStatus(room._id, "READY")} 
                        activeClass="bg-green-100 text-green-700"
                        disabled={false}
                      />
                    ) : (
                      <div className="col-span-2 text-xs text-center font-bold text-slate-500 bg-slate-100 py-2 rounded-lg">
                         Task Completed
                      </div>
                    )}
                  </>
                )}

                {/* Receptionist View (ReadOnly) */}
                {user?.role === 'Receptionist' && (
                  <div className="col-span-full text-xs text-center text-slate-500">
                    View Only
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredRooms.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-medium">
          No rooms match this filter.
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ label, active, onClick, activeClass, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`py-2 text-[11px] font-black uppercase rounded-xl transition
      ${active ? activeClass : "border border-slate-200 text-slate-400"}
      ${!disabled && !active ? "hover:border-slate-400" : ""}
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    {label}
  </button>
);

const Filter = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition
      ${active ? "bg-blue-600 text-white" : "text-slate-500 hover:text-blue-600"}
    `}
  >
    {label}
  </button>
);

export default RoomStatus;
