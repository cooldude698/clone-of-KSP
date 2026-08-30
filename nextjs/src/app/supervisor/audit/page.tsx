'use client';

import React, { useState } from 'react';
import {
  History,
  Shield,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  Clock,
  User,
  Bot,
  Terminal
} from 'lucide-react';
import { useSupervisorTelemetry } from '@/context/SupervisorTelemetryContext';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: 'AI_QUERY' | 'OFFICER_DISPATCH' | 'SANCTION_APPROVAL' | 'REASSIGNMENT' | 'STATUTORY_DIRECTIVE';
  user: string;
  role: string;
  station: string;
  action: string;
  ip_address: string;
  status: 'SUCCESS' | 'FLAGGED' | 'WARNING';
}

const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-8842',
    timestamp: 'Today, 18:24:12 IST',
    type: 'SANCTION_APPROVAL',
    user: 'Dr. Rajesh Kumar, IPS',
    role: 'Supervisor (SP)',
    station: 'Central Command',
    action: 'Approved Section 110 BNSS Notice for Suspect Ramesh Kumar (KAR/BEN/2024/1840)',
    ip_address: '10.42.100.12',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-8841',
    timestamp: 'Today, 18:15:00 IST',
    type: 'OFFICER_DISPATCH',
    user: 'Dr. Rajesh Kumar, IPS',
    role: 'Supervisor (SP)',
    station: 'Sector 4 Dispatch',
    action: 'Re-routed PCR-14 (Delta) to Silk Board TTMC - Hosur Corridor Dark Zone',
    ip_address: '10.42.100.12',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-8840',
    timestamp: 'Today, 17:50:33 IST',
    type: 'AI_QUERY',
    user: 'Insp. V. Sharma',
    role: 'Inspector (IO)',
    station: 'Ashoknagar PS',
    action: 'askDrishtiAI: "Scan 433MHz ANPR hits for KA-01-MJ-8821 near Silk Board"',
    ip_address: '10.42.102.45',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-8839',
    timestamp: 'Today, 17:12:05 IST',
    type: 'REASSIGNMENT',
    user: 'Dr. Rajesh Kumar, IPS',
    role: 'Supervisor (SP)',
    station: 'Central Command',
    action: 'Rebalanced 4 active vehicle theft FIRs from Indiranagar PS to Ulsoor PS',
    ip_address: '10.42.100.12',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-8838',
    timestamp: 'Today, 16:30:19 IST',
    type: 'STATUTORY_DIRECTIVE',
    user: 'Dr. Rajesh Kumar, IPS',
    role: 'Supervisor (SP)',
    station: 'Sector 4',
    action: 'Issued 60-day charge sheet statutory directive to Indiranagar PS',
    ip_address: '10.42.100.12',
    status: 'WARNING',
  },
  {
    id: 'LOG-8837',
    timestamp: 'Today, 15:45:00 IST',
    type: 'AI_QUERY',
    user: 'Insp. Anand Deshmukh',
    role: 'Inspector (IO)',
    station: 'Indiranagar PS',
    action: 'askDrishtiAI: "Analyze MDMA transit dead-drop coordinates at Outer Ring Road"',
    ip_address: '10.42.104.18',
    status: 'SUCCESS',
  },
];

export default function SupervisorAuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const filteredLogs = AUDIT_LOGS.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'ALL' || log.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleExport = (format: string) => {
    setToastMessage(`Exported ${filteredLogs.length} audit trail records as ${format.toUpperCase()}`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Audit & Compliance Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Karnataka State Police · Cryptographically Verified Officer Activity Trail & AI Co-Pilot Queries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:scale-105 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Audit PDF Report</span>
          </button>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter audit logs by officer, station, action keyword, or Log ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs font-semibold text-gray-700 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Event Types ({AUDIT_LOGS.length})</option>
            <option value="AI_QUERY">AI Co-Pilot Queries</option>
            <option value="SANCTION_APPROVAL">Sanction Approvals</option>
            <option value="OFFICER_DISPATCH">Fleet Dispatches</option>
            <option value="REASSIGNMENT">Case Reassignments</option>
            <option value="STATUTORY_DIRECTIVE">Statutory Directives</option>
          </select>
        </div>
      </div>

      {/* ── AUDIT LOGS TABLE CONSOLE (LIGHT THEME) ── */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            Verified Event Log ({filteredLogs.length} Records)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">SHA-256 Hash Chained</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="pb-3">Timestamp / Log ID</th>
                <th className="pb-3">Event Type</th>
                <th className="pb-3">User & Station</th>
                <th className="pb-3">Action Description</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5">
                    <span className="text-slate-900 font-bold block">{log.timestamp}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.id}</span>
                  </td>

                  <td className="py-3.5">
                    <span
                      className={`text-[9px] px-2.5 py-1 rounded-full font-semibold ${
                        log.type === 'AI_QUERY'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : log.type === 'SANCTION_APPROVAL'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.type === 'STATUTORY_DIRECTIVE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <span className="text-slate-900 font-bold block">{log.user}</span>
                    <span className="text-[10px] text-slate-500">{log.station}</span>
                  </td>

                  <td className="py-3.5 max-w-md">
                    <p className="text-slate-700 leading-snug">{log.action}</p>
                  </td>

                  <td className="py-3.5 text-slate-400 font-mono text-[10px]">{log.ip_address}</td>

                  <td className="py-3.5">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                        log.status === 'SUCCESS'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border border-amber-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
