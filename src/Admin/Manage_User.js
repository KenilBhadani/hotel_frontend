import React, { useEffect, useState } from "react";
import "../Admin/Manage_User.css";
import { getTabToken } from "../utils/tabSession";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const token = getTabToken();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/users`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setQuery(search);
  }

  function clearSearch() {
    setSearch("");
    setQuery("");
  }

  function openConfirm(user) {
    setSelectedUser(user);
    setConfirmOpen(true);
  }

  async function confirmStatusChange() {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `${API}/api/admin/users/${selectedUser._id}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ isActive: !selectedUser.isActive })
        }
      );

      if (!res.ok) {
        alert("Failed to update status");
        return;
      }

      setUsers(prev =>
        prev.map(u =>
          u._id === selectedUser._id
            ? { ...u, isActive: !selectedUser.isActive }
            : u
        )
      );
    } catch {
      alert("Server error");
    } finally {
      setConfirmOpen(false);
      setSelectedUser(null);
    }
  }

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="main">
        <div className="top-bar">
          <h2>Manage Users</h2>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="card">
          <h3 className="card-title">User List</h3>

          <div className="search-bar">
            <input
              placeholder="Search user by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={clearSearch}>Clear</button>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table className="room-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.mobileNo}</td>
                    <td>
                      <span className={user.isActive ? "available" : "not-available"}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={user.isActive ? "btn-danger" : "btn-success"}
                        onClick={() => openConfirm(user)}
                      >
                        {user.isActive ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Confirm Action</h3>
            <p>
              Are you sure you want to{" "}
              <strong>{selectedUser?.isActive ? "block" : "unblock"}</strong>{" "}
              this user?
            </p>

            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className={selectedUser?.isActive ? "btn-danger" : "btn-success"}
                onClick={confirmStatusChange}
              >
                {selectedUser?.isActive ? "Block" : "Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUser;
