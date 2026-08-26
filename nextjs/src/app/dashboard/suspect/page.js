'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, UserCheck, Shield, AlertTriangle, ArrowRight, MapPin, Activity } from 'lucide-react';
import { DEMO_REPEAT_OFFENDERS } from '@/lib/demo-data';

export default function SuspectDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suspects, setSuspects] = useState(DEMO_REPEAT_OFFENDERS.suspects || []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('drishti_uploaded_suspects');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSuspects([...parsed, ...(DEMO_REPEAT_OFFENDERS.suspects || [])]);
        }
      }
    } catch (e) {
      console.warn('Could not parse stored suspects:', e);
    }
  }, []);

  const filteredSuspects = suspects.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.alias && s.alias.toLowerCase().includes(q)) ||
      (s.district_name && s.district_name.toLowerCase().includes(q)) ||
      (s.primary_modus_operandi && s.primary_modus_operandi.toLowerCase().includes(q)) ||
      (s.last_known_location && s.last_known_location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-700/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-xs font-mono font-semibold uppercase tracking-wider">
              Repeat Offender Roster
            </span>
            <span className="text-xs text-gray-400 font-mono">Karnataka State Police</span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">High-Risk Suspect Registry</h1>
          <p className="text-sm text-gray-400">Track syndicate targets, active absconders, and modus operandi profiles</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Name, Alias, MO, Location..."
            className="w-full pl-9 pr-4 py-2 bg-navy-900/80 border border-navy-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-500 transition-all"
          />
        </div>
      </div>

      {/* Suspect Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuspects.map((suspect, index) => {
          const slug = suspect.name ? suspect.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'suspect';
          return (
            <Link
              key={suspect.name || index}
              href={`/dashboard/suspect/${slug}`}
              className="group glass-card p-5 hover:border-rose-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono text-gray-400">
                    TARGET #{index + 1}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold font-mono">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>RISK: {suspect.risk_score}/100</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors mb-0.5">
                  {suspect.name}
                </h3>
                <p className="text-xs text-rose-400 font-mono mb-3">
                  Alias: &quot;{suspect.alias || 'Unknown'}&quot;
                </p>

                <div className="space-y-2 text-xs text-gray-400 bg-navy-950/60 p-3 rounded-lg border border-navy-800">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Modus Operandi:</span>
                    <span className="text-gray-200 font-medium">{suspect.primary_modus_operandi || suspect.primary_crime || 'Vehicle Theft & Burglary'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Last Known Location:</span>
                    <span className="text-gray-300 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-accent-400 shrink-0 mt-0.5" />
                      {suspect.last_known_location || 'Surveillance Zone'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-navy-800 text-[11px]">
                    <span className="text-gray-500">Active FIRs:</span>
                    <span className="font-bold text-rose-300">{suspect.active_firs || suspect.cases?.length || 1} Cases</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-rose-400 group-hover:text-rose-300 font-medium">
                <span>View Full Criminal Profile</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
