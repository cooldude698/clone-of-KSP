'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, FileText, Camera, Shield,
  ArrowUpDown, ChevronDown, MoreVertical, Wifi,
  Cpu, Car, Laptop, Home, ShieldAlert, Activity,
  Users, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, ChevronRight, X,
  TrendingUp, Clock, Target
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
    <div className="w-full max-w-7xl mx-auto space-y-6 text-[#14141A]">
      
      {/* ── TOP SECTION: COMMAND DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: ACTIVE DUTY & TACTICAL INTEL (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-[#C7362F]/10 text-[#C7362F] border border-[#C7362F]/30">
                  FIELD OPS // CONSOLE
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#14141A] tracking-tight uppercase mt-1">
                {t('nav.dashboard', 'Tactical Dispatch & Case Console')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Karnataka State Police · Central Sector Dispatch & Live Tactical Radar
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-[#1E8A5F]">
                <span className="w-2 h-2 rounded-full bg-[#1E8A5F] animate-pulse" />
                Live CCTNS Sync
              </span>
            </div>
          </div>

          {/* 4-CARD BALANCED INTELLIGENCE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* CARD 1: CRIME NETWORK / SYNDICATE */}
            <div
              className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#C7362F] border border-rose-100 flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  
                  {/* SIGNATURE ELEMENT: Physical Field Report Case Stamp */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm border border-[#C7362F]/50 bg-[#C7362F]/10 text-[#C7362F] font-mono text-[9px] font-black uppercase tracking-wider -rotate-1 shadow-2xs">
                    FIR #04921 // URGENT
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7362F]">
                      Imminent Target Corridor
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#14141A] tracking-tight leading-snug">
                    Silk Board TTMC – Hosur Corridor
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono font-bold text-[#C7362F]">
                      Predicted Window: 28 Jul 2026 – 30 Jul 2026
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#14141A]">Gang Syndicate</span>
                  <span className="block text-[10px] text-slate-500 font-mono font-semibold">GANG-NORTH Active</span>
                </div>
                <Link
                  href="/dashboard/network"
                  className="px-4 py-1.5 rounded-full bg-[#14141A] text-white text-xs font-bold hover:bg-[#C7362F] transition-all shadow-xs flex items-center gap-1"
                >
                  View Network
                </Link>
              </div>
            </div>

            {/* CARD 2: HOTSPOT INTELLIGENCE */}
            <div
              className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D08A1E] border border-amber-100 flex items-center justify-center shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  
                  {/* SIGNATURE ELEMENT: Physical Field Report Case Stamp */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm border border-[#D08A1E]/50 bg-[#D08A1E]/10 text-[#D08A1E] font-mono text-[9px] font-black uppercase tracking-wider -rotate-1 shadow-2xs">
                    GRID #BGL-06 // ACTIVE
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D08A1E]">
                      Primary Crime Vector & MO
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#14141A] tracking-tight leading-snug">
                    Vehicle Theft & Commercial Hijack
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 font-medium">
                    Peak window 22:00–03:00 hrs targeting Pulsar & TVS Apache transit.
                  </p>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#14141A]">Hotspot Grid</span>
                  <span className="block text-[10px] text-slate-500 font-mono font-semibold">GIS Patrol Active</span>
                </div>
                <Link
                  href="/dashboard/map"
                  className="px-4 py-1.5 rounded-full bg-[#2E5FE0] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-xs flex items-center gap-1"
                >
                  Deploy Patrol
                </Link>
              </div>
            </div>

            {/* CARD 3: SUSPECT WATCHLIST ALERT */}
            <div
              className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  
                  {/* SIGNATURE ELEMENT: Physical Field Report Case Stamp */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm border border-[#C7362F]/50 bg-[#C7362F]/10 text-[#C7362F] font-mono text-[9px] font-black uppercase tracking-wider -rotate-1 shadow-2xs">
                    WARRANT #SUS-7701
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    ANPR Hit 14m ago · Indiranagar
                  </p>
                  <h3 className="text-base font-black text-[#14141A] tracking-tight leading-snug">
                    Vicky “The Snake” (Repeat)
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      Non-Bailable Warrant
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 font-mono">
                      SUS-7701
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#14141A]">Active Warrant</span>
                  <span className="block text-[10px] text-slate-500 font-mono font-semibold">Patrol Alerted</span>
                </div>
                <Link
                  href="/dashboard/suspect"
                  className="px-4 py-1.5 rounded-full bg-[#14141A] text-white text-xs font-bold hover:bg-[#C7362F] transition-all shadow-xs flex items-center gap-1"
                >
                  Track Suspect
                </Link>
              </div>
            </div>

            {/* CARD 4: ANPR SENSOR TELEMETRY */}
            <div
              className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E8A5F] border border-emerald-100 flex items-center justify-center shadow-xs">
                    <Camera className="w-5 h-5" />
                  </div>
                  
                  {/* SIGNATURE ELEMENT: Physical Field Report Case Stamp */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm border border-[#1E8A5F]/50 bg-[#1E8A5F]/10 text-[#1E8A5F] font-mono text-[9px] font-black uppercase tracking-wider -rotate-1 shadow-2xs">
                    SENSOR #12.5K // LIVE
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Surveillance Network · Bengaluru City
                  </p>
                  <h3 className="text-base font-black text-[#14141A] tracking-tight leading-snug">
                    12,500+ ANPR Nodes Active
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      14 PCR Units
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E8A5F] text-[10px] font-bold font-mono">
                      Optical Sync 99.4%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#14141A]">Sensor Grid</span>
                  <span className="block text-[10px] text-slate-500 font-mono font-semibold">Real-Time Streams</span>
                </div>
                <Link
                  href="/dashboard/surveillance"
                  className="px-4 py-1.5 rounded-full bg-[#14141A] text-white text-xs font-bold hover:bg-[#2E5FE0] transition-all shadow-xs flex items-center gap-1"
                >
                  View Feed
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: CASES RESOLVED GRAPH CARD (4 COLS) */}
<<<<<<< HEAD
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">
=======
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-slate-400">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
>>>>>>> 087f0bff3817d2a331610787dc9e0e5782f51f1f
                {timeFilter === 'Day' ? 'Cases Resolved Today' :
                 timeFilter === 'Week' ? 'Cases Resolved This Week' :
                 timeFilter === 'Year' ? 'Cases Resolved This Year' :
                 'Cases Resolved This Month'}
              </p>
<<<<<<< HEAD
              <button className="text-slate-400 hover:text-slate-900">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-3xl font-black text-[#14141A] mt-1 tracking-tight">
=======
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-3 h-3" />
                +4.2% KPI
              </span>
            </div>
            
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
>>>>>>> 087f0bff3817d2a331610787dc9e0e5782f51f1f
              {timeFilter === 'Day' ? '92.0%' :
               timeFilter === 'Week' ? '88.2%' :
               timeFilter === 'Year' ? '81.4%' :
               '84.5%'}
<<<<<<< HEAD
              <span className="text-sm font-semibold text-slate-500 ml-1.5 font-mono">
=======
              <span className="text-xs sm:text-sm font-medium text-slate-500 ml-1.5">
>>>>>>> 087f0bff3817d2a331610787dc9e0e5782f51f1f
                / {timeFilter === 'Day' ? '12 Dossiers' :
                   timeFilter === 'Week' ? '48 Dossiers' :
                   timeFilter === 'Year' ? '1,840 Dossiers' :
                   '152 Dossiers'}
              </span>
            </p>

            {/* Time Filter Pills */}
            <div className="flex items-center justify-between p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold">
              {['Day', 'Week', 'Month', 'Year'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                    timeFilter === tab 
<<<<<<< HEAD
                      ? 'bg-[#14141A] text-white font-bold shadow-xs' 
                      : 'hover:text-slate-900'
=======
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-extrabold shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
>>>>>>> 087f0bff3817d2a331610787dc9e0e5782f51f1f
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

<<<<<<< HEAD
            {/* SMOOTH CURVED SVG BEZIER SPLINE CHART (COBALT #2E5FE0) */}
            <div className="relative mt-5 h-28 w-full">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E5FE0" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2E5FE0" stopOpacity="0.0" />
=======
            {/* SMOOTH CURVED SVG BEZIER SPLINE CHART */}
            <div className="relative mt-2 h-36 w-full">
              <svg viewBox="0 0 300 110" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
>>>>>>> 087f0bff3817d2a331610787dc9e0e5782f51f1f
                  </linearGradient>
                </defs>
                
                {/* Baseline Grid lines */}
                <line x1="0" y1="30" x2="300" y2="30" stroke="currentColor" strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800/80" strokeWidth="1" />
                <line x1="0" y1="70" x2="300" y2="70" stroke="currentColor" strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800/80" strokeWidth="1" />

                <path
                  d={
                    timeFilter === 'Day'
                      ? 'M 0,85 C 40,80 70,65 100,50 C 130,35 160,55 190,30 C 220,15 240,25 260,18 C 280,15 290,22 300,18 L 300,110 L 0,110 Z'
                      : timeFilter === 'Week'
                      ? 'M 0,78 C 30,65 60,80 90,45 C 120,28 150,55 180,35 C 210,16 230,30 250,22 C 275,16 290,30 300,24 L 300,110 L 0,110 Z'
                      : timeFilter === 'Year'
                      ? 'M 0,90 C 40,75 80,62 120,50 C 160,40 200,30 240,20 C 260,15 275,13 300,10 L 300,110 L 0,110 Z'
                      : 'M 0,70 C 20,45 40,85 70,55 C 100,25 120,75 150,50 C 180,24 200,12 230,15 C 250,18 270,75 300,48 L 300,110 L 0,110 Z'
                  }
                  fill="url(#chartGradient)"
                  className="transition-all duration-500"
                />

                <path
                  d={
                    timeFilter === 'Day'
                      ? 'M 0,85 C 40,80 70,65 100,50 C 130,35 160,55 190,30 C 220,15 240,25 260,18 C 280,15 290,22 300,18'
                      : timeFilter === 'Week'
                      ? 'M 0,78 C 30,65 60,80 90,45 C 120,28 150,55 180,35 C 210,16 230,30 250,22 C 275,16 290,30 300,24'
                      : timeFilter === 'Year'
                      ? 'M 0,90 C 40,75 80,62 120,50 C 160,40 200,30 240,20 C 260,15 275,13 300,10'
                      : 'M 0,70 C 20,45 40,85 70,55 C 100,25 120,75 150,50 C 180,24 200,12 230,15 C 250,18 270,75 300,48'
                  }
                  fill="none"
<<<<<<< HEAD
                  stroke="#2E5FE0"
                  strokeWidth="2.5"
=======
                  stroke="#2563eb"
                  strokeWidth="3"
>>>>>>> 087f0bff3817d2a331610787dc9e0e5782f51f1f
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Peak Highlight Circle */}
                <circle
                  cx="300"
                  cy={timeFilter === 'Year' ? 10 : timeFilter === 'Day' ? 18 : timeFilter === 'Week' ? 24 : 48}
                  r="4"
                  fill="#2563eb"
                  className="animate-pulse"
                />
              </svg>

              {/* X-Axis Timeline Markers */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{timeFilter === 'Day' ? '06:00' : timeFilter === 'Week' ? 'Mon' : timeFilter === 'Year' ? 'Q1 2026' : 'Week 1'}</span>
                <span>{timeFilter === 'Day' ? '12:00' : timeFilter === 'Week' ? 'Wed' : timeFilter === 'Year' ? 'Q2' : 'Week 2'}</span>
                <span>{timeFilter === 'Day' ? '18:00' : timeFilter === 'Week' ? 'Fri' : timeFilter === 'Year' ? 'Q3' : 'Week 3'}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{timeFilter === 'Day' ? 'Now' : timeFilter === 'Week' ? 'Sun' : timeFilter === 'Year' ? 'Q4 (Active)' : 'Week 4'}</span>
              </div>
            </div>

            {/* 2-Column Resolution Velocity Stats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Avg. Resolution</span>
                </div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                  {timeFilter === 'Day' ? '3.8 hrs' : timeFilter === 'Week' ? '4.2 hrs' : timeFilter === 'Year' ? '5.1 days' : '4.6 hrs'}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                  ↓ 18% faster
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Chargesheet Rate</span>
                </div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                  {timeFilter === 'Day' ? '96.2%' : timeFilter === 'Week' ? '91.8%' : timeFilter === 'Year' ? '89.6%' : '90.4%'}
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold font-mono">
                  Benchmark Met
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM TARGET CARD */}
<<<<<<< HEAD
          <div className="mt-4 p-4 rounded-xl bg-[#14141A] text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-mono font-medium">FIELD OPS // PLAN 2026</p>
              <p className="text-xs font-black text-white mt-0.5 uppercase tracking-wide">Clearance Target</p>
=======
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-xs border border-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Plan for 2026</p>
              </div>
              <p className="text-xs font-extrabold text-white mt-0.5">Annual Clearance Target</p>
>>>>>>> 087f0bff3817d2a331610787dc9e0e5782f51f1f
            </div>

            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#2E5FE0]"
                  strokeDasharray="75, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
<<<<<<< HEAD
              <span className="absolute text-[11px] font-black text-white font-mono">
                75%
=======
              <span className="absolute text-[10px] font-black font-mono text-white">
                {timeFilter === 'Day' ? '92%' :
                 timeFilter === 'Week' ? '88%' :
                 timeFilter === 'Year' ? '81%' :
                 '75%'}
>>>>>>> 087f0bff3817d2a331610787dc9e0e5782f51f1f
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

      {/* ── INVESTIGATOR CHRONICLE DOSSIER MODAL WITH SIDE-SCREEN CLICK CLOSE ── */}
      <AnimatePresence>
        {selectedFIR && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedFIR(null);
              }
            }}
            className="fixed inset-0 z-[99999] bg-slate-900/30 backdrop-blur-md overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center items-start scroll-smooth cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl my-4 sm:my-8 bg-[#FAF7F2] rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-300 animate-newspaper-spin cursor-default"
            >
              
              {/* Sticky Top Header with Prominent Red Close Cross (X) Button */}
              <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span className="text-xs font-black uppercase tracking-wider font-mono text-slate-900">
                    INVESTIGATOR CHRONICLE — CASE INTELLIGENCE FILE
                  </span>
                </div>
                
                <button
                  onClick={() => setSelectedFIR(null)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5 hover:scale-105"
                  title="Close FIR Dossier"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Close Chronicle (Esc)</span>
                </button>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
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
