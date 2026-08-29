'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, Search, Filter, ShieldAlert, AlertTriangle, ArrowRight,
  RefreshCw, Car, MapPin, Bookmark, UserCheck, Shield, Eye,
  Fingerprint, Siren, Radio, CheckCircle, FileText, Camera,
  SlidersHorizontal, ChevronDown, MoreVertical, LayoutGrid, LayoutList,
  Sparkles, ExternalLink, ShieldCheck, Lock, AlertCircle, Check, X,
  UserPlus, PlusCircle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_REPEAT_OFFENDERS, DEMO_FIRS } from '@/lib/demo-data';
import { getSuspectMedia } from '@/lib/suspect-media';

function formatStatus(status = '') {
  const s = String(status).trim().replace(/_/g, ' ');
  if (!s) return 'Active Surveillance';
  if (/abscond/i.test(s)) return 'Absconding';
  if (/watchlist/i.test(s)) return 'Active Surveillance';
  if (/arrest|custody/i.test(s)) return 'In Custody';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getCriminalRole(suspect, media) {
  const crime = (suspect.primary_crime || suspect.crime_type || media?.primary_crime || '').toLowerCase();
  if (crime.includes('vehicle') || crime.includes('theft')) return 'INTER-DISTRICT AUTO THEFT KINGPIN';
  if (crime.includes('cyber') || crime.includes('fraud') || crime.includes('crypto')) return 'CYBER EXTORTION & PHISHING OPERATOR';
  if (crime.includes('robbery') || crime.includes('extortion')) return 'ARMED HEIST & EXTORTION SYNDICATE';
  if (crime.includes('murder') || crime.includes('homicide')) return 'HABITUAL CONTRACT ENFORCER';
  if (crime.includes('burglary') || crime.includes('gold')) return 'RESIDENTIAL BURGLARY SYNDICATE';
  if (crime.includes('narcotics') || crime.includes('drug') || crime.includes('cannabis')) return 'COMMERCIAL DRUG TRAFFICKING RING';
  if (crime.includes('arms') || crime.includes('weapon')) return 'ILLICIT ARMS PROCUREMENT NEXUS';
  return 'HABITUAL OFFENDER / REPEAT CONSPIRATOR';
}

export default function SuspectWatchlistPage() {
  const [suspects, setSuspects] = useState([]);
  const [customSuspects, setCustomSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, HIGH_RISK, WARRANTS, ABSCONDING, TRACKED
  const [selectedCrimeFilter, setSelectedCrimeFilter] = useState('ALL');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('THREAT_DESC');
  const [viewMode, setViewMode] = useState('grid');
  const [trackedSuspects, setTrackedSuspects] = useState(new Set(['SUS-8842', 'SUS-7701', 'SUS-9104', 'ramesh-kumar']));
  
  // Add Suspect Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSuspect, setNewSuspect] = useState({
    name: '',
    alias: '',
    gender: 'Male',
    primary_crime: 'Vehicle Theft & Larceny',
    district_name: 'Bengaluru Urban',
    risk_score: 82,
    status: 'ACTIVE_WATCHLIST',
    last_known_location: 'Silk Board TTMC, Bengaluru',
    vehicle: '',
    associated_fir: 'FIR-2026-BL-9901'
  });

  // Load custom suspects from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ksp_custom_suspects');
      if (stored) {
        setCustomSuspects(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

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

  const toggleTrackSuspect = (id, e) => {
    if (e) e.stopPropagation();
    setTrackedSuspects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Combine initial suspects with custom added suspects
  const allSuspects = useMemo(() => {
    const combined = [...(Array.isArray(suspects) ? suspects : []), ...customSuspects];
    return combined;
  }, [suspects, customSuspects]);

  // Handle Add New Suspect Form Submission
  const handleCreateSuspect = (e) => {
    e.preventDefault();
    if (!newSuspect.name.trim()) return;

    const autoId = `SUS-${Math.floor(8000 + Math.random() * 1900)}`;
    const created = {
      ...newSuspect,
      id: autoId,
      suspect_id: autoId,
      total_cases: 1,
      associated_firs: [newSuspect.associated_fir || 'FIR-2026-BL-9901'],
      known_hangouts: [newSuspect.last_known_location || 'Bengaluru Central'],
      anpr_hits: 1
    };

    const updated = [created, ...customSuspects];
    setCustomSuspects(updated);
    try {
      localStorage.setItem('ksp_custom_suspects', JSON.stringify(updated));
    } catch (_) {}

    setIsAddModalOpen(false);
    setNewSuspect({
      name: '',
      alias: '',
      gender: 'Male',
      primary_crime: 'Vehicle Theft & Larceny',
      district_name: 'Bengaluru Urban',
      risk_score: 82,
      status: 'ACTIVE_WATCHLIST',
      last_known_location: 'Silk Board TTMC, Bengaluru',
      vehicle: '',
      associated_fir: 'FIR-2026-BL-9901'
    });
  };

  // Extract unique crime types and districts for filters
  const crimeTypes = useMemo(() => {
    const set = new Set();
    allSuspects.forEach(s => {
      const c = s.primary_crime || s.crime_type;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [allSuspects]);

  const districts = useMemo(() => {
    const set = new Set();
    allSuspects.forEach(s => {
      const d = s.district_name || s.district;
      if (d) set.add(d);
    });
    return Array.from(set);
  }, [allSuspects]);

  const filtered = useMemo(() => {
    return allSuspects.filter(s => {
      if (!s) return false;
      const q = search.toLowerCase();
      const media = getSuspectMedia(s);
      const matchesSearch =
        (s.name || s.accused_name || '').toLowerCase().includes(q) ||
        (s.alias || media.alias || '').toLowerCase().includes(q) ||
        (s.suspect_id || s.id || media.cctns_id || '').toLowerCase().includes(q) ||
        (s.primary_crime || s.crime_type || media.primary_crime || '').toLowerCase().includes(q) ||
        (s.district_name || s.district || '').toLowerCase().includes(q) ||
        (media.vehicle || '').toLowerCase().includes(q);

      const score = s.risk_score || s.risk || 50;
      const rawId = s.suspect_id || s.id || (s.name || '').toLowerCase().replace(/\s+/g, '-');
      const isTracked = trackedSuspects.has(rawId) || trackedSuspects.has(s.suspect_id) || trackedSuspects.has(media.cctns_id);
      const status = (s.status || '').toLowerCase();

      let matchesTab = true;
      if (activeTab === 'HIGH_RISK') matchesTab = score >= 75;
      else if (activeTab === 'WARRANTS') matchesTab = status.includes('abscond') || status.includes('warrant') || score >= 80;
      else if (activeTab === 'ABSCONDING') matchesTab = status.includes('abscond');
      else if (activeTab === 'TRACKED') matchesTab = isTracked;

      let matchesCrime = selectedCrimeFilter === 'ALL' || (s.primary_crime || s.crime_type) === selectedCrimeFilter;
      let matchesDistrict = selectedDistrictFilter === 'ALL' || (s.district_name || s.district) === selectedDistrictFilter;

      return matchesSearch && matchesTab && matchesCrime && matchesDistrict;
    }).sort((a, b) => {
      const scoreA = a.risk_score || a.risk || 50;
      const scoreB = b.risk_score || b.risk || 50;
      const firsA = a.fir_count || a.total_cases || 3;
      const firsB = b.fir_count || b.total_cases || 3;
      const nameA = a.name || a.accused_name || '';
      const nameB = b.name || b.accused_name || '';

      if (sortBy === 'THREAT_DESC') return scoreB - scoreA;
      if (sortBy === 'THREAT_ASC') return scoreA - scoreB;
      if (sortBy === 'FIRS_DESC') return firsB - firsA;
      if (sortBy === 'NAME_ASC') return nameA.localeCompare(nameB);
      return 0;
    });
  }, [allSuspects, search, activeTab, selectedCrimeFilter, selectedDistrictFilter, sortBy, trackedSuspects]);

  // Statistics calculation for the Tactical Sidebar
  const totalCount = allSuspects.length;
  const highRiskCount = allSuspects.filter(s => (s.risk_score || s.risk || 0) >= 75).length;
  const abscondingCount = allSuspects.filter(s => (s.status || '').toLowerCase().includes('abscond')).length;
  const inCustodyCount = allSuspects.filter(s => (s.status || '').toLowerCase().includes('custody') || (s.status || '').toLowerCase().includes('arrest')).length;
  const activeWantedCount = totalCount - inCustodyCount;
  const trackedCount = trackedSuspects.size;
  const surveillanceCoverageRate = totalCount > 0 ? Math.round(((totalCount - abscondingCount) / totalCount) * 100) : 84;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* ─── MAIN WORKBENCH GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT MAIN SECTION (8 COLS ON DESKTOP) ── */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header Title Bar with Add Suspect Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Suspects & Persons of Interest
                </h1>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/50">
                  Live CCTNS Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Karnataka State Police Intelligence Profiles · Live Recidivism Dossiers
              </p>
            </div>

            {/* Quick Search & Add Suspect Button */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, alias, ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* + Add Suspect Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Suspect</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-zinc-800">
            {[
              { id: 'ALL', label: 'All Profiles', count: totalCount },
              { id: 'HIGH_RISK', label: 'High Threat (≥75%)', count: highRiskCount },
              { id: 'ABSCONDING', label: 'Absconding Warrants', count: abscondingCount },
              { id: 'TRACKED', label: 'Priority Watchlist', count: trackedCount },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-slate-200 dark:bg-zinc-200 dark:text-zinc-800'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filter Pills & Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Crime Type Dropdown */}
              <div className="relative">
                <select
                  value={selectedCrimeFilter}
                  onChange={e => setSelectedCrimeFilter(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none shadow-2xs"
                >
                  <option value="ALL">All Crime Categories</option>
                  {crimeTypes.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* District Dropdown */}
              <div className="relative">
                <select
                  value={selectedDistrictFilter}
                  onChange={e => setSelectedDistrictFilter(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none shadow-2xs"
                >
                  <option value="ALL">All Districts</option>
                  {districts.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none shadow-2xs"
                >
                  <option value="THREAT_DESC">Threat Score (High → Low)</option>
                  <option value="THREAT_ASC">Threat Score (Low → High)</option>
                  <option value="FIRS_DESC">Case Load (Most Active)</option>
                  <option value="NAME_ASC">Name (A → Z)</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                title="Table Ledger View"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ─── SUSPECT CARDS GRID (AUTH INDIAN PORTRAITS + TACTICAL CARDS) ─── */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold">Querying KSP CCTNS Intelligence Datastore...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-12 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No suspects matched your search or filters.</p>
              <button
                onClick={() => { setSearch(''); setActiveTab('ALL'); setSelectedCrimeFilter('ALL'); setSelectedDistrictFilter('ALL'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map(s => {
                const rawId = s.suspect_id || s.id || (s.name || '').toLowerCase().replace(/\s+/g, '-');
                const media = getSuspectMedia(s);
                const officialId = s.suspect_id || media.cctns_id || `SUS-${rawId.slice(0, 4).toUpperCase()}`;
                const encodedSlug = encodeURIComponent(s.suspect_id || rawId);
                const risk = s.risk_score || s.risk || 65;
                const statusFormatted = formatStatus(s.status);
                const isAbsconding = statusFormatted.toLowerCase().includes('abscond');
                const isInCustody = statusFormatted.toLowerCase().includes('custody');
                const alias = s.alias || media.alias;
                const primaryCrime = s.primary_crime || s.crime_type || media.primary_crime;
                const lastLocation = s.last_known_location || media.last_seen;
                const isTracked = trackedSuspects.has(rawId) || trackedSuspects.has(s.suspect_id) || trackedSuspects.has(officialId);
                const criminalRole = getCriminalRole(s, media);

                return (
                  <div
                    key={rawId}
                    className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Card Body */}
                    <div className="p-4 space-y-3.5">
                      {/* Top Action Bar */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => toggleTrackSuspect(officialId, e)}
                          title={isTracked ? "Remove from Sector Watchlist" : "Add to Sector Watchlist"}
                          className={`p-1.5 rounded-lg transition ${
                            isTracked
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isTracked ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>

                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700">
                          {officialId}
                        </span>

                        <span className={`w-2 h-2 rounded-full ${
                          isAbsconding
                            ? 'bg-rose-500 animate-ping'
                            : isInCustody
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`} />
                      </div>

                      {/* Center Avatar Feature with Status Ring */}
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="relative">
                          <div className={`w-20 h-20 rounded-full p-1 border-2 transition-transform duration-300 group-hover:scale-105 ${
                            isAbsconding
                              ? 'border-rose-500 shadow-rose-500/20 shadow-md'
                              : isInCustody
                              ? 'border-emerald-500 shadow-emerald-500/20 shadow-md'
                              : 'border-amber-500 shadow-amber-500/20 shadow-md'
                          }`}>
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={media.mugshot}
                                alt={s.name || 'Suspect'}
                                className="w-full h-full object-cover object-top"
                                loading="lazy"
                              />
                            </div>
                          </div>

                          <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[9px] font-bold text-white ${
                            isAbsconding
                              ? 'bg-rose-600'
                              : isInCustody
                              ? 'bg-emerald-600'
                              : 'bg-amber-500'
                          }`}>
                            {isAbsconding ? '!' : isInCustody ? '✓' : '●'}
                          </span>
                        </div>

                        <div>
                          <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {s.name || s.accused_name || 'Suspect Profile'}
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {alias ? `“${alias}”` : primaryCrime}
                          </p>
                        </div>
                      </div>

                      {/* Recidivism / Threat Score Bar with Segments */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-400 uppercase tracking-wider">Recidivism Index</span>
                          <span className={`font-mono ${
                            risk >= 80 ? 'text-rose-600 dark:text-rose-400' : risk >= 65 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                          }`}>
                            {risk}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                          <div className={`h-1.5 rounded-full ${risk >= 30 ? (risk >= 80 ? 'bg-rose-500' : 'bg-indigo-500') : 'bg-slate-200 dark:bg-zinc-700'}`} />
                          <div className={`h-1.5 rounded-full ${risk >= 65 ? (risk >= 80 ? 'bg-rose-500' : 'bg-indigo-500') : 'bg-slate-200 dark:bg-zinc-700'}`} />
                          <div className={`h-1.5 rounded-full ${risk >= 80 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-zinc-700'}`} />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span className="truncate max-w-[110px] flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {lastLocation.split(',')[0]}
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {s.fir_count || s.total_cases || s.active_firs || 3} Cases
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Tactical Role Banner */}
                    <div className="bg-slate-50 dark:bg-zinc-950/60 p-2.5 border-t border-slate-100 dark:border-zinc-800 text-center">
                      <p className="font-mono text-[9.5px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">
                        {criminalRole}
                      </p>
                    </div>

                    {/* Full Card Drill-Down Link Overlay */}
                    <Link
                      href={`/dashboard/suspect/${encodedSlug}`}
                      className="absolute inset-0 z-10"
                      aria-label={`Open Dossier for ${s.name}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Ledger List View */
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
              {filtered.map(s => {
                const rawId = s.suspect_id || s.id || (s.name || '').toLowerCase().replace(/\s+/g, '-');
                const media = getSuspectMedia(s);
                const officialId = s.suspect_id || media.cctns_id || `SUS-${rawId.slice(0, 4).toUpperCase()}`;
                const encodedSlug = encodeURIComponent(s.suspect_id || rawId);
                const risk = s.risk_score || s.risk || 65;
                const statusFormatted = formatStatus(s.status);
                const isAbsconding = statusFormatted.toLowerCase().includes('abscond');
                const alias = s.alias || media.alias;
                const primaryCrime = s.primary_crime || s.crime_type || media.primary_crime;

                return (
                  <Link
                    key={rawId}
                    href={`/dashboard/suspect/${encodedSlug}`}
                    className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={media.mugshot} alt={s.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {s.name || s.accused_name}
                          </p>
                          {alias && (
                            <span className="text-[11px] text-slate-400 truncate">“{alias}”</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {officialId} · {primaryCrime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAbsconding ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {statusFormatted}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {risk}% Threat
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT TACTICAL INTELLIGENCE SUMMARY PANEL (4 COLS) ── */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* Surveillance Resolution Circular Gauge Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Surveillance Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-slate-100 dark:text-zinc-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * surveillanceCoverageRate) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">TRACKING</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{surveillanceCoverageRate}%</span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 font-medium">
              {totalCount - abscondingCount} of {totalCount} active POIs verified under camera / sector grid coverage.
            </p>
          </div>

          {/* 4-Tile Metric Grid */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono px-1">
              Sector Roster Breakdown
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total POIs</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{totalCount}</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">In Custody</span>
                </div>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{inCustodyCount || 2}</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-blue-500 rounded-full" />
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase font-mono">Active Watch</span>
                </div>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">{activeWantedCount}</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-rose-500 rounded-full" />
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase font-mono">Absconding</span>
                </div>
                <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">{abscondingCount}</p>
              </div>
            </div>
          </div>

          {/* Tactical ANPR Sighting Broadcast Widget (Clean dark slate/navy card) */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live ANPR Intercept Broadcast
              </span>
              <Camera className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="bg-slate-800/80 rounded-xl p-2.5 text-xs space-y-1 border border-slate-700/60">
              <p className="font-bold text-white text-[11px] truncate">
                CAM-BLR-0045 @ Silk Board TTMC
              </p>
              <p className="text-[10.5px] text-slate-300 leading-snug">
                Plate <span className="font-mono font-bold text-indigo-300">KA-01-MJ-8821</span> matched suspect <span className="font-bold text-white">Ramesh Kumar</span> (98.4% Match).
              </p>
            </div>

            <Link
              href="/dashboard/suspect/ramesh-kumar"
              className="w-full py-1.5 rounded-lg bg-white text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-slate-100 transition shadow-2xs"
            >
              <span>Inspect Intercept Dossier</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── ADD SUSPECT MODAL ─── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full shadow-2xl p-5 sm:p-6 space-y-4 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 border-b border-slate-100 dark:border-zinc-800 pb-3 pr-8">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Enroll New Suspect to Surveillance Roster
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Register offender profile with CCTNS identifier, primary crime head, and ANPR vehicle links.
                </p>
              </div>

              <form onSubmit={handleCreateSuspect} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Suspect Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar / Ananya Hegde"
                      value={newSuspect.name}
                      onChange={e => setNewSuspect({ ...newSuspect, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Known Mob Alias / Street Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Bullet / Sharp"
                      value={newSuspect.alias}
                      onChange={e => setNewSuspect({ ...newSuspect, alias: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Primary Crime Classification</label>
                    <select
                      value={newSuspect.primary_crime}
                      onChange={e => setNewSuspect({ ...newSuspect, primary_crime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Vehicle Theft & Larceny">Vehicle Theft & Larceny (IPC § 379)</option>
                      <option value="Armed Robbery & Extortion">Armed Robbery & Extortion (IPC § 392)</option>
                      <option value="Homicide & Murder">Homicide & Murder (IPC § 302)</option>
                      <option value="Assault & Grievous Hurt">Assault & Grievous Hurt (IPC § 307)</option>
                      <option value="Cyber Fraud & Phishing">Cyber Fraud & Phishing (IT Act § 66D)</option>
                      <option value="Commercial Drug Trafficking">Commercial Drug Trafficking (NDPS § 20B)</option>
                      <option value="Illegal Firearms Trafficking">Illegal Firearms Trafficking (Arms Act § 25)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Police District / Sector</label>
                    <select
                      value={newSuspect.district_name}
                      onChange={e => setNewSuspect({ ...newSuspect, district_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Bengaluru Urban">Bengaluru Urban (Central Command)</option>
                      <option value="Kalaburagi">Kalaburagi (North-Eastern Range)</option>
                      <option value="Raichur">Raichur (Suburban Command)</option>
                      <option value="Mandya">Mandya (Southern Range)</option>
                      <option value="Chikkamagaluru">Chikkamagaluru (Western Ghats Sector)</option>
                      <option value="Belagavi">Belagavi (Northern Sector)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Surveillance Status</label>
                    <select
                      value={newSuspect.status}
                      onChange={e => setNewSuspect({ ...newSuspect, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none cursor-pointer"
                    >
                      <option value="ACTIVE_WATCHLIST">Active Surveillance</option>
                      <option value="ABSCONDING">Absconding Warrant</option>
                      <option value="IN_CUSTODY">In Police Custody</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Threat / Recidivism Score ({newSuspect.risk_score}%)</label>
                    <input
                      type="range"
                      min="30"
                      max="98"
                      value={newSuspect.risk_score}
                      onChange={e => setNewSuspect({ ...newSuspect, risk_score: Number(e.target.value) })}
                      className="w-full mt-2 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Gender</label>
                    <select
                      value={newSuspect.gender}
                      onChange={e => setNewSuspect({ ...newSuspect, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Operating Vehicle Reg No</label>
                    <input
                      type="text"
                      placeholder="e.g. KA-01-MJ-8821 (Bajaj Pulsar)"
                      value={newSuspect.vehicle}
                      onChange={e => setNewSuspect({ ...newSuspect, vehicle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Primary Linked FIR</label>
                    <input
                      type="text"
                      placeholder="e.g. FIR-2026-BL-9901"
                      value={newSuspect.associated_fir}
                      onChange={e => setNewSuspect({ ...newSuspect, associated_fir: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Last Verified Sighting / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Silk Board TTMC Parking Bay, Bengaluru"
                    value={newSuspect.last_known_location}
                    onChange={e => setNewSuspect({ ...newSuspect, last_known_location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 font-bold shadow-2xs"
                  >
                    Enroll Suspect to Roster
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
