'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users, Search, Filter, ShieldAlert, AlertTriangle, ArrowRight,
  RefreshCw, Car, MapPin, Bookmark, UserCheck, Shield, Eye,
  Fingerprint, Siren, Radio, CheckCircle, FileText, Camera
} from 'lucide-react';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_REPEAT_OFFENDERS } from '@/lib/demo-data';
import { getSuspectMedia } from '@/lib/suspect-media';

function formatStatus(status = '') {
  const s = String(status).trim().replace(/_/g, ' ');
  if (!s) return 'Active Surveillance';
  if (/abscond/i.test(s)) return 'Absconding Warrant';
  if (/watchlist/i.test(s)) return 'Active Surveillance';
  if (/arrest|custody/i.test(s)) return 'In Police Custody';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SuspectWatchlistPage() {
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState('ALL'); // ALL, HIGH_RISK, WARRANTS, ABSCONDING, TRACKED
  const [trackedSuspects, setTrackedSuspects] = useState(new Set(['SUS-8842', 'SUS-7701', 'SUS-9104', 'ramesh-kumar']));

  useEffect(() => {
    async function loadSuspects() {
      setLoading(true);
      const res = await fetchWithFallback('repeat-offenders', DEMO_REPEAT_OFFENDERS);
      const raw = res?.data?.suspects || res?.data?.offenders || (Array.isArray(res?.data) ? res.data : DEMO_REPEAT_OFFENDERS?.suspects || []);
      const list = Array.isArray(raw) ? raw : (raw?.suspects || raw?.offenders || []);
      setSuspects(list);
      setLoading(false);
    }
    loadSuspects();
  }, []);

  const toggleTrackSuspect = (id) => {
    setTrackedSuspects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const safeSuspects = Array.isArray(suspects) ? suspects : [];

  const filtered = safeSuspects.filter(s => {
    if (!s) return false;
    const q = search.toLowerCase();
    const matchesSearch =
      (s.name || s.accused_name || '').toLowerCase().includes(q) ||
      (s.alias || '').toLowerCase().includes(q) ||
      (s.suspect_id || s.id || '').toLowerCase().includes(q) ||
      (s.primary_crime || s.crime_type || '').toLowerCase().includes(q) ||
      (s.district_name || s.district || '').toLowerCase().includes(q);

    const score = s.risk_score || s.risk || 50;
    const rawId = s.suspect_id || s.id || (s.name || '').toLowerCase().replace(/\s+/g, '-');
    const isTracked = trackedSuspects.has(rawId) || trackedSuspects.has(s.suspect_id);
    const status = (s.status || '').toLowerCase();

    let matchesFilter = true;
    if (quickFilter === 'HIGH_RISK') matchesFilter = score >= 75;
    else if (quickFilter === 'WARRANTS') matchesFilter = status.includes('abscond') || status.includes('warrant') || score >= 80;
    else if (quickFilter === 'ABSCONDING') matchesFilter = status.includes('abscond');
    else if (quickFilter === 'TRACKED') matchesFilter = isTracked;

    return matchesSearch && matchesFilter;
  });

  // Calculate Intelligence summary stats
  const totalCount = safeSuspects.length;
  const highRiskCount = safeSuspects.filter(s => (s.risk_score || s.risk || 0) >= 75).length;
  const abscondingCount = safeSuspects.filter(s => (s.status || '').toLowerCase().includes('abscond')).length;
  const trackedCount = trackedSuspects.size;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
              Suspect Surveillance Roster
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
              Karnataka State Police Intelligence Profiles · Live Recidivism Dossiers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live CCTNS Sync
          </span>
        </div>
      </div>

      {/* TOP INTELLIGENCE STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Tracked Profiles</p>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">{totalCount}</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Active intelligence entries</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest font-mono">High Threat (≥75%)</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{highRiskCount}</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Elevated recidivism risk</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">Absconding Warrants</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{abscondingCount}</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Non-bailable warrant active</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Priority Bookmarked</p>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">{trackedCount}</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Followed by your sector</p>
        </div>
      </div>

      {/* Search Bar & Interactive Quick Filter Tabs */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search suspect name, alias, ID, crime type, district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-mono transition-all"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: `All Profiles (${totalCount})` },
            { id: 'HIGH_RISK', label: `High Threat (${highRiskCount})` },
            { id: 'ABSCONDING', label: `Absconding (${abscondingCount})` },
            { id: 'TRACKED', label: `Tracked (${trackedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setQuickFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                quickFilter === tab.id
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tactical Police Intelligence Dossier Cards */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 flex items-center justify-center gap-2 font-mono text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-zinc-950 dark:text-white" /> Querying KSP Intelligence Datastore...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          No suspects matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => {
            const rawId = s.suspect_id || s.id || (s.name || '').toLowerCase().replace(/\s+/g, '-');
            const media = getSuspectMedia(s);
            const officialId = s.suspect_id || media.cctns_id || `SUS-${rawId.slice(0, 4).toUpperCase()}`;
            const encodedSlug = encodeURIComponent(s.suspect_id || rawId);
            const risk = s.risk_score || s.risk || 60;
            const statusFormatted = formatStatus(s.status);
            const isAbsconding = statusFormatted.toLowerCase().includes('abscond');
            const alias = s.alias || media.alias;
            const primaryCrime = s.primary_crime || s.crime_type || media.primary_crime;
            const lastLocation = s.last_known_location || media.last_seen;

            return (
              <div
                key={rawId}
                className="group rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  {/* TOP ROW: Mugshot, Suspect Identity, and Risk Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={media.mugshot}
                          alt={s.name || 'Suspect'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-extrabold text-base text-zinc-950 dark:text-white tracking-tight leading-snug truncate max-w-[150px]">
                          {s.name || s.accused_name || 'Suspect Profile'}
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono truncate max-w-[150px]">
                          {alias ? `"${alias}"` : officialId} · <span>{officialId}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      risk >= 80
                        ? 'bg-rose-500 text-white dark:bg-rose-600'
                        : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                    }`}>
                      {risk}% Risk
                    </span>
                  </div>

                  {/* MIDDLE: Primary Crime & Status */}
                  <div className="space-y-1 my-3">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {primaryCrime}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isAbsconding ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span>{statusFormatted}</span>
                      <span>·</span>
                      <span>{s.fir_count || s.total_cases || s.active_firs || 3} Cases</span>
                    </p>
                  </div>
                </div>

                {/* BOTTOM ROW: Location & Action Link */}
                <div className="pt-3.5 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[140px]">{lastLocation.split(',')[0]}</span>
                  </div>

                  <Link
                    href={`/dashboard/suspect/${encodedSlug}`}
                    className="text-xs font-black text-zinc-950 dark:text-white hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    View Dossier <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
