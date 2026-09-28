"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Search,
  MoreHorizontal,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen
} from "lucide-react";

const MOCK_QUEUE = [
  { id: "SCRIPT-4892-A8X9", exam: "CHEM-12", severity: "CRITICAL", reason: "F1 Guardian: Total mismatch", impact: "Grade Boundary Mismatch", status: "Open", assigned: "Unassigned", date: "10 mins ago" },
  { id: "SCRIPT-1932-B7Y1", exam: "PHYS-10", severity: "HIGH", reason: "F5 Borderline: 1 mark from pass threshold", impact: "Fail → Pass Shift", status: "Open", assigned: "M-102 (Dr. Sharma)", date: "25 mins ago" },
  { id: "SCRIPT-5512-C9Z2", exam: "CHEM-12", severity: "MEDIUM", reason: "F4 Consistency: High drift on Question 3", impact: "Calibration Variance", status: "Under Review", assigned: "M-102 (Dr. Sharma)", date: "45 mins ago" },
  { id: "SCRIPT-8821-D4W3", exam: "MATH-10", severity: "CRITICAL", reason: "F1 Guardian: Unchecked supplementary page 6", impact: "Missing Candidate Marks", status: "Open", assigned: "Unassigned", date: "1 hour ago" },
  { id: "SCRIPT-6714-E2P5", exam: "PHYS-10", severity: "HIGH", reason: "F2 Anomaly: Score spike (+8 marks vs average)", impact: "Statistical Outlier", status: "Open", assigned: "Unassigned", date: "2 hours ago" },
  { id: "SCRIPT-9012-F3M8", exam: "PHYS-12", severity: "MEDIUM", reason: "F7 Range: Partial subpart unrecorded", impact: "Completeness Warning", status: "Under Review", assigned: "M-105", date: "3 hours ago" },
  { id: "SCRIPT-3104-K8L1", exam: "CHEM-10", severity: "HIGH", reason: "F3 Copilot: Low confidence OCR line", impact: "Verification Needed", status: "Open", assigned: "Unassigned", date: "4 hours ago" }
];

export default function ModerationQueue() {
  const [search, setSearch] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  const filteredQueue = MOCK_QUEUE.filter(item => item.id.toLowerCase().includes(search.toLowerCase()) || item.reason.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between p-6 md:p-8">
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white tracking-wider uppercase">
                Quality Layer
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                <Zap size={13} /> 2-Person Rule Enforced
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Smart Moderation Queue</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Review, resolve, and audit high-risk score anomalies prior to final result lock.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Search script or reason..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 w-56 md:w-64" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
              <Filter size={14} /> Filter Queue
            </button>
          </div>
        </motion.div>

        {/* Severity Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Critical Priority", value: 2, sub: "Action Required", color: "text-rose-700", icon: AlertOctagon, bg: "bg-rose-50/60", border: "border-rose-200/80" },
            { label: "High Risk", value: 3, sub: "Pass/Fail Threshold", color: "text-amber-700", icon: AlertTriangle, bg: "bg-amber-50/60", border: "border-amber-200/80" },
            { label: "Medium Drift", value: 2, sub: "Calibration Alerts", color: "text-blue-700", icon: Info, bg: "bg-blue-50/60", border: "border-blue-200/80" },
            { label: "Resolved Today", value: 14, sub: "100% Chain Logged", color: "text-emerald-700", icon: CheckCircle2, bg: "bg-emerald-50/60", border: "border-emerald-200/80" },
          ].map((card) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${card.bg} p-4 rounded-2xl border ${card.border} flex flex-col justify-between`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <card.icon size={18} className={card.color} />
              </div>
              <div>
                <div className={`text-2xl font-extrabold font-mono tracking-tight ${card.color}`}>{card.value}</div>
                <div className="text-[11px] text-slate-500 font-medium">{card.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Queue Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex-1 flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-widest font-extrabold">
                  <th className="py-3.5 px-4">Script ID</th>
                  <th className="py-3.5 px-4">Exam</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Reason & Impact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Moderator</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody className="text-xs" variants={containerVariants} initial="hidden" animate="visible">
                {filteredQueue.map((item) => (
                  <motion.tr key={item.id} variants={rowVariants} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{item.exam}</td>
                    <td className="py-3.5 px-4">
                      {item.severity === "CRITICAL" && <span className="bg-rose-50 text-rose-800 border border-rose-200 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase inline-flex items-center gap-1"><AlertOctagon size={11}/> Critical</span>}
                      {item.severity === "HIGH" && <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase inline-flex items-center gap-1"><AlertTriangle size={11}/> High</span>}
                      {item.severity === "MEDIUM" && <span className="bg-blue-50 text-blue-800 border border-blue-200 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase inline-flex items-center gap-1"><Info size={11}/> Medium</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.reason}</div>
                      <div className="text-slate-400 text-[10px] font-mono mt-0.5">{item.impact}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${item.status === 'Open' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{item.assigned}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition-colors active:scale-[0.98]">
                        Review Case
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          {/* Table Footer Policy Notice */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-slate-600" /> All Critical alert overrides require a secondary head examiner sign-off.</span>
            <span className="font-mono text-[11px] text-slate-400">Policy Ref: MARKSAFE-D04-MOD</span>
          </div>
        </div>

      </main>
    </div>
  );
}
