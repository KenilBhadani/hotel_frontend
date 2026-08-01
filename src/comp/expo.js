import React from "react";
import HeaderOfCustomer from "./HeaderOfCustomer";
import hotelVideo from "../images/Luxury_hotel.mp4";

export default function EXPO() {
  return (
    <div className="bg-white text-slate-800 antialiased">

      {/* ================= HEADER ================= */}
      <HeaderOfCustomer />

      {/* ================= HERO ================= */}
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
          alt="Luxury Hotel"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl text-white font-serif font-bold tracking-tight">
            Our Story
          </h1>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <main className="max-w-4xl mx-auto px-6 py-20">

        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-amber-600">
          A Legacy of Luxury
        </h2>

        <p className="mb-6 text-slate-600 text-lg leading-relaxed">
          Established in 2020, our hotel began with a vision to redefine luxury
          hospitality through thoughtful experiences, elegant design, and
          personalized service.
        </p>

        <p className="mb-12 text-slate-600 text-lg leading-relaxed">
          Every detail is carefully crafted to offer comfort, warmth, and
          unforgettable moments for our guests.
        </p>

        {/* Video */}
        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-8 border-slate-50">
          <video
            className="w-full h-full object-cover"
            src={hotelVideo}
            controls
            muted
            playsInline
          />
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 border-t border-slate-100 text-center bg-white">
        <p className="text-[10px] tracking-[0.4em] text-slate-400 font-bold uppercase">
          RoyalPark Hotel & Resorts
        </p>
      </footer>
    </div>
  );
}
