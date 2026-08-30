'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Fingerprint,
  Clock,
  MapPin,
  Radio,
  Scale,
  FileText,
  Search,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  RefreshCw,
  Eye,
  Sliders,
  Car,
  Phone,
  Camera,
  Activity,
  ArrowUpRight,
  Share2,
  Crosshair
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DEMO_FIRS } from '@/lib/demo-data';

// ── TYPES & DATA DEFINITIONS ──

type WorkbenchTab = 'mo_linker' | 'chrono_forecaster' | 'geo_profiling' | 'telemetry_fusion' | 'ach_matrix' | 'legal_dossier';

// 24x7 Matrix Days & Hours
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

// Preset Chrono Heatmatrix (Vehicle Theft & Narcotics profile)
const CHRONO_HEAT_PRESETS: Record<string, number[][]> = {
  vehicle_theft: [
    // Mon: 00-23
    [4, 5, 2, 1, 0, 0, 1, 2, 2, 1, 1, 2, 2, 3, 2, 3, 4, 6, 7, 8, 9, 8, 7, 5],
    // Tue
    [3, 4, 1, 0, 0, 0, 1, 1, 2, 1, 2, 2, 2, 2, 3, 3, 5, 6, 8, 9, 10, 9, 6, 4],
    // Wed
    [4, 3, 1, 1, 0, 0, 1, 2, 1, 2, 2, 2, 3, 2, 3, 4, 6, 7, 9, 11, 11, 8, 7, 5],
    // Thu
    [5, 4, 2, 1, 0, 0, 1, 1, 2, 2, 1, 2, 2, 3, 4, 5, 7, 8, 10, 12, 12, 9, 8, 6],
    // Fri (Peak strike nights)
    [7, 9, 6, 2, 1, 0, 1, 2, 2, 3, 2, 3, 4, 4, 5, 7, 9, 12, 14, 16, 18, 15, 12, 9],
    // Sat (Peak strike nights)
    [9, 11, 8, 4, 2, 1, 1, 1, 2, 2, 3, 4, 4, 5, 6, 8, 11, 14, 17, 19, 20, 18, 14, 10],
    // Sun
    [6, 8, 5, 2, 1, 0, 0, 1, 1, 2, 2, 2, 3, 3, 4, 6, 8, 10, 12, 14, 15, 12, 9, 7],
  ],
  narcotics: [
    [2, 3, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 4, 4, 5, 6, 8, 9, 11, 12, 10, 8, 4],
    [2, 2, 1, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 10, 12, 13, 11, 7, 3],
    [3, 2, 0, 0, 0, 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 7, 8, 9, 11, 13, 14, 12, 8, 5],
    [3, 3, 1, 0, 0, 0, 0, 1, 2, 2, 3, 3, 4, 5, 6, 8, 9, 11, 13, 15, 16, 14, 9, 6],
    [5, 6, 3, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 16, 18, 22, 24, 20, 15, 9],
    [7, 8, 4, 2, 0, 0, 0, 1, 2, 3, 4, 5, 7, 8, 10, 13, 16, 19, 21, 25, 26, 22, 17, 11],
    [4, 5, 2, 1, 0, 0, 0, 0, 1, 2, 3, 3, 4, 5, 6, 8, 10, 12, 15, 17, 18, 14, 10, 6],
  ],
  burglary: [
    [6, 8, 9, 4, 1, 0, 0, 0, 0, 1, 1, 2, 2, 3, 2, 1, 1, 2, 3, 5, 7, 8, 9, 8],
    [5, 7, 8, 3, 1, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 1, 1, 2, 4, 6, 8, 9, 10, 7],
    [7, 8, 10, 5, 2, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 3, 4, 7, 8, 10, 10, 8],
    [6, 9, 10, 4, 1, 0, 0, 0, 0, 1, 1, 2, 2, 3, 2, 1, 2, 3, 5, 8, 9, 11, 11, 9],
    [8, 11, 13, 6, 2, 1, 0, 0, 0, 1, 2, 2, 3, 3, 3, 2, 3, 5, 7, 10, 12, 14, 14, 11],
    [10, 14, 15, 8, 3, 1, 0, 0, 0, 1, 2, 3, 3, 4, 3, 2, 3, 6, 9, 12, 14, 16, 15, 12],
    [7, 10, 11, 5, 2, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 2, 4, 6, 8, 10, 12, 11, 9],
  ]
};

// Historical Case Base for MO Matching
const CCTNS_MO_REPOSITORY = [
  {
    case_number: 'KAR/BLR/2026/04921',
    title: 'Pulsar 220 Midnight Handle-Lock Bypass',
    ps: 'Silk Board TTMC PS',
    district: 'Bengaluru Urban',
    crime_type: 'Vehicle Theft',
    entry_method: 'Spark plug T-key bypass',
    tools: ['Modified T-Hex Key', 'RF Jammer mini', 'Wire snipper'],
    target: 'Bajaj Pulsar / Royal Enfield',
    time_bracket: '00:30 – 03:00',
    getaway: 'Loaded into covered Bolero pickup transit',
    suspect_link: 'Ramesh Kumar (Bullet Ramesh)',
    similarity_score: 98.4,
    shared_vectors: ['Tool signature', 'Time window', 'Target model', 'Border corridor transit']
  },
  {
    case_number: 'KAR/RAI/2026/01184',
    title: 'Suburban Parking Lock-Snip Multi-Theft',
    ps: 'Raichur Suburban PS',
    district: 'Raichur',
    crime_type: 'Vehicle Theft',
    entry_method: 'Spark plug T-key bypass',
    tools: ['Modified T-Hex Key', 'Duplicate key blank'],
    target: 'TVS Apache RTR / Pulsar',
    time_bracket: '01:15 – 03:45',
    getaway: 'Direct inter-district ride-out',
    suspect_link: 'Ramesh Kumar (Bullet Ramesh)',
    similarity_score: 94.6,
    shared_vectors: ['Tool signature', 'Ignition lock damage pattern', 'Nighttime bracket']
  },
  {
    case_number: 'KAR/BID/2026/00897',
    title: 'Market Yard Two-Wheeler Syndicate Lifting',
    ps: 'Bidar Market PS',
    district: 'Bidar',
    crime_type: 'Vehicle Theft',
    entry_method: 'Master Key ignition tamper',
    tools: ['T-Key', 'Blank Key set'],
    target: 'Royal Enfield Classic 350',
    time_bracket: '23:45 – 02:30',
    getaway: 'Fenced to border scrap dealer',
    suspect_link: 'Ramesh Kumar Syndicate',
    similarity_score: 89.2,
    shared_vectors: ['Ignition lock damage', 'Fencing route']
  },
  {
    case_number: 'KAR/TUM/2026/00412',
    title: 'Highway Motel Transit Vehicle Theft',
    ps: 'Tumakuru Town PS',
    district: 'Tumakuru',
    crime_type: 'Vehicle Theft',
    entry_method: 'Electronic frequency grabber',
    tools: ['Code grabber', 'Lock shim'],
    target: 'Hyundai i10 / Maruti Swift',
    time_bracket: '02:00 – 04:30',
    getaway: 'Toll bypass corridor NH-48',
    suspect_link: 'Unknown Associate',
    similarity_score: 72.1,
    shared_vectors: ['Corridor route', 'Night timeframe']
  },
];

// Telemetry Multi-Sensor Fusion Data
const FUSION_TIMELINE = [
  {
    timestamp: '28 Jul 2026 · 01:12:44 IST',
    sensor: 'ANPR Camera CAM-BLR-0045 (Silk Board)',
    type: 'ANPR',
    detection: 'KA-01-MJ-8821 (White i10) + KA-36-TR-8821 (Pulsar convoy)',
    confidence: '99.4%',
    match_status: 'SUSPECT_DIRECT_HIT',
    co_detected: 'Shadow Mobile IMSI 404-45-882190 (Tower BLR-SB-04)'
  },
  {
    timestamp: '28 Jul 2026 · 01:28:10 IST',
    sensor: 'CCTNS Crime Scene Logging (FIR-2026-04921)',
    type: 'CRIME_SCENE',
    detection: 'Vehicle stolen outside Madiwala apartment parking bay',
    confidence: 'CONFIRMED',
    match_status: 'INCIDENT_ORIGIN',
    co_detected: 'Security CCTV frame matches Bullet Ramesh physique'
  },
  {
    timestamp: '28 Jul 2026 · 02:04:19 IST',
    sensor: 'Electronic City Toll Fastag + ANPR',
    type: 'TOLL_FASTAG',
    detection: 'KA-01-MJ-8821 passed Lane 4 heading towards Hosur / NH-44',
    confidence: '100%',
    match_status: 'EGRESS_CORRIDOR',
    co_detected: 'Speed: 78 km/h · Accompanying vehicle KA-05-EV-9012'
  },
  {
    timestamp: '28 Jul 2026 · 02:35:50 IST',
    sensor: 'Cell Tower CDR Dump (Attibele Border Tower)',
    type: 'CDR_TOWER',
    detection: 'IMSI 404-45-882190 co-located with Secondary SIM 404-45-771920',
    confidence: '98.1%',
    match_status: 'CO_TRAVELER_FLAG',
    co_detected: 'Secondary SIM registered under alias "S. Naidu"'
  }
];

// Analysis of Competing Hypotheses (ACH) Matrix
const DEFAULT_ACH_HYPOTHESES = [
  { id: 'H1', title: 'H1: Interstate Syndicate Operation (Bullet Ramesh Network)', score: 0 },
  { id: 'H2', title: 'H2: Insider/Security Guard Complicity', score: 0 },
  { id: 'H3', title: 'H3: Local Copycat Opportunist', score: 0 },
  { id: 'H4', title: 'H4: Commercial Fencing Chopshop Direct Order', score: 0 }
];

const ACH_EVIDENCE_ITEMS = [
  {
    id: 'E1',
    description: 'Modified spark plug T-key bypass signature found at 4 separate scenes',
    diagnosticity: 'HIGH',
    ratings: { H1: 'CONSISTENT', H2: 'INCONSISTENT', H3: 'INCONSISTENT', H4: 'CONSISTENT' }
  },
  {
    id: 'E2',
    description: 'ANPR detection of White i10 (KA-01-MJ-8821) exiting Hosur corridor within 40 mins',
    diagnosticity: 'HIGH',
    ratings: { H1: 'CONSISTENT', H2: 'INCONSISTENT', H3: 'INCONSISTENT', H4: 'CONSISTENT' }
  },
  {
    id: 'E3',
    description: 'Apartment CCTV shows lone perpetrator operating without keys or insider gate opening',
    diagnosticity: 'MEDIUM',
    ratings: { H1: 'CONSISTENT', H2: 'VERY_INCONSISTENT', H3: 'CONSISTENT', H4: 'CONSISTENT' }
  },
  {
    id: 'E4',
    description: 'Cell tower CDR triangulates Bullet Ramesh secondary burner phone at Silk Board at 01:10',
    diagnosticity: 'VERY_HIGH',
    ratings: { H1: 'HIGHLY_CONSISTENT', H2: 'INCONSISTENT', H3: 'VERY_INCONSISTENT', H4: 'CONSISTENT' }
  },
  {
    id: 'E5',
    description: 'Stolen vehicle parts offered in Bidar scrap market within 36 hours',
    diagnosticity: 'HIGH',
    ratings: { H1: 'HIGHLY_CONSISTENT', H2: 'INCONSISTENT', H3: 'INCONSISTENT', H4: 'HIGHLY_CONSISTENT' }
  }
];

export default function AnalystWorkbench() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('mo_linker');

  // MO Linker state
  const [selectedMoCase, setSelectedMoCase] = useState(CCTNS_MO_REPOSITORY[0]);
  const [customMoNarrative, setCustomMoNarrative] = useState('');
  const [isMatchingMo, setIsMatchingMo] = useState(false);
  const [linkedSeries, setLinkedSeries] = useState<string[]>(['KAR/BLR/2026/04921', 'KAR/RAI/2026/01184']);

  // Chrono Forecaster state
  const [selectedCrimeType, setSelectedCrimeType] = useState<'vehicle_theft' | 'narcotics' | 'burglary'>('vehicle_theft');
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru Urban');

  // Geo Profiling state
  const [bufferDistanceKm, setBufferDistanceKm] = useState(1.2);
  const [geoFirsCount, setGeoFirsCount] = useState(5);

  // Legal Dossier Target
  const [dossierSuspect, setDossierSuspect] = useState('Ramesh Kumar');

  // Handle MO search
  const handleRunMoMatching = () => {
    setIsMatchingMo(true);
    setTimeout(() => {
      setIsMatchingMo(false);
    }, 600);
  };

  const handleToggleSeriesLink = (caseNum: string) => {
    setLinkedSeries(prev => 
      prev.includes(caseNum) ? prev.filter(c => c !== caseNum) : [...prev, caseNum]
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-white pb-16">
      
      {/* ── TOP COMPACT HEADER BANNER ── */}
      <div className="py-3 px-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-2">
            <span>Specialized Crime & Intelligence Workbench</span>
            <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/70">
              CCTNS v4.2
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Multi-modal analytical suite: MO Linkage, Chrono Forecasting, Rossmo Profiling, Telemetry Fusion & Legal Dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-teal-800">5.35L Records Synced</span>
          </div>
        </div>
      </div>

      {/* ── TOOL NAVIGATION TABS ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80">
        {[
          { id: 'mo_linker', label: 'MO Linkage & Matcher', icon: Fingerprint, badge: 'Similarity' },
          { id: 'chrono_forecaster', label: '24×7 Chrono Matrix', icon: Clock, badge: 'Forecast' },
          { id: 'geo_profiling', label: 'Rossmo Geographic Profiler', icon: MapPin, badge: 'Geo Anchor' },
          { id: 'telemetry_fusion', label: 'Telemetry Multi-Sensor Fusion', icon: Radio, badge: 'Corroboration' },
          { id: 'ach_matrix', label: 'ACH Hypothesis Matrix', icon: Scale, badge: 'Evidence Bias' },
          { id: 'legal_dossier', label: 'Court Dossier Generator', icon: FileText, badge: 'BNS/BSA' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkbenchTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0F5257] text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: MODUS OPERANDI (MO) LINKAGE & COLD CASE SIMILARITY ENGINE ── */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'mo_linker' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT 4 COLS: CASE INPUT & MO PARAMETER EXTRACTOR */}
            <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Target Case / MO Vectors
                    </h2>
                    <p className="text-[11px] text-slate-500">Select active FIR or enter new narrative</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
                    NLP Vectorizer
                  </span>
                </div>

                {/* Case selector dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Select Seed FIR Case</label>
                  <select
                    value={selectedMoCase.case_number}
                    onChange={(e) => {
                      const found = CCTNS_MO_REPOSITORY.find(c => c.case_number === e.target.value);
                      if (found) setSelectedMoCase(found);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  >
                    {CCTNS_MO_REPOSITORY.map(c => (
                      <option key={c.case_number} value={c.case_number}>
                        {c.case_number} · {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extracted MO vectors */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Entry Method:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMoCase.entry_method}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Tools / Weapon:</span>
                    <span className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400">{selectedMoCase.tools.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Target Profile:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMoCase.target}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Time Window:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{selectedMoCase.time_bracket}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Getaway Transit:</span>
                    <span className="text-slate-700 dark:text-slate-300 text-right">{selectedMoCase.getaway}</span>
                  </div>
                </div>

                {/* Custom Narrative input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Or Parse Unstructured Incident Statement</label>
                  <textarea
                    rows={3}
                    placeholder="E.g. Suspect broke ignition switch between 1am-3am using T-hex key and loaded Pulsar into freight pickup..."
                    value={customMoNarrative}
                    onChange={(e) => setCustomMoNarrative(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={handleRunMoMatching}
                  disabled={isMatchingMo}
                  className="flex-1 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isMatchingMo ? 'animate-spin' : ''}`} />
                  <span>{isMatchingMo ? 'Scanning CCTNS Historical FIRs...' : 'Execute Vector Match'}</span>
                </button>
              </div>
            </div>

            {/* RIGHT 8 COLS: SIMILARITY MATCHES & CRIME SERIES LINKER */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                    {CCTNS_MO_REPOSITORY.length}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-blue-900 dark:text-blue-100">
                      Cross-District Crime Series Linkages Found
                    </h3>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      High-confidence MO overlap across Bengaluru Urban, Raichur, Bidar, and Tumakuru.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-900 dark:text-blue-200">
                    Linked Series: {linkedSeries.length} FIRs
                  </span>
                </div>
              </div>

              {/* Match Cards List */}
              <div className="space-y-3">
                {CCTNS_MO_REPOSITORY.map((match) => {
                  const isLinked = linkedSeries.includes(match.case_number);
                  return (
                    <div
                      key={match.case_number}
                      className={`p-5 rounded-3xl bg-white dark:bg-[#18181B] border transition-all ${
                        isLinked
                          ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-black text-xs">
                            {match.case_number}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {match.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="w-3 h-3" />
                            <span>{match.similarity_score}% Match</span>
                          </div>
                          <button
                            onClick={() => handleToggleSeriesLink(match.case_number)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              isLinked
                                ? 'bg-rose-600 text-white hover:bg-rose-700'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isLinked ? 'Unlink from Series' : '+ Link to Crime Series'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Police Station</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{match.ps} ({match.district})</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Object</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{match.target}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Identified Suspect Link</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{match.suspect_link}</span>
                        </div>
                      </div>

                      {/* Shared Signature Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Shared Vectors:</span>
                        {match.shared_vectors.map((vec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-medium"
                          >
                            ✓ {vec}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: 24×7 CHRONO-TEMPORAL MATRIX & RECURRENCE FORECASTER ── */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'chrono_forecaster' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Control Strip */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Crime Category</label>
                <select
                  value={selectedCrimeType}
                  onChange={(e) => setSelectedCrimeType(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="vehicle_theft">Vehicle Theft (BNS §303 / IPC §379)</option>
                  <option value="narcotics">Commercial Narcotics / NDPS</option>
                  <option value="burglary">Night Residential Burglary</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Jurisdiction</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Bengaluru Urban">Bengaluru Urban (State Command)</option>
                  <option value="Raichur">Raichur District</option>
                  <option value="Bidar">Bidar District</option>
                  <option value="Kalaburagi">Kalaburagi District</option>
                </select>
              </div>
            </div>

            {/* Recurrence Cadence Indicators */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block">Mean Strike Recurrence</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">5.8 Days (± 0.9d)</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block">Bayesian Model Fit</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">96.8% Conf.</span>
              </div>
            </div>
          </div>

          {/* 24x7 Heatmatrix Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  24×7 Chrono-Temporal Incident Heatmatrix
                </h3>
                <p className="text-xs text-slate-500">Incident frequency mapped across day-of-week vs. 24 hourly brackets</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span>Low</span>
                <div className="flex items-center gap-0.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800" />
                  <span className="w-3 h-3 rounded-xs bg-blue-200 dark:bg-blue-950" />
                  <span className="w-3 h-3 rounded-xs bg-blue-400 dark:bg-blue-800" />
                  <span className="w-3 h-3 rounded-xs bg-blue-600 dark:bg-blue-600" />
                  <span className="w-3 h-3 rounded-xs bg-rose-500 dark:bg-rose-600" />
                </div>
                <span>Peak Strike Window</span>
              </div>
            </div>

            <div className="min-w-[760px]">
              {/* Hour header row */}
              <div className="grid grid-cols-25 gap-1 text-[9px] font-mono text-slate-400 text-center mb-1">
                <div className="text-left font-bold pl-1">Day</div>
                {HOURS.map((h, i) => (
                  <div key={h}>{i % 3 === 0 ? h.slice(0, 2) : '·'}</div>
                ))}
              </div>

              {/* Days rows */}
              <div className="space-y-1">
                {DAYS.map((day, dIdx) => {
                  const matrixData = CHRONO_HEAT_PRESETS[selectedCrimeType] || CHRONO_HEAT_PRESETS.vehicle_theft;
                  const row = matrixData[dIdx] || [];
                  return (
                    <div key={day} className="grid grid-cols-25 gap-1 items-center">
                      <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 pl-1">
                        {day}
                      </span>
                      {row.map((val, hIdx) => {
                        let bg = 'bg-slate-100 dark:bg-slate-800/80 text-slate-400';
                        if (val >= 16) bg = 'bg-rose-500 text-white font-bold animate-pulse';
                        else if (val >= 12) bg = 'bg-blue-600 text-white font-bold';
                        else if (val >= 7) bg = 'bg-blue-400 dark:bg-blue-700 text-white';
                        else if (val >= 3) bg = 'bg-blue-200 dark:bg-blue-900/60 text-slate-700 dark:text-slate-300';

                        return (
                          <div
                            key={hIdx}
                            title={`${day} ${HOURS[hIdx]}: ${val} incidents logged`}
                            className={`h-7 rounded-md flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-125 hover:z-10 cursor-pointer ${bg}`}
                          >
                            {val > 5 ? val : ''}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tactical Advisory & Imminent Strike Prediction Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-mono font-extrabold uppercase tracking-wider">
                    ⚡ IMMINENT STRIKE PREDICTION
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    Calculated Window: Fri 22:30 – Sat 03:45
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-rose-950 dark:text-rose-100">
                  Predicted Strike Likelihood: 88.4%
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-2 leading-relaxed">
                  Based on historical recurrence rhythm, the <strong>Bullet Ramesh vehicle theft syndicate</strong> is overdue by 0.6 days. High probability target zone is <strong>Silk Board TTMC – Hosur Road Corridor</strong> targeting two-wheelers in unlit commercial parking bays.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200">Recommended Alert Status:</span>
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold">RED TACTICAL ALERT</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-extrabold uppercase">
                    AUTO PATROL ADVISORY
                  </span>
                  <span className="text-xs text-slate-500 font-mono">For KSP PCR / Hoysala Command</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Prescribed Interceptor Deployments
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  <li>Deploy <strong>Hoysala Patrol 14 & 18</strong> along Silk Board junction and Madiwala underpass between 23:00 - 04:00.</li>
                  <li>Activate ANPR license plate scanner trigger for <strong>KA-01-MJ-8821 & KA-36-TR-8821</strong> at Electronic City Toll.</li>
                  <li>Coordinate with Raichur & Bidar border checkposts for early interception of freight tempos.</li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Advisory Reference: ADV-2026-CHRONO-88</span>
                <Link
                  href="/analyst/heatmap"
                  className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1"
                >
                  <span>Dispatch on Crime Map</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 3: ROSSMO GEOGRAPHIC PROFILING & CRIMINAL ANCHOR ESTIMATOR ── */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'geo_profiling' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT 4 COLS: ROSSMO MATHEMATICAL PARAMETERS */}
            <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold uppercase">
                    Spatial Rossmo Algorithm
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    Criminal Anchor Point Calculator
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Calculates the probable base of operations, stash house, or residence using Manhattan distance decay & buffer zones.
                  </p>
                </div>

                {/* Parameter sliders */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Buffer Zone Radius (B):</span>
                    <span className="font-mono font-extrabold text-purple-600 dark:text-purple-400">{bufferDistanceKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="3.0"
                    step="0.1"
                    value={bufferDistanceKm}
                    onChange={(e) => setBufferDistanceKm(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Defines offender comfort perimeter around home base.</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Cluster FIR Incidents:</span>
                    <span className="font-mono font-extrabold text-purple-600 dark:text-purple-400">{geoFirsCount} FIR Points</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    value={geoFirsCount}
                    onChange={(e) => setGeoFirsCount(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Calculated Coordinates Card */}
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-900 dark:text-purple-300">Estimated Anchor Centroid:</span>
                    <span className="font-mono font-black text-purple-700 dark:text-purple-300">12.9172° N, 77.6228° E</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-900 dark:text-purple-300">Probable Stash/Base:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Madiwala Lake Fringe / BTM 1st Stage</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-900 dark:text-purple-300">Spatial Confidence Ellipse:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">94.2% Area Probability</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/analyst/heatmap"
                  className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Overlay Anchor Field on GIS Map</span>
                </Link>
              </div>
            </div>

            {/* RIGHT 8 COLS: GEOGRAPHIC SPATIAL ANCHOR BOARD */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Synthetic Visual Representation of Probability Field */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                      SPATIAL PROBABILITY SURFACE
                    </span>
                    <h3 className="text-base font-extrabold text-white">
                      Madiwala – Silk Board – BTM Corridor Anchor Density
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold">
                    Rossmo J = 5 FIRs
                  </span>
                </div>

                {/* Spatial Anchor Visual Simulation */}
                <div className="relative h-60 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  
                  {/* Concentric Probability Rings */}
                  <div className="absolute w-52 h-52 rounded-full border border-purple-500/20 bg-purple-500/5 animate-ping opacity-30" />
                  <div className="absolute w-40 h-40 rounded-full border border-purple-500/30 bg-purple-500/10" />
                  <div className="absolute w-24 h-24 rounded-full border border-purple-400/50 bg-purple-500/20" />
                  <div className="absolute w-12 h-12 rounded-full border-2 border-purple-300 bg-purple-600/40 flex items-center justify-center">
                    <Crosshair className="w-5 h-5 text-purple-200 animate-pulse" />
                  </div>

                  {/* Crime Scene Pins */}
                  <div className="absolute top-10 left-16 flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-black/60 px-2 py-0.5 rounded border border-rose-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>FIR-04921 (Silk Board)</span>
                  </div>
                  <div className="absolute bottom-12 left-24 flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-black/60 px-2 py-0.5 rounded border border-rose-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>FIR-01184 (Madiwala)</span>
                  </div>
                  <div className="absolute top-14 right-20 flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-black/60 px-2 py-0.5 rounded border border-rose-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>FIR-00897 (BTM Stage 2)</span>
                  </div>
                  <div className="absolute bottom-10 right-28 flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-black/60 px-2 py-0.5 rounded border border-rose-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>FIR-00412 (Bommanahalli)</span>
                  </div>

                  {/* Anchor Point Label */}
                  <div className="absolute z-10 bottom-3 bg-purple-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-purple-400/40 text-[11px] font-mono text-purple-200 font-bold">
                    🎯 Predicted Base: 12.9172° N, 77.6228° E (Madiwala Warehouse Bay)
                  </div>
                </div>

                {/* Recommended Road Interception Points */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Choke Point #1</span>
                    <span className="font-bold text-white">Silk Board TTMC Exit</span>
                    <span className="block text-[10px] text-emerald-400 mt-0.5">ANPR Node Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Choke Point #2</span>
                    <span className="font-bold text-white">Electronic City Toll Plaza</span>
                    <span className="block text-[10px] text-emerald-400 mt-0.5">Fastag Intercept Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Choke Point #3</span>
                    <span className="font-bold text-white">Attibele Border Checkpost</span>
                    <span className="block text-[10px] text-amber-400 mt-0.5">Inter-State Barrier</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 4: MULTI-MODAL TELEMETRY CORROBORATOR (ANPR + CDR + CCTV FUSION) ── */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'telemetry_fusion' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white uppercase tracking-wider">
                  MULTI-SENSOR TIMELINE INTERSECT
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  Corroborated Telemetry Feed: Bullet Ramesh Syndicate
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-referencing optical ANPR camera hits, Fastag toll lanes, and telecom cell tower CDR dumps to verify physical presence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  4 Synchronized Points
                </span>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {FUSION_TIMELINE.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Pin node */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-sm" />
                  
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-black text-blue-600 dark:text-blue-400">
                          {item.timestamp}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                          {item.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {item.sensor}
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {item.detection}
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-mono pt-1">
                        🔍 <strong>Co-Located Signal:</strong> {item.co_detected}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-mono font-extrabold">
                        {item.confidence} Match
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                        STATUS: {item.match_status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Shadow Associate Alert */}
            <div className="mt-8 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                    Unregistered Shadow Associate Detected
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    Secondary SIM <strong>404-45-771920</strong> was co-located with primary suspect at 3 separate incident sites within 15 minutes.
                  </p>
                </div>
              </div>

              <Link
                href="/analyst/watchlist"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Add SIM to Active Watchlist</span>
              </Link>
            </div>

          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 5: ANALYSIS OF COMPETING HYPOTHESES (ACH) MATRIX ── */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'ach_matrix' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-600 text-white uppercase tracking-wider">
                  INTELLIGENCE DOCTRINE
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  Analysis of Competing Hypotheses (ACH) Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Heuer intelligence doctrine to systematically eliminate investigator bias and score evidence consistency.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Most Supported: H1 (Interstate Syndicate)
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="pb-3 px-3 w-2/5">Evidence Item</th>
                    <th className="pb-3 px-2 text-center">Diagnosticity</th>
                    {DEFAULT_ACH_HYPOTHESES.map(h => (
                      <th key={h.id} className="pb-3 px-2 text-center text-slate-900 dark:text-white">
                        {h.title.split(':')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ACH_EVIDENCE_ITEMS.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2">{item.id}:</span>
                        <span className="text-slate-800 dark:text-slate-200">{item.description}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                          {item.diagnosticity}
                        </span>
                      </td>
                      {DEFAULT_ACH_HYPOTHESES.map(h => {
                        const rating = (item.ratings as any)[h.id] || 'NEUTRAL';
                        let badge = 'bg-slate-100 dark:bg-slate-800 text-slate-500';
                        let symbol = '0';
                        if (rating.includes('CONSISTENT') && !rating.includes('INCONSISTENT')) {
                          badge = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold';
                          symbol = rating.includes('HIGHLY') ? '++' : '+';
                        } else if (rating.includes('INCONSISTENT')) {
                          badge = 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold';
                          symbol = rating.includes('VERY') ? '--' : '-';
                        }

                        return (
                          <td key={h.id} className="py-3 px-2 text-center">
                            <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-mono ${badge}`}>
                              {symbol} {rating.replace(/_/g, ' ')}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Diagnostic Conclusion Summary */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <span className="font-extrabold block text-sm">💡 Analytical Conclusion:</span>
              <p>
                Hypothesis <strong>H1 (Interstate Syndicate Operation - Bullet Ramesh)</strong> has 0 inconsistencies across all high-diagnosticity evidence items. Hypotheses H2 (Insider) and H3 (Copycat) are systematically refuted by electronic telemetry and forensic lock bypass signatures.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 6: COURT-ADMISSIBLE INTELLIGENCE DOSSIER & BAIL OPPOSITION GENERATOR ── */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'legal_dossier' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Header with Print / Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white dark:bg-white dark:text-black uppercase tracking-wider">
                  LEGAL SECTION 63 BSA / SEC 65B IEA CERTIFIED
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  Court-Admissible Dossier & Bail Opposition Brief
                </h3>
                <p className="text-xs text-slate-500">
                  Official Karnataka State Police intelligence summary formatted for Public Prosecutors and IOs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => alert('Dossier exported to PDF format successfully.')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Official Brief (PDF)</span>
                </button>
              </div>
            </div>

            {/* Official Dossier Document Frame */}
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 font-serif">
              
              {/* Document Header */}
              <div className="text-center border-b-2 border-slate-900 dark:border-white pb-4">
                <p className="text-[11px] uppercase tracking-widest font-sans font-bold text-slate-500">
                  GOVERNMENT OF KARNATAKA · POLICE DEPARTMENT
                </p>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mt-1">
                  State Crime Record Bureau (SCRB) Confidential Intelligence Dossier
                </h2>
                <p className="text-xs font-sans text-slate-600 dark:text-slate-400 mt-1 font-mono">
                  REF NO: KSP/SCRB/INTEL/2026/8842 · DATE: 30 AUGUST 2026
                </p>
              </div>

              {/* Subject Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1.5 p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Accused / Target Offender:</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">Ramesh Kumar @ Bullet Ramesh</p>
                  <p className="text-slate-600 dark:text-slate-400">CCTNS ID: <strong>SUS-8842</strong> · Habitual Offender Category A</p>
                  <p className="text-slate-600 dark:text-slate-400">Primary Operation: Inter-District Vehicle Theft & Fencing</p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Statutory Section Mappings:</span>
                  <p className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                    BNS §303(2) (Theft) / IPC §379 · BNS §317 (Stolen Property) / IPC §411
                  </p>
                  <p className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                    BNS §61(2) (Criminal Conspiracy) / IPC §120B
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                    NON-BAILABLE WARRANT ACTIVE
                  </span>
                </div>
              </div>

              {/* Cross-District Criminal History Ledger */}
              <div className="space-y-2 font-sans">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Previous FIRs & Pending Cases (Cross-District Trail)
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="py-2 px-3">FIR Number</th>
                        <th className="py-2 px-3">Police Station</th>
                        <th className="py-2 px-3">Crime Classification</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold">KAR/BEN/2024/0747</td>
                        <td className="py-2 px-3">Silk Board TTMC PS</td>
                        <td className="py-2 px-3">Vehicle Theft (BNS §303)</td>
                        <td className="py-2 px-3 text-rose-600 font-bold">Pending Trial</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold">KAR/RAI/2024/0123</td>
                        <td className="py-2 px-3">Raichur Suburban PS</td>
                        <td className="py-2 px-3">Syndicate Fencing (BNS §317)</td>
                        <td className="py-2 px-3 text-rose-600 font-bold">Chargesheeted</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold">KAR/BID/2024/0897</td>
                        <td className="py-2 px-3">Bidar Market PS</td>
                        <td className="py-2 px-3">Vehicle Theft & Alteration</td>
                        <td className="py-2 px-3 text-rose-600 font-bold">Absconding (NBW)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grounds to Oppose Bail */}
              <div className="space-y-2 font-sans">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Specific Grounds to Oppose Bail in Court (BNSS §480)
                </h4>
                <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-slate-800 text-xs space-y-2 leading-relaxed text-slate-700 dark:text-slate-300">
                  <p>
                    <strong>A. Extreme Flight & Jurisdiction Evasion Risk:</strong> The accused maintains operational safe houses in Bidar and Raichur border corridors and has previously jumped bail under FIR KAR/BID/2024/0897.
                  </p>
                  <p>
                    <strong>B. High Probability of Offense Continuation:</strong> Machine learning behavioral recurrence modeling indicates an 88.4% strike likelihood within 6-day cycles targeting commercial parking nodes.
                  </p>
                  <p>
                    <strong>C. Organized Syndicate Intimidation:</strong> Co-accused communications uncover active intimidation of local parking attendants and tampering of CCTNS electronic evidence.
                  </p>
                </div>
              </div>

              {/* Electronic Evidence Hash Certification */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Section 63 Bharatiya Sakshya Adhiniyam (BSA) / Sec 65B IEA Electronic Hash Certification:
                </p>
                <p>ANPR Plate Hash: <span className="text-blue-600 dark:text-blue-400">SHA256: 8f4b29c1e098a76d4e2118ba9820f4c9</span></p>
                <p>CDR Triangulation File: <span className="text-blue-600 dark:text-blue-400">SHA256: 41c7b8990d0efaa124890c54117b38ad</span></p>
                <p>Generating Authority: <strong>Dr. Priya Rao, Chief Crime Analyst, SCRB Karnataka</strong></p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
