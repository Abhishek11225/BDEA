"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  UploadCloud, 
  FileWarning, 
  RefreshCcw,
  Search,
  ScanLine,
  ShieldCheck,
  CheckCircle2,
  FileText
} from "lucide-react";

const MOCK_INTAKE = [
  { barcode: "84928310", status: "HELD", issue: "Page 4: Blank or obscured ink", sharpness: 82, contrast: 90, skew: "0.2°", time: "10 mins ago" },
  { barcode: "84928311", status: "QC_RUNNING", issue: "Running Barcode QC Check", sharpness: 91, contrast: 94, skew: "0.0°", time: "2 mins ago" },
  { barcode: "84928312", status: "HELD", issue: "Sequence Error: Missing Page 8", sharpness: 95, contrast: 92, skew: "0.1°", time: "1 hour ago" },
  { barcode: "84928313", status: "READY", issue: "ScanProof Verified", sharpness: 96, contrast: 98, skew: "0.0°", time: "2 hours ago" },
  { barcode: "84928314", status: "READY", issue: "ScanProof Verified", sharpness: 94, contrast: 97, skew: "0.0°", time: "3 hours ago" },
  { barcode: "84928315", status: "READY", issue: "ScanProof Verified", sharpness: 98, contrast: 99, skew: "0.0°", time: "4 hours ago" },
  { barcode: "84928316", status: "READY", issue: "ScanProof Verified", sharpness: 92, contrast: 95, skew: "0.1°", time: "5 hours ago" }
];

export default function IntakeDashboard() {
  const [search, setSearch] = useState("");

  const filteredIntake = MOCK_INTAKE.filter(item => item.barcode.includes(search) || item.issue.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between p-6 md:p-8">
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white tracking-wider uppercase">
                Scan Intake & QC Engine
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                <ShieldCheck size={13} /> ScanProof Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Scan Intake & Quality Control</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Monitor high-speed batch uploads, deskewing, barcode verification, and rescan holds.</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
              <RefreshCcw size={14} /> Sync Status
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]">
              <UploadCloud size={14} className="text-amber-400" /> Upload Scan Batch
            </button>
          </div>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Ingested Today", value: "1,245", sub: "100% Barcode Matched", color: "text-slate-900" },
            { label: "Processing (QC)", value: "42", sub: "ScanProof Deskewing", color: "text-blue-700", spinner: true },
            { label: "Held for Rescan", value: "12", sub: "Requires Rescan Operator", color: "text-rose-700" },
            { label: "Ready for Evaluation", value: "1,191", sub: "Passed Hard-Cap Rules", color: "text-emerald-700" },
          ].map((card) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">{card.label}</div>
              <div>
                <div className={`text-2xl font-extrabold font-mono tracking-tight ${card.color} flex items-center gap-2`}>
                  {card.spinner && <RefreshCcw size={18} className="animate-spin opacity-50" />}
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">{card.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scan Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex-1 flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-center bg-slate-50/80 gap-3">
              <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={15} className="text-slate-600" /> Recent Ingested Batches
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search barcode or issue..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-widest font-extrabold bg-slate-50/40">
                    <th className="py-3 px-4">Barcode ID</th>
                    <th className="py-3 px-4">QC Status</th>
                    <th className="py-3 px-4">ScanProof Diagnostic Alert</th>
                    <th className="py-3 px-4 text-center">Sharpness</th>
                    <th className="py-3 px-4 text-center">Contrast</th>
                    <th className="py-3 px-4">Uploaded</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredIntake.map((item, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.barcode}</td>
                      <td className="py-3.5 px-4">
                        {item.status === "HELD" && <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase">Held for Rescan</span>}
                        {item.status === "QC_RUNNING" && <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase">QC Running</span>}
                        {item.status === "READY" && <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase">Scan Proof OK</span>}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {item.status === "HELD" ? (
                          <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                            <FileWarning size={14} /> {item.issue}
                          </div>
                        ) : <span className="text-slate-500">{item.issue}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">{item.sharpness > 0 ? `${item.sharpness}%` : '-'}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">{item.contrast > 0 ? `${item.contrast}%` : '-'}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{item.time}</td>
                      <td className="py-3.5 px-4 text-right">
                        {item.status === "HELD" ? (
                          <button className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] transition-colors active:scale-[0.98] inline-flex items-center gap-1">
                            <ScanLine size={12} className="text-amber-400" /> Request Rescan
                          </button>
                        ) : <span className="text-slate-300 font-mono">-</span>}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>Automated ScanProof 2.0 Ingest Protocol</span>
            <span className="font-mono text-[11px]">Center ID: CENTER-04-PHYS</span>
          </div>
        </div>

      </main>
    </div>
  );
}
