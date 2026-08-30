'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  Send,
  ShieldAlert,
  Users,
  CheckCircle2,
  Bell,
  Layers,
  Clock,
  Zap,
  MapPin
} from 'lucide-react';
import { useSupervisorTelemetry } from '@/context/SupervisorTelemetryContext';

interface EscalationAlert {
  id: string;
  level: 'LEVEL-4 (STATE CRITICAL)' | 'LEVEL-3 (DISTRICT EMERGENCY)' | 'LEVEL-2 (HIGH ALERT)';
  title: string;
  location: string;
  district: string;
  timestamp: string;
  description: string;
  commandDirective: string;
  activeQrtDispatched: boolean;
  status: 'ACTIVE' | 'RESOLVING' | 'CONTAINED';
}

const INITIAL_ESCALATIONS: EscalationAlert[] = [
  {
    id: 'ESC-2026-09',
    level: 'LEVEL-4 (STATE CRITICAL)',
    title: 'Inter-District Highway Armed Heist & Cordon',
    location: 'NH-50 (Kalaburagi-Raichur Axis, Manvi Toll Gate)',
    district: 'Raichur & Kalaburagi',
    timestamp: '18:14 IST',
    description: '4 armed suspects in black Scorpio fleeing south after targeting cash transit van. Gunshots reported, 0 casualties.',
    commandDirective: 'Establish multi-station highway spike barriers at Manvi and Shahapur toll checkpoints. Deploy armed QRT strike teams.',
    activeQrtDispatched: true,
    status: 'ACTIVE',
  },
  {
    id: 'ESC-2026-10',
    level: 'LEVEL-3 (DISTRICT EMERGENCY)',
    title: 'Commercial Cyber Banking Extortion Ring Raids',
    location: 'Indiranagar 100ft Road & BLR Traffic Corridor',
    district: 'Bengaluru Urban',
    timestamp: '17:42 IST',
    description: 'Simultaneous search warrants executed across 3 illegal call centers. 12 server racks and ₹1.2 Cr in cold wallets seized.',
    commandDirective: 'Maintain cyber forensics perimeter and execute immediate frozen asset subpoenas with State Cyber Crime Cell.',
    activeQrtDispatched: false,
    status: 'ACTIVE',
  },
];

export default function SupervisorEscalationsPage() {
  const { tick, lastUpdated } = useSupervisorTelemetry();
  const [escalations, setEscalations] = useState<EscalationAlert[]>(INITIAL_ESCALATIONS);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetDistrict, setTargetDistrict] = useState('ALL');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setBroadcastSuccess(
      `Pushed Level-4 Flash Command Alert to 142 MDT Units in scope: "${targetDistrict}"`
    );
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSuccess(''), 5000);
  };

  const handleDeployQrt = (id: string) => {
    setEscalations((prev) =>
      prev.map((esc) =>
        esc.id === id ? { ...esc, activeQrtDispatched: true } : esc
      )
    );
    setBroadcastSuccess('Mobilized 2 KSRP Quick Reaction Strike Battalions!');
    setTimeout(() => setBroadcastSuccess(''), 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Emergency Broadcast & QRT Mobilization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Karnataka State Police · Tactical Interventions, Critical Alerts & Statewide Flash Directives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {escalations.length} Active Critical Alerts
          </span>
        </div>
      </div>

      {/* ── ACTION NOTIFICATION ── */}
      {broadcastSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{broadcastSuccess}</span>
        </div>
      )}

      {/* ── 2-COLUMN ESCALATIONS CONSOLE (LIGHT THEME) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Active Escalation Incidents */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {escalations.map((esc) => (
            <div
              key={esc.id}
              className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                  {esc.level}
                </span>
                <span className="text-slate-400 font-mono">{esc.timestamp}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{esc.title}</h3>
                <p className="text-slate-500 mt-1 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  {esc.location} ({esc.district})
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-[11px] leading-relaxed">
                <span className="text-slate-500 font-semibold">Incident Narrative:</span>
                <p className="text-slate-800">{esc.description}</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col gap-1 text-[11px] leading-relaxed">
                <span className="text-blue-700 font-bold">Command Directive:</span>
                <p className="text-blue-950 font-medium">{esc.commandDirective}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-slate-500">
                  Status: <strong className="text-rose-600">{esc.status}</strong>
                </span>

                {esc.activeQrtDispatched ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    KSRP Strike Team Mobilized
                  </span>
                ) : (
                  <button
                    onClick={() => handleDeployQrt(esc.id)}
                    className="px-4 py-2 rounded-full bg-slate-900 hover:scale-105 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Deploy Armed QRT Strike Unit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: High-Priority Emergency Broadcast Form */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              MDT BROADCAST DISPATCHER
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Push Emergency Flash Directive
            </h3>
          </div>

          <form onSubmit={handleBroadcast} className="flex flex-col gap-3">
            <div>
              <label className="text-slate-600 block mb-1 font-semibold text-[11px]">Scope / Precinct:</label>
              <select
                value={targetDistrict}
                onChange={(e) => setTargetDistrict(e.target.value)}
                className="w-full px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="ALL">All 142 Active Units Statewide</option>
                <option value="Bengaluru Urban">Bengaluru Urban Command</option>
                <option value="Raichur">Raichur & Kalaburagi Axis</option>
                <option value="Highway Interceptors">Highway Patrol Units Only</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold text-[11px]">Direct Executive Message:</label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g. ALL UNITS: Armed suspects fleeing south on NH-50. Establish spike barriers immediately..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black/5 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-slate-900 hover:scale-105 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmit Flash MDT Broadcast</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
