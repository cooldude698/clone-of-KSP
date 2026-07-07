"use client";

import React from "react";
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
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
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
  if (score > 70) return "bg-red-500/10 text-red-400 border border-red-500/20";
  if (score > 40) return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
  return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
};

const getVulnerabilityColor = (score: number) => {
  if (score > 70) return "bg-rose-500/15 text-rose-400 border border-rose-500/20";
  if (score > 40) return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
  return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
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
      <div className="w-full rounded-2xl bg-[#0a1628] border border-slate-900 p-8 min-h-[700px] flex flex-col justify-center items-center gap-4">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-4xl">
          <div className="h-8 bg-slate-800 rounded w-1/3" />
          <div className="h-4 bg-slate-800 rounded w-1/2 mt-2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
            <div className="h-80 bg-slate-800/50 rounded-xl" />
            <div className="h-96 bg-slate-800/80 rounded-xl" />
            <div className="h-80 bg-slate-800/50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl bg-[#0a1628] border border-slate-900/60 p-6 md:p-8 shadow-2xl text-slate-100 overflow-hidden select-none font-sans">
      
      {/* Visual Overlay Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      {/* SVG Dash Offset Animation definition */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-dash-line {
          stroke-dasharray: 6, 4;
          stroke-dashoffset: 100;
          animation: dash 4s linear infinite;
        }
      `}</style>

      {/* ── TOP SECTION: Case Timeline ───────────────────────────────────────── */}
      <div className="relative flex flex-col items-center mb-8 border-b border-slate-800/60 pb-8 z-10">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">
          Investigation Timeline
        </span>
        <div className="flex items-center justify-between w-full max-w-2xl px-4 relative">
          
          {/* Timeline Bar Background */}
          <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-slate-800" />
          <div 
            className="absolute top-[18px] left-[10%] h-0.5 bg-blue-500 transition-all duration-500" 
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
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
              >
                {idx <= statusIdx ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-semibold font-mono">{idx + 1}</span>
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-2.5 max-w-[90px] text-center uppercase tracking-wider transition-colors ${
                idx <= statusIdx ? "text-blue-400" : "text-slate-500"
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MIDDLE SECTION: Investigator's Board Grid ─────────────────────────── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start relative z-10"
      >
        {/* Left Column: Accused List */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
              Accused Profile ({accused.length})
            </span>
            <div className="h-px bg-red-950 flex-grow ml-3" />
          </div>

          {accused.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-6 text-center text-xs text-slate-500">
              No accused recorded.
            </div>
          ) : (
            accused.map((item, idx) => (
              <motion.div
                key={item.full_name}
                variants={cardVariants}
                className="group relative rounded-2xl bg-slate-900/40 border border-slate-900 p-4 hover:border-red-500/20 hover:bg-slate-900/80 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar circle */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/10 to-pink-600/10 text-red-400 flex items-center justify-center border border-red-500/10 font-bold shrink-0">
                    {item.full_name.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                        {item.full_name}
                      </h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${getRiskColor(item.risk_score)}`}>
                        Risk: {item.risk_score}
                      </span>
                    </div>
                    {item.alias && (
                      <p className="text-[10px] text-slate-400 italic">a.k.a. {item.alias}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {item.age || "N/A"} yrs • {item.gender || "Unknown"} • {item.occupation || "Unemployed"}
                    </p>
                  </div>
                </div>

                {/* Prior convictions warning */}
                {item.prior_convictions && item.prior_convictions > 0 ? (
                  <div className="mt-3 py-1 px-2.5 rounded-lg bg-red-950/20 border border-red-950 text-[10px] text-red-300 font-medium flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                      <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clipRule="evenodd" />
                    </svg>
                    <span>{item.prior_convictions} Prior Conviction(s)</span>
                  </div>
                ) : null}

                {/* Modus Operandi description excerpt */}
                {item.modus_operandi && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/40">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block">Modus Operandi</span>
                    <p className="text-[10px] text-slate-400 italic leading-relaxed mt-0.5 line-clamp-2">
                      {item.modus_operandi}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Center Columns: Main Case File Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main FIR Card */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 shadow-xl relative overflow-hidden"
          >
            {/* Stamp accent */}
            <div className="absolute -top-3 -right-3 w-28 h-28 border-4 border-dashed border-blue-500/10 rounded-full flex items-center justify-center select-none rotate-12 pointer-events-none">
              <span className="text-[9px] font-bold text-blue-500/15 uppercase tracking-widest">DRISHTI SEAL</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {fir.crime_type.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-bold text-white tracking-wide mt-2 font-mono">
                  {fir.case_number}
                </h3>
              </div>
              
              <div className="text-left md:text-right shrink-0">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Date Filed</span>
                <span className="text-xs font-mono font-semibold text-slate-300">
                  {new Date(fir.date_filed).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "2-digit"
                  })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">Jurisdiction PS</span>
                <span className="font-semibold text-slate-200">{fir.police_station} Station</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">Crime Location</span>
                <span className="font-semibold text-slate-200">{fir.location_name}</span>
              </div>
            </div>

            <div className="text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">Official Case Details</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950/40 rounded-xl p-4 border border-slate-900/60 max-h-40 overflow-y-auto font-serif italic">
                "{fir.description}"
              </p>
            </div>
          </motion.div>

          {/* AI Case Summary Box */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-slate-950/90 border border-slate-900 p-5 shadow-inner"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM8 12a4 4 0 0 0 3.193-1.603.75.75 0 1 0-1.186-.918A2.5 2.5 0 0 1 8 10.5a2.5 2.5 0 0 1-2.007-1.021.75.75 0 1 0-1.186.918A4 4 0 0 0 8 12Z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                DRISHTI AI Case Analysis
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {case_summary || "Initiating digital background checks and forensic analysis..."}
            </p>
          </motion.div>

        </div>

        {/* Right Column: Victims List */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              Victim Details ({victims.length})
            </span>
            <div className="h-px bg-rose-950 flex-grow ml-3" />
          </div>

          {victims.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-6 text-center text-xs text-slate-500">
              No victim information.
            </div>
          ) : (
            victims.map((item) => (
              <motion.div
                key={item.full_name}
                variants={cardVariants}
                className="group rounded-2xl bg-slate-900/40 border border-slate-900 p-4 hover:border-rose-500/20 hover:bg-slate-900/80 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600/10 to-amber-600/10 text-rose-400 flex items-center justify-center border border-rose-500/10 font-bold shrink-0">
                    {item.full_name.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-rose-400 transition-colors">
                        {item.full_name}
                      </h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${getVulnerabilityColor(item.vulnerability_score)}`}>
                        Vuln: {item.vulnerability_score}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {item.age || "N/A"} yrs • {item.gender || "Unknown"} • {item.occupation || "N/A"}
                    </p>
                    {item.district_name && (
                      <p className="text-[9px] text-slate-500 font-mono mt-1">{item.district_name}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </motion.div>

      {/* ── BOTTOM SECTION: Connected Cases (Related FIRs) ────────────────────── */}
      <div className="mt-8 pt-8 border-t border-slate-800/60 relative">
        <div className="flex items-center justify-between px-1 mb-4 z-10">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Cross-Referenced Related Cases ({related_firs.length})
          </span>
          <div className="h-px bg-blue-950 flex-grow ml-3" />
        </div>

        {/* Animated Dashed Connection Lines Container */}
        {related_firs.length > 0 && (
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
            <svg className="w-full h-full">
              {/* Simply renders a connected layout for demo */}
              <defs>
                <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {related_firs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-6 text-center text-xs text-slate-500">
            No related criminal links identified.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {related_firs.map((refFir) => (
              <div
                key={refFir.case_number}
                className="group rounded-2xl bg-slate-950 border border-slate-900 p-4 hover:border-red-500/35 hover:bg-slate-900/20 transition-all duration-200 shadow-lg relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-white group-hover:text-red-400 transition-colors">
                    {refFir.case_number}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-red-500/10 text-red-400 border border-red-500/25">
                    {refFir.crime_type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mb-2">
                  Filed: {new Date(refFir.date_filed).toLocaleDateString("en-IN")}
                </p>
                <div className="py-1.5 px-2.5 rounded-lg bg-red-950/15 border border-red-950/20 text-[10px] text-red-400/90 font-medium italic">
                  Link: {refFir.link_reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
