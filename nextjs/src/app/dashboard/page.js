'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield,
  FileText, Camera, Users, MapPin, Activity, ArrowRight,
  Clock, ShieldAlert, CheckCircle2, ChevronRight, RefreshCw,
  WifiOff, Database, Sparkles, RotateCcw
} from 'lucide-react';

import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import {
  DEMO_FIRS,
  DEMO_HOTSPOTS,
  DEMO_TRENDS,
  DEMO_REPEAT_OFFENDERS,
  DEMO_AI_INSIGHTS
} from '@/lib/demo-data';

// ── Static fallback mock data (safety net — shown if fetch fails) ─────────
const MOCK_FIRS = DEMO_FIRS.firs;
const MOCK_HOTSPOTS = DEMO_HOTSPOTS.hotspots;

// ── Color maps ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  open: 'bg-critical-500/15 text-critical-500 border-critical-500/30',
  under_investigation: 'bg-warn-500/15 text-warn-500 border-warn-500/30',
  chargesheeted: 'bg-phosphor-500/15 text-phosphor-500 border-phosphor-500/30',
  closed: 'bg-success-500/15 text-success-500 border-success-500/30',
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
    <div className={`animate-pulse bg-steel-600/40 rounded-lg ${className}`} />
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
    <svg viewBox="0 -10 100 120" className={`w-16 h-8 opacity-60 ${colorClass} drop-shadow-md`} preserveAspectRatio="none">
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
      <div className={`relative overflow-hidden glass-card rounded-2xl p-6 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-start justify-between mb-6">
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
      className={`relative overflow-hidden glass-card rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 cursor-default
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {noSource ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-paper-100/30 bg-steel-600/30 border border-steel-600/40">
            <Database className="w-3 h-3" />
            No endpoint
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold
            ${up ? 'text-success-500 bg-success-500/10' : 'text-critical-500 bg-critical-500/10'}`}>
            {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {change}
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-end justify-between">
        <div>
          <p className="text-3xl font-black text-paper-100 font-mono tracking-tight">{value}</p>
          <p className="text-sm font-semibold text-paper-100/50 mt-1 uppercase tracking-wider">{label}</p>
          {noSource && <p className="text-[10px] text-paper-100/25 mt-1 italic">No live data source available</p>}
        </div>
        {sparkline && !noSource && (
          <div className="pb-2">
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
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warn-500/10 border border-warn-500/30 text-warn-500 text-xs font-semibold">
      <WifiOff className="w-3.5 h-3.5" />
      Showing cached data
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
  critical: { bar: 'bg-critical-500', badge: 'bg-critical-500/15 text-critical-500 border-critical-500/30', dot: 'bg-critical-500' },
  high:     { bar: 'bg-warn-500',     badge: 'bg-warn-500/15 text-warn-500 border-warn-500/30',             dot: 'bg-warn-500'     },
  medium:   { bar: 'bg-phosphor-500', badge: 'bg-phosphor-500/15 text-phosphor-500 border-phosphor-500/30', dot: 'bg-phosphor-500' },
};
const INSIGHT_TYPE_LABEL = {
  trend:       { emoji: '\u{1F4C8}', label: 'Trend' },
  alert:       { emoji: '\u{1F6A8}', label: 'Alert' },
  opportunity: { emoji: '\u{1F3AF}', label: 'Lead'  },
};

function InsightCard({ insight, type, severity, index }) {
  const sev  = INSIGHT_SEVERITY[severity]  || INSIGHT_SEVERITY.medium;
  const kind = INSIGHT_TYPE_LABEL[type]    || INSIGHT_TYPE_LABEL.trend;
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80 + index * 120); return () => clearTimeout(t); }, [index]);

  return (
    <div className={`relative glass-card rounded-xl overflow-hidden border border-steel-600/40 flex flex-col transition-all duration-500 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
    }`}>
      {/* Severity bar on the left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${sev.bar}`} />

      <div className="pl-5 pr-4 pt-4 pb-3 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-paper-100/50 uppercase tracking-widest">
            <span>{kind.emoji}</span>
            {kind.label}
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${sev.badge}`}>
            {severity}
          </span>
        </div>

        {/* Insight text */}
        <p className="text-sm text-paper-100/85 leading-relaxed flex-1">{insight}</p>

        {/* Footer */}
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-steel-600/30">
          <div className={`w-1.5 h-1.5 rounded-full ${sev.dot} animate-pulse`} />
          <span className="text-[9px] font-bold text-paper-100/30 uppercase tracking-widest">DRISHTI AI · Live Analysis</span>
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
    <div className="w-full overflow-hidden bg-void-000/60 border border-steel-600/30 rounded-lg py-2 px-0 mt-4">
      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
        {[...INTEL_FEED, ...INTEL_FEED].map((item, i) => (
          <span key={i} className="inline-block px-8 text-xs font-mono text-paper-100/60 border-r border-steel-600/20">
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

  // ── Live counters (tick ±1 every ~10s to simulate live data) ──────────
  const liveFIRs       = useLiveCounter(968, 2, 10000);
  const liveHotspots   = useLiveCounter(49,  1, 12000);
  const liveCameras    = useLiveCounter(847, 3, 11000);
  const liveOffenders  = useLiveCounter(12,  1, 14000);

  // UI state
  const [loading, setLoading] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [liveUpdated, setLiveUpdated] = useState('Just now');
  const [refreshing, setRefreshing] = useState(false);

  // Live "last updated" ticker
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

      // FIRs
      const firData = firRes.data;
      const firList = Array.isArray(firData) ? firData : (firData?.firs || DEMO_FIRS.firs);
      setFirs(firList.slice(0, 8));
      setTotalFIRs(firData?.total_count ?? DEMO_FIRS.total_count);

      // Hotspots
      const hotData = hotRes.data;
      const hotList = Array.isArray(hotData) ? hotData : (hotData?.hotspots || DEMO_HOTSPOTS.hotspots);
      setHotspots(hotList.slice(0, 5));

      // Trends — extract sparkline counts and overall trend
      const trendObj = trendRes.data;
      const tdList = Array.isArray(trendObj) ? trendObj : (trendObj?.trend_data || DEMO_TRENDS.trend_data);
      setTrendData(tdList.map(d => d.count || d.total || 0));
      setOverallTrend(trendObj?.overall_trend || DEMO_TRENDS.overall_trend);

      // Repeat offenders → high risk count
      const offObj = offRes.data;
      setHighRiskCount(offObj?.high_risk_count ?? DEMO_REPEAT_OFFENDERS.high_risk_count);

      // Active Cameras
      const cameraObj = cameraRes.data;
      setActiveCameras(cameraObj?.total_found ?? 142);

      // Cases Solved
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

  // Initial fetch + 60s auto-refresh
  useEffect(() => {
    fetchDashboardData(false);
    intervalRef.current = setInterval(() => fetchDashboardData(true), 60000);
    return () => clearInterval(intervalRef.current);
  }, [fetchDashboardData]);

  // ── AI Insights: non-blocking, deferred 3s after mount ────────────────────
  // Show demo insights immediately; replace with live data if API responds.
  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const { data, source } = await fetchWithFallback('askDrishtiAI', DEMO_AI_INSIGHTS, {
        method: 'POST',
        body: {
          question: 'Based on today\'s crime data, provide exactly 3 brief intelligence insights as a JSON array. Each insight must be 1-2 sentences, focused on actionable patrol or investigation leads. Respond with ONLY a raw JSON array — no markdown, no explanation, no code fences. Format: [{"insight": "...", "type": "trend|alert|opportunity", "severity": "critical|high|medium"}]. Focus on: unusual crime hotspots, repeat offender activity, or emerging patterns.',
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

  // Show demo insights immediately, then kick off live fetch after 3s
  // so it doesn't compete with critical data on page load.
  useEffect(() => {
    setInsights(DEMO_AI_INSIGHTS); // instant render — no loading flash
    const timer = setTimeout(() => fetchInsights(), 3000);
    return () => clearTimeout(timer);
  }, [fetchInsights]);


  // ── Derived stat cards ─────────────────────────────────────────────────
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
      color: 'text-phosphor-500',
      bg: 'bg-phosphor-500/15',
      border: 'border-phosphor-500/30',
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
      color: 'text-success-500',
      bg: 'bg-success-500/15',
      border: 'border-success-500/30',
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
      color: 'text-critical-500',
      bg: 'bg-critical-500/15',
      border: 'border-critical-500/30',
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
      color: 'text-warn-500',
      bg: 'bg-warn-500/15',
      border: 'border-warn-500/30',
      sparkline: null,
      noSource: false,
    },
  ];

  const displayedFIRs = activeTab === 'all' ? firs : firs.filter(f => f.assignee === 'Me');

  // Hotspot severity from score
  const getSeverity = (score) => {
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };
  const SEVERITY_COLORS = {
    critical: 'bg-critical-500',
    high: 'bg-warn-500',
    medium: 'bg-phosphor-500',
    low: 'bg-success-500',
  };
  const maxHotspotCount = Math.max(...hotspots.map(h => h.crime_count || 1), 1);

  const formatTime = (d) => d
    ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;
  const dateDay = (str) => str ? str.split('-')[2] : '—';
  const dateMonth = (str) => {
    if (!str) return '—';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[parseInt(str.split('-')[1], 10) - 1] || '—';
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in">

      {/* ── Hero Welcome Section ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-steel-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-paper-100 tracking-tight mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {role}
            </h1>
            <p className="text-paper-100/60 text-base max-w-xl">
              Welcome to the DRISHTI Command Center. Here is the latest intelligence brief for{' '}
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* System status */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-void-000 border border-steel-600">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-50 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
              </div>
              <p className="text-xs font-medium text-paper-100/80 uppercase tracking-widest">System Status: Online</p>
            </div>

            {/* Live updated ticker + refresh */}
            <div className="flex items-center gap-2">
              {usingCache && <CachedBadge />}
              <span className="flex items-center gap-1.5 text-xs text-paper-100/40 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-phosphor-500 animate-pulse" />
                LIVE · Updated {liveUpdated}
              </span>
              <button
                id="btn-refresh-dashboard"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing || loading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-paper-100/50 hover:text-paper-100 hover:bg-steel-600/50 transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((s, idx) => (
          <StatCard key={s.id} {...s} delay={100 + idx * 100} loading={loading && !s.noSource} />
        ))}
      </div>

      {/* ── AI Intelligence Brief ── */}
      {(insightsLoading || insightsError || insights.length > 0) && (
        <section className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-phosphor-500/15 flex items-center justify-center border border-phosphor-500/30">
                <Sparkles className="w-4 h-4 text-phosphor-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-paper-100 font-mono uppercase tracking-widest">AI Intelligence Brief</h2>
                <p className="text-[10px] text-paper-100/40">Real-time analysis by DRISHTI AI · Powered by Gemini</p>
              </div>
            </div>
            <button
              id="btn-refresh-insights"
              onClick={fetchInsights}
              disabled={insightsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-steel-600/50 text-xs font-mono text-paper-100/50 hover:text-paper-100 hover:border-phosphor-500/40 hover:bg-phosphor-500/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <RotateCcw className={`w-3 h-3 ${insightsLoading ? 'animate-spin' : ''}`} />
              {insightsLoading ? 'Thinking…' : 'Refresh Insights'}
            </button>
          </div>

          {/* Loading skeletons */}
          {insightsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="glass-card rounded-xl border border-steel-600/40 p-5 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-16 h-4 rounded" />
                    <Skeleton className="w-12 h-4 rounded-full" />
                  </div>
                  <Skeleton className="w-full h-3 rounded" />
                  <Skeleton className="w-4/5 h-3 rounded" />
                  <Skeleton className="w-2/3 h-3 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {insightsError && !insightsLoading && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warn-500/10 border border-warn-500/25 text-warn-500 text-xs font-semibold w-fit">
              <AlertTriangle className="w-3.5 h-3.5" />
              {insightsError}
            </div>
          )}

          {/* Insight cards */}
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column: Recent FIRs */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-steel-600 bg-void-000">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-phosphor-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-paper-100">Live Case Feed</h3>
                  <p className="text-xs text-paper-100/50 uppercase tracking-wider">
                    {loading ? 'Loading…' : `${firs.length} recently logged FIRs`}
                  </p>
                </div>
              </div>

              <div className="flex bg-steel-600 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'all' ? 'bg-steel-700 shadow-sm text-paper-100' : 'text-paper-100/50 hover:text-paper-100'}`}
                >
                  All Cases
                </button>
                <button
                  onClick={() => setActiveTab('me')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'me' ? 'bg-steel-700 shadow-sm text-paper-100' : 'text-paper-100/50 hover:text-paper-100'}`}
                >
                  Assigned to Me
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto divide-y divide-steel-600">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-5 p-5">
                    <Skeleton className="hidden sm:block w-14 h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-48 h-4 rounded" />
                      <Skeleton className="w-36 h-5 rounded" />
                      <Skeleton className="w-56 h-3 rounded" />
                    </div>
                  </div>
                ))
              ) : displayedFIRs.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-paper-100/50">No cases found for this filter.</p>
                </div>
              ) : (
                displayedFIRs.map((fir) => {
                  const statusKey = fir.status || fir.case_status || 'open';
                  const StatusIcon = STATUS_ICONS[statusKey] || AlertTriangle;
                  return (
                    <Link key={fir.case_number} href={`/dashboard/fir/${fir.case_number}`} className="group flex items-center justify-between p-5 hover:bg-steel-600/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-5">
                        <div className="hidden sm:flex flex-col items-center justify-center w-14 py-2 rounded-lg bg-steel-600/20 border border-steel-600/30 group-hover:border-phosphor-500/30 transition-colors flex-shrink-0">
                          <span className="text-[10px] text-paper-100/40 uppercase font-bold">{dateMonth(fir.date_filed)}</span>
                          <span className="text-lg font-black text-paper-100 font-mono">{dateDay(fir.date_filed)}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-mono font-bold text-phosphor-500 group-hover:text-phosphor-400 transition-colors">
                              {fir.case_number}
                            </p>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLORS[statusKey] || STATUS_COLORS.open}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusKey.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 className="text-base font-semibold text-paper-100 capitalize mb-1">
                            {(fir.crime_type_code || fir.crime_type || 'Unknown').replace(/_/g, ' ')}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-paper-100/50">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {fir.district_name || fir.district || '—'}
                            </span>
                            {fir.police_station && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-steel-600/50" />
                                <span>{fir.police_station}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-paper-100/20 group-hover:text-paper-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-steel-600 bg-void-000">
              <Link href="/dashboard/logs" className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-phosphor-500 text-sm font-semibold transition-all">
                Query via AI Co-Pilot <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Hotspots & Tip */}
        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-steel-600 bg-void-000">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-critical-500 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-paper-100">Crime Hotspots</h3>
                <p className="text-xs text-paper-100/50 uppercase tracking-wider">
                  {loading ? 'Loading…' : 'High Frequency Zones'}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
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
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-paper-100 group-hover:text-phosphor-500 transition-colors">
                            {h.area_name || h.area || '—'}
                          </p>
                          <p className="text-[11px] text-paper-100/50 uppercase tracking-widest mt-0.5">{h.district}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black font-mono text-paper-100">{h.crime_count}</span>
                          <span className="text-[10px] text-paper-100/40 ml-1">incidents</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-steel-600 rounded-full overflow-hidden mt-2">
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

            <div className="p-4 border-t border-steel-600 bg-void-000">
              <Link href="/dashboard/map" className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-steel-600 hover:bg-steel-600/80 text-paper-100 text-sm font-semibold transition-all">
                Open Full Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* System Tip */}
          <div className="glass-card rounded-2xl p-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
            <div className="relative z-10 flex items-start gap-4">
              <div className="mt-1">
                <Shield className="w-6 h-6 text-phosphor-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-paper-100 mb-1">Tip: Voice Commands</h4>
                <p className="text-xs text-paper-100/70 leading-relaxed">
                  Hold the spacebar anywhere on the dashboard to activate Drishti. Try asking{' '}
                  <em>&quot;Show me hotspots in Bengaluru&quot;</em> or{' '}
                  <em>&quot;Any new cases assigned to me?&quot;</em>
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
