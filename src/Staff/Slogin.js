import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Hotel } from "lucide-react";
import { setTabSession, SESSION_TYPES } from "../utils/tabSession";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API}/api/staff/auth/login`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid email or password");
        return;
      }

      // Store staff auth in tab session
      setTabSession(SESSION_TYPES.STAFF, data.token, data.staff);

      // Redirect to staff dashboard
      navigate("/staff/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setErrorMessage("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full mb-4">
            <Hotel className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Staff Login</h2>
        </div>

        {errorMessage && (
          <div className="mb-4 text-red-600 text-sm">{errorMessage}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 py-3 border rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 py-3 border rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SLogin;
