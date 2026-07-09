'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Play,
  Check,
  Shield,
  Clock,
  Target,
  BarChart3,
  Lock,
  Moon,
  Sun,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ImportModal from '../components/ImportModal';
import LeadsTable from '../components/LeadsTable';

type LeadRow = Record<string, unknown>;
type ImportStats = {
  total: number;
  imported: number;
  skipped: number;
  processingTime: string;
} | null;

const CONNECTORS = [
  { name: 'Google Ads', icon: '🔵', connected: false },
  { name: 'Meta Ads', icon: '🟦', connected: false },
  { name: 'LinkedIn', icon: '🔗', connected: false },
  { name: 'WhatsApp', icon: '🟢', connected: false },
  { name: 'Webhook', icon: '⚡', connected: false },
  { name: 'CSV Import', icon: '📄', connected: true },
];

export default function Home() {
  const [view, setView] = useState<'LANDING' | 'APP'>('LANDING');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [stats, setStats] = useState<ImportStats>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fireToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      {/* ── LANDING VIEW ────────────────────────────────────── */}
      {view === 'LANDING' && (
        <div className="landing-grid" style={{
          paddingTop: 80,
          minHeight: '100vh', background: theme === 'dark' ? '#09090b' : '#ffffff', color: theme === 'dark' ? '#fff' : '#0f172a',
          display: 'flex', flexDirection: 'column', overflowX: 'hidden', position: 'relative'
        }}>
          {/* Glowing center background */}
          {theme === 'dark' && <div className="landing-hero-glow" />}

          {/* Floating Background Aesthetics */}
          <div className="glowing-orb-cyan" style={{ position: 'fixed', top: '15%', left: '10%', width: 500, height: 500, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.6, pointerEvents: 'none', zIndex: 1 }} />
          <div className="glowing-orb-blue" style={{ position: 'fixed', top: '45%', right: '5%', width: 600, height: 600, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.6, pointerEvents: 'none', zIndex: 1 }} />
          <div className="glowing-orb-purple" style={{ position: 'fixed', bottom: '10%', left: '30%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.5, pointerEvents: 'none', zIndex: 1 }} />

          {/* Floating Tech Shapes */}
          <div className="floating-shape-1" style={{ position: 'absolute', top: '18%', right: '15%', opacity: 0.08, pointerEvents: 'none', zIndex: 1 }}>
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 6" />
            </svg>
          </div>
          <div className="floating-shape-2" style={{ position: 'absolute', bottom: '35%', left: '8%', opacity: 0.1, pointerEvents: 'none', zIndex: 1 }}>
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="80" height="80" rx="15" stroke="var(--accent)" strokeWidth="2" strokeDasharray="10 5" />
            </svg>
          </div>

          {/* Floating Navigation */}
          <nav style={{
            position: 'fixed', width: '90%', maxWidth: '1200px', left: '50%', transform: 'translateX(-50%)',
            top: 24, borderRadius: "50px",
            zIndex: 100,
            transition: 'all 0.3s ease',
            background: theme === 'dark' ? 'rgba(20, 20, 24, 0.25)' : 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
            border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              maxWidth: 1400,
              margin: '0 auto',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setActiveSection('home')}>
                <img src="/logo.png" alt="GrowEasy Logo" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                <div>
                  <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'block', lineHeight: 1.1 }}>GrowEasy</span>
                  <span style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, display: 'block', letterSpacing: '0.05em' }}>AI CSV Importer</span>
                </div>
              </div>

              {/* Navigation links */}
              <div className="responsive-nav-links">
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('features'); }} style={{ color: theme === 'dark' ? (activeSection === 'features' ? '#fff' : '#94a3b8') : (activeSection === 'features' ? '#0f172a' : '#475569'), textDecoration: 'none', fontWeight: activeSection === 'features' ? 700 : 500 }} className="hover:text-white transition">Features</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('how-it-works'); }} style={{ color: theme === 'dark' ? (activeSection === 'how-it-works' ? '#fff' : '#94a3b8') : (activeSection === 'how-it-works' ? '#0f172a' : '#475569'), textDecoration: 'none', fontWeight: activeSection === 'how-it-works' ? 700 : 500 }} className="hover:text-white transition">How It Works</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('benefits'); }} style={{ color: theme === 'dark' ? (activeSection === 'benefits' ? '#fff' : '#94a3b8') : (activeSection === 'benefits' ? '#0f172a' : '#475569'), textDecoration: 'none', fontWeight: activeSection === 'benefits' ? 700 : 500 }} className="hover:text-white transition">Benefits</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('pricing'); }} style={{ color: theme === 'dark' ? (activeSection === 'pricing' ? '#fff' : '#94a3b8') : (activeSection === 'pricing' ? '#0f172a' : '#475569'), textDecoration: 'none', fontWeight: activeSection === 'pricing' ? 700 : 500 }} className="hover:text-white transition">Pricing</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('docs'); }} style={{ color: theme === 'dark' ? (activeSection === 'docs' ? '#fff' : '#94a3b8') : (activeSection === 'docs' ? '#0f172a' : '#475569'), textDecoration: 'none', fontWeight: activeSection === 'docs' ? 700 : 500 }} className="hover:text-white transition">Docs</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('about'); }} style={{ color: theme === 'dark' ? (activeSection === 'about' ? '#fff' : '#94a3b8') : (activeSection === 'about' ? '#0f172a' : '#475569'), textDecoration: 'none', fontWeight: activeSection === 'about' ? 700 : 500 }} className="hover:text-white transition">About</a>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {theme === 'dark' ? (
                  <Sun size={20} style={{ color: '#94a3b8', cursor: 'pointer' }} className="hover:text-white transition" onClick={() => setTheme('light')} />
                ) : (
                  <Moon size={20} style={{ color: '#475569', cursor: 'pointer' }} className="hover:text-black transition" onClick={() => setTheme('dark')} />
                )}
                <button
                  onClick={() => setView('APP')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme === 'dark' ? '#94a3b8' : '#475569',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                  className="hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setView('APP')}
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)'
                  }}
                >
                  Get Started Free <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </nav>

          {/* Hero Section Split Layout */}
          {activeSection === 'home' && (
            <header className="responsive-hero-grid" style={{
              maxWidth: 1400,
              marginTop: '-50px',
              padding: '90px 24px',
              position: 'relative',
              zIndex: 10
            }}>

              {/* Left Column: Heading and copy */}
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  padding: '6px 14px',
                  borderRadius: 99,
                  fontSize: 15,
                  color: '#0ea5e9',
                  fontWeight: 600,
                  marginBottom: 14,
                  letterSpacing: '0.02em'
                }}>
                  <Sparkles size={15} /> AI-Powered • Smart • Reliable
                </div>

                <h1 style={{
                  fontSize: 'clamp(42px, 6vw, 72px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  marginBottom: 20,
                  color: theme === 'dark' ? '#fff' : '#0f172a'
                }}>
                  Import CSV.<br />
                  AI Maps.<br />
                  <span className="animated-gradient-text">Your CRM, Instantly.</span>
                </h1>

                <p style={{
                  fontSize: '18px',
                  color: theme === 'dark' ? '#94a3b8' : '#475569',
                  lineHeight: 1.6,
                  marginBottom: 36,
                  fontWeight: 400,
                  maxWidth: 640
                }}>
                  Automate your data import process with AI-powered header mapping, validation, and CRM-ready outputs. No manual work. No errors.
                </p>

                <div style={{ display: 'flex', gap: 16, marginBottom: 36 }}>
                  <button
                    className="btn button-glow"
                    style={{ padding: '14px 28px', fontSize: 16, borderRadius: 8, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setView('APP')}
                  >
                    Start Importing Now <ArrowRight size={18} />
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1',
                      padding: '14px 28px',
                      fontSize: 16,
                      borderRadius: 8,
                      color: theme === 'dark' ? '#fff' : '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background 0.2s, border-color 0.2s'
                    }}
                    onClick={() => setView('APP')}
                  >
                    <Play size={16} fill={theme === 'dark' ? '#fff' : '#0f172a'} /> View Live Demo
                  </button>
                </div>

                {/* Tag Checklist */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 48, fontSize: 16, color: theme === 'dark' ? '#94a3b8' : '#475569', fontWeight: 500, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={18} style={{ color: '#10b981' }} /> AI Header Mapping
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={18} style={{ color: '#10b981' }} /> Smart Validation
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={18} style={{ color: '#10b981' }} /> CRM Ready Data
                  </div>
                </div>

                {/* Trusted by companies */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                    TRUSTED BY TEAMS THAT VALUE DATA
                  </p>
                  <div style={{ display: 'flex', gap: 28, alignItems: 'center', opacity: 0.6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>HubSpőt</span>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>pipedrive</span>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>ZOHO</span>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>salesforce</span>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>freshworks</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Fidelity 3D AI Illustration */}
              <div className="floating-shape-1" style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
              }}>
                <div className="glass-card-premium" style={{
                  borderRadius: 24,
                  padding: 12,
                  background: theme === 'dark' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.8)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(14, 165, 233, 0.15)',
                  boxShadow: theme === 'dark' ? '0 32px 80px rgba(0,0,0,0.6)' : '0 20px 48px rgba(14, 165, 233, 0.08)',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  display: 'inline-block'
                }}>
                  <img
                    src="/ai_data_flow_illustration.png"
                    alt="AI Data Flow Automation"
                    style={{
                      borderRadius: 16,
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                      maxWidth: 480,
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>
            </header>
          )}

                              {/* Features Grid Section (Compact Bento Grid) */}
          {activeSection === 'features' && (
            <section id="features" style={{ background: theme === 'dark' ? '#09090b' : '#ffffff', color: theme === 'dark' ? '#fff' : '#0f172a', padding: '90px 24px', zIndex: 10 }} className="relative">
              <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 50 }}>
                  <div style={{
                    display: 'inline-block', background: 'rgba(14, 165, 233, 0.08)', color: '#0ea5e9', fontWeight: 700,
                    fontSize: 13, padding: '3px 10px', borderRadius: 99, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    + FEATURES
                  </div>
                  <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                    Everything you need for <span style={{ color: 'var(--accent)' }}>flawless CSV imports</span>
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  {/* Large Feature Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="apple-glass" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', padding: 24, borderRadius: 20, gap: 24, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ flex: 1, zIndex: 2 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>☁️</div>
                      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Smart CSV Upload</h3>
                      <p style={{ fontSize: 15, color: theme === 'dark' ? '#94a3b8' : '#475569', lineHeight: 1.6 }}>Drag and drop any messy CSV file. Our intelligent engine instantly processes it, detecting headers and data types with lightning speed.</p>
                    </div>
                  </motion.div>

                  {/* Medium Cards */}
                  <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="apple-glass" style={{ padding: 24, borderRadius: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>🧠</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>AI Header Mapping</h3>
                    <p style={{ fontSize: 14, color: theme === 'dark' ? '#94a3b8' : '#475569', lineHeight: 1.5 }}>Our AI models automatically match your raw CSV columns to standard CRM fields with 99% accuracy.</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="apple-glass" style={{ padding: 24, borderRadius: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>🛡️</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Smart Validation</h3>
                    <p style={{ fontSize: 14, color: theme === 'dark' ? '#94a3b8' : '#475569', lineHeight: 1.5 }}>Automatically fix formatting errors, remove duplicates, and ensure data is perfectly standardized.</p>
                  </motion.div>

                  {/* Wide Bottom Card */}
                  <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="apple-glass" style={{ gridColumn: '1 / -1', padding: 24, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>CRM Ready Output 📊</h3>
                      <p style={{ fontSize: 14, color: theme === 'dark' ? '#94a3b8' : '#475569' }}>Download perfectly structured data or push it directly via Webhook.</p>
                    </div>
                    <button onClick={() => setView('APP')} className="btn button-glow" style={{ padding: '10px 20px', fontSize: 14, borderRadius: 8, color: '#fff', fontWeight: 600 }}>See it in action</button>
                  </motion.div>
                </div>
              </div>
            </section>
          )}

          {/* Why Teams Choose GrowEasy (Hover Interactive Grid) */}
          {activeSection === 'benefits' && (
            <section id="benefits" style={{ background: theme === 'dark' ? '#0c0c0e' : '#f8fafc', color: theme === 'dark' ? '#fff' : '#0f172a', padding: '90px 24px', borderTop: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e2e8f0', zIndex: 10 }} className="relative">
              <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', width: '100%' }}>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, marginBottom: 50, letterSpacing: '-0.5px' }}>
                  Why teams choose <span style={{ color: 'var(--accent)' }}>GrowEasy</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                  {[
                    { icon: <Clock size={24} color="#0ea5e9" />, title: 'Save Hours', desc: 'Reduce manual work by 90% and import data in seconds.', shadow: 'rgba(14, 165, 233, 0.2)' },
                    { icon: <Target size={24} color="#10b981" />, title: 'Increase Accuracy', desc: 'AI-powered mapping minimizes errors and ensures data quality.', shadow: 'rgba(16, 185, 129, 0.2)' },
                    { icon: <Shield size={24} color="#f59e0b" />, title: 'Reduce Errors', desc: 'Smart validation catches issues before they reach your CRM.', shadow: 'rgba(245, 158, 11, 0.2)' },
                    { icon: <BarChart3 size={24} color="#8b5cf6" />, title: 'Boost Productivity', desc: 'Your team can focus on what matters, not on data cleanup.', shadow: 'rgba(139, 92, 246, 0.2)' },
                    { icon: <Lock size={24} color="#ec4899" />, title: 'Secure & Private', desc: 'Your data is processed securely and never shared.', shadow: 'rgba(236, 72, 153, 0.2)' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -6, boxShadow: `0 16px 32px ${item.shadow}` }}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.3 }}
                      className="apple-glass" 
                      style={{ textAlign: 'left', padding: 24, borderRadius: 20, cursor: 'default' }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        {item.icon}
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>{item.title}</h3>
                      <p style={{ fontSize: 14, color: theme === 'dark' ? '#94a3b8' : '#64748b', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* How It Works (Vertical Timeline Animation) */}
          {activeSection === 'how-it-works' && (
            <section id="how-it-works" style={{ background: theme === 'dark' ? '#09090b' : '#ffffff', color: theme === 'dark' ? '#fff' : '#0f172a', padding: '90px 24px', zIndex: 10 }} className="relative">
              <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
                
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                  <div style={{
                    display: 'inline-block', background: 'rgba(14, 165, 233, 0.08)', color: '#0ea5e9', fontWeight: 700,
                    fontSize: 13, padding: '3px 10px', borderRadius: 99, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    + HOW IT WORKS
                  </div>
                  <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                    From CSV to CRM in <span style={{ color: 'var(--accent)' }}>4 steps</span>
                  </h2>
                </div>

                <div style={{ position: 'relative', paddingLeft: 40, borderLeft: `2px dashed ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, margin: '0 12px' }}>
                  {/* The animated arrow moving down the timeline */}
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: '100%' }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: 0, left: -2, width: 2, background: 'var(--accent)', zIndex: 1 }} 
                  />

                  {[
                    { num: '1', title: 'Upload CSV', desc: 'Drag and drop your exported lead lists.', icon: '☁️' },
                    { num: '2', title: 'AI Maps Headers', desc: 'GrowEasy understands your custom columns automatically.', icon: '🧠' },
                    { num: '3', title: 'Validate Data', desc: 'We clean, standardize, and format everything perfectly.', icon: '🛡️' },
                    { num: '4', title: 'Get CRM Ready', desc: 'Import directly to HubSpot, Salesforce, etc.', icon: '📊' }
                  ].map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      style={{ position: 'relative', marginBottom: idx === 3 ? 0 : 40 }}
                    >
                      {/* Timeline Node Dot */}
                      <motion.div 
                        initial={{ scale: 0, backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff' }}
                        whileInView={{ scale: 1, backgroundColor: '#0ea5e9' }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        style={{ position: 'absolute', top: 12, left: -53, width: 24, height: 24, borderRadius: '50%', border: '4px solid var(--accent)', zIndex: 2 }}
                      />
                      <div className="apple-glass" style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: 24, borderRadius: 20 }}>
                        <div style={{ fontSize: 32 }}>{step.icon}</div>
                        <div>
                          <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Step {step.num}: {step.title}</h3>
                          <p style={{ fontSize: 15, color: theme === 'dark' ? '#94a3b8' : '#64748b', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Section 6: Ready to Get Started (Space Black) */}
          <section style={{ background: theme === 'dark' ? '#09090b' : '#ffffff', padding: '90px 24px', position: 'relative', zIndex: 10, borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0' }} className="relative text-center">
            <div style={{
              display: 'inline-block',
              background: 'rgba(14, 165, 233, 0.1)',
              color: '#0ea5e9',
              fontWeight: 700,
              fontSize: 13,
              padding: '3px 10px',
              borderRadius: 99,
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              READY TO GET STARTED?
            </div>
            <h2 style={{ fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: 12, letterSpacing: '-0.5px' }}>
              Transform your data import process today
            </h2>
            <p style={{ fontSize: 18, color: theme === 'dark' ? '#94a3b8' : '#475569', marginBottom: 36, maxWidth: 640, margin: '0 auto 36px' }}>
              Join thousands of businesses that trust GrowEasy for AI-powered data imports.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button onClick={() => setView('APP')} className="btn button-glow" style={{ padding: '14px 28px', fontSize: 16, borderRadius: 8, color: '#fff' }}>
                Get Started Free ➔
              </button>
              <button onClick={() => setView('APP')} className="btn" style={{
                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1',
                padding: '14px 28px',
                fontSize: 16,
                borderRadius: 8,
                color: theme === 'dark' ? '#fff' : '#0f172a'
              }}>
                Talk to Sales
              </button>
            </div>
          </section>

          {/* Footer (Space Black) */}
          <footer style={{ background: theme === 'dark' ? '#09090b' : '#f8fafc', borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', padding: '60px 24px', position: 'relative', zIndex: 10 }}>
            <div className="responsive-footer-grid" style={{ maxWidth: 1400, margin: '0 auto', width: '100%', textAlign: 'left', marginBottom: 48 }}>
              {/* Logo block */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 72, height: 72,
                    background: 'linear-gradient(135deg, #000000ff 0%, #000000ff 100%)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 18,
                    color: '#fff'
                  }}>
                    <img src="logo.png" alt="" />
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 18, color: theme === 'dark' ? '#fff' : '#0f172a', display: 'block', lineHeight: 1.1 }}>GrowEasy</span>
                    <span style={{ fontSize: 8.5, color: '#0ea5e9', fontWeight: 600, display: 'block', letterSpacing: '0.05em' }}>AI CSV Importer</span>
                  </div>
                </div>
                <p style={{ fontSize: 15, color: theme === 'dark' ? '#64748b' : '#475569', lineHeight: 1.5, margin: '0 0 16px', maxWidth: 220 }}>
                  AI-powered CSV importer that maps, validates and transforms your data for CRM success.
                </p>
                {/* Social icons */}
                <div style={{ display: 'flex', gap: 14, color: theme === 'dark' ? '#64748b' : '#475569' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ cursor: 'pointer' }} className="hover:text-white transition"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ cursor: 'pointer' }} className="hover:text-white transition"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ cursor: 'pointer' }} className="hover:text-white transition"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </div>
              </div>

              {/* Columns */}
              {[
                { title: 'Product', links: ['Features', 'How It Works', 'Pricing', 'Integrations', 'Changelog'] },
                { title: 'Resources', links: ['Documentation', 'Help Center', 'API Reference', 'Blog', 'Status'] },
                { title: 'Company', links: ['About Us', 'Careers', 'Contact', 'Partners'] },
                { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'Cookie Policy'] }
              ].map((col, idx) => (
                <div key={idx}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>{col.title}</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <a href={`#${link.toLowerCase().replace(/ /g, '-')}`} style={{ color: theme === 'dark' ? '#64748b' : '#475569', textDecoration: 'none' }} className="hover:text-white transition">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Copyright row */}
            <div style={{ maxWidth: 1400, margin: '0 auto', borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: theme === 'dark' ? '#64748b' : '#475569', width: '100%' }}>
              <span>© 2025 GrowEasy. All rights reserved.</span>
            </div>
          </footer>
        </div>
      )}

      {/* ── APP WORKSPACE VIEW ───────────────────────────────── */}
      {view === 'APP' && (
        <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex' }}>
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            onGoToLanding={() => setView('LANDING')}
          />

          <div className="main-shell" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Page Header */}
            <div className="page-header" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '24px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, width: '100%' }}>
                <div>
                  <h1 style={{ fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                    {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'leads' ? 'Leads Management' : 'Settings'}
                  </h1>
                  <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
                    {activeTab === 'dashboard'
                      ? 'Select CSV channel source or monitor execution summary metrics.'
                      : activeTab === 'leads'
                        ? 'Detailed list of imported CRM leads directories.'
                        : 'Customize local workspace credentials and AI engine parameters.'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  {theme === 'dark' ? (
                    <Sun size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="hover:text-white transition" onClick={() => setTheme('light')} />
                  ) : (
                    <Moon size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} className="hover:text-primary transition" onClick={() => setTheme('dark')} />
                  )}
                  {activeTab !== 'settings' && (
                    <button
                      className="btn button-glow"
                      style={{ color: '#fff', borderRadius: 8, padding: '10px 22px', fontSize: 16 }}
                      onClick={() => setShowModal(true)}
                    >
                      <Upload size={18} /> Import Leads via CSV
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28, flex: 1 }}>

              {/* 🏠 TABS: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <>
                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                      { label: 'Total Leads', value: stats?.total ?? '0', desc: '+12.5% vs yesterday', color: '#10b981' },
                      { label: 'Active Opportunities', value: stats?.imported ?? '0', desc: 'AI parsed records', color: '#3b82f6' },
                      { label: 'Skipped Rows', value: stats?.skipped ?? '0', desc: 'Invalid contact details', color: '#f59e0b' },
                      { label: 'Conversion Rate', value: leads.length ? '100%' : '0%', desc: 'CRM validation rate', color: '#10b981' }
                    ].map((m, idx) => (
                      <div key={idx} className="card" style={{ padding: '20px' }}>
                        <div style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 2px', letterSpacing: '-0.5px' }}>{m.value}</div>
                        <div style={{ fontSize: 14, color: m.color, fontWeight: 500 }}>{m.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Connectors grid */}
                  <div className="card" style={{ padding: '24px' }}>
                    <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', margin: '0 0 4px' }}>Active Lead Sources</h2>
                    <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 0 20px' }}>Connect lead capture forms or import local documents.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                      {CONNECTORS.map((c) => (
                        <div
                          key={c.name}
                          className="card"
                          style={{
                            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            cursor: c.name === 'CSV Import' ? 'pointer' : 'default',
                            transition: 'border-color 0.2s'
                          }}
                          onClick={c.name === 'CSV Import' ? () => setShowModal(true) : undefined}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                              {c.icon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{c.name}</div>
                              <div style={{ fontSize: 14, color: c.connected ? '#10b981' : 'var(--text-secondary)', fontWeight: 600 }}>
                                {c.connected ? '● Connected' : '○ Offline'}
                              </div>
                            </div>
                          </div>
                          {c.connected ? (
                            <button
                              className="btn btn-ghost"
                              style={{ color: 'var(--accent)', fontWeight: 700, padding: '4px 8px', fontSize: 15 }}
                              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                            >
                              Launch
                            </button>
                          ) : (
                            <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 3 }}>
                              Link <ArrowUpRight size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Empty state leads check */}
                  {!leads.length && (
                    <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ width: 72, height: 72, background: 'var(--accent-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Upload size={28} style={{ color: 'var(--accent)' }} />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>No Leads Loaded</h3>
                      <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.5 }}>
                        Upload a CSV file or connect lead feeds above to start viewing database contacts.
                      </p>
                      <button className="btn button-glow" style={{ color: '#fff', borderRadius: 8 }} onClick={() => setShowModal(true)}>
                        Launch CSV Importer
                      </button>
                    </div>
                  )}

                  {/* Small Leads preview panel */}
                  {leads.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>Recent Leads</h2>
                        <button className="btn btn-ghost" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15 }} onClick={() => setActiveTab('leads')}>
                          Open Leads Directory
                        </button>
                      </div>
                      <LeadsTable records={leads.slice(0, 5)} />
                    </div>
                  )}
                </>
              )}

              {/* 👥 TABS: LEADS DIRECTORY */}
              {activeTab === 'leads' && (
                <>
                  {leads.length === 0 ? (
                    <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ width: 72, height: 72, background: 'var(--accent-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Users size={28} style={{ color: 'var(--accent)' }} />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>Directory Empty</h3>
                      <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.5 }}>
                        There are no leads inside the workspace. Execute a CSV import file to populate the list.
                      </p>
                      <button className="btn button-glow" style={{ color: '#fff', borderRadius: 8 }} onClick={() => setShowModal(true)}>
                        Launch CSV Importer
                      </button>
                    </div>
                  ) : (
                    <LeadsTable records={leads} />
                  )}
                </>
              )}

              {/* ⚙️ TABS: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="card" style={{ padding: '28px', maxWidth: 620 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 20, margin: '0 0 4px', color: 'var(--text-primary)' }}>System Configuration</h2>
                  <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 0 24px' }}>Manage server endpoints, API keys, and execution limits.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>API Provider Status</label>
                      <div style={{ fontSize: 15, color: 'var(--text-secondary)', padding: '12px 14px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 8, lineHeight: 1.6 }}>
                        🟢 <strong>Groq Cloud API Key:</strong> Connected (using `llama-3.1-8b-instant`) <br />
                        ⚪ <strong>Gemini API Key:</strong> Connected (active fallback)
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Default Batch size</label>
                      <div style={{ fontSize: 15, color: 'var(--text-secondary)', padding: '12px 14px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        🚀 <strong>10 records per batch</strong> (Optimized for concurrent parallel execution under 4 seconds).
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Import Modal wizard */}
          {showModal && (
            <ImportModal
              onClose={() => setShowModal(false)}
              onImportComplete={() => { }}
              onLeadsReady={(importedLeads, importStats) => {
                setLeads(importedLeads);
                setStats(importStats);
                setShowModal(false);
                setActiveTab('leads');
                fireToast(`${importedLeads.length} leads imported successfully!`);
              }}
            />
          )}

          {/* Toast Alert */}
          {toast && (
            <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200 }}>
              <div className={`toast ${toast.type === 'ok' ? 'toast-success' : 'toast-error'}`}>
                {toast.type === 'ok' ? <CheckCircle2 size={18} /> : null}
                {toast.msg}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function FeatureCardLight({ icon, title, desc, theme }: { icon: React.ReactNode; title: string; desc: string; theme: 'light' | 'dark' }) {
  return (
    <div style={{
      padding: 32,
      borderRadius: 16,
      textAlign: 'left',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }} className="apple-glass hover:shadow-md transition">
      <div style={{ marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ fontSize: 16, color: theme === 'dark' ? '#94a3b8' : '#64748b', margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}
