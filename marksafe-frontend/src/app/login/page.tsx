"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import type { Department } from "@/lib/auth/types";

const DEPARTMENTS: Department[] = ["CSE", "Mechanical", "Civil"];

const DEMO_CREDENTIALS = [
  { department: "CSE" as Department, userId: "cse_examiner5", password: "Cse@2026" },
  { department: "Mechanical" as Department, userId: "mech_examiner5", password: "Mech@2026" },
  { department: "Civil" as Department, userId: "civil_examiner5", password: "Civil@2026" },
];

import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)]">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/home";

  /** Framer Motion variants that honour prefers-reduced-motion. */
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fadeSlide = reducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.2 },
      };

  const [department, setDepartment] = useState<Department | "">("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const errorId = "login-error";

  const isFormValid = department !== "" && userId.trim() !== "" && password !== "";

  // Check if already authenticated → redirect away
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) router.replace(redirectTo);
      })
      .catch(() => {
        /* ignore — not logged in */
      });
  }, [router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department, userId, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Incorrect ID or password for the selected department.");
        setPassword("");
        setIsLoading(false);
        // Return focus to password field
        requestAnimationFrame(() => passwordRef.current?.focus());
        return;
      }

      router.push(redirectTo);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (cred: (typeof DEMO_CREDENTIALS)[number]) => {
    setDepartment(cred.department);
    setUserId(cred.userId);
    setPassword(cred.password);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-sans relative overflow-hidden p-6">
      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-end z-20 pointer-events-auto">
        <ThemeToggle />
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-100 to-transparent blur-[100px] opacity-60" />
        <div className="absolute bottom-[0%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-amber-100 to-transparent blur-[120px] opacity-60" />
      </div>

      <div className="w-full max-w-md z-10 space-y-5">
        {/* Main Login Card */}
        <motion.div
          {...fadeSlide}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col"
        >
          {/* Card Header */}
          <div className="p-8 border-b border-slate-100 bg-slate-50 flex flex-col items-center text-center">
            <Link
              href="/"
              className="w-12 h-12 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center text-white shadow-sm mb-4 hover:scale-105 transition-transform"
            >
              <span className="font-bold text-lg leading-none tracking-tight">BDEA</span>
            </Link>
            <h1 className="text-xl font-bold text-[var(--color-brand-primary)] tracking-tight mb-1">
              Examiner Authentication
            </h1>
            <p className="text-sm text-slate-500">
              Secure login for institutional evaluation staff.
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={reducedMotion ? {} : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reducedMotion ? {} : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    id={errorId}
                    role="alert"
                    className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5"
                  >
                    <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-red-800 font-medium leading-tight">
                      {error}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Department */}
              <div className="space-y-1.5">
                <label
                  htmlFor="department"
                  className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Department
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value as Department | "");
                    setError("");
                  }}
                  required
                  aria-invalid={error ? "true" : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:bg-white transition-all appearance-none"
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* User ID */}
              <div className="space-y-1.5">
                <label
                  htmlFor="userId"
                  className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  User ID
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your User ID"
                  required
                  autoComplete="username"
                  aria-invalid={error ? "true" : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="w-full p-3 pr-11 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full mt-4 py-3.5 bg-[var(--color-brand-primary)] text-white font-semibold rounded-md shadow-md hover:bg-[var(--color-brand-secondary)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>Authenticating...</>
                ) : (
                  <>
                    Sign in <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <Lock size={14} className="text-[var(--color-brand-accent)]" /> End-to-End
                Encrypted Session
              </div>
              <p className="text-center max-w-xs">
                Access is restricted to authorized personnel only. All activities are
                securely logged and audited.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Demo Credentials Card */}
        <motion.div
          {...fadeSlide}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Demo credentials (prototype only)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Use these to log in:</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-2 px-4 text-left">Department</th>
                  <th className="py-2 px-4 text-left">User ID</th>
                  <th className="py-2 px-4 text-left">Password</th>
                  <th className="py-2 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_CREDENTIALS.map((cred) => (
                  <tr
                    key={cred.userId}
                    className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-700">
                      {cred.department}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{cred.userId}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{cred.password}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials(cred)}
                        className="px-3 py-1 bg-[var(--color-brand-primary)] text-white rounded text-[11px] font-semibold hover:bg-[var(--color-brand-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                      >
                        Use
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
