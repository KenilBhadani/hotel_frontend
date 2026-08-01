// src/Staff/HousekeepingPanel.js
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Brush, RefreshCw, Wrench } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HousekeepingPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  // 🔐 Authorization - Housekeeping ONLY
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null');
  const isAuthorized = user && user.role === 'Housekeeping';

  // ✅ Hooks ALWAYS run
  useEffect(() => {
    if (isAuthorized) {
      fetchRooms();
      fetchTasks();
    } else {
      setLoading(false);
      setTasksLoading(false);
    }
  }, [isAuthorized]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API}/api/staff/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        }
      });
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      const taskList = Array.isArray(data.tasks) ? data.tasks : (Array.isArray(data) ? data : []);

      // Filter only pending and in-progress tasks
      const activeTasks = taskList.filter(t => ['Pending', 'In Progress'].includes(t.status));
      setTasks(activeTasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const markTaskComplete = async (taskId) => {
    try {
      const res = await fetch(`${API}/api/staff/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
      });
      if (!res.ok) throw new Error('Failed to update task');
      fetchTasks(); // Refresh tasks
      alert('Task marked as complete!');
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };



  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API}/api/staff/rooms/instances`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        }
      });
      if (!res.ok) throw new Error("Failed to load rooms");
      const data = await res.json();

      // ✅ Filter to show only rooms assigned to this user
      // Support both _id and userId depending on how it's stored
      const userId = user._id || user.userId || user.id;

      // Filter: Show rooms assigned to this user AND in CLEANING status (or others if relevant)
      const assignedRooms = Array.isArray(data) ? data.filter(r => r.assignedTo === userId) : [];

      setRooms(assignedRooms);
    } catch (err) {
      console.error(err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async (roomId, status) => {
    try {
      // Find the room to check its current status
      const room = rooms.find(r => r._id === roomId);
      if (!room) {
        alert("Room not found");
        return;
      }

      // ✅ VALIDATION: Only Housekeeping can update status via this endpoint
      // DIRTY -> CLEANING (Start Cleaning)
      // CLEANING -> CLEAN (Wait for Approval)
      // CLEAN/DIRTY/CLEANING -> MAINTENANCE (Report Issue)

      const validTransitions = {
        'DIRTY': ['CLEANING', 'MAINTENANCE'],
        'CLEANING': ['CLEAN', 'MAINTENANCE', 'REVIEW'], // Added REVIEW
        'CLEAN': ['MAINTENANCE', 'REVIEW'] // Added REVIEW
      };

      if (!validTransitions[room.status]?.includes(status)) {
        alert(`Invalid status transition from ${room.status} to ${status}`);
        return;
      }

      const res = await fetch(`${API}/api/staff/rooms/instance/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchRooms(); // Refresh to show updated status
        alert(`Room status updated to ${status}`);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Room status update failed");
      }
    } catch (err) {
      console.error("Room status update error:", err);
      alert("Room status update failed");
    }
  };





  // 🔴 Render unauthorized
  if (!isAuthorized) {
    return (
      <div className="p-20 text-center text-red-600 font-bold">
        Access Denied: Housekeeping role required
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} />
              Housekeeping Panel
            </h2>
            <p className="text-sm text-slate-500">Manage room cleaning and maintenance</p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchRooms();
            fetchTasks();
          }}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          title="Refresh"
        >
          <RefreshCw size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Tasks Section */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="text-blue-600" size={20} />
            Your Assigned Tasks ({tasks.length})
          </h3>

          {tasksLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task._id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.priority === 'High' ? 'bg-red-50 text-red-600' :
                      task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                      <Brush size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800">{task.title}</h4>
                        {task.priority === 'High' && (
                          <span className="text-[9px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-md">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{task.description || 'No description'}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-semibold">Room Number: {task.location || '—'}</span>
                        <span className={`px-2 py-0.5 rounded-full ${task.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => markTaskComplete(task._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all whitespace-nowrap"
                  >
                    <CheckCircle2 size={16} />
                    Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rooms Cleaning Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Brush className="text-amber-500" size={20} />
          Rooms Needing Cleaning
        </h3>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.filter(room => ['DIRTY', 'CLEANING'].includes(room.status)).map(room => (
              <div key={room._id} className="bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition">

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-bold">Room</p>
                    <h3 className="text-3xl font-black">
                      {room.roomNumber || room._id.slice(-4)}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-2xl ${room.status === 'CLEANING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    <Brush size={22} className={room.status === 'CLEANING' ? 'animate-pulse' : ''} />
                  </div>
                </div>

                <p className="text-xs font-bold uppercase text-slate-500 mb-4">
                  {room.roomListing?.title || room.roomListing?.roomType || "—"}
                  <span className={`block mt-1 ${room.status === 'CLEANING' ? 'text-amber-600' : 'text-rose-600'}`}>
                    {room.status === 'CLEANING' ? 'In Progress' : 'Needs Cleaning'}
                  </span>
                </p>

                <div className="space-y-2">
                  {room.status === 'DIRTY' && (
                    <button
                      onClick={() => updateRoomStatus(room._id, "CLEANING")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all"
                    >
                      <Brush size={18} />
                      Start Cleaning
                    </button>
                  )}

                  {room.status === 'CLEANING' && (
                    <button
                      onClick={() => updateRoomStatus(room._id, "REVIEW")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                    >
                      <CheckCircle2 size={18} />
                      Mark Clean (Review)
                    </button>
                  )}

                  <button
                    onClick={() => updateRoomStatus(room._id, "MAINTENANCE")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    <Wrench size={18} />
                    Report Issue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {rooms.filter(room => room.status === "CLEANING").length === 0 && !loading && (
          <div className="text-center py-16">
            <CheckCircle2 size={48} className="mx-auto text-emerald-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">All rooms are clean!</h3>
            <p className="text-slate-500">No rooms currently need cleaning</p>
          </div>
        )}
      </div>

      {/* Clean Rooms Section - HIDDEN FOR HOUSEKEEPING AS PER NEW WORKFLOW */}
      {/* 
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="text-green-500" size={20} />
          Clean Rooms Ready for Release
        </h3> 
        ...
      </div>
      */}
    </div>
  );
};

export default HousekeepingPanel;
