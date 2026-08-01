import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronLeft, Brush, Wrench, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { getTabToken } from '../utils/tabSession';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Unassigned');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState('');

    useEffect(() => {
        fetchTasks();
        fetchStaff();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API}/api/staff/tasks`, {
                headers: { Authorization: `Bearer ${getTabToken()}` }
            });
            if (!res.ok) throw new Error('Failed to load tasks');
            const data = await res.json();
            setTasks(Array.isArray(data.tasks) ? data.tasks : (Array.isArray(data) ? data : []));
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch(`${API}/api/admin/staff`, {
                headers: { Authorization: `Bearer ${getTabToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                const allStaff = Array.isArray(data) ? data : data.staff || [];
                setStaffList(allStaff.filter(s => ['Housekeeping', 'Maintenance'].includes(s.role) && s.isActive));
            }
        } catch (err) {
            console.error("Failed to load staff", err);
        }
    };

    const assignStaff = async () => {
        if (!selectedTask || !selectedStaffId) return;

        try {
            const res = await fetch(`${API}/api/staff/tasks/${selectedTask._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getTabToken()}`
                },
                body: JSON.stringify({ assignedTo: selectedStaffId })
            });

            if (res.ok) {
                alert('Staff assigned successfully!');
                setAssignModalOpen(false);
                setSelectedTask(null);
                setSelectedStaffId('');
                fetchTasks();
            } else {
                const data = await res.json();
                alert(data.message || 'Assignment failed');
            }
        } catch (err) {
            console.error('Assign error', err);
            alert('Assignment failed');
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'All') return true;
        if (filter === 'Unassigned') return !t.assignedTo;
        if (filter === 'Housekeeping') return t.category === 'Housekeeping';
        if (filter === 'Maintenance') return t.category === 'Maintenance';
        if (filter === 'Completed') return t.status === 'Completed';
        return true;
    });

    const unassignedCount = tasks.filter(t => !t.assignedTo && t.status !== 'Completed').length;
    const housekeepingCount = tasks.filter(t => t.category === 'Housekeeping' && t.status !== 'Completed').length;
    const maintenanceCount = tasks.filter(t => t.category === 'Maintenance' && t.status !== 'Completed').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-6">

            {/* Assignment Modal */}
            {assignModalOpen && selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Assign Staff to Task</h3>

                        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-bold text-slate-800">{selectedTask.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{selectedTask.category} • {selectedTask.priority} Priority</p>
                            {selectedTask.location && (
                                <p className="text-xs text-slate-600 mt-1">Room: {selectedTask.location}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Staff Member</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                            >
                                <option value="">-- Choose Staff --</option>
                                <optgroup label="Housekeeping">
                                    {staffList.filter(s => s.role === 'Housekeeping').map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.shift || 'No shift'})</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Maintenance">
                                    {staffList.filter(s => s.role === 'Maintenance').map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.shift || 'No shift'})</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setAssignModalOpen(false);
                                    setSelectedTask(null);
                                    setSelectedStaffId('');
                                }}
                                className="flex-1 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 font-bold text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={assignStaff}
                                disabled={!selectedStaffId}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="p-2 hover:bg-slate-200 rounded-full">
                        <ChevronLeft size={22} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Task Management</h2>
                        <p className="text-sm text-slate-500">
                            Assign staff to tasks created by reception
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 bg-white border rounded-xl p-1 shadow-sm">
                    {["Unassigned", "All", "Housekeeping", "Maintenance", "Completed"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition
                ${filter === f ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}
              `}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Unassigned</p>
                            <h3 className="text-2xl font-black text-red-600">{unassignedCount}</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Housekeeping</p>
                            <h3 className="text-2xl font-black text-amber-600">{housekeepingCount}</h3>
                        </div>
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <Brush size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Maintenance</p>
                            <h3 className="text-2xl font-black text-orange-600">{maintenanceCount}</h3>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <Wrench size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks Grid */}
            {loading ? (
                <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-400 font-medium">No tasks match this filter.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredTasks.map(task => (
                        <div key={task._id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition flex items-center justify-between gap-4">

                            <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.category === 'Maintenance' ? 'bg-orange-50 text-orange-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {task.category === 'Maintenance' ? <Wrench size={20} /> : <Brush size={20} />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800">{task.title}</h3>
                                        {task.priority === 'High' && (
                                            <span className="text-[9px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-md">
                                                Urgent
                                            </span>
                                        )}
                                        {!task.assignedTo && (
                                            <span className="text-[9px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-md">
                                                Unassigned
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{task.description || 'No description'}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="font-medium">{task.category}</span>
                                        <span>Priority: {task.priority}</span>
                                        {task.location && <span>Room: {task.location}</span>}
                                        {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                                    </div>
                                    {task.assignedTo && (
                                        <div className="mt-2 flex items-center gap-2 text-xs">
                                            <User size={12} className="text-blue-600" />
                                            <span className="text-blue-700 font-medium">
                                                Assigned to: {typeof task.assignedTo === 'object' ? task.assignedTo.name : 'Staff Member'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-center ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                    task.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                    {task.status}
                                </span>

                                {task.status !== 'Completed' && (
                                    <button
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setSelectedStaffId(task.assignedTo?._id || task.assignedTo || '');
                                            setAssignModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all whitespace-nowrap"
                                    >
                                        <User size={16} />
                                        {task.assignedTo ? 'Reassign' : 'Assign Staff'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminTasks;
