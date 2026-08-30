'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  GitBranch,
  ShieldAlert,
  Users,
  Building2,
  Share2,
  AlertTriangle,
  Layers,
  Search,
  ExternalLink,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamically import shared D3 NetworkGraphCard
const NetworkGraphCard = dynamic(
  () => import('@/components/visualization/NetworkGraphCard'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-400 border border-slate-200">
        Calibrating Cross-Station D3 Syndicate Graph...
      </div>
    ),
  }
);

interface SyndicateNexus {
  id: string;
  name: string;
  category: string;
  threat_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  estimated_volume: string;
  kingpin: string;
  participating_stations: string[];
  total_members: number;
  total_firs: number;
  graph_data: {
    nodes: Array<{ id: string; label: string; size?: number; color?: string }>;
    edges: Array<{ source: string; target: string; color?: string }>;
  };
  summary: string;
}

const SYNDICATES: SyndicateNexus[] = [
  {
    id: 'SYN-VT-01',
    name: 'Bullet Ramesh Inter-District Vehicle Theft Syndicate',
    category: 'Vehicle Theft & Chopshop Fencing',
    threat_level: 'CRITICAL',
    estimated_volume: '₹1.8 Cr (42 Vehicles/yr)',
    kingpin: 'Ramesh Kumar (alias Bullet Ramesh)',
    participating_stations: ['Ashoknagar PS', 'Cubbon Park PS', 'Indiranagar PS', 'Raichur Suburban PS'],
    total_members: 6,
    total_firs: 14,
    graph_data: {
      nodes: [
        { id: 'ramesh', label: 'Ramesh Kumar (Kingpin)', size: 14, color: '#ef4444' },
        { id: 'deepak', label: 'Deepak Shetty (Yelahanka Chopshop)', size: 10, color: '#f59e0b' },
        { id: 'manoj', label: 'Manoj Reddy (Jammer Operator)', size: 10, color: '#38bdf8' },
        { id: 'farid', label: 'Farid Mirza (Smart Key Supplier)', size: 10, color: '#a855f7' },
        { id: 'ashoknagar_ps', label: 'Ashoknagar PS (FIR-1840)', size: 8, color: '#10b981' },
        { id: 'cubbon_ps', label: 'Cubbon Park PS (FIR-0747)', size: 8, color: '#10b981' },
      ],
      edges: [
        { source: 'ramesh', target: 'deepak', color: '#ef4444' },
        { source: 'ramesh', target: 'manoj', color: '#ef4444' },
        { source: 'ramesh', target: 'farid', color: '#ef4444' },
        { source: 'deepak', target: 'ashoknagar_ps', color: '#94a3b8' },
        { source: 'manoj', target: 'cubbon_ps', color: '#94a3b8' },
      ],
    },
    summary: 'Operates 433MHz immobilizer frequency jammers across central Bengaluru; transits stolen two-wheelers to rural chopshops in Raichur within 6 hours.',
  },
  {
    id: 'SYN-ND-02',
    name: 'Helmet Imran Commercial Synthetic Narcotics Ring',
    category: 'Commercial Narcotics (NDPS)',
    threat_level: 'CRITICAL',
    estimated_volume: '₹3.4 Cr (Commercial MDMA)',
    kingpin: 'Imran Khan (alias Helmet Imran)',
    participating_stations: ['Indiranagar PS', 'Ulsoor PS', 'Tumakuru Town PS'],
    total_members: 5,
    total_firs: 9,
    graph_data: {
      nodes: [
        { id: 'imran', label: 'Imran Khan (Trafficking Lead)', size: 14, color: '#ef4444' },
        { id: 'arun', label: 'Arun Gowda (Dead-Drop Courier)', size: 10, color: '#f59e0b' },
        { id: 'farid_m', label: 'Farid Mirza (Goa Transit Sourcing)', size: 10, color: '#a855f7' },
        { id: 'indiranagar_ps', label: 'Indiranagar PS (FIR-1726)', size: 8, color: '#10b981' },
        { id: 'ulsoor_ps', label: 'Ulsoor PS (FIR-0122)', size: 8, color: '#10b981' },
      ],
      edges: [
        { source: 'imran', target: 'arun', color: '#ef4444' },
        { source: 'imran', target: 'farid_m', color: '#ef4444' },
        { source: 'arun', target: 'indiranagar_ps', color: '#94a3b8' },
        { source: 'farid_m', target: 'ulsoor_ps', color: '#94a3b8' },
      ],
    },
    summary: 'Distributes high-purity synthetic MDMA via dead-drops at Outer Ring Road fuel pumps and tech corridors using unbranded courier helmets.',
  },
];

export default function SupervisorNetworkGraphPage() {
  const [selectedSyndicate, setSelectedSyndicate] = useState<SyndicateNexus>(SYNDICATES[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSyndicates = SYNDICATES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.kingpin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Cross-Station Criminal Network Graph
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Karnataka State Police · Aggregated Cross-Station Syndicate Link Analysis & Kingpin Nexus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            2 Active Syndicates Under Watch
          </span>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search syndicate name, kingpin alias, or crime category..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 shadow-xs"
        />
      </div>

      {/* ── 2-COLUMN SYNDICATE WORKSPACE (LIGHT THEME) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Syndicate Selector & Meta (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Active Criminal Gang Syndicates ({filteredSyndicates.length})
            </h3>

            <div className="flex flex-col gap-3 mt-1">
              {filteredSyndicates.map((syn) => {
                const isSelected = selectedSyndicate.id === syn.id;

                return (
                  <div
                    key={syn.id}
                    onClick={() => setSelectedSyndicate(syn)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${isSelected
                        ? 'bg-blue-50/60 border-blue-300 shadow-sm'
                        : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {syn.threat_level}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {syn.total_members} Accused · {syn.total_firs} FIRs
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{syn.name}</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Kingpin: <strong className="text-slate-900">{syn.kingpin}</strong>
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {syn.participating_stations.map((ps) => (
                        <span key={ps} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {ps}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Syndicate Operational Summary */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Modus Operandi & Volume</h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {selectedSyndicate.summary}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Estimated Annual Volume:</span>
              <span className="text-emerald-600 font-bold">{selectedSyndicate.estimated_volume}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive D3 Cross-Station Network Graph (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  D3 Criminal Link Analysis Visualization
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive force-directed graph. Drag nodes to inspect inter-station associations.
                </p>
              </div>
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live Force Simulation
              </span>
            </div>

            {/* D3 Graph Component */}
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <NetworkGraphCard
                data={selectedSyndicate.graph_data}
                title={`${selectedSyndicate.name} — Inter-Station Nexus`}
              />
            </div>

            {/* Graph Node Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Kingpin</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Lieutenant/Fence</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Operative</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Police Station</span>
              </div>
              <span className="text-slate-400">Drag to rearrange nodes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
