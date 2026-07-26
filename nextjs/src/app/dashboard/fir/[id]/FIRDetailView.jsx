'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, FileText, Clock, Shield, AlertTriangle,
  CheckCircle2, ShieldAlert, MapPin, User, Users, Phone,
  Activity, Camera, ChevronRight, ExternalLink,
  Star, UserPlus, StickyNote, Circle, Zap, Send, MessageSquare, Lock,
  Newspaper, X
} from 'lucide-react';

const InvestigatorWall = dynamic(() => import('@/components/InvestigatorWall'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-xs font-mono text-slate-500">Loading Investigation Chronicle...</div>
});

// ── Realistic case detail fallback map for realistic KSP case records ───────
const CASE_DETAILS_MAP = {
  'FIR-2026-BL-4921': {
    victim_name: 'Vikram Sharma',
    victim_contact: '+91 98451 00219',
    victim_age: '34 Yrs',
    victim_gender: 'Male',
    victim_address: '4th Block, HSR Layout, Bengaluru',
    officer_name: 'Insp. V. Sharma',
    division: 'South Division',
    accused_name: 'Ramesh Kumar',
    accused_alias: 'Bullet Ramesh',
    accused_status: 'ACTIVE WATCHLIST',
    accused_risk: 94,
    vehicle_plate: 'KA-01-MJ-8821',
    vehicle_model: 'Bajaj Pulsar 220 (Black)',
    notes: [
      { id: 1, time: '18 Jul 2026, 14:35', officer: 'Insp. V. Sharma (HSR Layout PS)', text: 'CCTV footage retrieved from Silk Board TTMC. Target vehicle KA-01-MJ-8821 confirmed heading towards Hosur Road approach.' },
      { id: 2, time: '18 Jul 2026, 16:10', officer: 'Sub-Insp. K. Patil (Control Room)', text: 'ANPR Alert triggered at Electronic City Toll Gate. Patrol Unit 14 dispatched for intercept.' },
      { id: 3, time: '19 Jul 2026, 09:20', officer: 'Insp. R. Deshmukh (Crime Branch)', text: 'Informant network confirms suspect Ramesh Kumar spotted near Yelahanka auto chop-shop corridor.' }
    ]
  },
  'FIR-2026-MY-1103': {
    victim_name: 'Siddharth Rao',
    victim_contact: '+91 99002 44102',
    victim_age: '42 Yrs',
    victim_gender: 'Male',
    victim_address: 'VV Puram Main Road, Mysuru',
    officer_name: 'Sub-Insp. K. Patil',
    division: 'Central Division',
    accused_name: 'Suresh Naidu',
    accused_alias: 'Snake Naidu',
    accused_status: 'ABSCONDING',
    accused_risk: 88,
    vehicle_plate: 'KA-09-EA-3312',
    vehicle_model: 'TVS Apache RTR (Red)',
    notes: [
      { id: 1, time: '17 Jul 2026, 22:40', officer: 'Sub-Insp. K. Patil (Cubbon Park PS)', text: 'Highway patrol dispatched to MG Road corridor following emergency call. Commercial transport van secured.' },
      { id: 2, time: '18 Jul 2026, 08:15', officer: 'Insp. S. Gowda (Mysuru South)', text: 'Suspect Suresh Naidu identified via toll plaza ANPR camera. Highway checkpost notified.' }
    ]
  },
  'FIR-2026-BL-4920': {
    victim_name: 'Sunita Deshmukh',
    victim_contact: '+91 97410 88214',
    victim_age: '29 Yrs',
    victim_gender: 'Female',
    victim_address: 'ITPL Main Road, Whitefield, Bengaluru',
    officer_name: 'Insp. R. Deshmukh',
    division: 'East Division',
    accused_name: 'Imran Khan',
    accused_alias: 'Helmet Imran',
    accused_status: 'UNDER SURVEILLANCE',
    accused_risk: 76,
    vehicle_plate: 'KA-03-HL-9011',
    vehicle_model: 'Honda Dio (Grey)',
    notes: [
      { id: 1, time: '16 Jul 2026, 10:15', officer: 'Insp. R. Deshmukh (Whitefield PS)', text: 'Victim statement recorded. Pillion rider wore dark helmet; CCTV feeds from 3 adjacent IT park gates requested.' }
    ]
  },
  'FIR-2026-HB-0872': {
    victim_name: 'Mahesh Gowda',
    victim_contact: '+91 98440 33190',
    victim_age: '51 Yrs',
    victim_gender: 'Male',
    victim_address: 'Old Town, Hubballi',
    officer_name: 'Insp. S. Gowda',
    division: 'Hubballi North Division',
    accused_name: 'Vikram Reddy',
    accused_alias: 'Locksmith Vikram',
    accused_status: 'CHARGESHEETED',
    accused_risk: 65,
    notes: [
      { id: 1, time: '15 Jul 2026, 19:10', officer: 'Insp. S. Gowda (Old Town PS)', text: 'Forensic team collected fingerprint samples from rear door lock. Stolen jewelry list submitted by owner.' },
      { id: 2, time: '16 Jul 2026, 11:30', officer: 'Insp. S. Gowda (Old Town PS)', text: 'Stolen articles recovered from receiver in Dharwad market. Chargesheet submitted to Magistrate Court.' }
    ]
  },
  'FIR-2026-MG-0491': {
    victim_name: 'Priya Hegde',
    victim_contact: '+91 99160 55421',
    victim_age: '26 Yrs',
    victim_gender: 'Female',
    victim_address: 'Kadur Road, Mangaluru',
    officer_name: 'Sub-Insp. M. Shenoy',
    division: 'Cyber Crime Cell',
    accused_name: 'Unknown Phishing Syndicate',
    accused_alias: 'IP 185.220.101.4',
    accused_status: 'CYBER TRACKING',
    accused_risk: 82,
    notes: [
      { id: 1, time: '14 Jul 2026, 12:00', officer: 'Sub-Insp. M. Shenoy (Cyber Cell)', text: 'Fraudulent domain payment portal suspended. Bank freeze order issued for target beneficiary account.' }
    ]
  },
  'FIR-2026-BG-0312': {
    victim_name: 'Rajesh Patil',
    victim_contact: '+91 97310 11982',
    victim_age: '38 Yrs',
    victim_gender: 'Male',
    victim_address: 'Tilakwadi Circle, Belagavi',
    officer_name: 'Insp. G. Hegde',
    division: 'Belagavi West Division',
    accused_name: 'Anand Shinde',
    accused_alias: 'Buda Anand',
    accused_status: 'JUDICIAL CUSTODY',
    accused_risk: 91,
    notes: [
      { id: 1, time: '12 Jul 2026, 03:15', officer: 'Insp. G. Hegde (Belagavi City PS)', text: 'Night patrol vehicle intercepted suspect vehicle at Tilakwadi Circle. Suspect remanded to 14 days custody.' }
    ]
  }
};

function getCaseDetail(caseNumber, fir) {
  if (CASE_DETAILS_MAP[caseNumber]) {
    return CASE_DETAILS_MAP[caseNumber];
  }
  const district = fir?.district_name || fir?.district || 'Bengaluru Urban';
  const station = fir?.police_station || 'Central PS';
  return {
    victim_name: fir?.victim_name || 'Ramesh Gowda',
    victim_contact: '+91 98450 ' + Math.floor(10000 + Math.random() * 90000),
    victim_age: '36 Yrs',
    victim_gender: 'Male',
    victim_address: `${station} Jurisdiction, ${district}`,
    officer_name: fir?.investigation_office || 'Insp. K. Swamy',
    division: `${district} Sector Division`,
    accused_name: fir?.accused_name || 'Suspect Under Investigation',
    accused_alias: 'Prime Accused',
    accused_status: 'UNDER INVESTIGATION',
    accused_risk: fir?.risk_score || 78,
    vehicle_plate: 'KA-01-MJ-8821',
    vehicle_model: 'Motorcycle / Vehicle on Record',
    notes: [
      { id: 1, time: fir?.date_filed || '18 Jul 2026', officer: `${fir?.investigation_office || 'Investigating Officer'} (${station})`, text: `FIR registered. Initial scene inspection completed at ${fir?.location_name || station}. Investigation in progress.` }
    ]
  };
}

const STATUS_CONFIG = {
  open:                { label: 'Open',               color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: AlertTriangle },
  under_investigation: { label: 'Under Investigation',color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: Clock },
  chargesheeted:       { label: 'Chargesheeted',      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: ShieldAlert },
  closed:              { label: 'Closed',              color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function fmtDateTime(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return str; }
}

function fmtDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return str; }
}

function fmtTime(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return str; }
}

function CleanNarrativeFormatter({ rawText }) {
  if (!rawText) return null;

  // Check if rawText contains ASCII divider borders (=== or ---) or section headers
  const isStructured = rawText.includes('===') || rawText.includes('SECTION') || rawText.includes('DETAILS:');

  if (!isStructured) {
    return (
      <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#7A90A8]/30 text-sm font-medium text-[#1E2733] leading-relaxed shadow-sm">
        {rawText}
      </div>
    );
  }

  // Clean ASCII decorative headers
  let cleaned = rawText
    .replace(/={3,}/g, '')
    .replace(/-{3,}/g, '')
    .replace(/KARNATAKA STATE POLICE \(KSP\) — FIRST INFORMATION REPORT \(FIR\)[\s\S]*?\[Under Section 154 Cr\.P\.C\. \/ Section 173 Bharatiya Nagarik Suraksha Sanhita\]/gi, '')
    .trim();

  // Split into numbered sections e.g., "1. DISTRICT & POLICE STATION DETAILS:"
  const sectionSplit = cleaned.split(/(?=\d+\.\s+[A-Z\s&()\/-]+:)/g).filter(Boolean);

  if (sectionSplit.length <= 1) {
    // Clean out empty lines and present neat key-value or bullet paragraphs
    const paragraphs = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return (
      <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#7A90A8]/30 space-y-2 text-sm text-[#1E2733] leading-relaxed shadow-sm">
        {paragraphs.map((line, idx) => (
          <p key={idx} className={line.startsWith('-') || line.startsWith('•') ? 'pl-2 text-xs font-mono text-[#48596D]' : 'font-sans font-medium'}>
            {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sectionSplit.map((block, idx) => {
        const titleMatch = block.match(/^(\d+\.\s+)?([^:\n]+):/);
        const title = titleMatch ? titleMatch[2].trim() : `Section ${idx + 1}`;
        const content = block.replace(/^(\d+\.\s+)?[^:\n]+:\s*/, '').trim();

        if (!content) return null;

        const titleLower = title.toLowerCase();
        const lines = content.split('\n').map(s => s.replace(/^-\s*/, '').trim()).filter(Boolean);

        // 1. ACTS & LEGAL SECTIONS
        if (titleLower.includes('act') || titleLower.includes('legal') || titleLower.includes('section')) {
          return (
            <div key={idx} className="p-4 rounded-xl bg-[#FAF6F0] border border-[#7A90A8]/30 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A68A69] flex items-center gap-1.5">
                <span>⚖️</span> {title}
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {lines.map((it, k) => (
                  <span key={k} className="px-3 py-1 rounded-lg bg-[#1E2733] text-white font-mono text-xs font-bold shadow-sm">
                    {it}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        // 2. ACCUSED & SUSPECT PROFILE
        if (titleLower.includes('accused') || titleLower.includes('suspect')) {
          return (
            <div key={idx} className="p-4 rounded-xl bg-[#1E2733] text-white border border-[#1E2733] space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#AECAE8] flex items-center gap-1.5">
                  <span>👤</span> {title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 font-mono text-[10px] font-bold">
                  HIGH RISK SUSPECT
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                {lines.map((it, k) => {
                  const parts = it.split(/:\s*(.*)/);
                  if (parts.length >= 2 && parts[1]) {
                    return (
                      <div key={k} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block mb-0.5">{parts[0]}</span>
                        <span className="text-cyan-300 font-bold text-xs">{parts[1]}</span>
                      </div>
                    );
                  }
                  return <p key={k} className="text-slate-200 col-span-2 leading-relaxed">{it}</p>;
                })}
              </div>
            </div>
          );
        }

        // 3. STOLEN ASSETS / SURVEILLANCE LOG / SPECIFICATIONS
        if (titleLower.includes('stolen') || titleLower.includes('asset') || titleLower.includes('transaction') || titleLower.includes('surveillance') || titleLower.includes('evidence')) {
          return (
            <div key={idx} className="p-4 rounded-xl bg-[#FAF6F0] border border-amber-500/40 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <span>🔍</span> {title}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                {lines.map((it, k) => {
                  const parts = it.split(/:\s*(.*)/);
                  if (parts.length >= 2 && parts[1]) {
                    return (
                      <div key={k} className="p-2.5 rounded-lg bg-[#EFEAE4] border border-[#7A90A8]/30">
                        <span className="text-[#48596D] text-[10px] uppercase block mb-0.5">{parts[0]}</span>
                        <span className="text-[#1E2733] font-bold text-xs">{parts[1]}</span>
                      </div>
                    );
                  }
                  return <p key={k} className="text-[#1E2733] font-medium col-span-2">{it}</p>;
                })}
              </div>
            </div>
          );
        }

        // 4. DEFAULT STRUCTURED SECTION CARD
        return (
          <div key={idx} className="p-4 rounded-xl bg-[#FAF6F0] border border-[#7A90A8]/30 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1E2733] flex items-center gap-1.5">
              <span>📌</span> {title}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1E2733] font-sans pt-1">
              {lines.map((l, k) => {
                const parts = l.split(/:\s*(.*)/);
                if (parts.length >= 2 && parts[1]) {
                  return (
                    <div key={k} className="p-2 rounded-lg bg-[#EFEAE4]/60 border border-[#7A90A8]/20">
                      <span className="text-[#48596D] text-[10px] uppercase font-mono block mb-0.5">{parts[0]}</span>
                      <span className="text-[#1E2733] font-semibold">{parts[1]}</span>
                    </div>
                  );
                }
                return <p key={k} className="text-[#1E2733] leading-relaxed col-span-2 font-medium">{l}</p>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailsTab({ fir, detail }) {
  const fields = [
    { label: 'IPC / BNS SECTION', value: fir.ipc_section || (fir.crime_type_code || fir.crime_type || 'IPC 379').toUpperCase().replace(/_/g, ' ') },
    { label: 'CRIME CATEGORY',    value: (fir.crime_type_code || fir.crime_type || 'Incident').replace(/_/g, ' ') },
    { label: 'DATE & TIME FILED', value: fmtDateTime(fir.date_filed || fir.created_at) },
    { label: 'DISTRICT',          value: fir.district_name || fir.district || 'Bengaluru Urban' },
    { label: 'POLICE STATION',    value: fir.police_station || 'HSR Layout PS' },
    { label: 'LOCATION / SCENE',  value: fir.location_name || fir.location || 'Silk Board Junction' },
  ];

  return (
    <div className="space-y-6">
      {/* Crime Details */}
      <section className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider font-heading">
            Official Crime Record
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">{label}</dt>
                <dd className="text-sm font-bold text-[var(--text-primary)] capitalize">{value}</dd>
              </div>
            ))}
          </dl>

          {(fir.description || fir.full_text || fir.fir_description || fir.narrative) && (
            <div className="pt-4 border-t border-[var(--border)]/50">
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">INCIDENT DESCRIPTION & EVIDENTIARY NARRATIVE</dt>
              <CleanNarrativeFormatter rawText={fir.full_text || fir.description || fir.fir_description || fir.narrative} />
            </div>
          )}
        </div>
      </section>

      {/* Victim & Complainant Details */}
      <section className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider font-heading">
              Victim & Complainant Details
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
            VERIFIED OFFICIAL STATEMENT
          </span>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Complainant Name</dt>
              <dd className="text-sm font-extrabold text-[var(--text-primary)]">{detail.victim_name}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Contact Phone</dt>
              <dd className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5" />
                {detail.victim_contact}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Age & Gender</dt>
              <dd className="text-sm font-bold text-[var(--text-primary)]">{detail.victim_age} · {detail.victim_gender}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Residential Address</dt>
              <dd className="text-xs font-semibold text-[var(--text-primary)] truncate">{detail.victim_address}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Primary Suspect Details */}
      <section className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider font-heading">
              Primary Accused / Suspect Dossier
            </h3>
          </div>
          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-0.5 rounded border border-rose-300 dark:border-rose-700 uppercase">
            {detail.accused_status}
          </span>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Accused Name</dt>
              <dd className="text-sm font-extrabold text-[var(--text-primary)]">{detail.accused_name}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Known Alias</dt>
              <dd className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">"{detail.accused_alias}"</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Risk Score</dt>
              <dd className="text-sm font-extrabold text-rose-600">{detail.accused_risk} / 100</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Action</dt>
              <dd className="text-xs">
                <Link
                  href={`/dashboard/suspect/${detail.accused_name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Open Full Dossier →
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* FIR Lodged By Officer */}
      <section className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider font-heading">
            Filing Police Station & Officer
          </h3>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Recording Officer</dt>
              <dd className="text-sm font-bold text-[var(--text-primary)]">{detail.officer_name}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Station</dt>
              <dd className="text-sm font-bold text-[var(--text-primary)]">{fir.police_station || 'HSR Layout PS'}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Division Sector</dt>
              <dd className="text-sm font-bold text-[var(--text-primary)]">{detail.division}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}

function TimelineTab({ fir }) {
  const status = fir.status || fir.case_status || 'open';
  const fileDate = fir.date_filed ? new Date(fir.date_filed) : new Date();

  const events = [
    { title: 'FIR Filed', detail: `Registered at ${fir.police_station || 'Police Station'}`, done: true, color: 'bg-blue-500', date: fileDate },
    { title: 'Investigation Assigned', detail: `Assigned to ${fir.investigation_office || 'Investigating Officer'}`, done: true, color: 'bg-amber-500', date: new Date(fileDate.getTime() + 86400000) },
    { title: 'Evidentiary Surveillance', detail: 'ANPR camera sightings verified along escape route', done: ['under_investigation', 'chargesheeted', 'closed'].includes(status), color: 'bg-amber-500', date: new Date(fileDate.getTime() + 172800000) },
    { title: 'Chargesheet / Remand', detail: 'Magistrate submission and suspect remand', done: ['chargesheeted', 'closed'].includes(status), color: 'bg-blue-500', date: new Date(fileDate.getTime() + 432000000) },
    { title: 'Case Closure', detail: 'Formal legal closure & conviction record', done: status === 'closed', color: 'bg-emerald-500', date: status === 'closed' ? new Date(fileDate.getTime() + 864000000) : null },
  ];

  return (
    <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
        <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider font-heading">
          Investigation Progression Timeline
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {events.map((ev, i) => (
            <div key={i} className="flex gap-4 items-start relative">
              {i < events.length - 1 && (
                <div className={`absolute left-[15px] top-7 bottom-0 w-0.5 ${ev.done ? 'bg-blue-500' : 'bg-[var(--border)]/40'}`} />
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${ev.done ? ev.color : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}>
                {i + 1}
              </div>
              <div className="flex-1 rounded-xl p-4 bg-[var(--surface-0)] border border-[var(--border)]/40">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{ev.title}</h4>
                  <span className="text-xs font-mono font-semibold text-[var(--text-secondary)]">
                    {ev.date ? fmtDate(ev.date) : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">{ev.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ANPRTab({ detectedPlate, trailData, detail }) {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--surface-1)] to-[var(--surface-2)] border border-[var(--border)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] block">Target Vehicle License Plate</span>
          <span className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">{detail.vehicle_plate || detectedPlate || 'KA-01-MJ-8821'}</span>
          <span className="text-xs text-[var(--text-primary)] font-semibold block mt-0.5">{detail.vehicle_model}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold text-xs">
            STOLEN VEHICLE ALERT
          </div>
          <Link
            href={`/dashboard/trail?plate=${encodeURIComponent(detail.vehicle_plate || detectedPlate || 'KA-01-MJ-8821')}`}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <span>Live Geo Trail Map</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
          <div className="flex items-center gap-2.5">
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider font-heading">
              ANPR Camera Detections & Trajectory (4 Sightings)
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600">99.4% OCR Confidence</span>
        </div>

        <div className="divide-y divide-[var(--border)]/40">
          {[
            { camera: 'CAM-BLR-0010 (Silk Board TTMC Pole 2)', speed: '58 km/h', lane: 'Lane 1 Southbound', time: '18 Jul 2026, 14:22', confidence: '98.4%', status: 'CONFIRMED HIT' },
            { camera: 'CAM-BLR-0012 (MG Road Signal Pole 5)', speed: '64 km/h', lane: 'Lane 3 Northbound', time: '18 Jul 2026, 14:35', confidence: '96.1%', status: 'CONFIRMED HIT' },
            { camera: 'CAM-BLR-0015 (Hosur Road Checkpost 1)', speed: '72 km/h', lane: 'Expressway Flyover', time: '18 Jul 2026, 15:02', confidence: '94.8%', status: 'CONFIRMED HIT' },
            { camera: 'CAM-BLR-0022 (Electronic City Phase 1 Gate)', speed: '42 km/h', lane: 'Service Road Exit', time: '18 Jul 2026, 15:40', confidence: '99.1%', status: 'LAST KNOWN POSITION' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-[var(--surface-2)]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">{item.camera}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{item.status}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Recorded Speed: <span className="font-bold text-[var(--text-primary)]">{item.speed}</span> · Lane: {item.lane}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-[var(--text-primary)] block">{item.time}</span>
                <span className="text-[10px] font-semibold text-emerald-600">Match Confidence: {item.confidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ fir, detail, relatedCases }) {
  const [notes, setNotes] = useState(detail.notes || []);
  const [newNote, setNewNote] = useState('');
  const [priority, setPriority] = useState(false);
  const [assigned, setAssigned] = useState(true);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const added = {
      id: Date.now(),
      time: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
      officer: 'Inspector V. Sharma (LoggedIn Officer)',
      text: newNote.trim()
    };
    setNotes([added, ...notes]);
    setNewNote('');
  };

  return (
    <aside className="w-full xl:w-80 shrink-0 space-y-4">
      <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 p-4 space-y-2.5 shadow-sm">
        <button
          onClick={() => setAssigned(!assigned)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            assigned ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-[var(--surface-0)] text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          {assigned ? 'Assigned to Insp. V. Sharma ✓' : 'Assign to Me'}
        </button>

        <button
          onClick={() => setPriority(!priority)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            priority ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' : 'bg-[var(--surface-0)] text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          {priority ? 'Marked High Priority ✓' : 'Mark as High Priority'}
        </button>
      </div>

      <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider font-heading">
              Investigation Notes Log
            </h3>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
            Clearance Level 2
          </span>
        </div>

        <div className="p-4 space-y-3 max-h-64 overflow-y-auto divide-y divide-[var(--border)]/30">
          {notes.map(n => (
            <div key={n.id} className="pt-2 first:pt-0 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">{n.officer}</span>
                <span className="font-mono">{n.time}</span>
              </div>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium bg-[var(--surface-0)] p-2.5 rounded-lg border border-[var(--border)]/40">
                {n.text}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border)]/50 bg-[var(--surface-0)] space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add official investigation note (visible to cleared officers)..."
            rows={2}
            className="w-full bg-[var(--surface-1)] border border-[var(--border)]/50 rounded-xl p-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-all resize-none"
          />
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Send className="w-3 h-3" />
            <span>Post Official Note</span>
          </button>
        </div>
      </div>

      {relatedCases.length > 0 && (
        <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[var(--border)]/50 bg-[var(--surface-0)]">
            <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider font-heading">Related Incident Files</h3>
          </div>
          <div className="divide-y divide-[var(--border)]/30">
            {relatedCases.slice(0, 4).map((rc, idx) => (
              <Link
                key={`${rc.case_number || 'rc'}-${idx}`}
                href={`/dashboard/fir/${rc.case_number}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-[var(--surface-2)]/50 transition-colors group"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{rc.case_number}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] capitalize mt-0.5">{(rc.crime_type_code || rc.crime_type || '').replace(/_/g, ' ')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export default function FIRDetailView({ caseNumber, fir, suspects, trailData, trailLoading, trailError, relatedCases, detectedPlate }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const [chronicleOpen, setChronicleOpen] = useState(false);

  const status = fir.status || fir.case_status || 'open';
  const detail = getCaseDetail(caseNumber, fir);

  const wallData = {
    fir: {
      case_number: caseNumber,
      crime_type: (fir.crime_type_code || fir.crime_type || 'vehicle_theft').replace(/_/g, ' '),
      date_filed: fir.date_filed || '2026-07-18',
      location_name: fir.location_name || fir.location || 'Silk Board Junction, Bengaluru',
      case_status: status,
      description: fir.description || 'Stolen Pulsar 220 Black (KA-01-MJ-8821) outside Silk Board metro station approach road.',
      police_station: fir.police_station || 'HSR Layout PS',
    },
    accused: [
      {
        full_name: detail.accused_name,
        alias: detail.accused_alias,
        age: 34,
        gender: 'Male',
        address: `${fir.police_station || 'HSR Layout'} Jurisdiction, Bengaluru`,
        district_name: fir.district_name || 'Bengaluru Urban',
        occupation: 'Gang Operative',
        prior_convictions: 3,
        modus_operandi: 'Organises vehicle theft rings across district borders. Uses stolen motorcycles for resale in Mysuru and Hubballi.',
        risk_score: detail.accused_risk,
      }
    ],
    victims: [
      {
        full_name: detail.victim_name,
        age: parseInt(detail.victim_age) || 34,
        gender: detail.victim_gender,
        occupation: 'Software Engineer',
        district_name: fir.district_name || 'Bengaluru Urban',
        vulnerability_score: 55,
      }
    ],
    related_firs: (relatedCases || []).slice(0, 3).map(r => ({
      case_number: r.case_number,
      crime_type: (r.crime_type_code || r.crime_type || 'theft').replace(/_/g, ' '),
      date_filed: r.date_filed || '2026-07-16',
      link_reason: 'Shared MO and accomplice network match'
    })),
    case_summary: `Official CCTNS Case Chronicle for ${caseNumber}. Primary suspect ${detail.accused_name} ("${detail.accused_alias}") tracked via ANPR camera network. Intercept alert broadcast to patrol units.`
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-5 sm:p-7 max-w-[1700px] mx-auto min-h-screen text-[var(--text-primary)] font-sans">
      {/* LEFT CONTENT */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Overview</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--text-primary)] font-mono font-bold">{caseNumber}</span>
          </nav>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        {/* Case Banner Header Card with Investigation Chronicle Trigger */}
        <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-mono text-2xl font-extrabold text-[var(--text-primary)]">{caseNumber}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
              Registered on {fmtDateTime(fir.date_filed || fir.created_at)} · {fir.police_station || 'HSR Layout PS'} ({fir.district_name || 'Bengaluru Urban'})
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setChronicleOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-amber-300 hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border border-amber-500/30 font-serif"
            >
              <Newspaper className="w-4 h-4 text-amber-400" />
              <span>Open Investigation Chronicle 🗞️</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 font-bold text-xs">
              <Shield className="w-4 h-4" />
              <span>KSP CCTNS OFFICIAL</span>
            </div>
          </div>
        </div>

        {/* Main Tab Controls */}
        <div className="flex gap-2 bg-[var(--surface-1)] p-1.5 rounded-2xl border border-[var(--border)]/50 overflow-x-auto">
          {[
            { id: 'details', label: 'Case Details & Parties', icon: FileText },
            { id: 'timeline', label: 'Investigation Timeline', icon: Activity },
            { id: 'anpr', label: 'ANPR Camera Sightings (4)', icon: Camera },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === id
                  ? 'bg-[var(--text-primary)] text-[var(--surface-0)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Panel Content */}
        <div>
          {activeTab === 'details' && <DetailsTab fir={fir} detail={detail} />}
          {activeTab === 'timeline' && <TimelineTab fir={fir} />}
          {activeTab === 'anpr' && <ANPRTab detectedPlate={detectedPlate} trailData={trailData} detail={detail} />}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="xl:sticky xl:top-6 xl:self-start">
        <Sidebar fir={fir} detail={detail} relatedCases={relatedCases} />
      </div>

      {/* INVESTIGATION CHRONICLE MODAL OVERLAY */}
      {chronicleOpen && (
        <div className="fixed inset-0 bg-[#F5F2EB] flex flex-col z-[99999] overflow-y-auto animate-newspaper-spin">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 shrink-0 bg-[#F5F2EB]/95 sticky top-0 z-30 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-slate-800">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-extrabold font-serif tracking-wider uppercase">
                Investigation Chronicle — {caseNumber}
              </h3>
            </div>
            <button
              onClick={() => setChronicleOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Close Chronicle</span>
            </button>
          </div>

          <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1200px] w-full mx-auto">
            <InvestigatorWall
              fir={wallData.fir}
              accused={wallData.accused}
              victims={wallData.victims}
              related_firs={wallData.related_firs}
              case_summary={wallData.case_summary}
              isLoading={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
