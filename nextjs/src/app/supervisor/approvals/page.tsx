'use client';

import React, { useState } from 'react';
import {
  ClipboardCheck,
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
  Filter,
  Eye,
  HelpCircle
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

  const handleReject = (sanc: SanctionRequest) => {
    setActionSuccess(`Rejected sanction request for ${sanc.firNumber}. Sent back to ${sanc.investigatingOfficer}.`);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const handleRequestEvidence = (sanc: SanctionRequest) => {
    setActionSuccess(`Requested additional call data records (CDR) & FSL evidence from ${sanc.investigatingOfficer}.`);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Sanctions & Warrants Clearance Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Karnataka State Police · Superintendent of Police Statutory Approvals & Goonda Warrants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {sanctions.filter((s) => s.status === 'PENDING_SANCTION').length} Awaiting Signature
          </span>
        </div>
      </div>

      {/* ── ACTION NOTIFICATION ── */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── SEARCH & FILTER ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by suspect name, FIR number, or police station..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs font-semibold text-gray-700 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Requests ({sanctions.length})</option>
            <option value="PENDING_SANCTION">Pending Signature</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN APPROVAL CONSOLE (LIGHT THEME) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Docket List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {filteredSanctions.map((sanc) => {
            const isSelected = selectedSanction?.id === sanc.id;

            return (
              <div
                key={sanc.id}
                onClick={() => setSelectedSanction(sanc)}
                className={`p-5 rounded-[28px] border transition-all cursor-pointer flex flex-col gap-3 ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        sanc.urgency === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {sanc.urgency}
                    </span>
                    <span className="text-xs font-bold text-blue-600 font-mono">{sanc.firNumber}</span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">{sanc.timestamp}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{sanc.requestType}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Suspect: <strong className="text-slate-900">{sanc.suspectName}</strong> · Station: {sanc.policeStation}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sanc.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">IO: {sanc.investigatingOfficer}</span>
                  {sanc.status === 'PENDING_SANCTION' ? (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Awaiting Sign-off
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sanction Granted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Case Review & SP Executive Sign-Off Console (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4 text-xs">
          {selectedSanction ? (
            <>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  SP STATUTORY REVIEW
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Docket #{selectedSanction.id}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Statutory Power:</span>
                  <span className="text-slate-900 font-bold">{selectedSanction.requestType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Suspect:</span>
                  <span className="text-rose-600 font-bold">{selectedSanction.suspectName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Originating PS:</span>
                  <span className="text-slate-800">{selectedSanction.policeStation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Investigating Officer:</span>
                  <span className="text-slate-800">{selectedSanction.investigatingOfficer}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Evidentiary Ground & Summary:</span>
                <p className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                  {selectedSanction.summary}
                </p>
              </div>

              {selectedSanction.status === 'PENDING_SANCTION' ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleApprove(selectedSanction)}
                    className="w-full py-2.5 rounded-full bg-slate-900 hover:scale-105 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Grant SP Clearance</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRequestEvidence(selectedSanction)}
                      className="py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                      <span>Request Evidence</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedSanction)}
                      className="py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Reject Docket</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-center">
                  ✓ Formally cleared and signed under SP executive seal.
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Select a warrant from the queue to review evidentiary grounds and grant statutory sign-offs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
