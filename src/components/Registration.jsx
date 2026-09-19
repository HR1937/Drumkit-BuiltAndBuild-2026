import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Lock,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
} from "lucide-react";

export default function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!formData.consent) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    // Registration successful
    console.log("NexJour account created:", formData);

    // Redirect customer to Login page
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-paper px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back to Home */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-thread to-thread-2 text-white shadow-lg">
              <UserPlus size={26} />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Create your NexJour account
          </h1>

          <p className="mt-3 text-muted">
            Connect your customer journeys and uncover what matters.
          </p>
        </div>

        {/* Registration Card */}
        <div className="rounded-3xl border border-ink/8 bg-surface p-6 shadow-[0_15px_50px_rgba(18,22,43,0.08)] sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Name */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-ink">
                Personal Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    First Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    Last Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    Work Email
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
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-ink">
                Company Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Company */}
                <div>
                  <label
                    htmlFor="company"
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    Company
                  </label>

                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company name"
                      className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    Your Role
                  </label>

                  <div className="relative">
                    <Briefcase
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread"
                    >
                      <option value="">Select your role</option>
                      <option value="analyst">Analyst</option>
                      <option value="customer-success">
                        Customer Success
                      </option>
                      <option value="product">Product</option>
                      <option value="marketing">Marketing</option>
                      <option value="operations">Operations</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-ink">
                Account Security
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
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
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-thread"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="rounded-2xl bg-paper p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 accent-orange-500"
                />

                <span className="text-sm leading-6 text-muted">
                  I agree to the NexJour terms of service and privacy policy.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-thread to-thread-2 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(255,90,54,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,90,54,0.3)]"
            >
              Create NexJour Account
              <CheckCircle2
                size={18}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </button>

            {/* Login */}
            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-thread hover:underline"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}