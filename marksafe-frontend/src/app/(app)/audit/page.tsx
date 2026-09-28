"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search,
  Activity,
  Bot,
  User,
  ShieldCheck,
  FileCheck2,
  Lock,
  CheckCircle2,
  Terminal,
  ExternalLink
} from "lucide-react";

const MOCK_AUDIT_LOG = [
  { id: "evt_901", type: "INGEST", actor: "Scan Intaker Engine", time: "10:24:02 AM", desc: "Script barcode SCRIPT-4892-A8X9 ingested with SHA-256 checksum.", hash: "0x8f2a...9c1" },
  { id: "evt_902", type: "QC", actor: "ScanProof Agent v2.0", time: "10:25:15 AM", desc: "Page geometry, CLAHE denoise, and faint ink validation completed.", hash: "0x4b1e...2d8" },
  { id: "evt_903", type: "AI_EVAL", actor: "Rubric Copilot (GPT-4o)", time: "10:27:30 AM", desc: "Q1 evaluated (Score: 5/5). Confidence 95%. Evidence line cited.", hash: "0x1a9c...7f4" },
  { id: "evt_904", type: "EXAMINER", actor: "Dr. Sharma (Senior Examiner)", time: "11:05:12 AM", desc: "Accepted AI Score (5/5) for Question Q1.", hash: "0x9c3d...1a2" },
  { id: "evt_905", type: "AI_EVAL", actor: "Rubric Copilot (GPT-4o)", time: "11:07:44 AM", desc: "Q2 evaluated (Score: 4/5). Confidence 82%. Missing units noted.", hash: "0x5d8f...3e9" },
  { id: "evt_906", type: "EXAMINER", actor: "Dr. Sharma (Senior Examiner)", time: "11:12:05 AM", desc: "Modified Score for Q2 from 4/5 to 3/5. Reason: Missing SI units.", hash: "0x2f1b...8c5" },
  { id: "evt_907", type: "GUARDIAN", actor: "Guardian Safety Agent", time: "11:12:06 AM", desc: "Flagged Q2 score modification (Delta > 1). Auto-routed to Moderation Queue.", hash: "0x7e4a...6b3" },
];

export default function AuditTrail() {
  const [search, setSearch] = useState("SCRIPT-4892-A8X9");
  
  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between p-6 md:p-8">
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white tracking-wider uppercase">
                WORM Security Ledger
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                <ShieldCheck size={13} /> Tamper-Evident Hash Chain
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Immutable Audit Trail</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Every mark, override, and AI inference is cryptographically hash-chained and append-only.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
              placeholder="Search Script ID..." 
            />
          </div>
        </motion.div>

        {/* Audit Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 md:p-8 overflow-hidden flex-1 flex flex-col justify-between">
          
          <div>
            {/* Target Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/80 pb-5 mb-6 gap-3">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm">
                   <FileCheck2 size={20} />
                 </div>
                 <div>
                   <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Audited Target Script</div>
                   <div className="font-mono font-extrabold text-xl text-slate-900">{search}</div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Lock size={13} className="text-emerald-600" /> Hash Chain Verified
                </div>
                <div className="px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-bold text-amber-800 font-mono">
                  State: UNDER MODERATION
                </div>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pb-4">
              {MOCK_AUDIT_LOG.map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-6"
                >
                  <div className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-xs
                    ${event.type === 'INGEST' || event.type === 'QC' ? 'bg-slate-400' : ''}
                    ${event.type === 'AI_EVAL' ? 'bg-blue-600' : ''}
                    ${event.type === 'EXAMINER' ? 'bg-emerald-600' : ''}
                    ${event.type === 'GUARDIAN' ? 'bg-amber-500' : ''}
                  `}></div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl gap-2 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
                          {event.type === 'AI_EVAL' && <Bot size={13} className="text-blue-600" />}
                          {event.type === 'EXAMINER' && <User size={13} className="text-emerald-600" />}
                          {event.type === 'GUARDIAN' && <ShieldCheck size={13} className="text-amber-600" />}
                          {(event.type === 'INGEST' || event.type === 'QC') && <Activity size={13} className="text-slate-600" />}
                          {event.actor}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{event.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-600 shrink-0 self-start">
                      <Lock size={10} className="text-slate-400" /> {event.hash}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span className="flex items-center gap-1.5"><Terminal size={14} className="text-slate-600" /> PostgreSQL Hash Trigger Anchoring Active</span>
            <span className="font-mono text-[11px] text-slate-600 font-bold">WORM Chain Head: 0x8f3a...91e4b2d1c609f874</span>
          </div>
        </div>
      </main>
    </div>
  );
}
