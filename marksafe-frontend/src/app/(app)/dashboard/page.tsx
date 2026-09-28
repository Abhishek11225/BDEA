"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Flag,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  Award
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { time: '08:00', completed: 0, ai_verified: 0 },
  { time: '09:00', completed: 12, ai_verified: 12 },
  { time: '10:00', completed: 35, ai_verified: 34 },
  { time: '11:00', completed: 58, ai_verified: 56 },
  { time: '12:00', completed: 78, ai_verified: 76 },
  { time: '13:00', completed: 94, ai_verified: 92 },
];

export default function ExaminerDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between p-6 md:p-8">
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-6">
        
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white tracking-wider uppercase">
                PHYS-2026 Evaluation Center
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                <ShieldCheck size={13} /> Active Session
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Greetings, Dr. Sharma
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Senior Examiner • Evaluation Center #04 • Target Batch: <span className="font-mono text-slate-800 font-bold">PHYS-2026-04</span>
            </p>
          </div>

          <Link 
            href="/evaluation" 
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 text-xs md:text-sm shrink-0 active:scale-[0.98]"
          >
            <span>Resume Evaluation</span>
            <ArrowRight size={16} className="text-amber-400" />
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: "Assigned Scripts", value: "120", sub: "Session total", color: "text-slate-900", icon: FileText },
            { label: "Completed Marks", value: "78", sub: "65% of target", color: "text-emerald-700", icon: CheckCircle2 },
            { label: "Pending Review", value: "42", sub: "Avg: 2.1m/script", color: "text-amber-700", icon: Clock },
            { label: "Flagged Anomalies", value: "6", sub: "Requires moderation", color: "text-rose-700", icon: Flag },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between group hover:border-slate-900 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <stat.icon size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <div>
                <div className={`text-3xl font-extrabold font-mono tracking-tight ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">{stat.sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Middle Section: Chart & Recent Flags */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <TrendingUp size={16} className="text-amber-600" /> Hourly Evaluation Throughput
                </h3>
                <span className="text-xs text-slate-400">Comparing manual marks vs AI verified outputs</span>
              </div>
              <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">Today</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#0f172a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Flags Panel */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 flex flex-col justify-between">
             <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                   <Flag size={15} className="text-rose-600" /> Active Flagged Cases
                 </h3>
                 <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-100">
                   6 Pending
                 </span>
               </div>

               <div className="space-y-3">
                 {[
                   { id: "SCRIPT-4892-A8X9", reason: "F1 Guardian: Total mismatch", impact: "Grade Boundary Impact", time: "10m ago" },
                   { id: "SCRIPT-3312-C7Y2", reason: "F5 Borderline: 1 mark from pass", impact: "Pass/Fail Boundary", time: "1h ago" },
                   { id: "SCRIPT-9012-D4W3", reason: "F4 Consistency: High drift detected", impact: "Calibration Alert", time: "2h ago" },
                 ].map((flag) => (
                   <div key={flag.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
                     <div className="flex justify-between items-center">
                       <span className="font-mono font-bold text-slate-900">{flag.id}</span>
                       <span className="text-[10px] text-slate-400 font-mono">{flag.time}</span>
                     </div>
                     <div className="font-medium text-rose-700">{flag.reason}</div>
                     <div className="text-[10px] text-slate-500">{flag.impact}</div>
                   </div>
                 ))}
               </div>
             </div>

             <Link 
               href="/moderation" 
               className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-900 hover:text-amber-700 flex items-center justify-center gap-1.5 transition-colors"
             >
               <span>Open Moderation Queue</span>
               <ArrowRight size={13} />
             </Link>
          </div>
        </motion.div>

        {/* Lower Section: Section Progress & Consistency Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Section Progress */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Layers size={14} className="text-slate-600" /> Question Breakdown
            </h4>
            <div className="space-y-3">
              {[
                { name: "Section A: Short Theory", progress: 90, color: "bg-emerald-600" },
                { name: "Section B: Mathematical Derivations", progress: 65, color: "bg-amber-500" },
                { name: "Section C: Numerical Problems", progress: 40, color: "bg-blue-600" },
              ].map((s, i) => (
                <div key={i} className="text-xs space-y-1">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>{s.name}</span>
                    <span className="font-mono font-bold">{s.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${s.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examiner Consistency Metric */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-600" /> Examiner Consistency Index
            </h4>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-extrabold font-mono text-emerald-700">97.8%</div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-100">Optimal</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculated against standard calibration scripts. Your marking variation is well within board tolerances.
            </p>
          </div>

          {/* Audit Trail Chain Status */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-slate-900" /> WORM Audit Security
            </h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Hash-Chain Head</span>
              <span className="text-[10px] font-mono text-slate-400">SHA-256</span>
            </div>
            <div className="p-2 bg-slate-900 text-amber-400 rounded-lg text-[10px] font-mono truncate mb-2">
              0x8f3a...91e4b2d1c609f874
            </div>
            <div className="text-[11px] text-slate-400 font-medium">All 78 completed marks cryptographically anchored.</div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
