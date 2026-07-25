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
      staggerChildren: 0.1, // Stagger cards by 100ms
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
  return 0; // filed
};

const getRiskColor = (score: number) => {
  if (score > 70) return "bg-red-100 text-red-800 border border-red-300";
  if (score > 40) return "bg-amber-100 text-amber-800 border border-amber-300";
  return "bg-sky-100 text-sky-800 border border-sky-300";
};

const getRiskLabel = (score: number) => {
  if (score > 70) return "HIGH";
  if (score > 40) return "MED";
  return "LOW";
};

// Derive a URL-safe slug from a name: "Ramesh Kumar" → "ramesh-kumar"
const nameToSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const getVulnerabilityColor = (score: number) => {
  if (score > 70) return "bg-rose-100 text-rose-800 border border-rose-300";
  if (score > 40) return "bg-amber-100 text-amber-800 border border-amber-300";
  return "bg-emerald-100 text-emerald-800 border border-emerald-300";
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

  // Render skeleton loader
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

      {/* SVG Dash Offset Animation definition */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        .animate-dash-line {
          stroke-dasharray: 6, 4;
          stroke-dashoffset: 100;
          animation: dash 4s linear infinite;
        }
      `}</style>

      {/* ── NEWSPAPER MASTHEAD ── */}
      <div className="relative flex flex-col items-center mb-6 border-b-4 border-double border-slate-800 pb-5 z-10">
        <div className="w-full border-b border-slate-300 mb-3 pb-1 flex justify-between items-center text-[8px] font-sans font-bold uppercase tracking-[0.25em] text-slate-400">
          <span>Karnataka State Police</span>
          <span>Intelligence Division</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-wide text-center uppercase text-slate-900" style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}>
          The Drishti Dispatch
        </h2>
        <p className="text-[9px] text-slate-500 font-sans tracking-[0.3em] font-bold uppercase mt-1.5">
          Criminal Investigation Dossier — Classified
        </p>
        
        {/* Newspaper metadata row */}
        <div className="w-full mt-3 border-t-2 border-b border-slate-800 py-1.5 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-600 font-sans">
          <span>Vol. XXVI · No. 2026</span>
          <span className="text-red-700 font-black">{fir.crime_type.replace('_', ' ')}</span>
          <span>Filed: {new Date(fir.date_filed).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Two-page Newspaper Flex Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
        
        {/* LEFT PAGE: Accused Profiles */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest font-sans">
              Accused Profile ({accused.length})
            </span>
            <div className="h-px bg-slate-300 flex-grow ml-3" />
          </div>

          {accused.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-xs text-slate-400 font-sans">
              No accused recorded.
            </div>
          ) : (
            accused.map((item, idx) => (
              <motion.div
                key={`${item.full_name}-${idx}`}
                variants={cardVariants}
                className="group relative rounded-xl bg-white border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition-all duration-200 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200 font-bold font-serif shrink-0 text-lg">
                    {item.full_name.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-red-700 transition-colors font-serif">
                        {item.full_name}
                      </h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${getRiskColor(item.risk_score)}`}>
                        {item.risk_score}/100 · {getRiskLabel(item.risk_score)}
                      </span>
                    </div>
                    {item.alias && (
                      <p className="text-[10px] text-slate-500 italic font-serif">a.k.a. {item.alias}</p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1 font-sans">
                      {item.age || "N/A"} yrs • {item.gender || "Unknown"} • {item.occupation || "Unemployed"}
                    </p>
                  </div>
                </div>

                {item.prior_convictions && item.prior_convictions > 0 ? (
                  <div className="mt-3 py-1 px-2.5 rounded-lg bg-red-50 border border-red-200 text-[10px] text-red-700 font-medium flex items-center gap-1.5 font-sans">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                      <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clipRule="evenodd" />
                    </svg>
                    <span>{item.prior_convictions} Prior Conviction(s)</span>
                  </div>
                ) : null}

                {item.modus_operandi && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide block font-sans">Modus Operandi</span>
                    <p className="text-[10px] text-slate-600 italic leading-relaxed mt-0.5 font-serif">
                      {item.modus_operandi}
                    </p>
                  </div>
                )}

                <Link
                  href={`/dashboard/suspect/${nameToSlug(item.full_name)}`}
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-bold text-slate-700 uppercase tracking-widest transition-all font-sans"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM8 12a4 4 0 0 0 3.193-1.603.75.75 0 1 0-1.186-.918A2.5 2.5 0 0 1 8 10.5a2.5 2.5 0 0 1-2.007-1.021.75.75 0 1 0-1.186.918A4 4 0 0 0 8 12Z" clipRule="evenodd" />
                  </svg>
                  View Full Profile
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* RIGHT PAGE: Unfolds in 3D perspective */}
        <div className="w-full lg:w-3/4 flex flex-col gap-6 animate-page-unfold lg:border-l-2 lg:border-slate-300 lg:pl-8">
          
          {/* Timeline Section */}
          <div className="relative flex flex-col items-center border-b border-slate-300 pb-6">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-4 font-sans">
              Investigation Timeline
            </span>
            <div className="flex items-center justify-between w-full max-w-2xl px-4 relative">
              <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-slate-200" />
              <div 
                className="absolute top-[18px] left-[10%] h-0.5 bg-slate-800 transition-all duration-500" 
                style={{ width: `${statusIdx * 26.6}%` }}
              />
              {[
                "FIR Filed",
                "Investigation Started",
                "Chargesheet Filed",
                "Case Closed"
              ].map((step, idx) => (
                <div key={step} className="flex flex-col items-center z-10 group cursor-default">
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      idx <= statusIdx
                        ? "bg-slate-800 border-slate-800 text-white shadow-md"
                        : "bg-white border-slate-300 text-slate-400"
                    }`}
                  >
                    {idx <= statusIdx ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-xs font-semibold font-sans">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold mt-2.5 max-w-[90px] text-center uppercase tracking-wider transition-colors font-sans ${
                    idx <= statusIdx ? "text-slate-800" : "text-slate-400"
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Columns: Main Case Details & AI Summary */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <motion.div
                variants={cardVariants}
                className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 z-20">
                  <div
                    className="select-none"
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: "10px",
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#b91c1c",
                      border: "2px solid #b91c1c",
                      padding: "3px 8px",
                      borderRadius: "3px",
                      transform: "rotate(-6deg)",
                      opacity: 0.7,
                    }}
                  >
                    {fir.case_number}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-200 pb-4">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 font-sans">
                      {fir.crime_type.replace('_', ' ')}
                    </span>
                    <Link href={`/dashboard/fir/${fir.case_number}`} className="group/fir flex items-center gap-2 mt-6">
                      <h3 className="text-xl font-bold text-slate-900 tracking-wide font-serif group-hover/fir:text-red-800 transition-colors">
                        {fir.case_number}
                      </h3>
                      <span className="text-[10px] text-slate-400 group-hover/fir:text-red-700 transition-colors opacity-0 group-hover/fir:opacity-100 font-sans">→ View Detail</span>
                    </Link>
                  </div>
                  
                  <div className="text-left md:text-right shrink-0 mt-6 md:mt-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans">Date Filed</span>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      {new Date(fir.date_filed).toLocaleDateString("en-IN", {
                        year: "numeric", month: "long", day: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6 font-sans">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Jurisdiction PS</span>
                    <span className="font-semibold text-slate-700">{fir.police_station} Station</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Crime Location</span>
                    <span className="font-semibold text-slate-700">{fir.location_name}</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">Official Case Details</span>
                  <p className="text-slate-700 leading-relaxed bg-[#FAF7F2] rounded-xl p-4 border border-slate-200 max-h-40 overflow-y-auto font-serif italic text-justify first-letter:text-3xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-0.5 first-letter:text-slate-900">
                    &quot;{fir.description}&quot;
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="rounded-xl bg-slate-50 border border-slate-200 p-5 shadow-inner"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM8 12a4 4 0 0 0 3.193-1.603.75.75 0 1 0-1.186-.918A2.5 2.5 0 0 1 8 10.5a2.5 2.5 0 0 1-2.007-1.021.75.75 0 1 0-1.186.918A4 4 0 0 0 8 12Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest font-sans">
                    DRISHTI AI Case Analysis
                  </h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {case_summary || "Initiating digital background checks and forensic analysis..."}
                </p>
              </motion.div>
            </div>

            {/* Right Column: Victims List */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest font-sans">
                  Victim Details ({victims.length})
                </span>
                <div className="h-px bg-slate-300 flex-grow ml-3" />
              </div>

              {victims.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-xs text-slate-400 font-sans">
                  No victim information.
                </div>
              ) : (
                victims.map((item) => (
                  <motion.div
                    key={item.full_name}
                    variants={cardVariants}
                    className="group rounded-xl bg-white border border-slate-200 p-4 hover:border-rose-300 hover:shadow-md transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 font-bold font-serif shrink-0 text-lg">
                        {item.full_name.charAt(0)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-rose-700 transition-colors font-serif">
                            {item.full_name}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${getVulnerabilityColor(item.vulnerability_score)}`}>
                            Vuln: {item.vulnerability_score}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-sans">
                          {item.age || "N/A"} yrs • {item.gender || "Unknown"} • {item.occupation || "N/A"}
                        </p>
                        {item.district_name && (
                          <p className="text-[9px] text-slate-400 font-mono mt-1">{item.district_name}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

          </div>

          {/* Connected Cases (Related FIRs) */}
          <div className="pt-6 border-t border-slate-300 relative">
            <div className="flex items-center justify-between px-1 mb-4 z-10">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest font-sans">
                Cross-Referenced Related Cases ({related_firs.length})
              </span>
              <div className="h-px bg-slate-300 flex-grow ml-3" />
            </div>

            {related_firs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-xs text-slate-400 font-sans">
                No related criminal links identified.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {related_firs.map((refFir) => (
                  <Link
                    key={refFir.case_number}
                    href={`/dashboard/fir/${refFir.case_number}`}
                    className="group rounded-xl bg-white border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition-all duration-200 shadow-sm block"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                        {refFir.case_number}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200 font-sans">
                        {refFir.crime_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mb-2">
                      Filed: {new Date(refFir.date_filed).toLocaleDateString("en-IN")}
                    </p>
                    <div className="py-1.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-medium italic font-serif">
                      Link: {refFir.link_reason}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
