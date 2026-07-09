'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  Download,
  Copy,
  RefreshCw,
  Database,
} from 'lucide-react';
import { useCsvWizard } from '../hooks/use-csv-wizard';
import { TARGET_CRM_FIELDS } from '../constants/crm';

type LeadRow = Record<string, unknown>;
type ImportStats = {
  total: number;
  imported: number;
  skipped: number;
  processingTime: string;
} | null;

type Props = {
  onClose: () => void;
  onImportComplete: () => void;
  onLeadsReady?: (leads: LeadRow[], stats: ImportStats) => void;
};

export default function ImportModal({ onClose, onImportComplete, onLeadsReady }: Props) {
  const {
    step,
    headers,
    previewRows,
    totalRows,
    metadata,
    headerMappings,
    setHeaderMappings,
    importSummary,
    error,
    loading,
    loadingStage,
    reset,
    handleUploadFile,
    handleRetrieveMappings,
    handleStartImport,
  } = useCsvWizard();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (!f?.name.endsWith('.csv')) { showToast('Please upload a valid .csv file'); return; }
    handleUploadFile(f).then(() => showToast('File uploaded')).catch(() => {});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleUploadFile(f).then(() => showToast('File uploaded')).catch(() => {});
  };

  const formatBytes = (b: number) => {
    if (b === 0) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(1) + ' ' + s[i];
  };

  const handleClose = () => { reset(); onClose(); };

  const copyJson = () => {
    if (importSummary?.importedRecords)
      navigator.clipboard.writeText(JSON.stringify(importSummary.importedRecords, null, 2));
    showToast('Copied to clipboard');
  };

  const downloadJson = () => {
    if (!importSummary?.importedRecords) return;
    const a = document.createElement('a');
    a.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(importSummary.importedRecords, null, 2))}`;
    a.download = `crm_records_${Date.now()}.json`;
    a.click();
    showToast('JSON downloaded');
  };

  /* ── 7-stage progress list ───────────────────────────── */
  const STAGES = [
    'Uploading CSV...',
    'Preparing Prompt...',
    'Calling Gemini...',
    'Extracting CRM Records...',
    'Validating CRM Schema...',
    'Generating Final JSON...',
    'Building Summary...',
  ];

  // Find the current stage by matching the prefix
  const stageIdx = STAGES.findIndex((s) => {
    const prefix = s.replace('...', '');
    return loadingStage.startsWith(prefix);
  });

  // Extract percentage if present, e.g., "Extracting CRM Records (80%)..." -> 80
  const match = loadingStage.match(/\\((\\d+)%\\)/);
  const subPercent = match ? parseInt(match[1], 10) : 0;

  let progressPct = 5;
  if (stageIdx >= 0) {
    const baseProgress = (stageIdx / STAGES.length) * 100;
    const stepProgress = subPercent 
      ? (subPercent / 100) * (100 / STAGES.length)
      : (100 / STAGES.length);
    progressPct = Math.round(baseProgress + stepProgress);
  }

  return (
    <>
      {/* ── Full-screen importing overlay ─────────────────────── */}
      {step === 'IMPORTING' && (
        <div className="import-overlay">
          <div style={{
            background: 'var(--bg-card)', borderRadius: 20, padding: 36, maxWidth: 420, width: '100%',
            display: 'flex', flexDirection: 'column', gap: 24,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  border: '4px solid var(--border)', borderTopColor: '#16a34a',
                  animation: 'spin 0.9s linear infinite',
                }} />
                <Sparkles size={24} style={{ position: 'absolute', top: 18, left: 18, color: '#16a34a', animation: 'pulse 2s ease-in-out infinite' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>AI CRM Extraction</div>
              <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 4 }}>{loadingStage || 'Initializing…'}</div>
            </div>

            {/* Progress bar */}
            <div style={{ background: 'var(--bg-hover)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
              <div style={{
                background: 'var(--accent)', height: '100%', borderRadius: 99,
                width: `${progressPct}%`, transition: 'width 0.7s ease',
              }} />
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STAGES.map((stage, idx) => {
                const done = idx < stageIdx;
                const active = idx === stageIdx;
                return (
                  <div key={stage} className="stage-item" style={{ opacity: done || active ? 1 : 0.35 }}>
                    {done
                      ? <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                      : active
                        ? <Loader2 size={20} style={{ color: '#16a34a', flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
                        : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-hover)', flexShrink: 0 }} />
                    }
                    <span style={{
                      fontSize: 16,
                      color: done ? '#16a34a' : active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 600 : 400,
                      textDecoration: done ? 'line-through' : 'none',
                    }}>{stage}</span>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: 13, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Do not close this tab
            </p>
          </div>
        </div>
      )}

      {/* ── Modal backdrop ─────────────────────────────────────── */}
      {step !== 'IMPORTING' && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <div className="modal-card">

            {/* Modal Header */}
            <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
                  {step === 'SUMMARY' ? '✅ Import Complete' : 'Import Leads via CSV'}
                </div>
                <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {step === 'SUMMARY'
                    ? `${importSummary?.metadata?.importedRows ?? 0} records imported successfully`
                    : 'Upload a CSV file to bulk import leads into your system.'}
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', borderRadius: 6, display: 'flex', alignItems: 'center' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{ margin: '12px 24px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#b91c1c' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP: UPLOAD ──────────────────────────────────── */}
            {step === 'UPLOAD' && (
              <div style={{ padding: 24 }}>
                <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
                <div
                  className={`drop-zone${dragActive ? ' active' : ''}`}
                  onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ width: 48, height: 48, background: 'var(--bg-hover)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <UploadCloud size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Drop your CSV file here
                  </div>
                  <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>or click to browse files</div>
                  <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 99, fontSize: 15, color: 'var(--text-secondary)' }}>
                    <AlertCircle size={15} />
                    Supported file: .csv (max 5MB)
                  </div>
                  <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Required headers: name, email, phone, company, city, country, lead_owner,<br />
                    crm_status, crm_note. AI will intelligently map your columns.
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); showToast('Template download coming soon'); }}
                    style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'transparent', border: '1px solid var(--accent)', borderRadius: 8, fontSize: 16, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Download size={16} />
                    Download Sample CSV Template
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: PREVIEW ─────────────────────────────────── */}
            {step === 'PREVIEW' && metadata && (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* File badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-page)' }}>
                  <div style={{ width: 36, height: 36, background: 'var(--badge-good-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} style={{ color: '#16a34a' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {metadata.fileName}
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>{formatBytes(metadata.fileSize)}</div>
                  </div>
                  <button
                    onClick={handleClose}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Total Rows', value: totalRows },
                    { label: 'Columns', value: metadata.detectedColumns },
                    { label: 'Preview', value: `${previewRows.length} rows` },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>{s.value}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Preview table */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto', maxHeight: 260 }}>
                    <table className="data-table">
                      <thead style={{ background: 'var(--bg-page)', position: 'sticky', top: 0 }}>
                        <tr>
                          {headers.slice(0, 6).map((h) => <th key={h}>{h}</th>)}
                          {headers.length > 6 && <th>+{headers.length - 6} more</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i}>
                            {headers.slice(0, 6).map((h) => (
                              <td key={h} style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {String(row[h] ?? '—')}
                              </td>
                            ))}
                            {headers.length > 6 && <td style={{ color: 'var(--text-muted)' }}>…</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP: MAPPING ─────────────────────────────────── */}
            {step === 'MAPPING' && (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>
                    AI Header Mapping Review
                  </div>
                  <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                    Gemini has suggested the following column mappings. You can adjust any before importing.
                  </div>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
                  <div style={{ padding: '0 16px' }}>
                    {/* Header row */}
                    <div className="mapping-row" style={{ borderBottom: '2px solid var(--border)', paddingBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>CSV Column</span>
                      <span />
                      <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>CRM Field</span>
                      <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', textAlign: 'center' }}>Conf.</span>
                    </div>
                    {headerMappings.map((m, idx) => {
                      const conf = m.confidence ?? 1;
                      const confClass = conf >= 0.85 ? 'conf-high' : conf >= 0.55 ? 'conf-medium' : 'conf-low';
                      return (
                        <div key={idx} className="mapping-row">
                          <span style={{ fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.sourceHeader}
                          </span>
                          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                          <select
                            value={m.targetField ?? ''}
                            onChange={(e) => {
                              const updated = [...headerMappings];
                              updated[idx] = { ...updated[idx], targetField: e.target.value || null };
                              setHeaderMappings(updated);
                            }}
                            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontSize: 15, color: 'var(--text-primary)', background: 'var(--bg-card)', width: '100%', cursor: 'pointer' }}
                          >
                            <option value="">— Skip —</option>
                            {TARGET_CRM_FIELDS.map((f) => (
                              <option key={f.field} value={f.field}>{f.label}</option>
                            ))}
                          </select>
                          <span className={`badge ${confClass}`} style={{ justifyContent: 'center', fontSize: 14, padding: '2px 8px' }}>
                            {Math.round(conf * 100)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP: SUMMARY ─────────────────────────────────── */}
            {step === 'SUMMARY' && importSummary && (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Stat grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Imported', value: importSummary.metadata.importedRows, color: '#16a34a' },
                    { label: 'Skipped', value: importSummary.metadata.skippedRows, color: '#d97706' },
                    { label: 'Total', value: importSummary.metadata.totalRows, color: '#6366f1' },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '14px 8px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 12 }}>
                      <div style={{ fontWeight: 800, fontSize: 32, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Skipped rows log */}
                {importSummary.skippedRecords.length > 0 && (
                  <div style={{ border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 14px', background: 'rgba(217, 119, 6, 0.1)', borderBottom: '1px solid rgba(217, 119, 6, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#92400e' }}>⚠ Skipped Rows</span>
                      <span style={{ fontSize: 14, color: '#b45309' }}>{importSummary.skippedRecords.length} row(s)</span>
                    </div>
                    <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                      {importSummary.skippedRecords.map((r, i) => (
                        <div key={i} style={{ padding: '8px 14px', fontSize: 15, borderBottom: '1px solid rgba(217, 119, 6, 0.1)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <AlertCircle size={16} style={{ color: '#d97706', marginTop: 1, flexShrink: 0 }} />
                          <span><strong>Row #{r.rowIndex + 1}</strong> — {r.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* JSON viewer */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-page)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Database size={18} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Generated CRM Records</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="btn-ghost btn" style={{ padding: '4px 10px', fontSize: 15 }} onClick={() => setJsonExpanded(!jsonExpanded)}>
                        {jsonExpanded ? 'Collapse' : 'Expand'}
                      </button>
                      <button className="btn-ghost btn" style={{ padding: '4px 10px', fontSize: 15, gap: 5 }} onClick={copyJson}>
                        <Copy size={15} />Copy
                      </button>
                      <button className="btn-ghost btn" style={{ padding: '4px 10px', fontSize: 15, gap: 5 }} onClick={downloadJson}>
                        <Download size={15} />Download
                      </button>
                    </div>
                  </div>
                  {jsonExpanded && (
                    <div className="json-viewer">
                      <pre>{JSON.stringify(importSummary.importedRecords, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Modal Footer ───────────────────────────────────── */}
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {step === 'SUMMARY' ? (
                <>
                  <button className="btn btn-secondary" onClick={handleClose}>Done</button>
                  <button
                    className="btn btn-primary"
                    style={{ gap: 7 }}
                    onClick={() => {
                      if (onLeadsReady && importSummary) {
                        onLeadsReady(
                          (importSummary.importedRecords ?? []) as LeadRow[],
                          {
                            total: importSummary.metadata.totalRows,
                            imported: importSummary.metadata.importedRows,
                            skipped: importSummary.metadata.skippedRows,
                            processingTime: `${importSummary.metadata.processingTimeMs}ms`,
                          }
                        );
                      }
                      onImportComplete();
                      handleClose();
                    }}
                  >
                    <RefreshCw size={18} />
                    View in Leads
                  </button>
                </>
              ) : step === 'MAPPING' ? (
                <>
                  <button className="btn btn-secondary" onClick={() => handleClose()}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={() => handleStartImport()}
                  >
                    {loading
                      ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />Processing…</>
                      : <>Start AI Import <ChevronRight size={18} /></>}
                  </button>
                </>
              ) : step === 'PREVIEW' ? (
                <>
                  <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={() => handleRetrieveMappings()}
                  >
                    {loading
                      ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />Mapping…</>
                      : <>Analyse with AI <Sparkles size={18} /></>}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                  <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>Upload File</button>
                </>
              )}
            </div>
          </div>

          {/* Mini toast inside modal */}
          {toast && (
            <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 16, fontWeight: 500, zIndex: 100, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
              {toast}
            </div>
          )}
        </div>
      )}
    </>
  );
}
