import React, { useEffect, useRef, useState } from "react";
import "../Admin/Manage_Room.css";
import { getTabToken } from "../utils/tabSession";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManageRoom() {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const token = getTabToken();
  const didFetch = useRef(false);

  // ✅ Form state matches RoomListing.js schema
  const [form, setForm] = useState({
    title: "",
    description: "",
    roomType: "",
    size: "",
    capacity: "",
    bedType: "",
    totalRooms: "",
    perFloor: "",
    amenities: [], // Changed to array for checkboxes
    planName: "",
    inclusions: [], // Changed to array for checkboxes
    standardRate: "",
    currency: "INR",
    images: [] // for edit preview (array of paths)
  });

  const MAX_IMAGES = 5;
  const [imageFiles, setImageFiles] = useState([]); // new files selected by admin
  const [previewUrls, setPreviewUrls] = useState([]); // object URLs for previews
  const fileInputRef = useRef(null); // ref to clear file input programmatically
  const titleInputRef = useRef(null); // focus when opening add form
  const mainRef = useRef(null);
  const roomsListRef = useRef(null);

  // Inclusion options for checkboxes
  const inclusionOptions = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "WiFi",
    "Airport Transfer",
    "Welcome Drink",
    "Spa Access",
    "Gym Access",
    "Swimming Pool",
    "Room Service"
  ];

  // Amenities options for checkboxes
  const amenitiesOptions = [
    "WiFi",
    "Air Conditioning",
    "TV",
    "Mini Bar",
    "Safe",
    "Coffee Maker",
    "Hair Dryer",
    "Iron & Ironing Board",
    "Telephone",
    "Work Desk",
    "Balcony",
    "Sea View",
    "City View",
    "Garden View",
    "Bathtub",
    "Shower",
    "Toiletries",
    "Slippers",
    "Bathrobe",
    "Room Service"
  ];

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchRooms();
  }, []);

  // focus the title input when add form opens and scroll to top
  useEffect(() => {
    if (showForm) {
      // wait for DOM update
      setTimeout(() => {
        titleInputRef.current?.focus();
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }, [showForm]);

  async function fetchRooms() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/admin/rooms`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load rooms: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError(err.message || "Failed to load rooms. Please check your connection and try again.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleInclusionChange(inclusion) {
    setForm(prev => {
      const currentInclusions = Array.isArray(prev.inclusions) ? prev.inclusions : [];
      const isChecked = currentInclusions.includes(inclusion);

      if (isChecked) {
        return { ...prev, inclusions: currentInclusions.filter(item => item !== inclusion) };
      } else {
        return { ...prev, inclusions: [...currentInclusions, inclusion] };
      }
    });
  }

  function handleAmenityChange(amenity) {
    setForm(prev => {
      const currentAmenities = Array.isArray(prev.amenities) ? prev.amenities : [];
      const isChecked = currentAmenities.includes(amenity);

      if (isChecked) {
        return { ...prev, amenities: currentAmenities.filter(item => item !== amenity) };
      } else {
        return { ...prev, amenities: [...currentAmenities, amenity] };
      }
    });
  }

  function handleSearch() {
    setQuery(search);
    // scroll to results for better UX
    setTimeout(() => roomsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function clearSearch() {
    setSearch("");
    setQuery("");
    setTimeout(() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  // debounced live search: update `query` 300ms after typing
  React.useEffect(() => {
    const id = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // highlight helper for showing matching substring
  function highlight(text = "", q = "") {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <span style={{ background: '#fde68a', padding: '0 4px', borderRadius: 4 }}>{match}</span>
        {after}
      </>
    );
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(room) {
    setEditingId(room._id);
    setForm({
      title: room.title,
      description: room.description || "",
      roomType: room.roomType,

      size: room.size,
      capacity: room.capacity,
      bedType: room.bedType,
      totalRooms: room.totalRooms,
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
      planName: room.rates?.planName || "",
      inclusions: Array.isArray(room.rates?.inclusions) ? room.rates.inclusions : [],
      standardRate: room.pricing?.standardRate || "",
      currency: room.pricing?.currency || "INR",
      images: room.images || []
    });
    setImageFiles([]);
    setPreviewUrls([]);
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setImageFiles([]);
    setPreviewUrls([]);
    setForm({
      title: "",
      description: "",
      roomType: "",

      size: "",
      capacity: "",
      bedType: "",
      totalRooms: "",
      amenities: [],
      planName: "",
      inclusions: [],
      standardRate: "",
      currency: "INR",
      images: []
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      // ✅ Check for duplicate title (case-insensitive)
      const normalizedTitle = form.title.trim().toLowerCase();
      const duplicateRoom = rooms.find(room =>
        room.title.toLowerCase() === normalizedTitle &&
        room._id !== editingId
      );

      if (duplicateRoom) {
        setError(`A room with the title "${form.title}" already exists. Please use a different title.`);
        setSubmitting(false);
        return;
      }

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("roomType", form.roomType);
      fd.append("size", form.size);
      fd.append("capacity", form.capacity);
      fd.append("bedType", form.bedType);
      fd.append("totalRooms", form.totalRooms);
      fd.append("amenities", Array.isArray(form.amenities) ? form.amenities.join(", ") : "");
      fd.append("planName", form.planName);
      fd.append("inclusions", Array.isArray(form.inclusions) ? form.inclusions.join(", ") : "");
      fd.append("standardRate", form.standardRate);
      fd.append("currency", "INR"); // Always set to INR

      // include optional rooms-per-floor
      if (form.perFloor) fd.append('perFloor', form.perFloor);

      // validate total images count
      const totalImages = (form.images ? form.images.length : 0) + imageFiles.length;
      if (totalImages > MAX_IMAGES) {
        setError(`You can only save up to ${MAX_IMAGES} images per room. Remove ${totalImages - MAX_IMAGES} image(s) and try again.`);
        setSubmitting(false);
        return;
      }

      // append newly selected files
      imageFiles.forEach(file => fd.append("images", file));

      const url = editingId
        ? `${API}/api/admin/rooms/${editingId}`
        : `${API}/api/admin/rooms`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingId ? 'update' : 'create'} room: ${res.status} ${res.statusText}`);
      }

      resetForm();
      setShowForm(false);
      await fetchRooms();
    } catch (err) {
      console.error("Error submitting room:", err);
      setError(err.message || `Failed to ${editingId ? 'update' : 'create'} room. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteRoom(id) {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      const res = await fetch(`${API}/api/admin/rooms/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete room");
      }

      await fetchRooms();
    } catch (err) {
      console.error("Error deleting room:", err);
      alert(err.message || "Failed to delete room. Please try again.");
    }
  }

  async function toggleStatus(room) {
    const newStatus = room.status === "active" ? "inactive" : "active";
    // Optimistic update
    setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: newStatus } : r));

    try {
      const fd = new FormData();
      fd.append("status", newStatus);

      const res = await fetch(`${API}/api/admin/rooms/${room._id}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      const updatedRoom = await res.json();
      // Verify server actually updated it
      if (updatedRoom.status !== newStatus) {
        throw new Error("Server did not save the status change. Please restart the backend server.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert on error
      setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: room.status } : r));
      alert(err.message || "Failed to update status");
    }
  }

  // cleanup object URLs when previews change / component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  async function removeExistingImage(image) {
    if (!editingId) return;
    if (!window.confirm("Remove this image?")) return;
    try {
      const res = await fetch(`${API}/api/admin/rooms/${editingId}/images`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to remove image");
      }

      // update local form images and refetch list
      setForm(prev => ({ ...prev, images: (prev.images || []).filter(i => i !== image) }));
      await fetchRooms();
    } catch (err) {
      console.error("Error removing image:", err);
      setError(err.message || "Failed to remove image");
    }
  }

  function removeSelectedFile(index) {
    const newFiles = [...imageFiles];
    const newPreviews = [...previewUrls];
    // revoke object URL
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setPreviewUrls(newPreviews);
  }

  // allow multiple picks across separate file-dlg opens (append behavior)
  function handleFileSelect(e) {
    const raw = Array.from(e.target.files || []);
    if (raw.length === 0) return;

    const existingCount = editingId ? (form.images || []).length : 0;
    const remaining = Math.max(0, MAX_IMAGES - existingCount - imageFiles.length);

    if (remaining <= 0) {
      setError(`You already have ${MAX_IMAGES} images. Remove some to add more.`);
      // clear input so the user can re-open it
      if (fileInputRef && fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    if (raw.length > remaining) {
      setError(`You can only add ${remaining} more image${remaining === 1 ? '' : 's'}`);
    } else {
      setError("");
    }

    const toAdd = raw.slice(0, remaining);
    setImageFiles(prev => [...prev, ...toAdd]);
    setPreviewUrls(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);

    // clear input so same files can be re-picked later if needed
    if (fileInputRef && fileInputRef.current) fileInputRef.current.value = null;
  }

  const filteredRooms = rooms.filter(room => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return true;
    const title = room.title || "";
    const bed = room.bedType || "";
    const desc = room.description || "";
    const type = room.roomType || "";
    return (
      title.toLowerCase().includes(q) ||
      bed.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      {/* MAIN */}
      <div className="main" ref={mainRef}>
        <div className="top-bar">
          <h2>Manage Rooms</h2>
        </div>

        {error && (
          <div className="error-box" style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "14px 18px",
            borderRadius: "14px",
            fontSize: "14px",
            marginBottom: "26px",
            border: "1px solid #fecaca"
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Rooms list (always visible) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Rooms List</h3>
            <button className="primary-btn btn-medium" onClick={openAddForm}>+ Add New Room</button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <div className="search-wrapper">
              <span className="search-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="11" r="6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>

              <input
                className="search-input"
                placeholder="Search rooms, bed type or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />

              {search && (
                <button
                  className="clear-btn"
                  onClick={() => { setSearch(''); setQuery(''); titleInputRef.current?.focus(); }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <button onClick={handleSearch} className="secondary-btn">Search</button>
            <button onClick={clearSearch} className="secondary-btn">Clear</button>

            <div style={{ marginLeft: 8, color: '#6b7280' }}>{filteredRooms.length} result{filteredRooms.length !== 1 ? 's' : ''}</div>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p>Loading rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              <p>{query ? `No rooms found matching "${query}"` : "No rooms found. Click 'Add New Room' to create one."}</p>
            </div>
          ) : (
            <table className="room-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Room Type</th>
                  <th>Size</th>
                  <th>Capacity</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map(room => (
                  <tr key={room._id}>
                    <td>
                      {room.images?.[0] ? (
                        <img src={`${API}/${room.images[0]}`} alt={room.title} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }} />
                      ) : (
                        <div style={{ width: "60px", height: "60px", backgroundColor: "#e5e7eb", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "12px" }}>
                          No Image
                        </div>
                      )}
                    </td>
                    <td>{highlight(room.title || "Untitled Room", query)}</td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={room.status === "active"}
                          onChange={() => toggleStatus(room)}
                        />
                        <span className="slider"></span>
                      </label>
                      <div style={{ fontSize: 11, color: room.status === 'active' ? '#16a34a' : '#9ca3af', marginTop: 4 }}>
                        {room.status === 'active' ? 'Active' : 'Hidden'}
                      </div>
                    </td>
                    <td>{room.roomType || "N/A"}</td>
                    <td>{room.size ? `${room.size} m²` : "N/A"}</td>
                    <td>{room.capacity ? `${room.capacity} Guests` : "N/A"}</td>
                    <td>₹{room.pricing?.standardRate || room.standardRate || "0"}</td>
                    <td>
                      <button
                        onClick={() => startEdit(room)}
                        style={{ marginRight: "8px", padding: "6px 12px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRoom(room._id)}
                        style={{ padding: "6px 12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal-style form (opens on top of list, like Manage Staff) */}
        {showForm && (
          <div className="modal-root">
            <div className="modal-backdrop" onClick={() => { setShowForm(false); resetForm(); setError(""); }}></div>
            <div className="modal-center">
              <div className="modal-box">
                <h3 className="card-title">{editingId ? "Update Room" : "Add New Room"}</h3>

                <form className="room-form modern-form" onSubmit={handleSubmit}>
                  {/* Basic Information Section */}
                  <div className="form-section">
                    <h4 className="section-title">Basic Information</h4>
                    <div className="form-row">
                      <div className="form-group full">
                        <label>Room Title *</label>
                        <input
                          ref={titleInputRef}
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          placeholder="e.g., Deluxe Ocean View Suite"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Room Type *</label>
                        <select
                          name="roomType"
                          value={form.roomType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Room Type</option>
                          <option value="Single">Single</option>
                          <option value="Double">Double</option>
                          <option value="Twin">Twin</option>
                          <option value="Deluxe">Deluxe</option>
                          <option value="Suite">Suite</option>
                          <option value="Family">Family</option>
                          <option value="Standard">Standard</option>
                          <option value="Executive">Executive</option>
                          <option value="Presidential">Presidential</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Bed Type *</label>
                        <select
                          name="bedType"
                          value={form.bedType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Bed Type</option>
                          <option value="Single Bed">Single Bed</option>
                          <option value="Twin Beds">Twin Beds</option>
                          <option value="Double Bed">Double Bed</option>
                          <option value="Queen Size">Queen Size</option>
                          <option value="King Size">King Size</option>
                          <option value="Super King Size">Super King Size</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Size (sq.m) *</label>
                        <input
                          type="number"
                          name="size"
                          value={form.size}
                          onChange={handleChange}
                          placeholder="e.g., 45"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Capacity (Guests) *</label>
                        <input
                          type="number"
                          name="capacity"
                          value={form.capacity}
                          onChange={handleChange}
                          placeholder="e.g., 2"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group full">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe the room features, view, and amenities..."
                        rows="4"
                      />
                    </div>
                  </div>

                  {/* Room Configuration Section */}
                  <div className="form-section">
                    <h4 className="section-title">Room Configuration</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Total Rooms *</label>
                        <input
                          type="number"
                          name="totalRooms"
                          value={form.totalRooms}
                          onChange={handleChange}
                          placeholder="e.g., 10"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Rooms per Floor</label>
                        <input
                          type="number"
                          name="perFloor"
                          value={form.perFloor}
                          min={1}
                          placeholder="Default: 2"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group full">
                      <label>Amenities</label>
                      <div className="checkbox-grid">
                        {amenitiesOptions.map((amenity) => (
                          <label key={amenity} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={Array.isArray(form.amenities) && form.amenities.includes(amenity)}
                              onChange={() => handleAmenityChange(amenity)}
                            />
                            <span>{amenity}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="form-section">
                    <h4 className="section-title">Pricing & Rates</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Standard Rate (₹) *</label>
                        <input
                          type="number"
                          name="standardRate"
                          value={form.standardRate}
                          onChange={handleChange}
                          placeholder="e.g., 5000"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Rate Plan Name</label>
                        <select
                          name="planName"
                          value={form.planName}
                          onChange={handleChange}
                        >
                          <option value="">Select Rate Plan</option>
                          <option value="Standard Plan">Standard Plan</option>
                          <option value="Deluxe Plan">Deluxe Plan</option>
                          <option value="Premium Plan">Premium Plan</option>
                          <option value="Executive Plan">Executive Plan</option>
                          <option value="All Inclusive">All Inclusive</option>
                          <option value="Bed & Breakfast">Bed & Breakfast</option>
                          <option value="Half Board">Half Board</option>
                          <option value="Full Board">Full Board</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group full">
                      <label>Inclusions</label>
                      <div className="checkbox-grid">
                        {inclusionOptions.map((inclusion) => (
                          <label key={inclusion} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={Array.isArray(form.inclusions) && form.inclusions.includes(inclusion)}
                              onChange={() => handleInclusionChange(inclusion)}
                            />
                            <span>{inclusion}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="form-section">
                    <h4 className="section-title">Room Images</h4>
                    <div className="form-group full">
                      <label>Upload Images (Max {MAX_IMAGES})</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="file-input"
                      />
                      <div className="file-hint">
                        {`You can add ${Math.max(0, MAX_IMAGES - ((editingId ? (form.images || []).length : 0) + imageFiles.length))} more image${Math.max(0, MAX_IMAGES - ((editingId ? (form.images || []).length : 0) + imageFiles.length)) === 1 ? '' : 's'} (max ${MAX_IMAGES}).`}
                      </div>

                      {/* Existing Images (Edit Mode) */}
                      {editingId && form.images && form.images.length > 0 && (
                        <div className="image-preview-grid">
                          <div className="preview-label">Current Images:</div>
                          {form.images.map((img, idx) => (
                            <div key={idx} className="image-preview-item">
                              <img src={`${API}/${img}`} alt={`Room ${idx}`} />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(img)}
                                className="remove-image-btn"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* New Images Preview */}
                      {previewUrls && previewUrls.length > 0 && (
                        <div className="image-preview-grid">
                          <div className="preview-label">New Images:</div>
                          {previewUrls.map((url, i) => (
                            <div key={i} className="image-preview-item">
                              <img src={url} alt={`Preview ${i}`} />
                              <button
                                type="button"
                                onClick={() => removeSelectedFile(i)}
                                className="remove-image-btn"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="form-error-box">
                      <strong>Error:</strong> {error}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={submitting}
                      style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
                    >
                      {submitting ? "Processing..." : editingId ? "Update Room" : "Add Room"}
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => { setShowForm(false); resetForm(); setError(""); }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ManageRoom;
