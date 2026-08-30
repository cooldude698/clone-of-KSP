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
      {/* ── TOP SECTION: COMMAND DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: ACTIVE DUTY & TACTICAL INTEL (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Operations Command
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Karnataka State Police · Sector 4 Supervisory Command & Fleet Matrix
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live GPS Vector #{tick}
              </span>
            </div>
          </div>

          {/* Toast */}
          {approvedNotification && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{approvedNotification}</span>
            </div>
          )}

          {/* 4-CARD BALANCED INTELLIGENCE GRID (EXACT INSPECTOR STYLE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {/* CARD 1: ACTIVE PATROL FLEETS */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    4 Sectors Active
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Patrol Fleets On Beat
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    {activePatrolCount} Units Operational
                  </h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-600">
                      100% Satellite Connected · 2s Refresh
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Beat Coverage</span>
                  <span className="block text-[10px] text-slate-500 font-medium">PCR & Cheetah Active</span>
                </div>
                <Link
                  href="/supervisor/dispatch"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Fleet Map
                </Link>
              </div>
            </div>

            {/* CARD 2: STATEWIDE 112 RESPONSE TIME */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    SLA Compliant
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    112 Average Response ETA
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    {timeFormatted} Latency
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 pt-1">
                    Sector 4 urban beat benchmark &lt;10m; dispatch to on-scene verified.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Dispatch Queue</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Auto-Routed</span>
                </div>
                <Link
                  href="/supervisor/dispatch"
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-xs flex items-center gap-1"
                >
                  Deploy Patrol
                </Link>
              </div>
            </div>

            {/* CARD 3: PENDING STATUTORY SANCTIONS */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    Action Required
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    SP Statutory Clearance Desk
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    {pendingSanctionsCount} Warrants Pending
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      Goonda Act
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 font-mono">
                      Sec 110 BNSS
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Statutory Orders</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Awaiting Sign-off</span>
                </div>
                <Link
                  href="/supervisor/approvals"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Review Warrants
                </Link>
              </div>
            </div>

            {/* CARD 4: DISPOSAL VELOCITY */}
            <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-xs">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                    {statewideClearanceRate}% Rate
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Division Clearance & Disposal
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    148 Cases Closed (MoM)
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      4 PS Synced
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                      +4.2% Velocity
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900">Officer Metrics</span>
                  <span className="block text-[10px] text-slate-500 font-medium">4 Inspectors</span>
                </div>
                <Link
                  href="/supervisor/performance"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs flex items-center gap-1"
                >
                  Scorecards
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CASES RESOLVED GRAPH CARD (4 COLS) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <p className="text-xs font-medium text-slate-500">
                {timeFilter === 'Day' ? 'Division Disposals Today' :
                 timeFilter === 'Week' ? 'Division Disposals This Week' :
                 timeFilter === 'Year' ? 'Division Disposals This Year' :
                 'Division Disposals This Month'}
              </p>
              <button className="text-slate-400 hover:text-slate-900">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
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
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SMOOTH CURVED SVG SPLINE CHART */}
            <div className="relative mt-5 h-28 w-full">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="supChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1d6fbf" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#1d6fbf" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M 0,65 C 20,40 40,80 70,50 C 100,20 120,70 150,45 C 180,20 200,10 230,12 C 250,15 270,70 300,45 L 300,100 L 0,100 Z"
                  fill="url(#supChartGrad)"
                  className="transition-all duration-500"
                />

                <path
                  d="M 0,65 C 20,40 40,80 70,50 C 100,20 120,70 150,45 C 180,20 200,10 230,12 C 250,15 270,70 300,45"
                  fill="none"
                  stroke="#1d6fbf"
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
              <p className="text-[10px] text-slate-400 font-medium">Sector 4 Plan for 2026</p>
              <p className="text-xs font-bold text-white mt-0.5">Division Clearance Target</p>
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
                  strokeDasharray="85, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-white">85%</span>
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
              className="text-xs font-bold text-blue-600 hover:underline"
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
                <Navigation className="w-4 h-4 text-blue-600" />
                Live Moving Patrol Fleets
              </h3>
              <p className="text-xs text-slate-500">2-second vector positioning</p>
            </div>
            <Link
              href="/supervisor/dispatch"
              className="text-xs font-bold text-blue-600 hover:underline"
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
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {unit.type}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  {unit.officer} · {unit.precinct}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  <span>Speed: <strong className="text-slate-900">{unit.speedKmH} km/h</strong></span>
                  <span>Fuel: <strong className="text-emerald-600">{unit.fuel}%</strong></span>
                  <span className="text-blue-600 font-bold">{unit.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
