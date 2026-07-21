'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Clock, Shield, AlertTriangle,
  CheckCircle2, ShieldAlert, MapPin, User, Users, Phone,
  Activity, Camera, ChevronRight, ExternalLink,
  Star, UserPlus, StickyNote, Circle, Zap
} from 'lucide-react';

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open:                { label: 'Open',               color: 'badge-critical', icon: AlertTriangle },
  under_investigation: { label: 'Under Investigation',color: 'badge-warning',  icon: Clock         },
  chargesheeted:       { label: 'Chargesheeted',      color: 'badge-warning',  icon: ShieldAlert   },
  closed:              { label: 'Closed',              color: 'badge-success',  icon: CheckCircle2  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Risk label ────────────────────────────────────────────────────────────────
function riskLabel(score) {
  if (score >= 80) return { label: 'HIGH',   color: 'text-critical-500',    bg: 'bg-critical-500/10 border-critical-500/30' };
  if (score >= 50) return { label: 'MEDIUM', color: 'text-warn-500',        bg: 'bg-warn-500/10 border-warn-500/30'         };
  return             { label: 'LOW',    color: 'text-success-500',    bg: 'bg-success-500/10 border-success-500/30'   };
}

// ── Date formatting helpers ────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}
function fmtTime(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ═══════════════════════════════════════════════════════
// TAB 1: DETAILS
// ═══════════════════════════════════════════════════════
function DetailsTab({ fir }) {
  const fields = [
    { label: 'IPC / BNS Section', value: fir.ipc_section || fir.crime_type_code?.toUpperCase()?.replace(/_/g, ' ') || '—' },
    { label: 'Crime Category',    value: (fir.crime_type_code || fir.crime_type || '—').replace(/_/g, ' ') },
    { label: 'Date & Time Filed', value: fmtDateTime(fir.date_filed || fir.created_at) },
    { label: 'District',          value: fir.district_name || fir.district || '—' },
    { label: 'Police Station',    value: fir.police_station || '—' },
    { label: 'Location / Scene',  value: fir.location || fir.crime_location || fir.area_name || '—' },
  ];

  return (
    <div className="space-y-6">
      {/* Crime Details */}
      <section className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-steel-600 bg-void-000">
          <FileText className="w-4 h-4 text-phosphor-500" />
          <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">Crime Details</h3>
        </div>
        <div className="p-5 space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-0.5">{label}</dt>
                <dd className="text-sm font-medium text-paper-100 capitalize">{value}</dd>
              </div>
            ))}
          </dl>

          {(fir.description || fir.fir_description || fir.narrative) && (
            <div className="pt-4 border-t border-steel-600">
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-2">Case Description</dt>
              <dd className="text-sm text-paper-100/80 leading-relaxed bg-steel-700/30 rounded-lg p-4 border border-steel-600/40">
                {fir.description || fir.fir_description || fir.narrative}
              </dd>
            </div>
          )}
        </div>
      </section>

      {/* Victim Details */}
      <section className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-steel-600 bg-void-000">
          <User className="w-4 h-4 text-phosphor-500" />
          <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">Victim / Complainant</h3>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-0.5">Name</dt>
              <dd className="text-sm font-medium text-paper-100">{fir.victim_name || fir.complainant_name || 'On official record'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-0.5">Contact</dt>
              <dd className="flex items-center gap-2 text-sm font-medium text-paper-100">
                {fir.victim_contact || fir.complainant_contact
                  ? <><Phone className="w-3.5 h-3.5 text-paper-100/40" />{fir.victim_contact || fir.complainant_contact}</>
                  : 'Confidential'
                }
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-0.5">Age</dt>
              <dd className="text-sm font-medium text-paper-100">{fir.victim_age || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-0.5">Gender</dt>
              <dd className="text-sm font-medium text-paper-100 capitalize">{fir.victim_gender || '—'}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* FIR Lodged By */}
      <section className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-steel-600 bg-void-000">
          <Shield className="w-4 h-4 text-phosphor-500" />
          <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">FIR Lodged By</h3>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-0.5">Recording Officer</dt>
              <dd className="text-sm font-medium text-paper-100">{fir.officer_name || fir.assigned_officer || 'On official record'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-0.5">Station</dt>
              <dd className="text-sm font-medium text-paper-100">{fir.police_station || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-paper-100/40 mb-0.5">Division</dt>
              <dd className="text-sm font-medium text-paper-100">{fir.division || fir.sub_division || '—'}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 2: TIMELINE
// ═══════════════════════════════════════════════════════
function buildTimeline(fir) {
  const filed     = fir.date_filed || fir.created_at;
  const status    = fir.status || 'open';
  const fileDate  = filed ? new Date(filed) : new Date();

  const d1 = fileDate;
  const d2 = new Date(fileDate); d2.setDate(d2.getDate() + 1);
  const d3 = new Date(fileDate); d3.setDate(d3.getDate() + 4);
  const d4 = new Date(fileDate); d4.setDate(d4.getDate() + 6);

  const events = [
    {
      date: d1,
      title: 'FIR Filed',
      detail: `Registered at ${fir.police_station || 'Police Station'}`,
      done: true,
      color: 'bg-phosphor-500',
    },
  ];

  if (['under_investigation', 'chargesheeted', 'closed'].includes(status)) {
    events.push({
      date: d2,
      title: 'Investigation Started',
      detail: `Assigned to ${fir.officer_name || fir.assigned_officer || 'Investigating Officer'}`,
      done: true,
      color: 'bg-warn-500',
    });
  }

  if (['chargesheeted', 'closed'].includes(status)) {
    events.push({
      date: d3,
      title: 'Suspect Apprehended',
      detail: 'Primary accused detained for questioning',
      done: true,
      color: 'bg-warn-500',
    });
    events.push({
      date: d4,
      title: 'Court Hearing',
      detail: 'Remand extended — bail application pending',
      done: true,
      color: 'bg-success-500',
    });
  }

  if (status === 'closed') {
    const d5 = new Date(fileDate); d5.setDate(d5.getDate() + 30);
    events.push({
      date: d5,
      title: 'Case Closed',
      detail: 'Investigation complete — chargesheet filed',
      done: true,
      color: 'bg-success-500',
    });
  } else {
    events.push({
      date: null,
      title: 'Case Closure',
      detail: 'Pending investigation completion',
      done: false,
      color: 'bg-steel-600',
    });
  }

  return events;
}

function TimelineTab({ fir }) {
  const events = buildTimeline(fir);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-steel-600 bg-void-000">
        <Activity className="w-4 h-4 text-phosphor-500" />
        <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">Case Status History</h3>
      </div>
      <div className="p-5">
        <div className="relative">
          {events.map((ev, i) => (
            <div key={i} className="relative pl-8 pb-6 last:pb-0">
              {/* Connecting line */}
              {i < events.length - 1 && (
                <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${ev.done ? 'bg-steel-600' : 'bg-steel-600/40 border-l-2 border-dashed border-steel-600/40'}`} />
              )}
              {/* Dot */}
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-void-000 flex items-center justify-center shadow-sm
                ${ev.done ? ev.color : 'bg-steel-700 border-steel-600'}`}>
                {ev.done
                  ? <div className="w-2 h-2 rounded-full bg-white/80" />
                  : <Circle className="w-3 h-3 text-paper-100/30" />
                }
              </div>

              <div className={`glass-card rounded-xl p-4 border transition-colors ${ev.done ? 'border-steel-600/50' : 'border-steel-600/20 opacity-60'}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`font-semibold text-sm ${ev.done ? 'text-paper-100' : 'text-paper-100/50'}`}>
                    {ev.title}
                  </h4>
                  <span className="font-mono text-[11px] text-paper-100/40 flex-shrink-0">
                    {ev.date ? ev.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                  </span>
                </div>
                <p className="text-xs text-paper-100/60 leading-relaxed">
                  └─ {ev.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 3: SUSPECTS
// ═══════════════════════════════════════════════════════
function SuspectCard({ node }) {
  const risk = riskLabel(node.risk_score || 0);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden border border-steel-600/50 hover:border-steel-600 transition-colors">
      <div
        className="flex items-start justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-steel-600/50 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-paper-100/60" />
          </div>
          <div>
            <p className="font-semibold text-paper-100 text-sm">{node.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${risk.bg} ${risk.color}`}>
                {risk.label} RISK
              </span>
              <span className="text-xs text-paper-100/50">Score: {node.risk_score || 0}/100</span>
            </div>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-paper-100/40 flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-steel-600/30 pt-4 space-y-3">
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-paper-100/40 mb-0.5">Total FIRs</dt>
              <dd className="text-sm font-bold text-paper-100">{node.total_firs}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-paper-100/40 mb-0.5">Active Since</dt>
              <dd className="text-sm font-medium text-paper-100">{fmtDate(node.first_crime_date)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[10px] uppercase tracking-widest text-paper-100/40 mb-1">Crime Types</dt>
              <dd className="flex flex-wrap gap-1.5">
                {(node.crime_types || []).map((ct) => (
                  <span key={ct} className="text-[10px] px-2 py-0.5 rounded bg-steel-600/50 text-paper-100/70 capitalize">
                    {ct.replace(/_/g, ' ')}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <Link
            href={`/dashboard/network`}
            className="flex items-center gap-2 text-xs font-semibold text-phosphor-500 hover:text-phosphor-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View in Network Graph
          </Link>
        </div>
      )}
    </div>
  );
}

function SuspectsTab({ suspects }) {
  if (!suspects.length) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Users className="w-12 h-12 text-paper-100/20 mx-auto mb-3" />
        <p className="text-paper-100/50 text-sm">No linked suspects found in the network graph.</p>
        <p className="text-paper-100/30 text-xs mt-1">Network graph data may not include this case number yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-sm font-semibold text-paper-100/60 uppercase tracking-wider">
          {suspects.length} Linked Suspect{suspects.length !== 1 ? 's' : ''} (from network graph)
        </h3>
      </div>
      {suspects.map((s) => (
        <SuspectCard key={s.id} node={s} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 4: ANPR
// ═══════════════════════════════════════════════════════
function ANPRTab({ plate, trailData, trailLoading, trailError, caseNumber }) {
  if (!plate) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Camera className="w-12 h-12 text-paper-100/20 mx-auto mb-3" />
        <p className="text-paper-100/50 text-sm">No vehicle plate number detected in FIR description.</p>
        <p className="text-paper-100/30 text-xs mt-1">Plate numbers matching KA-XX-XX-XXXX pattern are auto-extracted.</p>
      </div>
    );
  }

  if (trailLoading) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-phosphor-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-paper-100/50 text-sm">Scanning ANPR network for {plate}…</p>
      </div>
    );
  }

  if (trailError || !trailData.length) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Camera className="w-12 h-12 text-paper-100/20 mx-auto mb-3" />
        <p className="text-paper-100/50 text-sm font-semibold">Vehicle: <span className="font-mono text-phosphor-500">{plate}</span></p>
        <p className="text-paper-100/40 text-xs mt-2">{trailError || 'No ANPR sightings recorded for this vehicle.'}</p>
      </div>
    );
  }

  const first = trailData[0];
  const last  = trailData[trailData.length - 1];

  return (
    <div className="space-y-4">
      {/* Vehicle summary */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-paper-100/40 mb-1">Target Vehicle</p>
            <p className="font-mono text-lg font-bold text-phosphor-500">{plate}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-widest text-paper-100/40 mb-1">Total Sightings</p>
            <p className="text-2xl font-black font-mono text-paper-100">{trailData.length}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-steel-600">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-paper-100/40">First Seen</p>
            <p className="text-sm font-medium text-paper-100">{fmtTime(first?.timestamp)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-paper-100/40">Last Seen</p>
            <p className="text-sm font-medium text-paper-100">{fmtTime(last?.timestamp)}</p>
          </div>
        </div>
      </div>

      {/* Sightings list */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-steel-600 bg-void-000 flex items-center gap-3">
          <Activity className="w-4 h-4 text-phosphor-500" />
          <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">ANPR Sightings Timeline</h3>
        </div>
        <div className="divide-y divide-steel-600/30">
          {trailData.map((hop, i) => (
            <div key={hop.hop || i} className="flex items-start gap-4 p-4 hover:bg-steel-600/10 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                ${i === 0 ? 'bg-success-500/20 text-success-500' : i === trailData.length - 1 ? 'bg-critical-500/20 text-critical-500' : 'bg-phosphor-500/20 text-phosphor-500'}`}>
                {hop.hop || i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-paper-100 text-sm leading-snug">{hop.camera_name}</p>
                  <span className="font-mono text-xs text-paper-100/50 flex-shrink-0">{fmtTime(hop.timestamp)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-paper-100/50">
                  <span className="flex items-center gap-1 text-success-500/80">
                    <Zap className="w-3 h-3" />
                    {hop.confidence}% confidence
                  </span>
                  {hop.distance_from_crime_km != null && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {hop.distance_from_crime_km} km from crime scene
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link to full trail page */}
      <Link
        href={`/dashboard/trail?plate=${encodeURIComponent(plate)}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-steel-600 hover:border-phosphor-500/50 hover:bg-phosphor-500/5 text-paper-100/70 hover:text-phosphor-500 text-sm font-semibold transition-all"
      >
        <ExternalLink className="w-4 h-4" />
        Open Full Geo-Trail View
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════
function Sidebar({ fir, relatedCases }) {
  const [note, setNote]         = useState('');
  const [priority, setPriority] = useState(false);
  const [assigned, setAssigned] = useState(false);

  return (
    <aside className="w-full xl:w-80 flex-shrink-0 space-y-4">
      {/* Quick Stats */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-steel-600 bg-void-000">
          <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">Quick Stats</h3>
        </div>
        <dl className="p-5 space-y-3">
          {[
            { label: 'Crime Type',      value: (fir.crime_type_code || fir.crime_type || '—').replace(/_/g, ' '), capitalize: true },
            { label: 'District',        value: fir.district_name || fir.district || '—' },
            { label: 'Police Station',  value: fir.police_station || '—' },
            { label: 'Location',        value: fir.location || fir.crime_location || fir.area_name || '—' },
            { label: 'Date Filed',      value: fmtDate(fir.date_filed || fir.created_at) },
          ].map(({ label, value, capitalize }) => (
            <div key={label} className="flex items-start gap-2">
              <dt className="text-[10px] uppercase tracking-widest text-paper-100/40 w-28 flex-shrink-0 pt-0.5">{label}</dt>
              <dd className={`text-xs font-medium text-paper-100 ${capitalize ? 'capitalize' : ''} leading-relaxed`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Actions */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-steel-600 bg-void-000">
          <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">Actions</h3>
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={() => setAssigned(!assigned)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${assigned ? 'bg-success-500/20 text-success-500 border border-success-500/30' : 'bg-steel-600/30 text-paper-100/70 hover:bg-steel-600/50 border border-steel-600/30'}`}
          >
            <UserPlus className="w-4 h-4" />
            {assigned ? 'Assigned to Me ✓' : 'Assign to Me'}
          </button>
          <button
            onClick={() => setPriority(!priority)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${priority ? 'bg-warn-500/20 text-warn-500 border border-warn-500/30' : 'bg-steel-600/30 text-paper-100/70 hover:bg-steel-600/50 border border-steel-600/30'}`}
          >
            <Star className="w-4 h-4" />
            {priority ? 'Priority Marked ✓' : 'Mark as Priority'}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-steel-600 bg-void-000">
          <StickyNote className="w-4 h-4 text-phosphor-500" />
          <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">Investigation Notes</h3>
        </div>
        <div className="p-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your notes here… (local only, not saved)"
            rows={4}
            className="w-full bg-steel-700/30 border border-steel-600/40 rounded-lg p-3 text-sm text-paper-100 placeholder-paper-100/30 focus:outline-none focus:border-phosphor-500/50 resize-none transition-colors leading-relaxed"
          />
          {note && (
            <p className="text-[10px] text-paper-100/30 mt-1 text-right">{note.length} chars — session only</p>
          )}
        </div>
      </div>

      {/* Related Cases */}
      {relatedCases.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-steel-600 bg-void-000">
            <h3 className="font-semibold text-paper-100 text-sm uppercase tracking-wider">Related Cases</h3>
          </div>
          <div className="divide-y divide-steel-600/30">
            {relatedCases.slice(0, 5).map((rc) => (
              <Link
                key={rc.case_number}
                href={`/dashboard/fir/${rc.case_number}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-steel-600/10 transition-colors group"
              >
                <div>
                  <p className="font-mono text-xs font-semibold text-phosphor-500 group-hover:text-phosphor-400">{rc.case_number}</p>
                  <p className="text-[11px] text-paper-100/50 capitalize mt-0.5">{(rc.crime_type_code || rc.crime_type || '').replace(/_/g, ' ')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-paper-100/20 group-hover:text-paper-100/60 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN FIRDetailView
// ═══════════════════════════════════════════════════════
const TABS = [
  { id: 'details',   label: 'Details',   icon: FileText },
  { id: 'timeline',  label: 'Timeline',  icon: Activity },
  { id: 'suspects',  label: 'Suspects',  icon: User     },
  { id: 'anpr',      label: 'ANPR',      icon: Camera   },
];

export default function FIRDetailView({ caseNumber, fir, suspects, trailData, trailLoading, trailError, relatedCases, detectedPlate }) {
  const router      = useRouter();
  const [activeTab, setActiveTab] = useState('details');

  const status    = fir.status || fir.case_status || 'open';
  const dateLabel = fmtDateTime(fir.date_filed || fir.created_at);

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 max-w-[1600px] mx-auto animate-fade-in">

      {/* LEFT — Main content */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Breadcrumb + Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs text-paper-100/40">
            <Link href="/dashboard" className="hover:text-paper-100 transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard/map" className="hover:text-paper-100 transition-colors">Crime Map</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-paper-100/70 font-mono">{caseNumber}</span>
          </nav>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-medium text-paper-100/60 hover:text-paper-100 transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Header card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-mono text-xl font-bold text-paper-100">{caseNumber}</h1>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm text-paper-100/50">
                Filed: <span className="text-paper-100/80">{dateLabel}</span>
              </p>
              <p className="text-sm text-paper-100/50 capitalize mt-0.5">
                Crime: <span className="text-paper-100/80">{(fir.crime_type_code || fir.crime_type || 'Unknown').replace(/_/g, ' ')}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-steel-600/30 border border-steel-600/50">
              <Shield className="w-4 h-4 text-phosphor-500" />
              <span className="text-xs font-semibold text-paper-100/70">KSP DRISHTI</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex bg-steel-600/20 p-1 rounded-xl border border-steel-600/30 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0
                ${activeTab === id
                  ? 'bg-steel-700 text-paper-100 shadow-sm border border-steel-600/50'
                  : 'text-paper-100/50 hover:text-paper-100'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'suspects' && suspects.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-phosphor-500/20 text-phosphor-500 text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {suspects.length}
                </span>
              )}
              {id === 'anpr' && trailData.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-success-500/20 text-success-500 text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {trailData.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'details'  && <DetailsTab fir={fir} />}
          {activeTab === 'timeline' && <TimelineTab fir={fir} />}
          {activeTab === 'suspects' && <SuspectsTab suspects={suspects} />}
          {activeTab === 'anpr'     && (
            <ANPRTab
              plate={detectedPlate}
              trailData={trailData}
              trailLoading={trailLoading}
              trailError={trailError}
              caseNumber={caseNumber}
            />
          )}
        </div>
      </div>

      {/* RIGHT — Sticky sidebar */}
      <div className="xl:sticky xl:top-6 xl:self-start">
        <Sidebar fir={fir} relatedCases={relatedCases} />
      </div>
    </div>
  );
}
