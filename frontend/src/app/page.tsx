'use client';

import React, { useState } from 'react';
import {
  Upload,
  Users,
  CheckCircle2,
  Clock,
  SkipForward,
  BarChart3,
  Link2,
  ExternalLink,
  RefreshCw,
  Wifi,
  WifiOff,
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

/* ── Static connector cards ─────────────────────────────── */
const CONNECTORS = [
  { name: 'Google Ads', icon: '🔵', connected: false },
  { name: 'Meta Ads',   icon: '🟦', connected: false },
  { name: 'LinkedIn',   icon: '🔗', connected: false },
  { name: 'WhatsApp',   icon: '🟢', connected: false },
  { name: 'Webhook',    icon: '⚡',  connected: false },
  { name: 'CSV Import', icon: '📄', connected: true  },
];

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads]   = useState<LeadRow[]>([]);
  const [stats, setStats]   = useState<ImportStats>(null);
  const [toast, setToast]   = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const fireToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* Called by ImportModal when import finishes */
  const handleImportComplete = () => {
    fireToast('Leads imported successfully!');
  };

  /* Called when modal closes after summary */
  const handleModalClose = () => {
    setShowModal(false);
    /* We pick up leads from window storage set by the modal */
    const cached = (window as unknown as Record<string, unknown>).__importedLeads as LeadRow[] | undefined;
    if (cached?.length) {
      setLeads(cached);
      const s = (window as unknown as Record<string, unknown>).__importStats as ImportStats | undefined;
      if (s) setStats(s);
    }
  };

  return (
    <>
      <Sidebar activePage="Lead Sources" />

      <div className="main-shell">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>
                Lead Sources
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
                Connect, manage, and control all your lead channels from one dashboard.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
              style={{ alignSelf: 'flex-end' }}
            >
              <Upload size={15} />
              Import Leads via CSV
            </button>
          </div>
        </div>

        {/* ── Main body ────────────────────────────────────── */}
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28, flex: 1 }}>

          {/* Stats strip (only after import) */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[
                { icon: <Users size={18} style={{ color: '#6366f1' }} />, label: 'Total Records', value: stats.total,     bg: '#ede9fe' },
                { icon: <CheckCircle2 size={18} style={{ color: '#16a34a' }} />, label: 'Imported',       value: stats.imported, bg: '#dcfce7' },
                { icon: <SkipForward size={18} style={{ color: '#d97706' }} />, label: 'Skipped',        value: stats.skipped,  bg: '#fef3c7' },
                { icon: <Clock size={18} style={{ color: '#0891b2' }} />, label: 'Processing',     value: stats.processingTime, bg: '#e0f2fe' },
              ].map((s) => (
                <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Connectors grid */}
          {!leads.length && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', margin: '0 0 4px' }}>Active Lead Sources</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Connect a channel to start capturing leads automatically.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {CONNECTORS.map((c) => (
                  <div
                    key={c.name}
                    className="card"
                    style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: c.name === 'CSV Import' ? 'pointer' : 'default' }}
                    onClick={c.name === 'CSV Import' ? () => setShowModal(true) : undefined}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f9fafb', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {c.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: 11.5, color: c.connected ? '#16a34a' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                          {c.connected
                            ? <><Wifi size={10} /> Connected</>
                            : <><WifiOff size={10} /> Not Connected</>}
                        </div>
                      </div>
                    </div>
                    {c.connected ? (
                      <button className="btn btn-ghost" style={{ color: 'var(--accent)', fontWeight: 700 }}>Open</button>
                    ) : (
                      <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Link2 size={13} /> Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state when no leads yet */}
          {!leads.length && !stats && (
            <div className="card" style={{ padding: '48px 32px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: '#f0fdf4', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <BarChart3 size={28} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>No leads imported yet</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
                Upload a CSV file and let our AI automatically map your columns to CRM fields.
              </p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Upload size={15} />
                Import Leads via CSV
              </button>
            </div>
          )}

          {/* Leads table (after import) */}
          {leads.length > 0 && (
            <>
              <LeadsTable records={leads} />
              <div style={{ textAlign: 'center' }}>
                <button
                  className="btn btn-secondary"
                  style={{ gap: 7 }}
                  onClick={() => setShowModal(true)}
                >
                  <RefreshCw size={14} />
                  Import Another CSV
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Import Modal ─────────────────────────────────────── */}
      {showModal && (
        <ImportModal
          onClose={() => setShowModal(false)}
          onImportComplete={() => {}}
          onLeadsReady={(importedLeads, importStats) => {
            setLeads(importedLeads);
            setStats(importStats);
            setShowModal(false);
            fireToast(`${importedLeads.length} leads imported!`);
          }}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200 }}>
          <div className={`toast ${toast.type === 'ok' ? 'toast-success' : 'toast-error'}`}>
            {toast.type === 'ok' ? <CheckCircle2 size={15} /> : null}
            {toast.msg}
          </div>
        </div>
      )}
    </>
  );
}
