'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Eye,
  Layers,
  Sparkles,
  Fingerprint,
  GitBranch,
  FileText,
  MapPin,
  RefreshCw,
  Clock,
  Radio,
  BarChart2,
  PieChart as PieIcon,
  Filter
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalystTelemetry } from '@/context/AnalystTelemetryContext';
import { DEMO_FIRS } from '@/lib/demo-data';

// Weekly Forecast Data (Actual vs ML Forecast)
const FORECAST_TREND_DATA = [
  { day: 'Mon', actual: 48, forecast: 46, confidence: 96 },
  { day: 'Tue', actual: 52, forecast: 50, confidence: 95 },
  { day: 'Wed', actual: 44, forecast: 47, confidence: 97 },
  { day: 'Thu', actual: 61, forecast: 58, confidence: 94 },
  { day: 'Fri', actual: 78, forecast: 74, confidence: 93 },
  { day: 'Sat', actual: 85, forecast: 82, confidence: 96 },
  { day: 'Sun (Proj)', actual: null, forecast: 89, confidence: 98 },
];

// Crime Category Volatility
const CATEGORY_VOLATILITY = [
  { category: 'Vehicle Theft', thisWeek: 42, lastWeek: 31, delta: '+35.4%', trend: 'up', risk: 'HIGH' },
  { category: 'Cyber Fraud', thisWeek: 38, lastWeek: 26, delta: '+46.1%', trend: 'up', risk: 'CRITICAL' },
  { category: 'Burglary (Night)', thisWeek: 29, lastWeek: 34, delta: '-14.7%', trend: 'down', risk: 'MEDIUM' },
  { category: 'NDPS / Narcotics', thisWeek: 21, lastWeek: 16, delta: '+31.2%', trend: 'up', risk: 'HIGH' },
  { category: 'Hit & Run', thisWeek: 18, lastWeek: 22, delta: '-18.1%', trend: 'down', risk: 'LOW' },
  { category: 'Armed Robbery', thisWeek: 14, lastWeek: 12, delta: '+16.6%', trend: 'up', risk: 'ELEVATED' },
];

// Modus Operandi Clusters
const MO_CLUSTERS_SUMMARY = [
  {
    name: 'Night Master Key Bypass',
    crimeType: 'Vehicle Theft',
    leadSuspect: 'Ramesh Kumar (Bullet Ramesh)',
    firsCount: 6,
    precincts: ['Raichur Suburban', 'BLR Central', 'BLR East'],
    riskScore: 94,
    status: 'ACTIVE RING',
  },
  {
    name: 'Commercial MDMA Intercept Hub',
    crimeType: 'Narcotics',
    leadSuspect: 'Imran Khan',
    firsCount: 5,
    precincts: ['BLR East', 'Tumakuru Town', 'Koppal Town'],
    riskScore: 96,
    status: 'SURVEILLANCE EXPANDING',
  },
  {
    name: 'Balcony Latch Housebreaking',
    crimeType: 'Burglary',
    leadSuspect: 'Vikram Reddy',
    firsCount: 3,
    precincts: ['Chikkamagaluru Market'],
    riskScore: 84,
    status: 'RECURRENCE FLAGGED',
  },
  {
    name: 'Digital Banking Impersonation',
    crimeType: 'Cybercrime',
    leadSuspect: 'Bhavani Karpe',
    firsCount: 6,
    precincts: ['Chikkamagaluru Town', 'BLR Traffic', 'Tumakuru Ind.'],
    riskScore: 85,
    status: 'PATTERN CONFIRMED',
  },
];

export default function AnalystIntelligenceHub() {
  const {
    tick,
    lastUpdated,
    confidenceScore,
    totalAnalyzedFirs,
    activeClustersCount,
    activeSyndicatesCount,
    anomalies,
    latestAnomaly,
    districtRiskUpdates,
  } = useAnalystTelemetry();

  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  const filteredAnomalies = anomalies.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── TOP BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Crime Intelligence Hub
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono mt-1">
            Predictive crime analytics, pattern detection & live syndicate intelligence across Karnataka.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono self-start sm:self-center shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[var(--cyan-accent)] animate-pulse" />
          <span className="text-[var(--text-secondary)] font-bold uppercase text-[10px]">TELEMETRY:</span>
          <span className="text-[11px] text-[var(--text-primary)] font-bold">Live 3s Ingestion</span>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Analyzed Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--cyan-accent)]/10 text-[var(--cyan-accent)] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)]" suppressHydrationWarning>
              {totalAnalyzedFirs ? totalAnalyzedFirs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '535,815'}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--status-success)] mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3 new telemetry records ingested</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Active MO Clusters
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--status-warning)]/10 text-[var(--status-warning)] flex items-center justify-center">
              <Fingerprint className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">
              {activeClustersCount} Clusters
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--status-warning)] mt-1 font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>4 High-Risk Modus Operandi Flagged</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Predictive ML Confidence
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--status-success)]/10 text-[var(--status-success)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-[var(--status-success)]">
              {confidenceScore}%
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-secondary)] mt-1">
              <span>Dynamic bayesian network scoring</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Syndicate Networks
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--status-critical)]/10 text-[var(--status-critical)] flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-[var(--status-critical)]">
              {activeSyndicatesCount} Tracked
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--status-critical)] mt-1 font-semibold">
              <Flame className="w-3.5 h-3.5 animate-bounce" />
              <span>Multi-jurisdictional link confirmed</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── SECTION: REAL-TIME 3s ANOMALY STREAM & 7-DAY FORECAST ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dynamic 3s Anomaly Stream */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--status-critical)] animate-ping" />
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Live Anomaly Stream
                </h2>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border)]">
                AUTO-3s
              </span>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              {(['ALL', 'CRITICAL', 'HIGH'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded transition-all font-semibold ${
                    filterSeverity === sev
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Stream List */}
            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {filteredAnomalies.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--cyan-accent)]/50 transition-all flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          item.severity === 'CRITICAL'
                            ? 'bg-[var(--status-critical)]/10 text-[var(--status-critical)] border border-[var(--status-critical)]/20'
                            : 'bg-[var(--status-warning)]/10 text-[var(--status-warning)] border border-[var(--status-warning)]/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span className="text-[9px] font-mono text-[var(--text-secondary)]">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] font-mono leading-tight">
                      {item.details}
                    </p>
                    <div className="flex items-center justify-between text-[9px] font-mono pt-1 text-[var(--text-secondary)] border-t border-[var(--border)]">
                      <span>📍 {item.location}</span>
                      <span className="text-[var(--cyan-accent)] font-bold">{item.confidence}% Match</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <Link
            href="/analyst/patterns"
            className="mt-3 w-full py-2 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono text-center font-bold text-[var(--cyan-accent)] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Deep Pattern Exploration</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Right: 7-Day Predictive Crime Trend Forecast */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  7-Day Predictive Crime Trend Forecast
                </h2>
                <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                  Actual filings vs Bayesian Neural Forecast (Confidence threshold ≥93%)
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[var(--cyan-accent)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--cyan-accent)]" /> Actual Filings
                </span>
                <span className="flex items-center gap-1 text-[var(--status-warning)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-warning)]" /> AI Forecast (Proj)
                </span>
              </div>
            </div>

            {/* Recharts Forecast Graph */}
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FORECAST_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--cyan-accent)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--cyan-accent)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-warning)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--status-warning)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-0)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--cyan-accent)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#actualGradient)"
                    name="Actual FIRs"
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="var(--status-warning)"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#forecastGradient)"
                    name="AI Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast Insights Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--border)] font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-[var(--surface-1)]">
                <span className="text-[var(--text-secondary)] block text-[10px] uppercase">Peak Risk Window:</span>
                <span className="font-bold text-[var(--status-critical)]">Saturday 22:00 – Sunday 04:00</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface-1)]">
                <span className="text-[var(--text-secondary)] block text-[10px] uppercase">Projected High Category:</span>
                <span className="font-bold text-[var(--text-primary)]">Vehicle Theft (+35.4%)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface-1)]">
                <span className="text-[var(--text-secondary)] block text-[10px] uppercase">Patrol Optimization:</span>
                <span className="font-bold text-[var(--status-success)]">+12 Beats Advised in BLR Central</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION: CRIME VOLATILITY & MODUS OPERANDI DETECTOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Volatility Table */}
        <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Category Volatility Index (WoW)
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                Week-over-week frequency deltas with risk categorisation
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--cyan-accent)] font-semibold">
              KSP Statewide
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)] uppercase">
                  <th className="pb-2 font-semibold">Crime Type</th>
                  <th className="pb-2 font-semibold">This Week</th>
                  <th className="pb-2 font-semibold">Last Week</th>
                  <th className="pb-2 font-semibold">Shift (%)</th>
                  <th className="pb-2 font-semibold text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {CATEGORY_VOLATILITY.map((row) => (
                  <tr key={row.category} className="hover:bg-[var(--surface-1)] transition-colors">
                    <td className="py-2.5 font-bold text-[var(--text-primary)]">{row.category}</td>
                    <td className="py-2.5">{row.thisWeek}</td>
                    <td className="py-2.5 text-[var(--text-secondary)]">{row.lastWeek}</td>
                    <td className="py-2.5 font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          row.trend === 'up' ? 'text-[var(--status-critical)]' : 'text-[var(--status-success)]'
                        }`}
                      >
                        {row.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {row.delta}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          row.risk === 'CRITICAL'
                            ? 'bg-[var(--status-critical)]/15 text-[var(--status-critical)] border border-[var(--status-critical)]/30'
                            : row.risk === 'HIGH'
                            ? 'bg-[var(--status-warning)]/15 text-[var(--status-warning)] border border-[var(--status-warning)]/30'
                            : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active MO Clusters Summary */}
        <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Active Modus Operandi (MO) Rings
                </h2>
                <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                  Algorithmic clustering of correlated signatures & key suspects
                </p>
              </div>
              <Link
                href="/analyst/patterns"
                className="text-xs font-mono text-[var(--cyan-accent)] hover:underline font-bold"
              >
                View All →
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {MO_CLUSTERS_SUMMARY.map((mo) => (
                <div
                  key={mo.name}
                  className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{mo.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-bold">
                      {mo.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                    <span>Key Suspect: <strong className="text-[var(--text-primary)]">{mo.leadSuspect}</strong></span>
                    <span className="text-[var(--status-critical)] font-bold">{mo.firsCount} Connected FIRs</span>
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate">
                    Precincts: {mo.precincts.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION: DISTRICT THREAT HEAT MATRIX ── */}
      <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
              Dynamic District Threat Matrix
            </h2>
            <p className="text-[11px] font-mono text-[var(--text-secondary)]">
              Real-time threat indices fluctuating with 3-second live sensor ingestion
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-secondary)]">
            Active Cycle: #{tick}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {Object.entries(districtRiskUpdates).map(([dist, data]) => (
            <motion.div
              key={dist}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.3 }}
              className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase truncate">
                  {dist}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold ${
                    data.trend === 'up'
                      ? 'text-[var(--status-critical)]'
                      : data.trend === 'down'
                      ? 'text-[var(--status-success)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {data.trend === 'up' ? '▲ RISING' : data.trend === 'down' ? '▼ COOLING' : '■ STABLE'}
                </span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">
                  {data.score}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-mono"> / 100</span>
              </div>
              <div className="text-[9px] font-mono text-[var(--cyan-accent)] font-semibold truncate">
                {data.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
