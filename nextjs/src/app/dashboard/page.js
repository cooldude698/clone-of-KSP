'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield,
  FileText, Camera, Users, MapPin, Activity, ArrowRight,
  Clock, ShieldAlert, CheckCircle2, ChevronRight, RefreshCw,
  WifiOff, Database, Sparkles, RotateCcw, Zap, Radio,
  BarChart3, Eye, Filter, ArrowUpRight, Flame
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
    <svg viewBox="0 -10 100 120" className={`w-16 h-8 opacity-90 ${colorClass} drop-shadow-md`} preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ── StatCard Component ─────────────────────────────────────────────────────
function StatCard({ id, label, value, change, up, icon: Icon, color, bg, border, sparkline, delay, loading, noSource }) {
  if (loading) {
    return (
      <div className="relative overflow-hidden glass-panel rounded-xl p-5 border border-[var(--border)]">
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
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative overflow-hidden rounded-xl p-5 cursor-pointer glass-panel border border-[var(--border)] shadow-xl group transition-all"
    >
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center border ${border} shadow-inner`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {noSource ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-[var(--text-secondary)] bg-[var(--surface-0)] border border-[var(--border)]">
            <Database className="w-3 h-3" />
            OFFLINE
          </div>
        ) : (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm
            ${up ? 'text-[var(--status-success)] bg-[var(--status-success)]/15 border border-[var(--status-success)]/30' : 'text-[var(--status-critical)] bg-[var(--status-critical)]/15 border border-[var(--status-critical)]/30'}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-end justify-between">
        <div>
          <p className="text-3xl font-black text-[var(--text-primary)] font-mono tracking-tight group-hover:text-[var(--cyan-accent)] transition-colors">{value}</p>
          <p className="text-[11px] font-mono font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-wider">{label}</p>
        </div>
        {sparkline && !noSource && (
          <div className="pb-1">
            <Sparkline data={sparkline} colorClass={color} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── CachedBadge ───────────────────────────────────────────────────────────
function CachedBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--status-warning)]/15 border border-[var(--status-warning)]/30 text-[var(--status-warning)] text-[10px] font-mono font-bold">
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

// ── InsightCard Component ──────────────────────────────────────────────────
const INSIGHT_SEVERITY = {
  critical: { bar: 'bg-[var(--status-critical)]', badge: 'badge-critical' },
  high:     { bar: 'bg-[var(--status-warning)]',  badge: 'badge-warning' },
  medium:   { bar: 'bg-[var(--cyan-accent)]',     badge: 'badge' },
};

const INSIGHT_TYPE_LABEL = {
  trend:       { emoji: '📈', label: 'Trend' },
  alert:       { emoji: '🚨', label: 'Alert' },
  opportunity: { emoji: '🎯', label: 'Lead'  },
};

function InsightCard({ insight, type, severity, index }) {
  const sev  = INSIGHT_SEVERITY[severity]  || INSIGHT_SEVERITY.medium;
  const kind = INSIGHT_TYPE_LABEL[type]    || INSIGHT_TYPE_LABEL.trend;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative rounded-xl overflow-hidden flex flex-col glass-panel border border-[var(--border)] shadow-lg group transition-all"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sev.bar}`} />

      <div className="pl-5 pr-4 pt-4 pb-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            <span>{kind.emoji}</span>
            {kind.label}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${sev.badge}`}>
            {severity}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed flex-1 font-sans font-medium">{insight}</p>
      </div>
    </motion.div>
  );
}

// ── Intel Ticker Component ─────────────────────────────────────────────────
function IntelTicker() {
  const tickerItems = [
    'ANPR Alert: White SUV KA-01-MJ-8821 flagged near South Precinct',
    'AI Forecast: Property offences projected +6.2% in Koramangala block next 48h',
    'System: 94.2% Surveillance Coverage across 14 Sector Hubs',
    'Patrol Unit 04 dispatched to Electronic City Phase 1 checkpoint',
  ];
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--surface-1)] border border-[var(--border)] py-2.5 px-4 flex items-center gap-3 shadow-inner">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--cyan-accent)] shrink-0 bg-[var(--cyan-accent)]/15 px-2.5 py-1 rounded-md border border-[var(--cyan-accent)]/30">
        <Flame className="w-3.5 h-3.5 text-[var(--cyan-accent)] animate-pulse" />
        INTEL FEED
      </div>
      <div className="overflow-hidden whitespace-nowrap flex-1">
        <motion.div
          animate={{ x: ['0%', '-100%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="inline-flex gap-8 text-xs font-mono text-[var(--text-secondary)]"
        >
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-accent)]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Main Dashboard Component ───────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [firs, setFirs] = useState(MOCK_FIRS);
  const [hotspots, setHotspots] = useState(MOCK_HOTSPOTS);
  const [trendData, setTrendData] = useState(DEMO_TRENDS.trend_data.map(d => d.count || d.total || 0));
  const [repeatOffenders, setRepeatOffenders] = useState(DEMO_REPEAT_OFFENDERS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [role, setRole] = useState('Inspector');

  const liveFIRs = useLiveCounter(1428, 3, 12000);
  const liveCameras = useLiveCounter(348, 1, 15000);
  const liveOffenders = useLiveCounter(42, 1, 20000);
  const liveHotspots = useLiveCounter(18, 1, 18000);

  const [insights, setInsights] = useState(DEMO_AI_INSIGHTS);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('drishti_role') || 'Inspector');
    }
  }, []);

  const fetchDashboardData = useCallback(async (isManualSync = false) => {
    if (isManualSync) setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setInsights(DEMO_AI_INSIGHTS);
    setInsightsLoading(false);
  }, []);

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
      bg: 'bg-[var(--cyan-accent)]/15',
      border: 'border-[var(--cyan-accent)]/30',
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
      bg: 'bg-[var(--status-success)]/15',
      border: 'border-[var(--status-success)]/30',
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
      bg: 'bg-[var(--status-critical)]/15',
      border: 'border-[var(--status-critical)]/30',
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
      bg: 'bg-[var(--status-warning)]/15',
      border: 'border-[var(--status-warning)]/30',
      sparkline: null,
      noSource: false,
    },
  ];

  const displayedFIRs = activeTab === 'all' ? firs : firs.filter(f => f.assignee === 'Me');

  const getSeverity = (score) => {
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high';
    return 'medium';
  };
  const SEVERITY_BARS = {
    critical: 'bg-[var(--status-critical)]',
    high: 'bg-[var(--status-warning)]',
    medium: 'bg-[var(--cyan-accent)]',
  };
  const maxHotspotCount = Math.max(...hotspots.map(h => h.crime_count || 1), 1);

  const dateDay = (str) => str ? str.split('-')[2] : '—';
  const dateMonth = (str) => {
    if (!str) return '—';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[parseInt(str.split('-')[1], 10) - 1] || '—';
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto text-[var(--text-primary)]">

      {/* ── Hero Welcome Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 glass-panel border border-[var(--border)] shadow-2xl"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="beacon-dot" />
              <span className="text-[11px] font-mono font-extrabold text-[var(--cyan-accent)] uppercase tracking-widest bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--border)]">
                DRISHTI AI TACTICAL COMMAND CENTER
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2 font-headline">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {role}
            </h1>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-xl font-mono">
              Live intelligence summary for{' '}
              <span className="text-[var(--text-primary)] font-bold">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push('/dashboard/chat')}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Launch Drishti Co-Pilot</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push('/dashboard/analytics')}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-[var(--cyan-accent)]" />
              <span>Analytics Report</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing || loading}
              className="btn-secondary flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[var(--status-success)] border border-[var(--status-success)]/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s, idx) => (
          <StatCard key={s.id} {...s} delay={100 + idx * 100} loading={loading && !s.noSource} />
        ))}
      </div>

      {/* ── AI Intelligence Brief ── */}
      {(insightsLoading || insights.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center border border-[var(--accent)]/30 shadow-inner">
                <Sparkles className="w-5 h-5 text-[var(--accent-light)] animate-pulse" />
              </div>
              <div>
                <h2 className="text-xs font-black text-[var(--text-primary)] font-mono uppercase tracking-widest">DRISHTI AI INTELLIGENCE BRIEF</h2>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono">Real-time predictive analytics powered by Gemini Engine</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchInsights}
              disabled={insightsLoading}
              className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono disabled:opacity-50 transition-all cursor-pointer"
            >
              <RotateCcw className={`w-3 h-3 ${insightsLoading ? 'animate-spin' : ''}`} />
              {insightsLoading ? 'Analyzing...' : 'Re-analyze'}
            </motion.button>
          </div>

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
        </section>
      )}

      {/* ── Main Dashboard Layout Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column: Recent Live Cases */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-panel rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col h-full shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-1)]">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--cyan-accent)]/15 text-[var(--cyan-accent)] flex items-center justify-center border border-[var(--cyan-accent)]/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">Live Case Feed</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                    {loading ? 'Loading Feed...' : `${firs.length} Active Records Logged`}
                  </p>
                </div>
              </div>

              <div className="flex bg-[var(--surface-0)] p-1 rounded-xl border border-[var(--border)]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${activeTab === 'all' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  All Cases
                </button>
                <button
                  onClick={() => setActiveTab('me')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${activeTab === 'me' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  Assigned Cases
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-5 p-5">
                    <Skeleton className="w-14 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-48 h-4 rounded" />
                      <Skeleton className="w-36 h-5 rounded" />
                    </div>
                  </div>
                ))
              ) : displayedFIRs.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-[var(--text-secondary)]">
                  No cases found matching active filter.
                </div>
              ) : (
                displayedFIRs.map((fir) => {
                  const statusKey = fir.status || fir.case_status || 'open';
                  const StatusIcon = STATUS_ICONS[statusKey] || AlertTriangle;
                  return (
                    <Link
                      key={fir.case_number}
                      href={`/dashboard/fir/${fir.case_number}`}
                      className="group flex items-center justify-between p-4 sm:p-5 hover:bg-[var(--surface-2)]/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-center justify-center w-12 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] flex-shrink-0 shadow-inner">
                          <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono font-bold">{dateMonth(fir.date_filed)}</span>
                          <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">{dateDay(fir.date_filed)}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-xs font-mono font-extrabold text-[var(--cyan-accent)] group-hover:underline">
                              {fir.case_number}
                            </p>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${STATUS_COLORS[statusKey] || STATUS_COLORS.open}`}>
                              {statusKey.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)] capitalize mb-1 font-headline">
                            {(fir.crime_type_code || fir.crime_type || 'Unknown').replace(/_/g, ' ')}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[var(--status-warning)]" />
                              {fir.district_name || fir.district || '—'}
                            </span>
                            {fir.police_station && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                                <span>{fir.police_station}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-1)]">
              <Link
                href="/dashboard/logs"
                className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--surface-0)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono font-bold transition-all shadow-sm"
              >
                <span>Query Full Archives & Evidence via DRISHTI AI</span>
                <ArrowRight className="w-4 h-4 text-[var(--cyan-accent)] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Crime Hotspots & Quick Assist */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-panel rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-3 p-5 border-b border-[var(--border)] bg-[var(--surface-1)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--status-critical)]/15 text-[var(--status-critical)] flex items-center justify-center border border-[var(--status-critical)]/30">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">Crime Hotspots</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                  High Frequency Precinct Patrols
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
                    <Skeleton className="w-full h-2 rounded-full" />
                  </div>
                ))
              ) : (
                hotspots.map((h, i) => {
                  const sev = getSeverity(h.severity_score ?? 5);
                  const pct = ((h.crime_count / maxHotspotCount) * 100).toFixed(1);
                  return (
                    <div key={i} className="group cursor-pointer">
                      <div className="flex items-end justify-between mb-1.5">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan-accent)] transition-colors font-mono">
                            {h.area_name || h.area || '—'}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">{h.district}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black font-mono text-[var(--text-primary)]">{h.crime_count}</span>
                          <span className="text-[9px] text-[var(--text-secondary)] font-mono ml-1">incidents</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[var(--surface-0)] rounded-full overflow-hidden border border-[var(--border)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${SEVERITY_BARS[sev]}`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-1)]">
              <Link
                href="/dashboard/map"
                className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--surface-0)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono font-bold transition-all shadow-sm"
              >
                <span>Interactive Hotspot Map</span>
                <ArrowRight className="w-4 h-4 text-[var(--cyan-accent)] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Quick Voice Command Helper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl p-5 border border-[var(--cyan-accent)]/30 bg-[var(--surface-1)] shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono mb-1">VOICE CO-PILOT COMMANDS</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                  Click the floating Orb or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] font-mono text-[10px] font-bold text-[var(--text-primary)]">Ctrl+Alt</kbd> <span className="text-[10px]">(Win/Linux)</span> / <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] font-mono text-[10px] font-bold text-[var(--text-primary)]">⌘+Shift</kbd> <span className="text-[10px]">(Mac)</span> to activate Voice Push-to-Talk.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* ── Intel Feed Ticker ── */}
      <IntelTicker />

      {/* Today's Intel Brief */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-[var(--status-critical)]" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-[var(--text-primary)]">Today's Intel Brief</h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--border)]">
            AUTO-GENERATED · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="p-6 space-y-3">
          {[
            { severity: 'critical', icon: '🔴', text: 'SUS-8842 (Ramesh Kumar) ANPR hit confirmed — Silk Board Junction 14:22 hrs. Watchlist active. Patrol units alerted.' },
            { severity: 'warn',    icon: '🟡', text: '3 new vehicle theft FIRs registered — Koramangala, HSR Layout, Electronic City. Pattern matches Bullet Ramesh MO.' },
            { severity: 'warn',    icon: '🟡', text: 'CAM-BLR-0042 face match: Suresh Naidu (SUS-7104) spotted Koramangala 14:28. Highway patrol notified.' },
            { severity: 'info',    icon: '🔵', text: 'Dark zone alert: Raichur district — underreporting index 75.0. Beat policing gaps suspected. Field verification requested.' },
            { severity: 'success', icon: '🟢', text: 'Charge sheet filed: FIR-2026-BL-4921. Case moved to prosecution. Court date pending assignment.' },
          ].map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
              item.severity === 'critical' ? 'bg-[var(--status-critical)]/8 border-[var(--status-critical)]/20' :
              item.severity === 'warn'    ? 'bg-[var(--status-warning)]/8 border-[var(--status-warning)]/20' :
              item.severity === 'success' ? 'bg-[var(--status-success)]/8 border-[var(--status-success)]/20' :
              'bg-[var(--surface-2)] border-[var(--border)]'
            }`}>
              <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
              <p className="text-xs font-mono text-[var(--text-primary)] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

