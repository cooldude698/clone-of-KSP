'use client';

import { useState } from 'react';
import {
  Building2, Shield, User, MapPin, Scale, Search,
  ChevronRight, Award, Phone, CheckCircle2, Filter, Camera, Radio,
  RadioTower, Users, Compass, Eye, ShieldCheck, FileText, ArrowUpRight,
  Sparkles, X, Car, PhoneCall, Copy, Check, Info, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UNITS_DATA = [
  {
    unitId: 6,
    code: 'UNIT-0006',
    name: 'Silk Board & Madiwala Police Station',
    type: 'Law & Order Command',
    category: 'Law & Order',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    courtType: 'Sessions Forum',
    jurisdictionArea: 'Madiwala Market, Silk Board Jn, BTM 1st Stage, Hosur Main Road Corridor',
    emergencyHotline: '+91 80 2294 2551',
    radioFrequency: 'VHF-144.25 MHz (Channel 04)',
    activeOfficers: [
      { id: 1001, name: 'Insp. Vikram Sharma', kgid: 'KSP-4092', rank: 'Police Inspector (PI)', designation: 'Station House Officer (SHO)', appointment: '2006', phone: '+91 94808 01001', shift: 'Alpha Shift (08:00 - 20:00)' },
      { id: 1005, name: 'PSI Rajesh Gowda', kgid: 'KSP-6304', rank: 'Sub-Inspector (PSI)', designation: 'Investigating Officer (IO)', appointment: '2015', phone: '+91 94808 01005', shift: 'Bravo Shift (20:00 - 08:00)' }
    ],
    anprCamerasCount: 18,
    activeWatchlistPlates: 42,
    casesTotal: 640,
    resolvedCases: 482,
    fleet: [
      { type: 'Hoysala PCR Van', count: 4, status: 'Active Patrol' },
      { type: 'Cheetah Quick Response Bike', count: 8, status: 'Active' },
      { type: 'Highway Interceptor', count: 1, status: 'Stationed at Silk Board' }
    ],
    crimeBreakdown: [
      { type: 'Vehicle Theft', count: 245, pct: 38 },
      { type: 'Financial & Cyber Fraud', count: 180, pct: 28 },
      { type: 'Property & Burglary', count: 135, pct: 21 },
      { type: 'Violent Crimes', count: 80, pct: 13 }
    ]
  },
  {
    unitId: 12,
    code: 'UNIT-0012',
    name: 'MG Road & Cubbon Park Police Station',
    type: 'Central Metro Command',
    category: 'Central Metro',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'Chief Metropolitan Magistrate Court, Bengaluru',
    courtType: 'Magistrate First Class',
    jurisdictionArea: 'Cubbon Park, MG Road Boulevard, Brigade Road, Chinnaswamy Stadium Perimeter',
    emergencyHotline: '+91 80 2294 2580',
    radioFrequency: 'VHF-146.10 MHz (Metro Core)',
    activeOfficers: [
      { id: 1004, name: 'DSP Siddharth Rao', kgid: 'KSP-3011', rank: 'Deputy Superintendent (DSP)', designation: 'Surveillance Intercept Lead', appointment: '2002', phone: '+91 94808 01004', shift: 'Command HQ Oversight' },
      { id: 1008, name: 'Insp. R. Venkatesh', kgid: 'KSP-4588', rank: 'Police Inspector (PI)', designation: 'Station House Officer (SHO)', appointment: '2009', phone: '+91 94808 01008', shift: 'Alpha Shift' }
    ],
    anprCamerasCount: 24,
    activeWatchlistPlates: 38,
    casesTotal: 520,
    resolvedCases: 410,
    fleet: [
      { type: 'Hoysala PCR Van', count: 6, status: 'Active Patrol' },
      { type: 'Cheetah Quick Response Bike', count: 12, status: 'Active' },
      { type: 'Command Mobile Surveillance Unit', count: 2, status: 'Active' }
    ],
    crimeBreakdown: [
      { type: 'Public Order & Traffic', count: 190, pct: 36 },
      { type: 'Narcotics & Nightlife', count: 140, pct: 27 },
      { type: 'Commercial Disputes', count: 110, pct: 21 },
      { type: 'Larceny & Pickpocketing', count: 80, pct: 16 }
    ]
  },
  {
    unitId: 18,
    code: 'UNIT-0018',
    name: 'Whitefield Cyber Crime PS / CEN Command',
    type: 'Cyber & Narcotics (CEN)',
    category: 'Cyber & CEN',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    courtType: 'Special Cyber Court',
    jurisdictionArea: 'ITPL, EPIP Zone, Kadugodi, Hope Farm Junction, Varthur Tech Corridor',
    emergencyHotline: '+91 80 2294 2565',
    radioFrequency: 'VHF-148.50 MHz (CEN Grid)',
    activeOfficers: [
      { id: 1002, name: 'Insp. Ananya Hegde', kgid: 'KSP-5120', rank: 'Police Inspector (PI)', designation: 'Cyber Intelligence Lead', appointment: '2012', phone: '+91 94808 01002', shift: 'Cyber Forensic Core' },
      { id: 1010, name: 'PSI Manjunath K.', kgid: 'KSP-6890', rank: 'Sub-Inspector (PSI)', designation: 'Digital Forensics Specialist', appointment: '2019', phone: '+91 94808 01010', shift: 'Threat Intelligence Shift' }
    ],
    anprCamerasCount: 14,
    activeWatchlistPlates: 19,
    casesTotal: 410,
    resolvedCases: 295,
    fleet: [
      { type: 'Cyber Rapid Forensics Van', count: 2, status: 'Active Investigation' },
      { type: 'Hoysala PCR Van', count: 3, status: 'Active Patrol' },
      { type: 'Cheetah Quick Response Bike', count: 4, status: 'Active' }
    ],
    crimeBreakdown: [
      { type: 'Online Banking & UPI Phishing', count: 210, pct: 51 },
      { type: 'Cryptocurrency & Investment Scams', count: 115, pct: 28 },
      { type: 'Identity Theft & Social Impersonation', count: 55, pct: 13 },
      { type: 'Darknet Narcotics', count: 30, pct: 8 }
    ]
  },
  {
    unitId: 24,
    code: 'UNIT-0024',
    name: 'Koramangala 80ft Road Police Station',
    type: 'Law & Order Command',
    category: 'Law & Order',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    courtType: 'Sessions Forum',
    jurisdictionArea: 'Koramangala 1st to 8th Block, Sony World Jn, 80ft Road Commercial Spine',
    emergencyHotline: '+91 80 2294 2572',
    radioFrequency: 'VHF-144.90 MHz (South Zone)',
    activeOfficers: [
      { id: 1003, name: 'PSI Arvind Swamy', kgid: 'KSP-7102', rank: 'Sub-Inspector (PSI)', designation: 'Investigating Officer (IO)', appointment: '2018', phone: '+91 94808 01003', shift: 'Night Surveillance & Beat' },
      { id: 1012, name: 'Insp. Deepa N.', kgid: 'KSP-4311', rank: 'Police Inspector (PI)', designation: 'Station House Officer (SHO)', appointment: '2007', phone: '+91 94808 01012', shift: 'General Command' }
    ],
    anprCamerasCount: 12,
    activeWatchlistPlates: 15,
    casesTotal: 380,
    resolvedCases: 290,
    fleet: [
      { type: 'Hoysala PCR Van', count: 3, status: 'Active Patrol' },
      { type: 'Cheetah Quick Response Bike', count: 6, status: 'Active' }
    ],
    crimeBreakdown: [
      { type: 'Vehicle Larceny', count: 140, pct: 37 },
      { type: 'Nightclub & Commercial Altercations', count: 110, pct: 29 },
      { type: 'House Break-ins', count: 80, pct: 21 },
      { type: 'Cyber Fraud', count: 50, pct: 13 }
    ]
  },
  {
    unitId: 42,
    code: 'UNIT-0042',
    name: 'Mysuru Central Police Station',
    type: 'District HQ Command',
    category: 'District HQ',
    district: 'Mysuru District (0102)',
    state: 'Karnataka',
    court: 'Principal District & Sessions Court, Mysuru',
    courtType: 'District & Sessions Bench',
    jurisdictionArea: 'Mysuru Palace Perimeter, Devaraja Market, Sayyaji Rao Road, Suburban Bus Stand',
    emergencyHotline: '+91 821 241 8300',
    radioFrequency: 'VHF-152.40 MHz (Mysuru Command)',
    activeOfficers: [
      { id: 1006, name: 'Insp. Chandrashekar P.', kgid: 'KSP-4190', rank: 'Police Inspector (PI)', designation: 'Station House Officer (SHO)', appointment: '2008', phone: '+91 94808 01006', shift: 'Heritage Zone Command' },
      { id: 1014, name: 'PSI Sandeep Kumar', kgid: 'KSP-7450', rank: 'Sub-Inspector (PSI)', designation: 'Traffic & Beat Coordinator', appointment: '2020', phone: '+91 94808 01014', shift: 'Alpha Shift' }
    ],
    anprCamerasCount: 8,
    activeWatchlistPlates: 11,
    casesTotal: 290,
    resolvedCases: 235,
    fleet: [
      { type: 'Hoysala PCR Van', count: 4, status: 'Active Patrol' },
      { type: 'Heritage Tourism Patrol Bikes', count: 6, status: 'Active' },
      { type: 'Highway Patrol Interceptor', count: 1, status: 'Ring Road' }
    ],
    crimeBreakdown: [
      { type: 'Tourism Fraud & Pickpocketing', count: 110, pct: 38 },
      { type: 'Property Disputes', count: 85, pct: 29 },
      { type: 'Vehicle Thefts', count: 55, pct: 19 },
      { type: 'Assault Cases', count: 40, pct: 14 }
    ]
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Units' },
  { id: 'Law & Order', label: 'Law & Order' },
  { id: 'Central Metro', label: 'Central Metro' },
  { id: 'Cyber & CEN', label: 'Cyber & CEN' },
  { id: 'District HQ', label: 'District HQ' }
];

export default function HierarchyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [activeModalUnit, setActiveModalUnit] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeRadioCall, setActiveRadioCall] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateRadio = (officer) => {
    setActiveRadioCall(officer.name);
    setTimeout(() => {
      setActiveRadioCall(null);
    }, 3000);
  };

  const filteredUnits = UNITS_DATA.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.jurisdictionArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.activeOfficers.some(o => 
                            o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.kgid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.designation.toLowerCase().includes(searchTerm.toLowerCase())
                          );
    const matchesCat = selectedCategory === 'all' || u.category === selectedCategory;
    const matchesDist = selectedDistrict === 'all' || u.district.includes(selectedDistrict);
    return matchesSearch && matchesCat && matchesDist;
  });

  const totalStations = UNITS_DATA.length;
  const totalOfficers = UNITS_DATA.reduce((acc, u) => acc + u.activeOfficers.length, 0);
  const totalCameras = UNITS_DATA.reduce((acc, u) => acc + u.anprCamerasCount, 0);
  const totalCases = UNITS_DATA.reduce((acc, u) => acc + u.casesTotal, 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-slate-900 dark:text-slate-100">
      {/* ─── SLEEK, COMPACT COMMAND HEADER ─── */}
      <div className="bg-white dark:bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  KSP Jurisdictional Units & Command Directory
                </h1>
                <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Station House Officers · KGID Personnel Master · Court Jurisdiction Mappings
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-semibold">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalStations}</span> Stations
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-semibold">
              <span className="font-bold text-purple-600 dark:text-purple-400">{totalOfficers}</span> Officers
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-900/40 font-semibold">
              <span className="font-bold">{totalCameras}</span> ANPR Feeds
            </span>
          </div>
        </div>

        {/* Search & District Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1 border-t border-slate-100 dark:border-zinc-800">
          <div className="sm:col-span-8 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, SHO name, KGID badge (e.g. KSP-4092), or jurisdiction area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Districts (Statewide)</option>
              <option value="Bengaluru Urban">Bengaluru Urban (0443)</option>
              <option value="Mysuru">Mysuru District (0102)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200/60 dark:border-zinc-700/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── RADIO DISPATCH SIMULATION TOAST ─── */}
      <AnimatePresence>
        {activeRadioCall && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-indigo-500/40 flex items-center gap-2.5 text-xs backdrop-blur-md"
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Connecting radio link to <strong>{activeRadioCall}</strong>...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── COMPACT STATION CARDS GRID ─── */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl text-center space-y-2 border border-slate-200 dark:border-zinc-800">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No matching police stations found</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedDistrict('all'); }}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredUnits.map((unit) => (
            <div
              key={unit.unitId}
              className="bg-white dark:bg-zinc-900 rounded-xl p-3.5 border border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-2xs flex flex-col justify-between transition-all duration-150"
            >
              <div className="space-y-2.5">
                {/* Header Row: Unit Badge + Type + Total Cases */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-slate-100 border border-slate-200 dark:border-zinc-700">
                      {unit.code}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {unit.type}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-900 dark:text-white shrink-0">
                    {unit.casesTotal} Cases
                  </span>
                </div>

                {/* Station Name */}
                <div>
                  <h2 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1">
                    {unit.name}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{unit.district}</span>
                  </p>
                </div>

                {/* Jurisdiction Court Meta */}
                <div className="bg-slate-50/70 dark:bg-zinc-950/50 rounded-lg p-2 space-y-1 border border-slate-100 dark:border-zinc-800/70 text-[11px]">
                  <p className="flex items-center gap-1 truncate text-slate-700 dark:text-slate-300">
                    <Scale className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{unit.court.split(',')[0]}</span>
                  </p>
                  <p className="flex items-center gap-1 truncate text-slate-500 dark:text-slate-400 text-[10px]">
                    <Compass className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{unit.jurisdictionArea}</span>
                  </p>
                </div>

                {/* Assigned Officers */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Command ({unit.activeOfficers.length})</span>
                    <span className="font-mono">KGID</span>
                  </div>
                  <div className="space-y-1">
                    {unit.activeOfficers.map((officer) => (
                      <div
                        key={officer.id}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-white truncate text-[11px]">{officer.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {officer.designation}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-600">
                            {officer.kgid}
                          </span>
                          <button
                            onClick={() => handleSimulateRadio(officer)}
                            title="Direct Radio Dispatch"
                            className="p-1 rounded bg-slate-100 hover:bg-indigo-100 dark:bg-zinc-700 dark:hover:bg-indigo-950 text-slate-600 hover:text-indigo-600 dark:text-slate-300 transition"
                          >
                            <Radio className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Meta & Action Button */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3 text-slate-400" />
                    {unit.anprCamerasCount} Cams
                  </span>
                  <span>·</span>
                  <span>{unit.activeWatchlistPlates} Targets</span>
                </div>

                <button
                  onClick={() => setActiveModalUnit(unit)}
                  className="py-1 px-2.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                >
                  <span>Dossier</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── STATION DOSSIER MODAL ─── */}
      <AnimatePresence>
        {activeModalUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-xl p-5 space-y-4 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalUnit(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1.5 pr-6">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-slate-100">
                    {activeModalUnit.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    ● Active Command
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeModalUnit.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {activeModalUnit.district} · {activeModalUnit.court}
                </p>
              </div>

              {/* Emergency Hotline & Radio Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Emergency Hotline</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{activeModalUnit.emergencyHotline}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(activeModalUnit.emergencyHotline, 'hotline')}
                    className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 text-slate-600 dark:text-slate-300 shadow-2xs hover:scale-105 transition"
                  >
                    {copiedKey === 'hotline' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Radio Channel</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{activeModalUnit.radioFrequency.split('(')[0]}</p>
                  </div>
                  <Radio className="w-4 h-4 text-indigo-500" />
                </div>
              </div>

              {/* Fleet & Mobile Units */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-indigo-500" />
                  Assigned Patrol Fleet
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {activeModalUnit.fleet.map((vehicle, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{vehicle.type.split(' ')[0]}</p>
                      <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{vehicle.count} Units</p>
                      <p className="text-[9px] text-emerald-600 font-medium">● {vehicle.status.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crime Profile */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  FIR Breakdown
                </h4>
                <div className="space-y-1">
                  {activeModalUnit.crimeBreakdown.map((item, idx) => (
                    <div key={idx} className="space-y-0.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300">{item.type}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{item.count} ({item.pct}%)</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commissioned Officers */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  Commissioned Officers
                </h4>
                <div className="space-y-1">
                  {activeModalUnit.activeOfficers.map((officer) => (
                    <div key={officer.id} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 dark:text-white text-[11px]">{officer.name}</p>
                          <span className="font-mono text-[9px] font-bold px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-700">
                            {officer.kgid}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{officer.designation} · {officer.shift}</p>
                      </div>
                      <button
                        onClick={() => handleSimulateRadio(officer)}
                        className="px-2 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold hover:bg-indigo-600 transition"
                      >
                        Radio
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setActiveModalUnit(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
