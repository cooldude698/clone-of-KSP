'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Shield, ChevronRight, AlertTriangle,
  FileText, MapPin, Phone, Clock, Activity, Eye,
  TrendingUp, Zap, Network, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { DEMO_REPEAT_OFFENDERS, DEMO_FIRS, DEMO_TRAIL } from '@/lib/demo-data';

// Slug → display name: "ramesh-kumar" → "Ramesh Kumar"
function slugToName(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function nameToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Risk level helper
function getRiskLevel(score) {
  if (score >= 85) return { label: 'CRITICAL', color: 'text-critical-500', bg: 'bg-critical-500/10', border: 'border-critical-500/30' };
  if (score >= 65) return { label: 'HIGH', color: 'text-warn-500', bg: 'bg-warn-500/10', border: 'border-warn-500/30' };
  if (score >= 40) return { label: 'MEDIUM', color: 'text-phosphor-500', bg: 'bg-phosphor-500/10', border: 'border-phosphor-500/30' };
  return { label: 'LOW', color: 'text-success-500', bg: 'bg-success-500/10', border: 'border-success-500/30' };
}

// Status helpers
function getStatusBadge(status) {
  switch (status) {
    case 'ACTIVE_WATCHLIST':
      return { label: 'Active Watchlist', color: 'text-warn-500', bg: 'bg-warn-500/10', border: 'border-warn-500/30', icon: AlertCircle };
    case 'ABSCONDING':
      return { label: 'Absconding', color: 'text-critical-500', bg: 'bg-critical-500/10', border: 'border-critical-500/30', icon: XCircle };
    case 'UNDER_SURVEILLANCE':
      return { label: 'Under Surveillance', color: 'text-phosphor-500', bg: 'bg-phosphor-500/10', border: 'border-phosphor-500/30', icon: Eye };
    case 'ARRESTED':
      return { label: 'Arrested', color: 'text-success-500', bg: 'bg-success-500/10', border: 'border-success-500/30', icon: CheckCircle };
    default:
      return { label: status, color: 'text-paper-100/50', bg: 'bg-steel-600/30', border: 'border-steel-600/50', icon: AlertCircle };
  }
}

// ─── Timeline events derived from DEMO_TRAIL
const DEMO_TIMELINE = [
  { time: '2026-07-18 14:22', event: 'ANPR sighting at Vijayanagar TTMC', type: 'sighting', camera: 'CAM-BLR-0010' },
  { time: '2026-07-18 14:35', event: 'Spotted on MG Road BATCS Signal Pole 5', type: 'sighting', camera: 'CAM-BLR-0012' },
  { time: '2026-07-18 15:10', event: 'Flagged crossing Hosur Road checkpost', type: 'alert', camera: 'CAM-BLR-0015' },
  { time: '2026-07-17 21:30', event: 'Observed near Silk Board Metro', type: 'sighting', camera: 'CAM-BLR-0009' },
  { time: '2026-07-15 10:05', event: 'Vehicle KA-01-MJ-8821 linked to FIR filed', type: 'fir', fir: 'FIR-2026-BL-4921' },
];

export default function SuspectProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug   = decodeURIComponent(params?.slug || '');
  const name   = slugToName(slug);

  // Find suspect in demo data
  const suspect = DEMO_REPEAT_OFFENDERS.suspects.find(
    (s) => nameToSlug(s.name) === slug || s.name.toLowerCase() === name.toLowerCase()
  ) || DEMO_REPEAT_OFFENDERS.suspects[0]; // fallback to first

  // Get their FIRs
  const suspectFirs = DEMO_FIRS.firs.filter(
    (f) => suspect.associated_firs?.includes(f.case_number)
  );

  const risk = getRiskLevel(suspect.risk_score);
  const status = getStatusBadge(suspect.status);
  const StatusIcon = status.icon;

  return (
    <div className="min-h-full bg-void-000 flex flex-col">

      {/* ── Page Header ── */}
      <div className="px-6 py-4 border-b border-steel-600/40 bg-steel-700/40 backdrop-blur-sm flex-shrink-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-paper-100/40 mb-3">
          <Link href="/dashboard" className="hover:text-paper-100 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/dashboard/network" className="hover:text-paper-100 transition-colors">Network Graph</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-paper-100/70">{suspect.name}</span>
        </nav>

        {/* Suspect identity bar */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-2xl ${risk.bg} border ${risk.border} flex items-center justify-center flex-shrink-0`}>
            <User className={`w-7 h-7 ${risk.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-paper-100">{suspect.name}</h1>
              {/* Alias */}
              {suspect.alias && (
                <span className="text-xs text-paper-100/50 font-mono">alias "{suspect.alias}"</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="font-mono text-xs text-paper-100/40">{suspect.suspect_id}</span>
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.color} ${status.bg} ${status.border}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
          </div>

          {/* Risk score */}
          <div className={`flex-shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl border ${risk.bg} ${risk.border}`}>
            <span className={`text-2xl font-bold font-mono ${risk.color}`}>{suspect.risk_score}</span>
            <span className="text-[9px] uppercase tracking-widest text-paper-100/40 mt-0.5">Risk Score</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${risk.color}`}>{risk.label}</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── LEFT COL: Intelligence Cards ── */}
          <div className="md:col-span-2 space-y-5">

            {/* Modus Operandi */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-phosphor-500/10 border border-phosphor-500/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-phosphor-500" />
                </div>
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Modus Operandi</h2>
              </div>
              <p className="text-paper-100/80 text-sm leading-relaxed">
                {suspect.primary_modus_operandi}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-steel-700/50 rounded-xl p-3 border border-steel-600/40">
                  <p className="text-[9px] uppercase tracking-widest text-paper-100/30 mb-1">FIRs Linked</p>
                  <p className="text-lg font-bold font-mono text-paper-100">{suspect.associated_firs?.length || 0}</p>
                </div>
                <div className="bg-steel-700/50 rounded-xl p-3 border border-steel-600/40">
                  <p className="text-[9px] uppercase tracking-widest text-paper-100/30 mb-1">Known Locations</p>
                  <p className="text-lg font-bold font-mono text-paper-100">{suspect.known_hangouts?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Associated FIRs */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-warn-500/10 border border-warn-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-warn-500" />
                </div>
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Associated FIRs</h2>
              </div>
              <div className="space-y-3">
                {suspect.associated_firs?.map((firNum, idx) => {
                  const fir = DEMO_FIRS.firs.find(f => f.case_number === firNum);
                  return (
                    <Link
                      key={`${firNum}-${idx}`}
                      href={`/dashboard/fir/${encodeURIComponent(firNum)}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-steel-700/40 border border-steel-600/40 hover:border-phosphor-500/30 hover:bg-phosphor-500/5 transition-all group"
                    >
                      <div>
                        <p className="font-mono text-sm font-bold text-phosphor-500">{firNum}</p>
                        {fir && (
                          <>
                            <p className="text-xs text-paper-100/60 mt-0.5">{fir.crime_type}</p>
                            <p className="text-xs text-paper-100/40 mt-0.5">{fir.police_station} · {fir.date_filed}</p>
                          </>
                        )}
                        {!fir && (
                          <p className="text-xs text-paper-100/40 mt-0.5">Case record on file</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-paper-100/30 group-hover:text-phosphor-500 transition-colors" />
                    </Link>
                  );
                })}
                {(!suspect.associated_firs || suspect.associated_firs.length === 0) && (
                  <p className="text-xs text-paper-100/40 py-4 text-center">No FIRs on record</p>
                )}
              </div>
            </div>

            {/* Intelligence Timeline */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-phosphor-500/10 border border-phosphor-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-phosphor-500" />
                </div>
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Intelligence Timeline</h2>
              </div>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-steel-600/40" />
                <div className="space-y-4 pl-9">
                  {DEMO_TIMELINE.map((item, i) => (
                    <div key={i} className="relative">
                      {/* Dot */}
                      <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 ${
                        item.type === 'alert'
                          ? 'bg-critical-500/30 border-critical-500'
                          : item.type === 'fir'
                          ? 'bg-warn-500/30 border-warn-500'
                          : 'bg-phosphor-500/30 border-phosphor-500'
                      }`} />
                      <p className="text-[9px] font-mono text-paper-100/30 mb-0.5">{item.time}</p>
                      <p className="text-xs text-paper-100/80">{item.event}</p>
                      {item.camera && (
                        <span className="text-[9px] font-mono text-paper-100/30">{item.camera}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COL: Quick Intel ── */}
          <div className="space-y-5">

            {/* Contact / Bio */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-paper-100 text-sm tracking-wide mb-4">Quick Intel</h2>
              <div className="space-y-3">
                {suspect.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-3.5 h-3.5 text-paper-100/30 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-paper-100/30">Known Contact</p>
                      <p className="font-mono text-xs text-paper-100/80">{suspect.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-3.5 h-3.5 text-paper-100/30 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-paper-100/30">Threat Level</p>
                    <p className={`text-xs font-bold ${risk.color}`}>{risk.label} RISK</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-3.5 h-3.5 text-paper-100/30 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-paper-100/30">AI Risk Assessment</p>
                    <p className="text-xs text-paper-100/60 leading-relaxed">
                      High recidivism probability. Active cross-district pattern detected. Immediate tracking recommended.
                    </p>
                  </div>
                </div>
              </div>

              {/* IPC Sections */}
              {suspect.ipc_sections?.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-[var(--status-critical)]/8 border border-[var(--status-critical)]/20">
                  <p className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">IPC/BNS Charges</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suspect.ipc_sections.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[var(--status-critical)]/15 border border-[var(--status-critical)]/30 text-[var(--status-critical)] text-[10px] font-mono font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Known Associates */}
              {suspect.known_associates?.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <p className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Known Associates</p>
                  <div className="space-y-1">
                    {suspect.known_associates.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-primary)] font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-warning)] shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Known Location */}
              {suspect.last_known_location && (
                <div className="mt-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <p className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Last Known Location</p>
                  <p className="text-xs text-[var(--text-primary)] font-mono">{suspect.last_known_location}</p>
                </div>
              )}

              {/* ANPR & Camera Hits */}
              <div className="mt-3 flex gap-2">
                <div className="flex-1 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
                  <p className="text-2xl font-black font-mono text-[var(--accent)]">{suspect.anpr_hits || 0}</p>
                  <p className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">ANPR Hits</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
                  <p className="text-2xl font-black font-mono text-[var(--accent)]">{suspect.camera_sightings?.length || 0}</p>
                  <p className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">Camera Sightings</p>
                </div>
              </div>

            </div>

            {/* Known Hangouts */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-3.5 h-3.5 text-phosphor-500" />
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Known Hangouts</h2>
              </div>
              <div className="space-y-2">
                {suspect.known_hangouts?.map((loc, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-steel-700/40 border border-steel-600/40">
                    <div className="w-5 h-5 rounded-full bg-phosphor-500/10 border border-phosphor-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-mono font-bold text-phosphor-500">{i + 1}</span>
                    </div>
                    <p className="text-xs text-paper-100/70">{loc}</p>
                  </div>
                ))}
                {(!suspect.known_hangouts || suspect.known_hangouts.length === 0) && (
                  <p className="text-xs text-paper-100/40 py-2">No locations on record</p>
                )}
              </div>
            </div>

            {/* Network connections */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-3.5 h-3.5 text-phosphor-500" />
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Network Links</h2>
              </div>
              {DEMO_REPEAT_OFFENDERS.suspects
                .filter(s => s.suspect_id !== suspect.suspect_id)
                .map((s) => {
                  const sr = getRiskLevel(s.risk_score);
                  return (
                    <Link
                      key={s.suspect_id}
                      href={`/dashboard/suspect/${nameToSlug(s.name)}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-steel-600/20 transition-all group mb-2"
                    >
                      <div className={`w-7 h-7 rounded-lg ${sr.bg} border ${sr.border} flex items-center justify-center flex-shrink-0`}>
                        <User className={`w-3.5 h-3.5 ${sr.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-paper-100/80 truncate">{s.name}</p>
                        <p className="text-[9px] text-paper-100/40 font-mono">{s.suspect_id}</p>
                      </div>
                      <span className={`text-[9px] font-bold font-mono ${sr.color}`}>{s.risk_score}</span>
                    </Link>
                  );
                })}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 btn-secondary text-sm w-full justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <Link
                href="/dashboard/network"
                className="flex items-center gap-2 btn-primary text-sm w-full justify-center"
              >
                <Network className="w-4 h-4" />
                View in Network Graph
              </Link>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
