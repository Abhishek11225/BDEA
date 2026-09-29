"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ShieldCheck, 
  CheckCircle2, 
  UserCircle,
  FileCheck2,
  Lock,
  ArrowRight,
  Award,
  Building2,
  GraduationCap,
  BookOpen,
  Globe,
  Landmark
} from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  // Fictional institutional partners
  const institutionalPartners = [
    { name: "National Testing Agency", short: "NTA", icon: Landmark },
    { name: "Central Board of Examinations", short: "CBE", icon: Building2 },
    { name: "Institute of Academic Standards", short: "IAS", icon: Award },
    { name: "Digital Education Council", short: "DEC", icon: GraduationCap },
    { name: "Academic Quality Assurance", short: "AQA", icon: BookOpen },
    { name: "National Evaluation Network", short: "NEN", icon: Globe },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] font-sans">
      
      {/* Header */}
      <header className="px-8 py-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center text-white shrink-0 shadow-sm">
            <span className="font-bold text-sm leading-none tracking-tight">BDEA</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-[var(--color-brand-primary)] leading-tight">BDEA</h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] hidden sm:block leading-tight">Bharat Digital Examination Authority</p>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-500">
            <Link href="#features" className="hover:text-slate-800 transition-colors">Features</Link>
            <Link href="#trust" className="hover:text-slate-800 transition-colors">Security</Link>
          </div>
          <ThemeToggle />
          <Link href="/login" className="px-5 py-2.5 bg-[var(--color-brand-primary)] text-white text-sm font-medium rounded-md shadow-sm hover:bg-[var(--color-brand-secondary)] transition-colors">
            Examiner Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Subtle background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-25 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-slate-200 to-transparent blur-[120px]"></div>
          <div className="absolute top-[50%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-amber-100 to-transparent blur-[100px]"></div>
        </div>

        {/* Hero */}
        <section className="pt-20 pb-16 px-6">
          <motion.div 
            className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left: Copy */}
            <div className="flex-1 flex flex-col items-start text-left z-10">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
                <div className="w-2 h-2 rounded-full bg-[var(--color-status-green)] animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">AI-Assisted • Human Verified</span>
              </motion.div>
              
              <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[var(--color-brand-primary)] mb-6 leading-[1.1]">
                AI-Powered <br/>Digital Evaluation
              </motion.h2>
              
              <motion.p variants={itemVariants} className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
                Modernizing On-Screen Marking with Human-Verified AI Assistance for accurate, secure, and audited academic assessment across Indian universities and examination boards.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 mb-12 w-full sm:w-auto">
                <Link href="/login" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[var(--color-brand-primary)] text-white font-semibold rounded-md shadow-md hover:bg-[var(--color-brand-secondary)] transition-all active:scale-[0.98]">
                  Enter Evaluation Portal <ArrowRight size={18} />
                </Link>
                <Link href="#features" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-700 border border-slate-300 font-medium rounded-md shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]">
                  Explore Platform
                </Link>
              </motion.div>
              
              {/* Trust Indicators */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2"><FileCheck2 size={16} className="text-[var(--color-brand-accent)]" /> Rubric-Based Evaluation</div>
                <div className="flex items-center gap-2"><UserCircle size={16} className="text-[var(--color-brand-accent)]" /> Human-in-the-Loop</div>
                <div className="flex items-center gap-2"><Lock size={16} className="text-[var(--color-brand-accent)]" /> Secure Audit Trail</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[var(--color-brand-accent)]" /> Built for Institutional Use</div>
              </motion.div>
            </div>

            {/* Right: Abstract UI Mockup */}
            <motion.div 
              variants={itemVariants}
              className="flex-1 w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Mock Header */}
              <div className="h-9 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="ml-4 h-4 w-40 bg-slate-200 rounded text-[9px] text-slate-500 font-mono px-2 flex items-center">BDEA-SECURE-SESSION</div>
              </div>
              
              {/* Mock Content */}
              <div className="flex flex-1 h-[380px]">
                {/* Mock Answer Sheet */}
                <div className="flex-1 border-r border-slate-200 p-5 bg-[var(--color-paper)] relative">
                  <div className="mb-3">
                    <h4 className="font-bold text-slate-800 text-sm">QUESTION 04</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Explain Newton&apos;s Second Law. [5 marks]</p>
                  </div>
                  
                  <div className="p-3 bg-white border border-slate-200 shadow-sm min-h-[180px] font-serif text-slate-700 italic text-sm relative">
                    <div className="absolute top-1.5 right-1.5 text-[8px] text-slate-400 font-mono border border-slate-200 px-1 rounded">SCAN: OK</div>
                    <div className="bg-amber-50 border border-amber-100 rounded px-1 -mx-0.5 mt-3">
                      Newton&apos;s Second law states that the force acting on an object is equal to the mass of the object multiplied by its acceleration.
                    </div>
                    <div className="mt-2 bg-amber-50 border border-amber-100 rounded px-1 -mx-0.5 w-max font-medium">
                      F = ma
                    </div>
                    <div className="mt-2 bg-amber-50 border border-amber-100 rounded px-1 -mx-0.5 inline-block">
                      This means heavier objects require more force.
                    </div>
                  </div>
                </div>
                
                {/* Mock AI Panel */}
                <div className="w-[240px] bg-white p-4 flex flex-col text-sm shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-[var(--color-brand-primary)] text-[10px] uppercase tracking-wider">AI Evaluation</span>
                    <span className="font-mono text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200 font-bold">92%</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Evidence</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-[var(--color-status-green)]" />
                        <span className="text-slate-700 text-xs">Definition</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-[var(--color-status-green)]" />
                        <span className="text-slate-700 text-xs">Formula (F=ma)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-[var(--color-status-green)]" />
                        <span className="text-slate-700 text-xs">Explanation</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 border border-slate-300 rounded-full flex items-center justify-center">
                           <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        </div>
                        <span className="text-slate-400 text-xs">Example incomplete</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto border-t border-slate-100 pt-3">
                    <div className="text-[10px] text-slate-400 mb-0.5 font-bold uppercase tracking-wider">Suggested Score</div>
                    <div className="text-2xl font-light text-[var(--color-brand-primary)] mb-3">4 <span className="text-sm text-slate-400">/ 5</span></div>
                    <div className="flex flex-col gap-1.5">
                      <div className="w-full bg-[var(--color-brand-primary)] text-white py-1.5 rounded text-[11px] font-medium text-center">Accept 4/5</div>
                      <div className="flex gap-1.5">
                        <div className="flex-1 bg-white border border-slate-200 text-slate-600 py-1.5 rounded text-[11px] font-medium text-center">Modify</div>
                        <div className="flex-1 bg-white border border-slate-200 text-slate-600 py-1.5 rounded text-[11px] font-medium text-center">Flag</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Bar */}
        <section className="bg-[var(--color-brand-primary)] py-10 px-6">
          <motion.div 
            className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <div className="text-xl md:text-3xl font-bold text-white tracking-wide uppercase">
                Tested By Bansal Group Of Institute
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h3 className="text-3xl font-bold text-[var(--color-brand-primary)] tracking-tight mb-3">Built for Indian Academic Excellence</h3>
              <p className="text-slate-500 max-w-2xl mx-auto">Every feature designed for the scale, security, and compliance demands of national examination systems.</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
            >
              {[
                { icon: FileCheck2, title: "Rubric-Based AI Evaluation", desc: "Strict schema-validated rubrics ensure AI never invents criteria. Every mark maps to cited evidence from the student's answer." },
                { icon: ShieldCheck, title: "Guardian Safety Layer", desc: "Real-time anomaly detection catches unmarked pages, score mismatches, and borderline cases before they reach final results." },
                { icon: Lock, title: "Immutable Audit Trail", desc: "Hash-chained MarkEvents create a tamper-proof ledger. Every action—AI inference, human edit, moderation—is permanently recorded." },
                { icon: UserCircle, title: "Human-in-the-Loop", desc: "AI suggests, the examiner decides. No score is finalized without explicit human approval. Ambiguity always falls back to a human." },
                { icon: Award, title: "Smart Moderation Queue", desc: "Risk-ranked queue surfaces borderline scripts, AI/human disagreements, and grade-boundary cases to senior moderators first." },
                { icon: GraduationCap, title: "Offline-First PWA", desc: "Evaluation centers can work without internet. All data syncs securely when connectivity resumes via the transactional outbox." },
              ].map((feature, i) => (
                <motion.div 
                  key={feature.title} 
                  variants={itemVariants}
                  className="p-6 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                  <feature.icon size={28} className="text-[var(--color-brand-accent)] mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-[var(--color-brand-primary)] mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Security / Trust Section */}
        <section id="trust" className="py-20 px-6 bg-[var(--color-paper)] border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h3 className="text-3xl font-bold text-[var(--color-brand-primary)] tracking-tight mb-3">Enterprise-Grade Security</h3>
              <p className="text-slate-500 max-w-xl mx-auto">Every layer of the platform is designed for the security and compliance standards expected by government examination bodies.</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {[
                { title: "End-to-End Encryption", desc: "All data in transit and at rest is encrypted. Answer sheet images, marks, and audit logs are protected with AES-256." },
                { title: "Tamper-Proof Audit Ledger", desc: "Every mark event is hash-chained. Any modification to historical records is cryptographically detectable." },
                { title: "Role-Based Access Control", desc: "Examiners, moderators, and administrators have strictly scoped permissions. No role can exceed its mandate." },
                { title: "Offline Data Integrity", desc: "When evaluation centers operate offline, all changes are queued in a transactional outbox and validated upon sync." },
              ].map((item) => (
                <motion.div key={item.title} variants={itemVariants} className="flex gap-4 p-5 bg-white border border-slate-200 rounded-lg">
                  <Lock size={22} className="text-[var(--color-brand-primary)] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-[var(--color-brand-primary)] mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-slate-200"
            >
              {[
                "Data Encryption (AES-256)",
                "Role-Based Access Control",
                "Audit Logging Enabled",
                "Secure Examination Environment",
                "Built for Institutional Use",
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <ShieldCheck size={14} className="text-[var(--color-status-green)]" />
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-[var(--color-brand-primary)]">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h3 className="text-3xl font-bold text-white mb-4">Ready to modernize your evaluation process?</h3>
            <p className="text-slate-300 mb-8 max-w-lg mx-auto">Join leading institutions using BDEA for secure, AI-assisted digital evaluation.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-brand-accent)] text-white font-semibold rounded-md shadow-lg hover:bg-amber-600 transition-all active:scale-[0.98]">
              Access Evaluation Portal <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-brand-secondary)] text-slate-300 py-14 px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="font-bold text-lg text-white mb-1 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-accent)] flex items-center justify-center text-white text-[9px] font-bold">B</div>
              BDEA
            </div>
            <div className="text-sm font-medium text-slate-400 mb-4">Bharat Digital Examination Authority</div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              AI-assisted evaluation infrastructure for secure academic assessment across Indian universities and examination boards.
            </p>
            <ul className="text-xs font-mono space-y-2 text-slate-500">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-green)]"></div> Secure Environment</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-green)]"></div> Audit Enabled</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-green)]"></div> Human Verified</li>
            </ul>
          </div>
          
          <div className="flex gap-16 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Evaluation Portal</Link></li>
                <li><Link href="/moderation" className="hover:text-white transition-colors">Moderation Queue</Link></li>
                <li><Link href="/intake" className="hover:text-white transition-colors">Scan Intake</Link></li>
                <li><Link href="/audit" className="hover:text-white transition-colors">Audit Logs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Institutional</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Security Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Compliance</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Data Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <span>&copy; 2026 Bharat Digital Examination Authority. All rights reserved.</span>
          <span className="mt-2 md:mt-0">AI-Assisted · Human Verified · Encrypted & Audited</span>
        </div>
      </footer>
    </div>
  );
}
