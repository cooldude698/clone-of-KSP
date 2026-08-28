'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Fingerprint,
  TrendingUp,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  Search,
  Activity,
  ArrowRight,
  Clock,
  Calendar,
  Zap,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';
import { useAnalystTelemetry } from '@/context/AnalystTelemetryContext';

const MO_SIGNATURES = [
  {
    id: 'MO-VT-01',
    name: 'Night Master Key Vehicle Theft Ring',
    crimeType: 'Vehicle Theft',
    leadSuspect: 'Ramesh Kumar (Bullet Ramesh)',
    aliases: ['Ramesh K.', 'Bullet Ramesh', 'R. Kumar'],
    casesLinked: 6,
    confidence: 98.4,
    timeWindow: '00:00 – 03:00 IST',
    targetVehicles: 'Royal Enfield, Bajaj Pulsar, Two-Wheelers',
    precincts: ['Raichur Suburban PS', 'BLR Central PS', 'BLR East PS', 'Bidar Market PS'],
    sections: ['Sec 379 IPC / Sec 303 BNS (Theft)', 'Sec 411 IPC (Receiving Stolen Property)'],
    description: 'Bypasses handle lock using modified spark plug T-key; loads onto inter-district tempo within 18 minutes.',
    status: 'ACTIVE RING',
  },
  {
    id: 'MO-ND-02',
    name: 'Commercial MDMA Intercept Ring',
    crimeType: 'Narcotics / NDPS',
    leadSuspect: 'Imran Khan (Chotta Imran)',
    aliases: ['Imran K.', 'Chotta Imran'],
    casesLinked: 5,
    confidence: 96.9,
    timeWindow: '21:30 – 02:00 IST',
    targetVehicles: 'White Swift Dzire, Freight Transits',
    precincts: ['BLR East PS', 'Tumakuru Town PS', 'Koppal Town PS'],
    sections: ['Sec 21(c) NDPS Act', 'Sec 29 NDPS Act (Conspiracy)'],
    description: 'Dead-drop distribution network using encrypted messaging channels and transit motel drop points along NH-48.',
    status: 'SURVEILLANCE EXPANDED',
  },
  {
    id: 'MO-BG-03',
    name: 'Rear Balcony Latch Housebreaking',
    crimeType: 'Burglary (Housebreaking)',
    leadSuspect: 'Vikram Reddy',
    aliases: ['V. Reddy', 'Bangalore Vicky'],
    casesLinked: 3,
    confidence: 94.2,
    timeWindow: '23:30 – 03:30 IST',
    targetVehicles: 'Pedestrian getaway / Unregistered auto',
    precincts: ['Chikkamagaluru Market PS'],
    sections: ['Sec 457 IPC (Lurking House-trespass)', 'Sec 380 IPC (Theft in Dwelling)'],
    description: 'Targets locked villas with unlit rear gardens; cuts aluminium window mesh with handheld shears to seize gold & cash.',
    status: 'RECURRENCE FLAGGED',
  },
  {
    id: 'MO-CB-04',
    name: 'Digital Banking Spoof & SMS Phishing',
    crimeType: 'Cybercrime',
    leadSuspect: 'Bhavani Karpe',
    aliases: ['B. Karpe', 'FinSec Admin'],
    casesLinked: 6,
    confidence: 91.8,
    timeWindow: '09:00 – 17:00 IST',
    targetVehicles: 'Virtual SIM Proxies / Remote VPNs',
    precincts: ['Chikkamagaluru Town PS', 'BLR Traffic PS', 'Tumakuru Industrial PS'],
    sections: ['Sec 66D IT Act', 'Sec 420 IPC (Cheating & Dishonesty)'],
    description: 'Sends automated SMS warning of electricity disconnection or bank KYC expiry directing to cloned payment gateway.',
    status: 'PATTERN CONFIRMED',
  },
  {
    id: 'MO-HR-05',
    name: 'Corridor Speed Commercial Tipper Hit & Run',
    crimeType: 'Hit and Run',
    leadSuspect: 'Vikram Singh',
    aliases: ['V. Singh', 'Kalaburagi Driver'],
    casesLinked: 5,
    confidence: 95.7,
    timeWindow: '12:30 – 15:30 IST',
    targetVehicles: 'Heavy Tipper / Sand Lorry',
    precincts: ['Kalaburagi Rural PS', 'Davangere Market PS'],
    sections: ['Sec 279 IPC (Rash Driving)', 'Sec 304A IPC / Sec 106 BNS'],
    description: 'High-speed collisions on state highway junctions during peak freight transit with failure to stop.',
    status: 'ACTIVE CORRIDOR',
  },
];

// Temporal Distribution Data (Hour of Day)
const TEMPORAL_HOURLY_DATA = [
  { hour: '00-03', vehicleTheft: 48, burglary: 38, narcotics: 32, assault: 14 },
  { hour: '03-06', vehicleTheft: 36, burglary: 28, narcotics: 18, assault: 8 },
  { hour: '06-09', vehicleTheft: 12, burglary: 6, narcotics: 4, assault: 18 },
  { hour: '09-12', vehicleTheft: 8, burglary: 4, narcotics: 6, assault: 22 },
  { hour: '12-15', vehicleTheft: 14, burglary: 8, narcotics: 12, assault: 36 },
  { hour: '15-18', vehicleTheft: 19, burglary: 14, narcotics: 20, assault: 29 },
  { hour: '18-21', vehicleTheft: 31, burglary: 22, narcotics: 38, assault: 44 },
  { hour: '21-24', vehicleTheft: 52, burglary: 41, narcotics: 46, assault: 38 },
];

// Repeat Offenders List
const REPEAT_OFFENDERS = [
  { name: 'Ramesh Kumar', cases: 6, primaryCrime: 'Vehicle Theft', primaryDistricts: 'Raichur, Bengaluru, Bidar', riskScore: 94, threat: 'CRITICAL' },
  { name: 'Imran Khan', cases: 5, primaryCrime: 'Narcotics NDPS', primaryDistricts: 'Bengaluru, Tumakuru, Koppal', riskScore: 96, threat: 'CRITICAL' },
  { name: 'Bhavani Karpe', cases: 6, primaryCrime: 'Cybercrime & Fraud', primaryDistricts: 'Bengaluru, Chikkamagaluru, Tumakuru', riskScore: 85, threat: 'HIGH' },
  { name: 'Vikram Singh', cases: 5, primaryCrime: 'Hit and Run', primaryDistricts: 'Kalaburagi, Davangere', riskScore: 88, threat: 'HIGH' },
  { name: 'Vikram Reddy', cases: 3, primaryCrime: 'Housebreaking', primaryDistricts: 'Chikkamagaluru', riskScore: 84, threat: 'HIGH' },
  { name: 'Mahika Ramachandran', cases: 7, primaryCrime: 'Assault & Clashes', primaryDistricts: 'Bengaluru, Raichur, Kalaburagi', riskScore: 78, threat: 'MEDIUM' },
  { name: 'Suresh Naidu', cases: 4, primaryCrime: 'Armed Robbery', primaryDistricts: 'Vijayapura, Bengaluru, Bidar', riskScore: 91, threat: 'CRITICAL' },
  { name: 'Anand Shinde', cases: 2, primaryCrime: 'Domestic Violence', primaryDistricts: 'Hassan, Vijayapura', riskScore: 90, threat: 'HIGH' },
];

export default function PatternIntelligencePage() {
  const { tick, lastUpdated, confidenceScore } = useAnalystTelemetry();
  const [selectedMo, setSelectedMo] = useState(MO_SIGNATURES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSignatures = MO_SIGNATURES.filter((mo) => {
    return (
      mo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mo.leadSuspect.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mo.crimeType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              AI CLUSTERING CORE
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Cross-FIR Modus Operandi & Latent Profiling
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Pattern & Modus Operandi (MO) Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Uncovers hidden signature patterns, repeat offender cross-jurisdiction linkages, and peak vulnerability hours.
          </p>
        </div>

        {/* Dynamic 3s Pulse indicator */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--cyan-accent)] animate-spin" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">SCANNER:</span>
          <span className="text-[var(--text-primary)] font-bold">5 Signatures Active</span>
        </div>
      </div>

      {/* ── MO CLUSTER LIST & DETAILED SIGNATURE INSPECTOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Signatures List */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
              Correlated MO Clusters
            </h2>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {filteredSignatures.length} Patterns
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search suspect, crime or MO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
            />
          </div>

          {/* Cluster Cards */}
          <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredSignatures.map((mo) => {
              const isSelected = selectedMo.id === mo.id;
              return (
                <button
                  key={mo.id}
                  onClick={() => setSelectedMo(mo)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent-glow)]'
                      : 'bg-[var(--surface-1)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--cyan-accent)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {mo.crimeType}
                    </span>
                    <span className="text-[9px] font-mono font-bold">
                      {mo.confidence}% AI MATCH
                    </span>
                  </div>
                  <h3 className="text-xs font-bold leading-snug">{mo.name}</h3>
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-80 pt-1">
                    <span>Key: {mo.leadSuspect}</span>
                    <span className="font-bold">{mo.casesLinked} FIRs Linked</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Signature Deep-Dive Dossier */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                  IDENTIFIER: {selectedMo.id} · {selectedMo.status}
                </span>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {selectedMo.name}
                </h2>
              </div>
              <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[var(--status-critical)]/15 text-[var(--status-critical)] border border-[var(--status-critical)]/30 font-bold self-start sm:self-center">
                {selectedMo.confidence}% Correlation Score
              </span>
            </div>

            {/* Suspect & Timing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Lead Suspect:</span>
                <span className="font-bold text-[var(--cyan-accent)]">{selectedMo.leadSuspect}</span>
                <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">Aliases: {selectedMo.aliases.join(', ')}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Temporal Peak Window:</span>
                <span className="font-bold text-[var(--status-warning)]">{selectedMo.timeWindow}</span>
                <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">Night Shift Vulnerability</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Target Modality:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedMo.targetVehicles}</span>
                <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">Physical Signature</div>
              </div>
            </div>

            {/* Description & MO Mechanics */}
            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-1.5 font-mono text-xs">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--cyan-accent)]" /> Modus Operandi Mechanics & Signature:
              </span>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">{selectedMo.description}</p>
            </div>

            {/* Connected Police Stations & Statutory Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-bold mb-1.5">
                  Connected PS Jurisdictions ({selectedMo.precincts.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedMo.precincts.map((ps) => (
                    <span key={ps} className="px-2 py-0.5 rounded bg-[var(--surface-0)] border border-[var(--border)] text-[10px] text-[var(--text-primary)]">
                      📍 {ps}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-bold mb-1.5">
                  Invoked Legal Sections:
                </span>
                <div className="flex flex-col gap-1 text-[11px] text-[var(--text-primary)] font-semibold">
                  {selectedMo.sections.map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-critical)]" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--text-secondary)]">Cycle Pulse: #{tick} · Synced with CCTNS</span>
            <Link
              href="/analyst/network"
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <span>Explore Syndicate Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── TEMPORAL HOURLY MATRIX & REPEAT OFFENDER MATRIX ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temporal Crime Frequency by Hour */}
        <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Temporal Crime Heat by Hour of Day
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                Crime occurrences aggregated by 3-hour shift buckets
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--cyan-accent)] font-semibold">24h Spectrum</span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TEMPORAL_HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="hour" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-0)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="vehicleTheft" fill="var(--cyan-accent)" name="Vehicle Theft" stackId="a" />
                <Bar dataKey="burglary" fill="var(--status-warning)" name="Burglary" stackId="a" />
                <Bar dataKey="narcotics" fill="var(--status-critical)" name="Narcotics" stackId="a" />
                <Bar dataKey="assault" fill="var(--status-success)" name="Assault" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repeat Offender Registry */}
        <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                Repeat Offender Correlation Matrix
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                Suspects with 3+ FIR records across Karnataka jurisdictions
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-1)] text-[var(--status-critical)] font-bold">
              {REPEAT_OFFENDERS.length} Flagged
            </span>
          </div>

          <div className="overflow-x-auto max-h-[260px] custom-scrollbar">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)] uppercase">
                  <th className="pb-2 font-semibold">Suspect Name</th>
                  <th className="pb-2 font-semibold">FIRs</th>
                  <th className="pb-2 font-semibold">Core Offense</th>
                  <th className="pb-2 font-semibold">Districts</th>
                  <th className="pb-2 font-semibold text-right">Threat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {REPEAT_OFFENDERS.map((r) => (
                  <tr key={r.name} className="hover:bg-[var(--surface-1)] transition-colors">
                    <td className="py-2 font-bold text-[var(--text-primary)]">{r.name}</td>
                    <td className="py-2 font-extrabold text-[var(--cyan-accent)]">{r.cases}</td>
                    <td className="py-2 text-[var(--text-secondary)]">{r.primaryCrime}</td>
                    <td className="py-2 text-[10px] text-[var(--text-secondary)] truncate max-w-[120px]">{r.primaryDistricts}</td>
                    <td className="py-2 text-right">
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                          r.threat === 'CRITICAL'
                            ? 'bg-[var(--status-critical)]/15 text-[var(--status-critical)]'
                            : 'bg-[var(--status-warning)]/15 text-[var(--status-warning)]'
                        }`}
                      >
                        {r.threat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
