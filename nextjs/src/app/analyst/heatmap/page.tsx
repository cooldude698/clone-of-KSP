'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Flame,
  Filter,
  Navigation,
  ChevronRight,
  TrendingUp,
  Cpu,
  Info
} from 'lucide-react';
import { useAnalystTelemetry } from '@/context/AnalystTelemetryContext';
import type { AnalystZone } from './AnalystHeatmapView';

const AnalystHeatmapView = dynamic(() => import('./AnalystHeatmapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[580px] rounded-2xl flex items-center justify-center bg-[var(--surface-1)] text-[var(--text-secondary)] font-mono text-xs border border-[var(--border)]">
      Loading Predictive Spatial Engine...
    </div>
  ),
});

const ALL_ZONES: AnalystZone[] = [
  {
    id: 'Z-01',
    lat: 12.9344,
    lng: 77.6264,
    area: 'Silk Board Junction',
    district: 'Bengaluru Urban',
    timeSlot: 'NIGHT',
    severity: 'CRITICAL',
    crimeCount: 48,
    riskScore: 95,
    topCategories: ['Vehicle Theft', 'Robbery'],
    primarySuspect: 'Ramesh Kumar (Bullet Ramesh)',
    patrolRecommendation: '+3 Flying Squads on Ring Road underpass between 01:00 - 04:00',
    predictedShift: '+24% surge projected on weekend nights',
  },
  {
    id: 'Z-02',
    lat: 12.9762,
    lng: 77.6033,
    area: 'MG Road Metro Axis',
    district: 'Bengaluru Urban',
    timeSlot: 'NIGHT',
    severity: 'HIGH',
    crimeCount: 32,
    riskScore: 88,
    topCategories: ['Chain Snatching', 'Assault'],
    primarySuspect: 'Mahika Ramachandran',
    patrolRecommendation: 'Deploy 2 Cheetah patrol motorcycles near Brigade Junction',
    predictedShift: 'Stable recurrence with weekend peak',
  },
  {
    id: 'Z-03',
    lat: 12.9698,
    lng: 77.7499,
    area: 'Whitefield ITPL Corridor',
    district: 'Bengaluru Urban',
    timeSlot: 'AFTERNOON',
    severity: 'HIGH',
    crimeCount: 27,
    riskScore: 86,
    topCategories: ['Cyber Fraud', 'Vehicle Theft'],
    primarySuspect: 'Bhavani Karpe',
    patrolRecommendation: 'Intensify ANPR scanning at Hoodi Checkpost',
    predictedShift: '+12% day-shift transit filings',
  },
  {
    id: 'Z-04',
    lat: 12.9279,
    lng: 77.6271,
    area: 'HSR Layout Sector 2',
    district: 'Bengaluru Urban',
    timeSlot: 'MORNING',
    severity: 'HIGH',
    crimeCount: 24,
    riskScore: 82,
    topCategories: ['Residential Burglary', 'Vehicle Theft'],
    primarySuspect: 'Vikram Reddy',
    patrolRecommendation: 'Community beat officer rounds between 08:00 - 11:30',
    predictedShift: 'Morning break-in window identified',
  },
  {
    id: 'Z-05',
    lat: 17.3297,
    lng: 76.8343,
    area: 'Murty Circle',
    district: 'Kalaburagi',
    timeSlot: 'AFTERNOON',
    severity: 'CRITICAL',
    crimeCount: 38,
    riskScore: 92,
    topCategories: ['Hit and Run', 'Assault'],
    primarySuspect: 'Vikram Singh',
    patrolRecommendation: 'Establish speed radar trap on NH-50 junction',
    predictedShift: 'Afternoon heavy freight correlation (+31%)',
  },
  {
    id: 'Z-06',
    lat: 16.2076,
    lng: 77.3463,
    area: 'Balay Circle',
    district: 'Raichur',
    timeSlot: 'NIGHT',
    severity: 'CRITICAL',
    crimeCount: 41,
    riskScore: 94,
    topCategories: ['Vehicle Theft', 'Property Crime'],
    primarySuspect: 'Ramesh Kumar',
    patrolRecommendation: 'Seal entry slipway to Industrial bypass at 00:00',
    predictedShift: 'Repeat master key syndicate active',
  },
  {
    id: 'Z-07',
    lat: 13.3161,
    lng: 75.7720,
    area: 'Ganesh Marg',
    district: 'Chikkamagaluru',
    timeSlot: 'PREDICTIVE',
    severity: 'HIGH',
    crimeCount: 22,
    riskScore: 89,
    topCategories: ['Housebreaking', 'Cybercrime'],
    primarySuspect: 'Vikram Reddy',
    patrolRecommendation: 'Night static picket near Market PS border',
    predictedShift: 'AI Predicts +40% risk over next 72 hours',
  },
  {
    id: 'Z-08',
    lat: 13.3409,
    lng: 77.1010,
    area: 'Bajaj Chowk & Industrial Zone',
    district: 'Tumakuru',
    timeSlot: 'PREDICTIVE',
    severity: 'HIGH',
    crimeCount: 29,
    riskScore: 91,
    topCategories: ['Narcotics NDPS', 'Financial Fraud'],
    primarySuspect: 'Imran Khan',
    patrolRecommendation: 'Plainclothes narcotics surveillance unit alert',
    predictedShift: 'Cross-district transit corridor flagged',
  },
];

export default function PredictiveHeatmapPage() {
  const { tick, lastUpdated, confidenceScore, latestAnomaly } = useAnalystTelemetry();

  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'PREDICTIVE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState<AnalystZone | null>(ALL_ZONES[0]);

  const filteredZones = useMemo(() => {
    return ALL_ZONES.filter((z) => {
      if (timeFilter !== 'ALL' && z.timeSlot !== timeFilter) return false;
      if (categoryFilter !== 'ALL' && !z.topCategories.some((c) => c.toLowerCase().includes(categoryFilter.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [timeFilter, categoryFilter]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER & CONTROLS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              SPATIO-TEMPORAL INTEL
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Bayesian Density Kernel · 3s Recalibration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Predictive Crime Heatmap & High-Risk Zones
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Time-sliced crime density layers with 7-day predictive AI patrol allocation forecasts.
          </p>
        </div>

        {/* Real-Time Pulse Metric */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-critical)] animate-ping" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">HOTSPOT PULSE:</span>
          <span className="text-[var(--text-primary)] font-bold">{filteredZones.length} Zones Tracked</span>
        </div>
      </div>

      {/* ── TIME SLICE & CRIME TYPE TOGGLES ── */}
      <div className="p-4 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Time Slice Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] mr-1 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--cyan-accent)]" /> Time Slice:
          </span>
          {[
            { id: 'ALL', label: 'All 24h' },
            { id: 'MORNING', label: 'Morning (06-12)' },
            { id: 'AFTERNOON', label: 'Afternoon (12-18)' },
            { id: 'NIGHT', label: 'Night (18-06)' },
            { id: 'PREDICTIVE', label: 'AI 7-Day Forecast ✨' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                timeFilter === t.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[var(--cyan-accent)]" /> Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
          >
            <option value="ALL">All Categories</option>
            <option value="Vehicle Theft">Vehicle Theft</option>
            <option value="Robbery">Robbery & Armed</option>
            <option value="Narcotics">Narcotics (NDPS)</option>
            <option value="Burglary">Housebreaking</option>
            <option value="Cyber">Cybercrime</option>
            <option value="Hit and Run">Hit & Run</option>
          </select>
        </div>
      </div>

      {/* ── MAP CONTAINER & DETAIL DRAWER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 relative min-h-[580px]">
          <AnalystHeatmapView
            zones={filteredZones}
            selectedZone={selectedZone}
            onSelectZone={(z) => setSelectedZone(z)}
          />

          {/* Dynamic 3s Patrol Banner on top of map */}
          <div className="absolute bottom-4 left-4 right-4 z-20 p-3 rounded-xl bg-[var(--surface-0)]/95 backdrop-blur-md border border-[var(--border)] shadow-lg flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[var(--cyan-accent)] animate-pulse" />
              <span className="text-[var(--text-secondary)] font-bold uppercase text-[10px]">PATROL RECOMMENDATION:</span>
              <span className="text-[var(--text-primary)] font-semibold truncate">
                {selectedZone ? selectedZone.patrolRecommendation : 'Select a zone for tactical deployment brief'}
              </span>
            </div>
            <span className="text-[10px] text-[var(--cyan-accent)] font-bold hidden sm:inline">
              Cycle #{tick}
            </span>
          </div>
        </div>

        {/* Selected Zone Deep Intelligence Drawer */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          {selectedZone ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                    {selectedZone.district}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    {selectedZone.area}
                  </h2>
                </div>
                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold uppercase ${
                    selectedZone.severity === 'CRITICAL'
                      ? 'bg-[var(--status-critical)]/15 text-[var(--status-critical)] border border-[var(--status-critical)]/30'
                      : 'bg-[var(--status-warning)]/15 text-[var(--status-warning)] border border-[var(--status-warning)]/30'
                  }`}
                >
                  {selectedZone.severity} RISK
                </span>
              </div>

              {/* Risk Scores Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Threat Index</span>
                  <span className="text-xl font-extrabold text-[var(--status-critical)]">{selectedZone.riskScore}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Logged Filings</span>
                  <span className="text-xl font-extrabold text-[var(--text-primary)]">{selectedZone.crimeCount} FIRs</span>
                </div>
              </div>

              {/* Crime Categories */}
              <div className="flex flex-col gap-1.5 font-mono text-xs">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Top Offense Profiles:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedZone.topCategories.map((c) => (
                    <span key={c} className="px-2 py-1 rounded bg-[var(--surface-1)] border border-[var(--border)] text-[11px] font-semibold text-[var(--text-primary)]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Suspect Nexus */}
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-1 font-mono text-xs">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Primary Suspect Nexus:</span>
                <span className="text-xs font-bold text-[var(--cyan-accent)]">{selectedZone.primarySuspect}</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Multiple master key theft filings in corridor</span>
              </div>

              {/* Predictive Surge Forecast */}
              <div className="p-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex flex-col gap-1 font-mono text-xs">
                <span className="text-[10px] text-[var(--accent)] uppercase font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 7-Day AI Trajectory Forecast:
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-primary)]">{selectedZone.predictedShift}</span>
              </div>

              {/* Deployment Action Note */}
              <div className="p-3 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 flex flex-col gap-1 font-mono text-xs">
                <span className="text-[10px] text-[var(--status-success)] uppercase font-bold">Recommended Tactical Shift:</span>
                <span className="text-[11px] text-[var(--text-primary)]">{selectedZone.patrolRecommendation}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-[var(--text-secondary)]">
              Click any map circle to inspect predictive intelligence profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
