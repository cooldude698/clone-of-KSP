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

const CRIME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  vehicle_theft:   Car,
  cyber_fraud:     Laptop,
  robbery:         ShieldAlert,
  chain_snatching: ShieldAlert,
  burglary:        Home,
  drug_offence:    AlertCircle,
  hit_and_run:     Activity,
  assault:         ShieldAlert,
};

const CRIME_NAMES: Record<string, string> = {
  vehicle_theft:   'Vehicle Theft',
  cyber_fraud:     'Cyber Fraud',
  robbery:         'Armed Robbery',
  chain_snatching: 'Chain Snatching',
  burglary:        'Residential Burglary',
  drug_offence:    'Narcotics Possession',
  hit_and_run:     'Hit & Run Incident',
  assault:         'Physical Assault',
};

function fmtDate(dateStr: string) {
  if (!dateStr) return '05 Jun 2026';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export default function AnalystIntelligenceHub() {
  const router = useRouter();
  const { t } = useLanguage();

  // Data State
  const [firs, setFirs] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(15);
  const [selectedFIR, setSelectedFIR] = useState<any>(null);

  const [role, setRole] = useState('Chief Crime Analyst');
  const [officerName, setOfficerName] = useState('Dr. Priya Rao');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('drishti_role') || 'Chief Crime Analyst';
      let rawName = localStorage.getItem('userName') || localStorage.getItem('drishti_user_name') || 'Dr. Priya Rao';
      setRole(storedRole);
      setOfficerName(rawName || 'Dr. Priya Rao');
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
    return firs.filter((f: any) => {
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Overview
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Karnataka State Police · SCRB State Crime Intelligence Command
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
                  href="/analyst/network"
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
                  href="/analyst/heatmap"
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
                  href="/analyst/watchlist"
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
                  href="/analyst/watchlist"
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
              {(['Day', 'Week', 'Month', 'Year'] as const).map((tab) => (
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
        
        {/* Table Filter Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Incidents' },
              { id: 'open', label: 'Open' },
              { id: 'under_investigation', label: 'Under Investigation' },
              { id: 'chargesheeted', label: 'Chargesheeted' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setVisibleCount(15); }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by crime, PS, case..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Case Number</th>
                <th className="pb-3 px-3">Crime Type</th>
                <th className="pb-3 px-3">Police Station</th>
                <th className="pb-3 px-3">Date Logged</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading CCTNS live feed...
                  </td>
                </tr>
              ) : displayedFIRs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching cases found.
                  </td>
                </tr>
              ) : (
                displayedFIRs.map((f: any, idx: number) => {
                  const Icon = CRIME_ICONS[f.crime_type_code] || Shield;
                  const crimeLabel = CRIME_NAMES[f.crime_type_code] || f.crime_type || 'Unknown';
                  const st = f.status || f.case_status || 'open';

                  return (
                    <tr
                      key={f.case_number || idx}
                      onClick={() => setSelectedFIR(f)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {f.case_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{crimeLabel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 truncate max-w-[180px]">
                        {f.police_station || 'Central PS'}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {fmtDate(f.date_filed || f.date_time)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            st === 'chargesheeted'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : st === 'under_investigation'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {st.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFIR(f);
                          }}
                          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {visibleCount < filteredFIRs.length && (
          <div className="pt-6 text-center">
            <button
              onClick={() => setVisibleCount(c => c + 15)}
              className="px-6 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              Load More ({filteredFIRs.length - visibleCount} remaining)
            </button>
          </div>
        )}

      </div>

      {/* Case Details Drawer / Wall Modal */}
      <AnimatePresence>
        {selectedFIR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    FIR Dossier: {selectedFIR.case_number}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Karnataka State Police Investigation Wall
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFIR(null)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Close (Esc)</span>
                </button>
              </div>

              <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar">
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
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
