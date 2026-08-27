'use client';

import { useState } from 'react';
import {
  Building2, Shield, User, MapPin, Scale, Search,
  ChevronRight, Award, Phone, CheckCircle2, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const UNITS_DATA = [
  {
    unitId: 6,
    name: 'Silk Board & Madiwala Police Station',
    type: 'Police Station (Law & Order)',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    activeOfficers: [
      { id: 1001, name: 'Insp. Vikram Sharma', kgid: 'KSP-4092', rank: 'Police Inspector (PI)', designation: 'Station House Officer (SHO)', bloodGroup: 'O+', appointment: '2006' },
      { id: 1005, name: 'PSI Rajesh Gowda', kgid: 'KSP-6304', rank: 'Sub-Inspector (PSI)', designation: 'Investigating Officer (IO)', bloodGroup: 'B+', appointment: '2015' }
    ],
    anprCamerasCount: 18,
    activeWatchlistPlates: 42,
    casesTotal: 640
  },
  {
    unitId: 12,
    name: 'MG Road & Cubbon Park Police Station',
    type: 'Police Station (Law & Order)',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'Chief Metropolitan Magistrate Court, Bengaluru',
    activeOfficers: [
      { id: 1004, name: 'DSP Siddharth Rao', kgid: 'KSP-3011', rank: 'Deputy Superintendent (DSP)', designation: 'Surveillance Intercept Lead', bloodGroup: 'A+', appointment: '2002' }
    ],
    anprCamerasCount: 24,
    activeWatchlistPlates: 38,
    casesTotal: 520
  },
  {
    unitId: 18,
    name: 'Whitefield Cyber Crime PS / CEN Command',
    type: 'Cyber, Economic & Narcotics (CEN) PS',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    activeOfficers: [
      { id: 1002, name: 'Insp. Ananya Hegde', kgid: 'KSP-5120', rank: 'Police Inspector (PI)', designation: 'Cyber Intelligence Lead', bloodGroup: 'A-', appointment: '2012' }
    ],
    anprCamerasCount: 14,
    activeWatchlistPlates: 19,
    casesTotal: 410
  },
  {
    unitId: 24,
    name: 'Koramangala 80ft Road Police Station',
    type: 'Police Station (Law & Order)',
    district: 'Bengaluru Urban (0443)',
    state: 'Karnataka',
    court: 'City Civil & Sessions Court, Bengaluru',
    activeOfficers: [
      { id: 1003, name: 'PSI Arvind Swamy', kgid: 'KSP-7102', rank: 'Sub-Inspector (PSI)', designation: 'Investigating Officer (IO)', bloodGroup: 'AB+', appointment: '2018' }
    ],
    anprCamerasCount: 12,
    activeWatchlistPlates: 15,
    casesTotal: 380
  },
  {
    unitId: 42,
    name: 'Mysuru Central Police Station',
    type: 'Police Station (Law & Order)',
    district: 'Mysuru District (0102)',
    state: 'Karnataka',
    court: 'Principal District & Sessions Court, Mysuru',
    activeOfficers: [
      { id: 1006, name: 'Insp. Chandrashekar P.', kgid: 'KSP-4190', rank: 'Police Inspector (PI)', designation: 'Station House Officer (SHO)', bloodGroup: 'O+', appointment: '2008' }
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>KSP Organizational Hierarchy & Station Directory</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Unit & Employee Master
            </span>
          </h1>
          <p className="text-xs text-gray-500">
            Jurisdictional Police Units, Station House Officers, KGID Records, and Court Mappings
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, officer, KGID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none shadow-xs"
            />
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 font-semibold focus:outline-none shadow-xs"
          >
            <option value="all">All Districts</option>
            <option value="Bengaluru">Bengaluru Urban (0443)</option>
            <option value="Mysuru">Mysuru District (0102)</option>
          </select>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Units</p>
            <p className="text-lg font-bold text-gray-900">8 Police Stations</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Officers Logged</p>
            <p className="text-lg font-bold text-gray-900">42 KGID Personnel</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Court Jurisdictions</p>
            <p className="text-lg font-bold text-gray-900">4 Sessions Courts</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Grid Coverage</p>
            <p className="text-lg font-bold text-gray-900">76 ANPR Cameras</p>
          </div>
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredUnits.map((unit) => (
          <motion.div
            key={unit.unitId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-5 hover:border-gray-300 transition-all"
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                    UNIT #{String(unit.unitId).padStart(4, '0')}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {unit.type}
                  </span>
                </div>
                <h2 className="text-base font-bold text-gray-900">{unit.name}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-800">{unit.casesTotal}</span>
                <p className="text-[10px] text-gray-400">Total Cases Filed</p>
              </div>
            </div>

            {/* Jurisdiction & Court Meta */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">District & State</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {unit.district}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Trial Court</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                  <Scale className="w-3.5 h-3.5 text-purple-500" />
                  {unit.court.split(',')[0]}
                </span>
              </div>
            </div>

            {/* Active Personnel List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Assigned Officers (Employee Table)
              </span>
              <div className="space-y-2">
                {unit.activeOfficers.map((officer) => (
                  <div
                    key={officer.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 text-xs hover:bg-gray-50/80 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-bold text-xs flex items-center justify-center">
                        {officer.name.split(' ')[1]?.slice(0, 2) || 'OF'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{officer.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{officer.designation} • {officer.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {officer.kgid}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Appt: {officer.appointment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
