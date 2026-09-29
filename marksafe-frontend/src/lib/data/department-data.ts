/**
 * Per-department mock data for 5th semester. Uses the SAME data shapes that
 * each page already renders — only the content values change per department.
 */

import type { Department } from "@/lib/auth/types";

// ─── Subjects per department ─────────────────────────────────────────────────

export const DEPARTMENT_SUBJECTS: Record<Department, string[]> = {
  CSE: [
    "Operating Systems",
    "Database Management Systems",
    "Computer Networks",
    "Design and Analysis of Algorithms",
  ],
  Mechanical: [
    "Heat Transfer",
    "Design of Machine Elements",
    "Fluid Machinery",
    "Manufacturing Processes",
  ],
  Civil: [
    "Structural Analysis",
    "Geotechnical Engineering",
    "Environmental Engineering",
    "Transportation Engineering",
  ],
};

// ─── Subject codes ───────────────────────────────────────────────────────────

export const DEPARTMENT_SUBJECT_CODES: Record<Department, string[]> = {
  CSE: ["CS-501", "CS-502", "CS-503", "CS-504"],
  Mechanical: ["ME-501", "ME-502", "ME-503", "ME-504"],
  Civil: ["CE-501", "CE-502", "CE-503", "CE-504"],
};

// ─── Home page data ──────────────────────────────────────────────────────────

export interface HomeData {
  greeting: string;
  sessionLabel: string;
  pendingScripts: number;
  evaluatedToday: number;
  evaluatedChange: string;
  moderationQueue: number;
  aiAccuracy: string;
  activities: {
    title: string;
    time: string;
    status: "completed" | "flagged";
    subject: string;
    score: string;
  }[];
}

export const HOME_DATA: Record<Department, HomeData> = {
  CSE: {
    greeting: "Greetings, Dr. Anil Kumar",
    sessionLabel: "CS-2026",
    pendingScripts: 38,
    evaluatedToday: 156,
    evaluatedChange: "+9%",
    moderationQueue: 4,
    aiAccuracy: "97.2%",
    activities: [
      { title: "Script #CS501-71829 marked & verified", time: "8 mins ago", status: "completed", subject: "Operating Systems", score: "22/25" },
      { title: "Script #CS503-4417 routed to Moderation (Discrepancy)", time: "35 mins ago", status: "flagged", subject: "Computer Networks", score: "Flagged" },
      { title: "Batch #29 allocated to Dr. Anil Kumar", time: "2 hours ago", status: "completed", subject: "DBMS", score: "25 Scripts" },
      { title: "ScanProof Integrity audit passed for Center #02", time: "4 hours ago", status: "completed", subject: "Intake", score: "100%" },
    ],
  },
  Mechanical: {
    greeting: "Greetings, Dr. Rajesh Patel",
    sessionLabel: "ME-2026",
    pendingScripts: 51,
    evaluatedToday: 198,
    evaluatedChange: "+15%",
    moderationQueue: 5,
    aiAccuracy: "96.8%",
    activities: [
      { title: "Script #ME502-92004 marked & verified", time: "12 mins ago", status: "completed", subject: "Design of Machine Elements", score: "20/25" },
      { title: "Script #ME501-3918 routed to Moderation (Borderline)", time: "50 mins ago", status: "flagged", subject: "Heat Transfer", score: "Flagged" },
      { title: "Batch #35 allocated to Dr. Rajesh Patel", time: "1 hour ago", status: "completed", subject: "Fluid Machinery", score: "30 Scripts" },
      { title: "ScanProof Integrity audit passed for Center #06", time: "3 hours ago", status: "completed", subject: "Intake", score: "100%" },
    ],
  },
  Civil: {
    greeting: "Greetings, Dr. Sunita Verma",
    sessionLabel: "CE-2026",
    pendingScripts: 45,
    evaluatedToday: 172,
    evaluatedChange: "+11%",
    moderationQueue: 3,
    aiAccuracy: "98.1%",
    activities: [
      { title: "Script #CE501-60218 marked & verified", time: "5 mins ago", status: "completed", subject: "Structural Analysis", score: "23/25" },
      { title: "Script #CE503-7742 routed to Moderation (Score Spike)", time: "40 mins ago", status: "flagged", subject: "Environmental Engineering", score: "Flagged" },
      { title: "Batch #22 allocated to Dr. Sunita Verma", time: "1.5 hours ago", status: "completed", subject: "Geotechnical Engg.", score: "28 Scripts" },
      { title: "ScanProof Integrity audit passed for Center #03", time: "5 hours ago", status: "completed", subject: "Intake", score: "100%" },
    ],
  },
};

// ─── Dashboard data ──────────────────────────────────────────────────────────

export interface DashboardData {
  centerLabel: string;
  greeting: string;
  examinerLine: string;
  batchLabel: string;
  stats: { label: string; value: string; sub: string; color: string }[];
  chartData: { time: string; completed: number; ai_verified: number }[];
  flags: { id: string; reason: string; impact: string; time: string }[];
  sections: { name: string; progress: number; color: string }[];
  consistencyIndex: string;
  consistencyStatus: string;
  auditHashHead: string;
  completedMarks: number;
}

export const DASHBOARD_DATA: Record<Department, DashboardData> = {
  CSE: {
    centerLabel: "CS-2026 Evaluation Center",
    greeting: "Greetings, Dr. Anil Kumar",
    examinerLine: "Senior Examiner · Evaluation Center #02 · Target Batch:",
    batchLabel: "CS-2026-02",
    stats: [
      { label: "Assigned Scripts", value: "110", sub: "Session total", color: "text-slate-900" },
      { label: "Completed Marks", value: "72", sub: "65% of target", color: "text-emerald-700" },
      { label: "Pending Review", value: "38", sub: "Avg: 1.9m/script", color: "text-amber-700" },
      { label: "Flagged Anomalies", value: "4", sub: "Requires moderation", color: "text-rose-700" },
    ],
    chartData: [
      { time: "08:00", completed: 0, ai_verified: 0 },
      { time: "09:00", completed: 10, ai_verified: 10 },
      { time: "10:00", completed: 28, ai_verified: 27 },
      { time: "11:00", completed: 48, ai_verified: 47 },
      { time: "12:00", completed: 62, ai_verified: 60 },
      { time: "13:00", completed: 72, ai_verified: 70 },
    ],
    flags: [
      { id: "CS501-8421-A3X7", reason: "F1 Guardian: Total mismatch", impact: "Grade Boundary Impact", time: "15m ago" },
      { id: "CS503-2218-B9Y4", reason: "F5 Borderline: 1 mark from pass", impact: "Pass/Fail Boundary", time: "1h ago" },
      { id: "CS504-6610-C2W1", reason: "F4 Consistency: High drift detected", impact: "Calibration Alert", time: "3h ago" },
    ],
    sections: [
      { name: "Section A: Short Theory (OS & DBMS)", progress: 88, color: "bg-emerald-600" },
      { name: "Section B: SQL Queries & Algorithms", progress: 60, color: "bg-amber-500" },
      { name: "Section C: Network Design Problems", progress: 35, color: "bg-blue-600" },
    ],
    consistencyIndex: "97.2%",
    consistencyStatus: "Optimal",
    auditHashHead: "0xa2f1...48c3e9d7b102f561",
    completedMarks: 72,
  },
  Mechanical: {
    centerLabel: "ME-2026 Evaluation Center",
    greeting: "Greetings, Dr. Rajesh Patel",
    examinerLine: "Senior Examiner · Evaluation Center #06 · Target Batch:",
    batchLabel: "ME-2026-06",
    stats: [
      { label: "Assigned Scripts", value: "140", sub: "Session total", color: "text-slate-900" },
      { label: "Completed Marks", value: "89", sub: "64% of target", color: "text-emerald-700" },
      { label: "Pending Review", value: "51", sub: "Avg: 2.4m/script", color: "text-amber-700" },
      { label: "Flagged Anomalies", value: "8", sub: "Requires moderation", color: "text-rose-700" },
    ],
    chartData: [
      { time: "08:00", completed: 0, ai_verified: 0 },
      { time: "09:00", completed: 14, ai_verified: 14 },
      { time: "10:00", completed: 38, ai_verified: 37 },
      { time: "11:00", completed: 62, ai_verified: 60 },
      { time: "12:00", completed: 80, ai_verified: 78 },
      { time: "13:00", completed: 89, ai_verified: 87 },
    ],
    flags: [
      { id: "ME501-7724-D8X2", reason: "F1 Guardian: Unmarked diagram page", impact: "Missing Candidate Marks", time: "8m ago" },
      { id: "ME502-3390-E1Y6", reason: "F2 Anomaly: Score spike (+9 marks)", impact: "Statistical Outlier", time: "45m ago" },
      { id: "ME503-9102-F5W9", reason: "F5 Borderline: 2 marks from pass", impact: "Pass/Fail Boundary", time: "2h ago" },
    ],
    sections: [
      { name: "Section A: Heat Transfer Theory", progress: 92, color: "bg-emerald-600" },
      { name: "Section B: Machine Design Calculations", progress: 58, color: "bg-amber-500" },
      { name: "Section C: Fluid Machinery Numericals", progress: 42, color: "bg-blue-600" },
    ],
    consistencyIndex: "96.5%",
    consistencyStatus: "Optimal",
    auditHashHead: "0x7d3e...92b1f4a8c706d295",
    completedMarks: 89,
  },
  Civil: {
    centerLabel: "CE-2026 Evaluation Center",
    greeting: "Greetings, Dr. Sunita Verma",
    examinerLine: "Senior Examiner · Evaluation Center #03 · Target Batch:",
    batchLabel: "CE-2026-03",
    stats: [
      { label: "Assigned Scripts", value: "125", sub: "Session total", color: "text-slate-900" },
      { label: "Completed Marks", value: "80", sub: "64% of target", color: "text-emerald-700" },
      { label: "Pending Review", value: "45", sub: "Avg: 2.2m/script", color: "text-amber-700" },
      { label: "Flagged Anomalies", value: "5", sub: "Requires moderation", color: "text-rose-700" },
    ],
    chartData: [
      { time: "08:00", completed: 0, ai_verified: 0 },
      { time: "09:00", completed: 11, ai_verified: 11 },
      { time: "10:00", completed: 32, ai_verified: 31 },
      { time: "11:00", completed: 55, ai_verified: 53 },
      { time: "12:00", completed: 72, ai_verified: 70 },
      { time: "13:00", completed: 80, ai_verified: 78 },
    ],
    flags: [
      { id: "CE501-5519-G7X4", reason: "F1 Guardian: Total mismatch", impact: "Grade Boundary Impact", time: "12m ago" },
      { id: "CE502-8831-H2Y8", reason: "F4 Consistency: High drift on Q5", impact: "Calibration Alert", time: "1.5h ago" },
      { id: "CE504-1204-J9W6", reason: "F7 Range: Partial subpart unrecorded", impact: "Completeness Warning", time: "4h ago" },
    ],
    sections: [
      { name: "Section A: Structural Analysis Theory", progress: 85, color: "bg-emerald-600" },
      { name: "Section B: Geotechnical Calculations", progress: 62, color: "bg-amber-500" },
      { name: "Section C: Environmental Design Problems", progress: 38, color: "bg-blue-600" },
    ],
    consistencyIndex: "98.1%",
    consistencyStatus: "Optimal",
    auditHashHead: "0x5c9a...17d4e3b2f908a746",
    completedMarks: 80,
  },
};

// ─── Moderation queue data ───────────────────────────────────────────────────

export interface ModerationItem {
  id: string;
  exam: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  reason: string;
  impact: string;
  status: "Open" | "Under Review";
  assigned: string;
  date: string;
}

export const MODERATION_DATA: Record<Department, ModerationItem[]> = {
  CSE: [
    { id: "CS501-8421-A3X7", exam: "CS-501", severity: "CRITICAL", reason: "F1 Guardian: Total mismatch in OS theory", impact: "Grade Boundary Mismatch", status: "Open", assigned: "Unassigned", date: "15 mins ago" },
    { id: "CS503-2218-B9Y4", exam: "CS-503", severity: "HIGH", reason: "F5 Borderline: 1 mark from pass threshold", impact: "Fail → Pass Shift", status: "Open", assigned: "M-204 (Dr. Kumar)", date: "30 mins ago" },
    { id: "CS502-6619-C1Z3", exam: "CS-502", severity: "MEDIUM", reason: "F4 Consistency: High drift on SQL queries", impact: "Calibration Variance", status: "Under Review", assigned: "M-204 (Dr. Kumar)", date: "1 hour ago" },
    { id: "CS504-4401-D8W5", exam: "CS-504", severity: "CRITICAL", reason: "F1 Guardian: Unchecked supplementary page", impact: "Missing Candidate Marks", status: "Open", assigned: "Unassigned", date: "2 hours ago" },
    { id: "CS501-7712-E5P2", exam: "CS-501", severity: "HIGH", reason: "F2 Anomaly: Score spike (+7 marks vs average)", impact: "Statistical Outlier", status: "Open", assigned: "Unassigned", date: "3 hours ago" },
  ],
  Mechanical: [
    { id: "ME501-7724-D8X2", exam: "ME-501", severity: "CRITICAL", reason: "F1 Guardian: Unmarked diagram page in Heat Transfer", impact: "Missing Candidate Marks", status: "Open", assigned: "Unassigned", date: "8 mins ago" },
    { id: "ME502-3390-E1Y6", exam: "ME-502", severity: "HIGH", reason: "F2 Anomaly: Score spike (+9 marks vs average)", impact: "Statistical Outlier", status: "Open", assigned: "M-308 (Dr. Patel)", date: "45 mins ago" },
    { id: "ME503-9102-F5W9", exam: "ME-503", severity: "HIGH", reason: "F5 Borderline: 2 marks from pass threshold", impact: "Pass/Fail Boundary", status: "Under Review", assigned: "M-308 (Dr. Patel)", date: "2 hours ago" },
    { id: "ME504-1180-G2Z4", exam: "ME-504", severity: "MEDIUM", reason: "F4 Consistency: High drift on Manufacturing", impact: "Calibration Variance", status: "Open", assigned: "Unassigned", date: "3 hours ago" },
    { id: "ME501-5590-H4P7", exam: "ME-501", severity: "CRITICAL", reason: "F3 Copilot: Low confidence OCR on diagram labels", impact: "Verification Needed", status: "Open", assigned: "Unassigned", date: "5 hours ago" },
    { id: "ME502-8829-I7M1", exam: "ME-502", severity: "MEDIUM", reason: "F7 Range: Partial subpart unrecorded", impact: "Completeness Warning", status: "Under Review", assigned: "M-310", date: "6 hours ago" },
  ],
  Civil: [
    { id: "CE501-5519-G7X4", exam: "CE-501", severity: "CRITICAL", reason: "F1 Guardian: Total mismatch in Structural Analysis", impact: "Grade Boundary Mismatch", status: "Open", assigned: "Unassigned", date: "12 mins ago" },
    { id: "CE502-8831-H2Y8", exam: "CE-502", severity: "HIGH", reason: "F4 Consistency: High drift on Geotechnical Q5", impact: "Calibration Alert", status: "Under Review", assigned: "M-112 (Dr. Verma)", date: "1.5 hours ago" },
    { id: "CE503-2204-J1Z9", exam: "CE-503", severity: "MEDIUM", reason: "F3 Copilot: Low confidence OCR line", impact: "Verification Needed", status: "Open", assigned: "Unassigned", date: "3 hours ago" },
    { id: "CE504-1204-J9W6", exam: "CE-504", severity: "HIGH", reason: "F7 Range: Partial subpart unrecorded in Transportation", impact: "Completeness Warning", status: "Open", assigned: "Unassigned", date: "4 hours ago" },
  ],
};

// ─── Intake data ─────────────────────────────────────────────────────────────

export interface IntakeItem {
  barcode: string;
  status: "HELD" | "QC_RUNNING" | "READY";
  issue: string;
  sharpness: number;
  contrast: number;
  skew: string;
  time: string;
}

export interface IntakeStats {
  ingested: string;
  processing: string;
  held: string;
  ready: string;
  centerLabel: string;
}

export const INTAKE_DATA: Record<Department, { items: IntakeItem[]; stats: IntakeStats }> = {
  CSE: {
    stats: { ingested: "1,102", processing: "35", held: "8", ready: "1,059", centerLabel: "CENTER-02-CS" },
    items: [
      { barcode: "CS501-70281", status: "HELD", issue: "Page 3: Blank or obscured ink", sharpness: 80, contrast: 88, skew: "0.3°", time: "12 mins ago" },
      { barcode: "CS502-70282", status: "QC_RUNNING", issue: "Running Barcode QC Check", sharpness: 92, contrast: 95, skew: "0.0°", time: "3 mins ago" },
      { barcode: "CS503-70283", status: "HELD", issue: "Sequence Error: Missing Page 6", sharpness: 94, contrast: 91, skew: "0.1°", time: "1 hour ago" },
      { barcode: "CS501-70284", status: "READY", issue: "ScanProof Verified", sharpness: 97, contrast: 98, skew: "0.0°", time: "2 hours ago" },
      { barcode: "CS504-70285", status: "READY", issue: "ScanProof Verified", sharpness: 95, contrast: 97, skew: "0.0°", time: "3 hours ago" },
      { barcode: "CS502-70286", status: "READY", issue: "ScanProof Verified", sharpness: 96, contrast: 99, skew: "0.1°", time: "4 hours ago" },
    ],
  },
  Mechanical: {
    stats: { ingested: "1,380", processing: "48", held: "15", ready: "1,317", centerLabel: "CENTER-06-ME" },
    items: [
      { barcode: "ME501-80401", status: "HELD", issue: "Page 5: Diagram smudge detected", sharpness: 78, contrast: 85, skew: "0.4°", time: "8 mins ago" },
      { barcode: "ME502-80402", status: "QC_RUNNING", issue: "Running Barcode QC Check", sharpness: 90, contrast: 93, skew: "0.0°", time: "1 min ago" },
      { barcode: "ME503-80403", status: "HELD", issue: "Sequence Error: Missing Page 4", sharpness: 93, contrast: 90, skew: "0.2°", time: "45 mins ago" },
      { barcode: "ME501-80404", status: "READY", issue: "ScanProof Verified", sharpness: 96, contrast: 97, skew: "0.0°", time: "1.5 hours ago" },
      { barcode: "ME504-80405", status: "READY", issue: "ScanProof Verified", sharpness: 94, contrast: 98, skew: "0.0°", time: "2 hours ago" },
      { barcode: "ME502-80406", status: "READY", issue: "ScanProof Verified", sharpness: 98, contrast: 99, skew: "0.1°", time: "3 hours ago" },
      { barcode: "ME503-80407", status: "READY", issue: "ScanProof Verified", sharpness: 91, contrast: 96, skew: "0.0°", time: "4 hours ago" },
    ],
  },
  Civil: {
    stats: { ingested: "1,190", processing: "40", held: "10", ready: "1,140", centerLabel: "CENTER-03-CE" },
    items: [
      { barcode: "CE501-90501", status: "HELD", issue: "Page 2: Faint pencil marks", sharpness: 82, contrast: 87, skew: "0.2°", time: "6 mins ago" },
      { barcode: "CE502-90502", status: "QC_RUNNING", issue: "Running Barcode QC Check", sharpness: 91, contrast: 94, skew: "0.0°", time: "2 mins ago" },
      { barcode: "CE503-90503", status: "READY", issue: "ScanProof Verified", sharpness: 96, contrast: 98, skew: "0.0°", time: "1 hour ago" },
      { barcode: "CE504-90504", status: "READY", issue: "ScanProof Verified", sharpness: 95, contrast: 97, skew: "0.0°", time: "2 hours ago" },
      { barcode: "CE501-90505", status: "READY", issue: "ScanProof Verified", sharpness: 97, contrast: 99, skew: "0.0°", time: "3 hours ago" },
    ],
  },
};

// ─── Audit data ──────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  type: "INGEST" | "QC" | "AI_EVAL" | "EXAMINER" | "GUARDIAN";
  actor: string;
  time: string;
  desc: string;
  hash: string;
}

export interface AuditData {
  defaultScriptId: string;
  events: AuditEvent[];
}

export const AUDIT_DATA: Record<Department, AuditData> = {
  CSE: {
    defaultScriptId: "CS501-8421-A3X7",
    events: [
      { id: "evt_c01", type: "INGEST", actor: "Scan Intaker Engine", time: "09:14:02 AM", desc: "Script barcode CS501-8421-A3X7 ingested with SHA-256 checksum.", hash: "0xa2f1...4c8" },
      { id: "evt_c02", type: "QC", actor: "ScanProof Agent v2.0", time: "09:15:18 AM", desc: "Page geometry, CLAHE denoise, and faint ink validation completed.", hash: "0x3b9e...1d2" },
      { id: "evt_c03", type: "AI_EVAL", actor: "Rubric Copilot (GPT-4o)", time: "09:17:44 AM", desc: "Q1 (OS Process Scheduling) evaluated (Score: 4/5). Confidence 91%.", hash: "0x8c4a...7f6" },
      { id: "evt_c04", type: "EXAMINER", actor: "Dr. Anil Kumar (Senior Examiner)", time: "10:02:10 AM", desc: "Accepted AI Score (4/5) for Q1 Process Scheduling.", hash: "0x1d7f...3a9" },
      { id: "evt_c05", type: "AI_EVAL", actor: "Rubric Copilot (GPT-4o)", time: "10:04:30 AM", desc: "Q2 (SQL Normalization) evaluated (Score: 3/5). Missing 3NF derivation.", hash: "0x5e2b...8c1" },
      { id: "evt_c06", type: "EXAMINER", actor: "Dr. Anil Kumar (Senior Examiner)", time: "10:08:55 AM", desc: "Modified Score for Q2 from 3/5 to 4/5. Reason: Implicit 3NF shown.", hash: "0x9a4d...2e7" },
      { id: "evt_c07", type: "GUARDIAN", actor: "Guardian Safety Agent", time: "10:08:56 AM", desc: "Flagged Q2 score modification (Delta > 1). Auto-routed to Moderation.", hash: "0x6f1c...5b4" },
    ],
  },
  Mechanical: {
    defaultScriptId: "ME501-7724-D8X2",
    events: [
      { id: "evt_m01", type: "INGEST", actor: "Scan Intaker Engine", time: "08:44:12 AM", desc: "Script barcode ME501-7724-D8X2 ingested with SHA-256 checksum.", hash: "0x7d3e...2f5" },
      { id: "evt_m02", type: "QC", actor: "ScanProof Agent v2.0", time: "08:45:30 AM", desc: "Diagram page detected. CLAHE enhancement applied to figure labels.", hash: "0x4a1b...9c8" },
      { id: "evt_m03", type: "AI_EVAL", actor: "Rubric Copilot (GPT-4o)", time: "08:48:02 AM", desc: "Q1 (Fourier Heat Conduction) evaluated (Score: 5/5). Confidence 94%.", hash: "0x2c9f...6a3" },
      { id: "evt_m04", type: "EXAMINER", actor: "Dr. Rajesh Patel (Senior Examiner)", time: "09:22:18 AM", desc: "Accepted AI Score (5/5) for Q1 Fourier Law derivation.", hash: "0xe8b4...1d7" },
      { id: "evt_m05", type: "AI_EVAL", actor: "Rubric Copilot (GPT-4o)", time: "09:24:45 AM", desc: "Q3 (Pelton Wheel Efficiency) evaluated (Score: 3/5). Missing velocity triangle.", hash: "0x3f7a...4e2" },
      { id: "evt_m06", type: "GUARDIAN", actor: "Guardian Safety Agent", time: "09:24:46 AM", desc: "Flagged Q3: Diagram page potentially unmarked. Auto-routed to Moderation.", hash: "0xb1d6...8c9" },
    ],
  },
  Civil: {
    defaultScriptId: "CE501-5519-G7X4",
    events: [
      { id: "evt_v01", type: "INGEST", actor: "Scan Intaker Engine", time: "09:30:05 AM", desc: "Script barcode CE501-5519-G7X4 ingested with SHA-256 checksum.", hash: "0x5c9a...7f2" },
      { id: "evt_v02", type: "QC", actor: "ScanProof Agent v2.0", time: "09:31:22 AM", desc: "Page geometry and structural diagram validation completed.", hash: "0x8e4b...3a1" },
      { id: "evt_v03", type: "AI_EVAL", actor: "Rubric Copilot (GPT-4o)", time: "09:33:48 AM", desc: "Q1 (Beam Deflection Analysis) evaluated (Score: 5/5). Confidence 96%.", hash: "0x1a7c...9d4" },
      { id: "evt_v04", type: "EXAMINER", actor: "Dr. Sunita Verma (Senior Examiner)", time: "10:15:30 AM", desc: "Accepted AI Score (5/5) for Q1 Structural Analysis.", hash: "0x4d2e...6b8" },
      { id: "evt_v05", type: "AI_EVAL", actor: "Rubric Copilot (GPT-4o)", time: "10:17:55 AM", desc: "Q2 (Soil Bearing Capacity) evaluated (Score: 4/5). Terzaghi constants approx.", hash: "0x7f9a...2c5" },
      { id: "evt_v06", type: "EXAMINER", actor: "Dr. Sunita Verma (Senior Examiner)", time: "10:22:10 AM", desc: "Modified Score for Q2 from 4/5 to 3/5. Reason: Incorrect Nc value used.", hash: "0xb3e1...8f7" },
      { id: "evt_v07", type: "GUARDIAN", actor: "Guardian Safety Agent", time: "10:22:11 AM", desc: "Flagged Q2 score modification (Delta > 1). Auto-routed to Moderation.", hash: "0xd6c4...1a3" },
    ],
  },
};

// ─── Rubric builder data ─────────────────────────────────────────────────────

export interface RubricData {
  examLabel: string;
  questionText: string;
  criteria: { id: string; description: string; marks: number }[];
}

export const RUBRIC_DATA: Record<Department, RubricData> = {
  CSE: {
    examLabel: "CS-2026",
    questionText: "Explain the concept of process scheduling in Operating Systems. Compare FCFS, SJF, and Round Robin algorithms with examples.",
    criteria: [
      { id: "1", description: "Correct definition of process scheduling and its purpose", marks: 2 },
      { id: "2", description: "FCFS algorithm explanation with example", marks: 1 },
      { id: "3", description: "SJF algorithm explanation with example", marks: 1 },
      { id: "4", description: "Round Robin with time quantum explanation", marks: 1 },
    ],
  },
  Mechanical: {
    examLabel: "ME-2026",
    questionText: "Derive Fourier's Law of Heat Conduction and explain steady-state one-dimensional conduction through a composite wall.",
    criteria: [
      { id: "1", description: "Statement of Fourier's Law with direction convention", marks: 2 },
      { id: "2", description: "Derivation of temperature distribution in plane wall", marks: 1 },
      { id: "3", description: "Thermal resistance analogy for composite wall", marks: 1 },
      { id: "4", description: "Overall heat transfer coefficient calculation", marks: 1 },
    ],
  },
  Civil: {
    examLabel: "CE-2026",
    questionText: "Analyze a simply supported beam with a uniformly distributed load. Derive expressions for maximum deflection and bending moment.",
    criteria: [
      { id: "1", description: "Free body diagram with correct reaction forces", marks: 2 },
      { id: "2", description: "Bending moment equation derivation", marks: 1 },
      { id: "3", description: "Maximum deflection formula (wL⁴/384EI)", marks: 1 },
      { id: "4", description: "Boundary conditions and integration constants", marks: 1 },
    ],
  },
};

// ─── Evaluation page subject context ─────────────────────────────────────────

export interface EvaluationContext {
  subjectCode: string;
  subjectName: string;
}

export const EVALUATION_CONTEXT: Record<Department, EvaluationContext> = {
  CSE: { subjectCode: "CS-501", subjectName: "Operating Systems" },
  Mechanical: { subjectCode: "ME-501", subjectName: "Heat Transfer" },
  Civil: { subjectCode: "CE-501", subjectName: "Structural Analysis" },
};
