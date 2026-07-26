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

// Realistic nodes & edges mapped to real Karnataka suspects
const MOCK_NODES = DEMO_NETWORK_GRAPH.nodes.map((n) => ({
  id: n.id,
  label: n.label,
  type: n.type === 'fir' ? 'case' : n.type,
  total_firs: 4,
  crime_types: [n.crime || 'vehicle_theft'],
  risk_score: n.risk || 80,
  size: 18,
  color: n.type === 'fir' ? '#2563eb' : '#dc2626',
  district: n.district || 'Bengaluru Urban'
}));

const MOCK_EDGES = DEMO_NETWORK_GRAPH.edges.map((e, i) => ({
  id: `e${i}`,
  source: e.source,
  target: e.target,
  fir_case_number: e.target?.startsWith?.('FIR') ? e.target : 'FIR-2026-BL-4921',
  label: e.relation || '',
  weight: e.weight || 2,
  date: e.date || '2026-07-15',
  crime_type: e.crime_type || undefined,
}));

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

  const [nodes, setNodes] = useState(MOCK_NODES);
  const [edges, setEdges] = useState(MOCK_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'graph' | 'map' | 'prediction'
  const [activePrediction, setActivePrediction] = useState(GANG_PREDICTIONS[0]);

  // Date Range Filter State
  const [timeFilter, setTimeFilter] = useState('2026'); // 'all' | '2025' | '2026'

  // InvestigatorWall state
  const [activeCaseData, setActiveCaseData] = useState(null);
  const [loadingCase, setLoadingCase] = useState(false);

  useEffect(() => {
    const fetchNetworkData = async () => {
      const { data } = await fetchWithFallback('network-graph-data?min_connections=1', DEMO_NETWORK_GRAPH);
      if (data && data.nodes && data.nodes.length > 0) {
        const parsedNodes = data.nodes.map(n => ({
          id: n.id,
          label: n.label || n.name || n.id,
          type: n.type === 'fir' ? 'case' : n.type,
          total_firs: n.total_firs || 3,
          crime_types: n.crime_types || ['vehicle_theft'],
          risk_score: n.risk_score || n.risk || 75,
          size: n.size || 18,
          color: n.color || (n.type === 'case' || n.type === 'fir' ? '#2563eb' : '#dc2626')
        }));
        setNodes(parsedNodes);
        const parsedEdges = (data.edges || MOCK_EDGES).map((e, i) => ({
          id: `e${i}`,
          source: e.source,
          target: e.target,
          fir_case_number: e.target?.startsWith?.('FIR') ? e.target : 'FIR-2026-BL-4921',
          label: e.relation || e.label || '',
          weight: e.weight || 2,
          date: e.date || '2026-07-15',
          crime_type: e.crime_type || undefined,
        }));
        setEdges(parsedEdges);
      }
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

    const clickedNode = nodes.find(n => n.id === nodeId);
    const labelName = clickedNode ? clickedNode.label : 'Suspect';

    const caseNum = nodeId?.startsWith('FIR') ? nodeId : `FIR-2026-BL-${Math.floor(1000 + Math.random() * 9000)}`;

    setActiveCaseData({
      fir: {
        case_number: caseNum,
        crime_type: clickedNode?.crime_types?.[0] || 'vehicle_theft',
        date_filed: '2026-07-18',
        location_name: clickedNode?.district || 'Silk Board, Bengaluru',
        case_status: 'under_investigation',
        description: `Official intelligence link recorded for ${labelName}. Connected to co-accused gang operations across Bengaluru Urban & Mysuru sectors.`,
        police_station: 'HSR Layout PS',
      },
      accused: [
        {
          full_name: labelName,
          alias: labelName.split(' ')[0] + ' Bhai',
          age: 34,
          gender: 'Male',
          prior_convictions: clickedNode?.total_firs || 3,
          modus_operandi: 'Operates gang network targeting Pulsar motorbikes and commercial transport vehicles along highway corridors.',
          risk_score: clickedNode?.risk_score || 85,
        }
      ],
      victims: [
        { full_name: 'Vikram Sharma', age: 34, gender: 'Male', occupation: 'Software Engineer', district_name: 'Bengaluru Urban', vulnerability_score: 55 }
      ],
      related_firs: [
        { case_number: 'FIR-2026-BL-4921', crime_type: 'vehicle_theft', date_filed: '2026-07-18', link_reason: 'Primary accused vehicle theft' },
        { case_number: 'FIR-2026-MY-1103', crime_type: 'robbery', date_filed: '2026-07-17', link_reason: 'Co-accused highway robbery' }
      ],
      case_summary: `Official CCTNS Criminal Network File for ${labelName}. Multi-district intelligence correlation established.`
    });
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
                date_range={{ min: '2025-01-01', max: '2026-07-18' }}
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
              date_range={{ min: '2025-01-01', max: '2026-07-18' }}
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
