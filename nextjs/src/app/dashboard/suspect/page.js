'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, ShieldAlert, AlertTriangle, ArrowRight, RefreshCw, Car, MapPin } from 'lucide-react';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_REPEAT_OFFENDERS } from '@/lib/demo-data';

export default function SuspectWatchlistPage() {
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  useEffect(() => {
    async function loadSuspects() {
      setLoading(true);
      const res = await fetchWithFallback('repeat-offenders', { offenders: DEMO_REPEAT_OFFENDERS });
      const list = res?.data?.offenders || (Array.isArray(res?.data) ? res.data : DEMO_REPEAT_OFFENDERS);
      setSuspects(list);
      setLoading(false);
    }
    loadSuspects();
  }, []);

  const filtered = suspects.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      (s.name || s.accused_name || '').toLowerCase().includes(q) ||
      (s.alias || '').toLowerCase().includes(q) ||
      (s.suspect_id || s.id || '').toLowerCase().includes(q) ||
      (s.primary_crime || s.crime_type || '').toLowerCase().includes(q);

    const score = s.risk_score || s.risk || 50;
    const matchesRisk =
      riskFilter === 'ALL' ||
      (riskFilter === 'HIGH' && score >= 75) ||
      (riskFilter === 'MEDIUM' && score >= 50 && score < 75) ||
      (riskFilter === 'LOW' && score < 50);

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Repeat Offender Watchlist</h1>
            <p className="text-sm text-[var(--muted-foreground)]">KSP High-Priority Tracked Profiles, Recidivism Risk Ratings & Intelligence Dossiers</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--surface-1)] p-4 rounded-2xl border border-[var(--border)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by suspect name, alias, ID, crime type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--muted-foreground)]" />
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
          >
            <option value="ALL">All Risk Categories</option>
            <option value="HIGH">High Recidivism Risk (≥ 75%)</option>
            <option value="MEDIUM">Medium Recidivism Risk (50% – 74%)</option>
            <option value="LOW">Low Risk (&lt; 50%)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-[var(--muted-foreground)] flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-red-500" /> Loading suspect database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[var(--muted-foreground)] bg-[var(--surface-1)] rounded-2xl border border-[var(--border)]">
          No suspects matched your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => {
            const rawId = s.suspect_id || s.id || (s.name || '').toLowerCase().replace(/\s+/g, '-');
            const encodedSlug = encodeURIComponent(rawId);
            const risk = s.risk_score || s.risk || 60;
            const hangouts = Array.isArray(s.known_hangouts)
              ? s.known_hangouts.join(', ')
              : (s.known_hangouts || 'Bengaluru Transit Corridors');

            return (
              <Link
                key={rawId}
                href={`/dashboard/suspect/${encodedSlug}`}
                className="group p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-red-500/40 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                      {s.suspect_id || rawId}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                      risk >= 80
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : risk >= 60
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {risk >= 80 && <AlertTriangle className="w-3 h-3" />}
                      Risk {risk}%
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-red-400 transition-colors">
                    {s.name || s.accused_name || 'Suspect Profile'}
                  </h3>
                  {s.alias && (
                    <p className="text-xs text-amber-400 font-medium">Alias: &quot;{s.alias}&quot;</p>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-[var(--muted-foreground)]">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Primary: <strong className="text-slate-300">{s.primary_crime || s.crime_type || 'Theft / Robbery'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Hangouts: {hangouts}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border)]/50 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>FIR Count: <strong className="text-slate-200">{s.fir_count || s.total_cases || 3}</strong></span>
                  <span className="flex items-center gap-1 font-medium text-red-400 group-hover:translate-x-0.5 transition-transform">
                    Dossier <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
