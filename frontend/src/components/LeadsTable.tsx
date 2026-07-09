'use client';

import React, { useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */
type LeadRow = Record<string, unknown>;

type Props = {
  records: LeadRow[];
};

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

  // Render a single row
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = filtered[index];
    if (!row) return null;

    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border)' }}>
        {columns.map((col, i) => (
          <div key={col} style={{ 
            flex: 1, 
            minWidth: 150,
            paddingRight: 16,
            color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: i === 0 ? 600 : 400,
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {String(row[col] ?? '—')}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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

      {/* Dynamic Table card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <div style={{ minWidth: columns.length * 150 }}>
            {/* Header */}
            <div style={{ display: 'flex', padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {columns.map((col) => (
                <div key={col} style={{ flex: 1, minWidth: 150, paddingRight: 16 }}>
                  {col.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
            {/* Body */}
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {filtered.map((row, index) => (
                <Row key={index} index={index} style={{ height: 56, flexShrink: 0 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
