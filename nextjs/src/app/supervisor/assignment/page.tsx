'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  Users,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UnassignedCase {
  fir_number: string;
  crime_type: string;
  station: string;
  filed_at: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  recommended_officer: {
    officer_id: string;
    name: string;
    station: string;
    current_load: number;
    match_score: number;
    match_reason: string;
  };
}

const INITIAL_UNASSIGNED: UnassignedCase[] = [
  {
    fir_number: 'KAR/BEN/2026/1902',
    crime_type: 'Organized Vehicle Theft & Jammer Syndicate',
    station: 'Ashoknagar PS',
    filed_at: 'Today, 14:15 IST',
    priority: 'HIGH',
    description: '433MHz frequency jammer recovered near Richmond Circle. 2 Pulsar bikes stolen in tandem.',
    recommended_officer: {
      officer_id: 'KSP-4092',
      name: 'Insp. V. Sharma',
      station: 'Ashoknagar PS',
      current_load: 12,
      match_score: 96,
      match_reason: 'Domain specialist in vehicle syndicates; 88% clearance rate and stationed in Ashoknagar.',
    },
  },
  {
    fir_number: 'KAR/BEN/2026/1915',
    crime_type: 'Commercial MDMA Drug Intercept (NDPS)',
    station: 'Indiranagar PS',
    filed_at: 'Today, 15:30 IST',
    priority: 'CRITICAL',
    description: '450g MDMA intercepted at dead-drop locker near 100ft Road. 72hr statutory FSL clock active.',
    recommended_officer: {
      officer_id: 'KSP-2845',
      name: 'Insp. Priya Patel',
      station: 'Ulsoor PS (Adjacent)',
      current_load: 8,
      match_score: 92,
      match_reason: 'Lowest active caseload (8 FIRs), 92% clearance velocity; relieves overloaded Indiranagar officer.',
    },
  },
  {
    fir_number: 'KAR/BEN/2026/1922',
    crime_type: 'Commercial Cyber Banking Extortion',
    station: 'Cubbon Park PS',
    filed_at: 'Today, 16:40 IST',
    priority: 'MEDIUM',
    description: '₹42 Lakhs fraudulent transfer via cloned SIM; 1930 Cyber Helpline freeze initiated.',
    recommended_officer: {
      officer_id: 'KSP-3180',
      name: 'Insp. Rajesh Rao',
      station: 'Cubbon Park PS',
      current_load: 19,
      match_score: 88,
      match_reason: 'Lead investigator for financial fraud cell; Cubbon Park jurisdiction match.',
    },
  },
];

const AVAILABLE_OFFICERS = [
  { id: 'KSP-4092', name: 'Insp. V. Sharma (Ashoknagar PS · 12 Cases)' },
  { id: 'KSP-2845', name: 'Insp. Priya Patel (Ulsoor PS · 8 Cases · Recommended)' },
  { id: 'KSP-3180', name: 'Insp. Rajesh Rao (Cubbon Park PS · 19 Cases)' },
  { id: 'KSP-5120', name: 'Insp. Anand Deshmukh (Indiranagar PS · 23 Cases · Overloaded)' },
];

export default function SupervisorCaseAssignmentPage() {
  const [cases, setCases] = useState<UnassignedCase[]>(INITIAL_UNASSIGNED);
  const [selectedCase, setSelectedCase] = useState<UnassignedCase | null>(INITIAL_UNASSIGNED[0]);
  const [chosenOfficerId, setChosenOfficerId] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const handleAssign = (firNumber: string, officerName: string) => {
    setCases((prev) => prev.filter((c) => c.fir_number !== firNumber));
    setToastMessage(`Assigned ${firNumber} to ${officerName}. CCTNS docket updated.`);
    setSelectedCase(cases.find((c) => c.fir_number !== firNumber) || null);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleRebalance = () => {
    setToastMessage('AI Workload Balancing complete: 4 active FIRs reallocated from Indiranagar to Ulsoor PS.');
    setTimeout(() => setToastMessage(''), 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Case Assignment & Workload Balancer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Karnataka State Police · Sector 4 Unassigned FIRs, AI Inspector Matching & Rebalancing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRebalance}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Rebalance Workload</span>
          </button>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 2-COLUMN ASSIGNMENT WORKBENCH (LIGHT THEME) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Unassigned Incoming FIR Queue (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              Unassigned Incoming FIRs ({cases.length})
            </h3>
            <span className="text-xs font-semibold text-slate-500">Auto-prioritized by AI</span>
          </div>

          {cases.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span>All incoming FIRs have been assigned across division stations.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cases.map((c) => {
                const isSelected = selectedCase?.fir_number === c.fir_number;

                return (
                  <div
                    key={c.fir_number}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-300 shadow-sm'
                        : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 font-mono text-xs">{c.fir_number}</span>
                        <span
                          className={`text-[9px] px-2.5 py-0.5 rounded-full font-semibold ${
                            c.priority === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{c.filed_at}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-900">{c.crime_type}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{c.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {c.station}
                      </span>

                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        Match: {c.recommended_officer.name.split(' ')[1]} ({c.recommended_officer.match_score}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Match Recommendation & One-Click Assignment (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4 text-xs">
          {selectedCase ? (
            <>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  AI RECOMMENDATION ENGINE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Assignment: {selectedCase.fir_number}
                </h3>
              </div>

              {/* Top Recommended Match Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Top Recommended Inspector
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    {selectedCase.recommended_officer.match_score}% Score
                  </span>
                </div>

                <div className="mt-1">
                  <p className="text-sm font-bold text-slate-900">{selectedCase.recommended_officer.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {selectedCase.recommended_officer.station} · Current Load: {selectedCase.recommended_officer.current_load} FIRs
                  </p>
                </div>

                <p className="text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-blue-100 mt-1 leading-relaxed shadow-2xs">
                  💡 <strong>Rationale:</strong> {selectedCase.recommended_officer.match_reason}
                </p>

                <button
                  onClick={() => handleAssign(selectedCase.fir_number, selectedCase.recommended_officer.name)}
                  className="w-full py-2.5 rounded-full bg-slate-900 hover:scale-105 text-white font-bold text-xs transition-all mt-2 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assign to {selectedCase.recommended_officer.name.split(' ')[1]}</span>
                </button>
              </div>

              {/* Manual Override Option */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-bold">Manual Inspector Reassignment:</span>
                <select
                  value={chosenOfficerId}
                  onChange={(e) => setChosenOfficerId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-black/5"
                >
                  <option value="">Select Alternative Officer...</option>
                  {AVAILABLE_OFFICERS.map((off) => (
                    <option key={off.id} value={off.id}>{off.name}</option>
                  ))}
                </select>

                {chosenOfficerId && (
                  <button
                    onClick={() => {
                      const offName = AVAILABLE_OFFICERS.find((o) => o.id === chosenOfficerId)?.name || chosenOfficerId;
                      handleAssign(selectedCase.fir_number, offName);
                    }}
                    className="w-full py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs mt-1"
                  >
                    Confirm Manual Assignment
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Select an unassigned FIR from the queue to view AI matching scores and assign an inspector.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
