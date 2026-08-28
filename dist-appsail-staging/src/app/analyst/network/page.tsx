'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GitBranch,
  Shield,
  Layers,
  Sparkles,
  Users,
  Search,
  Filter,
  Eye,
  Activity,
  ArrowRight,
  Zap,
  Flame,
  Phone,
  Car,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalystTelemetry } from '@/context/AnalystTelemetryContext';

interface NetworkNode {
  id: string;
  name: string;
  role: 'KINGPIN' | 'OPERATIVE' | 'LOGISTICS' | 'RECEIVER' | 'FINANCE';
  syndicate: 'AUTO_THEFT' | 'NARCOTICS' | 'CYBER_FRAUD' | 'BURGLARY';
  casesCount: number;
  riskScore: number;
  centralityIndex: number;
  x: number;
  y: number;
  primaryLocation: string;
  sharedIdentifiers: { phone: string; vehicle: string };
  connectedNodeIds: string[];
}

const NETWORK_NODES: NetworkNode[] = [
  // Auto Theft Syndicate
  {
    id: 'N-01',
    name: 'Ramesh Kumar (Bullet Ramesh)',
    role: 'KINGPIN',
    syndicate: 'AUTO_THEFT',
    casesCount: 6,
    riskScore: 94,
    centralityIndex: 0.96,
    x: 280,
    y: 200,
    primaryLocation: 'Raichur & Bengaluru Central',
    sharedIdentifiers: { phone: '+91 98450 XXXXX', vehicle: 'KA-36-TR-8821' },
    connectedNodeIds: ['N-02', 'N-03', 'N-04'],
  },
  {
    id: 'N-02',
    name: 'Santosh G. (Chotta T-Key)',
    role: 'OPERATIVE',
    syndicate: 'AUTO_THEFT',
    casesCount: 3,
    riskScore: 82,
    centralityIndex: 0.68,
    x: 180,
    y: 130,
    primaryLocation: 'Raichur Suburban PS',
    sharedIdentifiers: { phone: '+91 98451 XXXXX', vehicle: 'Unregistered Tempo' },
    connectedNodeIds: ['N-01'],
  },
  {
    id: 'N-03',
    name: 'Gopal Scrap Syndicate',
    role: 'RECEIVER',
    syndicate: 'AUTO_THEFT',
    casesCount: 4,
    riskScore: 88,
    centralityIndex: 0.74,
    x: 390,
    y: 140,
    primaryLocation: 'Bidar Industrial Yard',
    sharedIdentifiers: { phone: '+91 99002 XXXXX', vehicle: 'KA-38-M-1002' },
    connectedNodeIds: ['N-01'],
  },
  {
    id: 'N-04',
    name: 'Praveen Logistics',
    role: 'LOGISTICS',
    syndicate: 'AUTO_THEFT',
    casesCount: 2,
    riskScore: 76,
    centralityIndex: 0.52,
    x: 230,
    y: 310,
    primaryLocation: 'Davangere Bypass',
    sharedIdentifiers: { phone: '+91 94481 XXXXX', vehicle: 'KA-17-B-9901' },
    connectedNodeIds: ['N-01', 'N-08'],
  },

  // Narcotics Cartel
  {
    id: 'N-05',
    name: 'Imran Khan (Chotta Imran)',
    role: 'KINGPIN',
    syndicate: 'NARCOTICS',
    casesCount: 5,
    riskScore: 96,
    centralityIndex: 0.98,
    x: 620,
    y: 220,
    primaryLocation: 'Bengaluru East & Tumakuru',
    sharedIdentifiers: { phone: '+91 98860 XXXXX', vehicle: 'KA-04-MB-4040' },
    connectedNodeIds: ['N-06', 'N-07'],
  },
  {
    id: 'N-06',
    name: 'Farid Mirza (Dead Drop Operator)',
    role: 'OPERATIVE',
    syndicate: 'NARCOTICS',
    casesCount: 4,
    riskScore: 89,
    centralityIndex: 0.72,
    x: 520,
    y: 140,
    primaryLocation: 'Wadhwa / BLR East PS',
    sharedIdentifiers: { phone: '+91 97410 XXXXX', vehicle: 'KA-03-JJ-3312' },
    connectedNodeIds: ['N-05'],
  },
  {
    id: 'N-07',
    name: 'Subhash Hawala Channel',
    role: 'FINANCE',
    syndicate: 'NARCOTICS',
    casesCount: 3,
    riskScore: 91,
    centralityIndex: 0.81,
    x: 730,
    y: 160,
    primaryLocation: 'Tumakuru Town PS',
    sharedIdentifiers: { phone: '+91 96110 XXXXX', vehicle: 'Virtual USDT Nodes' },
    connectedNodeIds: ['N-05', 'N-09'],
  },

  // Cyber Fraud & Phishing
  {
    id: 'N-08',
    name: 'Bhavani Karpe',
    role: 'KINGPIN',
    syndicate: 'CYBER_FRAUD',
    casesCount: 6,
    riskScore: 85,
    centralityIndex: 0.88,
    x: 440,
    y: 380,
    primaryLocation: 'Chikkamagaluru & BLR Traffic',
    sharedIdentifiers: { phone: '+91 80-2294-XXXX', vehicle: 'IP: 103.21.XX.XX' },
    connectedNodeIds: ['N-09', 'N-04'],
  },
  {
    id: 'N-09',
    name: 'FinTech Mule Account Network',
    role: 'FINANCE',
    syndicate: 'CYBER_FRAUD',
    casesCount: 4,
    riskScore: 83,
    centralityIndex: 0.70,
    x: 600,
    y: 390,
    primaryLocation: 'Gara Zila & Tumakuru Ind.',
    sharedIdentifiers: { phone: '+91 91080 XXXXX', vehicle: '14 Cloned Bank Accts' },
    connectedNodeIds: ['N-08', 'N-07'],
  },
];

const SYNDICATE_COLORS = {
  AUTO_THEFT: { stroke: '#0284C7', fill: '#0284C7', label: 'Auto Theft Ring' },
  NARCOTICS: { stroke: '#DC2626', fill: '#DC2626', label: 'MDMA Narcotics Cartel' },
  CYBER_FRAUD: { stroke: '#D97706', fill: '#D97706', label: 'Cyber Fraud Syndicate' },
  BURGLARY: { stroke: '#059669', fill: '#059669', label: 'Housebreaking Crew' },
};

export default function SyndicateNexusPage() {
  const { tick, lastUpdated, confidenceScore } = useAnalystTelemetry();
  const [selectedSyndicate, setSelectedSyndicate] = useState<'ALL' | 'AUTO_THEFT' | 'NARCOTICS' | 'CYBER_FRAUD'>('ALL');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(NETWORK_NODES[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const visibleNodes = NETWORK_NODES.filter((node) => {
    if (selectedSyndicate !== 'ALL' && node.syndicate !== selectedSyndicate) return false;
    if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              LINK ANALYSIS MATRIX
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Multi-Hop Syndicate Linkage & Kingpin Discovery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Criminal Syndicate & Deep Link Graph
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Calculates node centrality, co-offender associations, shared logistics, and inter-precinct link weights.
          </p>
        </div>

        {/* Real-time Link Telemetry */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--cyan-accent)] animate-ping" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">NODES:</span>
          <span className="text-[var(--text-primary)] font-bold">{visibleNodes.length} Active / 14 Links</span>
        </div>
      </div>

      {/* ── CONTROLS & SYNDICATE FILTER TABS ── */}
      <div className="p-4 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[var(--cyan-accent)]" /> Syndicate:
          </span>
          {[
            { id: 'ALL', label: 'All Syndicates' },
            { id: 'AUTO_THEFT', label: 'Auto Theft Ring' },
            { id: 'NARCOTICS', label: 'MDMA Narcotics Cartel' },
            { id: 'CYBER_FRAUD', label: 'Cyber Phishing Nexus' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSyndicate(s.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                selectedSyndicate === s.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative font-mono text-xs min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Find suspect node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
          />
        </div>
      </div>

      {/* ── INTERACTIVE GRAPH CANVAS & INSPECTOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive SVG Multi-Hop Graph */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm relative min-h-[540px] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 z-10">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase font-bold">
              Multi-Hop Topology (Centrality Threshold ≥ 0.70)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-1)] text-[var(--cyan-accent)] font-semibold">
              Live Topology Recalculated (Cycle #{tick})
            </span>
          </div>

          {/* SVG Topology Render */}
          <div className="w-full flex-1 flex items-center justify-center relative py-4">
            <svg viewBox="0 0 900 500" className="w-full h-full max-h-[460px] select-none">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Link Lines */}
              {visibleNodes.map((sourceNode) =>
                sourceNode.connectedNodeIds.map((targetId) => {
                  const targetNode = NETWORK_NODES.find((n) => n.id === targetId);
                  if (!targetNode || (selectedSyndicate !== 'ALL' && targetNode.syndicate !== selectedSyndicate)) {
                    return null;
                  }

                  const isHighlighted =
                    selectedNode?.id === sourceNode.id || selectedNode?.id === targetNode.id;

                  return (
                    <line
                      key={`${sourceNode.id}-${targetId}`}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isHighlighted ? 'var(--cyan-accent)' : 'var(--border)'}
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      strokeDasharray={sourceNode.role === 'FINANCE' || targetNode.role === 'FINANCE' ? '4 3' : undefined}
                      opacity={isHighlighted ? 1 : 0.6}
                      className="transition-all duration-300"
                    />
                  );
                })
              )}

              {/* Node Circles & Labels */}
              {visibleNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isKingpin = node.role === 'KINGPIN';
                const nodeRadius = isKingpin ? 22 : 15;
                const synColor = SYNDICATE_COLORS[node.syndicate].fill;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for Kingpins */}
                    {isKingpin && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={nodeRadius + 6}
                        fill="none"
                        stroke={synColor}
                        strokeWidth="1.5"
                        opacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Core Node Circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeRadius}
                      fill={isSelected ? '#0F172A' : synColor}
                      stroke={isSelected ? '#FFFFFF' : '#FFFFFF'}
                      strokeWidth={isSelected ? 3 : 2}
                      filter={isSelected ? 'url(#glow)' : undefined}
                      className="transition-all duration-200"
                    />

                    {/* Node Role Badge */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={isKingpin ? "10" : "8"}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {isKingpin ? '👑' : node.role === 'FINANCE' ? '₹' : '●'}
                    </text>

                    {/* Label */}
                    <text
                      x={node.x}
                      y={node.y + nodeRadius + 14}
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                      className="transition-colors"
                    >
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Graph Legend */}
          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">👑 Kingpin Node</span>
              <span className="flex items-center gap-1">● Operative / Logistics</span>
              <span className="flex items-center gap-1">₹ Hawala / Financial Mule</span>
            </div>
            <span>Click any node to inspect link telemetry</span>
          </div>
        </div>

        {/* Right: Selected Node Deep Dossier */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          {selectedNode ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                    {SYNDICATE_COLORS[selectedNode.syndicate].label}
                  </span>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedNode.name}
                  </h2>
                </div>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedNode.role === 'KINGPIN'
                      ? 'bg-[var(--status-critical)]/15 text-[var(--status-critical)] border border-[var(--status-critical)]/30'
                      : 'bg-[var(--cyan-accent)]/15 text-[var(--cyan-accent)] border border-[var(--cyan-accent)]/30'
                  }`}
                >
                  {selectedNode.role}
                </span>
              </div>

              {/* Centrality & Risk Scores */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Network Centrality</span>
                  <span className="text-xl font-extrabold text-[var(--cyan-accent)]">
                    {(selectedNode.centralityIndex * 100).toFixed(0)}%
                  </span>
                  <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">High Bridge Influence</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Threat Index</span>
                  <span className="text-xl font-extrabold text-[var(--status-critical)]">
                    {selectedNode.riskScore}/100
                  </span>
                  <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">{selectedNode.casesCount} Linked FIRs</div>
                </div>
              </div>

              {/* Jurisdictional Footprint */}
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-1 font-mono text-xs">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Primary Spatial Footprint:</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">📍 {selectedNode.primaryLocation}</span>
              </div>

              {/* Shared Telemetry Markers */}
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-2 font-mono text-xs">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Shared Technical Identifiers:</span>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-primary)]">
                  <Phone className="w-3.5 h-3.5 text-[var(--cyan-accent)]" />
                  <span>{selectedNode.sharedIdentifiers.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-primary)]">
                  <Car className="w-3.5 h-3.5 text-[var(--status-warning)]" />
                  <span>{selectedNode.sharedIdentifiers.vehicle}</span>
                </div>
              </div>

              {/* Connected Associates */}
              <div className="flex flex-col gap-1.5 font-mono text-xs">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                  Direct Multi-Hop Associates ({selectedNode.connectedNodeIds.length}):
                </span>
                <div className="flex flex-col gap-1">
                  {selectedNode.connectedNodeIds.map((id) => {
                    const assoc = NETWORK_NODES.find((n) => n.id === id);
                    if (!assoc) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedNode(assoc)}
                        className="px-2.5 py-1.5 rounded bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-left flex items-center justify-between text-[11px] transition-colors"
                      >
                        <span className="font-semibold text-[var(--text-primary)]">{assoc.name}</span>
                        <span className="text-[9px] text-[var(--text-secondary)] uppercase">{assoc.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-[var(--text-secondary)]">
              Select any graph node to inspect network link dossier.
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border)]">
            <Link
              href="/analyst/watchlist"
              className="w-full py-2 rounded-lg bg-[var(--accent)] text-white font-mono text-xs font-bold text-center hover:opacity-90 transition-all block"
            >
              Add Lead Suspect to Active Watchlist →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
