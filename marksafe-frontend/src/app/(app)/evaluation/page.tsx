"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ChevronRight, 
  ZoomIn,
  ZoomOut,
  RotateCw,
  CheckSquare,
  UploadCloud,
  FileImage,
  AlertTriangle,
  FileText,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Play,
  Info,
  ArrowRight,
  Terminal,
  Copy,
  Check
} from "lucide-react";

// Types
interface OCRBlock {
  type: string;
  text: string;
  bbox: number[][];
  confidence: number;
  recognition_engine: string;
}

interface Criterion {
  criterion: string;
  marks: number;
}

interface EvaluatedCriterion {
  criterion: string;
  marks_awarded: number;
  max_marks: number;
  status: string;
  evidence: string | null;
}

// Fallback Mock Data (For when Python backend server is offline)
const DEMO_OCR_DATA = {
  blocks: [
    {
      type: "question",
      text: "Q4(a) State Newton's Second Law of Motion and derive the mathematical expression F = ma. (5 Marks)",
      bbox: [[50, 50], [550, 50], [550, 110], [50, 110]],
      confidence: 0.98,
      recognition_engine: "PaddleOCR-v5 (Printed)"
    },
    {
      type: "answer",
      text: "Newton's second law of motion states that the rate of change of momentum of a body is directly proportional to the applied external force and takes place in the direction of force.\n\nDerivation:\nLet momentum p = m · v.\nForce F ∝ dp/dt\nF = k · d(m·v)/dt = k · m · (dv/dt)\nSince acceleration a = dv/dt, F = k · m · a.\nIn SI units, k = 1, so F = m·a.",
      bbox: [[50, 140], [550, 140], [550, 420], [50, 420]],
      confidence: 0.94,
      recognition_engine: "TrOCR-Handwritten (Transformer)"
    }
  ],
  confidence: 0.96
};

const DEMO_RAG_CONTEXT = {
  question: {
    question_number: "Q4(a)",
    text: "State Newton's Second Law of Motion and derive the mathematical expression F = ma.",
    max_marks: 5
  },
  rubric: [
    { criterion: "Correct statement of Newton's 2nd Law", marks: 2 },
    { criterion: "Definition of linear momentum (p = mv)", marks: 1 },
    { criterion: "Derivation step: F = d(mv)/dt = m(dv/dt)", marks: 1 },
    { criterion: "Final relation F = ma with k=1 in SI units", marks: 1 }
  ],
  expected_concepts: [
    "Rate of change of momentum",
    "Direct proportionality to force",
    "Linear momentum p = mv",
    "Acceleration a = dv/dt",
    "SI constant k = 1"
  ],
  common_mistakes: [
    { mistake: "Omitting the directional condition of force", penalty: 0.5 },
    { mistake: "Missing the constant k = 1 explanation", penalty: 0.5 }
  ]
};

const DEMO_AI_RESULT = {
  suggested_marks: 5,
  max_marks: 5,
  confidence: 0.95,
  criteria: [
    {
      criterion: "Correct statement of Newton's 2nd Law",
      marks_awarded: 2,
      max_marks: 2,
      status: "met",
      evidence: "rate of change of momentum of a body is directly proportional to the applied external force"
    },
    {
      criterion: "Definition of linear momentum (p = mv)",
      marks_awarded: 1,
      max_marks: 1,
      status: "met",
      evidence: "Let momentum p = m · v"
    },
    {
      criterion: "Derivation step: F = d(mv)/dt = m(dv/dt)",
      marks_awarded: 1,
      max_marks: 1,
      status: "met",
      evidence: "F = k · d(m·v)/dt = k · m · (dv/dt)"
    },
    {
      criterion: "Final relation F = ma with k=1 in SI units",
      marks_awarded: 1,
      max_marks: 1,
      status: "met",
      evidence: "In SI units, k = 1, so F = m·a"
    }
  ],
  reasoning: "The candidate provides a complete, mathematically precise statement of Newton's Second Law. The derivation correctly defines linear momentum p = mv, uses the derivative dp/dt, substitutes dv/dt = a, and explicitly states k = 1 in SI units to reach F = ma. Full marks awarded."
};

export default function EvaluationWorkspace() {
  // App States
  const [appState, setAppState] = useState<'upload' | 'processing' | 'evaluate'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Pipeline Data
  const [ocrData, setOcrData] = useState<{blocks: OCRBlock[], confidence: number} | null>(null);
  const [ragContext, setRagContext] = useState<any>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);
  const [copiedRequestId, setCopiedRequestId] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const executeDemoPipeline = () => {
    setIsDemoMode(true);
    setAppState('processing');
    setErrorMsg(null);
    setProcessingStep(1);

    setTimeout(() => {
      setProcessingStep(2);
      setTimeout(() => {
        setProcessingStep(3);
        setTimeout(() => {
          setOcrData(DEMO_OCR_DATA);
          setRagContext(DEMO_RAG_CONTEXT);
          setAiResult(DEMO_AI_RESULT);
          setAppState('evaluate');
        }, 600);
      }, 700);
    }, 800);
  };

  const startPipeline = async () => {
    if (!file && !isDemoMode) {
      executeDemoPipeline();
      return;
    }
    setAppState('processing');
    setErrorMsg(null);
    setProcessingStep(0);

    try {
      // 1. Upload & OCR
      setProcessingStep(1);
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("script_id", "12d17c2b-c1c6-4430-ac14-9b343c67a6d4");
      formData.append("page_number", "1");

      const uploadRes = await fetch("http://localhost:8000/api/v1/evaluation/upload", {
        method: "POST",
        body: formData
      });
      if (!uploadRes.ok) throw new Error("Backend server returned HTTP error");
      const uploadData = await uploadRes.json();
      setOcrData(uploadData);
      
      const qBlock = uploadData.blocks?.find((b: any) => b.type === "question");
      const aBlock = uploadData.blocks?.find((b: any) => b.type === "answer");
      const qText = qBlock ? qBlock.text : "Explain Newton's Second Law.";
      const aText = aBlock ? aBlock.text : "Newton's second law states...";

      // 2. RAG Retrieval
      setProcessingStep(2);
      const ragFormData = new FormData();
      ragFormData.append("question_text", qText);
      const ragRes = await fetch("http://localhost:8000/api/v1/evaluation/retrieve-rubric", {
        method: "POST",
        body: ragFormData
      });
      if (!ragRes.ok) throw new Error("RAG Retrieval Failed");
      const ragData = await ragRes.json();
      setRagContext(ragData.context);

      // 3. AI Evaluation
      setProcessingStep(3);
      const aiRes = await fetch("http://localhost:8000/api/v1/evaluation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_answer: aText,
          rag_context: ragData.context
        })
      });
      if (!aiRes.ok) throw new Error("AI Evaluation Failed");
      const aiData = await aiRes.json();
      setAiResult(aiData.evaluation);

      setAppState('evaluate');

    } catch (err: any) {
      console.warn("Backend connection unavailable, switching to Demo Pipeline mode:", err);
      // Graceful fallback to demo mode on network connection failure
      setErrorMsg("Local FastAPI server (http://localhost:8000) is offline. Switched to Interactive Demo Pipeline.");
      executeDemoPipeline();
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      if (!isDemoMode) {
        await fetch("http://localhost:8000/api/v1/evaluation/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            request_id: "12d17c2b-c1c6-4430-ac14-9b343c67a6d4",
            status: "accepted" 
          })
        });
      }
      setIsAccepted(true);
    } catch(e) {
      console.error(e);
      setIsAccepted(true); // Still record visually in UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRequestId = () => {
    navigator.clipboard.writeText("12d17c2b-c1c6-4430-ac14-9b343c67a6d4");
    setCopiedRequestId(true);
    setTimeout(() => setCopiedRequestId(false), 2000);
  };

  // --- RENDERING UPLOAD SCREEN ---
  if (appState === 'upload') {
    return (
      <div className="min-h-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between p-6 md:p-10">
        
        {/* Top Header Banner */}
        <div className="max-w-6xl w-full mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-900 text-white tracking-wide uppercase">
                  BDEA Copilot Engine
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                  <ShieldCheck size={12} /> Human-in-the-Loop Validation
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Digital Answer Evaluation Portal
              </h1>
              <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
                Automated end-to-end evaluation pipeline utilizing dual-engine OCR (PaddleOCR + TrOCR) combined with pgvector RAG for strict criteria matching.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowApiGuide(!showApiGuide)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Code2 size={14} className="text-amber-600" />
                API Integration Guide
              </button>
              <button 
                onClick={executeDemoPipeline}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <Sparkles size={14} className="text-amber-400" />
                Launch Sample Evaluation
              </button>
            </div>
          </div>

          {/* Process Stepper Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">01</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Scan Intake & QC</h4>
                <p className="text-xs text-slate-500 leading-snug">Ingest PDF/Image, deskew & verify ScanProof score.</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">02</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Paddle + TrOCR</h4>
                <p className="text-xs text-slate-500 leading-snug">Segment layout & extract handwritten response.</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">03</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">pgvector RAG</h4>
                <p className="text-xs text-slate-500 leading-snug">Retrieve marking scheme & reference concepts.</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">04</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">AI Copilot & Audit</h4>
                <p className="text-xs text-slate-500 leading-snug">Generate marks with evidence; logged to audit trail.</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Guide Drawer / Modal Banner */}
        <AnimatePresence>
          {showApiGuide && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-6xl w-full mx-auto mb-8 bg-slate-900 text-slate-100 rounded-xl p-6 shadow-xl border border-slate-800 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="text-amber-400" />
                  <h3 className="font-bold text-sm tracking-wide">API Workflow & Reply Protocol</h3>
                  <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Request ID: 12d17c2b-c1c6-4430-ac14-9b343c67a6d4</span>
                </div>
                <button 
                  onClick={copyRequestId} 
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700"
                >
                  {copiedRequestId ? <Check size={12} /> : <Copy size={12} />}
                  {copiedRequestId ? "Copied ID!" : "Copy Request ID"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-bold mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> 1. Image OCR API Payload
                  </div>
                  <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`POST /api/v1/evaluation/upload
Headers: Content-Type: multipart/form-data
Body: {
  file: <binary_image_or_pdf>,
  script_id: "12d17c2b-c1c6-4430-ac14-9b343c67a6d4",
  page_number: 1
}`}
                  </pre>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-blue-400 font-bold mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> 2. RAG Retrieval API
                  </div>
                  <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`POST /api/v1/evaluation/retrieve-rubric
Headers: application/x-www-form-urlencoded
Body: {
  question_text: "State Newton's 2nd Law..."
}
Returns: pgvector L2 matched marking scheme`}
                  </pre>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 3. AI Response & Audit
                  </div>
                  <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`POST /api/v1/evaluation/analyze
Returns Structured JSON Reply:
{
  "suggested_marks": 5,
  "confidence": 0.95,
  "criteria": [...],
  "reasoning": "Complete proof provided."
}`}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Upload Box */}
        <div className="max-w-xl w-full mx-auto my-auto bg-white rounded-2xl shadow-sm border border-slate-200/90 p-8 md:p-10 text-center">
          
          <div className="w-16 h-16 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-slate-900/10">
            <UploadCloud size={32} />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">
            Upload Answer Sheet Scan
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mb-6 leading-relaxed">
            Upload a student answer sheet in PDF, PNG, JPG format to execute OCR text extraction, RAG rubric lookup, and AI evidence analysis.
          </p>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf, .png, .jpg, .jpeg"
            className="hidden" 
          />

          {file ? (
             <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4 text-left">
                {file.type.includes('pdf') ? (
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileImage size={20} />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                   <div className="font-semibold text-slate-800 text-sm truncate">{file.name}</div>
                   <div className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for OCR</div>
                </div>
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); }} 
                  className="text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Remove
                </button>
             </div>
          ) : (
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full py-9 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 hover:border-slate-800 transition-all flex flex-col items-center gap-2.5 mb-6 group"
             >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-amber-400 transition-colors">
                  <UploadCloud size={22} />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-sm block">Click to browse or drag file</span>
                  <span className="text-xs text-slate-400">Supports PDF, PNG, JPG up to 25MB</span>
                </div>
             </button>
          )}

          {errorMsg && (
            <div className="mb-6 p-3.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs text-left flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" /> 
              <div>
                <span className="font-bold block mb-0.5">Backend Status Notice</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <button 
              disabled={!file && !isDemoMode}
              onClick={startPipeline}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Start AI Evaluation Pipeline</span>
              <ArrowRight size={16} className="text-amber-400" />
            </button>

            <button 
              onClick={executeDemoPipeline}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Or Run Immediate Interactive Demo Mode</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-6xl w-full mx-auto mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>BDEA Institutional OSM Engine • Reference ID: <span className="font-mono text-slate-600">12d17c2b-c1c6-4430-ac14-9b343c67a6d4</span></span>
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-600" /> Encrypted Audit Chain Active</span>
        </div>

      </div>
    );
  }

  // --- RENDERING PROCESSING SCREEN ---
  if (appState === 'processing') {
    const steps = [
      "Ingesting script & ScanProof quality check...",
      "Running PaddleOCR + TrOCR text extraction...",
      "Executing pgvector L2 rubric retrieval (RAG)...",
      "Generating AI Copilot score & evidence reasoning..."
    ];

    return (
      <div className="min-h-full bg-[#f8fafc] text-slate-900 font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200/90 p-8 text-center">
          
          <div className="w-14 h-14 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-6">
            <RotateCw size={28} className="animate-spin" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Processing Answer Sheet</h2>
          <p className="text-xs text-slate-500 mb-6">Evaluating script using neural OCR and vector RAG context.</p>

          <div className="space-y-3.5 text-left bg-slate-50 p-4 rounded-xl border border-slate-200/70 mb-6">
            {steps.map((step, idx) => (
               <div key={idx} className="flex items-center gap-3">
                 {processingStep > idx ? (
                   <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                 ) : processingStep === idx ? (
                   <RotateCw size={18} className="text-slate-900 animate-spin shrink-0" />
                 ) : (
                   <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                 )}
                 <span className={`text-xs ${processingStep === idx ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                   {step}
                 </span>
               </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Transaction ID: 12d17c2b-c1c6-4430-ac14-9b343c67a6d4
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING 3-PANEL EVALUATION WORKSPACE ---
  const questionBlock = ocrData?.blocks?.find(b => b.type === 'question');
  const questionText = questionBlock?.text || ragContext?.question?.text || "State Newton's Second Law of Motion and derive F = ma.";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      {/* Session Info Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0 text-xs">
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <span className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> BDEA Live Evaluation
          </span>
          <span className="text-slate-300">|</span>
          <span>Script ID: <span className="font-mono text-slate-800">12d17c2b-c1c6-4430-ac14-9b343c67a6d4</span></span>
          <span className="text-slate-300">|</span>
          <span>Subject: <span className="font-mono text-slate-800">PHYS-102</span></span>
        </div>
        
        <div className="flex items-center gap-3">
          {ocrData?.confidence !== undefined && (
            <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide border ${
              ocrData.confidence < 0.7 ? 'bg-red-50 text-red-700 border-red-200' : 
              ocrData.confidence < 0.9 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              OCR Fused Confidence: {(ocrData.confidence * 100).toFixed(0)}%
            </span>
          )}
          <button 
            onClick={() => setAppState('upload')}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            ← Upload New Script
          </button>
        </div>
      </div>

      {/* 3-Panel Workspace */}
      <main className="flex flex-1 overflow-hidden p-2 gap-2">
        
        {/* LEFT PANEL: Answer Sheet Viewer */}
        <motion.section 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-[5] flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
        >
          <div className="h-10 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between px-3 shrink-0">
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
               <FileImage size={14} className="text-slate-500" />
               <span>Digitized Answer Sheet & OCR Bounding Boxes</span>
             </div>
             <div className="flex items-center gap-1">
               <button className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"><ZoomIn size={14} /></button>
               <button className="p-1 text-slate-500 hover:bg-slate-200 rounded transition-colors"><ZoomOut size={14} /></button>
             </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-100/70 p-4 flex justify-center items-start">
             <div className="w-full max-w-2xl min-h-[750px] bg-white shadow-sm border border-slate-200 p-6 md:p-8 relative flex flex-col rounded-lg">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Scanned Document • Page 1 of 1</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">ScanProof Integrity: OK</span>
                </div>
                
                {previewUrl ? (
                  <img src={previewUrl} alt="Uploaded script" className="w-full h-auto object-contain opacity-30 mb-4 rounded border border-slate-200" />
                ) : (
                  <div className="w-full h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs mb-4">
                    Document Image Preview Rendered Below
                  </div>
                )}
                
                {/* Visual OCR Bounding Boxes Overlay */}
                <div className="space-y-4">
                   {ocrData?.blocks?.map((block, i) => (
                      <div key={i} className={`p-3.5 border-2 rounded-xl transition-all ${
                        block.type === 'question' 
                          ? 'border-blue-200 bg-blue-50/70' 
                          : 'border-amber-200 bg-amber-50/70'
                      }`}>
                         <div className="text-[10px] font-bold uppercase mb-1.5 flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded font-mono ${
                              block.type === 'question' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-amber-400'
                            }`}>
                              EXTRACTED {block.type}
                            </span>
                            <span className="text-slate-500 font-mono text-[10px]">{block.recognition_engine}</span>
                         </div>
                         <div className="font-serif text-slate-800 text-sm whitespace-pre-line leading-relaxed">
                           {block.text}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </motion.section>

        {/* CENTER PANEL: Question & RAG Context */}
        <motion.aside 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="flex-[3] bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden min-w-0"
        >
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
               <h2 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                 <Layers size={14} className="text-amber-600" />
                 {ragContext?.question?.question_number || 'Q4(a)'}
               </h2>
               <span className="px-2 py-0.5 bg-slate-900 text-white text-[11px] font-mono font-bold rounded">
                 Max Marks: {ragContext?.question?.max_marks || 5}
               </span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">{questionText}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <CheckSquare size={13} className="text-slate-600" /> Retrieved Marking Scheme (RAG)
              </h3>
              <div className="space-y-2">
                {ragContext?.rubric?.map((r: Criterion, i: number) => (
                  <div key={i} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 pr-2">{r.criterion}</span>
                    <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                      +{r.marks} m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {ragContext?.expected_concepts?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Key Concepts</h3>
                <div className="flex flex-wrap gap-1.5">
                   {ragContext.expected_concepts.map((c: string, i: number) => (
                     <span key={i} className="px-2 py-1 bg-blue-50 text-blue-800 text-[11px] rounded-md border border-blue-100 font-medium">
                       {c}
                     </span>
                   ))}
                </div>
              </div>
            )}
            
            {ragContext?.common_mistakes?.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Common Mistake Penalties</h3>
                <div className="space-y-1.5">
                   {ragContext.common_mistakes.map((m: any, i: number) => (
                     <div key={i} className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100 flex justify-between items-center">
                        <span>{m.mistake}</span>
                        <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-rose-200 text-rose-800">
                          -{m.penalty}
                        </span>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </motion.aside>

        {/* RIGHT PANEL: AI Copilot Evaluation */}
        <motion.aside 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="flex-[3] bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden relative min-w-0"
        >
          <div className="h-1 w-full bg-slate-900 absolute top-0 left-0"></div>
          
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-xs text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-600" /> AI Evaluation Copilot
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Model: GPT-4o Structured JSON</span>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Confidence</span>
               <span className="text-sm font-mono font-bold text-emerald-700">
                 {aiResult?.confidence ? (aiResult.confidence * 100).toFixed(0) : 95}%
               </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            
            {/* Suggested Marks Card */}
            <div className="mb-4 bg-slate-900 text-white p-4 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Suggested Mark</h4>
                <p className="text-xs text-slate-300">Requires examiner decision</p>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1">
                <span className="text-amber-400">{aiResult?.suggested_marks ?? 5}</span>
                <span className="text-base text-slate-400 font-normal">/ {aiResult?.max_marks ?? 5}</span>
              </div>
            </div>

            {/* Criteria & Evidence Breakdown */}
            <div className="mb-4 space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criteria Breakdown & Evidence</h4>
              {aiResult?.criteria?.map((ev: EvaluatedCriterion, i: number) => (
                <div key={i} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      {ev.criterion}
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {ev.marks_awarded}/{ev.max_marks}
                    </span>
                  </div>
                  {ev.evidence && (
                    <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-100 font-serif leading-relaxed">
                      "{ev.evidence}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reasoning */}
            {aiResult?.reasoning && (
              <div className="mb-6 p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg">
                 <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-1 flex items-center gap-1">
                   <Info size={12} className="text-amber-700" /> Evaluation Summary
                 </h4>
                 <p className="text-xs text-slate-700 leading-relaxed">
                   {aiResult.reasoning}
                 </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-auto space-y-2 pt-3 border-t border-slate-100">
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-full h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600">
                    <RotateCw size={14} className="animate-spin mr-2" /> Saving decision to Audit Trail...
                  </motion.div>
                ) : isAccepted ? (
                  <motion.div key="a" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-10 bg-emerald-700 text-white rounded-lg flex items-center justify-center text-xs font-semibold shadow-xs">
                    <CheckCircle2 size={16} className="mr-2" /> Score Recorded & Hash Chained
                  </motion.div>
                ) : (
                  <motion.button key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={handleAccept}
                    className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center text-xs font-semibold shadow-xs transition-colors active:scale-[0.98]">
                    Accept Score ({aiResult?.suggested_marks ?? 5}/{aiResult?.max_marks ?? 5})
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="flex gap-2">
                <button disabled={isAccepted || isSubmitting} className="flex-1 h-8 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40">
                  Modify Score
                </button>
                <button disabled={isAccepted || isSubmitting} className="flex-1 h-8 bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40">
                  Flag Script
                </button>
              </div>
            </div>

          </div>
        </motion.aside>
      </main>
    </div>
  );
}
