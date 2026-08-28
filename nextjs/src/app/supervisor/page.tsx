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
  TrendingDown,
  Building2,
  Users,
  Zap,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Gauge
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
    <div className="flex flex-col gap-6 pb-12">
      {/* ── TOP BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            State Operations & Fleet Command
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono mt-1">
            Supervisory command oversight, live 2s moving patrol fleet dispatch, inter-district audit & statutory sanction queue.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono self-start sm:self-center shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
          <span className="text-[var(--text-secondary)] font-bold uppercase text-[10px]">2s DYNAMIC GPS:</span>
          <span className="text-[11px] text-[var(--text-primary)] font-bold" suppressHydrationWarning>Moving Cycle #{tick}</span>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {approvedNotification && (
        <div className="p-3.5 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{approvedNotification}</span>
        </div>
      )}

      {/* ── 4 KEY EXECUTIVE KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Patrol Units */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Patrol Fleets On Beat
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--cyan-accent)]/10 text-[var(--cyan-accent)] flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)]" suppressHydrationWarning>
              {activePatrolCount} Units
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--status-success)] mt-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              <span>2s Continuous Vector Sync</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: 112 Emergency ETA */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Avg 112 Response Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--status-success)]/10 text-[var(--status-success)] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-[var(--status-success)]" suppressHydrationWarning>
              {timeFormatted}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--status-success)] mt-1 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-42s improvement WoW</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Pending Statutory Sanctions */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Pending SP Sanctions
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--status-critical)]/10 text-[var(--status-critical)] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-[var(--status-critical)]" suppressHydrationWarning>
              {pendingSanctionsCount} Warrants
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--status-warning)] mt-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>2 critical Goonda Act requests</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Statewide Clearance Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Disposal & Clearance
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)]" suppressHydrationWarning>
              {statewideClearanceRate}%
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--status-success)] mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Exceeds Target (80.0%)</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── MIDDLE SECTION: LIVE 2S FLEET MONITOR & PENDING SANCTIONS QUEUE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Patrol Units Moving Stream */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[var(--cyan-accent)] animate-pulse" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Live 2s Patrol Fleet Coordinates & Heading
              </h2>
            </div>
            <Link
              href="/supervisor/dispatch"
              className="text-xs font-mono text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              Open Full 2s Map Tracker <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patrolUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-2 font-mono text-xs hover:border-[var(--cyan-accent)]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)] text-sm">{unit.callsign}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      unit.status === 'DISPATCHED'
                        ? 'bg-[var(--status-critical)]/10 text-[var(--status-critical)] border border-[var(--status-critical)]/30 animate-pulse'
                        : 'bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/30'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{unit.type} · {unit.officer}</span>
                  <span className="text-[var(--cyan-accent)] font-semibold" suppressHydrationWarning>{unit.speedKmH} km/h</span>
                </div>

                {/* Moving Coordinates & Heading Vector */}
                <div className="text-[10px] text-[var(--text-secondary)] flex items-center justify-between pt-1 border-t border-[var(--border)]/60" suppressHydrationWarning>
                  <span className="text-[var(--cyan-accent)] font-semibold">
                    {unit.lat.toFixed(4)}° N, {unit.lng.toFixed(4)}° E
                  </span>
                  <span className="text-gray-400 font-mono">
                    {unit.distanceKm} km · {unit.heading}°
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Real-Time Radio Activity Ticker */}
          <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-1.5 font-mono text-xs">
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-[var(--status-success)] animate-pulse" /> Live 112 Radio Dispatch Log
            </span>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-primary)]">
              <span>
                <strong className="text-[var(--cyan-accent)]">{recentRadioCalls[tick % recentRadioCalls.length].callsign}:</strong>{' '}
                {recentRadioCalls[tick % recentRadioCalls.length].message}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] shrink-0 ml-2">
                {recentRadioCalls[tick % recentRadioCalls.length].time}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Urgent Sanction Authorization Board */}
        <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[var(--status-critical)]" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                SP Sanction Queue
              </h2>
            </div>
            <Link
              href="/supervisor/approvals"
              className="text-xs font-mono text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              View All ({pendingSanctionsCount}) <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {sanctions.slice(0, 3).map((sanc) => {
              const isPending = sanc.status === 'PENDING_SANCTION';
              return (
                <div
                  key={sanc.id}
                  className={`p-3 rounded-xl border flex flex-col gap-2 font-mono text-xs transition-all ${
                    isPending
                      ? 'bg-[var(--surface-1)] border-[var(--border)]'
                      : 'bg-[var(--status-success)]/5 border-[var(--status-success)]/30 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-[var(--status-critical)]/10 text-[var(--status-critical)]">
                      {sanc.urgency}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">{sanc.timestamp}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-xs">{sanc.requestType}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Target: <strong className="text-[var(--text-primary)]">{sanc.suspectName}</strong> ({sanc.policeStation})
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-secondary)]">{sanc.firNumber}</span>
                    {isPending ? (
                      <button
                        onClick={() => handleQuickApprove(sanc.id, sanc.suspectName)}
                        className="px-2.5 py-1 rounded bg-[var(--accent)] hover:opacity-90 text-white font-bold text-[10px] uppercase shadow-sm cursor-pointer"
                      >
                        Approve Sanction
                      </button>
                    ) : (
                      <span className="text-[10px] text-[var(--status-success)] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: DISTRICT AUDIT BENCHMARKS ── */}
      <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
              Statewide District Compliance & Accountability Matrix
            </h2>
          </div>
          <Link
            href="/supervisor/audit"
            className="text-xs font-mono text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            Audit Report <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] text-[10px] uppercase">
                <th className="pb-2">District</th>
                <th className="pb-2">Disposal Rate</th>
                <th className="pb-2">Charge Sheet (&lt;60d)</th>
                <th className="pb-2">Avg 112 Response</th>
                <th className="pb-2">On-Duty Staff</th>
                <th className="pb-2">Pending Clearances</th>
                <th className="pb-2">Underreporting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {districtAudits.map((dist) => (
                <tr key={dist.district} className="hover:bg-[var(--surface-1)] transition-colors">
                  <td className="py-2.5 font-bold text-[var(--text-primary)]">{dist.district}</td>
                  <td className="py-2.5 font-semibold text-[var(--text-primary)]">{dist.disposalRate}%</td>
                  <td className="py-2.5 text-[var(--text-secondary)]">{dist.chargeSheetCompliance}%</td>
                  <td className="py-2.5 text-[var(--status-success)] font-semibold">{dist.avgResponseMin} mins</td>
                  <td className="py-2.5 text-[var(--text-secondary)]">{dist.activeStaffOnDuty} officers</td>
                  <td className="py-2.5 text-[var(--status-warning)] font-bold">{dist.pendingClearances} cases</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        dist.underreportingRisk === 'HIGH'
                          ? 'bg-[var(--status-critical)]/10 text-[var(--status-critical)]'
                          : dist.underreportingRisk === 'MODERATE'
                          ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                          : 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                      }`}
                    >
                      {dist.underreportingRisk}
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
