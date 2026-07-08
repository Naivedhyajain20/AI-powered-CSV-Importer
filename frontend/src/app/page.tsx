'use client';

import React, { useState } from 'react';
import {
  Upload,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
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
  { name: 'Meta Ads',   icon: '🟦', connected: false },
  { name: 'LinkedIn',   icon: '🔗', connected: false },
  { name: 'WhatsApp',   icon: '🟢', connected: false },
  { name: 'Webhook',    icon: '⚡',  connected: false },
  { name: 'CSV Import', icon: '📄', connected: true  },
];

export default function Home() {
  const [view, setView] = useState<'LANDING' | 'APP'>('LANDING');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [stats, setStats] = useState<ImportStats>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const fireToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      {/* ── LANDING VIEW ────────────────────────────────────── */}
      {view === 'LANDING' && (
        <div className="landing-grid" style={{
          minHeight: '100vh', background: '#09090b', color: '#fff',
          display: 'flex', flexDirection: 'column', overflowX: 'hidden', position: 'relative'
        }}>
          {/* Glowing center background */}
          <div className="landing-hero-glow" />

          {/* Floating Navigation */}
          <nav style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(9, 9, 11, 0.75)', backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              maxWidth: 1200, margin: '0 auto', padding: '16px 24px',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'space-between', width: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 15, color: '#fff'
                }}>
                  G
                </div>
                <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px', color: '#fff' }}>GrowEasy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13.5, fontWeight: 500 }}>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }} className="hover:text-white transition">Features</a>
                <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }} className="hover:text-white transition">How it Works</a>
                <a href="#testimonials" style={{ color: '#94a3b8', textDecoration: 'none' }} className="hover:text-white transition">Stories</a>
                <button
                  onClick={() => setView('APP')}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: 8,
                    fontWeight: 600, fontSize: 13, transition: 'background 0.2s'
                  }}
                >
                  Login
                </button>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <header className="max-w-6xl mx-auto px-8 py-24 text-center flex flex-col items-center relative z-10">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 14px', borderRadius: 99,
              fontSize: 12.5, color: '#34d399', fontWeight: 600, marginBottom: 28, letterSpacing: '0.02em'
            }}>
              <Sparkles size={13} /> The #1 AI Ad Platform for SMEs
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 6.5vw, 64px)', fontWeight: 900, letterSpacing: '-0.04em',
              lineHeight: 1.05, maxWidth: 900, marginBottom: 20, color: '#fff'
            }}>
              Launch AI-Powered Lead Generation Campaigns in <span className="animated-gradient-text">5 Minutes.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2.5vw, 17px)', color: '#94a3b8', maxWidth: 650,
              lineHeight: 1.65, marginBottom: 44, fontWeight: 400
            }}>
              Skip the complex Meta Business Suite. GrowEasy&apos;s AI automatically creates stunning ad designs, writes converting copy, and routes high-intent leads straight to your CRM and WhatsApp.
            </p>

            <div style={{ display: 'flex', gap: 16, marginBottom: 70 }}>
              <button
                className="btn button-glow"
                style={{ padding: '14px 32px', fontSize: 14, borderRadius: 10, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => setView('APP')}
              >
                Launch Your First Campaign <ArrowRight size={15} />
              </button>
              <button
                className="btn"
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                  padding: '14px 32px', fontSize: 14, borderRadius: 10, color: '#fff',
                  transition: 'background 0.2s, border-color 0.2s'
                }}
                onClick={() => setView('APP')}
              >
                Book a Demo
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: '#64748b' }}>No credit card required • Connects with Facebook, Instagram & Google</p>
          </header>

          {/* Stats Bar (Bright Light Theme Contrast) */}
          <section style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', zIndex: 10 }} className="relative">
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 32, width: '100%' }}>
              {[
                { num: '100+', label: 'Businesses Growing' },
                { num: '10x', label: 'Faster Setup' },
                { num: '24/7', label: 'AI Optimization' },
                { num: '-40%', label: 'Avg. Cost Per Lead' }
              ].map((s, idx) => (
                <div key={idx} style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
                  <p style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>{s.num}</p>
                  <p style={{ fontSize: 13.5, color: '#475569', fontWeight: 600, margin: '4px 0 0' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features Grid (Dark Theme) */}
          <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px', position: 'relative', zIndex: 10, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Everything You Need to Scale</h2>
              <p style={{ fontSize: 14.5, color: '#94a3b8', marginTop: 12, margin: 0 }}>We replaced expensive marketing agencies with an intelligent engine that works 24/7.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              <FeatureCard icon="🎨" title="AI-Generated Creatives" desc="Our AI instantly produces visually stunning vertical graphics and compelling copy tailored for Reels and Stories." />
              <FeatureCard icon="🎯" title="Precision Targeting" desc="Choose local or national demographics. Our machine learning algorithms find the highest-intent buyers." />
              <FeatureCard icon="⚡" title="Instant Lead Routing" desc="Don&apos;t let leads go cold. Every new lead is instantly pushed to your WhatsApp and email in real-time." />
              <FeatureCard icon="📊" title="Smart Budget Allocation" desc="Meta&apos;s algorithm automatically shifts your budget to whichever platform (FB/IG) delivers a better CPL." />
              <FeatureCard icon="🤖" title="No Ads Manager Needed" desc="Bypass the complicated Meta Business Suite. Manage everything from a single, intuitive dashboard." />
              <FeatureCard icon="📱" title="Built-in Mini CRM" desc="Manage, tag, and update lead statuses (GOOD_LEAD, SALE_DONE) directly inside the GrowEasy app." />
            </div>
          </section>

          {/* How It Works (Bright Light Theme Transition) */}
          <section id="how-it-works" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '90px 24px', zIndex: 10 }} className="relative">
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>From Zero to Leads in 4 Steps</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                <Step number="1" title="Tell us about your business" desc="Enter basic details to help our AI deeply understand your brand and goals." />
                <Step number="2" title="Review AI Creatives" desc="Pick from multiple AI-generated banners and ad copy variations." />
                <Step number="3" title="Set your Budget" desc="Select a flexible daily ad spend that fits your marketing runway." />
                <Step number="4" title="Close Deals" desc="Watch high-quality leads roll into your WhatsApp instantly." />
              </div>
            </div>
          </section>

          {/* Customer Testimonials (Dark/Light Contrast) */}
          <section id="testimonials" style={{ background: '#09090b', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '90px 24px', zIndex: 10 }} className="relative">
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Success Stories</h2>
                <p style={{ fontSize: 14.5, color: '#94a3b8', marginTop: 12, margin: 0 }}>Trusted by 2,000+ businesses across India.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {[
                  { name: 'Akshat', role: 'Founder, Pagaar.ai', body: 'Using GrowEasy, we saw an immediate increase in ROAS across our Google and Facebook campaigns. It automated the entire process and delivered better results with less manual intervention.' },
                  { name: 'Yash Chaudhary', role: 'Founder, Flabs', body: 'Launching a lead generation campaign has never been easier. With GrowEasy&apos;s AI, I set up my ads in 5 minutes, and the platform helped me achieve a higher return on ad spend than ever before.' }
                ].map((t, idx) => (
                  <div key={idx} className="glass-card-premium" style={{ padding: 28, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>&ldquo;{t.body}&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{t.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Footer Section (Vibrant Green/Blue) */}
          <section className="bg-blue-600 py-20 text-center px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to automate your growth?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">Join D2C founders, real estate agents, and local businesses who have put their lead generation on autopilot.</p>
            <button onClick={() => setView('APP')} className="bg-white text-blue-600 text-xl px-10 py-4 rounded-xl font-bold hover:bg-slate-50 transition shadow-lg">
              Create Free Account
            </button>
          </section>
        </div>
      )}

      {/* ── APP WORKSPACE VIEW ───────────────────────────────── */}
      {view === 'APP' && (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            onGoToLanding={() => setView('LANDING')}
          />

          <div className="main-shell" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Page Header */}
            <div className="page-header" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '24px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h1 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                    {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'leads' ? 'Leads Management' : 'Settings'}
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
                    {activeTab === 'dashboard'
                      ? 'Select CSV channel source or monitor execution summary metrics.'
                      : activeTab === 'leads'
                      ? 'Detailed list of imported CRM leads directories.'
                      : 'Customize local workspace credentials and AI engine parameters.'}
                  </p>
                </div>
                {activeTab !== 'settings' && (
                  <button
                    className="btn button-glow"
                    style={{ color: '#fff', borderRadius: 8, padding: '10px 22px', fontSize: 13.5 }}
                    onClick={() => setShowModal(true)}
                  >
                    <Upload size={14} /> Import Leads via CSV
                  </button>
                )}
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
                      <div key={idx} className="card" style={{ padding: '20px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 2px', letterSpacing: '-0.5px' }}>{m.value}</div>
                        <div style={{ fontSize: 11, color: m.color, fontWeight: 500 }}>{m.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Connectors grid */}
                  <div className="card" style={{ padding: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                    <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 4px' }}>Active Lead Sources</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>Connect lead capture forms or import local documents.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                      {CONNECTORS.map((c) => (
                        <div
                          key={c.name}
                          className="card"
                          style={{
                            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#fff', border: '1px solid #e2e8f0', cursor: c.name === 'CSV Import' ? 'pointer' : 'default',
                            transition: 'border-color 0.2s'
                          }}
                          onClick={c.name === 'CSV Import' ? () => setShowModal(true) : undefined}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                              {c.icon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: c.connected ? '#10b981' : 'var(--text-secondary)', fontWeight: 600 }}>
                                {c.connected ? '● Connected' : '○ Offline'}
                              </div>
                            </div>
                          </div>
                          {c.connected ? (
                            <button
                              className="btn btn-ghost"
                              style={{ color: 'var(--accent)', fontWeight: 700, padding: '4px 8px', fontSize: 12.5 }}
                              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                            >
                              Launch
                            </button>
                          ) : (
                            <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                              Link <ArrowUpRight size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Empty state leads check */}
                  {!leads.length && (
                    <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: '#fff' }}>
                      <div style={{ width: 56, height: 56, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Upload size={22} style={{ color: '#10b981' }} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>No Leads Loaded</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.5 }}>
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
                        <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Recent Leads</h2>
                        <button className="btn btn-ghost" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12.5 }} onClick={() => setActiveTab('leads')}>
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
                    <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: '#fff' }}>
                      <div style={{ width: 56, height: 56, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Users size={22} style={{ color: '#10b981' }} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>Directory Empty</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.5 }}>
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
                <div className="card" style={{ padding: '28px', maxWidth: 620, background: '#fff', borderRadius: 12 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>System Configuration</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px' }}>Manage server endpoints, API keys, and execution limits.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>API Provider Status</label>
                      <div style={{ fontSize: 12.5, color: '#374151', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, lineHeight: 1.6 }}>
                        🟢 <strong>Groq Cloud API Key:</strong> Connected (using `llama-3.1-8b-instant`) <br />
                        ⚪ <strong>Gemini API Key:</strong> Connected (active fallback)
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Default Batch size</label>
                      <div style={{ fontSize: 12.5, color: '#374151', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
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
              onImportComplete={() => {}}
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
                {toast.type === 'ok' ? <CheckCircle2 size={15} /> : null}
                {toast.msg}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass-card-premium p-8 rounded-2xl border border-zinc-800/80 shadow-lg hover:shadow-xl transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-zinc-400 leading-relaxed" style={{ fontSize: 13.5 }}>{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-6 text-white shadow-md">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-600" style={{ fontSize: 13.5 }}>{desc}</p>
    </div>
  );
}
