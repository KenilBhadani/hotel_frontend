import React from "react";
import HeaderOfCustomer from "./HeaderOfCustomer"; // adjust path if needed

function AboutPage() {

  const teamMembers = [
    {
      id: 1,
      name: "James Anderson",
      role: "General Manager",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Head Chef",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Guest Relations",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div className="bg-white font-sans text-slate-900 antialiased">

      {/* ✅ Shared Header */}
      <HeaderOfCustomer />

      <main>
        {/* ================= HERO ================= */}
        <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Hotel Lobby"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-slate-900/40" />

          <div className="relative text-center px-6">
            <span className="inline-block text-amber-400 font-bold tracking-[0.5em] uppercase text-[10px] mb-6 opacity-90">
              Est. 1998
            </span>

            <h1 className="text-6xl md:text-9xl text-white font-serif font-light tracking-tighter leading-none mb-4">
              About <span className="italic font-normal text-amber-500">Us</span>
            </h1>
          </div>
        </section>

        {/* ================= HERITAGE ================= */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-amber-500 font-bold text-xs tracking-[0.3em] uppercase">
                Since 1998
              </p>

              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                Redefining Luxury <br />
                <span className="text-amber-500 italic">Hospitality</span>
              </h2>

              <p className="text-slate-500 text-lg font-light leading-relaxed">
                RoyalPark began with a simple vision: to create a sanctuary where
                comfort meets elegance. Over the last two decades, we have evolved
                into a landmark of luxury hospitality.
              </p>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80"
                alt="Hotel Interior"
                className="w-full h-[500px] object-cover rounded-sm shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* ================= TEAM ================= */}
        <section className="bg-slate-900 py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-4">
                Our Curators
              </h2>
              <h3 className="text-4xl md:text-5xl font-serif text-white">
                The Faces of Excellence
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {teamMembers.map((member) => (
                <div key={member.id} className="group">
                  <div className="aspect-[4/5] overflow-hidden bg-slate-800 rounded-sm">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>

                  <div className="mt-6 text-center">
                    <h4 className="text-xl font-serif text-white">
                      {member.name}
                    </h4>
                    <p className="text-amber-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 bg-white text-center border-t border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
          RoyalPark Hotel & Resorts
        </p>
      </footer>
    </div>
  );
}

export default AboutPage;
