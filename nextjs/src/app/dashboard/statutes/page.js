'use client';

import { useState } from 'react';
import {
  Scale, BookOpen, Search, Shield, Filter,
  FileCheck, AlertTriangle, ChevronRight, CheckCircle2, Bookmark
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>KSP Statutory Acts & Sections Repository</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Act & Section Master
            </span>
          </h1>
          <p className="text-xs text-gray-500">
            Legal Statutes, Crime Head Classifications, Bail Status, Penalties & Conviction Benchmarks
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search section (e.g. 379, 302, 66D)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none shadow-xs"
            />
          </div>

          <select
            value={selectedAct}
            onChange={(e) => setSelectedAct(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 font-semibold focus:outline-none shadow-xs"
          >
            <option value="all">All Statutes</option>
            <option value="IPC">IPC / BNS</option>
            <option value="NDPS">NDPS Act</option>
            <option value="ITACT">IT Act</option>
            <option value="ARMS">Arms Act</option>
          </select>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStatutes.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4 hover:border-gray-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    {item.actCode} § {item.section}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.gravity === 'Heinous' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                    {item.gravity}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.bailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {item.bailable ? 'Bailable' : 'Non-Bailable'}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-sm font-bold text-gray-900">{item.title}</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">{item.actName}</p>
              </div>

              {/* Crime Group Classification */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">Crime Head</span>
                  <span className="font-semibold text-gray-800">{item.crimeHead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">Sub-Classification</span>
                  <span className="font-semibold text-gray-700">{item.crimeSubHead}</span>
                </div>
              </div>

              {/* Punishment */}
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Maximum Statutory Penalty</span>
                <p className="text-gray-700 text-xs leading-relaxed font-medium">{item.maxPunishment}</p>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block">Avg Conviction Rate</span>
                <span className="font-bold text-emerald-600">{item.avgConvictionRate}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Active Charges</span>
                <span className="font-bold text-gray-900">{item.totalCasesActive} Cases</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
