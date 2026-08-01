// src/Admin/AdminStaff.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserPlus, Edit, Trash2, Shield,
  Mail, Phone, Calendar, Search
} from 'lucide-react';
import { getTabToken } from '../utils/tabSession';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // 🔐 Admin-only access
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
  const isAdmin = adminUser && adminUser.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${getTabToken()}` }
      });

      if (res.ok) {
        const data = await res.json();
        setStaff(Array.isArray(data) ? data : data.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch = searchTerm === '' ||
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Handle staff actions
  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const res = await fetch(`${API}/api/admin/staff/${staffId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${getTabToken()}` }
        });

        if (res.ok) {
          fetchStaff(); // Refresh data
          alert('Staff member deleted successfully!');
        } else {
          alert('Failed to delete staff member');
        }
      } catch (err) {
        console.error('Error deleting staff:', err);
        alert('Error deleting staff member');
      }
    }
  };

  // 🔴 Render unauthorized
  if (!isAdmin) {
    return (
      <div className="p-20 text-center text-red-600 font-bold">
        Access Denied: Admin role required
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-slate-200 rounded-full">
            <Shield size={22} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Staff Management
            </h2>
            <p className="text-sm text-slate-500">Manage hotel staff accounts and permissions</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={18} />
          Add Staff
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-slate-600" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase">Total Staff</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{staff.length}</h3>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-purple-600" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase">Maintenance</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-800">
            {staff.filter(s => s.role === 'Maintenance').length}
          </h3>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="text-green-600" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase">Receptionists</span>
          </div>
          <h3 className="text-2xl font-bold text-green-800">
            {staff.filter(s => s.role === 'Receptionist').length}
          </h3>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-orange-600" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase">Housekeeping</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-800">
            {staff.filter(s => s.role === 'Housekeeping').length}
          </h3>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Roles</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Housekeeping">Housekeeping</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStaff.map(member => (
                <tr key={member._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {member.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{member.name}</div>
                        <div className="text-sm text-slate-500">ID: {member._id?.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.role === 'Maintenance' ? 'bg-purple-100 text-purple-800' :
                      member.role === 'Receptionist' ? 'bg-green-100 text-green-800' :
                        member.role === 'Housekeeping' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">
                      {member.shift || 'Morning'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 flex items-center gap-1">
                      <Mail size={12} />
                      {member.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingStaff(member)}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700"
                      >
                        <Edit size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No staff found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm || roleFilter !== 'All' ? 'Try adjusting your search or filter.' : 'Get started by adding your first staff member.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      {(showAddForm || editingStaff) && (
        <StaffForm
          staff={editingStaff}
          allStaff={staff}
          onClose={() => {
            setShowAddForm(false);
            setEditingStaff(null);
          }}
          onSave={() => {
            fetchStaff();
            setShowAddForm(false);
            setEditingStaff(null);
          }}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-slate-600">Loading staff...</span>
        </div>
      )}
    </div>
  );
};

// Staff Form Component
const StaffForm = ({ staff, allStaff, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    email: staff?.email || '',
    password: '',
    role: staff?.role || 'Receptionist',
    phone: staff?.phone || '',
    shift: staff?.shift || 'Morning'
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ Check for duplicate email (case-insensitive)
      const normalizedEmail = formData.email.trim().toLowerCase();
      const duplicateStaff = allStaff.find(member =>
        member.email.toLowerCase() === normalizedEmail &&
        member._id !== staff?._id
      );

      if (duplicateStaff) {
        setError(`A staff member with email "${formData.email}" already exists.`);
        return;
      }

      // Remove empty password if updating
      const payload = { ...formData };
      if (staff && !payload.password) {
        delete payload.password;
      }

      const url = staff
        ? `${API}/api/admin/staff/${staff._id}`
        : `${API}/api/admin/staff`;

      const res = await fetch(url, {
        method: staff ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getTabToken()}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`Staff ${staff ? 'updated' : 'created'} successfully!`);
        onSave();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to save staff');
      }
    } catch (err) {
      console.error('Error saving staff:', err);
      setError('Error saving staff. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password {staff && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              required={!staff}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={staff ? "••••••••" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Receptionist">Receptionist</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Shift</label>
            <select
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Morning">Morning</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {staff ? 'Update Staff' : 'Create Staff'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminStaff;