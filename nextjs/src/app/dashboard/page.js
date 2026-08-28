'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, FileText, Camera, Shield,
  ArrowUpDown, ChevronDown, MoreVertical, Wifi,
  Cpu, Car, Laptop, Home, ShieldAlert, Activity,
  Users, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, ChevronRight, X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS, DEMO_HOTSPOTS } from '@/lib/demo-data';
import { saveFIRsToStore } from '@/lib/fir-store';
import InvestigatorWall from '@/components/InvestigatorWall';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();

  // Data State
  const [firs, setFirs] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('Month');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(15);
  const [selectedFIR, setSelectedFIR] = useState(null);

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

  const filteredFIRs = useMemo(() => {
    return firs.filter(f => {
      const status = f.status || f.case_status || 'open';
      const matchTab = activeTab === 'all' || status === activeTab;
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (f.case_number || '').toLowerCase().includes(q) ||
        (f.crime_type || '').toLowerCase().includes(q) ||
        (f.police_station || '').toLowerCase().includes(q) ||
        (f.description || '').toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [firs, activeTab, search]);

  const displayedFIRs = useMemo(() => {
    return filteredFIRs.slice(0, visibleCount);
  }, [filteredFIRs, visibleCount]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-white">
      
      {/* ── TOP SECTION: COMMAND DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: ACTIVE DUTY & TACTICAL INTEL (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('nav.dashboard', 'Dashboard')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
            
            {/* CARD 1: CRIME NETWORK / SYNDICATE */}
            <div
              className="rounded-[28px] bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-white border border-blue-100 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                    High Risk Alert
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Imminent Target Corridor
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                    Silk Board TTMC – Hosur Corridor
                  </h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                      Predicted Window: 28 Jul 2026 – 30 Jul 2026
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">Gang Syndicate</span>
                  <span className="block text-[10px] text-slate-500 font-medium">GANG-NORTH Active</span>
                </div>
                <Link
                  href="/dashboard/network"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  View Network
                </Link>
              </div>
            </div>

            {/* CARD 2: HOTSPOT INTELLIGENCE */}
            <div
              className="rounded-[28px] bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-white border border-amber-100 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    6 Active Hotspots
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Primary Crime Vector & MO
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                    Vehicle Theft & Commercial Hijack
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pt-1">
                    Peak window 22:00–03:00 hrs targeting Pulsar & TVS Apache transit.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">Hotspot Grid</span>
                  <span className="block text-[10px] text-slate-500 font-medium">GIS Patrol Active</span>
                </div>
                <Link
                  href="/dashboard/map"
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-xs flex items-center gap-1"
                >
                  Deploy Patrol
                </Link>
              </div>
            </div>

            {/* CARD 3: SUSPECT WATCHLIST ALERT */}
            <div
              className="rounded-[28px] bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-white border border-purple-100 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50">
                    Watchlist Hit
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ANPR Hit 14m ago · Indiranagar
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                    Vicky “The Snake” (Repeat)
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      Non-Bailable Warrant
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      SUS-7701
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">Active Warrant</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Patrol Alerted</span>
                </div>
                <Link
                  href="/dashboard/suspect"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Track Suspect
                </Link>
              </div>
            </div>

            {/* CARD 4: ANPR SENSOR TELEMETRY */}
            <div
              className="rounded-[28px] bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-white border border-emerald-100 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                    99.4% Grid Uptime
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Surveillance Network · Bengaluru City
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                    12,500+ ANPR Nodes Active
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      14 PCR Units
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      Optical Sync Live
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">Sensor Grid</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Real-Time Streams</span>
                </div>
                <Link
                  href="/dashboard/surveillance"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  View Feed
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: CASES RESOLVED GRAPH CARD (4 COLS) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {timeFilter === 'Day' ? 'Cases Resolved Today' :
                 timeFilter === 'Week' ? 'Cases Resolved This Week' :
                 timeFilter === 'Year' ? 'Cases Resolved This Year' :
                 'Cases Resolved This Month'}
              </p>
              <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              {timeFilter === 'Day' ? '92.0%' :
               timeFilter === 'Week' ? '88.2%' :
               timeFilter === 'Year' ? '81.4%' :
               '84.5%'}
              <span className="text-sm font-normal text-slate-500 ml-1.5">
                / {timeFilter === 'Day' ? '12 Dossiers' :
                   timeFilter === 'Week' ? '48 Dossiers' :
                   timeFilter === 'Year' ? '1,840 Dossiers' :
                   '152 Dossiers'}
              </span>
            </p>

            {/* Time Filter Pills */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mt-4 px-2">
              {['Day', 'Week', 'Month', 'Year'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    timeFilter === tab 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs' 
                      : 'hover:text-slate-900 dark:hover:text-white'
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
                    <stop offset="0%" stopColor="#1d6fbf" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#1d6fbf" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                <path
                  d={
                    timeFilter === 'Day'
                      ? 'M 0,80 C 40,75 70,60 100,48 C 130,35 160,55 190,30 C 220,15 240,25 260,18 C 280,15 290,22 300,18 L 300,100 L 0,100 Z'
                      : timeFilter === 'Week'
                      ? 'M 0,72 C 30,60 60,75 90,42 C 120,25 150,52 180,32 C 210,14 230,28 250,20 C 275,15 290,28 300,22 L 300,100 L 0,100 Z'
                      : timeFilter === 'Year'
                      ? 'M 0,85 C 40,72 80,60 120,48 C 160,38 200,28 240,18 C 260,14 275,12 300,10 L 300,100 L 0,100 Z'
                      : 'M 0,65 C 20,40 40,80 70,50 C 100,20 120,70 150,45 C 180,20 200,10 230,12 C 250,15 270,70 300,45 L 300,100 L 0,100 Z'
                  }
                  fill="url(#chartGradient)"
                  className="transition-all duration-500"
                />

                <path
                  d={
                    timeFilter === 'Day'
                      ? 'M 0,80 C 40,75 70,60 100,48 C 130,35 160,55 190,30 C 220,15 240,25 260,18 C 280,15 290,22 300,18'
                      : timeFilter === 'Week'
                      ? 'M 0,72 C 30,60 60,75 90,42 C 120,25 150,52 180,32 C 210,14 230,28 250,20 C 275,15 290,28 300,22'
                      : timeFilter === 'Year'
                      ? 'M 0,85 C 40,72 80,60 120,48 C 160,38 200,28 240,18 C 260,14 275,12 300,10'
                      : 'M 0,65 C 20,40 40,80 70,50 C 100,20 120,70 150,45 C 180,20 200,10 230,12 C 250,15 270,70 300,45'
                  }
                  fill="none"
                  stroke="#1d6fbf"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>

          {/* BOTTOM TARGET CARD */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Plan for 2026</p>
              <p className="text-xs font-bold text-white mt-0.5">Clearance Target</p>
            </div>

            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray={`${
                    timeFilter === 'Day' ? 92 :
                    timeFilter === 'Week' ? 88 :
                    timeFilter === 'Year' ? 81 :
                    75
                  }, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-white">
                {timeFilter === 'Day' ? '92%' :
                 timeFilter === 'Week' ? '88%' :
                 timeFilter === 'Year' ? '81%' :
                 '75%'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM SECTION: RECENT INCIDENTS TABLE ── */}
      <div className="rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recent Incidents & Case Archive
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live First Information Reports recorded across Karnataka</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full text-xs font-semibold">
              {['all', 'open', 'under_investigation', 'closed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer capitalize ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Column Header */}
        <div className="hidden sm:grid grid-cols-12 items-center px-4 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="col-span-6">Case & Incident</div>
          <div className="col-span-3">Date Filed</div>
          <div className="col-span-3 text-right pr-9">Status / Case ID</div>
        </div>

        {/* List Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {displayedFIRs.map((fir, idx) => {
            const rawType = (fir.crime_type_code || fir.crime_type || 'vehicle_theft').toLowerCase();
            const CrimeIcon = CRIME_ICONS[rawType] || FileText;
            const title = CRIME_NAMES[rawType] || fir.crime_type || 'General Incident';
            const status = fir.status || fir.case_status || 'open';

            return (
              <div
                key={idx}
                onClick={() => setSelectedFIR(fir)}
                className="group grid grid-cols-12 items-center py-3.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors cursor-pointer gap-4"
              >
                {/* Left: Squircle Icon + Title */}
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-slate-900 dark:text-white">
                    <CrimeIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {fir.police_station || fir.location_name || 'Silk Board PS'} · IO: {fir.investigation_office || 'ACP Special Squad'}
                    </p>
                  </div>
                </div>

                {/* Middle: Date */}
                <div className="hidden sm:flex sm:col-span-3 items-center text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                  {fmtDate(fir.date_filed)}
                </div>

                {/* Right: Case Number & Status */}
                <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-slate-900 dark:text-white">
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
                      setSelectedFIR(fir);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
                  >
                    <span>View Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link & Load More Controls */}
        <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>Showing <strong className="text-slate-900 dark:text-white font-bold">{displayedFIRs.length}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{filteredFIRs.length}</strong> total cases</span>

          <div className="flex items-center gap-3">
            {visibleCount < filteredFIRs.length && (
              <button
                onClick={() => setVisibleCount(prev => Math.min(prev + 15, filteredFIRs.length))}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-200 transition-all"
              >
                Load More FIR Cases ({filteredFIRs.length - visibleCount} Remaining)
              </button>
            )}

            <Link
              href="/dashboard/fir"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Full FIR Registry
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* ── INVESTIGATOR CHRONICLE DOSSIER MODAL ── */}
      <AnimatePresence>
        {selectedFIR && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-5xl my-8"
            >
              <button
                onClick={() => setSelectedFIR(null)}
                className="absolute -top-10 right-0 z-50 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Chronicle Dossier</span>
              </button>
              <InvestigatorWall
                fir={{
                  case_number: selectedFIR.case_number || 'KAR/BLR/2026/04921',
                  crime_type: selectedFIR.crime_type || selectedFIR.crime_type_code || 'Vehicle Theft',
                  date_filed: selectedFIR.date_filed || '2026-07-22',
                  location_name: selectedFIR.location_name || selectedFIR.district_name || 'Silk Board PS',
                  case_status: selectedFIR.status || selectedFIR.case_status || 'open',
                  description: selectedFIR.description || 'Target vehicle theft and commercial chopshop transport operation.',
                  police_station: selectedFIR.police_station || 'Bengaluru Urban East PS',
                }}
                accused={[
                  {
                    full_name: selectedFIR.accused_name || 'Ramesh Kumar',
                    alias: 'The Snake',
                    age: 34,
                    gender: 'Male',
                    district_name: selectedFIR.district_name || 'Bengaluru Urban',
                    occupation: 'Fence / Chopshop Logistics',
                    prior_convictions: 6,
                    risk_score: selectedFIR.risk_score || 94,
                    modus_operandi: 'Inter-district night heist using fake ANPR plates.'
                  }
                ]}
                victims={[
                  {
                    full_name: selectedFIR.complainant_name || 'KSP Commercial Unit',
                    age: 42,
                    gender: 'Male',
                    district_name: selectedFIR.district_name || 'Bengaluru Urban',
                    vulnerability_score: 65,
                  }
                ]}
                related_firs={[
                  { case_number: 'KAR/BLR/2026/01184', crime_type: 'Armed Robbery', date_filed: '2026-07-20', link_reason: 'Matching MO & Getaway Vehicle' },
                  { case_number: 'KAR/MYS/2026/00199', crime_type: 'Physical Assault', date_filed: '2026-07-15', link_reason: 'Co-Accused Communication Log' }
                ]}
                case_summary={selectedFIR.description || 'Verified CCTNS first information report statement filed at Karnataka State Police command center.'}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
