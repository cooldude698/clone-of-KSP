'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, ShieldAlert, Share2, MapPin, Columns, Layers } from 'lucide-react';
import InvestigatorWall from '@/components/InvestigatorWall';

// Dynamic import of D3 network graph & Leaflet network map (ssr: false)
const ChronoCriminalGraph = dynamic(
  () => import('@/components/ChronoCriminalGraph'),
  { ssr: false, loading: () => <div className="h-[550px] flex items-center justify-center text-paper-100/40 font-mono">Loading Interactive Network...</div> }
);

const NetworkMapView = dynamic(
  () => import('./NetworkMapView'),
  { ssr: false, loading: () => <div className="h-[550px] flex items-center justify-center text-paper-100/40 font-mono bg-steel-700/40 rounded-xl">Loading Geo-Spatial Map...</div> }
);

import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_NETWORK_GRAPH, DEMO_FIRS } from '@/lib/demo-data';

// Realistic mock data for Bengaluru gang network nodes & edges
const MOCK_NODES = DEMO_NETWORK_GRAPH.nodes.map((n, i) => ({
  id: n.id,
  label: n.label,
  type: n.type === 'fir' ? 'case' : n.type,
  total_firs: 4,
  crime_types: [n.crime || 'vehicle_theft'],
  risk_score: n.risk || 80,
  size: 18,
  color: n.type === 'fir' ? '#2d83d9' : '#c8372d'
}));

const MOCK_EDGES = DEMO_NETWORK_GRAPH.edges.map((e, i) => ({
  id: `e${i}`,
  source: e.source,
  target: e.target,
  fir_case_number: e.target.startsWith('FIR') ? e.target : 'FIR-2026-BL-4921',
  weight: 3
}));

export default function NetworkPage() {
  const [nodes, setNodes] = useState(MOCK_NODES);
  const [edges, setEdges] = useState(MOCK_EDGES);
  const [loading, setLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'graph' | 'map' | 'split'

  // InvestigatorWall props state
  const [activeCaseData, setActiveCaseData] = useState(null);
  const [loadingCase, setLoadingCase] = useState(false);

  useEffect(() => {
    const fetchNetworkData = async () => {
      setLoading(true);
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
          color: n.color || (n.type === 'case' || n.type === 'fir' ? '#2d83d9' : '#c8372d')
        }));
        setNodes(parsedNodes);
        setEdges(data.edges || MOCK_EDGES);
      } else {
        setNodes(MOCK_NODES);
        setEdges(MOCK_EDGES);
      }
      setLoading(false);
    };

    fetchNetworkData();
  }, []);

  const handleNodeClick = async (nodeId) => {
    setSelectedNodeId(nodeId);
    setPanelOpen(true);
    setLoadingCase(true);

    const clickedNode = nodes.find(n => n.id === nodeId);
    const labelName = clickedNode ? clickedNode.label : 'Suspect';

    try {
      const res = await fetch(`${API_BASE}/firs/?accused_name=${encodeURIComponent(labelName)}`);
      if (res.ok) {
        const data = await res.json();
        setActiveCaseData({
          fir: {
            case_number: data.case_number || `FIR-2026-BL-${Math.floor(1000 + Math.random() * 9000)}`,
            crime_type: data.crime_type || 'robbery',
            date_filed: data.date_filed || '2026-07-02',
            location_name: data.location || 'Silk Board, Bengaluru',
            case_status: data.case_status || 'under_investigation',
            description: data.description || `Accused ${labelName} was spotted fleeing the scene of crime.`,
            police_station: data.police_station || 'Madiwala PS',
          },
          accused: data.accused || [
            {
              full_name: labelName,
              alias: clickedNode?.label.split(' ')[0] + ' Bhai',
              age: 32,
              gender: 'Male',
              prior_convictions: clickedNode?.total_firs || 2,
              modus_operandi: 'Targets commercial shops at late night hours using local helpers.',
              risk_score: clickedNode?.risk_score || 70,
            }
          ],
          victims: data.victims || [
            { full_name: 'Shankar Rao', age: 48, gender: 'Male', occupation: 'Merchant', district_name: 'Bengaluru Urban', vulnerability_score: 52 }
          ],
          related_firs: data.related_firs || [
            { case_number: 'FIR-2026-MY-1103', crime_type: 'fraud', date_filed: '2025-04-18', link_reason: 'Shared transaction logs' }
          ],
          case_summary: data.summary || `Intelligence mapping of suspect ${labelName} reveals close coordination with gang networks operating across district borders. Alert flags have been dispatched to local patrol routes.`
        });
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      setActiveCaseData({
        fir: {
          case_number: `FIR-2026-BL-${Math.floor(1000 + Math.random() * 9000)}`,
          crime_type: clickedNode?.crime_types?.[0] || 'robbery',
          date_filed: clickedNode?.last_crime_date || '2026-07-02',
          location_name: 'Bengaluru Urban District',
          case_status: 'under_investigation',
          description: `Suspect ${labelName} has been tied to multiple theft, robbery and connection offenses within the local precinct limits. Real-time cameras have indexed visual correlations.`,
          police_station: 'City Crime Branch (CCB)',
        },
        accused: [
          {
            full_name: labelName,
            alias: labelName.split(' ')[0] + ' Bhai',
            age: 34,
            gender: 'Male',
            prior_convictions: clickedNode?.total_firs || 3,
            modus_operandi: 'Operates late night targeting logistics vehicles near highway bypasses.',
            risk_score: clickedNode?.risk_score || 80,
          }
        ],
        victims: [
          { full_name: 'K. Venkatesh', age: 41, gender: 'Male', occupation: 'Store Owner', district_name: 'Bengaluru Urban', vulnerability_score: 65 }
        ],
        related_firs: edges
          .filter(e => e.source === nodeId || e.target === nodeId)
          .map(e => ({
            case_number: e.fir_case_number || 'FIR-2026-BL-0492',
            crime_type: e.crime_type || 'robbery',
            date_filed: e.date || '2026-06-02',
            link_reason: 'Co-accused accomplice listing'
          })),
        case_summary: `DRISHTI AI Co-Pilot identified accomplice links for ${labelName} across ${clickedNode?.crime_types?.length || 1} crime categories. Analysis suggests high repetition probability during festival seasons.`
      });
    } finally {
      setLoadingCase(false);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden bg-void-000">
      {/* Main Container */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-600/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-paper-100 font-mono">Criminal Network Intelligence</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-phosphor-500/20 text-phosphor-500 border border-phosphor-500/30 uppercase">
                Dual Tactical Matrix
              </span>
            </div>
            <p className="text-xs text-paper-100/50 mt-0.5">
              Side-by-Side Co-Accused Graph & Spatial Crime Map. Click any suspect or node to trigger digital Investigator Wall.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats pill */}
            <div className="bg-steel-700 px-3 py-1.5 rounded-xl border border-steel-600/40 flex items-center gap-4 text-xs font-mono">
              <span className="text-paper-100/50">Nodes: <span className="font-bold text-paper-100">{nodes.length}</span></span>
              <span className="text-paper-100/50">Links: <span className="font-bold text-paper-100">{edges.length}</span></span>
            </div>

            {/* View mode switcher */}
            <div className="flex items-center p-1 bg-steel-700 rounded-xl border border-steel-600/50 font-mono text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'split'
                    ? 'bg-phosphor-500 text-paper-100 font-bold shadow-lg shadow-phosphor-500/20'
                    : 'text-paper-100/60 hover:text-paper-100'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>

              <button
                onClick={() => setViewMode('graph')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'graph'
                    ? 'bg-phosphor-500 text-paper-100 font-bold shadow-lg shadow-phosphor-500/20'
                    : 'text-paper-100/60 hover:text-paper-100'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Graph Only</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'map'
                    ? 'bg-phosphor-500 text-paper-100 font-bold shadow-lg shadow-phosphor-500/20'
                    : 'text-paper-100/60 hover:text-paper-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Map Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between py-3 border-b border-steel-600/30 text-[10px] font-mono tracking-wider">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-critical-500" />
              <span className="text-paper-100/60 uppercase font-semibold">Critical Threat (90+ Index)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-warn-500" />
              <span className="text-paper-100/60 uppercase font-semibold">High Risk (70-89 Index)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-phosphor-500" />
              <span className="text-paper-100/60 uppercase font-semibold">Medium Risk (40-69 Index)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-md bg-blue-500" />
              <span className="text-paper-100/60 uppercase font-semibold">FIR Case Marker</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-paper-100/60 uppercase font-semibold">ANPR Camera Hit</span>
            </div>
          </div>

          <div className="text-paper-100/40 text-[10px] flex items-center gap-1">
            <Layers className="w-3 h-3 text-phosphor-500" />
            <span>Interactive Spatial Correlation Matrix</span>
          </div>
        </div>

        {/* Tactical Layout Body */}
        <div className="flex-1 mt-4">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* Left: Network Graph */}
              <div className="rounded-xl overflow-hidden border border-steel-600/40 bg-void-000 shadow-xl">
                <ChronoCriminalGraph
                  nodes={nodes}
                  edges={edges}
                  date_range={{ min: '2025-01-01', max: '2026-07-18' }}
                  onNodeClick={handleNodeClick}
                  height={580}
                />
              </div>

              {/* Right: Spatial Map */}
              <div className="rounded-2xl overflow-hidden border border-steel-600/50 bg-steel-700 p-4 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-phosphor-500" />
                    <h3 className="text-xs font-bold font-mono text-paper-100 uppercase tracking-widest">
                      Geo-Spatial Gang Surveillance Map
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-paper-100/50 bg-void-000 px-2.5 py-1 rounded-md border border-steel-600/50">
                    {selectedNodeId ? `Focused: ${selectedNodeId}` : 'Bengaluru Urban Grid'}
                  </span>
                </div>
                <NetworkMapView
                  nodes={nodes}
                  edges={edges}
                  selectedNodeId={selectedNodeId}
                  onNodeClick={handleNodeClick}
                  height={580}
                />
              </div>
            </div>
          )}

          {viewMode === 'graph' && (
            <div className="rounded-xl overflow-hidden border border-steel-600/30 bg-void-000 shadow-2xl">
              <ChronoCriminalGraph
                nodes={nodes}
                edges={edges}
                date_range={{ min: '2025-01-01', max: '2026-07-18' }}
                onNodeClick={handleNodeClick}
                height={640}
              />
            </div>
          )}

          {viewMode === 'map' && (
            <div className="rounded-2xl overflow-hidden border border-steel-600/50 bg-steel-700 p-4 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-phosphor-500" />
                  <h3 className="text-xs font-bold font-mono text-paper-100 uppercase tracking-widest">
                    Geo-Spatial Gang Surveillance Map
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-paper-100/50 bg-void-000 px-2.5 py-1 rounded-md border border-steel-600/50">
                  {selectedNodeId ? `Focused: ${selectedNodeId}` : 'Bengaluru Urban Grid'}
                </span>
              </div>
              <NetworkMapView
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedNodeId}
                onNodeClick={handleNodeClick}
                height={640}
              />
            </div>
          )}
        </div>
      </div>

      {/* Slide-in panel (Investigator Wall) */}
      {panelOpen && activeCaseData && (
        <>
          <div
            onClick={() => setPanelOpen(false)}
            className="fixed inset-0 bg-void-000/60 backdrop-blur-sm z-[99998] animate-fade-in"
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[750px] border-l border-steel-600 bg-steel-700 flex flex-col animate-slide-in z-[99999] shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-steel-600 shrink-0 bg-steel-700/80 sticky top-0 z-30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-critical-500">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-bold font-mono tracking-widest uppercase">Investigator Wall</h3>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="w-8 h-8 rounded-lg bg-steel-600/50 hover:bg-steel-600 flex items-center justify-center text-paper-100/50 hover:text-paper-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
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
        </>
      )}
    </div>
  );
}
