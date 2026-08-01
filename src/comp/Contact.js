import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import HeaderOfCustomer from "./HeaderOfCustomer";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const API_URL =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setStatus({ type: "", text: "" });

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send message");
      }

      setStatus({
        type: "success",
        text: "Thank you for reaching out. Our RoyalPark concierge team will contact you shortly.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "We could not send your message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white font-sans text-slate-900 antialiased">

      {/* HEADER */}
      <HeaderOfCustomer />

      {/* HERO SECTION */}
      <section className="relative h-[50vh] flex items-center justify-center bg-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt="Contact Background"
          loading="lazy"
        />
        <div className="relative text-center px-6">
          <span className="text-amber-400 font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-7xl text-white font-serif tracking-tight">
            Contact Us
          </h1>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto py-24 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* CONTACT FORM */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-serif text-slate-900 mb-4">
                Send us a Message
              </h2>
              <p className="text-slate-500 font-light">
                Whether you have a question about booking or special requests,
                our concierge is here to help.
              </p>
            </div>

            {status.text && (
              <div
                role="status"
                className={`rounded-lg border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {status.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-b border-slate-200 py-3 focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-b border-slate-200 py-3 focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border-b border-slate-200 py-3 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-slate-100 bg-slate-50 p-4 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-slate-900 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-amber-500 transition-all duration-300 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          </div>

          {/* CONTACT INFO + MAP */}
          <div className="space-y-12">
            <div className="bg-slate-50 p-12 space-y-8 border-t-4 border-amber-500 rounded-xl shadow-sm">

              <div className="flex gap-6 items-start">
                <MapPin className="text-amber-500" />
                <p className="text-slate-500">
                  123 Royal Avenue, Palace District,<br />
                  Mumbai, India
                </p>
              </div>

              <div className="flex gap-6 items-center">
                <Phone className="text-amber-500" />
                <p className="text-slate-500">+91 987 654 3210</p>
              </div>

              <div className="flex gap-6 items-center">
                <Mail className="text-amber-500" />
                <p className="text-slate-500 italic">
                  reservations@royalpark.com
                </p>
              </div>
            </div>

            {/* GOOGLE MAP */}
            <div className="h-[350px] rounded-xl overflow-hidden shadow-lg">
              <iframe
                title="Hotel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.117152026092!2d72.83302817509763!3d18.92198468223311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce2f6e9b6d1b%3A0x4d9a3f7f5b1a6c7d!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1710000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-20 border-t text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-slate-400">
          RoyalPark Hotel & Resorts
        </p>
      </footer>
    </div>
  );
}

export default Contact;
