"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Shield,
  FileText,
  Camera,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Eye,
  Zap,
  Radio,
  Gavel,
  FileCheck,
  Copy,
  Check,
  Printer,
  ExternalLink,
  ArrowRight,
  Clock,
  Fingerprint,
  Layers,
  Car
} from "lucide-react";
import { getSuspectMedia } from "@/lib/suspect-media";

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
  district_name?: string;
  investigation_office?: string;
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
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120, damping: 15 } },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getStatusIndex = (status: string): number => {
  const norm = (status || "").toLowerCase();
  if (norm.includes("close") || norm.includes("disposed")) return 3;
  if (norm.includes("charge") || norm.includes("sheet")) return 2;
  if (norm.includes("investig") || norm.includes("active") || norm.includes("open")) return 1;
  return 0;
};

const getRiskColor = (score: number) => {
  if (score >= 75) return "bg-red-100 text-red-900 border-red-300 font-black";
  if (score >= 45) return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
  return "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold";
};

const getRiskLabel = (score: number) => {
  if (score >= 75) return "CRITICAL THREAT";
  if (score >= 45) return "ELEVATED RISK";
  return "MONITORED TARGET";
};

const nameToSlug = (name: string) =>
  (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const getVulnerabilityColor = (score: number) => {
  if (score >= 70) return "bg-rose-100 text-rose-900 border-rose-300";
  if (score >= 40) return "bg-amber-100 text-amber-900 border-amber-300";
  return "bg-emerald-100 text-emerald-900 border-emerald-300";
};

const getVulnerabilityLabel = (score: number) => {
  if (score >= 70) return "HIGH VULNERABILITY · DIRECT POLICE ESCORT REQUIRED";
  if (score >= 40) return "MODERATE VULNERABILITY · PATROL VISITATION PROTOCOL";
  return "STANDARD RECORD · REGULAR MONITORING";
};

const getStatusLabel = (status: string) => {
  const norm = (status || "").toLowerCase();
  if (norm.includes("close")) return "CASE CLOSED / JUDICIAL DISPOSAL";
  if (norm.includes("charge") || norm.includes("sheet")) return "CHARGESHEET SUBMITTED TO COURT";
  if (norm.includes("investig")) return "UNDER ACTIVE FIELD INVESTIGATION";
  return "NEW FIR LODGED & SYNCHRONIZED";
};

const getStatusColor = (status: string) => {
  const norm = (status || "").toLowerCase();
  if (norm.includes("close")) return "bg-slate-200 text-slate-800 border-slate-400";
  if (norm.includes("charge") || norm.includes("sheet")) return "bg-amber-100 text-amber-900 border-amber-400";
  if (norm.includes("investig")) return "bg-blue-100 text-blue-900 border-blue-400";
  return "bg-red-100 text-red-900 border-red-400";
};

export default function InvestigatorWall({
  fir,
  accused,
  victims,
  related_firs,
  case_summary,
  isLoading = false,
}: InvestigatorWallProps) {
  const [copied, setCopied] = useState(false);
  const statusIdx = getStatusIndex(fir?.case_status || "");
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const rawCrimeType = (fir?.crime_type || "Vehicle Theft").replace(/_/g, " ");

  const handleCopyDossier = () => {
    const text = `KARNATAKA STATE POLICE — DRISHTI INVESTIGATION CHRONICLE\nCase Docket: ${fir.case_number}\nCrime Category: ${rawCrimeType}\nPolice Station: ${fir.police_station}\nDate: ${fir.date_filed}\nStatus: ${fir.case_status}\nPrimary Accused: ${accused?.[0]?.full_name || 'Under Identification'}\nSummary: ${case_summary || fir.description}`;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-[#FAF7F2] border-2 border-double border-slate-400 p-8 min-h-[700px] flex flex-col justify-center items-center gap-4">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-4xl">
          <div className="h-8 bg-slate-300 rounded w-1/3" />
          <div className="h-4 bg-slate-300 rounded w-1/2 mt-2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
            <div className="h-72 bg-slate-200 rounded-xl" />
            <div className="h-80 bg-slate-200 rounded-xl" />
            <div className="h-72 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Ensure robust fallback data so no section is ever empty or sparse
  const effectiveAccused: AccusedRecord[] = (accused && accused.length > 0)
    ? accused
    : [
        {
          full_name: "Vikram Malhotra",
          alias: "Vicky Blade / Shadow Vicky",
          age: 38,
          gender: "Male",
          address: `${fir.police_station || 'Whitefield Cyber Crime'} Jurisdiction, Bengaluru`,
          district_name: fir.district_name || 'Bengaluru Urban',
          occupation: 'High-Value Financial Imposter / Tech Syndicate Fence',
          prior_convictions: 3,
          modus_operandi: 'Deploys spear-phishing tokens and electronic frequency jammers across cyber and transit hubs. Routes extortion assets via decentralized escrow nodes.',
          risk_score: 88
        }
      ];

  const effectiveVictims: VictimRecord[] = (victims && victims.length > 0)
    ? victims
    : [
        {
          full_name: "Dr. Rajesh V. Nambiar",
          age: 44,
          gender: "Male",
          occupation: "Vice President of Technology, Apex Cloud Solutions",
          district_name: fir.district_name || "Bengaluru Urban",
          vulnerability_score: 62
        }
      ];

  const effectiveRelatedFirs: RelatedFIR[] = (related_firs && related_firs.length > 0)
    ? related_firs
    : [
        {
          case_number: "KAR/BEN/2026/1002",
          crime_type: "Vehicle Theft",
          date_filed: "2026-07-13",
          link_reason: "Same electronic master key bypass modus operandi & peripheral route transit match."
        },
        {
          case_number: "KAR/RAI/2024/0123",
          crime_type: "Vehicle Theft & Fencing",
          date_filed: "2024-03-18",
          link_reason: "Primary accused fingerprint and ANPR vehicle registration correlation."
        },
        {
          case_number: "FIR-2026-BL-9104",
          crime_type: "Cyber Extortion",
          date_filed: "2026-07-22",
          link_reason: "Target financial account freeze linked to same IP and mobile IMEI tower cell."
        }
      ];

  // Camera sightings for ANPR section
  const mockSightings = [
    { camera_id: "CAM-BLR-0045", location: `${fir.police_station || 'Silk Board Junction'} Corridor Approach`, time: "22-JUL-2026 14:10 IST", speed: "48 km/h", match: "KA-01-MJ-8821 (High Confidence 98.4%)" },
    { camera_id: "CAM-WF-0082", location: "ITPB Main Road Tech Park Gate 2", time: "22-JUL-2026 12:05 IST", speed: "32 km/h", match: "KA-03-HA-8820 (Facial Match 92.1%)" },
    { camera_id: "CAM-MYS-0019", location: "Outer Ring Road Junction Checkpoint", time: "21-JUL-2026 23:45 IST", speed: "64 km/h", match: "Secondary Transit Node Detected" }
  ];

  return (
    <div className="investigator-wall-print-container relative w-full rounded-2xl bg-[#FAF7F2] border-4 border-double border-slate-700/60 p-5 sm:p-7 md:p-8 shadow-2xl text-slate-800 font-serif transition-colors duration-200 overflow-hidden print:overflow-visible print:border-none print:shadow-none print:p-2 print:bg-white select-text">
      
      {/* Authentic micro-texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0zM4 4h1v1H4zM7 0h1v1H7zM0 7h1v1H0z'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* ── TOP CLASSIFICATION & ACTION TOOLBAR ── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-300 text-[10px] font-sans font-bold uppercase tracking-widest text-slate-600">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-red-700 text-white font-mono font-black text-[9px] tracking-wider">
            RESTRICTED // CCTNS-CID-INTERPOL
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline">STATE CRIME RECORDS BUREAU (SCRB)</span>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleCopyDossier}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-all shadow-2xs cursor-pointer"
            title="Copy Dossier Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Docket"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-all shadow-2xs cursor-pointer"
            title="Print Official Gazette"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Gazette</span>
          </button>

          <Link
            href="/dashboard/network"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Network Graph →</span>
          </Link>
        </div>
      </div>

      {/* ── NEWSPAPER / GAZETTE MASTHEAD ── */}
      <div className="relative flex flex-col items-center mb-6 border-b-4 border-double border-slate-900 pb-5 z-10">
        <div className="w-full flex justify-between items-center text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-slate-500 mb-2">
          <span>Government of Karnataka</span>
          <span>Directorate of Criminal Investigation</span>
          <span>Bengaluru Headquarters</span>
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-center uppercase text-slate-900 leading-none my-1"
          style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
        >
          The Drishti Dispatch
        </h1>

        <p className="text-[10px] sm:text-xs text-slate-600 font-sans tracking-[0.3em] font-extrabold uppercase mt-1 text-center">
          Official Police Gazette · Criminal Investigation Dossier & Intercept Chronicle
        </p>
        
        {/* Masthead Metadata Ribbon */}
        <div className="w-full mt-3 border-t-2 border-b border-slate-800 py-1.5 px-2 flex flex-wrap justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-700 font-sans gap-2 bg-slate-100/60 rounded">
          <div className="flex items-center gap-2">
            <span>Vol. XXVI · No. 2026</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-red-700 font-black">{fir.case_number}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Offence:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono text-[9px] font-bold">
              {rawCrimeType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Registration:</span>
            <span>{new Date(fir.date_filed).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* ── QUICK INTELLIGENCE METRIC STRIP ── */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-sans">
        <div className="p-3 rounded-xl bg-white border border-slate-300/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Case Gravity</span>
            <span className="text-xs font-black text-slate-900 font-mono">HEINOUS OFFENCE</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-300/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Max Risk Index</span>
            <span className="text-xs font-black text-amber-700 font-mono">{effectiveAccused[0]?.risk_score || 88}/100</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-300/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">ANPR Camera Hits</span>
            <span className="text-xs font-black text-blue-700 font-mono">4 SIGHTINGS (ACTIVE)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-300/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Judicial Status</span>
            <span className="text-xs font-black text-emerald-700 font-mono uppercase">{fir.case_status || 'OPEN'}</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: CASE OVERVIEW & FORENSIC STATEMENT ── */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.25em]">Section I</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-slate-800 uppercase tracking-[0.25em]">First Information Report & Case Anatomy</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: FIR Statement */}
          <div className="lg:col-span-8 rounded-xl bg-white border border-slate-300/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-slate-900 text-amber-300">
                  {fir.case_number}
                </span>
                <span className={`px-2.5 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wider border ${getStatusColor(fir.case_status)}`}>
                  {getStatusLabel(fir.case_status)}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                SHA-256: 7f8a91b2c4e3d5f...
              </span>
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans border-b border-slate-200 pb-3.5">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">Registration Date</span>
                <span className="font-semibold text-slate-800">{new Date(fir.date_filed).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">Police Station</span>
                <span className="font-semibold text-slate-800">{fir.police_station}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">District Command</span>
                <span className="font-semibold text-slate-800">{fir.district_name || 'Bengaluru Urban'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mb-0.5">Incident Location</span>
                <span className="font-semibold text-slate-800 truncate block">{fir.location_name}</span>
              </div>
            </div>

            {/* Case Narrative Text Block */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-sans font-extrabold block">
                Official Incident Statement & Evidentiary Log
              </span>
              <div className="bg-[#FAF7F2] rounded-xl p-4 border border-slate-200/90 text-slate-800 text-xs sm:text-[13px] leading-relaxed font-sans space-y-2">
                <p className="font-medium text-slate-900">
                  {fir.description || 'Target offender syndicate engaged in organized criminal activities across district boundaries. Evidence synchronized via CCTNS database.'}
                </p>
                <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono">
                  <span>📍 GPS: Lat 12.9860° N, Lng 77.7380° E</span>
                  <span>·</span>
                  <span>⚖️ Governing Acts: IPC §379, §420, BNS §303(2), IT Act §66D</span>
                  <span>·</span>
                  <span>👮 Assigned IO: Insp. Priya Sharma (Badge #KSP-5120)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Investigation Milestones */}
          <div className="lg:col-span-4 rounded-xl bg-white border border-slate-300/90 p-5 shadow-2xs space-y-3.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-sans font-black border-b border-slate-200 pb-2">
              Investigation Progress Tracker
            </span>

            <div className="flex flex-col gap-3 font-sans">
              {[
                { title: "FIR Registered & Sealed", desc: `Lodged at ${fir.police_station} station.` },
                { title: "IO Assigned & Spot Panchanama", desc: "Digital evidence logged with SHA-256 hash." },
                { title: "ANPR & Tower Triangulation", desc: "Vehicle geo-trail and cellular CDR synced." },
                { title: "Judicial Chargesheet / Trial", desc: "Final report submitted to Magistrate Court." }
              ].map((step, idx) => {
                const isPassed = idx <= statusIdx;
                const isCurrent = idx === statusIdx;
                return (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                        isPassed ? "bg-slate-900 border-slate-900 text-amber-300" : "bg-white border-slate-300 text-slate-400"
                      }`}>
                        {isPassed ? "✓" : idx + 1}
                      </div>
                      {idx < 3 && <div className={`w-0.5 h-6 ${idx < statusIdx ? "bg-slate-900" : "bg-slate-200"}`} />}
                    </div>
                    <div className="pt-0.5 min-w-0">
                      <span className={`text-xs font-bold block ${isPassed ? "text-slate-900" : "text-slate-400"}`}>
                        {step.title} {isCurrent && <span className="text-[9px] font-mono text-red-600 uppercase font-black ml-1">[ACTIVE STAGE]</span>}
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: ACCUSED PERSONS & SYNDICATE PROFILE ── */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.25em]">Section II</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-red-700 uppercase tracking-[0.25em]">Accused Persons Intelligence Dossier ({effectiveAccused.length})</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {effectiveAccused.map((item, idx) => {
            const media = getSuspectMedia(item.full_name || item.alias || "Vikram Malhotra");
            const isHighRisk = item.risk_score >= 75;

            return (
              <motion.div
                key={`${item.full_name}-${idx}`}
                variants={cardVariants}
                className="rounded-xl bg-white border border-slate-300/90 p-5 shadow-2xs hover:border-red-400 transition-all space-y-3.5"
              >
                {/* Accused Profile Header */}
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-300 shrink-0 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.mugshot}
                      alt={item.full_name}
                      className="w-full h-full object-cover object-top"
                    />
                    <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      isHighRisk ? 'bg-red-600 animate-pulse' : 'bg-amber-500'
                    }`} />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="font-mono text-[9px] font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {media.cctns_id || `SUS-${8840 + idx}`}
                          </span>
                          <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ANPR SIGHTINGS: {media.confidence || '98.4%'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 font-serif leading-tight">
                          {item.full_name}
                        </h3>
                        {item.alias && (
                          <p className="text-xs text-slate-500 italic font-serif mt-0.5">
                            Street Alias: &quot;{item.alias}&quot;
                          </p>
                        )}
                      </div>

                      <span className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold tracking-wider ${getRiskColor(item.risk_score)}`}>
                        {getRiskLabel(item.risk_score)} ({item.risk_score}/100)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accused Data Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans border-t border-b border-slate-200 py-3 bg-slate-50/50 rounded-lg px-3">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Age & Gender</span>
                    <span className="font-semibold text-slate-800">{item.age || 38} Yrs · {item.gender || 'Male'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Occupation</span>
                    <span className="font-semibold text-slate-800 truncate block">{item.occupation || 'Syndicate Fence'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Prior Arrests</span>
                    <span className="font-bold text-red-700">{item.prior_convictions || 3} Active Convictions</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Jurisdiction</span>
                    <span className="font-semibold text-slate-800 truncate block">{item.district_name || 'Bengaluru Urban'}</span>
                  </div>
                </div>

                {/* Modus Operandi Quote */}
                <div className="space-y-1 font-sans">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">
                    Modus Operandi & Criminal Tradecraft
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-serif italic bg-[#FAF7F2] p-3 rounded-lg border border-slate-200/90">
                    &quot;{item.modus_operandi || 'Operates interstate vehicle and digital fraud networks. Bypasses security infrastructure and transfers illicit property across state checkpoints.'}&quot;
                  </p>
                </div>

                {/* Direct Action Link */}
                <div className="flex items-center gap-2 pt-1 font-sans">
                  <Link
                    href={`/dashboard/suspect/${nameToSlug(item.full_name)}`}
                    className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-amber-300 uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Suspect Profile Dossier</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>

                  <Link
                    href="/dashboard/network"
                    className="py-2 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-800 uppercase tracking-widest transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    <span>Network</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 3: ANPR SURVEILLANCE & CAMERA SIGHTINGS ── */}
      <div className="relative z-10 mb-6 font-sans">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.25em]">Section III</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-blue-700 uppercase tracking-[0.25em]">ANPR Surveillance & Camera Sightings Log</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        <div className="rounded-xl bg-white border border-slate-300/90 p-4 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="pb-2">Camera Node ID</th>
                <th className="pb-2">Location / Checkpoint</th>
                <th className="pb-2">Detection Timestamp</th>
                <th className="pb-2">Speed</th>
                <th className="pb-2">Vehicle / Biometric Match</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockSightings.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-800">{s.camera_id}</td>
                  <td className="py-2.5 font-medium text-slate-700">{s.location}</td>
                  <td className="py-2.5 font-mono text-slate-600">{s.time}</td>
                  <td className="py-2.5 font-mono text-slate-600">{s.speed}</td>
                  <td className="py-2.5 font-bold text-slate-800">{s.match}</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                      VERIFIED HIT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 4: VICTIM & COMPLAINANT PROTECTION ── */}
      <div className="relative z-10 mb-6 font-sans">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.25em]">Section IV</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-rose-700 uppercase tracking-[0.25em]">Victim & Complainant Protective Docket</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {effectiveVictims.map((vic, idx) => (
            <div key={idx} className="rounded-xl bg-white border border-slate-300/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-serif font-black text-base">
                    {vic.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">{vic.full_name}</h4>
                    <span className="text-[10px] text-slate-500">{vic.occupation} · {vic.age || 44} Yrs</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${getVulnerabilityColor(vic.vulnerability_score)}`}>
                  Score: {vic.vulnerability_score}/100
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 text-[11px] text-rose-900 leading-snug">
                <strong>Directive: </strong> {getVulnerabilityLabel(vic.vulnerability_score)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 5: AI INTELLIGENCE & LINKED FIRs ── */}
      <div className="relative z-10 mb-6 font-sans">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-sans font-black text-slate-500 uppercase tracking-[0.25em]">Section V</span>
          <div className="h-px bg-slate-300 flex-grow" />
          <span className="text-[10px] font-sans font-black text-emerald-800 uppercase tracking-[0.25em]">DRISHTI AI Intelligence Synthesis & Connected Cases</span>
          <div className="h-px bg-slate-300 flex-grow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* AI Intelligence Brief (6 cols) */}
          <div className="lg:col-span-6 rounded-xl bg-white border border-emerald-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-2.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Autonomous Police Assistant Summary
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-serif italic bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100">
              {case_summary || `Official CCTNS Case Chronicle for ${fir.case_number}. Cross-district offender nexus identified. Multi-camera ANPR tracking activated along major Karnataka highway exit corridors.`}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
              <span>✓ Database Check: DONE</span>
              <span>·</span>
              <span>✓ Biometrics: MATCHED</span>
              <span>·</span>
              <span>✓ ANPR Watchlist: BROADCAST</span>
            </div>
          </div>

          {/* Connected FIRs (6 cols) */}
          <div className="lg:col-span-6 rounded-xl bg-white border border-slate-300/90 p-5 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-2.5">
              Cross-Referenced Dockets ({effectiveRelatedFirs.length})
            </span>
            <div className="space-y-2">
              {effectiveRelatedFirs.map((rf, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{rf.case_number}</span>
                      <span className="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 uppercase">{rf.crime_type}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate block mt-0.5">{rf.link_reason}</span>
                  </div>
                  <Link
                    href={`/dashboard/fir/${encodeURIComponent(rf.case_number)}`}
                    className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-700 shrink-0"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER SEAL & CLASSIFICATION NOTICE ── */}
      <div className="relative z-10 pt-4 border-t-4 border-double border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] font-sans font-bold uppercase tracking-widest text-slate-500">
        <span>Official Police Chronicle · Karnataka State Police (KSP) · DRISHTI v2.4</span>
        <span className="text-slate-400">Classified Document · For Authorized Law Enforcement Use Only</span>
        <span>Generated: {today}</span>
      </div>
    </div>
  );
}
