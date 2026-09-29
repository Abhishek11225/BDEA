"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileEdit, 
  ShieldAlert, 
  UploadCloud, 
  CheckSquare, 
  History,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Home,
  Activity,
  ArrowUp,
  Sun,
  Moon
} from "lucide-react";
import type { UserSession } from "@/lib/auth/types";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [session, setSession] = useState<Omit<UserSession, "exp"> | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Evaluation", href: "/evaluation", icon: FileEdit },
    { name: "Moderation", href: "/moderation", icon: ShieldAlert },
    { name: "Scan Intake", href: "/intake", icon: UploadCloud },
    { name: "Rubric Builder", href: "/rubric-builder", icon: CheckSquare },
    { name: "Audit Trail", href: "/audit", icon: History },
  ];

  // Auth check on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then(async (res) => {
        if (!res.ok) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        const data = await res.json();
        setSession(data.session);
        setIsCheckingAuth(false);
      })
      .catch(() => {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setProfileOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* best-effort */
    }
    router.replace("/login");
  };

  const handleScroll = () => {
    if (mainScrollRef.current) {
      if (mainScrollRef.current.scrollTop > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    }
  };

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  // Reset scroll on route change
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [pathname]);

  // Show nothing while checking auth to avoid flash of content
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc]">
        <div className="text-sm text-slate-400 font-medium">Loading...</div>
      </div>
    );
  }

  const userInitials = session?.name
    ? session.name
        .split(" ")
        .filter((_, i, arr) => i === 0 || i === arr.length - 1)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-sans relative transition-colors duration-300 bg-[#f8fafc] text-slate-900`}>
      {/* Top Navbar */}
      <nav className={`border-b shadow-xs z-30 shrink-0 transition-colors duration-300 bg-white border-slate-200/90 text-slate-900`}>
        <div className="px-6 md:px-8 flex items-center justify-between h-16 md:h-18">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3.5 shrink-0">
            <Link href="/home" className="flex items-center gap-3 group transition-transform active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-sm border border-slate-800 group-hover:bg-slate-800 transition-colors">
                <span className="font-extrabold text-sm tracking-tight">BDEA</span>
              </div>
              <div className="flex flex-col">
                <span className={`font-extrabold text-base md:text-lg leading-none tracking-tight transition-colors text-slate-900 group-hover:text-amber-700`}>
                  BDEA
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-normal mt-0.5">
                  Digital Evaluation Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-1.5 mx-4 overflow-x-auto scrollbar-hide py-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-xs border border-slate-800" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon size={17} className={isActive ? "text-amber-400" : "text-slate-400"} />
                  <span className="text-[14px] md:text-[15px]">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Context Line, Theme Toggle & Profile */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">

            {/* Theme Toggle Button */}
            <ThemeToggle />

            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs font-bold text-emerald-800">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Audit Chain Active</span>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border transition-all hover:bg-slate-100 border-transparent hover:border-slate-200`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 text-xs font-bold shadow-xs">
                  {userInitials}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className={`text-xs md:text-sm font-bold leading-tight text-slate-800`}>
                    {session?.name ?? "User"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono leading-tight uppercase tracking-wider">
                    {session ? `Department ${session.department}` : "—"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className={`absolute right-0 top-full mt-2 w-56 border rounded-xl shadow-xl z-50 py-2 text-xs bg-white border-slate-200 text-slate-900`}>
                    <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                      <div className="font-bold text-sm">{session?.name ?? "User"}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">
                        {session ? `Department ${session.department}` : "—"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold w-fit">
                        <Activity size={12} /> Active Session: OK
                      </div>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-rose-600 font-semibold hover:bg-rose-50 transition-colors disabled:opacity-50"
                      >
                        <LogOut size={15} /> {isLoggingOut ? "Logging out..." : "Log Out"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </nav>

      {/* Main Page Scroll Container with Smooth Scroll */}
      <div 
        ref={mainScrollRef} 
        onScroll={handleScroll} 
        className="flex-1 overflow-y-auto scroll-smooth relative"
      >
        {children}
      </div>

      {/* Floating Smooth Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={scrollToTop}
            title="Scroll to Top"
            className="fixed bottom-6 right-6 z-40 p-3 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-full shadow-lg border border-slate-700 transition-transform active:scale-95 flex items-center justify-center"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
