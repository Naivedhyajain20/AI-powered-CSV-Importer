'use client';

import React, { useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */
type LeadRow = Record<string, unknown>;

type Props = {
  records: LeadRow[];
};

/* ─── Badge helpers ──────────────────────────────────────── */
function getBadgeClass(status: string): string {
  const s = (status ?? '').toLowerCase();
  if (s.includes('good') || s.includes('hot') || s.includes('follow')) return 'badge badge-good';
  if (s.includes('done') || s.includes('closed') || s.includes('sale')) return 'badge badge-done';
  if (s.includes('connect') || s.includes('did_not') || s.includes('dialed')) return 'badge badge-none';
  if (s.includes('skip') || s.includes('invalid') || s.includes('bad') || s.includes('bounce')) return 'badge badge-skip';
  return 'badge badge-none';
}

function getStatusLabel(status: string): string {
  const s = (status ?? '').trim().toUpperCase();
  if (s === 'GOOD_LEAD_FOLLOW_UP') return 'Follow Up';
  if (s === 'SALE_DONE') return 'Sale Done';
  if (s === 'DID_NOT_CONNECT') return 'No Answer';
  if (s === 'BAD_LEAD') return 'Disqualified';
  return status || 'Not Dialed';
}

export default function LeadsTable({ records }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) => {
      if (!r) return false;
      return Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [records, search]);

  const columns = useMemo(() => {
    const keys = new Set<string>();
    for (const r of records) {
      if (r) {
        Object.keys(r).forEach((k) => keys.add(k));
      }
    }
    return Array.from(keys);
  }, [records]);

  if (!records.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%', flex: 1 }}>
      {/* Table toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', margin: 0 }}>Your Leads</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} imported
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: '1px solid var(--border)', borderRadius: 8, fontSize: 16,
                color: 'var(--text-primary)', background: '#fff', outline: 'none',
                width: 220,
              }}
            />
          </div>
          <button
            className="btn-icon btn"
            onClick={() => setSearch('')}
            title="Reset"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 400 }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#fafafa', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <tr>
                {columns.map((col) => (
                  <th key={col} style={{ whiteSpace: 'nowrap', padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                if (!row) return null;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {columns.map((col) => {
                      const valStr = String(row[col] ?? '—');
                      
                      // Format Name Beautifully
                      if (col.toLowerCase().includes('name') && valStr !== '—') {
                        const initials = valStr.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'LD';
                        return (
                          <td key={col} style={{ fontWeight: 600, color: 'var(--text-primary)', padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 700, color: '#475569', border: '1px solid #e2e8f0',
                                flexShrink: 0
                              }}>
                                {initials}
                              </div>
                              <span style={{ whiteSpace: 'nowrap' }}>{valStr}</span>
                            </div>
                          </td>
                        );
                      }

                      // Format Status Beautifully
                      if (col.toLowerCase().includes('status') && valStr !== '—') {
                        return (
                          <td key={col} style={{ padding: '12px 16px' }}>
                            <span className={getBadgeClass(valStr)}>
                              {getStatusLabel(valStr)}
                            </span>
                          </td>
                        );
                      }

                      // Standard cell
                      return (
                        <td key={col} style={{ color: 'var(--text-secondary)', padding: '12px 16px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {valStr}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
