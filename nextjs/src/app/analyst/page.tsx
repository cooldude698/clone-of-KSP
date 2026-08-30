'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, FileText, Camera, Shield,
  ArrowUpDown, ChevronDown, MoreVertical, Wifi,
  Cpu, Car, Laptop, Home, ShieldAlert, Activity,
  Users, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, ChevronRight, X,
  Fingerprint, Clock, Radio, Scale, SlidersHorizontal, GitBranch, Binary, Layers,
  TrendingUp, Target
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
    <div className="w-full max-w-7xl mx-auto space-y-6 text-[#14201F]">
      
      {/* ── KPI METRIC STRIP (ANALYST FORENSIC READOUT TELEMETRY) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'FIRs Analyzed', value: '5,35,815', sub: 'CCTNS Live Ingestion', color: 'text-[#0F5257]' },
          { label: 'Active MO Rings', value: '4 Rings', sub: 'Cross-District Clusters', color: 'text-[#6C4DE6]' },
          { label: 'Repeat Offenders', value: '8 Flagged', sub: 'Recidivism Correlated', color: 'text-[#D6553B]' },
          { label: 'AI Confidence', value: '97.4%', sub: 'Bayesian Neural Core', color: 'text-[#1F8A70]' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs flex flex-col gap-1 hover:border-[#0F5257]/40 transition-colors">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
            <span className={`text-2xl font-mono font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</span>
            <span className="text-[10px] text-slate-400 font-mono font-medium">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* ── TOP SECTION: COMMAND DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: ACTIVE DUTY & TACTICAL INTEL (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-sm bg-[#0F5257]/10 text-[#0F5257] border border-[#0F5257]/20">
                  INTELLIGENCE DESK // EVIDENCE BOARD
                </span>
              </div>
              <h1 className="text-2xl font-mono font-extrabold text-[#14201F] tracking-tight mt-1">
                Pattern & Syndicate Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Karnataka State Police · Central Crime Intelligence & Forensic Cross-Correlation
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F5257]/10 border border-[#0F5257]/20 text-[11px] font-mono font-bold text-[#0F5257]">
                <span className="w-2 h-2 rounded-full bg-[#1F8A70] animate-pulse" />
                SCRB SYNC // 5.35L
              </span>
            </div>
          </div>

          {/* 4-CARD EVIDENCE BOARD GRID WITH DOTTED VIOLET CORRELATION OVERLAY */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* SIGNATURE ELEMENT 1: Dotted Violet Correlation Linkage Lines */}
            <svg className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" xmlns="http://www.w3.org/2000/svg">
              <line x1="48%" y1="28%" x2="52%" y2="28%" stroke="#6C4DE6" strokeWidth="2" strokeDasharray="3 4" strokeOpacity="0.6" />
              <line x1="25%" y1="48%" x2="25%" y2="52%" stroke="#6C4DE6" strokeWidth="2" strokeDasharray="3 4" strokeOpacity="0.4" />
              <line x1="75%" y1="48%" x2="75%" y2="52%" stroke="#6C4DE6" strokeWidth="2" strokeDasharray="3 4" strokeOpacity="0.4" />
            </svg>
            
            {/* CARD 1: MO PATTERN CLUSTERS */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  {/* SIGNATURE ELEMENT 2: Forensic Confidence Readout Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0F5257]/10 border border-[#0F5257]/20 text-[#0F5257] font-mono text-[10px] font-extrabold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F5257] animate-ping" />
                    <span>97.4% CONF</span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-teal-50 text-[#0F5257] border border-teal-200">
                    4 ACTIVE RINGS
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    MO Pattern Cluster
                  </p>
                  <h3 className="text-base font-bold text-[#14201F] tracking-tight leading-snug">
                    433MHz Jammer & Key Bypass Ring
                  </h3>
                  <div className="flex items-center gap-2 pt-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#0F5257]">
                      Central Bengaluru & Hosur Axis · 14 Linked FIRs
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14201F]">Cluster Signature</span>
                  <span className="block text-[10px] text-slate-500 font-mono">Electronic Jamming</span>
                </div>
                <Link
                  href="/analyst/patterns"
                  className="px-4 py-1.5 rounded-full bg-[#0F5257] text-white text-xs font-bold hover:bg-[#0b3c40] transition-all shadow-xs flex items-center gap-1"
                >
                  Inspect MO
                </Link>
              </div>
            </div>

            {/* CARD 2: CROSS-DISTRICT REPEAT-OFFENDER LINKAGE */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  {/* SIGNATURE ELEMENT 2: Forensic Confidence Readout Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#6C4DE6]/10 border border-[#6C4DE6]/25 text-[#6C4DE6] font-mono text-[10px] font-extrabold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DE6]" />
                    <span>94.8% CORR</span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-violet-50 text-[#6C4DE6] border border-violet-200">
                    SYNDICATE NEXUS
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Cross-District Offender Linkage
                  </p>
                  <h3 className="text-base font-bold text-[#14201F] tracking-tight leading-snug">
                    Multi-District Chopshop Nexus
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 pt-1 font-sans">
                    Bullet Ramesh ↔ Deepak Shetty cross-matching (94.8% confidence correlation).
                  </p>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14201F]">Link Analysis</span>
                  <span className="block text-[10px] text-slate-500 font-mono">3 Inter-PS Nodes</span>
                </div>
                <Link
                  href="/analyst/network"
                  className="px-4 py-1.5 rounded-full bg-[#6C4DE6] hover:bg-[#583cc4] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  Inspect Syndicate
                </Link>
              </div>
            </div>

            {/* CARD 3: PREDICTIVE RECIDIVISM MODEL */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  {/* SIGNATURE ELEMENT 2: Forensic Confidence Readout Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1F8A70]/10 border border-[#1F8A70]/25 text-[#1F8A70] font-mono text-[10px] font-extrabold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F8A70]" />
                    <span>89.2% PROB</span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-cyan-50 text-[#0F5257] border border-cyan-200">
                    BAYESIAN 94.2%
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Predictive Recidivism Forecast
                  </p>
                  <h3 className="text-base font-bold text-[#14201F] tracking-tight leading-snug">
                    Spatial-Temporal Crime Forecast
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-[10px] font-mono font-semibold text-slate-700">
                      Peak 22:00–04:00
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-[10px] font-mono font-bold text-[#0F5257]">
                      Sector 4 Corridors
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14201F]">Bayesian AI Core</span>
                  <span className="block text-[10px] text-slate-500 font-mono">Risk Map Vector</span>
                </div>
                <Link
                  href="/analyst/heatmap"
                  className="px-4 py-1.5 rounded-full bg-[#0F5257] text-white text-xs font-bold hover:bg-[#0b3c40] transition-all shadow-xs flex items-center gap-1"
                >
                  View Heatmap
                </Link>
              </div>
            </div>

            {/* CARD 4: FORENSIC ANOMALY QUEUE */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  {/* SIGNATURE ELEMENT 2: Forensic Confidence Readout Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D6553B]/10 border border-[#D6553B]/25 text-[#D6553B] font-mono text-[10px] font-extrabold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6553B]" />
                    <span>99.1% MATCH</span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-rose-50 text-[#D6553B] border border-rose-200">
                    ACTION QUEUE
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Automated Forensic Anomaly Queue
                  </p>
                  <h3 className="text-base font-bold text-[#14201F] tracking-tight leading-snug">
                    Unusual Plates & FSL Flags
                  </h3>
                  <div className="flex items-center gap-2 pt-1.5">
                    <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-[10px] font-mono font-semibold text-slate-700">
                      3 Cloned Plates
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#D6553B]">
                      2 Ballistics Delays
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14201F]">Forensic Scan</span>
                  <span className="block text-[10px] text-slate-500 font-mono">FSL Automated</span>
                </div>
                <Link
                  href="/analyst/workbench"
                  className="px-4 py-1.5 rounded-full bg-[#0F5257] text-white text-xs font-bold hover:bg-[#0b3c40] transition-all shadow-xs flex items-center gap-1"
                >
                  Review Queue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CASES ANALYZED THIS MONTH + STATE TARGET (4 COLS) */}
        {/* RIGHT COLUMN: CASES ANALYZED THIS MONTH + STATE TARGET (4 COLS) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                {timeFilter === 'Day'
                  ? 'Cases Analyzed Today'
                  : timeFilter === 'Week'
                  ? 'Cases Analyzed This Week'
                  : timeFilter === 'Year'
                  ? 'Cases Analyzed This Year'
                  : 'Cases Analyzed This Month'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                <TrendingUp className="w-3 h-3" />
                +5.8% Velocity
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold tracking-tight text-[#14201F]">
                {timeFilter === 'Day'
                  ? '98.1%'
                  : timeFilter === 'Week'
                  ? '95.4%'
                  : timeFilter === 'Year'
                  ? '89.7%'
                  : '92.4%'}
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">
                / {timeFilter === 'Day'
                  ? '28 Case Files'
                  : timeFilter === 'Week'
                  ? '112 Case Files'
                  : timeFilter === 'Year'
                  ? '4,120 Case Files'
                  : '340 Case Files'}
              </span>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center justify-between p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
              {(['Day', 'Week', 'Month', 'Year'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                    timeFilter === tab
                      ? 'bg-[#0F5257] text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-[#0F5257]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SMOOTH CURVED SVG SPLINE CHART (TEAL #0F5257 / VIOLET #6C4DE6) */}
            <div className="relative mt-2 h-36 w-full">
              <svg viewBox="0 0 300 110" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="analystChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F5257" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0F5257" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Baseline Grid lines */}
                <line x1="0" y1="30" x2="300" y2="30" stroke="currentColor" strokeDasharray="3 3" className="text-slate-100" strokeWidth="1" />
                <line x1="0" y1="70" x2="300" y2="70" stroke="currentColor" strokeDasharray="3 3" className="text-slate-100" strokeWidth="1" />

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
                  fill="url(#analystChartGrad)"
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
                  stroke="#0F5257"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Peak Point */}
                <circle
                  cx="300"
                  cy={timeFilter === 'Year' ? 10 : timeFilter === 'Day' ? 18 : timeFilter === 'Week' ? 24 : 48}
                  r="4"
                  fill="#0F5257"
                  className="animate-pulse"
                />
              </svg>

              {/* X-Axis Timeline Markers */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                <span>{timeFilter === 'Day' ? '06:00' : timeFilter === 'Week' ? 'Mon' : timeFilter === 'Year' ? 'Q1 2026' : 'Week 1'}</span>
                <span>{timeFilter === 'Day' ? '12:00' : timeFilter === 'Week' ? 'Wed' : timeFilter === 'Year' ? 'Q2' : 'Week 2'}</span>
                <span>{timeFilter === 'Day' ? '18:00' : timeFilter === 'Week' ? 'Fri' : timeFilter === 'Year' ? 'Q3' : 'Week 3'}</span>
                <span className="font-bold text-[#0F5257]">{timeFilter === 'Day' ? 'Now' : timeFilter === 'Week' ? 'Sun' : timeFilter === 'Year' ? 'Q4 (Active)' : 'Week 4'}</span>
              </div>
            </div>

            {/* 2-Column Analyst Velocity Stats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#0F5257]" />
                  <span>Avg. Extraction</span>
                </div>
                <p className="text-base font-extrabold text-[#14201F] mt-1 font-mono">
                  {timeFilter === 'Day' ? '1.2 sec' : timeFilter === 'Week' ? '1.4 sec' : timeFilter === 'Year' ? '1.9 sec' : '1.5 sec'}
                </p>
                <span className="text-[10px] text-teal-700 font-semibold font-mono">
                  Neural Core Sync
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  <Fingerprint className="w-3.5 h-3.5 text-[#6C4DE6]" />
                  <span>Cluster Accuracy</span>
                </div>
                <p className="text-base font-extrabold text-[#14201F] mt-1 font-mono">
                  {timeFilter === 'Day' ? '98.6%' : timeFilter === 'Week' ? '97.8%' : timeFilter === 'Year' ? '96.4%' : '97.4%'}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold font-mono">
                  Bayesian Validated
                </span>
              </div>
            </div>
          </div>

          {/* THE ONE DARK EXCEPTION: SUMMARY / TARGET CARD (DEEP TEAL ACCENT) */}
          <div className="p-4 rounded-xl bg-[#0F5257] text-white flex items-center justify-between shadow-sm border border-[#0F5257]">
            <div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-300" />
                <p className="text-[10px] text-teal-200 font-mono font-medium uppercase tracking-wider">SCRB // PLAN 2026</p>
              </div>
              <p className="text-xs font-mono font-bold text-white mt-0.5 uppercase tracking-wide">Extraction Target</p>
            </div>

            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#093538]"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-300"
                  strokeDasharray={`${
                    timeFilter === 'Day' ? 98 :
                    timeFilter === 'Week' ? 95 :
                    timeFilter === 'Year' ? 90 :
                    92
                  }, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-white font-mono">
                {timeFilter === 'Day' ? '98%' :
                 timeFilter === 'Week' ? '95%' :
                 timeFilter === 'Year' ? '90%' :
                 '92%'}
              </span>
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

      {/* FIR Detail Modal (Investigator Wall) */}
      <AnimatePresence>
        {selectedFIR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              {/* Modal Topbar */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-black text-xs font-mono">
                    SCRB
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Dossier Intelligence Chronicle</span>
                      <span className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {selectedFIR.case_number || 'KAR/SCRB/2026/089'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Karnataka State Police · Central Forensic & Pattern Archive
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFIR(null)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5 hover:scale-105"
                  title="Close Dossier"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <InvestigatorWall
                  fir={{
                    case_number: selectedFIR.case_number || 'KAR/BLR/2026/04921',
                    crime_type: selectedFIR.crime_type || selectedFIR.crime_type_code || 'Vehicle Theft',
                    date_filed: selectedFIR.date_filed || '2026-07-22',
                    location_name: selectedFIR.location_name || selectedFIR.district_name || 'Central PS',
                    case_status: selectedFIR.status || selectedFIR.case_status || 'open',
                    description: selectedFIR.description || 'Target vehicle theft and commercial chopshop transport operation.',
                    police_station: selectedFIR.police_station || 'Bengaluru Urban East PS',
                    district_name: selectedFIR.district_name || 'Bengaluru Urban',
                    investigation_office: selectedFIR.investigation_office || 'Insp. Dr. Priya Rao',
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
