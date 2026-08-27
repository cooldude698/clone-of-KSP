'use client';

import { useState } from 'react';
import {
  Building2, Shield, User, MapPin, Scale, Search,
  ChevronRight, Award, Phone, CheckCircle2, Filter, Camera, Radio
} from 'lucide-react';
import { motion } from 'framer-motion';

const UNITS_DATA = [
  {
    unitId: 6,
    name: 'Silk Board & Madiwala Police Station',
    type: 'Law & Order Command',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    activeOfficers: [
      { id: 1001, name: 'Insp. Vikram Sharma', kgid: 'KSP-4092', rank: 'Police Inspector (PI)', designation: 'Station House Officer (SHO)', appointment: '2006' },
      { id: 1005, name: 'PSI Rajesh Gowda', kgid: 'KSP-6304', rank: 'Sub-Inspector (PSI)', designation: 'Investigating Officer (IO)', appointment: '2015' }
    ],
    anprCamerasCount: 18,
    activeWatchlistPlates: 42,
    casesTotal: 640
  },
  {
    unitId: 12,
    name: 'MG Road & Cubbon Park Police Station',
    type: 'Central Metro Command',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'Chief Metropolitan Magistrate Court, Bengaluru',
    activeOfficers: [
      { id: 1004, name: 'DSP Siddharth Rao', kgid: 'KSP-3011', rank: 'Deputy Superintendent (DSP)', designation: 'Surveillance Intercept Lead', appointment: '2002' }
    ],
    anprCamerasCount: 24,
    activeWatchlistPlates: 38,
    casesTotal: 520
  },
  {
    unitId: 18,
    name: 'Whitefield Cyber Crime PS / CEN Command',
    type: 'Cyber & Narcotics (CEN)',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    activeOfficers: [
      { id: 1002, name: 'Insp. Ananya Hegde', kgid: 'KSP-5120', rank: 'Police Inspector (PI)', designation: 'Cyber Intelligence Lead', appointment: '2012' }
    ],
    anprCamerasCount: 14,
    activeWatchlistPlates: 19,
    casesTotal: 410
  },
  {
    unitId: 24,
    name: 'Koramangala 80ft Road Police Station',
    type: 'Law & Order Command',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    activeOfficers: [
      { id: 1003, name: 'PSI Arvind Swamy', kgid: 'KSP-7102', rank: 'Sub-Inspector (PSI)', designation: 'Investigating Officer (IO)', appointment: '2018' }
    ],
    anprCamerasCount: 12,
    activeWatchlistPlates: 15,
    casesTotal: 380
  },
  {
    unitId: 42,
    name: 'Mysuru Central Police Station',
    type: 'District HQ Command',
    district: 'Mysuru District (0102)',
    state: 'Karnataka',
    court: 'Principal District & Sessions Court, Mysuru',
    activeOfficers: [
      { id: 1006, name: 'Insp. Chandrashekar P.', kgid: 'KSP-4190', rank: 'Police Inspector (PI)', designation: 'Station House Officer (SHO)', appointment: '2008' }
    ],
    anprCamerasCount: 8,
    activeWatchlistPlates: 11,
    casesTotal: 290
  }
];

export default function HierarchyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const filteredUnits = UNITS_DATA.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.activeOfficers.some(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.kgid.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDist = selectedDistrict === 'all' || u.district.includes(selectedDistrict);
    return matchesSearch && matchesDist;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-zinc-900 dark:text-zinc-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
              KSP Jurisdictional Units & Command Directory
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
              Station House Officers · KGID Personnel Master · Court Jurisdiction Mappings
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, officer, KGID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-mono transition-all"
            />
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none font-mono"
          >
            <option value="all">All Districts</option>
            <option value="Bengaluru">Bengaluru Urban (0443)</option>
            <option value="Mysuru">Mysuru District (0102)</option>
          </select>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Jurisdiction Units</p>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">5 Police Stations</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Law & Order + CEN Commands</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">KGID Personnel</p>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">42 Active Officers</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">SHOs, PIs & Sub-Inspectors</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Sessions Courts</p>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">4 Trial Benches</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Designated judicial forums</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Surveillance Grid</p>
          <p className="text-2xl font-black text-zinc-950 dark:text-white mt-1">76 ANPR Feeds</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Real-time plate intercepts</p>
        </div>
      </div>

      {/* Station Cards Grid - Ultra Clean, Minimal, No Nested Lasagna Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredUnits.map((unit) => (
          <div
            key={unit.unitId}
            className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-150 flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Unit Badge + Type + Total Cases */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-2.5 py-1 rounded-md">
                    UNIT #{String(unit.unitId).padStart(4, '0')}
                  </span>
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 font-bold">
                    {unit.type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-black text-zinc-950 dark:text-white">
                    {unit.casesTotal} Cases
                  </span>
                </div>
              </div>

              {/* Station Name */}
              <h2 className="text-lg font-black text-zinc-950 dark:text-white tracking-tight mt-1 mb-2">
                {unit.name}
              </h2>

              {/* Jurisdiction & Court Meta (Clean single-line flow, no nested gray boxes) */}
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono space-y-1 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{unit.district}</span>
                  <span>·</span>
                  <span>{unit.state}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Trial Court: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{unit.court.split(',')[0]}</span></span>
                </p>
              </div>

              {/* Assigned Command Personnel */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">
                  Command Officers ({unit.activeOfficers.length})
                </span>
                <div className="space-y-2">
                  {unit.activeOfficers.map((officer) => (
                    <div
                      key={officer.id}
                      className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 text-xs"
                    >
                      <div>
                        <p className="font-bold text-zinc-950 dark:text-white">{officer.name}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          {officer.designation} · {officer.rank}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                          {officer.kgid}
                        </span>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Appt: {officer.appointment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Surveillance Meta */}
            <div className="pt-3.5 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-zinc-400" />
                {unit.anprCamerasCount} ANPR Cameras
              </span>
              <span>{unit.activeWatchlistPlates} Watchlist Targets</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
