import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Success() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      confirmBooking();
    }
  }, [sessionId]);

  const confirmBooking = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/bookings/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (res.ok) {
        setStatus("success");
        // Redirect to dashboard after 3 seconds
        setTimeout(() => navigate("/dashboard"), 3000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
      {status === "loading" && (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
          <p className="text-lg font-semibold">पेमेंट कन्फर्म किया जा रहा है, कृपया प्रतीक्षा करें...</p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-green-500 text-6xl mb-4">✔</div>
          <h2 className="text-2xl font-bold mb-2">बुकिंग सफल रही!</h2>
          <p className="text-slate-600">आपका पेमेंट मिल गया है। आपको जल्द ही डैशबोर्ड पर रिडायरेक्ट किया जाएगा।</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">✖</div>
          <h2 className="text-2xl font-bold mb-2">ओह! कुछ गलत हुआ।</h2>
          <p className="text-slate-600">पेमेंट वेरिफिकेशन फेल हो गया। कृपया एडमिन से संपर्क करें।</p>
          <button onClick={() => navigate("/")} className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-lg">होम पर जाएँ</button>
        </div>
      )}
    </div>
  );
}