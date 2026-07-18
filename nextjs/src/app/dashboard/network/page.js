'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, ShieldAlert } from 'lucide-react';
import InvestigatorWall from '@/components/InvestigatorWall';

// Dynamic import of D3 network graph (ssr: false)
const ChronoCriminalGraph = dynamic(
  () => import('@/components/ChronoCriminalGraph'),
  { ssr: false, loading: () => <div className="h-[500px] flex items-center justify-center text-paper-100/40 font-mono">Loading Interactive Network...</div> }
);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/server';

// Realistic mock data for Bengaluru gang network nodes & edges
const MOCK_NODES = [
  { id: 'n1', label: 'Ramesh Kumar', type: 'accused', total_firs: 7, crime_types: ['vehicle_theft', 'robbery'], first_crime_date: '2025-01-10', last_crime_date: '2026-07-02', risk_score: 94, size: 22, color: '#c8372d' },
  { id: 'n2', label: 'Suresh Naidu', type: 'accused', total_firs: 5, crime_types: ['robbery', 'chain_snatching'], first_crime_date: '2025-02-15', last_crime_date: '2026-06-12', risk_score: 86, size: 19, color: '#e05a3a' },
  { id: 'n3', label: 'Anand Murthy', type: 'accused', total_firs: 4, crime_types: ['fraud', 'cybercrime'], first_crime_date: '2025-04-18', last_crime_date: '2026-05-20', risk_score: 78, size: 17, color: '#f0a848' },
  { id: 'n4', label: 'Kiran Gowda', type: 'accused', total_firs: 3, crime_types: ['chain_snatching'], first_crime_date: '2025-06-02', last_crime_date: '2026-04-01', risk_score: 65, size: 15, color: '#f0a848' },
  { id: 'n5', label: 'Vijay Bhaskar', type: 'accused', total_firs: 2, crime_types: ['vehicle_theft'], first_crime_date: '2025-08-11', last_crime_date: '2026-03-24', risk_score: 52, size: 14, color: '#4A8B6F' },
  { id: 'n6', label: 'FIR-2026-BL-0492', type: 'case', total_firs: 1, crime_types: ['vehicle_theft'], first_crime_date: '2026-05-14', last_crime_date: '2026-05-14', risk_score: 0, size: 16, color: '#2d83d9' },
  { id: 'n7', label: 'FIR-2026-BL-0811', type: 'case', total_firs: 1, crime_types: ['robbery'], first_crime_date: '2026-06-02', last_crime_date: '2026-06-02', risk_score: 0, size: 16, color: '#2d83d9' },
  { id: 'n8', label: 'FIR-2026-BL-1104', type: 'case', total_firs: 1, crime_types: ['chain_snatching'], first_crime_date: '2026-06-18', last_crime_date: '2026-06-18', risk_score: 0, size: 16, color: '#2d83d9' },
  { id: 'n9', label: 'Venkatesh Gowda', type: 'accused', total_firs: 4, crime_types: ['chain_snatching', 'assault'], first_crime_date: '2025-09-10', last_crime_date: '2026-05-15', risk_score: 72, size: 17, color: '#f0a848' },
  { id: 'n10', label: 'Prakash Raj', type: 'accused', total_firs: 2, crime_types: ['cybercrime'], first_crime_date: '2025-10-15', last_crime_date: '2025-10-15', risk_score: 45, size: 13, color: '#4A8B6F' },
  { id: 'n11', label: 'Silk Board Camera #45', type: 'camera', total_firs: 0, crime_types: ['surveillance'], first_crime_date: '2026-01-01', last_crime_date: '2026-07-18', risk_score: 0, size: 15, color: '#00F0FF' },
  { id: 'n12', label: 'MG Road Camera #102', type: 'camera', total_firs: 0, crime_types: ['surveillance'], first_crime_date: '2026-01-01', last_crime_date: '2026-07-18', risk_score: 0, size: 15, color: '#00F0FF' }
];

const MOCK_EDGES = [
  { id: 'e1', source: 'n1', target: 'n6', fir_case_number: 'FIR-2026-BL-0492', date: '2026-05-14', crime_type: 'vehicle_theft', weight: 4 },
  { id: 'e2', source: 'n1', target: 'n7', fir_case_number: 'FIR-2026-BL-0811', date: '2026-06-02', crime_type: 'robbery', weight: 4 },
  { id: 'e3', source: 'n2', target: 'n7', fir_case_number: 'FIR-2026-BL-0811', date: '2026-06-02', crime_type: 'robbery', weight: 3 },
  { id: 'e4', source: 'n2', target: 'n4', fir_case_number: 'FIR-2026-BL-0872', date: '2025-06-02', crime_type: 'chain_snatching', weight: 2 },
  { id: 'e5', source: 'n3', target: 'n10', fir_case_number: 'FIR-2025-BL-0112', date: '2025-10-15', crime_type: 'cybercrime', weight: 2 },
  { id: 'e6', source: 'n9', target: 'n8', fir_case_number: 'FIR-2026-BL-1104', date: '2026-06-18', crime_type: 'chain_snatching', weight: 3 },
  { id: 'e7', source: 'n1', target: 'n11', fir_case_number: 'ANPR-MATCH-0492', date: '2026-07-02', crime_type: 'surveillance', weight: 3 },
  { id: 'e8', source: 'n5', target: 'n6', fir_case_number: 'FIR-2026-BL-0492', date: '2026-05-14', crime_type: 'vehicle_theft', weight: 2 },
  { id: 'e9', source: 'n2', target: 'n12', fir_case_number: 'ANPR-MATCH-0811', date: '2026-06-02', crime_type: 'surveillance', weight: 3 }
];

export default function NetworkPage() {
  const [nodes, setNodes] = useState(MOCK_NODES);
  const [edges, setEdges] = useState(MOCK_EDGES);
  const [loading, setLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // InvestigatorWall props state
  const [activeCaseData, setActiveCaseData] = useState(null);
  const [loadingCase, setLoadingCase] = useState(false);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/network-graph-data/?min_connections=1`);
        if (res.ok) {
          const data = await res.json();
          if (data.nodes && data.nodes.length > 0) {
            setNodes(data.nodes);
            setEdges(data.edges || []);
          }
        }
      } catch (err) {
        console.warn('Using mock network data', err);
      } finally {
        setLoading(false);
      }
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
      // Fetch details from backend if available
      const res = await fetch(`${API_BASE}/firs/?accused_name=${encodeURIComponent(labelName)}`);
      if (res.ok) {
        const data = await res.json();
        // Construct InvestigatorWall props out of response
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
      // Fallback structured mockup data matching InvestigatorWallProps contract
      setActiveCaseData({
        fir: {
          case_number: `FIR-2026-BL-${Math.floor(1000 + Math.random() * 9000)}`,
          crime_type: clickedNode?.crime_types[0] || 'robbery',
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
            case_number: e.fir_case_number,
            crime_type: e.crime_type,
            date_filed: e.date,
            link_reason: 'Co-accused accomplice listing'
          })),
        case_summary: `DRISHTI AI Co-Pilot identified accomplice links for ${labelName} across ${clickedNode?.crime_types.length || 1} crime categories. Analysis suggests high repetition probability during festival seasons.`
      });
    } finally {
      setLoadingCase(false);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden bg-void-000">
      {/* Main graph area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-steel-600/40 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-paper-100 font-mono">Criminal Network Graph</h2>
            <p className="text-xs text-paper-100/50">Drag nodes to rearrange · Click on any node to load digital Investigator Wall</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-steel-700 px-3 py-1.5 rounded-lg border border-steel-600/40 flex items-center gap-4 text-xs font-mono">
              <span className="text-paper-100/50">Suspects: <span className="font-bold text-paper-100">{nodes.length}</span></span>
              <span className="text-paper-100/50">Links: <span className="font-bold text-paper-100">{edges.length}</span></span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3 border-b border-steel-600/30 text-[10px] font-mono tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-critical-500" />
            <span className="text-paper-100/50 uppercase">Critical (6+ FIRs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warn-500" />
            <span className="text-paper-100/50 uppercase">High Risk (4-5 FIRs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-phosphor-500" />
            <span className="text-paper-100/50 uppercase">Medium Risk (2-3 FIRs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-steel-600" />
            <span className="text-paper-100/50 uppercase">Low Risk (1 FIR)</span>
          </div>
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 mt-4 rounded-xl overflow-hidden border border-steel-600/30 bg-void-000">
          <ChronoCriminalGraph
            nodes={nodes}
            edges={edges}
            date_range={{ min: '2025-01-01', max: '2026-07-18' }}
            onNodeClick={handleNodeClick}
            height={550}
          />
        </div>
      </div>

      {/* Slide-in panel (Investigator Wall) */}
      {panelOpen && activeCaseData && (
        <div className="w-full md:w-[600px] lg:w-[750px] border-l border-steel-600 bg-steel-700 flex flex-col animate-slide-in absolute right-0 top-0 bottom-0 z-50 shadow-2xl overflow-y-auto">
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
      )}
    </div>
  );
}
