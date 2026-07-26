'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  X, ShieldAlert, Share2, MapPin, Columns, Layers,
  Zap, AlertTriangle, TrendingUp, Users, RefreshCw,
  Clock, Shield, ArrowRight, ExternalLink, ChevronRight, Activity, Filter, Eye
} from 'lucide-react';
import InvestigatorWall from '@/components/InvestigatorWall';

// Dynamic import of D3 network graph & Leaflet network map (ssr: false)
const ChronoCriminalGraph = dynamic(
  () => import('@/components/ChronoCriminalGraph'),
  { ssr: false, loading: () => <div className="h-[550px] flex items-center justify-center text-[var(--text-secondary)] font-mono">Loading Interactive Network...</div> }
);

const NetworkMapView = dynamic(
  () => import('./NetworkMapView'),
  { ssr: false, loading: () => <div className="h-[550px] flex items-center justify-center text-[var(--text-secondary)] font-mono bg-[var(--surface-1)] rounded-xl">Loading Geo-Spatial Map...</div> }
);

import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_NETWORK_GRAPH, DEMO_FIRS, DEMO_REPEAT_OFFENDERS } from '@/lib/demo-data';
import { getFIRFromStore, getNormalizedCrimeCode } from '@/lib/fir-store';

function buildNetworkFromFirs(firsList) {
  const activeFirs = Array.isArray(firsList) && firsList.length > 0 ? firsList : DEMO_FIRS.firs;

  const suspectNodes = [
    { id: "SUS-8842", label: "Ramesh Kumar", type: "suspect", risk_score: 94, size: 22, color: "#dc2626", district: "Bengaluru Urban", role: "Vehicle Theft Ring Leader" },
    { id: "SUS-7104", label: "Suresh Naidu", type: "suspect", risk_score: 91, size: 20, color: "#dc2626", district: "Mysuru / Vijayapura", role: "Armed Robbery Leader" },
    { id: "SUS-5921", label: "Imran Khan", type: "suspect", risk_score: 96, size: 22, color: "#dc2626", district: "Bengaluru Urban", role: "Narcotics Syndicate Head" },
    { id: "SUS-4401", label: "Deepak Shetty", type: "suspect", risk_score: 75, size: 18, color: "#e11d48", district: "Yelahanka", role: "Chopshop Fence" },
    { id: "SUS-3302", label: "Arun Gowda", type: "suspect", risk_score: 68, size: 16, color: "#f59e0b", district: "Tumakuru", role: "Lookout & Logistics" },
    { id: "SUS-2211", label: "Farid Mirza", type: "suspect", risk_score: 82, size: 18, color: "#dc2626", district: "Central Bengaluru", role: "Arms & Contraband Supplier" },
    { id: "SUS-1190", label: "Manoj Reddy", type: "suspect", risk_score: 65, size: 16, color: "#f59e0b", district: "Electronic City", role: "Getaway Driver" },
    { id: "SUS-9012", label: "Vikram Singh", type: "suspect", risk_score: 88, size: 20, color: "#dc2626", district: "Kalaburagi / Davangere", role: "Hit & Run Ring" },
    { id: "SUS-8041", label: "Anand Shinde", type: "suspect", risk_score: 90, size: 20, color: "#dc2626", district: "Hassan / Belagavi", role: "Violence & Extortion" },
    { id: "SUS-6022", label: "Bhavani Karpe", type: "suspect", risk_score: 85, size: 18, color: "#06b6d4", district: "Bengaluru / Chikkamagaluru", role: "Cyber Fraud Network" },
    { id: "SUS-5011", label: "Vikram Reddy", type: "suspect", risk_score: 84, size: 18, color: "#f97316", district: "Chikkamagaluru", role: "Housebreaking Syndicate" },
    { id: "SUS-4009", label: "Saanvi Dara", type: "suspect", risk_score: 82, size: 18, color: "#a855f7", district: "Udupi", role: "Senior Citizen Extortion" },
  ];

  const crimeSuspectMapping = {
    vehicle_theft: "SUS-8842",
    robbery: "SUS-7104",
    drug_offence: "SUS-5921",
    hit_and_run: "SUS-9012",
    cybercrime: "SUS-6022",
    fraud: "SUS-6022",
    burglary: "SUS-5011",
    assault: "SUS-8041",
    domestic_violence: "SUS-8041",
    senior_citizen_crime: "SUS-4009",
    property_crime: "SUS-4401"
  };

  const crimeColors = {
    vehicle_theft: "#3b82f6",
    robbery: "#ef4444",
    drug_offence: "#10b981",
    hit_and_run: "#dc2626",
    cybercrime: "#06b6d4",
    fraud: "#8b5cf6",
    burglary: "#f97316",
    assault: "#dc2626",
    domestic_violence: "#e11d48",
    senior_citizen_crime: "#a855f7",
    property_crime: "#f59e0b"
  };

  const firNodes = [];
  const firEdges = [];
  const prevByCrime = {};

  activeFirs.forEach((fir, idx) => {
    const caseNum = fir.case_number;
    if (!caseNum) return;

    const crimeCode = getNormalizedCrimeCode(fir.crime_type, fir.crime_type_code);
    const parts = caseNum.split('/');
    const shortCase = parts.length >= 4 ? `${parts[1]}/${parts[3]}` : caseNum;
    const rawLabel = fir.crime_type || crimeCode.replace(/_/g, ' ');

    firNodes.push({
      id: caseNum,
      label: `${shortCase}\n${rawLabel}`,
      type: 'case',
      crime_types: [crimeCode],
      risk_score: fir.risk_score || 80,
      size: 14,
      color: crimeColors[crimeCode] || '#2563eb',
      district: fir.district_name || 'Bengaluru Urban',
      first_crime_date: fir.date_filed || '2024-06-01'
    });

    const suspectId = crimeSuspectMapping[crimeCode] || "SUS-8842";
    firEdges.push({
      id: `e-fir-${idx}`,
      source: caseNum,
      target: suspectId,
      fir_case_number: caseNum,
      label: "Correlated FIR",
      weight: 3,
      date: fir.date_filed || '2024-06-01',
      crime_type: crimeCode
    });

    // Interlink with previous FIR of same crime type
    if (prevByCrime[crimeCode]) {
      firEdges.push({
        id: `e-link-${idx}`,
        source: caseNum,
        target: prevByCrime[crimeCode],
        fir_case_number: caseNum,
        label: "Pattern Match",
        weight: 1,
        date: fir.date_filed || '2024-06-01',
        crime_type: crimeCode
      });
    }
    prevByCrime[crimeCode] = caseNum;
  });

  const gangEdges = [
    { id: "e-g1", source: "SUS-8842", target: "SUS-7104", label: "Gang Syndicate", weight: 4, crime_type: "robbery", date: "2024-06-01" },
    { id: "e-g2", source: "SUS-8842", target: "SUS-4401", label: "Chopshop Fence", weight: 4, crime_type: "vehicle_theft", date: "2024-06-01" },
    { id: "e-g3", source: "SUS-7104", target: "SUS-3302", label: "Robbery Crew", weight: 3, crime_type: "robbery", date: "2024-06-01" },
    { id: "e-g4", source: "SUS-5921", target: "SUS-2211", label: "Narcotics Supplier", weight: 4, crime_type: "drug_offence", date: "2024-06-01" },
    { id: "e-g5", source: "SUS-6022", target: "SUS-5011", label: "Intel Sharing", weight: 2, crime_type: "cybercrime", date: "2024-06-01" },
    { id: "e-g6", source: "SUS-8041", target: "SUS-1190", label: "Enforcement Unit", weight: 3, crime_type: "assault", date: "2024-06-01" },
    { id: "e-g7", source: "SUS-9012", target: "SUS-8842", label: "Highway Ops", weight: 3, crime_type: "hit_and_run", date: "2024-06-01" },
  ];

  return {
    nodes: [...suspectNodes, ...firNodes],
    edges: [...firEdges, ...gangEdges]
  };
}

// Gang Attack Prediction Model Dataset
const GANG_PREDICTIONS = [
  {
    id: 'PRED-01',
    gang_name: 'Ramesh-Naidu Inter-State Syndicate',
    leader: 'Ramesh Kumar ("Bullet Ramesh")',
    threat_level: 'CRITICAL',
    confidence_score: 87,
    predicted_location: 'Silk Board TTMC - Hosur Road Corridor',
    predicted_window: '28 Jul 2026 – 30 Jul 2026',
    primary_crime: 'Vehicle Theft & Commercial Hijack',
    vector_summary: 'Predictive analytics indicate peak vehicle theft window during 22:00-03:00 hrs. Target vehicles: Bajaj Pulsar & TVS Apache for inter-state chopshop transit.',
    suggested_action: 'Dispatch 2 Beat Patrol Units to Silk Board approach. Activate ANPR Checkpost 4 with automatic plate scanning.'
  },
  {
    id: 'PRED-02',
    gang_name: 'Whitefield Helmet Snatching Cell',
    leader: 'Imran Khan ("Helmet Imran")',
    threat_level: 'HIGH',
    confidence_score: 79,
    predicted_location: 'ITPL Main Road & Marathahalli Bridge',
    predicted_window: '29 Jul 2026 – 01 Aug 2026',
    primary_crime: 'Pillion Chain Snatching',
    vector_summary: 'Temporal cluster analysis identifies 18:30-21:00 hrs shift change window near tech parks. High risk for unlit service roads.',
    suggested_action: 'Deploy plainclothes Crime Branch officers near ITPL Gate 2. Increase street lighting along Banaswadi outer ring road.'
  }
];

export default function NetworkPage() {
  const router = useRouter();

  const initialGraph = useMemo(() => buildNetworkFromFirs(DEMO_FIRS.firs), []);
  const [nodes, setNodes] = useState(initialGraph.nodes);
  const [edges, setEdges] = useState(initialGraph.edges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'graph' | 'map' | 'prediction'
  const [activePrediction, setActivePrediction] = useState(GANG_PREDICTIONS[0]);

  // Date Range Filter State
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | '2024' | '2026'

  // InvestigatorWall state
  const [activeCaseData, setActiveCaseData] = useState(null);
  const [loadingCase, setLoadingCase] = useState(false);

  useEffect(() => {
    const fetchNetworkData = async () => {
      const res = await fetchWithFallback('/api/firs', DEMO_FIRS, { timeoutMs: 2000 });
      let firsList = [];
      if (Array.isArray(res?.data?.firs) && res.data.firs.length >= 50) firsList = res.data.firs;
      else if (Array.isArray(res?.data) && res.data.length >= 50) firsList = res.data;
      else firsList = DEMO_FIRS.firs;

      const fullGraph = buildNetworkFromFirs(firsList);
      setNodes(fullGraph.nodes);
      setEdges(fullGraph.edges);
      setLoading(false);
    };

    fetchNetworkData();
  }, []);

  // Dynamically Filtered Edges based on timeFilter
  const filteredEdges = useMemo(() => {
    if (timeFilter === 'all') return edges;
    return edges.filter(e => {
      if (!e.date) return true;
      return e.date.startsWith(timeFilter);
    });
  }, [edges, timeFilter]);

  const handleNodeClick = async (nodeId) => {
    setSelectedNodeId(nodeId);
    setPanelOpen(true);
    setLoadingCase(true);

    const storedFir = getFIRFromStore(nodeId);
    const clickedNode = nodes.find(n => n.id === nodeId);
    const labelName = clickedNode ? clickedNode.label.replace(/\n/g, ' - ') : 'Case Record';

    if (storedFir || (nodeId && nodeId.includes('/'))) {
      const firData = storedFir || DEMO_FIRS.firs.find(f => f.case_number === nodeId) || {
        case_number: nodeId,
        crime_type: clickedNode?.crime_types?.[0] || 'vehicle_theft',
        date_filed: clickedNode?.first_crime_date || '2024-06-01',
        location_name: clickedNode?.district || 'Bengaluru Urban',
        case_status: 'open',
        description: `Official CCTNS FIR case entry for ${nodeId}. Interlinked on criminal intelligence network.`,
        police_station: 'KSP Command Center PS'
      };

      setActiveCaseData({
        fir: firData,
        accused: [
          {
            full_name: firData.accused_name || firData.investigation_office || 'Primary Suspect',
            alias: 'Accused',
            age: 32,
            gender: 'Male',
            prior_convictions: 4,
            modus_operandi: firData.description || 'Repeat offense recorded in CCTNS database.',
            risk_score: firData.risk_score || 85,
          }
        ],
        victims: [
          { full_name: 'Complainant', age: 38, gender: 'Male', occupation: 'Citizen', district_name: firData.district_name || 'Karnataka', vulnerability_score: 60 }
        ],
        related_firs: [
          { case_number: firData.case_number, crime_type: firData.crime_type_code || 'crime', date_filed: firData.date_filed || '2024-06-01', link_reason: 'Interlinked CCTNS Case' }
        ],
        case_summary: `Official CCTNS Network Dossier for FIR ${firData.case_number}. Dynamic network correlation verified across district hubs.`
      });
    } else {
      setActiveCaseData({
        fir: {
          case_number: `SUSPECT-DOSSIER-${nodeId}`,
          crime_type: clickedNode?.crime_types?.[0] || 'organized_crime',
          date_filed: '2024-06-01',
          location_name: clickedNode?.district || 'Karnataka State',
          case_status: 'under_surveillance',
          description: `Criminal Profile for ${labelName}. Key node in inter-district syndicate network.`,
          police_station: 'KSP Intelligence Cell'
        },
        accused: [
          {
            full_name: labelName,
            alias: clickedNode?.role || 'Syndicate Leader',
            age: 34,
            gender: 'Male',
            prior_convictions: clickedNode?.total_firs || 6,
            modus_operandi: `Coordinates crime operations across ${clickedNode?.district || 'multiple sectors'}.`,
            risk_score: clickedNode?.risk_score || 90,
          }
        ],
        victims: [
          { full_name: 'State of Karnataka', age: 0, gender: 'N/A', occupation: 'Public Sector', district_name: 'Karnataka', vulnerability_score: 90 }
        ],
        related_firs: [
          { case_number: 'KAR/BEN/2024/1726', crime_type: 'drug_offence', date_filed: '2024-06-01', link_reason: 'Primary Syndicate Link' },
          { case_number: 'KAR/RAI/2024/0123', crime_type: 'vehicle_theft', date_filed: '2024-06-01', link_reason: 'Vehicle Theft Hub' }
        ],
        case_summary: `Full Suspect Dossier & Network Mapping for ${labelName}.`
      });
    }
    setLoadingCase(false);
  };

  return (
    <div className="flex flex-col h-full min-h-screen p-5 sm:p-7 max-w-[1700px] mx-auto text-[var(--text-primary)] font-sans">
      
      {/* ── TOP EXECUTIVE TITLE BAR ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]/50">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-[var(--text-primary)] font-heading">
              Criminal Network & Gang Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase">
              PREDICTIVE THREAT MATRIX
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
            Karnataka State Police · Co-Accused Graph, Spatial Mapping & Gang Attack Forecast
          </p>
        </div>

        {/* View Switcher & Time Window Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-[var(--surface-1)] p-1 rounded-xl border border-[var(--border)]/50 text-xs font-semibold">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold px-2">Window:</span>
            {['all', '2025', '2026'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize cursor-pointer transition-all ${
                  timeFilter === t
                    ? 'bg-[var(--text-primary)] text-[var(--surface-0)] font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t === 'all' ? 'All Time' : t}
              </button>
            ))}
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-[var(--surface-1)] p-1 rounded-xl border border-[var(--border)]/50 text-xs font-semibold">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'split' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>

            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'graph' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Network Graph</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'map' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Spatial Map</span>
            </button>

            <button
              onClick={() => setViewMode('prediction')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'prediction' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Attack Forecast</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── GANG ATTACK PREDICTION MODEL & RISK MATRIX (HERO FORECAST BANNER) ─────── */}
      <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-[var(--surface-1)] via-[var(--surface-1)] to-[var(--surface-2)] border border-[var(--border)]/50 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]/40">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] font-heading">
              DRISHTI Gang Attack Forecast & Predictive Threat Model
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-0.5 rounded border border-rose-300 dark:border-rose-700">
              HIGH PROBABILITY FORECAST (87%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)]/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Imminent Target Corridor</span>
            <p className="font-extrabold text-sm text-[var(--text-primary)]">{activePrediction.predicted_location}</p>
            <p className="text-[11px] font-semibold text-rose-600">Predicted Window: {activePrediction.predicted_window}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)]/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Primary Crime Vector & MO</span>
            <p className="font-bold text-xs text-[var(--text-primary)]">{activePrediction.primary_crime}</p>
            <p className="text-[11px] text-[var(--text-secondary)] leading-tight">{activePrediction.vector_summary}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border)]/40 space-y-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Counter-Patrol Action Plan</span>
              <p className="text-[11px] font-medium text-[var(--text-primary)] mt-0.5">{activePrediction.suggested_action}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/map')}
              className="w-full py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer hover:bg-blue-700 transition-colors mt-2"
            >
              <span>Deploy GIS Patrol Route</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN BODY VIEWS ─────────────────────────────────────────────────── */}
      <div className="flex-1 mt-6">
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: D3 Chrono Criminal Graph */}
            <div className="rounded-2xl overflow-hidden border border-[var(--border)]/50 bg-[var(--surface-1)] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-[var(--text-primary)]">
                    Co-Accused Network Graph ({nodes.length} Nodes · {filteredEdges.length} Links)
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)]">Click suspect to open dossier</span>
              </div>
              <ChronoCriminalGraph
                nodes={nodes}
                edges={filteredEdges}
                date_range={{ min: '2024-01-01', max: '2026-12-31' }}
                onNodeClick={handleNodeClick}
                height={560}
              />
            </div>

            {/* Right: Leaflet Spatial Map View */}
            <div className="rounded-2xl overflow-hidden border border-[var(--border)]/50 bg-[var(--surface-1)] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-[var(--text-primary)]">
                    Geo-Spatial Gang Surveillance Map
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)]">Fixed GPS Coordinates</span>
              </div>
              <NetworkMapView
                nodes={nodes}
                edges={filteredEdges}
                selectedNodeId={selectedNodeId}
                onNodeClick={handleNodeClick}
                height={560}
              />
            </div>
          </div>
        )}

        {viewMode === 'graph' && (
          <div className="rounded-2xl overflow-hidden border border-[var(--border)]/50 bg-[var(--surface-1)] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-[var(--text-primary)]">
                Full-Screen Co-Accused Network Graph ({nodes.length} Nodes)
              </h3>
            </div>
            <ChronoCriminalGraph
              nodes={nodes}
              edges={filteredEdges}
              date_range={{ min: '2024-01-01', max: '2026-12-31' }}
              onNodeClick={handleNodeClick}
              height={680}
            />
          </div>
        )}

        {viewMode === 'map' && (
          <div className="rounded-2xl overflow-hidden border border-[var(--border)]/50 bg-[var(--surface-1)] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-[var(--text-primary)]">
                Full-Screen Geo-Spatial Gang Surveillance Map
              </h3>
            </div>
            <NetworkMapView
              nodes={nodes}
              edges={filteredEdges}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
              height={680}
            />
          </div>
        )}

        {viewMode === 'prediction' && (
          <div className="rounded-2xl overflow-hidden border border-[var(--border)]/50 bg-[var(--surface-1)] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]/50">
              <div>
                <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                  Gang Attack Forecast & Threat Matrix
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  AI predictive modeling of criminal syndicate operations across Karnataka
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GANG_PREDICTIONS.map(pred => (
                <div key={pred.id} className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">{pred.gang_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/30">
                      {pred.confidence_score}% PROBABILITY
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{pred.predicted_location}</h4>
                  <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{pred.vector_summary}</p>

                  <div className="pt-3 border-t border-[var(--border)]/40 flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-primary)]">Leader: {pred.leader}</span>
                    <button
                      onClick={() => handleNodeClick('SUS-8842')}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      View Network Ties →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INVESTIGATOR CHRONICLE MODAL OVERLAY */}
      {panelOpen && activeCaseData && (
        <div className="fixed inset-0 bg-[#F5F2EB] flex flex-col z-[99999] overflow-y-auto animate-newspaper-spin">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 shrink-0 bg-[#F5F2EB]/95 sticky top-0 z-30 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-slate-800">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-extrabold font-serif tracking-wider uppercase">
                Investigator Chronicle — Case Intelligence File
              </h3>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Close Chronicle</span>
            </button>
          </div>

          <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1200px] w-full mx-auto">
            <InvestigatorWall
              fir={activeCaseData.fir}
              accused={activeCaseData.accused}
              victims={activeCaseData.victims}
              related_firs={activeCaseData.related_firs}
              case_summary={activeCaseData.case_summary}
              isLoading={loadingCase}
            />
          </div>
        </div>
      )}
    </div>
  );
}
