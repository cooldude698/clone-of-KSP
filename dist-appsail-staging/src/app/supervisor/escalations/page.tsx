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
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--status-critical)] text-white uppercase tracking-wider animate-pulse">
              EMERGENCY ESCALATION DESK
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Statewide Tactical Interventions & KSRP Mobilization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Emergency Command & Wireless Broadcast
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Statewide rapid alert broadcaster, Quick Reaction Team (QRT) requisitioning, and critical incident coordination.
          </p>
        </div>

        {/* Dynamic 3s Pulse */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-critical)] animate-ping" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">WIRELESS NET:</span>
          <span className="text-[var(--text-primary)] font-bold">142 MDTs Synced</span>
        </div>
      </div>

      {/* ── BROADCAST SUCCESS TOAST ── */}
      {broadcastSuccess && (
        <div className="p-3.5 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{broadcastSuccess}</span>
        </div>
      )}

      {/* ── SPLIT CONSOLE: ACTIVE ESCALATIONS & WIRELESS PUSH FORM ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Escalations */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Active Priority Escalation Incidents ({escalations.length})
          </span>

          <div className="flex flex-col gap-4">
            {escalations.map((esc) => (
              <div
                key={esc.id}
                className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--status-critical)]/40 shadow-sm flex flex-col gap-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[var(--status-critical)] text-white">
                      {esc.level}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">REF: {esc.id}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)]">{esc.timestamp}</span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">{esc.title}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--cyan-accent)]" />
                    <span>{esc.location}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-primary)] bg-[var(--surface-1)] p-3 rounded-xl border border-[var(--border)] leading-relaxed">
                  {esc.description}
                </p>

                <div className="p-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--text-primary)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> SP Standing Directive:
                  </span>
                  <p className="text-[11px]">{esc.commandDirective}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    Jurisdiction: <strong>{esc.district}</strong>
                  </span>

                  {esc.activeQrtDispatched ? (
                    <span className="px-3 py-1 rounded-full bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/30 font-bold text-[10px] uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> KSRP Battalion Deployed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDeployQrt(esc.id)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--status-critical)] hover:opacity-90 text-white font-bold text-[10px] uppercase transition-all shadow-sm cursor-pointer"
                    >
                      Requisition 2 QRT Battalions
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Statewide Wireless Broadcast Commander */}
        <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[var(--status-critical)] animate-pulse" /> Wireless Flash Alert
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface-1)] text-[var(--text-secondary)] font-bold">
                142 MDTs
              </span>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)]">
              Broadcast high-priority tactical directives directly to all on-duty PCR vehicles, Cheetah patrol units, and station wireless consoles in real time.
            </p>

            <form onSubmit={handleBroadcast} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
                  Target Transmission Zone:
                </label>
                <select
                  value={targetDistrict}
                  onChange={(e) => setTargetDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="ALL">Statewide All Districts (142 Patrols)</option>
                  <option value="Raichur & Kalaburagi">Raichur & Kalaburagi Corridor</option>
                  <option value="Bengaluru Urban">Bengaluru Urban Command</option>
                  <option value="Chikkamagaluru">Chikkamagaluru Range</option>
                  <option value="Vijayapura">Vijayapura Highway Belt</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
                  Flash Command Directives:
                </label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="E.g., ALL PATROLS: Intercept black Scorpio KA-05-XXXX heading south on NH-50. Initiate immediate spike strip cordon."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--status-critical)] placeholder:text-gray-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[var(--status-critical)] hover:opacity-90 text-white font-bold text-xs uppercase transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Transmit High-Priority Alert
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] mt-4">
            <span>KSP Wireless Channel 01</span>
            <span className="text-[var(--status-success)] font-bold">100% RELAY HEALTH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
