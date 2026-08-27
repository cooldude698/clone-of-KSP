'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, FileText, Camera, Shield,
  ArrowUpDown, ChevronDown, MoreVertical, Wifi,
  Cpu, Car, Laptop, Home, ShieldAlert, Activity,
  Users, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles
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

          {/* 4-CARD BALANCED INTELLIGENCE GRID (Clean Minimalist Design) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* CARD 1: CRIME NETWORK / SYNDICATE */}
            <div
              className="rounded-[28px] bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_16px_36px_rgb(0,0,0,0.07)] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200/80 dark:border-gray-700 flex items-center justify-center shadow-xs">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    Syndicate Intel
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    KSP Intelligence · Indiranagar
                  </p>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                    Night Chain-Snatching Syndicate
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                      3 Incidents / 48h
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300 font-mono">
                      KA-01-MJ-8821
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">92% Risk Score</span>
                  <span className="block text-[10px] text-gray-400 font-medium">High Priority Cluster</span>
                </div>
                <Link
                  href="/dashboard/network"
                  className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Investigate
                </Link>
              </div>
            </div>

            {/* CARD 2: CRITICAL HOTSPOT */}
            <div
              className="rounded-[28px] bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_16px_36px_rgb(0,0,0,0.07)] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200/80 dark:border-gray-700 flex items-center justify-center shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    Hotspot Advisory
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Sector 4 Command · Bengaluru South
                  </p>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                    Koramangala 5th Block
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                      34 FIRs Active
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                      Hoysala 14 Deployed
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">Active Patrol</span>
                  <span className="block text-[10px] text-gray-400 font-medium">Static Checkpoint</span>
                </div>
                <Link
                  href="/dashboard/map"
                  className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Crime Map
                </Link>
              </div>
            </div>

            {/* CARD 3: REPEAT SUSPECT SIGHTING */}
            <div
              className="rounded-[28px] bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_16px_36px_rgb(0,0,0,0.07)] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200/80 dark:border-gray-700 flex items-center justify-center shadow-xs font-extrabold text-xs">
                    VN
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    Watchlist Hit
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    ANPR Hit 14m ago · Indiranagar
                  </p>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                    Vicky &ldquo;The Snake&rdquo; (Repeat)
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                      Non-Bailable Warrant
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300 font-mono">
                      SUS-7701
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">Active Warrant</span>
                  <span className="block text-[10px] text-gray-400 font-medium">Patrol Alerted</span>
                </div>
                <Link
                  href="/dashboard/suspect"
                  className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Track Suspect
                </Link>
              </div>
            </div>

            {/* CARD 4: ANPR SENSOR TELEMETRY */}
            <div
              className="rounded-[28px] bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_16px_36px_rgb(0,0,0,0.07)] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200/80 dark:border-gray-700 flex items-center justify-center shadow-xs">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    99.4% Grid Uptime
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Surveillance Network · Bengaluru City
                  </p>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                    12,500+ ANPR Nodes Active
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                      14 PCR Units
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                      Optical Sync Live
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">Sensor Grid</span>
                  <span className="block text-[10px] text-gray-400 font-medium">Real-Time Streams</span>
                </div>
                <Link
                  href="/dashboard/surveillance"
                  className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  View Feed
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: CASES RESOLVED GRAPH CARD (4 COLS) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between text-gray-400">
              <p className="text-xs font-medium text-gray-400">
                {timeFilter === 'Day' ? 'Cases Resolved Today' :
                 timeFilter === 'Week' ? 'Cases Resolved This Week' :
                 timeFilter === 'Year' ? 'Cases Resolved This Year' :
                 'Cases Resolved This Month'}
              </p>
              <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
              {timeFilter === 'Day' ? '92.0%' :
               timeFilter === 'Week' ? '88.2%' :
               timeFilter === 'Year' ? '81.4%' :
               '84.5%'}
              <span className="text-sm font-medium text-gray-400 font-normal ml-1.5">
                / {timeFilter === 'Day' ? '12 Dossiers' :
                   timeFilter === 'Week' ? '48 Dossiers' :
                   timeFilter === 'Year' ? '1,840 Dossiers' :
                   '152 Dossiers'}
              </span>
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

            {/* DYNAMIC SMOOTH CURVED SVG BEZIER SPLINE CHART */}
            <div className="relative mt-5 h-28 w-full">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Dynamic Area fill */}
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

                {/* Dynamic Stroke curve */}
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
                  stroke="#18181B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Active Indicator Line & Node */}
                {timeFilter === 'Day' && (
                  <>
                    <line x1="260" y1="18" x2="260" y2="100" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="260" cy="18" r="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
                  </>
                )}
                {timeFilter === 'Week' && (
                  <>
                    <line x1="210" y1="14" x2="210" y2="100" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="210" cy="14" r="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
                  </>
                )}
                {timeFilter === 'Month' && (
                  <>
                    <line x1="230" y1="12" x2="230" y2="100" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="230" cy="12" r="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
                  </>
                )}
                {timeFilter === 'Year' && (
                  <>
                    <line x1="275" y1="12" x2="275" y2="100" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="275" cy="12" r="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
                  </>
                )}
              </svg>

              {/* Dynamic Active Tag */}
              <div
                className={`absolute px-2 py-0.5 rounded-full bg-black text-white text-[9px] font-bold shadow-sm transition-all duration-300 ${
                  timeFilter === 'Day' ? 'top-[82px] left-[84%] -translate-x-1/2' :
                  timeFilter === 'Week' ? 'top-[82px] left-[68%] -translate-x-1/2' :
                  timeFilter === 'Year' ? 'top-[82px] left-[89%] -translate-x-1/2' :
                  'top-[88px] left-[73%] -translate-x-1/2'
                }`}
              >
                {timeFilter === 'Day' ? '20:00' :
                 timeFilter === 'Week' ? 'Fri' :
                 timeFilter === 'Year' ? '2026' :
                 'Oct'}
              </div>
            </div>

            {/* Dynamic Axis Labels */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold mt-4 px-1">
              {timeFilter === 'Day' ? (
                <>
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span className="text-black dark:text-white font-bold">20:00</span>
                  <span>Now</span>
                </>
              ) : timeFilter === 'Week' ? (
                <>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span className="text-black dark:text-white font-bold">Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </>
              ) : timeFilter === 'Year' ? (
                <>
                  <span>2020</span>
                  <span>2021</span>
                  <span>2022</span>
                  <span>2023</span>
                  <span>2024</span>
                  <span>2025</span>
                  <span className="text-black dark:text-white font-bold">2026</span>
                </>
              ) : (
                <>
                  <span>May</span>
                  <span>June</span>
                  <span>July</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span className="text-black dark:text-white font-bold">Oct</span>
                  <span>Nov</span>
                </>
              )}
            </div>
          </div>

          {/* BOTTOM DARK TARGET CARD */}
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

        {/* Table Column Header */}
        <div className="hidden sm:grid grid-cols-12 items-center px-4 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 gap-4">
          <div className="col-span-6">Case & Incident</div>
          <div className="col-span-3">Date Filed</div>
          <div className="col-span-3 text-right pr-9">Status / Case ID</div>
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
                className="group grid grid-cols-12 items-center py-3.5 px-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 rounded-2xl transition-colors cursor-pointer gap-4"
              >
                {/* Left: Squircle Icon + Title */}
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-gray-900 dark:text-white">
                    <CrimeIcon className="w-4 h-4" />
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

                {/* Middle: Date (Rock solid column alignment) */}
                <div className="hidden sm:flex sm:col-span-3 items-center text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                  {fmtDate(fir.date_filed)}
                </div>

                {/* Right: Case Number & Status */}
                <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-3">
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
                    className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
