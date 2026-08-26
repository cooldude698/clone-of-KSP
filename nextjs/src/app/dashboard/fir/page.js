'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, FileText, Shield, ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DEMO_FIRS } from '@/lib/demo-data';

export default function FIRDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const staticFirs = DEMO_FIRS?.firs || [];
  const [firs, setFirs] = useState(staticFirs);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('drishti_uploaded_firs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFirs([...parsed, ...staticFirs]);
        }
      }
    } catch (e) {
      console.warn('Could not parse stored FIRs:', e);
    }
  }, []);

  const filteredFirs = firs.filter(f => {
    const q = searchTerm.toLowerCase();
    return (
      (f.case_number && f.case_number.toLowerCase().includes(q)) ||
      (f.crime_type && f.crime_type.toLowerCase().includes(q)) ||
      (f.district_name && f.district_name.toLowerCase().includes(q)) ||
      (f.accused_name && f.accused_name.toLowerCase().includes(q)) ||
      (f.police_station && f.police_station.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-700/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-accent-500/20 text-accent-300 text-xs font-mono font-semibold uppercase tracking-wider">
              CCTNS Master Directory
            </span>
            <span className="text-xs text-gray-400 font-mono">Karnataka State Police</span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">FIR Incident Register</h1>
          <p className="text-sm text-gray-400">Complete, indexed list of First Information Reports across all 31 districts</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FIR#, Crime, District, Suspect..."
            className="w-full pl-9 pr-4 py-2 bg-navy-900/80 border border-navy-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-500 transition-all"
          />
        </div>
      </div>

      {/* FIR Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFirs.map((fir, index) => (
          <Link
            key={fir.case_number || index}
            href={`/dashboard/fir/${fir.case_number}`}
            className="group glass-card p-5 hover:border-accent-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono text-accent-300 font-bold">
                  #{index + 1} • {fir.case_number}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  fir.status === 'chargesheeted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  fir.status === 'open' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {fir.status ? fir.status.toUpperCase() : 'INVESTIGATING'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-accent-300 transition-colors mb-1">
                {fir.crime_type || fir.crime_type_code || 'Crime Offence'}
              </h3>

              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {fir.description || 'Registered under IPC / BNS sections at station CEN command.'}
              </p>

              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">District:</span>
                  <span className="text-gray-200 font-medium">{fir.district_name || 'Bengaluru'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Police Station:</span>
                  <span className="text-gray-200 font-medium truncate max-w-[180px]">{fir.police_station || 'Central PS'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Accused/Suspect:</span>
                  <span className="text-rose-300 font-semibold">{fir.accused_name || fir.suspect_name || 'Under Investigation'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-accent-400 group-hover:text-accent-300 font-medium">
              <span>View Legal Dossier</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
