"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FileEdit, 
  ShieldAlert,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Search,
  Sparkles,
  BarChart3,
  CheckSquare,
  AlertCircle
} from "lucide-react";
import Image from "next/image";

export default function AppHome() {
  const [activityFilter, setActivityFilter] = useState<'all' | 'flagged' | 'completed'>('all');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" }
    }
  };

  const activities = [
    { title: "Script #PHYS-84928 marked & verified", time: "10 mins ago", status: "completed", subject: "Physics II", score: "24/25" },
    { title: "Script #MATH-3312 routed to Moderation (Discrepancy)", time: "42 mins ago", status: "flagged", subject: "Calculus", score: "Flagged" },
    { title: "Batch #42 allocated to Dr. Sharma", time: "1.5 hours ago", status: "completed", subject: "Physics II", score: "30 Scripts" },
    { title: "ScanProof Integrity audit passed for Center #04", time: "3 hours ago", status: "completed", subject: "Intake", score: "100%" },
  ];

  const filteredActivities = activities.filter(a => activityFilter === 'all' || a.status === activityFilter);

  return (
    <div className="flex flex-col min-h-[calc(100vh-72px)] bg-[#f8fafc] text-slate-900 font-sans overflow-y-auto">
      
      {/* Institutional Hero Banner - Clean Slate Navy Theme without BG Image */}
      <div className="bg-slate-900 text-white py-10 px-6 md:px-10 border-b border-slate-800 shrink-0">
        <div className="max-w-6xl mx-auto w-full">
           <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 mb-3 w-max">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Session Active • PHYS-2026</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                Greetings, Dr. Sharma
              </motion.h1>
              <motion.p variants={itemVariants} className="text-slate-300 max-w-2xl text-sm md:text-base font-normal leading-relaxed">
                Your BDEA Evaluation Portal is live. You have <span className="text-amber-400 font-bold">42 pending scripts</span> assigned for physical evaluation & AI verification.
              </motion.p>
           </motion.div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-10 flex flex-col">
        
        {/* Metric Quick Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Evaluated Today</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">180 <span className="text-xs text-emerald-600 font-normal">+12%</span></div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pending Scripts</span>
            <div className="text-2xl font-extrabold text-amber-600 font-mono">42 <span className="text-xs text-slate-400 font-normal">Active</span></div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Moderation Queue</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">03 <span className="text-xs text-rose-600 font-normal">Action Req.</span></div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">AI Match Accuracy</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono">98.4%</div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={18} className="text-amber-600" /> Key Portal Modules
          </h2>
          <span className="text-xs text-slate-400 font-medium">Select a module to proceed</span>
        </div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {/* Card 1: Evaluation */}
          <Link href="/evaluation" className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-900 transition-all flex flex-col relative overflow-hidden active:scale-[0.99]">
            <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center mb-4 shadow-xs group-hover:bg-slate-800 transition-colors">
              <FileEdit size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5 tracking-tight group-hover:text-amber-700 transition-colors">
              AI Answer Evaluation
            </h3>
            <p className="text-xs text-slate-500 mb-6 flex-1 leading-relaxed">
              Upload student scripts, run dual OCR (Paddle + TrOCR), retrieve pgvector RAG rubrics, and confirm AI-suggested marks.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:translate-x-1 transition-transform">
              Open Workspace <ArrowRight size={14} className="text-amber-600" />
            </div>
          </Link>

          {/* Card 2: Dashboard */}
          <Link href="/dashboard" className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-900 transition-all flex flex-col relative overflow-hidden active:scale-[0.99]">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <LayoutDashboard size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5 tracking-tight group-hover:text-blue-700 transition-colors">
              Examiner Analytics
            </h3>
            <p className="text-xs text-slate-500 mb-6 flex-1 leading-relaxed">
              Monitor script throughput, grade distributions, examiner agreement metrics, and real-time evaluation logs.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
              View Analytics <ArrowRight size={14} />
            </div>
          </Link>

          {/* Card 3: Moderation */}
          <Link href="/moderation" className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-900 transition-all flex flex-col relative overflow-hidden active:scale-[0.99]">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ShieldAlert size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5 tracking-tight group-hover:text-rose-700 transition-colors">
              Smart Moderation Queue
            </h3>
            <p className="text-xs text-slate-500 mb-6 flex-1 leading-relaxed">
              Review flagged score anomalies, borderline result pass/fail boundaries, and secondary examiner audits.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
              Review Queue <ArrowRight size={14} />
            </div>
          </Link>
        </motion.div>

        {/* Interactive Activity Feed */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 tracking-tight">
              <FileCheck2 size={18} className="text-slate-600" />
              Live Evaluation Feed
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
              <button 
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1 rounded-md transition-all ${activityFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'}`}
              >
                All Activity
              </button>
              <button 
                onClick={() => setActivityFilter('completed')}
                className={`px-3 py-1 rounded-md transition-all ${activityFilter === 'completed' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'hover:text-slate-900'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => setActivityFilter('flagged')}
                className={`px-3 py-1 rounded-md transition-all ${activityFilter === 'flagged' ? 'bg-white text-rose-800 font-bold shadow-xs' : 'hover:text-slate-900'}`}
              >
                Flagged
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredActivities.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    log.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></div>
                  <div>
                    <span className="text-xs md:text-sm font-semibold text-slate-800 block">{log.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{log.subject} • {log.time}</span>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                  log.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}>
                  {log.score}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Institutional CTA Footer */}
      <footer className="mt-auto bg-slate-950 py-12 px-6 border-t border-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-extrabold text-sm mb-4">
            BDEA
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
            Institutional Digital Evaluation System
          </h3>
          <p className="text-slate-400 text-xs md:text-sm mb-6 max-w-lg leading-relaxed">
            Encrypted tamper-evident audit logs with AI copilot scoring for leading universities and examination boards.
          </p>
          <Link href="/evaluation" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs md:text-sm rounded-xl transition-all shadow-md active:scale-[0.98]">
            Access Evaluation Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
