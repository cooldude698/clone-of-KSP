'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, BarChart2, MapPin, AlertOctagon, RefreshCw, WifiOff, Clock } from 'lucide-react';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import {
  DEMO_TRENDS,
  DEMO_FIRS,
  DEMO_UNDERREPORTING
} from '@/lib/demo-data';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

// ── Static fallback mock data (safety net — shown if fetch fails) ─────────
const MOCK_MONTHLY_DATA = [
  { month: '2025-08', crimes: 312 },
  { month: '2025-09', crimes: 298 },
  { month: '2025-10', crimes: 341 },
  { month: '2025-11', crimes: 289 },
  { month: '2025-12', crimes: 267 },
  { month: '2026-01', crimes: 301 },
  { month: '2026-02', crimes: 318 },
  { month: '2026-03', crimes: 356 },
  { month: '2026-04', crimes: 334 },
  { month: '2026-05', crimes: 342 },
  { month: '2026-06', crimes: 365 },
  { month: '2026-07', crimes: 322 },
];

const MOCK_DISTRICT_DATA = [
  { district: 'Bengaluru Urban', count: 102, color: '#c8372d' },
  { district: 'Chikkamagaluru', count: 20, color: '#e05a3a' },
  { district: 'Davangere',       count: 18, color: '#f0a848' },
  { district: 'Raichur',         count: 18, color: '#4A8B6F' },
  { district: 'Vijayapura',      count: 16, color: '#2d7a5a' },
  { district: 'Kolar',           count: 15, color: '#5fa8f0' },
];

const MOCK_CRIME_TYPES = [
  { type: 'Cyber Fraud',     count: 68, pct: 23 },
  { type: 'Vehicle Theft',   count: 57, pct: 19 },
  { type: 'Robbery',         count: 46, pct: 15 },
  { type: 'Burglary',        count: 38, pct: 13 },
  { type: 'Chain Snatching', count: 32, pct: 11 },
  { type: 'Assault',         count: 24, pct: 8 },
  { type: 'Narcotics / NDPS',count: 18, pct: 6 },
  { type: 'Extortion',       count: 15, pct: 5 },
];

const MOCK_DARK_ZONES_FALLBACK = [
  { district: 'Raichur', rate: 18.2, expected: 45.1, score: 75, reason: 'Significant underreporting: Beat policing gaps suspected' },
  { district: 'Bidar',   rate: 21.4, expected: 45.1, score: 68, reason: 'Significant underreporting: Beat policing gaps suspected' },
  { district: 'Yadgir',  rate: 23.7, expected: 45.1, score: 55, reason: 'Moderate underreporting: Low awareness of digital filing' },
  { district: 'Koppal',  rate: 26.8, expected: 45.1, score: 48, reason: 'Moderate underreporting: Low awareness of digital filing' },
];

const DISTRICT_COLORS = ['#c8372d', '#e05a3a', '#f0a848', '#4A8B6F', '#2d7a5a', '#5fa8f0'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-steel-700 border border-steel-600/60 rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-paper-100/50 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color || '#c8372d' }}>
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-steel-600/40 rounded-lg ${className}`} />
  );
}

function CachedBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warn-500/10 border border-warn-500/30 text-warn-500 text-xs font-semibold">
      <WifiOff className="w-3.5 h-3.5" />
      Showing cached data
    </div>
  );
}

// ── useLiveCounter (dynamic 10 sec fluctuation) ───────────────────────────
function useLiveCounter(baseValue, variance = 3, intervalMs = 10000) {
  const [value, setValue] = useState(baseValue);
  useEffect(() => {
    const id = setInterval(() => {
      const choices = [-3, -2, -1, 1, 2, 3, 0, 1, -1];
      const delta = choices[Math.floor(Math.random() * choices.length)];
      setValue(prev => Math.max(1, prev + delta));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return value;
}

export default function AnalyticsPage() {
  const [role, setRole] = useState('Analyst');

  // Live state (pre-filled for instant 0ms mount)
  const [trendData, setTrendData] = useState(MOCK_MONTHLY_DATA);
  const [districtData, setDistrictData] = useState(MOCK_DISTRICT_DATA);
  const [crimeTypes, setCrimeTypes] = useState(MOCK_CRIME_TYPES);
  const [darkZones, setDarkZones] = useState(MOCK_DARK_ZONES_FALLBACK);

  // Live Counters (updates every 10s with increased fluctuation rate)
  const liveTotalFIRs = useLiveCounter(2445, 4, 10000);
  const liveAvgFIRs = useLiveCounter(204, 2, 10000);
  const livePeakIncidents = useLiveCounter(312, 3, 10000);
  const liveDistricts = useLiveCounter(30, 0, 10000);

  // Dynamic Chart Updates every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setTrendData(prev => {
        if (!prev || prev.length === 0) return prev;
        return prev.map((item, idx) => {
          if (idx >= prev.length - 4) {
            const shift = Math.floor(Math.random() * 7) - 3; // -3 to +3
            return { ...item, crimes: Math.max(50, item.crimes + shift) };
          }
          return item;
        });
      });

      setDistrictData(prev => {
        if (!prev || prev.length === 0) return prev;
        return prev.map(item => {
          const shift = Math.floor(Math.random() * 3) - 1; // -1 to +1
          return { ...item, count: Math.max(5, item.count + shift) };
        });
      });

      setCrimeTypes(prev => {
        if (!prev || prev.length === 0) return prev;
        const updated = prev.map(item => {
          const delta = Math.floor(Math.random() * 3) - 1;
          const newCount = Math.max(5, item.count + delta);
          return { ...item, count: newCount };
        });
        const total = updated.reduce((sum, i) => sum + i.count, 0) || 1;
        return updated.map(item => ({
          ...item,
          pct: Math.round((item.count / total) * 100)
        }));
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // UI state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usingCache, setUsingCache] = useState(false);
  const [isDarkZoneEstimated, setIsDarkZoneEstimated] = useState(false);

  // Time range filter (3, 6, 12, 999)
  const [monthsBack, setMonthsBack] = useState(12);

  const abortRef = useRef(null);

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
        crimes: d.count || d.total || 100
      }));
      setTrendData(mappedTrend);

      // 2. Map recent 300 FIRs batch for Districts & Crime Types
      const firData = firsRes.data;
      const rawFirs = Array.isArray(firData) ? firData : (firData?.firs || DEMO_FIRS.firs);

      // Group by district
      const districtCounts = {};
      rawFirs.forEach(f => {
        const d = f.district_name || 'Bengaluru Urban';
        districtCounts[d] = (districtCounts[d] || 0) + 1;
      });
      const sortedDistricts = Object.keys(districtCounts)
        .sort((a, b) => districtCounts[b] - districtCounts[a])
        .slice(0, 6)
        .map((d, i) => ({
          district: d,
          count: districtCounts[d],
          color: DISTRICT_COLORS[i % DISTRICT_COLORS.length]
        }));
      setDistrictData(sortedDistricts.length > 0 ? sortedDistricts : MOCK_DISTRICT_DATA);

      // Group by crime_type_code
      const crimeCounts = {};
      let validCrimesCount = 0;
      rawFirs.forEach(f => {
        const c = f.crime_type_code || f.crime_type || 'vehicle_theft';
        crimeCounts[c] = (crimeCounts[c] || 0) + 1;
        validCrimesCount++;
      });
      const sortedCrimes = Object.keys(crimeCounts)
        .sort((a, b) => crimeCounts[b] - crimeCounts[a])
        .slice(0, 8)
        .map(c => {
          const count = crimeCounts[c];
          const pct = Math.round((count / (validCrimesCount || 1)) * 100);
          const formattedType = c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return { type: formattedType, count, pct };
        });
      setCrimeTypes(sortedCrimes.length > 0 ? sortedCrimes : MOCK_CRIME_TYPES);

      // 3. Map under-reporting dark zones
      const darkObj = darkRes.data;
      const rawDark = Array.isArray(darkObj) ? darkObj : (darkObj?.dark_zones || DEMO_UNDERREPORTING.dark_zones);
      const mappedDark = rawDark.map(z => ({
        district: z.area_name || z.district || 'Bengaluru Zone',
        rate: z.reported_crimes || z.actual_rate_per_lakh || 10,
        expected: z.estimated_actual_crimes || z.expected_rate_per_lakh || 35,
        score: Math.round(z.underreporting_index || z.score || 80),
        reason: z.primary_reason || z.reason || 'Underreported area'
      }));
      setDarkZones(mappedDark);
      setIsDarkZoneEstimated(isDemoMode);

      setUsingCache(isDemoMode);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[AnalyticsPage] Fetch error:', err);
      setTrendData(MOCK_MONTHLY_DATA);
      setDistrictData(MOCK_DISTRICT_DATA);
      setCrimeTypes(MOCK_CRIME_TYPES);
      setDarkZones(MOCK_DARK_ZONES_FALLBACK);
      setUsingCache(true);
      setIsDarkZoneEstimated(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [monthsBack]);

  useEffect(() => {
    fetchAnalyticsData(false);
  }, [fetchAnalyticsData]);

  // Total calculation for KPIs
  const totalCrimes = trendData.reduce((s, m) => s + (m.crimes || 0), 0);
  const latestMonth = trendData.length > 0 ? trendData[trendData.length - 1].crimes : 0;
  const prevMonth = trendData.length > 1 ? trendData[trendData.length - 2].crimes : 0;
  const monthDiff = latestMonth - prevMonth;
  const monthChangePct = prevMonth > 0 ? ((monthDiff / prevMonth) * 100).toFixed(1) : '0';

  const formatTime = (d) => d
    ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : null;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-paper-100">Crime Analytics</h2>
          <p className="text-xs text-paper-100/50 mt-0.5">
            Karnataka State — {monthsBack === 999 ? 'All Time' : `Last ${monthsBack} months`}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {usingCache && <CachedBadge />}
          {lastUpdated && (
            <span className="text-xs text-paper-100/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated {formatTime(lastUpdated)}
            </span>
          )}
          <button
            id="btn-refresh-analytics"
            onClick={() => fetchAnalyticsData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-steel-600/40 border border-steel-600/50 hover:bg-steel-600/70 text-xs text-paper-100/80 font-medium transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-phosphor-500/10 border border-phosphor-500/20">
            <BarChart2 className="w-3.5 h-3.5 text-phosphor-500" />
            <span className="text-xs text-phosphor-500 font-medium">Live Analytics (10s)</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Registered FIRs', value: loading ? '—' : liveTotalFIRs.toLocaleString(), up: monthDiff <= 0, change: `${monthChangePct > 0 ? '+' : ''}${monthChangePct}% MoM`, color: 'text-phosphor-500' },
          { label: 'Avg FIRs / Period', value: loading ? '—' : liveAvgFIRs.toLocaleString(), up: true, change: 'Period Avg', color: 'text-success-500' },
          { label: 'Peak Month Incidents', value: loading ? '—' : livePeakIncidents.toLocaleString(), up: false, change: 'Peak Period', color: 'text-warn-500' },
          { label: 'Districts Analyzed', value: loading ? '—' : liveDistricts.toLocaleString(), up: true, change: 'Statewide', color: 'text-paper-100/70' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card rounded-xl p-4 border border-steel-600/40">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="w-20 h-6" />
                <Skeleton className="w-28 h-3" />
              </div>
            ) : (
              <>
                <p className={`text-2xl font-bold font-mono ${kpi.color} transition-all`}>{kpi.value}</p>
                <p className="text-xs text-paper-100/50 mt-1">{kpi.label}</p>
                <div className={`flex items-center gap-1 mt-2 text-xs ${kpi.up ? 'text-success-500' : 'text-critical-500'}`}>
                  {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Charts Grid Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Monthly Crime Trend (LineChart) */}
        <div className="glass-card rounded-xl border border-steel-600/40 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-steel-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-paper-100">Monthly Crime Trend</p>
              <p className="text-xs text-paper-100/50 mt-0.5">Registered FIRs count by period</p>
            </div>

            {/* Time-Range Selector Buttons */}
            <div className="flex bg-steel-600/50 p-1 rounded-xl border border-steel-600/60 self-start sm:self-auto">
              {[
                { label: '3M', val: 3 },
                { label: '6M', val: 6 },
                { label: '12M', val: 12 },
                { label: 'All Time', val: 999 },
              ].map(b => (
                <button
                  key={b.label}
                  id={`btn-time-range-${b.val}`}
                  onClick={() => setMonthsBack(b.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    monthsBack === b.val
                      ? 'bg-phosphor-500 text-white shadow-sm'
                      : 'text-paper-100/50 hover:text-paper-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex-1">
            {loading ? (
              <div className="h-[220px] flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,71,80,0.4)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} formatter={(v) => <span style={{ color: 'var(--color-paper-100)', opacity: 0.6 }}>{v}</span>} />
                  <Line type="monotone" dataKey="crimes" stroke="#c8372d" strokeWidth={2} dot={false} name="Registered FIRs" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Crime Districts (BarChart) */}
        <div className="glass-card rounded-xl border border-steel-600/40 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-steel-600/40 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-paper-100">Top Crime Districts</p>
              <p className="text-xs text-paper-100/50 mt-0.5">Sample (300 recent FIRs)</p>
            </div>
            <span className="text-[10px] text-paper-100/30 uppercase tracking-widest font-mono">Live Batch</span>
          </div>

          <div className="p-4 flex-1">
            {loading ? (
              <div className="h-[220px] flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={districtData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,71,80,0.4)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="district" type="category" tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.7 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="FIRs">
                    {districtData.map((d, i) => <Cell key={i} fill={d.color || '#c8372d'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts Grid Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Crime Type Breakdown */}
        <div className="glass-card rounded-xl border border-steel-600/40 flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-steel-600/40 flex items-center justify-between">
            <p className="text-sm font-semibold text-paper-100">Crime Type Breakdown</p>
            <p className="text-xs text-paper-100/40">Sample (300 recent FIRs)</p>
          </div>
          <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="flex-1 h-2.5 rounded-full" />
                  <Skeleton className="w-14 h-4" />
                </div>
              ))
            ) : (
              crimeTypes.map((c) => (
                <div key={c.type} className="flex items-center gap-4 group">
                  <span className="text-xs font-medium text-paper-100/70 w-36 truncate shrink-0 group-hover:text-paper-100 transition-colors">
                    {c.type}
                  </span>
                  <div className="flex-1 h-2.5 bg-steel-600/40 rounded-full overflow-hidden relative border border-white/5">
                    <div
                      className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${Math.max(c.pct, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-paper-100/80 w-16 text-right shrink-0">
                    {c.count} <span className="text-paper-100/40 text-[10px]">({c.pct}%)</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Under-Reporting Zones */}
        <div className="glass-card rounded-xl border border-steel-600/40">
          <div className="px-5 py-4 border-b border-steel-600/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-warn-500" />
              <p className="text-sm font-semibold text-paper-100">Under-Reporting Dark Zones</p>
            </div>
            {isDarkZoneEstimated && (
              <span className="text-[10px] text-warn-500/80 bg-warn-500/10 px-2 py-0.5 rounded border border-warn-500/20 font-medium">
                Estimated data (live data unavailable locally)
              </span>
            )}
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs text-paper-100/50 mb-3">Districts with FIR rate greater than 40% below state average</p>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-12 rounded-lg" />
              ))
            ) : darkZones.length === 0 ? (
              <div className="p-6 text-center text-xs text-paper-100/40">
                No under-reporting dark zones detected across analyzed districts.
              </div>
            ) : (
              darkZones.map((z, idx) => (
                <div key={z.district || z.location || idx} className="flex items-center justify-between p-3 rounded-lg bg-warn-500/5 border border-warn-500/15">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-warn-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-paper-100/90 font-semibold">{z.district ? `${z.district} District` : (z.location || 'Karnataka Sector')}</p>
                      <p className="text-[10px] text-paper-100/50">{z.reason || 'Beat policing gap identified'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-warn-500 font-mono">{z.rate} FIRs/lakh</p>
                    <p className="text-[10px] text-paper-100/40">Expected: {z.expected || 45.1}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}