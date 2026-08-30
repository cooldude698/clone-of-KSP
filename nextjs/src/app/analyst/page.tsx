'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, FileText, Camera, Shield,
  ArrowUpDown, ChevronDown, MoreVertical, Wifi,
  Cpu, Car, Laptop, Home, ShieldAlert, Activity,
  Users, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, ChevronRight, X,
  Fingerprint, GitBranch, Gauge, TrendingUp, Compass, SlidersHorizontal
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS, DEMO_HOTSPOTS } from '@/lib/demo-data';
import { saveFIRsToStore } from '@/lib/fir-store';
import InvestigatorWall from '@/components/InvestigatorWall';
import { useLanguage } from '@/context/LanguageContext';

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
      
      {/* ── KPI METRIC STRIP (TEAL / VIOLET / CYAN PALETTE) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'FIRs Analyzed', value: '5,35,815', sub: 'CCTNS Live Ingestion', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
          { label: 'Active MO Rings', value: '4 Rings', sub: 'Cross-District Clusters', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
          { label: 'Repeat Offenders', value: '8 Flagged', sub: 'High Recidivism Risk', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'AI Confidence', value: '97.4%', sub: 'Bayesian Neural Core', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-[24px] bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <span className={`w-2 h-2 rounded-full ${kpi.bg} ${kpi.color}`} />
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</span>
              <span className="block text-[10px] text-slate-400 font-medium mt-0.5">{kpi.sub}</span>
            </div>
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

          {/* 4-CARD BALANCED INTELLIGENCE GRID (ANALYST-DOMAIN CONTENT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* CARD 1: MO PATTERN CLUSTERS */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shadow-xs">
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
                    <span className="text-[10px] font-mono font-bold text-teal-700">
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

            {/* CARD 2: CROSS-DISTRICT REPEAT-OFFENDER CORRELATIONS */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shadow-xs">
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

            {/* CARD 3: PREDICTIVE MODEL CONFIDENCE BREAKDOWN */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shadow-xs">
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
                      Peak 22:00-04:00
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-[10px] font-semibold text-cyan-700">
                      Sector 4 Corridors
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Bayesian AI Core</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Auto-Calibrated</span>
                </div>
                <Link
                  href="/analyst/heatmap"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  View Heatmap
                </Link>
              </div>
            </div>

            {/* CARD 4: FLAGGED ANOMALIES AWAITING REVIEW */}
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
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      3 Cloned Plates
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-[10px] font-semibold text-rose-700">
                      2 Ballistics Delays
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Forensic Scan</span>
                  <span className="block text-[10px] text-slate-500 font-medium">5 Items Pending</span>
                </div>
                <Link
                  href="/analyst/reports"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Review Queue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CASES ANALYZED GRAPH CARD (4 COLS) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <p className="text-xs font-medium text-slate-500">
                {timeFilter === 'Day' ? 'Cases Analyzed Today' :
                 timeFilter === 'Week' ? 'Cases Analyzed This Week' :
                 timeFilter === 'Year' ? 'Cases Analyzed This Year' :
                 'Cases Analyzed This Month'}
              </p>
              <button className="text-slate-400 hover:text-slate-900">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {timeFilter === 'Day' ? '96.2%' :
               timeFilter === 'Week' ? '94.8%' :
               timeFilter === 'Year' ? '89.1%' :
               '92.4%'}
              <span className="text-sm font-normal text-slate-500 ml-1.5">
                / {timeFilter === 'Day' ? '28 Dossiers' :
                   timeFilter === 'Week' ? '112 Dossiers' :
                   timeFilter === 'Year' ? '4,280 Dossiers' :
                   '340 Case Files'}
              </span>
            </p>

            {/* Time Filter Pills */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mt-4 px-2">
              {['Day', 'Week', 'Month', 'Year'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab as any)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    timeFilter === tab
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SMOOTH CURVED SVG SPLINE CHART IN TEAL */}
            <div className="relative mt-5 h-28 w-full">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="analystTealChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M 0,65 C 20,40 40,80 70,50 C 100,20 120,70 150,45 C 180,20 200,10 230,12 C 250,15 270,70 300,45 L 300,100 L 0,100 Z"
                  fill="url(#analystTealChartGrad)"
                  className="transition-all duration-500"
                />

                <path
                  d="M 0,65 C 20,40 40,80 70,50 C 100,20 120,70 150,45 C 180,20 200,10 230,12 C 250,15 270,70 300,45"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>

          {/* THE ONE DARK EXCEPTION: SUMMARY / TARGET CARD */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] text-teal-300 font-medium">State Intelligence Plan 2026</p>
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

      {/* ── BOTTOM SECTION: CRIME ARCHIVE AND RECENT ANALYSES ── */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Statewide Case Files & Ingested Intelligence Archive
            </h3>
            <p className="text-xs text-slate-500">
              Correlated with cross-district ANPR alerts and CCTNS datastore
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {['all', 'open', 'under_investigation', 'closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* FIRs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-3">Case Number</th>
                <th className="pb-3">Crime Classification</th>
                <th className="pb-3">Originating PS</th>
                <th className="pb-3">Date Registered</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedFIRs.map((f: any) => (
                <tr key={f.case_number} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold text-teal-700 font-mono">{f.case_number}</td>
                  <td className="py-3 font-semibold text-slate-900">{f.crime_type}</td>
                  <td className="py-3 text-slate-600">{f.police_station}</td>
                  <td className="py-3 text-slate-500 font-mono">{f.date_registered || f.date || '2026-05-14'}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                      {f.status || f.case_status || 'Open'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
