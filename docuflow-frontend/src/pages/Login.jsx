import React, { useState, useEffect } from "react";
import { AlertCircle, Lock, User } from "lucide-react";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto-redirect if user is already logged in


  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { username, password } = credentials;
    if (!username || !password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log("❌ Login failed:")
        throw new Error(data.message || "Invalid username or password");
      }

      console.log("✅ Login successful");
      localStorage.setItem("username", username);
const usernameLower = username.toLowerCase();

if (roleRoutes.submitter.includes(usernameLower)) {
  window.location.href = "/submitter";
} else if (roleRoutes.reviewer.includes(usernameLower)) {
  window.location.href = "/reviewer";
} else if (roleRoutes.approver.includes(usernameLower)) {
  window.location.href = "/approver";
} else {
  window.location.href = "/submitter";
}
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-900 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Login</h1>

        {error && (
          <div className="flex items-center gap-2 text-red-500 mb-4 bg-red-900/30 p-3 rounded-md">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white pl-10 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white pl-10 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition duration-300 font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
