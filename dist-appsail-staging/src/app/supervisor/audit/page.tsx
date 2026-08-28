'use client';

import React, { useState } from 'react';
import {
  BarChart2,
  Building2,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Send,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useSupervisorTelemetry } from '@/context/SupervisorTelemetryContext';

interface StationAuditRow {
  station: string;
  district: string;
  inspectorInCharge: string;
  pendingCases: number;
  overdueChargeSheets: number; // >60 days
  clearanceRate: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'CRITICAL';
}

const STATION_RECORDS: StationAuditRow[] = [
  { station: 'Chikkamagaluru Market PS', district: 'Chikkamagaluru', inspectorInCharge: 'Insp. Manjunath Swamy', pendingCases: 12, overdueChargeSheets: 0, clearanceRate: 94.2, grade: 'A+' },
  { station: 'Indiranagar PS', district: 'Bengaluru Urban', inspectorInCharge: 'Insp. V. Sharma', pendingCases: 28, overdueChargeSheets: 2, clearanceRate: 91.5, grade: 'A' },
  { station: 'Tumakuru Industrial PS', district: 'Tumakuru', inspectorInCharge: 'Insp. K. Venkatesh', pendingCases: 34, overdueChargeSheets: 3, clearanceRate: 86.0, grade: 'B' },
  { station: 'Vijayapura Town PS', district: 'Vijayapura', inspectorInCharge: 'Insp. Suresh Naidu', pendingCases: 42, overdueChargeSheets: 5, clearanceRate: 81.4, grade: 'B' },
  { station: 'Kalaburagi Rural PS', district: 'Kalaburagi', inspectorInCharge: 'Insp. Suresh Kulkarni', pendingCases: 56, overdueChargeSheets: 9, clearanceRate: 78.0, grade: 'C' },
  { station: 'Raichur Suburban PS', district: 'Raichur', inspectorInCharge: 'Insp. Anand Patil', pendingCases: 64, overdueChargeSheets: 14, clearanceRate: 72.8, grade: 'CRITICAL' },
];

export default function SupervisorAuditPage() {
  const { tick, lastUpdated, districtAudits } = useSupervisorTelemetry();
  const [selectedStation, setSelectedStation] = useState<StationAuditRow | null>(STATION_RECORDS[STATION_RECORDS.length - 1]);
  const [noticeToast, setNoticeToast] = useState('');

  const handleIssueNotice = (actionType: 'DIRECTIVE' | 'EXPLANATION' | 'COMMENDATION') => {
    if (!selectedStation) return;
    const msg =
      actionType === 'COMMENDATION'
        ? `Issued official Commendation to ${selectedStation.inspectorInCharge} (${selectedStation.station})`
        : `Issued statutory Show-Cause Directive to ${selectedStation.inspectorInCharge} regarding ${selectedStation.overdueChargeSheets} overdue charge sheets.`;
    setNoticeToast(msg);
    setTimeout(() => setNoticeToast(''), 5000);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              SUPERVISORY AUDIT
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Inspector Performance & Statutory Compliance Scorecards
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            District Performance & Accountability Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Evaluates disposal velocities, charge sheet turnarounds, station backlogs, and underreporting risk indicators.
          </p>
        </div>

        {/* Dynamic 3s Auto-Draft */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)] animate-pulse" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">AUDIT CYCLE:</span>
          <span className="text-[var(--text-primary)] font-bold" suppressHydrationWarning>Synced ({lastUpdated})</span>
        </div>
      </div>

      {/* ── NOTIFICATION BANNER ── */}
      {noticeToast && (
        <div className="p-3.5 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{noticeToast}</span>
        </div>
      )}

      {/* ── DISTRICT SUMMARY BENCHMARKS (6 CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {districtAudits.map((dist) => (
          <div
            key={dist.district}
            className="p-4 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col gap-2 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="font-extrabold text-[var(--text-primary)] text-sm">{dist.district}</span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  dist.underreportingRisk === 'HIGH'
                    ? 'bg-[var(--status-critical)]/10 text-[var(--status-critical)] border border-[var(--status-critical)]/30'
                    : dist.underreportingRisk === 'MODERATE'
                    ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)] border border-[var(--status-warning)]/30'
                    : 'bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/30'
                }`}
              >
                {dist.underreportingRisk} RISK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-[9px] text-[var(--text-secondary)] block">Disposal Rate</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{dist.disposalRate}%</span>
              </div>
              <div>
                <span className="text-[9px] text-[var(--text-secondary)] block">Charge Sheets &lt;60d</span>
                <span className="text-sm font-bold text-[var(--status-success)]">{dist.chargeSheetCompliance}%</span>
              </div>
              <div>
                <span className="text-[9px] text-[var(--text-secondary)] block">Avg Response</span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">{dist.avgResponseMin} mins</span>
              </div>
              <div>
                <span className="text-[9px] text-[var(--text-secondary)] block">Overdue Backlog</span>
                <span className="text-xs font-bold text-[var(--status-warning)]">{dist.pendingClearances} cases</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── STATION RANKING TABLE & INSPECTOR DIRECTIVE CONSOLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Police Station Performance Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Station Backlog & Clearance Registry
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">Click station to inspect</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] text-[10px] uppercase">
                  <th className="pb-2">Station</th>
                  <th className="pb-2">District</th>
                  <th className="pb-2">Inspector</th>
                  <th className="pb-2">Disposal</th>
                  <th className="pb-2">Overdue (&gt;60d)</th>
                  <th className="pb-2">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {STATION_RECORDS.map((st) => {
                  const isSelected = selectedStation?.station === st.station;
                  return (
                    <tr
                      key={st.station}
                      onClick={() => setSelectedStation(st)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[var(--accent)]/10 font-bold' : 'hover:bg-[var(--surface-1)]'
                      }`}
                    >
                      <td className="py-3 text-[var(--text-primary)] font-bold">{st.station}</td>
                      <td className="py-3 text-[var(--text-secondary)]">{st.district}</td>
                      <td className="py-3 text-[var(--text-primary)]">{st.inspectorInCharge}</td>
                      <td className="py-3 text-[var(--status-success)] font-semibold">{st.clearanceRate}%</td>
                      <td className="py-3 text-[var(--status-critical)] font-bold">{st.overdueChargeSheets}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            st.grade === 'A+' || st.grade === 'A'
                              ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                              : st.grade === 'B'
                              ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                              : 'bg-[var(--status-critical)]/10 text-[var(--status-critical)]'
                          }`}
                        >
                          {st.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Station Action & Accountability Directive */}
        <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[var(--cyan-accent)]" /> Inspector Accountability Action
              </span>
            </div>

            {selectedStation ? (
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                    {selectedStation.station}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    IO: <strong className="text-[var(--text-primary)]">{selectedStation.inspectorInCharge}</strong>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--text-secondary)]">Total Pending Cases:</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedStation.pendingCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--text-secondary)]">Overdue Charge Sheets:</span>
                    <span className="font-bold text-[var(--status-critical)]">{selectedStation.overdueChargeSheets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--text-secondary)]">Clearance Rating:</span>
                    <span className="font-bold text-[var(--status-success)]">{selectedStation.clearanceRate}%</span>
                  </div>
                </div>

                {selectedStation.overdueChargeSheets > 5 ? (
                  <div className="p-3 rounded-lg bg-[var(--status-critical)]/10 border border-[var(--status-critical)]/30 text-[var(--status-critical)] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase block">Statutory Warning Triggered</span>
                      <span className="text-[11px]">Station exceeds maximum acceptable investigation backlog threshold under Sec 173 CrPC.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-[11px]">Station investigation timeline is within standard parameters.</span>
                  </div>
                )}

                {/* Supervisory Directive Buttons */}
                <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[var(--border)]">
                  {selectedStation.overdueChargeSheets > 0 ? (
                    <button
                      onClick={() => handleIssueNotice('EXPLANATION')}
                      className="w-full py-2 rounded-lg bg-[var(--status-critical)] hover:opacity-90 text-white font-bold text-xs uppercase transition-all shadow-sm cursor-pointer"
                    >
                      Issue Show-Cause Notice
                    </button>
                  ) : (
                    <button
                      onClick={() => handleIssueNotice('COMMENDATION')}
                      className="w-full py-2 rounded-lg bg-[var(--status-success)] hover:opacity-90 text-white font-bold text-xs uppercase transition-all shadow-sm cursor-pointer"
                    >
                      Issue SP Commendation Roll
                    </button>
                  )}
                  <button
                    onClick={() => handleIssueNotice('DIRECTIVE')}
                    className="w-full py-2 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-xs uppercase transition-all cursor-pointer"
                  >
                    Deploy Special Task Audit Team
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">Select a police station to inspect compliance.</p>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
            <span>State Police HQ Audit Desk</span>
            <span>Sec 173 CrPC Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
