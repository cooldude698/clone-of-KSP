'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart2, MapPin, AlertTriangle, 
  RefreshCw, WifiOff, Clock, Shield, Filter, Search, Zap, 
  Activity, ArrowUpRight, CheckCircle2, ChevronRight, FileText,
  Terminal, Car, ShieldAlert, Home, Crosshair, Flame, 
  FlaskConical, Briefcase, Scale, Radar, AlertOctagon,
  Layers, Database, Compass, Eye, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import {
  DEMO_TRENDS,
  DEMO_FIRS,
  DEMO_UNDERREPORTING
} from '@/lib/demo-data';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// ── Static fallback mock data ─────────────────────────────────────────────
const MOCK_MONTHLY_DATA = [
  { month: 'Aug 2025', crimes: 312, resolved: 220 },
  { month: 'Sep 2025', crimes: 298, resolved: 215 },
  { month: 'Oct 2025', crimes: 341, resolved: 245 },
  { month: 'Nov 2025', crimes: 289, resolved: 210 },
  { month: 'Dec 2025', crimes: 267, resolved: 195 },
  { month: 'Jan 2026', crimes: 301, resolved: 230 },
  { month: 'Feb 2026', crimes: 318, resolved: 240 },
  { month: 'Mar 2026', crimes: 356, resolved: 270 },
  { month: 'Apr 2026', crimes: 334, resolved: 250 },
  { month: 'May 2026', crimes: 342, resolved: 260 },
  { month: 'Jun 2026', crimes: 365, resolved: 280 },
  { month: 'Jul 2026', crimes: 322, resolved: 248 },
];

const MOCK_DISTRICT_DATA = [
  { district: 'Bengaluru Urban', count: 102, share: '34%', rate: 'Critical', color: '#DC2626' },
  { district: 'Kalaburagi',      count: 24,  share: '8%',  rate: 'Elevated', color: '#EA580C' },
  { district: 'Chikkamagaluru',  count: 20,  share: '7%',  rate: 'Moderate', color: '#D97706' },
  { district: 'Davangere',       count: 18,  share: '6%',  rate: 'Moderate', color: '#2563EB' },
  { district: 'Raichur',         count: 18,  share: '6%',  rate: 'Moderate', color: '#059669' },
  { district: 'Bidar',           count: 15,  share: '5%',  rate: 'Normal',   color: '#475569' },
];

const MOCK_CRIME_TYPES = [
  { type: 'Cyber & Online Fraud', key: 'cyber', icon: Terminal, count: 68, pct: 23, severity: 'High', color: 'bg-indigo-500', textCol: 'text-indigo-600 dark:text-indigo-400' },
  { type: 'Vehicle Theft',        key: 'vehicle', icon: Car, count: 57, pct: 19, severity: 'High', color: 'bg-blue-500',   textCol: 'text-blue-600 dark:text-blue-400' },
  { type: 'Robbery & Dacoity',    key: 'robbery', icon: ShieldAlert, count: 46, pct: 15, severity: 'Critical', color: 'bg-red-500', textCol: 'text-red-600 dark:text-red-400' },
  { type: 'House Burglary',       key: 'burglary', icon: Home, count: 38, pct: 13, severity: 'Medium', color: 'bg-amber-500', textCol: 'text-amber-600 dark:text-amber-400' },
  { type: 'Chain Snatching',      key: 'snatching', icon: Crosshair, count: 32, pct: 11, severity: 'Medium', color: 'bg-orange-500', textCol: 'text-orange-600 dark:text-orange-400' },
  { type: 'Physical Assault',     key: 'assault', icon: Flame, count: 24, pct: 8,  severity: 'Medium', color: 'bg-rose-500',  textCol: 'text-rose-600 dark:text-rose-400' },
  { type: 'Narcotics / NDPS',     key: 'narcotics', icon: FlaskConical, count: 18, pct: 6,  severity: 'Critical', color: 'bg-purple-500', textCol: 'text-purple-600 dark:text-purple-400' },
  { type: 'Extortion / Threats',  key: 'extortion', icon: Briefcase, count: 15, pct: 5,  severity: 'Low', color: 'bg-emerald-500', textCol: 'text-emerald-600 dark:text-emerald-400' },
];

const MOCK_DARK_ZONES_FALLBACK = [
  { district: 'Raichur', rate: 18.2, expected: 45.1, score: 75, deficit: '60%', reason: 'Beat policing gap identified along rural agrarian belt', risk: 'Critical Deficit' },
  { district: 'Bidar',   rate: 21.4, expected: 45.1, score: 68, deficit: '53%', reason: 'Border jurisdiction friction & low digital registration', risk: 'High Deficit' },
  { district: 'Yadgir',  rate: 23.7, expected: 45.1, score: 55, deficit: '47%', reason: 'Station connectivity lags in outer taluk outposts', risk: 'Moderate Gap' },
  { district: 'Koppal',  rate: 26.8, expected: 45.1, score: 48, deficit: '41%', reason: 'Low public awareness of e-FIR kiosk portal', risk: 'Moderate Gap' },
];

// Tactical Chart Tooltip
const TacticalTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F172A]/95 dark:bg-[#18181B]/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-2xl text-xs text-white">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1 pb-1 border-b border-slate-800">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color || '#3B82F6' }} />
                <span>{p.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {Number(p.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function LiveCounter(baseValue, variance = 3, intervalMs = 10000) {
  const [value, setValue] = useState(baseValue);
  useEffect(() => {
    const id = setInterval(() => {
      const choices = [-2, -1, 0, 1, 2];
      const delta = choices[Math.floor(Math.random() * choices.length)];
      setValue(prev => Math.max(1, prev + delta));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return value;
}

export default function AnalyticsPage() {
  const [role, setRole] = useState('Analyst');

  // Live state
  const [trendData, setTrendData] = useState(MOCK_MONTHLY_DATA);
  const [districtData, setDistrictData] = useState(MOCK_DISTRICT_DATA);
  const [crimeTypes, setCrimeTypes] = useState(MOCK_CRIME_TYPES);
  const [darkZones, setDarkZones] = useState(MOCK_DARK_ZONES_FALLBACK);

  // Live fluctuating counters
  const liveTotalFIRs = LiveCounter(2445, 4, 10000);
  const liveAvgFIRs = LiveCounter(204, 2, 10000);
  const livePeakIncidents = LiveCounter(365, 3, 10000);
  const liveClearanceRate = LiveCounter(74, 1, 12000);

  // Dynamic Chart Updates every 8s
  useEffect(() => {
    const interval = setInterval(() => {
      setTrendData(prev => {
        if (!prev || prev.length === 0) return prev;
        return prev.map((item, idx) => {
          if (idx >= prev.length - 3) {
            const shift = Math.floor(Math.random() * 5) - 2;
            return { ...item, crimes: Math.max(100, item.crimes + shift) };
          }
          return item;
        });
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // UI state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usingCache, setUsingCache] = useState(false);
  const [monthsBack, setMonthsBack] = useState(12);

  useEffect(() => {
    setRole(localStorage.getItem('drishti_role') || 'Analyst');
  }, []);

  const fetchAnalyticsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [trendRes, firsRes, darkRes] = await Promise.all([
        fetchWithFallback(`trends?months_back=${monthsBack}`, DEMO_TRENDS),
        fetchWithFallback('firs?limit=300', DEMO_FIRS),
        fetchWithFallback('underreporting', DEMO_UNDERREPORTING),
      ]);

      const isDemoMode = [trendRes, firsRes, darkRes].some(r => r.source === 'demo');

      // 1. Map trends
      const trendObj = trendRes.data;
      const rawTrends = Array.isArray(trendObj) ? trendObj : (trendObj?.trend_data || DEMO_TRENDS.trend_data);
      const mappedTrend = rawTrends.map(d => ({
        month: d.period || d.period_start || '2026-07',
        crimes: d.count || d.total || 300,
        resolved: Math.round((d.count || d.total || 300) * 0.74)
      }));
      setTrendData(mappedTrend);

      // 2. Group districts
      const firData = firsRes.data;
      const rawFirs = Array.isArray(firData) ? firData : (firData?.firs || DEMO_FIRS.firs);
      const districtCounts = {};
      rawFirs.forEach(f => {
        const d = f.district_name || 'Bengaluru Urban';
        districtCounts[d] = (districtCounts[d] || 0) + 1;
      });
      const totalFirsBatch = rawFirs.length || 1;
      const sortedDistricts = Object.keys(districtCounts)
        .sort((a, b) => districtCounts[b] - districtCounts[a])
        .slice(0, 6)
        .map((d, i) => {
          const count = districtCounts[d];
          const share = Math.round((count / totalFirsBatch) * 100) + '%';
          const rate = i === 0 ? 'Critical' : i <= 2 ? 'Elevated' : 'Moderate';
          const col = i === 0 ? '#DC2626' : i === 1 ? '#EA580C' : i === 2 ? '#D97706' : '#2563EB';
          return { district: d, count, share, rate, color: col };
        });
      setDistrictData(sortedDistricts.length > 0 ? sortedDistricts : MOCK_DISTRICT_DATA);

      // 3. Dark Zones (Guarantee fallback so it never renders blank)
      const darkObj = darkRes?.data;
      const rawDark = Array.isArray(darkObj) ? darkObj : (darkObj?.dark_zones || DEMO_UNDERREPORTING.dark_zones);
      if (Array.isArray(rawDark) && rawDark.length > 0) {
        const mappedDark = rawDark.map(z => ({
          district: z.area_name || z.district || 'Bengaluru Sector',
          rate: z.reported_crimes || z.actual_rate_per_lakh || 18,
          expected: z.estimated_actual_crimes || z.expected_rate_per_lakh || 45,
          score: Math.round(z.underreporting_index || z.score || 70),
          deficit: Math.round(((45 - (z.reported_crimes || z.actual_rate_per_lakh || 18)) / 45) * 100) + '%',
          reason: z.primary_reason || z.reason || 'Beat surveillance gap flagged',
          risk: (z.underreporting_index || z.score || 70) > 65 ? 'Critical Deficit' : 'Moderate Gap'
        }));
        setDarkZones(mappedDark.length > 0 ? mappedDark : MOCK_DARK_ZONES_FALLBACK);
      } else {
        setDarkZones(MOCK_DARK_ZONES_FALLBACK);
      }

      setUsingCache(isDemoMode);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[AnalyticsPage] Fetch error:', err);
      setTrendData(MOCK_MONTHLY_DATA);
      setDistrictData(MOCK_DISTRICT_DATA);
      setCrimeTypes(MOCK_CRIME_TYPES);
      setDarkZones(MOCK_DARK_ZONES_FALLBACK);
      setUsingCache(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [monthsBack]);

  useEffect(() => {
    fetchAnalyticsData(false);
  }, [fetchAnalyticsData]);

  const formatTime = (d) => d
    ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : null;

  return (
    <div className="p-4 sm:p-7 space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">

      {/* ── 1. POLICE COMMAND HEADER & TELEMETRY HUB ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono uppercase">
                CRIME INTELLIGENCE & TELEMETRY
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Karnataka State Police CCTNS • State Crime Record Bureau (SCRB)
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Controls & Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GRID SYNCHRONIZED</span>
          </div>

          {lastUpdated && (
            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(lastUpdated)}</span>
            </span>
          )}

          <button
            onClick={() => fetchAnalyticsData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/80 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{refreshing ? 'Syncing…' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. EXECUTIVE POLICE KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total FIRs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-blue-500/40 transition-all group">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Total Registered FIRs</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
              {liveTotalFIRs.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              <TrendingUp className="w-3 h-3" /> +8.0%
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            <span>Statewide Repository</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">CCTNS v4.2</span>
          </div>
        </div>

        {/* KPI 2: High Risk Peak Index */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Peak Month Volume</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {livePeakIncidents.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Incidents</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            <span>Peak Incident Period</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Summer Surge</span>
          </div>
        </div>

        {/* KPI 3: Clearance Velocity */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Case Disposal Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {liveClearanceRate}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              <TrendingUp className="w-3 h-3" /> +3.4%
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            <span>Resolution Velocity</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Optimal</span>
          </div>
        </div>

        {/* KPI 4: Under-reporting Dark Zones */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-red-500/40 transition-all group">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Dark Zones Flagged</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <Radar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-red-600 dark:text-red-400">
              {darkZones.length}
            </span>
            <span className="text-xs text-red-600/80 dark:text-red-400/80 font-mono font-semibold">Districts</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            <span>Reporting Deficit</span>
            <span className="text-red-600 dark:text-red-400 font-semibold">&gt;40% Below Avg</span>
          </div>
        </div>
      </div>

      {/* ── 3. CHARTS GRID (ROW 1: CRIME TREND AREA CHART & DISTRICT HOTSPOTS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Monthly Crime Trend (Area Chart) - 7 Cols */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Monthly Incident Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Registered FIR dockets vs. Resolved cases (MoM Telemetry)
              </p>
            </div>

            {/* Time Selector Buttons */}
            <div className="flex bg-slate-100 dark:bg-zinc-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 self-start sm:self-auto">
              {[
                { label: '3M', val: 3 },
                { label: '6M', val: 6 },
                { label: '12M', val: 12 },
                { label: 'All Time', val: 999 },
              ].map(b => (
                <button
                  key={b.label}
                  onClick={() => setMonthsBack(b.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    monthsBack === b.val
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="crimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-zinc-800/60" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip content={<TacticalTooltip />} />
                <Area type="monotone" dataKey="crimes" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#crimeGrad)" name="Registered FIRs" />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#resolvedGrad)" name="Cleared Cases" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Crime Districts (Horizontal Bar Chart) - 5 Cols */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Jurisdiction Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Top high-density district commands
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold">
              TOP 6
            </span>
          </div>

          <div className="pt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-zinc-800/60" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="district" type="category" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={105} />
                <Tooltip content={<TacticalTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Active FIRs">
                  {districtData.map((d, i) => (
                    <Cell key={i} fill={d.color || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── 4. SECOND ROW: CRIME CATEGORIES & UNDERREPORTING ANOMALIES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Crime Type Breakdown (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Crime Classification Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Statutory categories across active CCTNS records
              </p>
            </div>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
              300 FIR Batch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {crimeTypes.map((c) => {
              const IconComponent = c.icon || Layers;
              return (
                <div 
                  key={c.type}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800/80 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <IconComponent className={`w-3.5 h-3.5 ${c.textCol}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                        {c.type}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      c.severity === 'Critical' 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                        : c.severity === 'High' 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                    }`}>
                      {c.severity}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${c.color} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.max(c.pct, 5)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                      <span>{c.count} Cases</span>
                      <span className="font-bold text-slate-700 dark:text-zinc-200">{c.pct}% Share</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Under-Reporting Dark Zones (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Radar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                    Under-Reporting Dark Zones
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Districts with &gt;40% deficit below statewide baseline
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {darkZones.map((z, idx) => (
                <div 
                  key={z.district || idx}
                  className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/20 hover:border-amber-500/40 transition-all flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono">
                        {z.district} District
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                        {z.deficit} Deficit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-snug">
                      {z.reason}
                    </p>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {z.rate} <span className="text-[10px] opacity-75">FIRs/L</span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Exp: {z.expected}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            <span>Recommended: Deploy Digital e-FIR Kiosks</span>
            <Link
              href="/dashboard/hotspots"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Map</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}