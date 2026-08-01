import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getTabUser, hasTabSession } from "../utils/tabSession";

export default function LoyaltyHero() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [loading, setLoading] = useState(false);

  const MEMBERSHIP_FEE = 6999;
  const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const checkMembershipStatus = async (email) => {
    try {
      const res = await fetch(`${API_URL}/api/subscribe/status?email=${encodeURIComponent(email)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, active: false, paymentStatus: "NONE" };
      return { ok: true, active: Boolean(data?.active), paymentStatus: data?.paymentStatus || "NONE" };
    } catch {
      return { ok: false, active: false, paymentStatus: "NONE" };
    }
  };

  const checkRegisteredUser = async (email) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { exists: null, error: data?.message || "Unable to verify account" };
      return { exists: Boolean(data?.exists), user: data?.user || null, error: "" };
    } catch {
      return { exists: null, error: "Unable to verify account. Please try again." };
    }
  };

  const saveMemberLocally = (memberEmail) => {
    const n = memberEmail.trim().toLowerCase();
    localStorage.setItem("loyaltyEmail", n);
    localStorage.setItem(`membership_paid_${n}`, "true");
  };

  // Step 1: validate email + check account exists
  const handleContinue = async () => {
    if (loading) return;
    const trimmed = email.trim();
    if (!trimmed) return toast.error("Email is required");
    if (!isValidEmail(trimmed)) return toast.error("Please enter a valid email address");

    try {
      setLoading(true);
      const normalized = trimmed.toLowerCase();

      // Must be logged in to subscribe
      if (!hasTabSession()) {
        toast.error("Please login first to subscribe.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      // Logged-in user's email must match the subscribe email
      const loggedInUser = getTabUser();
      if (loggedInUser?.email && loggedInUser.email.toLowerCase() !== normalized) {
        toast.error(`You are logged in as ${loggedInUser.email}. Please use the same email to subscribe.`);
        return;
      }

      const memberStatus = await checkMembershipStatus(normalized);
      if (memberStatus.ok && memberStatus.active) {
        saveMemberLocally(normalized);
        toast.success("You are already a Privilege Club member. Enjoy your 15% discount on bookings!", { autoClose: 4000 });
        setEmail("");
        return;
      }

      const accountCheck = await checkRegisteredUser(normalized);
      if (accountCheck.exists === null) {
        toast.error(accountCheck.error || "Unable to verify account.");
        return;
      }
      if (!accountCheck.exists) {
        localStorage.setItem("pendingMembershipEmail", normalized);
        toast.error("Please register first to buy membership.");
        navigate("/register");
        return;
      }

      if (accountCheck?.user?.provider && accountCheck.user.provider !== "local") {
        toast.info("This account uses Google login. After membership, login with Google.");
      }

      setShowPaymentStep(true);
    } catch {
      toast.error("Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: process card payment — only called when CardElement is mounted
  const handlePayment = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!stripe || !elements) {
      toast.error("Payment form is not ready. Please try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card details not found. Please refresh and try again.");
      return;
    }

    const normalized = email.trim().toLowerCase();

    try {
      setLoading(true);

      const intentRes = await fetch(`${API_URL}/api/bookings/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: MEMBERSHIP_FEE }),
      });
      if (!intentRes.ok) throw new Error("Unable to start membership payment");
      const { clientSecret } = await intentRes.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email: normalized, name: "Privilege Club Member" },
        },
      });
      if (result.error) throw new Error(result.error.message || "Payment failed");

      const saveRes = await fetch(`${API_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalized,
          paymentMethod: "CARD",
          membershipFee: MEMBERSHIP_FEE,
          paymentStatus: "PAID",
          paymentIntentId: result.paymentIntent?.id || "",
        }),
      });
      const saveData = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        if (saveRes.status === 409) {
          saveMemberLocally(normalized);
          toast.info("You are already a Privilege Club member. Enjoy your 15% discount on bookings!", { autoClose: 4000 });
          setEmail("");
          setShowPaymentStep(false);
          return;
        }
        throw new Error(saveData?.message || "Subscription failed");
      }

      saveMemberLocally(normalized);
      localStorage.removeItem("pendingMembershipEmail");
      toast.success("Welcome to the Privilege Club.", { autoClose: 1500 });
      setEmail("");
      setShowPaymentStep(false);
      setTimeout(() => navigate("/login", { replace: true }), 1600);
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay loop muted playsInline
            poster="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
            className="w-full h-full object-cover"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-luxury-hotel-lobby-and-reception-area-10025-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/20 to-transparent" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-xl bg-white/95 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              Privilege Club
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-4">
              Travel Better with <br />
              <span className="text-amber-600 italic">Member Benefits.</span>
            </h1>

            <p className="text-slate-600 text-lg mb-8">
              Join the RoyalPark Privilege Club to unlock instant 15% discounts, early check-ins, and curated local experiences.
            </p>

            <div className="flex flex-col gap-3 bg-slate-100 p-4 rounded-2xl border mb-8">
              <input
                type="email"
                required
                disabled={loading || showPaymentStep}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white px-4 py-3 outline-none disabled:opacity-60 border rounded-xl"
              />

              {showPaymentStep && (
                <form onSubmit={handlePayment} className="flex flex-col gap-3">
                  <div className="text-sm font-semibold text-slate-700">
                    Membership Fee: Rs.{MEMBERSHIP_FEE}
                  </div>
                  <div className="bg-white rounded-xl border p-3">
                    <CardElement options={{ hidePostalCode: true }} />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition disabled:opacity-60"
                  >
                    {loading ? "Processing..." : `Pay Rs.${MEMBERSHIP_FEE} & Join`}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowPaymentStep(false)}
                    className="text-sm text-slate-500 hover:text-slate-700 underline"
                  >
                    ← Change email
                  </button>
                </form>
              )}

              {!showPaymentStep && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleContinue}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition disabled:opacity-60"
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-6 gap-4">
              <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase">
                <span>★ Room Upgrades</span>
                <span>★ Free Spa</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
