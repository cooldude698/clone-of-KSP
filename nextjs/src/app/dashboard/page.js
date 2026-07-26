'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RefreshCw, Search, MapPin, AlertTriangle,
  Clock, CheckCircle2, FileText, TrendingUp, TrendingDown,
  ArrowRight, ChevronRight, Shield, Radio, ExternalLink,
  Filter, Flag, Eye, Users, Camera
} from 'lucide-react';
import { fetchWithFallback, invalidateCache } from '@/lib/fetch-with-fallback';
import {
  DEMO_FIRS,
  DEMO_HOTSPOTS,
  DEMO_TRENDS,
  DEMO_REPEAT_OFFENDERS,
  DEMO_AI_INSIGHTS
} from '@/lib/demo-data';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open:               { label: 'Open',              color: 'text-rose-700 dark:text-rose-400',   bg: 'bg-rose-50 dark:bg-rose-900/20',   border: 'border-rose-200 dark:border-rose-700', dot: 'bg-rose-500' },
  under_investigation:{ label: 'Investigating',     color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700', dot: 'bg-amber-500' },
  chargesheeted:      { label: 'Chargesheeted',     color: 'text-blue-700 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-700', dot: 'bg-blue-500' },
  closed:             { label: 'Closed',            color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-500' },
};

const CRIME_LABELS = {
  vehicle_theft:   'Vehicle Theft',
  robbery:         'Robbery',
  chain_snatching: 'Chain Snatching',
  burglary:        'Burglary',
  cyber_fraud:     'Cyber Fraud',
  kidnapping:      'Kidnapping',
  assault:         'Assault',
  murder:          'Murder',
};

const HOTSPOT_RISK = {
  critical: { color: 'text-rose-600',   dot: 'bg-rose-500',   bar: 'bg-rose-500' },
  high:     { color: 'text-amber-600',  dot: 'bg-amber-500',  bar: 'bg-amber-500' },
  medium:   { color: 'text-blue-600',   dot: 'bg-blue-500',   bar: 'bg-blue-500' },
  low:      { color: 'text-slate-500',  dot: 'bg-slate-400',  bar: 'bg-slate-400' },
};

const TABS = [
  { key: 'all',               label: 'All Cases' },
  { key: 'open',              label: 'Open' },
  { key: 'under_investigation', label: 'Investigating' },
  { key: 'chargesheeted',     label: 'Chargesheeted' },
  { key: 'closed',            label: 'Closed' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Format date to "18 Jul" style
// ─────────────────────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch { return dateStr; }
}

function fmtTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — Status Pill
// ─────────────────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['open'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — Metric Card
// ─────────────────────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, subTrend, icon: Icon, iconColor, iconBg, loading }) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-[var(--text-primary)] tabular-nums leading-none">
          {loading ? <span className="text-[var(--text-secondary)]">—</span> : value}
        </p>
        {sub && (
          <p className={`text-[11px] font-semibold mt-1.5 flex items-center gap-1 ${subTrend === 'up' ? 'text-rose-600 dark:text-rose-400' : subTrend === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
            {subTrend === 'up' && <TrendingUp className="w-3 h-3" />}
            {subTrend === 'down' && <TrendingDown className="w-3 h-3" />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  // ── Data State ────────────────────────────────────────────────────────────
  const [firs, setFirs] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotspotLoading, setHotspotLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('live');
  const [lastSynced, setLastSynced] = useState(null);

  // ── UI State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [flagged, setFlagged] = useState(new Set());
  const [role, setRole] = useState('Inspector');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('drishti_role') || localStorage.getItem('role') || 'Inspector');
    }
  }, []);

  // ── Fetch FIRs ────────────────────────────────────────────────────────────
  const fetchFirs = useCallback(async () => {
    const res = await fetchWithFallback('/api/firs', DEMO_FIRS, { timeoutMs: 2000 });
    let rows = [];
    if (Array.isArray(res?.data)) rows = res.data;
    else if (Array.isArray(res?.data?.firs)) rows = res.data.firs;
    else rows = DEMO_FIRS.firs;
    setFirs(rows);
    setDataSource(res.source || 'demo');
  }, []);

  // ── Fetch Hotspots ────────────────────────────────────────────────────────
  const fetchHotspots = useCallback(async () => {
    const res = await fetchWithFallback('/api/hotspots', DEMO_HOTSPOTS, { timeoutMs: 2000 });
    let rows = [];
    if (Array.isArray(res?.data)) rows = res.data;
    else if (Array.isArray(res?.data?.hotspots)) rows = res.data.hotspots;
    else rows = DEMO_HOTSPOTS.hotspots;
    setHotspots(rows);
    setHotspotLoading(false);
  }, []);

  // ── Fetch Suspects ────────────────────────────────────────────────────────
  const fetchSuspects = useCallback(async () => {
    const res = await fetchWithFallback('/api/repeat-offenders', DEMO_REPEAT_OFFENDERS, { timeoutMs: 2000 });
    const rows = res?.data?.suspects || DEMO_REPEAT_OFFENDERS.suspects;
    setSuspects(rows.slice(0, 3));
  }, []);

  // ── Load All ──────────────────────────────────────────────────────────────
  const loadAll = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
      invalidateCache('/api/firs');
      invalidateCache('/api/hotspots');
      invalidateCache('/api/repeat-offenders');
    }
    await Promise.all([fetchFirs(), fetchHotspots(), fetchSuspects()]);
    setLoading(false);
    setRefreshing(false);
    setLastSynced(new Date());
  }, [fetchFirs, fetchHotspots, fetchSuspects]);

  // ── Initial load + 30s polling ────────────────────────────────────────────
  useEffect(() => {
    loadAll();
    const id = setInterval(() => loadAll(), 30_000);
    return () => clearInterval(id);
  }, [loadAll]);

  // ── Computed Metrics ──────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    if (!firs.length) return { total: 0, open: 0, investigating: 0, closed: 0 };
    const total = firs.length;
    const open = firs.filter(f => (f.status || f.case_status) === 'open').length;
    const investigating = firs.filter(f => (f.status || f.case_status) === 'under_investigation').length;
    const closed = firs.filter(f => (f.status || f.case_status) === 'closed').length;
    return { total, open, investigating, closed };
  }, [firs]);

  // ── Filtered + Searched FIRs ──────────────────────────────────────────────
  const displayed = useMemo(() => {
    return firs
      .filter(f => {
        const status = f.status || f.case_status || 'open';
        const matchTab = activeTab === 'all' || status === activeTab;
        const q = search.trim().toLowerCase();
        const matchSearch = !q ||
          (f.case_number || '').toLowerCase().includes(q) ||
          (f.crime_type_code || f.crime_type || '').toLowerCase().includes(q) ||
          (f.description || '').toLowerCase().includes(q) ||
          (f.police_station || '').toLowerCase().includes(q) ||
          (f.district_name || f.district || '').toLowerCase().includes(q) ||
          (f.investigation_office || '').toLowerCase().includes(q);
        return matchTab && matchSearch;
      });
  }, [firs, activeTab, search]);

  const tabCounts = useMemo(() => ({
    all: firs.length,
    open: firs.filter(f => (f.status || f.case_status) === 'open').length,
    under_investigation: firs.filter(f => (f.status || f.case_status) === 'under_investigation').length,
    chargesheeted: firs.filter(f => (f.status || f.case_status) === 'chargesheeted').length,
    closed: firs.filter(f => (f.status || f.case_status) === 'closed').length,
  }), [firs]);

  const maxHotspotCount = useMemo(() => Math.max(...hotspots.map(h => h.crime_count || 1), 1), [hotspots]);

  const syncLabel = lastSynced
    ? lastSynced.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    : '—';

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-5 sm:p-7 max-w-[1700px] mx-auto min-h-screen text-[var(--text-primary)]">

      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-heading">
            Overview
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] font-medium mt-0.5">
            Karnataka State Police · CCTNS Live Feed · {role}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync status badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]/50 text-[11px] font-semibold text-[var(--text-secondary)]">
            <span className={`w-2 h-2 rounded-full ${dataSource === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span>{dataSource === 'live' ? 'Live' : 'Cached'} · {syncLabel}</span>
          </div>

          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]/50 text-[13px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>

          <Link
            href="/dashboard/chat"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--surface-0)] text-[13px] font-semibold hover:opacity-90 transition-opacity"
          >
            Ask Drishti AI
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── METRIC CARDS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total FIRs"
          value={metrics.total.toLocaleString('en-IN')}
          sub="Across 31 districts"
          icon={FileText}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          loading={loading}
        />
        <MetricCard
          label="Open Cases"
          value={metrics.open}
          sub={`${metrics.investigating} under investigation`}
          subTrend="up"
          icon={AlertTriangle}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-50 dark:bg-rose-900/20"
          loading={loading}
        />
        <MetricCard
          label="High-Risk Suspects"
          value={suspects.length ? `${suspects.length}+` : '38+'}
          sub="Active watchlist"
          icon={Users}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          loading={loading}
        />
        <MetricCard
          label="ANPR Cameras"
          value="12,500+"
          sub="99.4% operational"
          subTrend="down"
          icon={Camera}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          loading={false}
        />
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

        {/* LEFT: INCIDENT TABLE */}
        <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 flex flex-col overflow-hidden">

          {/* Table Header */}
          <div className="px-5 pt-5 pb-0 space-y-4 border-b border-[var(--border)]/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] font-heading">Incident Register</h2>
                <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                  {loading ? 'Loading…' : `${displayed.length} records · Sorted newest first`}
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Case #, crime type, location, officer…"
                  className="pl-9 pr-4 py-2 rounded-lg bg-[var(--surface-0)] border border-[var(--border)]/50 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors w-full sm:w-72 placeholder:text-[var(--text-secondary)]"
                />
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0 scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                  {!loading && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-[var(--text-primary)] text-[var(--surface-0)]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}>
                      {tabCounts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Column Header Row */}
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
            {['Case Number', 'Crime Type', 'Location / PS', 'Filed', 'Status', 'Action'].map(col => (
              <span key={col} className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="flex-1 divide-y divide-[var(--border)]/30 overflow-y-auto max-h-[480px]">
            {loading ? (
              <div className="py-16 text-center text-[13px] text-[var(--text-secondary)]">
                Loading live CCTNS feed…
              </div>
            ) : displayed.length === 0 ? (
              <div className="py-16 text-center text-[13px] text-[var(--text-secondary)]">
                No records match current filter.
              </div>
            ) : (
              displayed.map(fir => {
                const status = fir.status || fir.case_status || 'open';
                const crimeLabel = CRIME_LABELS[fir.crime_type_code] || fir.crime_type || fir.crime_type_code || 'Incident';
                const isFlagged = flagged.has(fir.case_number);

                return (
                  <div
                    key={fir.case_number}
                    className="group flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1.5fr_auto_auto_auto] gap-4 items-start md:items-center px-5 py-3.5 hover:bg-[var(--surface-2)]/50 transition-colors"
                  >
                    {/* Case Number */}
                    <div>
                      <button
                        onClick={() => router.push(`/dashboard/fir/${fir.case_number}`)}
                        className="text-[13px] font-bold font-mono text-blue-700 dark:text-blue-400 hover:underline cursor-pointer text-left"
                      >
                        {fir.case_number}
                      </button>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate max-w-[180px]">
                        {fir.investigation_office || 'Unassigned'}
                      </p>
                    </div>

                    {/* Crime Type */}
                    <div className="md:block hidden">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">{crimeLabel}</span>
                    </div>

                    {/* Location */}
                    <div className="md:block hidden">
                      <p className="text-[13px] font-medium text-[var(--text-primary)] truncate max-w-[180px]">
                        {fir.location_name || fir.district_name || '—'}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate max-w-[180px]">
                        {fir.police_station || '—'}
                      </p>
                    </div>

                    {/* Filed Date */}
                    <div className="md:block hidden">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)] whitespace-nowrap">{fmtDate(fir.date_filed)}</p>
                      {fir.time_filed && <p className="text-[11px] text-[var(--text-secondary)]">{fmtTime(fir.time_filed)}</p>}
                    </div>

                    {/* Mobile summary */}
                    <div className="md:hidden flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[12px] font-semibold text-[var(--text-primary)]">{crimeLabel}</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">·</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">{fmtDate(fir.date_filed)}</span>
                    </div>

                    {/* Status */}
                    <div>
                      <StatusPill status={status} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setFlagged(prev => {
                            const next = new Set(prev);
                            next.has(fir.case_number) ? next.delete(fir.case_number) : next.add(fir.case_number);
                            return next;
                          });
                        }}
                        title="Flag for priority"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isFlagged ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' : 'text-[var(--text-secondary)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/fir/${fir.case_number}`)}
                        title="View full dossier"
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]/50 bg-[var(--surface-0)]">
            <span className="text-[11px] text-[var(--text-secondary)]">
              Showing {displayed.length} of {firs.length} records
            </span>
            <Link
              href="/dashboard/logs"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-700 dark:text-blue-400 hover:underline"
            >
              Full archive & evidence logs
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT: SIDEBAR PANELS */}
        <div className="flex flex-col gap-4">

          {/* ── CRIME HOTSPOTS ────────────────────────────────────────────── */}
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--border)]/50">
              <div>
                <h3 className="text-[13px] font-bold text-[var(--text-primary)] font-heading">Crime Hotspots</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {hotspotLoading ? 'Loading…' : `${hotspots.length} zones · Polled live`}
                </p>
              </div>
              <Link
                href="/dashboard/map"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline"
              >
                Map
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="px-5 py-3 space-y-3.5">
              {hotspotLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-[var(--surface-2)] rounded-lg animate-pulse" />
                  ))
                : hotspots.slice(0, 7).map((h, i) => {
                    const risk = h.risk_level || (h.crime_count > 30 ? 'critical' : h.crime_count > 15 ? 'high' : 'medium');
                    const cfg = HOTSPOT_RISK[risk] || HOTSPOT_RISK.medium;
                    const pct = Math.round((h.crime_count / maxHotspotCount) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                            <span className="text-[12px] font-semibold text-[var(--text-primary)] truncate">
                              {h.area_name || h.area}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[var(--text-secondary)] tabular-nums shrink-0 ml-2">
                            {h.crime_count}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                          {h.district || h.district_name} · {h.primary_crime}
                        </p>
                      </div>
                    );
                  })
              }
            </div>

            <div className="px-5 pb-4">
              <button
                onClick={() => router.push('/dashboard/map')}
                className="w-full py-2 rounded-xl border border-[var(--border)]/50 bg-[var(--surface-0)] hover:bg-[var(--surface-2)] text-[12px] font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Open Interactive Map
              </button>
            </div>
          </div>

          {/* ── HIGH-RISK SUSPECTS ────────────────────────────────────────── */}
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--border)]/50">
              <div>
                <h3 className="text-[13px] font-bold text-[var(--text-primary)] font-heading">Watchlist</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">High-risk active suspects</p>
              </div>
              <Link href="/dashboard/network" className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1">
                Network
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-[var(--border)]/30">
              {suspects.map((s, i) => (
                <button
                  key={i}
                  onClick={() => router.push(`/dashboard/suspect/${s.suspect_id || s.name?.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-2)]/50 transition-colors cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 font-bold text-[13px] text-[var(--text-secondary)]">
                    {(s.name || '?')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{s.name}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">{s.alias} · {s.district_name}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[12px] font-extrabold text-rose-600">{s.risk_score}</span>
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)] uppercase">Risk</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="px-5 pb-4 pt-2">
              <Link
                href="/dashboard/network"
                className="w-full block py-2 rounded-xl border border-[var(--border)]/50 bg-[var(--surface-0)] hover:bg-[var(--surface-2)] text-[12px] font-semibold text-[var(--text-primary)] text-center transition-colors"
              >
                View All in Network Graph →
              </Link>
            </div>
          </div>

          {/* ── INTELLIGENCE BRIEF ────────────────────────────────────────── */}
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-[var(--border)]/50">
              <Shield className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] font-heading">AI Intelligence Brief</h3>
            </div>

            <div className="divide-y divide-[var(--border)]/30">
              {DEMO_AI_INSIGHTS.map((ins, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ins.severity === 'critical' ? 'bg-rose-500' : ins.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      {ins.severity} · {ins.type}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">{ins.insight}</p>
                </div>
              ))}
            </div>

            <div className="px-5 pb-4 pt-2">
              <Link
                href="/dashboard/chat"
                className="w-full block py-2 rounded-xl border border-[var(--border)]/50 bg-[var(--surface-0)] hover:bg-[var(--surface-2)] text-[12px] font-semibold text-[var(--text-primary)] text-center transition-colors"
              >
                Ask Drishti AI for Analysis →
              </Link>
            </div>
          </div>

        </div>
        {/* end RIGHT sidebar */}
      </div>
      {/* end main grid */}
    </div>
  );
}
