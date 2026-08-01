import React, { useState } from "react";
import {
  Users,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Maximize2,
  Wifi,
  Coffee,
  Tv,
  Wind,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:5000";

const RoomCard = ({ room, onSelect, checkIn, checkOut }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  if (!room) return null;

  const images = room.images || [];
  const {
    rates,
    pricing,
    title,
    roomType,
    capacity,
    bedType,
    description,
    availableRooms,
    size,
    amenities = [],
  } = room;

  /* ================= CORRECT AVAILABILITY LOGIC ================= */
  const datesSelected = Boolean(checkIn && checkOut);

  // ✅ Sold out ONLY when dates are selected
  const isSoldOut =
    datesSelected && typeof availableRooms === "number"
      ? availableRooms <= 0
      : false;

  const isAvailable = !isSoldOut;

  /* ================= IMAGE HELPERS ================= */
  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://via.placeholder.com/400x300?text=No+Image";
    return imagePath.startsWith("http")
      ? imagePath
      : `${BASE_URL}/${imagePath.replace(/^\//, "")}`;
  };

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  /* ================= HANDLE SELECT ================= */
  const handleSelectRoom = () => {
    if (!datesSelected) {
      toast.info("Please select check-in and check-out dates first");
      return;
    }

    if (isSoldOut) {
      toast.error("No rooms available for selected dates");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    onSelect(room);
  };

  // Parse amenities if it's a string
  const amenitiesList = Array.isArray(amenities)
    ? amenities
    : typeof amenities === 'string'
      ? amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];

  // Parse inclusions if it's a string
  const inclusionsList = Array.isArray(rates?.inclusions)
    ? rates.inclusions
    : typeof rates?.inclusions === 'string'
      ? rates.inclusions.split(',').map(i => i.trim()).filter(Boolean)
      : [];

  return (
    <div className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 mb-6 group w-full max-w-5xl mx-auto transition-all hover:shadow-xl hover:border-amber-200">

      {/* ================= IMAGE & MAIN INFO ================= */}
      <div className="flex flex-col md:flex-row md:h-[340px]">
        {/* IMAGE */}
        <div className="w-full md:w-[380px] h-[240px] md:h-full relative bg-slate-100 overflow-hidden border-r">
          <img
            src={getImageUrl(images[currentImgIndex])}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {currentImgIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* ================= BADGE ================= */}
          <div className="absolute top-3 left-3">
            {!datesSelected && (
              <span className="bg-slate-600 text-white text-[11px] font-black px-3 py-1 rounded-full">
                Select Dates
              </span>
            )}

            {datesSelected && isSoldOut && (
              <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full">
                Sold Out
              </span>
            )}

            {datesSelected && !isSoldOut && (
              <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full">
                {availableRooms} Rooms Left
              </span>
            )}
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between">
            <div>
              <span className="text-amber-600 text-[10px] font-black uppercase tracking-widest">
                {roomType}
              </span>
              <h3 className="text-2xl font-bold mt-1">{title}</h3>
              <div className="flex items-center gap-1 mt-1 text-emerald-600">
                <CheckCircle2 size={14} />
                <span className="text-xs font-bold uppercase">
                  {rates?.planName || "Standard Plan"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black">
                ₹{pricing?.standardRate?.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Per Night
              </span>
            </div>
          </div>

          <p className="text-slate-500 text-sm mt-3 line-clamp-2">
            {description || "Luxury room with premium amenities and modern facilities."}
          </p>

          {/* Quick Info */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
              <Users size={16} className="text-slate-600" />
              <span className="text-xs font-bold">{capacity} Guests</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
              <BedDouble size={16} className="text-slate-600" />
              <span className="text-xs font-bold">{bedType}</span>
            </div>
            {size && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                <Maximize2 size={16} className="text-slate-600" />
                <span className="text-xs font-bold">{size} m²</span>
              </div>
            )}
          </div>

          {/* Inclusions Preview */}
          {inclusionsList.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {inclusionsList.slice(0, 3).map((inclusion, idx) => (
                <span key={idx} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {inclusion}
                </span>
              ))}
              {inclusionsList.length > 3 && (
                <span className="text-xs text-slate-500 px-2 py-1">
                  +{inclusionsList.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto pt-4 border-t flex items-center justify-between gap-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 font-medium transition-colors"
            >
              <Info size={16} />
              {showDetails ? 'Hide Details' : 'View Details'}
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button
              type="button"
              onClick={handleSelectRoom}
              className={`px-8 py-3 rounded-2xl font-bold transition-all
                ${isSoldOut
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-amber-600 text-white"
                }`}
            >
              {!datesSelected
                ? "Select Dates First"
                : isSoldOut
                  ? "Unavailable"
                  : "Select Room"}
            </button>
          </div>
        </div>
      </div>

      {/* ================= EXPANDABLE DETAILS ================= */}
      {showDetails && (
        <div className="border-t bg-slate-50 p-6 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Wifi size={16} className="text-amber-600" />
                  Room Amenities
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {amenitiesList.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions */}
            {inclusionsList.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  What's Included
                </h4>
                <div className="space-y-2">
                  {inclusionsList.map((inclusion, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      {inclusion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deposit Policy */}
            {rates?.depositPolicy && (
              <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Info size={16} className="text-blue-600" />
                  Deposit Policy
                </h4>
                <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                  {rates.depositPolicy}
                </p>
              </div>
            )}

            {/* Full Description */}
            {description && (
              <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-2">Full Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
