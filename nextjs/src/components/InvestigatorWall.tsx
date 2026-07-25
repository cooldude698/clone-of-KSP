"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// ── TypeScript Type Definitions ──────────────────────────────────────────────

export interface AccusedRecord {
  full_name: string;
  alias?: string;
  age?: number;
  gender?: string;
  address?: string;
  district_name?: string;
  occupation?: string;
  prior_convictions?: number;
  modus_operandi?: string;
  risk_score: number;
}

export interface VictimRecord {
  full_name: string;
  age?: number;
  gender?: string;
  occupation?: string;
  district_name?: string;
  vulnerability_score: number;
}

export interface RelatedFIR {
  case_number: string;
  crime_type: string;
  date_filed: string;
  link_reason: string;
}

interface FIRDetails {
  case_number: string;
  crime_type: string;
  date_filed: string;
  location_name: string;
  case_status: string; // e.g. "filed", "investigating", "chargesheeted", "closed"
  description: string;
  police_station: string;
}

interface InvestigatorWallProps {
  fir: FIRDetails;
  accused: AccusedRecord[];
  victims: VictimRecord[];
  related_firs: RelatedFIR[];
  case_summary: string;
  isLoading?: boolean;
}

// ── Animation Mappings ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getStatusIndex = (status: string): number => {
  const norm = (status || "").toLowerCase();
  if (norm.includes("close")) return 3;
  if (norm.includes("charge") || norm.includes("sheet")) return 2;
  if (norm.includes("investig")) return 1;
  return 0;
};

const getRiskColor = (score: number) => {
  if (score > 70) return "bg-red-100 text-red-800 border border-red-300";
  if (score > 40) return "bg-amber-100 text-amber-800 border border-amber-300";
  return "bg-sky-100 text-sky-800 border border-sky-300";
};

const getRiskLabel = (score: number) => {
  if (score > 70) return "HIGH RISK";
  if (score > 40) return "MEDIUM RISK";
  return "LOW RISK";
};

const getRiskDescription = (score: number) => {
  if (score > 70) return "High Risk Person: This person has a high chance of committing crime again. Officers should monitor their location closely, check their daily routine, and coordinate with local police stations immediately.";
  if (score > 40) return "Medium Risk Person: This person shows moderate warning signs. Officers should conduct regular weekly check-ins, keep track of their contacts, and review their recent activities.";
  return "Low Risk Person: This person currently shows low threat level. Follow normal police checking procedures during the investigation.";
};

const nameToSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const getVulnerabilityColor = (score: number) => {
  if (score > 70) return "bg-rose-100 text-rose-800 border border-rose-300";
  if (score > 40) return "bg-amber-100 text-amber-800 border border-amber-300";
  return "bg-emerald-100 text-emerald-800 border border-emerald-300";
};

const getVulnerabilityLabel = (score: number) => {
  if (score > 70) return "HIGH RISK VICTIM";
  if (score > 40) return "MEDIUM RISK VICTIM";
  return "LOW RISK VICTIM";
};

const getStatusLabel = (status: string) => {
  const norm = (status || "").toLowerCase();
  if (norm.includes("close")) return "CASE CLOSED";
  if (norm.includes("charge") || norm.includes("sheet")) return "CHARGESHEET FILED IN COURT";
  if (norm.includes("investig")) return "UNDER ACTIVE INVESTIGATION";
  return "NEW FIR REGISTERED";
};

const getStatusColor = (status: string) => {
  const norm = (status || "").toLowerCase();
  if (norm.includes("close")) return "bg-slate-200 text-slate-700 border-slate-400";
  if (norm.includes("charge") || norm.includes("sheet")) return "bg-amber-100 text-amber-800 border-amber-400";
  if (norm.includes("investig")) return "bg-blue-100 text-blue-800 border-blue-400";
  return "bg-red-100 text-red-800 border-red-400";
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function InvestigatorWall({
  fir,
  accused,
  victims,
  related_firs,
  case_summary,
  isLoading = false,
}: InvestigatorWallProps) {
  const statusIdx = getStatusIndex(fir?.case_status || "");
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-[#FAF7F2] border-2 border-double border-slate-400 p-8 min-h-[700px] flex flex-col justify-center items-center gap-4">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-4xl">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mt-2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
            <div className="h-80 bg-slate-100 rounded-xl" />
            <div className="h-96 bg-slate-200 rounded-xl" />
            <div className="h-80 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl bg-[#FAF7F2] border-4 border-double border-slate-700/50 p-6 md:p-8 shadow-lg text-slate-800 select-none font-serif transition-colors duration-200 overflow-hidden">
      
      {/* Newspaper texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M5 0h1L0 5V4zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")` }} />

      {/* ── NEWSPAPER MASTHEAD ── */}
      <div className="relative flex flex-col items-center mb-6 border-b-4 border-double border-slate-800 pb-5 z-10">
        <div className="w-full border-b border-slate-300 mb-3 pb-1 flex justify-between items-center text-[8px] font-sans font-bold uppercase tracking-[0.25em] text-slate-400">
          <span>Karnataka State Police — Criminal Investigation Department</span>
          <span>Intelligence & Forensics Division</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-wide text-center uppercase text-slate-900" style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}>
          The Drishti Dispatch
        </h2>
        <p className="text-[9px] text-slate-500 font-sans tracking-[0.3em] font-bold uppercase mt-1.5">
          Criminal Investigation Dossier — Classified — For Authorized Personnel Only
        </p>
        
        <div className="w-full mt-3 border-t-2 border-b border-slate-800 py-1.5 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-600 font-sans">
          <span>Vol. XXVI · No. 2026</span>
          <span className="text-red-700 font-black">{fir.crime_type.replace('_', ' ')}</span>
          <span>Filed: {new Date(fir.date_filed).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* ── SECTION 1: CASE OVERVIEW ── */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.3em]">Section I</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.3em]">Case Overview</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: FIR Details Card */}
          <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden">
            {/* Stamp */}
            <div className="absolute top-4 right-4 z-20">
              <div className="select-none" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b91c1c", border: "2px solid #b91c1c", padding: "3px 8px", borderRadius: "3px", transform: "rotate(-6deg)", opacity: 0.7 }}>
                {fir.case_number}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 font-sans">
                {fir.crime_type.replace('_', ' ')}
              </span>
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border font-sans ${getStatusColor(fir.case_status)}`}>
                {getStatusLabel(fir.case_status)}
              </span>
            </div>

            <Link href={`/dashboard/fir/${fir.case_number}`} className="group/fir flex items-center gap-2 mb-5">
              <h3 className="text-2xl font-black text-slate-900 tracking-wide font-serif group-hover/fir:text-red-800 transition-colors">
                FIR No. {fir.case_number}
              </h3>
              <span className="text-[10px] text-slate-400 group-hover/fir:text-red-700 transition-colors opacity-0 group-hover/fir:opacity-100 font-sans">→ View Full FIR</span>
            </Link>

            {/* Detailed Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6 font-sans border-t border-b border-slate-200 py-4">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1 font-bold">Date Filed</span>
                <span className="font-semibold text-slate-700">{new Date(fir.date_filed).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "2-digit" })}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1 font-bold">Jurisdiction PS</span>
                <span className="font-semibold text-slate-700">{fir.police_station} Station</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1 font-bold">Crime Location</span>
                <span className="font-semibold text-slate-700">{fir.location_name}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1 font-bold">Report Generated</span>
                <span className="font-semibold text-slate-700">{today}</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-2 font-sans font-bold">Official Case Narrative / First Information Report Statement</span>
              <div className="bg-[#FAF7F2] rounded-xl p-5 border border-slate-200 max-h-60 overflow-y-auto">
                <p className="text-sm text-slate-700 leading-relaxed font-serif italic text-justify first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-0.5 first-letter:text-slate-900">
                  &quot;{fir.description}&quot;
                </p>
              </div>
            </div>

            <div className="text-[9px] text-slate-400 font-sans font-bold uppercase tracking-widest mt-3">
              This report is generated by the DRISHTI AI-assisted Investigation Platform for use by Karnataka State Police personnel. All information herein is classified and subject to verification by the assigned Investigation Officer (IO).
            </div>
          </div>

          {/* Right: Case Status & Timeline */}
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-3 font-sans font-bold">Case Progress Tracker</span>
              <div className="flex flex-col gap-3">
                {["FIR Registered", "Investigation Commenced", "Chargesheet Filed", "Case Closed / Disposed"].map((step, idx) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold shrink-0 ${
                        idx <= statusIdx ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-400"
                      }`}>
                        {idx <= statusIdx ? "✓" : idx + 1}
                      </div>
                      {idx < 3 && <div className={`w-0.5 h-6 ${idx < statusIdx ? "bg-slate-800" : "bg-slate-200"}`} />}
                    </div>
                    <div className="pt-0.5">
                      <span className={`text-xs font-bold font-sans block ${idx <= statusIdx ? "text-slate-800" : "text-slate-400"}`}>{step}</span>
                      {idx <= statusIdx && (
                        <span className="text-[10px] text-slate-500 font-sans">
                          {idx === 0 && `Registered on ${new Date(fir.date_filed).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} at ${fir.police_station} PS`}
                          {idx === 1 && "Investigation initiated by assigned IO. Evidence collection and witness statements recorded."}
                          {idx === 2 && "Chargesheet prepared and submitted to Magistrate Court for judicial review."}
                          {idx === 3 && "Case disposed by competent authority. All proceedings documented and archived."}
                        </span>
                      )}
                      {idx > statusIdx && <span className="text-[10px] text-slate-400 font-sans italic">Pending</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-3 font-sans font-bold">Case Statistics</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <span className="text-2xl font-black text-red-800 block">{accused.length}</span>
                  <span className="text-[9px] text-red-600 font-sans font-bold uppercase tracking-wider">Accused</span>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
                  <span className="text-2xl font-black text-rose-800 block">{victims.length}</span>
                  <span className="text-[9px] text-rose-600 font-sans font-bold uppercase tracking-wider">Victims</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <span className="text-2xl font-black text-amber-800 block">{related_firs.length}</span>
                  <span className="text-[9px] text-amber-600 font-sans font-bold uppercase tracking-wider">Linked FIRs</span>
                </div>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center">
                  <span className="text-2xl font-black text-slate-800 block">{accused.reduce((sum, a) => sum + (a.prior_convictions || 0), 0)}</span>
                  <span className="text-[9px] text-slate-600 font-sans font-bold uppercase tracking-wider">Prior Records</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: ACCUSED DOSSIER ── */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.3em]">Section II</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-red-700 uppercase tracking-[0.3em]">Accused Persons Dossier ({accused.length})</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        {accused.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-sm text-slate-400 font-sans">
            No accused persons have been recorded in this FIR. Investigation is ongoing to identify suspects.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accused.map((item, idx) => (
              <motion.div
                key={`${item.full_name}-${idx}`}
                variants={cardVariants}
                className="group rounded-xl bg-white border border-slate-200 p-5 hover:border-red-300 hover:shadow-md transition-all duration-200 shadow-sm"
              >
                {/* Header Row */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200 font-bold font-serif shrink-0 text-2xl">
                    {item.full_name.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors font-serif">
                          {item.full_name}
                        </h4>
                        {item.alias && (
                          <p className="text-xs text-slate-500 italic font-serif">Also known as: &quot;{item.alias}&quot;</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-[9px] font-mono font-bold shrink-0 ${getRiskColor(item.risk_score)}`}>
                        {getRiskLabel(item.risk_score)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4 font-sans border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">Age</span>
                    <span className="font-semibold text-slate-700">{item.age || "Unknown"} years</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">Gender</span>
                    <span className="font-semibold text-slate-700">{item.gender || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">Occupation</span>
                    <span className="font-semibold text-slate-700">{item.occupation || "Unemployed / Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">Prior Records</span>
                    <span className="font-semibold text-slate-700">{item.prior_convictions || 0} conviction(s)</span>
                  </div>
                </div>

                {/* Address & District */}
                {(item.address || item.district_name) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4 font-sans">
                    {item.address && (
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">Residential Address</span>
                        <span className="font-semibold text-slate-700">{item.address}</span>
                      </div>
                    )}
                    {item.district_name && (
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">District</span>
                        <span className="font-semibold text-slate-700">{item.district_name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Risk Assessment Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-bold">Threat Assessment Score</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{item.risk_score}/100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.risk_score > 70 ? 'bg-red-500' : item.risk_score > 40 ? 'bg-amber-500' : 'bg-sky-500'}`}
                      style={{ width: `${item.risk_score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-sans leading-relaxed italic">
                    {getRiskDescription(item.risk_score)}
                  </p>
                </div>

                {/* Prior Convictions Warning */}
                {item.prior_convictions && item.prior_convictions > 0 && (
                  <div className="mb-4 py-2 px-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-sans flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                      <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-bold block">⚠ Past Crime Record Alert — {item.prior_convictions} Previous Arrest(s)</span>
                      <span className="text-[10px] text-red-600">This person has been arrested before. Police records show a repeated habit of committing crime. The Investigating Officer (IO) should take extra care and get complete old records from the Crime Records Bureau.</span>
                    </div>
                  </div>
                )}

                {/* Modus Operandi */}
                {item.modus_operandi && (
                  <div className="mb-4 pt-3 border-t border-slate-200">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block font-sans mb-1">Method of Crime (How the Crime Was Done)</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-serif italic bg-[#FAF7F2] rounded-lg p-3 border border-slate-100">
                      &quot;{item.modus_operandi}&quot;
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans mt-1 italic">
                      Note for Officers: Check if this same method was used in other recent crimes in nearby police station areas.
                    </p>
                  </div>
                )}

                <Link
                  href={`/dashboard/suspect/${nameToSlug(item.full_name)}`}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white uppercase tracking-widest transition-all font-sans"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM8 12a4 4 0 0 0 3.193-1.603.75.75 0 1 0-1.186-.918A2.5 2.5 0 0 1 8 10.5a2.5 2.5 0 0 1-2.007-1.021.75.75 0 1 0-1.186.918A4 4 0 0 0 8 12Z" clipRule="evenodd" />
                  </svg>
                  View Complete Suspect Profile & Full History
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 3: VICTIM DETAILS ── */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.3em]">Section III</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-rose-700 uppercase tracking-[0.3em]">Victim & Complainant Details ({victims.length})</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        {victims.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-sm text-slate-400 font-sans">
            No victim details recorded yet. Investigating Officer is gathering victim information.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {victims.map((item, idx) => (
              <motion.div
                key={`${item.full_name}-${idx}`}
                variants={cardVariants}
                className="group rounded-xl bg-white border border-slate-200 p-5 hover:border-rose-300 hover:shadow-md transition-all duration-200 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 font-bold font-serif shrink-0 text-xl">
                    {item.full_name.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors font-serif">
                      {item.full_name}
                    </h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold ${getVulnerabilityColor(item.vulnerability_score)}`}>
                      {getVulnerabilityLabel(item.vulnerability_score)} — Score: {item.vulnerability_score}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-sans border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">Age</span>
                    <span className="font-semibold text-slate-700">{item.age || "N/A"} years</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">Gender</span>
                    <span className="font-semibold text-slate-700">{item.gender || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">Occupation</span>
                    <span className="font-semibold text-slate-700">{item.occupation || "Not Available"}</span>
                  </div>
                  {item.district_name && (
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-0.5 font-bold">District</span>
                      <span className="font-semibold text-slate-700">{item.district_name}</span>
                    </div>
                  )}
                </div>

                {/* Vulnerability Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-bold">Safety & Protection Level Needed</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{item.vulnerability_score}/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.vulnerability_score > 70 ? 'bg-rose-500' : item.vulnerability_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${item.vulnerability_score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-1 italic">
                    {item.vulnerability_score > 70 
                      ? "High Risk: Victim needs immediate police protection, regular patrols near house, and witness support."
                      : item.vulnerability_score > 40
                      ? "Medium Risk: Provide phone support number and schedule weekly officer visit."
                      : "Low Risk: Standard police help available whenever requested."}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 4: AI INTELLIGENCE ANALYSIS ── */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.3em]">Section IV</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-emerald-700 uppercase tracking-[0.3em]">DRISHTI AI Case Investigation Summary</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        <motion.div variants={cardVariants} className="rounded-xl bg-white border border-emerald-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM8 12a4 4 0 0 0 3.193-1.603.75.75 0 1 0-1.186-.918A2.5 2.5 0 0 1 8 10.5a2.5 2.5 0 0 1-2.007-1.021.75.75 0 1 0-1.186.918A4 4 0 0 0 8 12Z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-widest font-sans">
              DRISHTI AI Police Assistant Report
            </h4>
          </div>
          <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100 mb-4">
            <p className="text-sm text-slate-800 leading-relaxed font-sans">
              {case_summary || "DRISHTI AI is currently checking background records, matching old FIRs, and analyzing crime patterns. This summary will update as soon as new information is verified across police databases."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-sans text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Criminal Network Check — Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Background Record Check — Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Evidence Matching — In Progress</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-sans mt-3 italic border-t border-emerald-100 pt-3">
            Note for Police Officers: This AI report helps you investigate faster. Always verify all details directly before taking legal action.
          </p>
        </motion.div>
      </div>

      {/* ── SECTION 5: CROSS-REFERENCED / LINKED FIRs ── */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.3em]">Section V</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-slate-700 uppercase tracking-[0.3em]">Cross-Referenced & Linked FIRs ({related_firs.length})</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        {related_firs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-sm text-slate-400 font-sans">
            No cross-referenced or linked FIRs have been identified by the DRISHTI AI system. The criminal network analysis has not found connections to other registered cases at this time. This section will be updated automatically if new links are discovered during the investigation.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {related_firs.map((refFir, idx) => (
              <Link
                key={`${refFir.case_number}-${idx}`}
                href={`/dashboard/fir/${refFir.case_number}`}
                className="group rounded-xl bg-white border border-slate-200 p-5 hover:border-red-300 hover:shadow-md transition-all duration-200 shadow-sm block"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-sm font-mono font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                    {refFir.case_number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200 font-sans shrink-0">
                    {refFir.crime_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs font-sans mb-3 space-y-1">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Date Filed: </span>
                    <span className="font-semibold text-slate-700">{new Date(refFir.date_filed).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="py-2 px-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-serif italic">
                  <span className="font-sans font-bold text-[9px] uppercase tracking-widest text-amber-600 block mb-0.5 not-italic">Connection Rationale</span>
                  {refFir.link_reason}
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-2 italic">
                  Click to view full FIR details and cross-reference evidence chain →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="relative z-10 mt-8 pt-4 border-t-4 border-double border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-[8px] text-slate-400 font-sans uppercase tracking-[0.25em] font-bold">
          <span>DRISHTI AI-Assisted Investigation Platform — Karnataka State Police</span>
          <span>Document Classification: RESTRICTED — For Official Use Only</span>
          <span>Generated: {today}</span>
        </div>
      </div>
    </div>
  );
}
