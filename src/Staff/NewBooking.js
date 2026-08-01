import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, User, BedDouble, CheckCircle, ArrowLeft
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const NewBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    specialRequests: '',
    totalAmount: 0
  });

  // 🔐 Authorization - Receptionist ONLY
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null');
  const isAuthorized = user && user.role === 'Receptionist';

  // Load pre-selected room data from localStorage
  useEffect(() => {
    const storedRoomData = localStorage.getItem('selectedRoomForBooking');
    if (storedRoomData) {
      const roomData = JSON.parse(storedRoomData);
      setSelectedRoom(roomData);
      setFormData(prev => ({
        ...prev,
        checkIn: roomData.checkIn || '',
        checkOut: roomData.checkOut || '',
        totalAmount: roomData.pricing?.standardRate
          ? Math.ceil((new Date(roomData.checkOut) - new Date(roomData.checkIn)) / (1000 * 60 * 60 * 24)) * roomData.pricing.standardRate
          : 0
      }));
      localStorage.removeItem('selectedRoomForBooking');
    }
  }, []);

  // Fetch available rooms when dates change
  useEffect(() => {
    if (isAuthorized && formData.checkIn && formData.checkOut) {
      fetchAvailableRooms();
    }
  }, [formData.checkIn, formData.checkOut, isAuthorized]);

  const fetchAvailableRooms = async () => {
    try {
      console.log('Fetching rooms for:', formData.checkIn, 'to', formData.checkOut);
      const res = await fetch(
        `${API}/api/rooms/available?checkIn=${formData.checkIn}&checkOut=${formData.checkOut}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log('Available rooms:', data);
        setAvailableRooms(data || []);
      } else {
        console.error('Failed to fetch rooms, status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch available rooms:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomSelect = (room) => {
    if (room.availableRooms <= 0) {
      alert('No rooms available for this selection');
      return;
    }

    setSelectedRoom(room);

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const total = nights * (room.pricing?.standardRate || 0);

    setFormData(prev => ({
      ...prev,
      totalAmount: total
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoom) {
      alert('Please select a room');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        ...formData,
        roomId: selectedRoom._id,
        bookingStatus: 'Confirmed'
      };

      const res = await fetch(`${API}/api/staff/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify(bookingData)
      });

      if (res.ok) {
        alert('Booking created successfully!');
        navigate('/staff/bookings');
      } else {
        const error = await res.json();
        alert(`Failed to create booking: ${error.message}`);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Error creating booking');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-center gap-4">
        <Link to="/staff/bookings" className="p-2 hover:bg-slate-200 rounded-full">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            Create New Booking
          </h2>
          <p className="text-sm text-slate-500">Book a room for a guest</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Guest Information Form */}
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="text-slate-600" size={20} />
            Guest Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Date</label>
                <input type="date" name="checkIn" required value={formData.checkIn} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-out Date</label>
                <input type="date" name="checkOut" required value={formData.checkOut} onChange={handleInputChange} min={formData.checkIn || new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests</label>
              <textarea name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Any special requests or notes..." />
            </div>

            <button type="submit" disabled={loading || !selectedRoom} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Booking...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Create Booking
                </>
              )}
            </button>
          </form>
        </div>

        {/* Room Selection */}
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BedDouble className="text-slate-600" size={20} />
            Available Rooms
          </h3>

          {formData.checkIn && formData.checkOut ? (
            <div className="space-y-3">
              {availableRooms.map(room => (
                <div key={room._id} onClick={() => handleRoomSelect(room)} className={`group p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedRoom?._id === room._id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex gap-4">
                    {/* Image Thumbnail */}
                    <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                      {room.images && room.images[0] ? (
                        <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <BedDouble size={24} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg leading-tight">
                            {room.title}
                          </h4>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                            {room.roomType}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-slate-900">
                            ₹{room.pricing?.standardRate || 0}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase">per night</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <span className={`flex items-center gap-1 font-medium ${room.availableRooms < 3 ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {room.availableRooms < 3 ? <span className="w-2 h-2 rounded-full bg-orange-500"></span> : <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                            {room.availableRooms} rooms left
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs">{room.capacity} Guests</span>
                        </div>

                        {selectedRoom?._id === room._id && (
                          <div className="flex items-center gap-1 text-blue-600 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                            <CheckCircle size={14} />
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {availableRooms.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <BedDouble className="mx-auto mb-2" size={32} />
                  <p>No rooms available for selected dates</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="mx-auto mb-2" size={32} />
              <p>Select check-in and check-out dates to view available rooms</p>
            </div>
          )}

          {selectedRoom && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-800 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Room {selectedRoom.roomNumber} ({selectedRoom.roomType})</span>
                  <span>${selectedRoom.pricing?.standardRate || 0}/night</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights</span>
                  <span>{Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${formData.totalAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewBooking;
