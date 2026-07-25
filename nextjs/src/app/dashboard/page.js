'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield,
  FileText, Camera, Users, MapPin, Activity, ArrowRight,
  Clock, ShieldAlert, CheckCircle2, ChevronRight, RefreshCw,
  WifiOff, Database, Sparkles, RotateCcw, Zap, Radio
} from 'lucide-react';

import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import {
  DEMO_FIRS,
  DEMO_HOTSPOTS,
  DEMO_TRENDS,
  DEMO_REPEAT_OFFENDERS,
  DEMO_AI_INSIGHTS
} from '@/lib/demo-data';

// ── Static fallback mock data ─────────────────────────────────────────────
const MOCK_FIRS = DEMO_FIRS.firs;
const MOCK_HOTSPOTS = DEMO_HOTSPOTS.hotspots;

// ── Color maps ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  open: 'badge-critical',
  under_investigation: 'badge-warning',
  chargesheeted: 'badge',
  closed: 'badge-success',
};
const STATUS_ICONS = {
  open: AlertTriangle,
  under_investigation: Clock,
  chargesheeted: ShieldAlert,
  closed: CheckCircle2,
};

// ── Skeleton component ─────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[var(--border)]/40 rounded-lg ${className}`} />
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data, colorClass }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 -10 100 120" className={`w-16 h-8 opacity-70 ${colorClass} drop-shadow-md`} preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────
function StatCard({ id, label, value, change, up, icon: Icon, color, bg, border, sparkline, delay, loading, noSource }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  if (loading) {
    return (
      <div className={`relative overflow-hidden glass-panel rounded-xl p-5 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-16 h-6 rounded-md" />
        </div>
        <Skeleton className="w-24 h-8 mb-2 rounded" />
        <Skeleton className="w-32 h-4 rounded" />
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`relative overflow-hidden glow-card rounded-xl p-5 transition-all duration-300 group hover:-translate-y-1 cursor-default
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center border ${border}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {noSource ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-semibold text-[var(--text-secondary)] bg-[var(--surface-0)] border border-[var(--border)]">
            <Database className="w-3 h-3" />
            OFFLINE
          </div>
        ) : (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider
            ${up ? 'text-[var(--status-success)] bg-[var(--status-success)]/10 border border-[var(--status-success)]/20' : 'text-[var(--status-critical)] bg-[var(--status-critical)]/10 border border-[var(--status-critical)]/20'}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-end justify-between">
        <div>
          <p className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">{value}</p>
          <p className="text-[11px] font-mono font-semibold text-[var(--text-secondary)] mt-1 uppercase tracking-wider">{label}</p>
        </div>
        {sparkline && !noSource && (
          <div className="pb-1">
            <Sparkline data={sparkline} colorClass={color} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── CachedBadge ───────────────────────────────────────────────────────────
function CachedBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--status-warning)]/10 border border-[var(--status-warning)]/30 text-[var(--status-warning)] text-[10px] font-mono font-semibold">
      <WifiOff className="w-3 h-3" />
      CACHED STREAM
    </div>
  );
}

// ── useLiveCounter ─────────────────────────────────────────────────────────
function useLiveCounter(baseValue, variance = 2, intervalMs = 10000) {
  const [value, setValue] = React.useState(baseValue);
  React.useEffect(() => {
    const id = setInterval(() => {
      const delta = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
      setValue(baseValue + delta);
    }, intervalMs + Math.random() * 5000);
    return () => clearInterval(id);
  }, [baseValue, variance, intervalMs]);
  return value;
}

// ── InsightCard ───────────────────────────────────────────────────────────
const INSIGHT_SEVERITY = {
  critical: { bar: 'bg-[var(--status-critical)]', badge: 'badge-critical', dot: 'bg-[var(--status-critical)]' },
  high:     { bar: 'bg-[var(--status-warning)]',  badge: 'badge-warning',  dot: 'bg-[var(--status-warning)]'  },
  medium:   { bar: 'bg-[var(--cyan-accent)]',     badge: 'badge',          dot: 'bg-[var(--cyan-accent)]'     },
};
const INSIGHT_TYPE_LABEL = {
  trend:       { emoji: '📈', label: 'Trend' },
  alert:       { emoji: '🚨', label: 'Alert' },
  opportunity: { emoji: '🎯', label: 'Lead'  },
};

function InsightCard({ insight, type, severity, index }) {
  const sev  = INSIGHT_SEVERITY[severity]  || INSIGHT_SEVERITY.medium;
  const kind = INSIGHT_TYPE_LABEL[type]    || INSIGHT_TYPE_LABEL.trend;
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80 + index * 120); return () => clearTimeout(t); }, [index]);

  return (
    <div className={`relative glass-panel rounded-xl overflow-hidden flex flex-col transition-all duration-500 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
    }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${sev.bar}`} />

      <div className="pl-5 pr-4 pt-4 pb-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            <span>{kind.emoji}</span>
            {kind.label}
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${sev.badge}`}>
            {severity}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed flex-1 font-sans">{insight}</p>

        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[var(--border)]">
          <div className={`w-1.5 h-1.5 rounded-full ${sev.dot} animate-pulse`} />
          <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">DRISHTI AI · Live Intelligence</span>
        </div>
      </div>
    </div>
  );
}

// ── Intel Ticker ──────────────────────────────────────────────────────────
const INTEL_FEED = [
  "🔴 ALERT: Vehicle KA-01-MJ-8821 spotted near Silk Board — ANPR triggered",
  "🟡 FIR-2026-BL-4921 status updated: Charge sheet filed by HSR Layout PS",
  "🔵 Camera CAM-BLR-0042 back online — Whitefield junction",
  "🔴 Repeat offender Ramesh Kumar last sighted: Koramangala, 14:22 hrs",
  "🟢 Night patrol deployment confirmed: 3 units assigned to MG Road corridor",
  "🟡 New FIR registered: Chain snatching near Indiranagar 100ft Road",
  "🔵 ANPR match: KA-05-HJ-3312 flagged on stolen vehicle watchlist",
  "🔴 Dark zone alert: Raichur district — 3 unreported incidents suspected",
];

function IntelTicker() {
  return (
    <div className="w-full overflow-hidden bg-[var(--surface-1)] border border-[var(--border)] rounded-lg py-2 px-0 mt-4">
      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
        {[...INTEL_FEED, ...INTEL_FEED].map((item, i) => (
          <span key={i} className="inline-block px-8 text-xs font-mono text-[var(--text-secondary)] border-r border-[var(--border)]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function DashboardOverview() {
  const [role, setRole] = useState('Inspector');
  const [activeTab, setActiveTab] = useState('all');

  // Live data state
  const [firs, setFirs] = useState(MOCK_FIRS);
  const [hotspots, setHotspots] = useState(MOCK_HOTSPOTS);
  const [trendData, setTrendData] = useState([142, 118, 167, 134, 189, 201]);
  const [totalFIRs, setTotalFIRs] = useState(492);
  const [highRiskCount, setHighRiskCount] = useState(38);
  const [overallTrend, setOverallTrend] = useState('stable');
  const [activeCameras, setActiveCameras] = useState(142);
  const [casesSolved, setCasesSolved] = useState(89);

  // Live counters
  const liveFIRs       = useLiveCounter(968, 2, 10000);
  const liveHotspots   = useLiveCounter(49,  1, 12000);
  const liveCameras    = useLiveCounter(847, 3, 11000);
  const liveOffenders  = useLiveCounter(12,  1, 14000);

  // UI state
  const [loading, setLoading] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [liveUpdated, setLiveUpdated] = useState('Just now');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let seconds = 0;
    const id = setInterval(() => {
      seconds += 30;
      if (seconds < 60) setLiveUpdated(`${seconds}s ago`);
      else if (seconds < 3600) setLiveUpdated(`${Math.floor(seconds / 60)}m ago`);
      else { seconds = 0; setLiveUpdated('Just now'); }
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // AI Insights state
  const [insights, setInsights]               = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError]     = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    setRole(localStorage.getItem('drishti_role') || 'Inspector');
  }, []);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const [firRes, hotRes, trendRes, offRes, cameraRes, solvedRes] = await Promise.all([
        fetchWithFallback('firs?limit=8', DEMO_FIRS),
        fetchWithFallback('hotspots', DEMO_HOTSPOTS),
        fetchWithFallback('trends', DEMO_TRENDS),
        fetchWithFallback('repeat-offenders?limit=50', DEMO_REPEAT_OFFENDERS),
        fetchWithFallback('cameras-nearby?lat=12.9716&lng=77.5946&radius_meters=10000', { total_found: 142 }),
        fetchWithFallback('firs?status=closed&limit=1', { total_count: 89 })
      ]);

      const isDemoMode = [firRes, hotRes, trendRes, offRes, cameraRes, solvedRes].some(r => r.source === 'demo');

      const firData = firRes.data;
      const firList = Array.isArray(firData) ? firData : (firData?.firs || DEMO_FIRS.firs);
      setFirs(firList.slice(0, 8));
      setTotalFIRs(firData?.total_count ?? DEMO_FIRS.total_count);

      const hotData = hotRes.data;
      const hotList = Array.isArray(hotData) ? hotData : (hotData?.hotspots || DEMO_HOTSPOTS.hotspots);
      setHotspots(hotList.slice(0, 5));

      const trendObj = trendRes.data;
      const tdList = Array.isArray(trendObj) ? trendObj : (trendObj?.trend_data || DEMO_TRENDS.trend_data);
      setTrendData(tdList.map(d => d.count || d.total || 0));
      setOverallTrend(trendObj?.overall_trend || DEMO_TRENDS.overall_trend);

      const offObj = offRes.data;
      setHighRiskCount(offObj?.high_risk_count ?? DEMO_REPEAT_OFFENDERS.high_risk_count);

      const cameraObj = cameraRes.data;
      setActiveCameras(cameraObj?.total_found ?? 142);

      const solvedObj = solvedRes.data;
      setCasesSolved(solvedObj?.total_count ?? 89);

      setUsingCache(isDemoMode);
      setLiveUpdated('Just now');
    } catch (err) {
      console.error('[Dashboard] Fetch error, using demo fallback:', err);
      setFirs(DEMO_FIRS.firs);
      setHotspots(DEMO_HOTSPOTS.hotspots);
      setTotalFIRs(DEMO_FIRS.total_count);
      setHighRiskCount(DEMO_REPEAT_OFFENDERS.high_risk_count);
      setTrendData(DEMO_TRENDS.trend_data.map(d => d.count));
      setActiveCameras(142);
      setCasesSolved(89);
      setUsingCache(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
    intervalRef.current = setInterval(() => fetchDashboardData(true), 60000);
    return () => clearInterval(intervalRef.current);
  }, [fetchDashboardData]);

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const { data, source } = await fetchWithFallback('askDrishtiAI', DEMO_AI_INSIGHTS, {
        method: 'POST',
        body: {
          question: 'Based on today\'s crime data, provide exactly 3 brief intelligence insights as a JSON array. Respond with ONLY a raw JSON array. Format: [{"insight": "...", "type": "trend|alert|opportunity", "severity": "critical|high|medium"}].',
          lang: 'en',
        },
        timeoutMs: 6000
      });

      if (source === 'demo' || !data) {
        setInsights(DEMO_AI_INSIGHTS);
        return;
      }

      const raw = (data.answer || data.content || '').trim()
                    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setInsights(parsed.slice(0, 3));
      } else {
        setInsights(DEMO_AI_INSIGHTS);
      }
    } catch (err) {
      console.warn('[Insights] Using DEMO_AI_INSIGHTS fallback:', err.message);
      setInsights(DEMO_AI_INSIGHTS);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    setInsights(DEMO_AI_INSIGHTS);
    const timer = setTimeout(() => fetchInsights(), 3000);
    return () => clearTimeout(timer);
  }, [fetchInsights]);

  const latestTrend = trendData.length >= 2
    ? trendData[trendData.length - 1] - trendData[trendData.length - 2]
    : 0;
  const latestPct = trendData.length >= 2 && trendData[trendData.length - 2] > 0
    ? ((latestTrend / trendData[trendData.length - 2]) * 100).toFixed(1)
    : null;

  const statCards = [
    {
      id: 'stat-total-firs',
      label: 'Total Active FIRs',
      value: loading ? '—' : liveFIRs.toLocaleString(),
      change: latestPct ? `${latestPct > 0 ? '+' : ''}${latestPct}%` : '—',
      up: latestTrend <= 0,
      icon: FileText,
      color: 'text-[var(--cyan-accent)]',
      bg: 'bg-[var(--cyan-accent)]/10',
      border: 'border-[var(--cyan-accent)]/20',
      sparkline: trendData,
      noSource: false,
    },
    {
      id: 'stat-active-cameras',
      label: 'Cameras Online',
      value: loading ? '—' : liveCameras.toLocaleString(),
      change: '+12',
      up: true,
      icon: Camera,
      color: 'text-[var(--status-success)]',
      bg: 'bg-[var(--status-success)]/10',
      border: 'border-[var(--status-success)]/20',
      sparkline: null,
      noSource: false,
    },
    {
      id: 'stat-high-risk',
      label: 'High-Risk Suspects',
      value: loading ? '—' : liveOffenders.toLocaleString(),
      change: '+3',
      up: false,
      icon: AlertTriangle,
      color: 'text-[var(--status-critical)]',
      bg: 'bg-[var(--status-critical)]/10',
      border: 'border-[var(--status-critical)]/20',
      sparkline: null,
      noSource: false,
    },
    {
      id: 'stat-hotspots',
      label: 'Active Hotspots',
      value: loading ? '—' : liveHotspots.toLocaleString(),
      change: '+4.2%',
      up: false,
      icon: MapPin,
      color: 'text-[var(--status-warning)]',
      bg: 'bg-[var(--status-warning)]/10',
      border: 'border-[var(--status-warning)]/20',
      sparkline: null,
      noSource: false,
    },
  ];

  const displayedFIRs = activeTab === 'all' ? firs : firs.filter(f => f.assignee === 'Me');

  const getSeverity = (score) => {
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };
  const SEVERITY_COLORS = {
    critical: 'bg-[var(--status-critical)]',
    high: 'bg-[var(--status-warning)]',
    medium: 'bg-[var(--cyan-accent)]',
    low: 'bg-[var(--status-success)]',
  };
  const maxHotspotCount = Math.max(...hotspots.map(h => h.crime_count || 1), 1);

  const dateDay = (str) => str ? str.split('-')[2] : '—';
  const dateMonth = (str) => {
    if (!str) return '—';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[parseInt(str.split('-')[1], 10) - 1] || '—';
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in">

      {/* ── Hero Welcome Section ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 glass-panel border border-[var(--border)] shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="beacon-dot" />
              <span className="text-[10px] font-mono font-bold text-[var(--cyan-accent)] uppercase tracking-widest">
                TACTICAL COMMAND CENTER ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2 font-sans">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {role}
            </h1>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-xl font-mono">
              Intelligence summary for{' '}
              <span className="text-[var(--text-primary)] font-semibold">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] font-mono text-xs">
              {usingCache && <CachedBadge />}
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
                Updated {liveUpdated}
              </span>
              <button
                id="btn-refresh-dashboard"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing || loading}
                className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text-primary)] transition-all text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s, idx) => (
          <StatCard key={s.id} {...s} delay={100 + idx * 100} loading={loading && !s.noSource} />
        ))}
      </div>

      {/* ── AI Intelligence Brief ── */}
      {(insightsLoading || insightsError || insights.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center border border-[var(--accent)]/30">
                <Sparkles className="w-4 h-4 text-[var(--accent-light)]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase tracking-widest">DRISHTI AI INTELLIGENCE BRIEF</h2>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono">Real-time analysis powered by Gemini 2.5 Engine</p>
              </div>
            </div>
            <button
              id="btn-refresh-insights"
              onClick={fetchInsights}
              disabled={insightsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] disabled:opacity-40 transition-all"
            >
              <RotateCcw className={`w-3 h-3 ${insightsLoading ? 'animate-spin' : ''}`} />
              {insightsLoading ? 'Analyzing...' : 'Re-analyze'}
            </button>
          </div>

          {insightsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="glass-panel rounded-xl p-4 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-16 h-4 rounded" />
                    <Skeleton className="w-12 h-4 rounded" />
                  </div>
                  <Skeleton className="w-full h-3 rounded" />
                  <Skeleton className="w-4/5 h-3 rounded" />
                </div>
              ))}
            </div>
          )}

          {!insightsLoading && insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((ins, idx) => (
                <InsightCard
                  key={idx}
                  index={idx}
                  insight={ins.insight}
                  type={ins.type}
                  severity={ins.severity}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column: Recent FIRs */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-1)]">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="w-9 h-9 rounded-lg bg-[var(--cyan-accent)]/15 text-[var(--cyan-accent)] flex items-center justify-center border border-[var(--cyan-accent)]/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">Live Case Feed</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                    {loading ? 'Loading...' : `${firs.length} Active Records`}
                  </p>
                </div>
              </div>

              <div className="flex bg-[var(--surface-0)] p-1 rounded-lg border border-[var(--border)]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${activeTab === 'all' ? 'bg-[var(--surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}
                >
                  All Cases
                </button>
                <button
                  onClick={() => setActiveTab('me')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${activeTab === 'me' ? 'bg-[var(--surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}
                >
                  Assigned
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-5 p-5">
                    <Skeleton className="hidden sm:block w-14 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-48 h-4 rounded" />
                      <Skeleton className="w-36 h-5 rounded" />
                    </div>
                  </div>
                ))
              ) : displayedFIRs.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-[var(--text-secondary)]">
                  No cases found for active filter.
                </div>
              ) : (
                displayedFIRs.map((fir) => {
                  const statusKey = fir.status || fir.case_status || 'open';
                  const StatusIcon = STATUS_ICONS[statusKey] || AlertTriangle;
                  return (
                    <Link key={fir.case_number} href={`/dashboard/fir/${fir.case_number}`} className="group flex items-center justify-between p-4 sm:p-5 hover:bg-[var(--surface-2)]/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-center justify-center w-12 py-2 rounded-md bg-[var(--surface-0)] border border-[var(--border)] flex-shrink-0">
                          <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono font-bold">{dateMonth(fir.date_filed)}</span>
                          <span className="text-base font-bold text-[var(--text-primary)] font-mono">{dateDay(fir.date_filed)}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-xs font-mono font-bold text-[var(--cyan-accent)] group-hover:underline">
                              {fir.case_number}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${STATUS_COLORS[statusKey] || STATUS_COLORS.open}`}>
                              {statusKey.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-[var(--text-primary)] capitalize mb-1">
                            {(fir.crime_type_code || fir.crime_type || 'Unknown').replace(/_/g, ' ')}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {fir.district_name || fir.district || '—'}
                            </span>
                            {fir.police_station && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/40" />
                                <span>{fir.police_station}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-1)]">
              <Link href="/dashboard/logs" className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[var(--surface-0)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono font-semibold transition-all">
                <span>Query full archives via DRISHTI AI</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--cyan-accent)]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Hotspots & Tip */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-[var(--border)] bg-[var(--surface-1)]">
              <div className="w-9 h-9 rounded-lg bg-[var(--status-critical)]/15 text-[var(--status-critical)] flex items-center justify-center border border-[var(--status-critical)]/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">Crime Hotspots</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                  High Frequency Precincts
                </p>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="w-32 h-4 rounded" />
                      <Skeleton className="w-12 h-4 rounded" />
                    </div>
                    <Skeleton className="w-full h-1.5 rounded-full" />
                  </div>
                ))
              ) : (
                hotspots.map((h, i) => {
                  const sev = getSeverity(h.severity_score ?? 5);
                  const pct = ((h.crime_count / maxHotspotCount) * 100).toFixed(1);
                  return (
                    <div key={i} className="group cursor-default">
                      <div className="flex items-end justify-between mb-1.5">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan-accent)] transition-colors font-mono">
                            {h.area_name || h.area || '—'}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">{h.district}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold font-mono text-[var(--text-primary)]">{h.crime_count}</span>
                          <span className="text-[9px] text-[var(--text-secondary)] font-mono ml-1">incidents</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--surface-0)] rounded-full overflow-hidden border border-[var(--border)]">
                        <div
                          className={`h-full rounded-full ${SEVERITY_COLORS[sev]} transition-all duration-1000 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-1)]">
              <Link href="/dashboard/map" className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[var(--surface-0)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono font-semibold transition-all">
                <span>Interactive Hotspot Map</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--cyan-accent)]" />
              </Link>
            </div>
          </div>

          {/* System Tip */}
          <div className="glass-panel rounded-xl p-5 border border-[var(--cyan-accent)]/20 bg-[var(--cyan-accent)]/5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[var(--cyan-accent)] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono mb-1">VOICE CO-PILOT COMMANDS</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                  Click the floating Orb or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] font-mono text-[10px]">Space</kbd> to launch Drishti AI. Speak queries in English or Kannada.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Intel Feed Ticker ── */}
      <IntelTicker />

    </div>
  );
}

