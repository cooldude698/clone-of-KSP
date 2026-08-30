'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, FileText, Camera, Shield,
  ArrowUpDown, ChevronDown, MoreVertical, Wifi,
  Cpu, Car, Laptop, Home, ShieldAlert, Activity,
  Users, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, ChevronRight, X,
  Fingerprint, Clock, Radio, Scale, SlidersHorizontal, GitBranch, Binary, Layers
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
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      
      {/* ── KPI METRIC STRIP (ANALYST DOMAIN TELEMETRY) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'FIRs Analyzed', value: '5,35,815', sub: 'CCTNS Live Ingestion', color: 'text-teal-600' },
          { label: 'Active MO Rings', value: '4 Rings', sub: 'Cross-District Clusters', color: 'text-violet-600' },
          { label: 'Repeat Offenders', value: '8 Flagged', sub: 'High Recidivism Risk', color: 'text-amber-600' },
          { label: 'AI Confidence', value: '97.4%', sub: 'Bayesian Neural Core', color: 'text-cyan-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col gap-1 hover:border-teal-200 transition-colors">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
            <span className={`text-2xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</span>
            <span className="text-[10px] text-slate-400 font-medium">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* ── TOP SECTION: COMMAND DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: ACTIVE DUTY & TACTICAL INTEL (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Intelligence Overview
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Karnataka State Police · SCRB State Crime Intelligence & Pattern Recognition Division
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-700">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Live SCRB Ingestion
              </span>
            </div>
          </div>

          {/* 4-CARD BALANCED INTELLIGENCE GRID (ANALYST TEAL/CYAN/VIOLET PALETTE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* CARD 1: MO PATTERN CLUSTERS */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shadow-xs">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    4 Active Clusters
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    MO Pattern Cluster
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    433MHz Jammer & Key Bypass Ring
                  </h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] font-mono font-bold text-teal-600">
                      Central Bengaluru & Hosur Axis · 14 Linked FIRs
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Cluster Signature</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Electronic Jamming</span>
                </div>
                <Link
                  href="/analyst/patterns"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Inspect MO
                </Link>
              </div>
            </div>

            {/* CARD 2: CROSS-DISTRICT REPEAT-OFFENDER LINKAGE */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center shadow-xs">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                    Syndicate Nexus
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Cross-District Offender Linkage
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    Multi-District Chopshop Nexus
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 pt-1">
                    Bullet Ramesh ↔ Deepak Shetty cross-matching (94.8% confidence correlation).
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Link Analysis</span>
                  <span className="block text-[10px] text-slate-500 font-medium">3 Inter-PS Nodes</span>
                </div>
                <Link
                  href="/analyst/network"
                  className="px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  Inspect Syndicate
                </Link>
              </div>
            </div>

            {/* CARD 3: PREDICTIVE RECIDIVISM MODEL */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                    94.2% AI Score
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Predictive Recidivism Forecast
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    Spatial-Temporal Crime Forecast
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      Peak 22:00–04:00
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 font-mono">
                      Sector 4 Corridors
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Bayesian AI Core</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Risk Map Vector</span>
                </div>
                <Link
                  href="/analyst/heatmap"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  View Heatmap
                </Link>
              </div>
            </div>

            {/* CARD 4: FORENSIC ANOMALY QUEUE */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Action Required
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Automated Forensic Anomaly Queue
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    Unusual Plates & FSL Flags
                  </h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      3 Cloned Plates
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-600">
                      2 Ballistics Delays
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Forensic Scan</span>
                  <span className="block text-[10px] text-slate-500 font-medium">FSL Automated</span>
                </div>
                <Link
                  href="/analyst/workbench"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Review Queue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CASES ANALYZED THIS MONTH + STATE TARGET (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {timeFilter === 'Day'
                  ? 'Cases Analyzed Today'
                  : timeFilter === 'Week'
                  ? 'Cases Analyzed This Week'
                  : timeFilter === 'Year'
                  ? 'Cases Analyzed This Year'
                  : 'Cases Analyzed This Month'}
              </span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  {timeFilter === 'Day'
                    ? '98.1%'
                    : timeFilter === 'Week'
                    ? '95.4%'
                    : timeFilter === 'Year'
                    ? '89.7%'
                    : '92.4%'}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  / {timeFilter === 'Day'
                    ? '28 Case Files'
                    : timeFilter === 'Week'
                    ? '112 Case Files'
                    : timeFilter === 'Year'
                    ? '4,120 Case Files'
                    : '340 Case Files'}
                </span>
              </div>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
              {(['Day', 'Week', 'Month', 'Year'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    timeFilter === tab
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SMOOTH CURVED SVG SPLINE CHART (TEAL #0d9488) */}
            <div className="relative mt-5 h-28 w-full">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="analystChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
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
                  fill="url(#analystChartGrad)"
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
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>

          {/* THE ONE DARK EXCEPTION: SUMMARY / TARGET CARD (TEAL ACCENT) */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">State Intelligence Plan 2026</p>
              <p className="text-xs font-bold text-white mt-0.5">Analyst Extraction Target</p>
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
                  className="text-teal-400"
                  strokeDasharray="90, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-white">90%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: SCRB CRIME DOSSIERS & INTELLIGENCE ARCHIVE ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              SCRB Pattern Analysis & Crime Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Statewide incident records, forensic evidence cross-links & suspect matching
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter pattern dossiers..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-xs"
              />
            </div>
            
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-0.5 shadow-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'open', label: 'Active' },
                { id: 'under_investigation', label: 'Under Review' },
                { id: 'closed', label: 'Archived' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3 pl-2">Case Dossier</th>
                  <th className="pb-3">Crime Category</th>
                  <th className="pb-3">Jurisdiction</th>
                  <th className="pb-3">Date Ingested</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedFIRs.map((fir) => {
                  const Icon = CRIME_ICONS[fir.crime_type] || Shield;
                  return (
                    <tr key={fir.case_number || fir.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block font-mono text-[11px]">
                              {fir.case_number}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px] block">
                              {fir.description || 'No description recorded'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-medium text-slate-700">
                        {CRIME_NAMES[fir.crime_type] || fir.crime_type || 'General'}
                      </td>
                      <td className="py-3.5 text-slate-600">
                        {fir.police_station || fir.district_name || 'Central PS'}
                      </td>
                      <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                        {fmtDate(fir.date_filed)}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            (fir.status || fir.case_status) === 'closed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : (fir.status || fir.case_status) === 'under_investigation'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {fir.status || fir.case_status || 'open'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => setSelectedFIR(fir)}
                          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-[11px] font-bold transition-all shadow-2xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {displayedFIRs.length < filteredFIRs.length && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + 15)}
                className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-all"
              >
                Load More Records ({filteredFIRs.length - displayedFIRs.length} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FIR Detail Modal */}
      {selectedFIR && (
        <InvestigatorWall
          fir={selectedFIR}
          onClose={() => setSelectedFIR(null)}
        />
      )}
    </div>
  );
}
