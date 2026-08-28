'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Navigation,
  Radio,
  Fuel,
  Gauge,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Filter,
  Shield,
  Layers,
  Compass,
  Milestone
} from 'lucide-react';
import { useSupervisorTelemetry, PatrolUnit } from '@/context/SupervisorTelemetryContext';

const SupervisorFleetMapView = dynamic(
  () => import('./SupervisorFleetMapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-2xl bg-[var(--surface-1)] flex items-center justify-center font-mono text-xs text-[var(--text-secondary)] border border-[var(--border)]">
        Initializing Dynamic 2-Second Moving Fleet Map...
      </div>
    ),
  }
);

export default function SupervisorFleetDispatchPage() {
  const { tick, lastUpdated, patrolUnits, recentRadioCalls, redeployPatrol } = useSupervisorTelemetry();
  const [selectedUnit, setSelectedUnit] = useState<PatrolUnit | null>(patrolUnits[0]);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [newPrecinctTarget, setNewPrecinctTarget] = useState('');
  const [dispatchToast, setDispatchToast] = useState('');

  // Keep selectedUnit synced with moving coordinates from context
  const currentSelected = patrolUnits.find((u) => u.id === selectedUnit?.id) || selectedUnit || patrolUnits[0];

  const filteredUnits = patrolUnits.filter((u) => {
    if (selectedDistrict === 'ALL') return true;
    return u.district === selectedDistrict;
  });

  const handleRedeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelected || !newPrecinctTarget.trim()) return;

    redeployPatrol(currentSelected.id, newPrecinctTarget);
    setDispatchToast(`Transmitted dispatch order: Re-routed ${currentSelected.callsign} to "${newPrecinctTarget}"`);
    setNewPrecinctTarget('');
    setTimeout(() => setDispatchToast(''), 4500);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              DYNAMIC 2-SECOND MOVING BEAT TRACKER
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Continuous Vector Positioning & Satellite Pings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Patrol Fleet & Resource Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Live 2-second moving coordinates of PCR vans, Cheetah bikes, Highway Interceptors & Surveillance Drones.
          </p>
        </div>

        {/* Dynamic 2s Moving Pulse */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--cyan-accent)] animate-ping" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">2s SAT-STREAM:</span>
          <span className="text-[var(--text-primary)] font-bold" suppressHydrationWarning>Moving Cycle #{tick}</span>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {dispatchToast && (
        <div className="p-3.5 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dispatchToast}</span>
        </div>
      )}

      {/* ── MAIN DISPATCH CONSOLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dynamic Moving Leaflet Map */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[var(--cyan-accent)]" />
              <span className="text-[var(--text-secondary)] uppercase font-bold text-[10px]">District Scope:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2.5 py-1 rounded bg-[var(--surface-0)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
              >
                <option value="ALL">All Districts ({patrolUnits.length} Units)</option>
                <option value="Bengaluru Urban">Bengaluru Urban</option>
                <option value="Kalaburagi">Kalaburagi</option>
                <option value="Raichur">Raichur</option>
                <option value="Chikkamagaluru">Chikkamagaluru</option>
                <option value="Vijayapura">Vijayapura</option>
              </select>
            </div>
            <span className="text-[var(--status-success)] text-[10px] font-bold flex items-center gap-1" suppressHydrationWarning>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] animate-pulse" />
              Continuous 2s Vector Sync ({lastUpdated || '18:30 IST'})
            </span>
          </div>

          <SupervisorFleetMapView
            patrolUnits={filteredUnits}
            selectedUnit={currentSelected}
            onSelectUnit={setSelectedUnit}
          />
        </div>

        {/* Right 1 Col: Selected Unit Dynamic Inspector & Live 2s Telemetry */}
        <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[var(--cyan-accent)]" /> 2s Moving Telemetry
              </span>
              {currentSelected && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-[var(--accent)] text-white">
                  {currentSelected.type}
                </span>
              )}
            </div>

            {currentSelected ? (
              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                      {currentSelected.callsign}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Officer: <strong className="text-[var(--text-primary)]">{currentSelected.officer}</strong>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] text-[10px] font-bold">
                    MOVING (2s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-secondary)] block uppercase">Speed</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1" suppressHydrationWarning>
                      <Gauge className="w-3.5 h-3.5 text-[var(--cyan-accent)]" />
                      {currentSelected.speedKmH} km/h
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-secondary)] block uppercase">Distance Covered</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1" suppressHydrationWarning>
                      <Milestone className="w-3.5 h-3.5 text-[var(--accent)]" />
                      {currentSelected.distanceKm} km
                    </span>
                  </div>
                </div>

                {/* Moving GPS Coordinates (Updates every 2 seconds) */}
                <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase">Active Beat & Dynamic Vector:</span>
                  <span className="font-bold text-[var(--text-primary)] text-xs">
                    {currentSelected.precinct}
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-[var(--cyan-accent)] font-bold mt-1" suppressHydrationWarning>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--cyan-accent)]" />
                      {currentSelected.lat.toFixed(5)}° N, {currentSelected.lng.toFixed(5)}° E
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                      Heading: {currentSelected.heading}°
                    </span>
                  </div>
                </div>

                {currentSelected.assignedIncident && (
                  <div className="p-3 rounded-lg bg-[var(--status-critical)]/10 border border-[var(--status-critical)]/30 text-[var(--status-critical)] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold uppercase block">Tactical Chase / Mission</span>
                      <span className="text-[11px] font-bold">{currentSelected.assignedIncident}</span>
                    </div>
                  </div>
                )}

                {/* Tactical Dispatch Action Form */}
                <form onSubmit={handleRedeploy} className="mt-2 flex flex-col gap-2 pt-3 border-t border-[var(--border)]">
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase flex items-center gap-1">
                    <Send className="w-3 h-3" /> Re-route Patrol Directives
                  </span>
                  <input
                    type="text"
                    value={newPrecinctTarget}
                    onChange={(e) => setNewPrecinctTarget(e.target.value)}
                    placeholder="Enter target hotspot or junction..."
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs uppercase transition-all shadow-md shadow-[var(--accent-glow)] cursor-pointer"
                  >
                    Transmit 112 Dispatch Order
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Select a patrol unit from the map to inspect live moving coordinates.
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
            <span>KSP 112 GPS Polling: 2,000ms</span>
            <span className="text-[var(--status-success)] font-bold">● LIVE MOVEMENT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
