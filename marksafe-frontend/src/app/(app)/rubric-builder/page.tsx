"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, 
  Plus, 
  Trash2, 
  Sparkles,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  CheckCircle2
} from "lucide-react";

interface RubricCriterion {
  id: string;
  description: string;
  marks: number;
}

export default function RubricBuilder() {
  const [questionText, setQuestionText] = useState("State Newton's Second Law of Motion and derive F = ma.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  const [criteria, setCriteria] = useState<RubricCriterion[]>([
    { id: "1", description: "Correct statement of Newton's 2nd Law", marks: 2 },
    { id: "2", description: "Definition of linear momentum (p = mv)", marks: 1 },
    { id: "3", description: "Derivation step: F = d(mv)/dt = m(dv/dt)", marks: 1 },
    { id: "4", description: "Final relation F = ma with k=1 in SI units", marks: 1 }
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCriteria([
        { id: "1", description: "Correct statement of Newton's 2nd Law (Force & Momentum proportionality)", marks: 2 },
        { id: "2", description: "Definition of linear momentum p = mv", marks: 1 },
        { id: "3", description: "Mathematical derivation step: F = d(mv)/dt = m(dv/dt)", marks: 1 },
        { id: "4", description: "Final relation F = ma declaring constant k = 1 in SI units", marks: 1 },
      ]);
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1200);
  };

  const totalMarks = criteria.reduce((sum, c) => sum + c.marks, 0);

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between p-6 md:p-8">
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white tracking-wider uppercase">
                AI Rubric Authoring
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                <ShieldCheck size={13} /> Strict Schema Enforcement
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Rubric Builder</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Define strict, JSON-schema evaluation rules and ground-truth evidence criteria for AI Copilot.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-slate-700">
              Exam: <span className="font-bold text-slate-900">PHYS-2026</span>
            </div>
            <button className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-[0.98]">
              <Save size={14} className="text-amber-400" /> Save Draft
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          
          {/* Left Panel: Question Context */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="md:col-span-1 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 font-extrabold text-xs text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} className="text-amber-600" /> Question Context
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Question</label>
                <textarea 
                  className="w-full h-36 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Paste examination question..."
                />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Maximum Marks</label>
                 <input type="number" defaultValue={5} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold" />
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-70 active:scale-[0.98]"
                >
                  <Sparkles size={14} className="text-amber-400 animate-pulse" />
                  {isGenerating ? "Analyzing Question Structure..." : "Draft Rubric with AI Copilot"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Panel: Criteria List */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex justify-between items-center">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Evaluation Criteria Rules
              </span>
              <span className="text-[11px] font-mono font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                Total Criteria Marks: <span className="text-amber-400">{totalMarks}</span> / 5
              </span>
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {criteria.map((crit, index) => (
                    <motion.div 
                      layout key={crit.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                      className="flex items-start gap-3 p-2 bg-slate-50 border border-slate-200/80 rounded-xl group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <input 
                        type="text" value={crit.description}
                        onChange={(e) => { const n = [...criteria]; n[index].description = e.target.value; setCriteria(n); }}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <div className="w-20 shrink-0 relative">
                        <input 
                          type="number" value={crit.marks}
                          onChange={(e) => { const n = [...criteria]; n[index].marks = Number(e.target.value); setCriteria(n); }}
                          className="w-full p-2 pr-6 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">m</span>
                      </div>
                      <button 
                        onClick={() => setCriteria(criteria.filter(c => c.id !== crit.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-0.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  onClick={() => setCriteria([...criteria, { id: Math.random().toString(), description: "", marks: 1 }])}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-amber-700 transition-colors py-2 px-3 bg-slate-100 rounded-xl"
                >
                  <Plus size={14} className="text-amber-600" /> Add Criterion Item
                </button>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-3">
                <AlertCircle size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold mb-0.5">Server Validation & Evidence Citation Enabled</p>
                  <p className="text-emerald-800">The AI model must cite exact line quotes from candidate OCR text for every criterion met. Criteria without evidence will automatically route to human examiners.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200/80 bg-slate-50/80 flex justify-end gap-3">
              <button className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors">
                Save Draft
              </button>
              <button className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-[0.98]">
                <Save size={14} /> Submit Rubric for Approval
              </button>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
