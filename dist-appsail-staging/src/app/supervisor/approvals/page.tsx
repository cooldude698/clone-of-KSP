'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Clock,
  Send,
  Building,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import { useSupervisorTelemetry, SanctionRequest } from '@/context/SupervisorTelemetryContext';

export default function SupervisorApprovalsPage() {
  const { tick, lastUpdated, sanctions, approveSanction } = useSupervisorTelemetry();
  const [selectedSanction, setSelectedSanction] = useState<SanctionRequest | null>(sanctions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');

  const filteredSanctions = sanctions.filter((s) => {
    const matchesSearch =
      s.suspectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.firNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.policeStation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || s.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (sanc: SanctionRequest) => {
    approveSanction(sanc.id);
    setActionSuccess(`Granted SP Statutory Clearance for ${sanc.requestType} against ${sanc.suspectName}`);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              STATUTORY AUTHORIZATIONS
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Superintendent of Police Clearance Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Sanctions, Goonda Warrants & Statutory Orders
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Mandatory executive sign-offs for preventive detentions, inter-state custody remands, and bank asset freezes.
          </p>
        </div>

        {/* Dynamic 3s Pulse */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-critical)] animate-pulse" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">QUEUE:</span>
          <span className="text-[var(--text-primary)] font-bold" suppressHydrationWarning>
            {sanctions.filter((s) => s.status === 'PENDING_SANCTION').length} Awaiting Signature
          </span>
        </div>
      </div>

      {/* ── ACTION NOTIFICATION ── */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── SEARCH & FILTER ── */}
      <div className="flex flex-col sm:flex-row gap-3 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by suspect name, FIR number, or police station..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="ALL">All Requests ({sanctions.length})</option>
            <option value="PENDING_SANCTION">Pending Only</option>
            <option value="APPROVED">Approved Orders</option>
          </select>
        </div>
      </div>

      {/* ── MAIN SPLIT QUEUE & DETAIL VIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sanctions List */}
        <div className="lg:col-span-1 p-4 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Authorization Requisitions
          </span>

          <div className="flex flex-col gap-2.5">
            {filteredSanctions.map((sanc) => {
              const isSelected = selectedSanction?.id === sanc.id;
              const isPending = sanc.status === 'PENDING_SANCTION';

              return (
                <button
                  key={sanc.id}
                  onClick={() => setSelectedSanction(sanc)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col gap-1.5 cursor-pointer font-mono text-xs ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent-glow)]'
                      : 'bg-[var(--surface-1)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--cyan-accent)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : sanc.urgency === 'CRITICAL'
                          ? 'bg-[var(--status-critical)]/10 text-[var(--status-critical)]'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {sanc.urgency}
                    </span>
                    <span className="text-[9px] opacity-80">{sanc.timestamp}</span>
                  </div>

                  <h3 className="font-bold text-xs leading-snug">{sanc.requestType}</h3>
                  <p className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                    Target: <strong>{sanc.suspectName}</strong>
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[9px]">
                    <span className="opacity-80">{sanc.firNumber}</span>
                    <span
                      className={`font-bold uppercase ${
                        isPending ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]'
                      } ${isSelected ? 'text-white' : ''}`}
                    >
                      {isPending ? 'Pending SP Signature' : '✓ Sanctioned'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Dossier Preview & Digital Authorization Seal */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          {selectedSanction ? (
            <div className="flex flex-col gap-5 font-mono text-xs">
              {/* Official Sanction Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
                    SANCTION APPLICATION DOSSIER · REF: {selectedSanction.id}
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] mt-0.5">
                    {selectedSanction.requestType}
                  </h2>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedSanction.status === 'PENDING_SANCTION'
                      ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)] border border-[var(--status-warning)]/30 animate-pulse'
                      : 'bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/30'
                  }`}
                >
                  {selectedSanction.status === 'PENDING_SANCTION' ? 'Awaiting SP Clearance' : 'Authorized'}
                </span>
              </div>

              {/* Case Metadata Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase block">FIR Case</span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{selectedSanction.firNumber}</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase block">Target Offender</span>
                  <span className="text-xs font-bold text-[var(--status-critical)]">{selectedSanction.suspectName}</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase block">Station / District</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{selectedSanction.district}</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase block">Investigating Officer</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{selectedSanction.investigatingOfficer}</span>
                </div>
              </div>

              {/* Legal Rationale & Summary */}
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Investigating Officer Sworn Ground & Affidavit
                </span>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--surface-0)] p-3 rounded-lg border border-[var(--border)]">
                  {selectedSanction.summary}
                </p>
              </div>

              {/* Statutory Framework & Compliance Alert */}
              <div className="p-3 rounded-lg bg-[var(--cyan-accent)]/10 border border-[var(--cyan-accent)]/30 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[var(--cyan-accent)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-[var(--cyan-accent)] uppercase block">
                    Statutory Authority Verified
                  </span>
                  <span className="text-[11px] text-[var(--text-primary)]">
                    Meets legal evidentiary burden under Section 3(1) of Karnataka Act 12 of 1985 / BNSS 2023. SP signature executes immediate judicial warrant notice.
                  </span>
                </div>
              </div>

              {/* SP Action Signature Execution */}
              <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[10px] text-[var(--text-secondary)]">
                  Authorized Signatory: <strong>Dr. Rajesh Kumar, IPS (SP Command)</strong>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {selectedSanction.status === 'PENDING_SANCTION' ? (
                    <button
                      onClick={() => handleApprove(selectedSanction)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs uppercase shadow-md shadow-[var(--accent-glow)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      Grant Statutory Approval
                    </button>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Digitally Signed & Sealed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              Select an authorization request from the queue to view dossier.
            </p>
          )}

          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] mt-4">
            <span>KSP Judicial Compliance Desk</span>
            <span>Digital Cryptographic Seal: KSP-AUTH-2026-OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
