'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, FileText, Camera, Shield,
  ArrowUpDown, ChevronDown, MoreVertical, Wifi,
  Cpu, Car, Laptop, Home, ShieldAlert, Activity,
  Users, CheckCircle2, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { fetchWithFallback, invalidateCache } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS, DEMO_HOTSPOTS, DEMO_REPEAT_OFFENDERS } from '@/lib/demo-data';
import { saveFIRsToStore } from '@/lib/fir-store';

const CRIME_ICONS = {
  vehicle_theft:   Car,
  cyber_fraud:     Laptop,
  robbery:         ShieldAlert,
  chain_snatching: ShieldAlert,
  burglary:        Home,
  drug_offence:    AlertCircle,
  hit_and_run:     Activity,
  assault:         ShieldAlert,
};

const CRIME_NAMES = {
  vehicle_theft:   'Vehicle Theft',
  cyber_fraud:     'Cyber Fraud',
  robbery:         'Armed Robbery',
  chain_snatching: 'Chain Snatching',
  burglary:        'Residential Burglary',
  drug_offence:    'Narcotics Possession',
  hit_and_run:     'Hit & Run Incident',
  assault:         'Physical Assault',
};

function fmtDate(dateStr) {
  if (!dateStr) return '05 Jun 2026';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export default function DashboardPage() {
  const router = useRouter();

  // Data State
  const [firs, setFirs] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('Month');
  const [search, setSearch] = useState('');
  const [activeMenuCase, setActiveMenuCase] = useState(null);

  const [role, setRole] = useState('Inspector');
  const [officerName, setOfficerName] = useState('V. Sharma');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('drishti_role') || 'Inspector';
      let rawName = localStorage.getItem('userName') || localStorage.getItem('drishti_user_name') || 'V. Sharma';
      rawName = rawName.replace(/^(Inspector General|Sub-Inspector|Inspector|Officer|SI|DySP|SP|DSP)\s*/i, '').trim();
      setRole(storedRole);
      setOfficerName(rawName || 'V. Sharma');
    }
  }, []);

  const loadData = useCallback(async () => {
    const res = await fetchWithFallback('/api/firs', DEMO_FIRS, { timeoutMs: 2000 });
    const rows = res?.data?.firs || res?.data || DEMO_FIRS.firs;
    saveFIRsToStore(rows);
    setFirs(rows);

    const hotRes = await fetchWithFallback('/api/hotspots', DEMO_HOTSPOTS, { timeoutMs: 2000 });
    setHotspots(hotRes?.data?.hotspots || DEMO_HOTSPOTS.hotspots);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metrics = useMemo(() => {
    const total = firs.length || 52;
    const open = firs.filter(f => (f.status || f.case_status) === 'open').length || 19;
    const investigating = firs.filter(f => (f.status || f.case_status) === 'under_investigation').length || 16;
    const closed = firs.filter(f => (f.status || f.case_status) === 'closed').length || 17;
    return { total, open, investigating, closed };
  }, [firs]);

  const displayedFIRs = useMemo(() => {
    return firs.filter(f => {
      const status = f.status || f.case_status || 'open';
      const matchTab = activeTab === 'all' || status === activeTab;
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (f.case_number || '').toLowerCase().includes(q) ||
        (f.crime_type || '').toLowerCase().includes(q) ||
        (f.police_station || '').toLowerCase().includes(q);
      return matchTab && matchSearch;
    }).slice(0, 7);
  }, [firs, activeTab, search]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-gray-900 dark:text-white">
      
      {/* ── TOP SECTION: COMMAND DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: ACTIVE DUTY & TACTICAL INTEL (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Karnataka State Police · Sector 4 Tactical Command & Analytics
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live CCTNS Sync
              </span>
            </div>
          </div>

          {/* 4-CARD BALANCED INTELLIGENCE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* CARD 1: AI SYNDICATE PATTERN ALERT (DARK HERO) */}
            <div className="rounded-3xl bg-[#18181B] text-white p-5 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-gray-700 transition-all border border-gray-800">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/10 rounded-full blur-xl" />
              
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>AI PATTERN ALERT</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold">Koramangala 5th</span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight mt-3">
                  Night Chain-Snatching Syndicate
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  3 clustered incidents in 48h. Black Pulsar <span className="text-amber-300 font-mono font-semibold">KA-01-MJ-8821</span> flagged on ANPR 14m ago.
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-gray-800 flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-bold">92% High Threat</span>
                <Link
                  href="/dashboard/network"
                  className="flex items-center gap-1 text-xs font-bold text-white hover:text-amber-300 transition-colors"
                >
                  <span>Inspect Syndicate Graph</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* CARD 2: CRITICAL HOTSPOT PATROL ADVISORY */}
            <Link
              href="/dashboard/map"
              className="rounded-3xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300">
                  Critical Hotspot
                </span>
              </div>

              <div className="my-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Koramangala 5th Block</h3>
                <p className="text-xs text-gray-400 mt-0.5">34 Incidents · 8 Burglary · 12 Snatching</p>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">Patrol Advisory Active</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  Crime Map <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* CARD 3: WATCHLIST SIGHTINGS */}
            <Link
              href="/dashboard/suspect"
              className="rounded-3xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  Live Sighting
                </span>
              </div>

              <div className="my-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Vicky "The Snake" (Repeat)</h3>
                <p className="text-xs text-gray-400 mt-0.5">ANPR Hit 14m ago · Indiranagar 100ft Rd</p>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">Active Non-Bailable Warrant</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  Track Suspect <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* CARD 4: ANPR SENSOR GRID & PATROL DECK */}
            <Link
              href="/dashboard/surveillance"
              className="rounded-3xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  99.4% Online
                </span>
              </div>

              <div className="my-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">12,500+ ANPR Nodes</h3>
                <p className="text-xs text-gray-400 mt-0.5">14 PCR Patrol Units Synchronized</p>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Surveillance Grid</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  View Feed <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

          </div>
        </div>

        {/* RIGHT COLUMN: CASES RESOLVED GRAPH CARD (4 COLS) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between text-gray-400">
              <p className="text-xs font-medium text-gray-400">Cases Resolved This Month</p>
              <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
              84.5% <span className="text-sm font-medium text-gray-400 font-normal">/ 152 Dossiers</span>
            </p>

            {/* Time Filter Pills */}
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 mt-4 px-2">
              {['Day', 'Week', 'Month', 'Year'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    timeFilter === tab 
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs' 
                      : 'hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SMOOTH CURVED SVG BEZIER SPLINE CHART */}
            <div className="relative mt-5 h-28 w-full">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path
                  d="M 0,65 C 20,40 40,80 70,50 C 100,20 120,70 150,45 C 180,20 200,10 230,12 C 250,15 270,70 300,45 L 300,100 L 0,100 Z"
                  fill="url(#chartGradient)"
                />

                {/* Stroke curve */}
                <path
                  d="M 0,65 C 20,40 40,80 70,50 C 100,20 120,70 150,45 C 180,20 200,10 230,12 C 250,15 270,70 300,45"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Active Indicator Line & Node */}
                <line x1="230" y1="12" x2="230" y2="100" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="230" cy="12" r="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
              </svg>

              {/* Active Oct/Present Tag */}
              <div className="absolute top-[88px] left-[73%] -translate-x-1/2 px-2 py-0.5 rounded-full bg-black text-white text-[9px] font-bold shadow-sm">
                Oct
              </div>
            </div>

            {/* Months Axis Labels */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold mt-4 px-1">
              <span>May</span>
              <span>June</span>
              <span>July</span>
              <span>Aug</span>
              <span>Sep</span>
              <span className="text-black dark:text-white font-bold">Oct</span>
              <span>Nov</span>
            </div>
          </div>

          {/* BOTTOM DARK TARGET CARD (MATCHING INSPO GAUGE WIDGET) */}
          <div className="mt-4 p-4 rounded-2xl bg-[#18181B] text-white flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Plan for 2026</p>
              <p className="text-xs font-bold text-white mt-0.5">Clearance Target</p>
            </div>

            {/* Donut Gauge Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-700"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-white"
                  strokeDasharray="75, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-white">75%</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM SECTION: RECENT INCIDENTS (MATCHING "RECENT TRANSACTION" IN INSPO) ── */}
      <div className="rounded-3xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recent Incidents
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Live First Information Reports recorded across Karnataka</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-full text-xs font-semibold">
              {['all', 'open', 'under_investigation', 'closed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer capitalize ${
                    activeTab === tab
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-bold'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <span>Sort by</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* List Rows */}
        <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
          {displayedFIRs.map((fir, idx) => {
            const rawType = (fir.crime_type_code || fir.crime_type || 'vehicle_theft').toLowerCase();
            const CrimeIcon = CRIME_ICONS[rawType] || FileText;
            const title = CRIME_NAMES[rawType] || fir.crime_type || 'General Incident';
            const status = fir.status || fir.case_status || 'open';

            return (
              <div
                key={idx}
                onClick={() => router.push(`/dashboard/fir/${fir.case_number}`)}
                className="group flex items-center justify-between py-4 px-2 hover:bg-gray-50/70 dark:hover:bg-gray-800/30 rounded-2xl transition-colors cursor-pointer"
              >
                {/* Left: Squircle Icon + Title */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-gray-900 dark:text-white">
                    <CrimeIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {fir.police_station || fir.location_name || 'Silk Board PS'} · IO: {fir.investigation_office || 'ACP Special Squad'}
                    </p>
                  </div>
                </div>

                {/* Middle: Date */}
                <div className="hidden sm:block text-xs font-medium text-gray-400">
                  {fmtDate(fir.date_filed)}
                </div>

                {/* Right: Case Number & Status */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                      {fir.case_number}
                    </p>
                    <p className={`text-[10px] font-bold capitalize ${
                      status === 'open' ? 'text-rose-600' : status === 'closed' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {status.replace('_', ' ')}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/fir/${fir.case_number}`);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>Showing 7 of {firs.length} total cases</span>
          <Link
            href="/dashboard/fir"
            className="font-bold text-gray-900 dark:text-white hover:underline flex items-center gap-1"
          >
            View Complete Case Archive
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
