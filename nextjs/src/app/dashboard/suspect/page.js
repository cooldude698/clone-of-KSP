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
    <div className="w-full max-w-7xl mx-auto space-y-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Suspect Surveillance Roster
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Karnataka State Police Intelligence Surveillance Profiles & Recidivism Dossiers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live CCTNS Sync
          </span>
        </div>
      </div>

      {/* TOP INTELLIGENCE STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tracked Profiles</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Active surveillance entries</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">High Threat (≥75%)</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{highRiskCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Elevated recidivism risk</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Absconding Warrants</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{abscondingCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Non-bailable warrant active</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Priority Bookmarked</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{trackedCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Followed by your sector</p>
        </div>
      </div>

      {/* Search Bar & Interactive Quick Filter Pills */}
      <div className="bg-white dark:bg-[#18181B] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by suspect name, alias, ID, crime type, district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-mono transition-all"
          />
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: 'ALL', label: `All Profiles (${totalCount})` },
            { id: 'HIGH_RISK', label: `High Risk (${highRiskCount})` },
            { id: 'ABSCONDING', label: `Absconding (${abscondingCount})` },
            { id: 'TRACKED', label: `Tracked (${trackedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setQuickFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                quickFilter === tab.id
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-gray-100/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tactical Police Intelligence Dossier Cards */}
      {loading ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 font-medium text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-rose-500" /> Querying KSP Intelligence Datastore...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#18181B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-sm">
          No suspects matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => {
            const rawId = s.suspect_id || s.id || (s.name || '').toLowerCase().replace(/\s+/g, '-');
            const media = getSuspectMedia(s);
            const officialId = s.suspect_id || media.cctns_id || `SUS-${rawId.slice(0, 4).toUpperCase()}`;
            const encodedSlug = encodeURIComponent(s.suspect_id || rawId);
            const risk = s.risk_score || s.risk || 60;
            const isTracked = trackedSuspects.has(rawId) || trackedSuspects.has(s.suspect_id);
            const statusFormatted = formatStatus(s.status);
            const isAbsconding = statusFormatted.toLowerCase().includes('abscond');
            const alias = s.alias || media.alias;
            const primaryCrime = s.primary_crime || s.crime_type || media.primary_crime;
            const lastLocation = s.last_known_location || media.last_seen;

            return (
              <div
                key={rawId}
                className="group rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200/90 dark:border-gray-800 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 flex flex-col justify-between h-full"
              >
                <div>
                  {/* TOP ROW: Authentic Biometric Mugshot + Track Pill Button */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      {/* Realistic Mugshot with Tactical Overlay */}
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shrink-0 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={media.mugshot}
                          alt={s.name || 'Suspect'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Biometric Status Indicator */}
                        <span className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#18181B] ${
                          isAbsconding ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                        }`} />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {officialId}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Camera className="w-3 h-3" /> {media.confidence}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors mt-0.5">
                          {s.name || s.accused_name || 'Suspect Profile'}
                        </h3>
                        {alias && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic">
                            aka &ldquo;{alias}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTrackSuspect(rawId); }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                        isTracked
                          ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{isTracked ? 'Tracked' : 'Track'}</span>
                      <Bookmark className={`w-3.5 h-3.5 ${isTracked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Modus Operandi / Primary Crime Brief */}
                  <div className="space-y-2.5 my-3">
                    <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <span>Primary Offence</span>
                        <span>{s.fir_count || s.total_cases || s.active_firs || 3} Linked FIRs</span>
                      </div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">
                        {primaryCrime}
                      </p>
                    </div>

                    {/* Threat Assessment Gauge Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                          Recidivism Threat
                        </span>
                        <span className={`font-mono ${risk >= 80 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {risk}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            risk >= 80 ? 'bg-rose-500' : risk >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${risk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Status / Last Sighted + View Dossier Button */}
                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isAbsconding ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                        {statusFormatted}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{lastLocation.split(',')[0]}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/suspect/${encodedSlug}`}
                    className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    View Dossier
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
