'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Search, Filter, Plus, Shield, MapPin, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS } from '@/lib/demo-data';

export default function FirRegistryPage() {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadFirs() {
      setLoading(true);
      const res = await fetchWithFallback('firs', { firs: DEMO_FIRS });
      const list = res?.data?.firs || (Array.isArray(res?.data) ? res.data : DEMO_FIRS);
      setFirs(list);
      setLoading(false);
    }
    loadFirs();
  }, []);

  const filtered = firs.filter(f => {
    const q = search.toLowerCase();
    const matchesSearch =
      (f.case_number || '').toLowerCase().includes(q) ||
      (f.crime_type || '').toLowerCase().includes(q) ||
      (f.location_name || '').toLowerCase().includes(q) ||
      (f.district_name || f.district || '').toLowerCase().includes(q);

    const matchesDistrict = districtFilter === 'ALL' || (f.district_name || f.district) === districtFilter;
    const matchesStatus = statusFilter === 'ALL' || (f.status || '') === statusFilter;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const districts = ['ALL', ...new Set(firs.map(f => f.district_name || f.district).filter(Boolean))];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">FIR Case Registry</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Official Karnataka State Police First Information Records & Live Investigation Files</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/chat"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-all flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-blue-400" />
            Ask DRISHTI AI
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--surface-1)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by FIR #, crime type, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--muted-foreground)]" />
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
          >
            <option value="ALL">All Case Statuses</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="FIR Registered">FIR Registered</option>
            <option value="Chargesheeted">Chargesheeted</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-[var(--muted-foreground)] flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" /> Loading FIR registry...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[var(--muted-foreground)] bg-[var(--surface-1)] rounded-2xl border border-[var(--border)]">
          No FIR records matched your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(fir => {
            const caseId = fir.case_number || fir.id || 'FIR-2026-UNKNOWN';
            const encodedId = encodeURIComponent(caseId);

            return (
              <Link
                key={caseId}
                href={`/dashboard/fir/${encodedId}`}
                className="group p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                      {caseId}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      fir.status === 'Chargesheeted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {fir.status || 'Under Investigation'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-[var(--foreground)] group-hover:text-blue-400 transition-colors mt-1">
                    {fir.crime_type || 'General Offence'}
                  </h3>

                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-2">
                    {fir.description || `Registered at ${(fir.district_name || fir.district || 'Karnataka')}. Live investigation tracking active.`}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border)]/50 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {fir.location_name || fir.district_name || fir.district || 'Bengaluru'}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    View File <ArrowRight className="w-3.5 h-3.5" />
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
