'use client';

import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, MoreHorizontal, ChevronDown } from 'lucide-react';

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
  if (!status) return 'Not Dialed';
  return status;
}

/* ─── Column helpers ─────────────────────────────────────── */
const COL_MAP: Record<string, string[]> = {
  name:    ['name', 'lead_name', 'full_name', 'contact_name', 'firstName'],
  email:   ['email', 'email_address', 'mail'],
  phone:   ['phone', 'mobile', 'contact', 'phone_number', 'mobile_number'],
  date:    ['created_at', 'date', 'date_created', 'createdAt'],
  company: ['company', 'organization', 'company_name'],
  status:  ['crm_status', 'status', 'lead_status', 'disposition'],
};

function getField(row: LeadRow, key: string): string {
  const candidates = COL_MAP[key] ?? [key];
  for (const c of candidates) {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === c.toLowerCase() && row[k]) return String(row[k]);
    }
  }
  return '—';
}

const PAGE_SIZE = 10;

export default function LeadsTable({ records }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [records, search]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  if (!records.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Table toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>Your Leads</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} imported
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search leads…"
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: '1px solid var(--border)', borderRadius: 8, fontSize: 13,
                color: 'var(--text-primary)', background: '#fff', outline: 'none',
                width: 220,
              }}
            />
          </div>
          <button
            className="btn-icon btn"
            onClick={() => { setSearch(''); setPage(1); }}
            title="Reset"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead style={{ background: '#fafafa' }}>
              <tr>
                <th>Lead Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Date Created</th>
                <th>Company</th>
                <th>Status</th>
                <th>Quality</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => {
                const status = getField(row, 'status');
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {getField(row, 'name')}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getField(row, 'email')}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {getField(row, 'phone')}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: 12.5 }}>
                      {getField(row, 'date')}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {getField(row, 'company')}
                    </td>
                    <td>
                      <span className={getBadgeClass(status)}>
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>—</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--accent)', fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}
                      >
                        More <ChevronDown size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {hasMore && (
          <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setPage((p) => p + 1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
