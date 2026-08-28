'use client';

import { useState } from 'react';
import {
  Scale, BookOpen, Search, Shield, Filter,
  FileCheck, AlertTriangle, ChevronRight, CheckCircle2, Bookmark, Gavel
} from 'lucide-react';
import { motion } from 'framer-motion';

const STATUTES_DATA = [
  {
    actCode: 'IPC',
    actName: 'Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita (BNS)',
    section: '379',
    title: 'Punishment for Theft',
    crimeHead: 'Crimes Against Property',
    crimeSubHead: 'Vehicle Theft / Motor Vehicle Larceny',
    gravity: 'Non-Heinous',
    bailable: false,
    maxPunishment: 'Imprisonment up to 3 years, or fine, or both',
    avgConvictionRate: '68%',
    totalCasesActive: 1420
  },
  {
    actCode: 'IPC',
    actName: 'Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita (BNS)',
    section: '392',
    title: 'Punishment for Robbery',
    crimeHead: 'Crimes Against Property',
    crimeSubHead: 'Armed Robbery / Highway Heist',
    gravity: 'Heinous',
    bailable: false,
    maxPunishment: 'Rigorous imprisonment up to 10 years and fine; highway robbery up to 14 years',
    avgConvictionRate: '74%',
    totalCasesActive: 890
  },
  {
    actCode: 'IPC',
    actName: 'Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita (BNS)',
    section: '302',
    title: 'Punishment for Murder',
    crimeHead: 'Crimes Against Body / Violent Crime',
    crimeSubHead: 'Homicide / Murder',
    gravity: 'Heinous',
    bailable: false,
    maxPunishment: 'Death or imprisonment for life, and liability to fine',
    avgConvictionRate: '81%',
    totalCasesActive: 310
  },
  {
    actCode: 'IPC',
    actName: 'Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita (BNS)',
    section: '307',
    title: 'Attempt to Murder',
    crimeHead: 'Crimes Against Body / Violent Crime',
    crimeSubHead: 'Assault / Grievous Hurt',
    gravity: 'Heinous',
    bailable: false,
    maxPunishment: 'Imprisonment up to 10 years and fine; if hurt caused, up to imprisonment for life',
    avgConvictionRate: '71%',
    totalCasesActive: 460
  },
  {
    actCode: 'ITACT',
    actName: 'Information Technology Act, 2000',
    section: '66D',
    title: 'Cheating by Personation by Using Computer Resource',
    crimeHead: 'Cyber & Economic Crimes',
    crimeSubHead: 'Financial Fraud & Digital Phishing',
    gravity: 'Non-Heinous',
    bailable: true,
    maxPunishment: 'Imprisonment up to 3 years and fine up to 1 lakh rupees',
    avgConvictionRate: '59%',
    totalCasesActive: 620
  },
  {
    actCode: 'NDPS',
    actName: 'Narcotic Drugs and Psychotropic Substances Act, 1985',
    section: '20B',
    title: 'Contravention in Relation to Cannabis & Synthetic Contraband',
    crimeHead: 'Narcotics & Contraband',
    crimeSubHead: 'Commercial Drug Trafficking',
    gravity: 'Heinous',
    bailable: false,
    maxPunishment: 'Rigorous imprisonment 10 to 20 years and fine 1 to 2 lakh rupees',
    avgConvictionRate: '86%',
    totalCasesActive: 280
  },
  {
    actCode: 'ARMS',
    actName: 'The Arms Act, 1959',
    section: '25',
    title: 'Punishment for Possession of Unlicensed Firearms & Ammunition',
    crimeHead: 'Crimes Against Body / Violent Crime',
    crimeSubHead: 'Armed Gang & Illegal Weaponary',
    gravity: 'Heinous',
    bailable: false,
    maxPunishment: 'Imprisonment not less than 3 years but which may extend to 7 years',
    avgConvictionRate: '79%',
    totalCasesActive: 195
  }
];

export default function StatutesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAct, setSelectedAct] = useState('all');

  const filteredStatutes = STATUTES_DATA.filter(s => {
    const matchesSearch = s.section.includes(searchTerm) ||
                          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.crimeSubHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.actCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAct = selectedAct === 'all' || s.actCode === selectedAct;
    return matchesSearch && matchesAct;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-xs">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              KSP Statutory Acts & Legal Repository
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
              Bail Classifications · Statutory Penalties · Conviction Benchmarks Master
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search section (e.g. 379, 302, 66D)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-mono transition-all"
            />
          </div>

          <select
            value={selectedAct}
            onChange={(e) => setSelectedAct(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none font-mono"
          >
            <option value="all">All Statutes</option>
            <option value="IPC">IPC / BNS</option>
            <option value="NDPS">NDPS Act</option>
            <option value="ITACT">IT Act</option>
            <option value="ARMS">Arms Act</option>
          </select>
        </div>
      </div>

      {/* Grid of Section Cards - Clean, Compact Swiss Legal Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStatutes.map((item, idx) => (
          <div
            key={idx}
            className="group p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-150 flex flex-col justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-black uppercase tracking-wider bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-2 py-0.5 rounded">
                    {item.actCode} § {item.section}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 font-semibold">
                    {item.gravity}
                  </span>
                </div>
                <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  item.bailable ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' : 'bg-rose-500 text-white dark:bg-rose-600'
                }`}>
                  {item.bailable ? 'Bailable' : 'Non-Bailable'}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5 mb-2">
                <h2 className="text-sm font-black text-zinc-950 dark:text-white tracking-tight leading-snug line-clamp-1">
                  {item.title}
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono line-clamp-1">
                  {item.actName}
                </p>
              </div>

              {/* Legal Classification & Penalty */}
              <div className="space-y-1 text-[11px] font-mono py-2 my-1.5 border-y border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                <p className="truncate">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mr-1.5">Category:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.crimeHead} · {item.crimeSubHead}</span>
                </p>
                <p className="line-clamp-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mr-1.5">Penalty:</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.maxPunishment}</span>
                </p>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono">
              <div>
                <span className="text-[9px] text-zinc-400 uppercase tracking-wider block">Conviction Rate</span>
                <span className="font-black text-zinc-950 dark:text-white">{item.avgConvictionRate}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-zinc-400 uppercase tracking-wider block">Active Charges</span>
                <span className="font-black text-zinc-950 dark:text-white">{item.totalCasesActive} Cases</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
