'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Navigation,
  Clock,
  FileCheck,
  ShieldAlert,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Building2,
  Users,
  Zap,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Gauge,
  Shield,
  Search,
  MoreVertical,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupervisorTelemetry } from '@/context/SupervisorTelemetryContext';

export default function SupervisorOperationsCommandHub() {
  const {
    tick,
    lastUpdated,
    activePatrolCount,
    avgResponseTimeSec,
    pendingSanctionsCount,
    statewideClearanceRate,
    patrolUnits,
    sanctions,
    districtAudits,
    recentRadioCalls,
    approveSanction,
  } = useSupervisorTelemetry();

  const [timeFilter, setTimeFilter] = useState('Month');
  const [approvedNotification, setApprovedNotification] = useState('');

  const handleQuickApprove = (id: string, name: string) => {
    approveSanction(id);
    setApprovedNotification(`Approved statutory sanction for ${name}`);
    setTimeout(() => setApprovedNotification(''), 4000);
  };

  const minutes = Math.floor(avgResponseTimeSec / 60);
  const seconds = avgResponseTimeSec % 60;
  const timeFormatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      
      {/* ── TOP KPI METRIC STRIP (DIVISION-LEVEL OPERATIONAL METRICS) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Patrol Fleets', value: `${activePatrolCount} Units`, sub: '100% GPS Vector Connected', color: 'text-indigo-600' },
          { label: '112 Average Response', value: timeFormatted, sub: 'Sector 4 Beat Benchmark <10m', color: 'text-emerald-600' },
          { label: 'Pending Sanctions', value: `${pendingSanctionsCount} Warrants`, sub: 'SP Statutory Clearance Desk', color: 'text-rose-600' },
          { label: 'Disposal Velocity', value: `${statewideClearanceRate}%`, sub: '148 Cases Closed (MoM)', color: 'text-indigo-700' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col gap-1 hover:border-indigo-200 transition-colors">
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
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-sm bg-[#1B2A4A]/10 text-[#1B2A4A] border border-[#1B2A4A]/25">
                  DIVISION COMMAND // PLOTTING BOARD
                </span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#1B2A4A] tracking-tight mt-1">
                Operations & Sector Command
              </h1>
              <p className="text-xs text-[#1C1F26]/70 mt-0.5 font-sans">
                Karnataka State Police · Sector 4 Supervisory Command & Jurisdiction Matrix
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B2A4A]/10 border border-[#1B2A4A]/25 text-[11px] font-mono font-bold text-[#1B2A4A]">
                <span className="w-2 h-2 rounded-full bg-[#C48A3A] animate-pulse" />
                SEC-4 // VECTOR #{tick}
              </span>
            </div>
          </div>

          {/* Toast */}
          {approvedNotification && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{approvedNotification}</span>
            </div>
          )}

          {/* 4-CARD PLOTTING BOARD GRID (SUPERVISOR SERIF + SECTOR TAGS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* CARD 1: ACTIVE PATROL FLEETS */}
            <div className="rounded-2xl bg-white/95 border border-[#1B2A4A]/20 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1B2A4A]/10 text-[#1B2A4A] border border-[#1B2A4A]/20 flex items-center justify-center">
                    <Navigation className="w-5 h-5" />
                  </div>
                  
                  {/* SIGNATURE ELEMENT: Monospace Sector Reference Tag */}
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm bg-[#1B2A4A]/5 border border-[#1B2A4A]/25 text-[#1B2A4A] tracking-wider">
                    SEC-4 // FLEET-V1
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#1C1F26]/60 font-medium">
                    Patrol Fleets On Beat
                  </p>
                  <h3 className="text-lg font-serif font-bold text-[#1B2A4A] tracking-tight leading-snug">
                    {activePatrolCount} Units Operational
                  </h3>
                  <div className="flex items-center gap-2 pt-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#3D6B6B]">
                      100% Satellite Sync · 2s Sector Refresh
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-[#1B2A4A]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A]">Beat Coverage</span>
                  <span className="block text-[10px] text-[#1C1F26]/60 font-mono">PCR & Cheetah Active</span>
                </div>
                <Link
                  href="/supervisor/dispatch"
                  className="px-4 py-1.5 rounded-full bg-[#1B2A4A] text-white text-xs font-bold hover:bg-[#253961] transition-all shadow-xs flex items-center gap-1"
                >
                  Fleet Map
                </Link>
              </div>
            </div>

            {/* CARD 2: 112 RESPONSE TIME */}
            <div className="rounded-2xl bg-white/95 border border-[#1B2A4A]/20 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#3D6B6B] border border-emerald-200 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  
                  {/* SIGNATURE ELEMENT: Monospace Sector Reference Tag */}
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 border border-emerald-200 text-[#3D6B6B] tracking-wider">
                    SEC-4 // SLA-01
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#1C1F26]/60 font-medium">
                    112 Average Response ETA
                  </p>
                  <h3 className="text-lg font-serif font-bold text-[#1B2A4A] tracking-tight leading-snug">
                    {timeFormatted} Latency
                  </h3>
                  <p className="text-[11px] text-[#1C1F26]/70 line-clamp-2 pt-1 font-sans">
                    Sector 4 urban beat benchmark &lt;10m; dispatch to on-scene verified.
                  </p>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-[#1B2A4A]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A]">Dispatch Queue</span>
                  <span className="block text-[10px] text-[#1C1F26]/60 font-mono">Auto-Routed</span>
                </div>
                <Link
                  href="/supervisor/dispatch"
                  className="px-4 py-1.5 rounded-full bg-[#C48A3A] hover:bg-[#a8752e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  Deploy Patrol
                </Link>
              </div>
            </div>

            {/* CARD 3: STATUTORY SANCTIONS DESK */}
            <div className="rounded-2xl bg-white/95 border border-[#1B2A4A]/20 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#B23A2E] border border-rose-200 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  
                  {/* SIGNATURE ELEMENT: Monospace Sector Reference Tag */}
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm bg-rose-50 border border-rose-200 text-[#B23A2E] tracking-wider">
                    SEC-4 // SANCTION-02
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#1C1F26]/60 font-medium">
                    SP Statutory Clearance Desk
                  </p>
                  <h3 className="text-lg font-serif font-bold text-[#1B2A4A] tracking-tight leading-snug">
                    {pendingSanctionsCount} Warrants Pending
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="px-2 py-0.5 rounded-sm bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 text-[10px] font-semibold text-[#1C1F26]">
                      Goonda Act
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 text-[10px] font-mono font-bold text-[#1B2A4A]">
                      Sec 110 BNSS
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-[#1B2A4A]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A]">Statutory Orders</span>
                  <span className="block text-[10px] text-[#1C1F26]/60 font-mono">Awaiting Sign-off</span>
                </div>
                <Link
                  href="/supervisor/approvals"
                  className="px-4 py-1.5 rounded-full bg-[#1B2A4A] text-white text-xs font-bold hover:bg-[#253961] transition-all shadow-xs flex items-center gap-1"
                >
                  Review Warrants
                </Link>
              </div>
            </div>

            {/* CARD 4: CLEARANCE VELOCITY */}
            <div className="rounded-2xl bg-white/95 border border-[#1B2A4A]/20 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1B2A4A]/10 text-[#1B2A4A] border border-[#1B2A4A]/20 flex items-center justify-center">
                    <Gauge className="w-5 h-5" />
                  </div>
                  
                  {/* SIGNATURE ELEMENT: Monospace Sector Reference Tag */}
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm bg-[#1B2A4A]/5 border border-[#1B2A4A]/25 text-[#1B2A4A] tracking-wider">
                    SEC-4 // GRID-B7
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#1C1F26]/60 font-medium">
                    Division Clearance & Disposal
                  </p>
                  <h3 className="text-lg font-serif font-bold text-[#1B2A4A] tracking-tight leading-snug">
                    148 Cases Closed (MoM)
                  </h3>
                  <div className="flex items-center gap-2 pt-1.5">
                    <span className="px-2 py-0.5 rounded-sm bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 text-[10px] font-semibold text-[#1C1F26]">
                      4 PS Synced
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#3D6B6B]">
                      +4.2% Velocity
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-[#1B2A4A]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1B2A4A]">Officer Metrics</span>
                  <span className="block text-[10px] text-[#1C1F26]/60 font-mono">4 Inspectors</span>
                </div>
                <Link
                  href="/supervisor/performance"
                  className="px-4 py-1.5 rounded-full bg-[#1B2A4A] text-white text-xs font-bold hover:bg-[#253961] transition-all shadow-xs flex items-center gap-1"
                >
                  Scorecards
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DIVISION DISPOSALS THIS MONTH + SECTOR 4 TARGET (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="rounded-2xl bg-white/95 border border-[#1B2A4A]/20 p-5 shadow-2xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1F26]/70">
                {timeFilter === 'Day'
                  ? 'Division Disposals Today'
                  : timeFilter === 'Week'
                  ? 'Division Disposals This Week'
                  : timeFilter === 'Year'
                  ? 'Division Disposals This Year'
                  : 'Division Disposals This Month'}
              </span>
              <button className="text-[#1C1F26]/40 hover:text-[#1B2A4A] transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#1B2A4A]">
                  {timeFilter === 'Day'
                    ? '94.2%'
                    : timeFilter === 'Week'
                    ? '89.0%'
                    : timeFilter === 'Year'
                    ? '82.1%'
                    : `${statewideClearanceRate}%`}
                </span>
                <span className="text-xs font-mono font-medium text-[#1C1F26]/60">
                  / {timeFilter === 'Day'
                    ? '18 Dossiers'
                    : timeFilter === 'Week'
                    ? '64 Dossiers'
                    : timeFilter === 'Year'
                    ? '1,940 Dossiers'
                    : '152 Dossiers'}
                </span>
              </div>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1B2A4A]/10 text-xs font-mono font-semibold text-[#1C1F26]/60">
              {['Day', 'Week', 'Month', 'Year'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    timeFilter === tab
                      ? 'bg-[#1B2A4A] text-white shadow-xs font-bold'
                      : 'hover:text-[#1B2A4A]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SMOOTH CURVED SVG SPLINE CHART (INDIGO #1B2A4A) */}
            <div className="relative mt-5 h-28 w-full">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="supChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B2A4A" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1B2A4A" stopOpacity="0.0" />
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
                  fill="url(#supChartGrad)"
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
                  stroke="#1B2A4A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>

          {/* THE ONE DARK EXCEPTION: SUMMARY / TARGET CARD (INDIGO ACCENT) */}
          <div className="mt-4 p-4 rounded-xl bg-[#1B2A4A] text-white flex items-center justify-between shadow-sm border border-[#1B2A4A]">
            <div>
              <p className="text-[10px] text-slate-300 font-mono font-medium">SEC-4 // PLAN 2026</p>
              <p className="text-xs font-serif font-bold text-white mt-0.5">Division Clearance Target</p>
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
                  className="text-[#C48A3A]"
                  strokeDasharray="85, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-white font-mono">
                85%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: STATION WORKLOAD MATRIX & PATROL FEED ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Police Station Workload Table (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Division Police Station Workload Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Disposal velocities, charge sheet turnaround times and station backlogs
              </p>
            </div>
            <Link
              href="/supervisor/performance"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              View Roster →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Station / District</th>
                  <th className="pb-3">Disposal Rate</th>
                  <th className="pb-3">Charge Sheet SLA</th>
                  <th className="pb-3">Avg Response</th>
                  <th className="pb-3">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtAudits.map((d) => (
                  <tr key={d.district} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-900">{d.district}</td>
                    <td className="py-3 font-bold text-emerald-600">{d.disposalRate}%</td>
                    <td className="py-3 text-slate-600">{d.chargeSheetCompliance}% within 60d</td>
                    <td className="py-3 text-slate-600">{d.avgResponseMin} mins</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          d.underreportingRisk === 'LOW'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : d.underreportingRisk === 'MODERATE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {d.underreportingRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Moving Patrol Units List (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-indigo-600" />
                Live Moving Patrol Fleets
              </h3>
              <p className="text-xs text-slate-500">2-second vector positioning</p>
            </div>
            <Link
              href="/supervisor/dispatch"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Full Map →
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 mt-1">
            {patrolUnits.slice(0, 4).map((unit) => (
              <div
                key={unit.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {unit.callsign}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {unit.type}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  {unit.officer} · {unit.precinct}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  <span>Speed: <strong className="text-slate-900">{unit.speedKmH} km/h</strong></span>
                  <span>Fuel: <strong className="text-emerald-600">{unit.fuel}%</strong></span>
                  <span className="text-indigo-600 font-bold">{unit.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
