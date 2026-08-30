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
  Milestone,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useSupervisorTelemetry, PatrolUnit } from '@/context/SupervisorTelemetryContext';

const SupervisorFleetMapView = dynamic(
  () => import('./SupervisorFleetMapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-2xl bg-slate-100 flex items-center justify-center font-mono text-xs text-slate-400 border border-slate-200">
        Initializing Dynamic 2-Second Moving Fleet Map...
      </div>
    ),
  }
);

const DARK_ZONES = [
  {
    corridor: 'Silk Board TTMC → Hosur Road Fringe',
    risk_level: 'CRITICAL',
    crime_vector: 'Organized Two-Wheeler & Hatchback Thefts',
    window: '22:00 - 04:00 hrs',
    recommended_patrol: 'Deploy 2 Cheetah Bikes + 1 PCR Interceptor at Attibele Chokepoint'
  },
  {
    corridor: 'Outer Ring Road (Bellandur Flyover Fringe)',
    risk_level: 'HIGH',
    crime_vector: 'Commercial NDPS Dead-Drop Nodes',
    window: '20:00 - 02:00 hrs',
    recommended_patrol: 'Deploy Drone Unit + PCR-14 for high-angle optical surveillance'
  },
  {
    corridor: 'Indiranagar 100ft Road Strip',
    risk_level: 'HIGH',
    crime_vector: 'Late-Night Physical Assault & Robbery',
    window: '23:30 - 03:30 hrs',
    recommended_patrol: 'Station Static Foot Beat at 12th Main Junction'
  }
];

export default function SupervisorFleetDispatchPage() {
  const { tick, lastUpdated, patrolUnits, recentRadioCalls, redeployPatrol } = useSupervisorTelemetry();
  const [selectedUnit, setSelectedUnit] = useState<PatrolUnit | null>(patrolUnits[0]);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [newPrecinctTarget, setNewPrecinctTarget] = useState('');
  const [dispatchToast, setDispatchToast] = useState('');

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

  const handleQuickDeployToDarkZone = (corridor: string) => {
    if (!currentSelected) return;
    redeployPatrol(currentSelected.id, corridor);
    setDispatchToast(`Tactical Dispatch: Re-routed ${currentSelected.callsign} to Dark Zone: "${corridor}"`);
    setTimeout(() => setDispatchToast(''), 4500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Fleet & Patrol Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Karnataka State Police · Live 2-Second GPS Moving Patrol Fleet & Dark Zone Patrol Recommendations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            2s Satellite Stream #{tick}
          </span>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {dispatchToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispatchToast}</span>
        </div>
      )}

      {/* ── MAIN DISPATCH CONSOLE (LIGHT THEME) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dynamic Moving Leaflet Map + Dark Zone Hotspot Recommendations */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                Live Moving Vector Patrol Map (142 Active Units)
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Districts</option>
                  <option value="Bengaluru Urban">Bengaluru Urban</option>
                  <option value="Tumakuru">Tumakuru</option>
                  <option value="Raichur">Raichur</option>
                  <option value="Kalaburagi">Kalaburagi</option>
                </select>
              </div>
            </div>

            {/* Dynamic Map Component */}
            <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 relative">
              <SupervisorFleetMapView
                patrolUnits={filteredUnits}
                selectedUnit={currentSelected}
                onSelectUnit={(u) => setSelectedUnit(u)}
              />
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> PCR Van</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Cheetah Bike</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Interceptor</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Drone</span>
              </div>
              <span className="text-emerald-600 font-bold">● Dashed Line = 2s Real-Time Trail</span>
            </div>
          </div>

          {/* Dark Zone Patrol Recommendations */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Jurisdiction Dark Zone Hotspots & Patrol Guidance
              </h3>
              <span className="text-xs text-slate-500 font-medium">AI Predictive Night Grid</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DARK_ZONES.map((zone) => (
                <div
                  key={zone.corridor}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {zone.risk_level}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{zone.window}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs leading-tight">{zone.corridor}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{zone.crime_vector}</p>
                    <p className="text-[10px] text-blue-700 bg-blue-50 p-2 rounded-xl border border-blue-100 mt-2">
                      💡 {zone.recommended_patrol}
                    </p>
                  </div>

                  <button
                    onClick={() => handleQuickDeployToDarkZone(zone.corridor)}
                    className="w-full py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-all shadow-xs mt-2"
                  >
                    Deploy {currentSelected?.callsign || 'Unit'} Here →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Selected Unit Telemetry & Redeployment Directive */}
        <div className="flex flex-col gap-6">
          {currentSelected && (
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    TELEMETRY FEED
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {currentSelected.callsign}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {currentSelected.status}
                </span>
              </div>

              {/* Core Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-slate-400">Unit Type</span>
                  <span className="font-bold text-slate-800">{currentSelected.type}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-slate-400">Officer In Charge</span>
                  <span className="font-bold text-slate-800 truncate">{currentSelected.officer}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-slate-400">Moving Speed</span>
                  <span className="font-bold text-blue-600 text-sm font-mono">{currentSelected.speedKmH} km/h</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                  <span className="text-slate-400">Fuel Reserves</span>
                  <span className="font-bold text-emerald-600 text-sm font-mono">{currentSelected.fuel}%</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                <span className="text-slate-400 text-[10px]">Active Sector Precinct:</span>
                <span className="font-bold text-slate-900">{currentSelected.precinct}</span>
                <span className="text-slate-500 text-[10px]">District: {currentSelected.district}</span>
              </div>

              {/* Dynamic Redeployment Form */}
              <form onSubmit={handleRedeploy} className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 text-xs">Dispatch New Beat Target:</span>
                <input
                  type="text"
                  value={newPrecinctTarget}
                  onChange={(e) => setNewPrecinctTarget(e.target.value)}
                  placeholder="e.g. Silk Board Junction, Attibele Toll..."
                  className="w-full px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-slate-900 hover:scale-105 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Radio Dispatch Order</span>
                </button>
              </form>
            </div>
          )}

          {/* Unit Roster List for Fast Switching */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-slate-800">Quick Select Patrol Unit:</span>
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {filteredUnits.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`w-full p-2.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                    currentSelected.id === unit.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="font-bold block text-slate-900">{unit.callsign}</span>
                    <span className="text-[10px] text-slate-500">{unit.precinct}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 font-mono">{unit.speedKmH} km/h</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
