"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [examinerId, setExaminerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      if ((examinerId === "admin" || examinerId === "examiner") && password === "password") {
        router.push("/home");
      } else {
        setError("Invalid Examiner ID or Password. Please use valid credentials.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-sans relative overflow-hidden p-6">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-100 to-transparent blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[0%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-amber-100 to-transparent blur-[120px] opacity-60"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex flex-col items-center text-center">
          <Link href="/" className="w-12 h-12 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center text-white shadow-sm mb-4 hover:scale-105 transition-transform">
            <span className="font-bold text-lg leading-none tracking-tight">BDEA</span>
          </Link>
          <h1 className="text-xl font-bold text-[var(--color-brand-primary)] tracking-tight mb-1">
            Examiner Authentication
          </h1>
          <p className="text-sm text-slate-500">
            Secure login for institutional evaluation staff.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                <span className="text-sm text-red-800 font-medium leading-tight">{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Examiner ID
              </label>
              <input 
                type="text" 
                value={examinerId}
                onChange={(e) => setExaminerId(e.target.value)}
                placeholder="e.g. admin or examiner"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:bg-white transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:bg-white transition-all"
                required
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]" />
                Remember me
              </label>
              <a href="#" className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline">
                Forgot ID?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 py-3.5 bg-[var(--color-brand-primary)] text-white font-semibold rounded-md shadow-md hover:bg-[var(--color-brand-secondary)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>Authenticating...</>
              ) : (
                <>Secure Login <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
             <div className="flex items-center gap-1.5 font-medium text-slate-600">
               <Lock size={14} className="text-[var(--color-brand-accent)]" /> End-to-End Encrypted Session
             </div>
             <p className="text-center max-w-xs">
               Access is restricted to authorized personnel only. All activities are securely logged and audited.
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
