'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Search, Filter, ShieldAlert, AlertTriangle, ArrowRight,
  RefreshCw, Car, MapPin, Bookmark, UserCheck, Shield, Eye,
  Fingerprint, Siren, Radio, CheckCircle, FileText
} from 'lucide-react';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_REPEAT_OFFENDERS } from '@/lib/demo-data';

// Tactical avatar helper with distinct styles per crime/threat
function getSuspectVisualProfile(suspect) {
  const name = suspect.name || suspect.accused_name || 'Suspect';
  const risk = suspect.risk_score || suspect.risk || 50;
  const crime = (suspect.primary_crime || suspect.crime_type || '').toLowerCase();
  
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name.slice(0, 2) || 'SP').toUpperCase();

  // Pick unique icon & badge style based on crime category
  if (crime.includes('cyber') || crime.includes('fraud')) {
    return {
      initials,
      icon: Radio,
      badge: 'Cyber Intel',
      avatarBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      avatarBorder: 'border-indigo-200 dark:border-indigo-900/60',
      avatarText: 'text-indigo-600 dark:text-indigo-400',
      ringColor: 'ring-indigo-500/30',
    };
  }
  if (crime.includes('vehicle') || crime.includes('theft')) {
    return {
      initials,
      icon: Car,
      badge: 'Auto Ring',
      avatarBg: 'bg-blue-50 dark:bg-blue-950/60',
      avatarBorder: 'border-blue-200 dark:border-blue-900/60',
      avatarText: 'text-blue-600 dark:text-blue-400',
      ringColor: 'ring-blue-500/30',
    };
  }
  if (crime.includes('robbery') || crime.includes('extortion') || crime.includes('assault')) {
    return {
      initials,
      icon: Siren,
      badge: 'Violent Crime',
      avatarBg: 'bg-rose-50 dark:bg-rose-950/60',
      avatarBorder: 'border-rose-200 dark:border-rose-900/60',
      avatarText: 'text-rose-600 dark:text-rose-400',
      ringColor: 'ring-rose-500/30',
    };
  }
  if (crime.includes('drug') || crime.includes('narcotics')) {
    return {
      initials,
      icon: Fingerprint,
      badge: 'Narcotics Syndicate',
      avatarBg: 'bg-purple-50 dark:bg-purple-950/60',
      avatarBorder: 'border-purple-200 dark:border-purple-900/60',
      avatarText: 'text-purple-600 dark:text-purple-400',
      ringColor: 'ring-purple-500/30',
    };
  }

  // Default tactical profile
  return {
    initials,
    icon: UserCheck,
    badge: 'Surveillance Target',
    avatarBg: 'bg-neutral-100 dark:bg-neutral-800',
    avatarBorder: 'border-neutral-200 dark:border-neutral-700',
    avatarText: 'text-neutral-700 dark:text-neutral-300',
    ringColor: 'ring-neutral-500/20',
  };
}

function formatStatus(status = '') {
  const s = String(status).trim().replace(/_/g, ' ');
  if (!s) return 'Active Watchlist';
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

      {/* Grid of Job-Card Style Suspect Cards */}
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
            const officialId = s.suspect_id || (rawId.startsWith('SUS-') ? rawId : `SUS-${rawId.slice(0, 4).toUpperCase()}`);
            const encodedSlug = encodeURIComponent(s.suspect_id || rawId);
            const risk = s.risk_score || s.risk || 60;
            const hangouts = Array.isArray(s.known_hangouts)
              ? s.known_hangouts.join(', ')
              : (s.known_hangouts || s.last_known_location || 'Bengaluru Transit Corridors');
            const isTracked = trackedSuspects.has(rawId) || trackedSuspects.has(s.suspect_id);
            const profile = getSuspectVisualProfile(s);
            const Icon = profile.icon;
            const statusFormatted = formatStatus(s.status);
            const isAbsconding = statusFormatted.toLowerCase().includes('abscond');

            return (
              <div
                key={rawId}
                className="group rounded-[32px] bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  {/* TOP ROW: Tactical Avatar & Category Badge + Tracked Button */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${profile.avatarBg} border ${profile.avatarBorder} flex items-center justify-center font-black text-sm ${profile.avatarText} shadow-xs relative`}>
                        {profile.initials}
                        {risk >= 80 && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-[#18181B]" />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 block leading-tight">
                          {profile.badge}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono font-medium">
                          {officialId}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTrackSuspect(rawId); }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                        isTracked
                          ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{isTracked ? 'Tracked' : 'Track'}</span>
                      <Bookmark className={`w-3.5 h-3.5 ${isTracked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Suspect Name & Alias */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {s.name || s.accused_name || 'Suspect Profile'}
                      </h3>
                    </div>

                    {s.alias && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic">
                        aka &ldquo;{s.alias}&rdquo;
                      </p>
                    )}

                    {/* Tag Pills Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 pb-1">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        risk >= 80
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : risk >= 60
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {risk >= 80 && <AlertTriangle className="w-3 h-3" />}
                        Risk {risk}%
                      </span>

                      <span className="px-3 py-1 rounded-full bg-gray-100/90 dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        {s.fir_count || s.total_cases || s.active_firs || 3} Active FIRs
                      </span>

                      <span className="px-3 py-1 rounded-full bg-gray-100/90 dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[140px]">
                        {s.primary_crime || s.crime_type || 'Vehicle Theft'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Status / Area + View Dossier Button */}
                <div className="pt-5 mt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isAbsconding ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                        {statusFormatted}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[130px]">{hangouts.split(',')[0]}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/suspect/${encodedSlug}`}
                    className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xs shrink-0 flex items-center gap-1"
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
