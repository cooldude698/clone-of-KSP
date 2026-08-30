'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Building2,
  Filter,
  ArrowUpRight,
  Shield,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CaseItem {
  case_number: string;
  crime_type: string;
  date: string;
  status: string;
  sla_status: string;
}

interface OfficerRecord {
  officer_id: string;
  name: string;
  station: string;
  phone: string;
  email: string;
  joined_station: string;
  specialization: string;
  active_cases: number;
  closed_cases_month: number;
  clearance_rate: number;
  avg_response_min: number;
  sla_compliance: number;
  status: string;
  recent_cases: CaseItem[];
}

export default function SupervisorPerformancePage() {
  const [officers, setOfficers] = useState<OfficerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/supervisor/performance');
        if (res.ok) {
          const data = await res.json();
          setOfficers(data.officers || []);
          if (data.officers && data.officers.length > 0) {
            setSelectedOfficer(data.officers[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load performance data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredOfficers = officers.filter((off) => {
    const matchSearch =
      off.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      off.officer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      off.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
      off.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStation = stationFilter === 'ALL' || off.station.includes(stationFilter);
    return matchSearch && matchStation;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Officer & Station Performance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Karnataka State Police · Sector 4 Officer Clearances, Active Caseloads & SLA Compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            4 Inspectors Synced
          </span>
        </div>
      </div>

      {/* ── 4 KEY EXECUTIVE KPI CARDS (LIGHT THEME) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                Above Target
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Avg Clearance Rate</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">82.5%</h3>
          </div>
          <p className="text-[11px] text-slate-400 pt-3 mt-2 border-t border-slate-100 font-mono">
            Benchmark: &gt;75%
          </p>
        </div>

        <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                Fast Velocity
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Average 112 Response</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">16.8 mins</h3>
          </div>
          <p className="text-[11px] text-slate-400 pt-3 mt-2 border-t border-slate-100 font-mono">
            Sector 4 urban average
          </p>
        </div>

        <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                Active Queue
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Division Caseload</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">62 Active FIRs</h3>
          </div>
          <p className="text-[11px] text-slate-400 pt-3 mt-2 border-t border-slate-100 font-mono">
            15.5 FIRs / officer avg
          </p>
        </div>

        <div className="rounded-[28px] bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                88.5% On-Time
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Charge Sheet SLA</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">88.5%</h3>
          </div>
          <p className="text-[11px] text-slate-400 pt-3 mt-2 border-t border-slate-100 font-mono">
            60-day statutory quota
          </p>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inspector by name, badge ID, station or specialization..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs font-semibold text-gray-700 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Stations (4)</option>
            <option value="Ashoknagar">Ashoknagar PS</option>
            <option value="Cubbon Park">Cubbon Park PS</option>
            <option value="Ulsoor">Ulsoor PS</option>
            <option value="Indiranagar">Indiranagar PS</option>
          </select>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN INSPECTOR ROSTER & CASE BACKLOG DETAILS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Officer Scorecards List (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Inspector Duty Roster & Workload
          </h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Loading Officer Performance Records...
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              No matching officers found for query.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredOfficers.map((officer) => {
                const isSelected = selectedOfficer?.officer_id === officer.officer_id;

                return (
                  <div
                    key={officer.officer_id}
                    onClick={() => setSelectedOfficer(officer)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-300 shadow-sm'
                        : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                          {officer.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {officer.name}
                            <span className="text-[10px] text-slate-400 font-mono">({officer.officer_id})</span>
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {officer.station} · {officer.specialization}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                          officer.status.includes('Optimal')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : officer.status.includes('Near')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {officer.status}
                      </span>
                    </div>

                    {/* Performance Bars */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">Clearance</span>
                        <span className="font-bold text-emerald-600 text-sm">{officer.clearance_rate}%</span>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${officer.clearance_rate}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">Active FIRs</span>
                        <span className="font-bold text-slate-900 text-sm">{officer.active_cases} / 20</span>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              officer.active_cases > 18 ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${(officer.active_cases / 20) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">SLA Compliance</span>
                        <span className="font-bold text-amber-600 text-sm">{officer.sla_compliance}%</span>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${officer.sla_compliance}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Inspector Backlog Drilldown (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4 text-xs">
          {selectedOfficer ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedOfficer.name} · Case Backlog
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Station: {selectedOfficer.station}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 font-bold text-sm">{selectedOfficer.closed_cases_month} Closed</span>
                  <span className="block text-[10px] text-slate-400">this month</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>{selectedOfficer.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span className="truncate">{selectedOfficer.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 col-span-2 pt-1 border-t border-slate-200/60">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>On Duty at {selectedOfficer.station} since {selectedOfficer.joined_station}</span>
                </div>
              </div>

              {/* Case Backlog List */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="font-bold text-slate-800 text-xs">Assigned Active FIR Backlog:</span>
                <div className="flex flex-col gap-2">
                  {selectedOfficer.recent_cases?.map((c) => (
                    <div
                      key={c.case_number}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600 font-mono">{c.case_number}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                            c.sla_status.includes('Overdue') || c.sla_status.includes('Critical')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {c.sla_status}
                        </span>
                      </div>

                      <p className="text-slate-800 font-medium text-[11px]">{c.crime_type}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                        <span>Filed: {c.date}</span>
                        <span className="text-slate-700">{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Select an inspector from the roster to view their complete dossier and case backlog.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
