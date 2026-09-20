import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  LogIn,
  UserPlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8787"}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(formData) });
      if (!response.ok) { const payload = await response.json().catch(() => ({})); setError(payload.error?.message || "The email or password is incorrect."); return; }
      const payload = await response.json();
      navigate("/app");
    } catch { setError("Breeze is temporarily unavailable. Please try again."); }
  };

  return (
    <div className="min-h-screen bg-paper px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[90vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-ink/8 bg-surface shadow-[0_15px_50px_rgba(18,22,43,0.08)] lg:grid-cols-2">

          {/* Left Side - Branding */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-thread to-thread-2 p-8 text-white sm:p-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <LogIn size={30} />
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome to Breeze
            </h1>

            <p className="mt-5 text-base leading-7 text-white/90 sm:text-lg">
              Connect every customer interaction into one complete journey
              and discover what really matters.
            </p>

            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm leading-6 text-white/90">
                “One customer. Every interaction. One complete journey.”
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-7 sm:p-10 lg:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-muted">
                Login to access your Breeze account.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Logout Message */}
            {logoutMessage && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border-l-4 border-green-500 bg-green-50 p-4 text-sm text-green-600">
                <CheckCircle2 size={18} />
                <span>{logoutMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread focus:ring-2 focus:ring-thread/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread focus:ring-2 focus:ring-thread/10"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-thread to-thread-2 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(255,90,54,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,90,54,0.3)]"
              >
                <LogIn
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />

                Login to Breeze
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4 text-xs text-muted">
              <div className="h-px flex-1 bg-ink/10" />
              <span>OR</span>
              <div className="h-px flex-1 bg-ink/10" />
            </div>

            {/* Register */}
            <div className="text-center text-sm text-muted">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-thread hover:underline"
              >
                Create an account
              </Link>
            </div>

            {/* Back Home */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
