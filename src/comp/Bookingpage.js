import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "./RoomCard";
import { Loader2, LayoutGrid, SlidersHorizontal, AlertCircle } from "lucide-react";

/**
 * @param {Object} searchParams - Passed from the parent or router 
 * Expected shape: { checkIn: 'YYYY-MM-DD', checkOut: 'YYYY-MM-DD', guests: 2, roomType: 'Deluxe' }
 */
export default function Bookingpage({ searchParams }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5000";

  /**
   * 1. NAVIGATION TO FORM
   * Triggers when "Select Room" is clicked in the RoomCard
   */
  const handleSelectRoom = (room) => {
    // Navigates to your specified path with full state
    navigate("/bookingformpage", { 
      state: { 
        selectedRoom: room,
        bookingDates: searchParams 
      } 
    });
  };

  /**
   * 2. FETCH DATA FROM BACKEND
   * Hits the /api/rooms/available route you created
   */
  const fetchAvailableRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_URL}/api/rooms/available`;
      
      // Construct query string based on search criteria
      if (searchParams?.checkIn) {
        const query = new URLSearchParams({
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          roomType: searchParams.roomType || "",
          guests: searchParams.guests || "",
        }).toString();
        url += `?${query}`;
      }

      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error("Could not connect to the room inventory server.");
      }
      
      const data = await res.json();
      
      // Filter out any potential nulls and set rooms
      const validData = Array.isArray(data) ? data.filter(r => r !== null) : [];
      setRooms(validData);
      
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("We're having trouble loading room availability right now.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAvailableRooms();
  }, [fetchAvailableRooms]);

  // --- UI: LOADING STATE ---
  if (loading) return (
    <div className="max-w-6xl mx-auto p-20 flex flex-col items-center justify-center min-h-[500px]">
      <Loader2 className="animate-spin text-amber-600 mb-4" size={48} />
      <h3 className="text-xl font-bold text-slate-800">Checking Live Inventory</h3>
      <p className="text-slate-500">Securing the best rates for your stay...</p>
    </div>
  );

  // --- UI: ERROR STATE ---
  if (error) return (
    <div className="max-w-4xl mx-auto p-12 text-center">
      <div className="bg-red-50 border border-red-100 p-8 rounded-3xl">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
        <h3 className="text-lg font-bold text-red-900 mb-2">Something went wrong</h3>
        <p className="text-red-700 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-amber-600"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Inventory</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight">
              Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Perfect Stay</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              We found {rooms.length} accommodations matching your search.
            </p>
          </div>

          {/* DATE & GUEST INFO CHIP */}
          {searchParams?.checkIn && (
            <div className="flex items-center gap-3 bg-white p-3 pr-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="bg-slate-100 p-2.5 rounded-xl">
                <SlidersHorizontal size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Your Selection</p>
                <p className="text-sm font-bold text-slate-800">
                  {new Date(searchParams.checkIn).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})} — {new Date(searchParams.checkOut).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}
                  <span className="text-slate-300 mx-2">|</span>
                  {searchParams.guests || '1'} Guests
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ROOM LISTING GRID */}
        
        <div className="flex flex-col gap-2">
          {rooms.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <LayoutGrid className="mx-auto text-slate-200 mb-4" size={60} />
              <h3 className="text-xl font-bold text-slate-800">No Availability Found</h3>
              <p className="text-slate-400 max-w-sm mx-auto mt-2">
                We couldn't find any rooms for these specific dates. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onSelect={handleSelectRoom}
                checkIn={searchParams?.checkIn}
                checkOut={searchParams?.checkOut}
              />
            ))
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
            Prices include all applicable taxes and fees • Secure 256-bit SSL encrypted booking
          </p>
        </div>
      </div>
    </div>
  );
}