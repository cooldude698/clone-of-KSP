'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Bell,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Radio,
  Car,
  Phone,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalystTelemetry } from '@/context/AnalystTelemetryContext';

interface WatchlistEntry {
  id: string;
  name: string;
  category: 'SUSPECT' | 'LOCATION' | 'VEHICLE' | 'FINANCIAL_MULE';
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MONITORED';
  primaryCrime: string;
  triggerCondition: string;
  lastPing: string;
  assignedAnalyst: string;
  status: 'ACTIVE_MONITORING' | 'TRIGGERED' | 'STANDBY';
  riskScore: number;
}

const DEFAULT_WATCHLIST: WatchlistEntry[] = [
  {
    id: 'WL-01',
    name: 'Ramesh Kumar (Bullet Ramesh)',
    category: 'SUSPECT',
    threatLevel: 'CRITICAL',
    primaryCrime: 'Two-Wheeler Theft Ring (Master Key MO)',
    triggerCondition: 'Flag immediately if registered in any FIR in Raichur, Bidar, or BLR Central',
    lastPing: '3s ago · ANPR Match KA-36-TR-8821',
    assignedAnalyst: 'Dr. Priya Rao',
    status: 'ACTIVE_MONITORING',
    riskScore: 94,
  },
  {
    id: 'WL-02',
    name: 'Imran Khan (Chotta Imran)',
    category: 'SUSPECT',
    threatLevel: 'CRITICAL',
    primaryCrime: 'Commercial MDMA Narcotics Intercept',
    triggerCondition: 'Alert plainclothes unit if vehicle KA-04-MB-4040 passes NH-48 Tumakuru toll',
    lastPing: '9s ago · Telecom Cell Tower Ping Wadhwa',
    assignedAnalyst: 'Dr. Priya Rao',
    status: 'TRIGGERED',
    riskScore: 96,
  },
  {
    id: 'WL-03',
    name: 'Silk Board Flyover & Madiwala Underpass',
    category: 'LOCATION',
    threatLevel: 'HIGH',
    primaryCrime: 'Night Transit Robbery & Theft',
    triggerCondition: 'Trigger SP alert if >2 theft incidents reported between 01:00 - 04:00',
    lastPing: '15s ago · CCTV Safe City Feed Active',
    assignedAnalyst: 'Analyst Team 2',
    status: 'ACTIVE_MONITORING',
    riskScore: 91,
  },
  {
    id: 'WL-04',
    name: 'Bhavani Karpe (FinSec Admin)',
    category: 'SUSPECT',
    threatLevel: 'HIGH',
    primaryCrime: 'Digital Banking Phishing & Cloned Gateways',
    triggerCondition: 'Correlate banking complaint filings with IP subnet 103.21.XX.XX',
    lastPing: '21s ago · Cybercrime Portal Alert',
    assignedAnalyst: 'Cyber Analyst Cell',
    status: 'ACTIVE_MONITORING',
    riskScore: 85,
  },
  {
    id: 'WL-05',
    name: 'White Swift Dzire (KA-03-JJ-3312)',
    category: 'VEHICLE',
    threatLevel: 'HIGH',
    primaryCrime: 'Narcotics Dead-Drop Delivery',
    triggerCondition: 'ANPR scan trigger at all Bengaluru East entry corridors',
    lastPing: '27s ago · ANPR Camera BLR-ANPR-15',
    assignedAnalyst: 'Dr. Priya Rao',
    status: 'ACTIVE_MONITORING',
    riskScore: 89,
  },
];

export default function AnalystWatchlistPage() {
  const { tick, lastUpdated, confidenceScore } = useAnalystTelemetry();
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(DEFAULT_WATCHLIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterThreat, setFilterThreat] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  // Add Target Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'SUSPECT' | 'LOCATION' | 'VEHICLE'>('SUSPECT');
  const [newThreat, setNewThreat] = useState<'CRITICAL' | 'HIGH' | 'ELEVATED'>('HIGH');
  const [newCrime, setNewCrime] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const handleAddEntry = () => {
    if (!newName.trim() || !newCrime.trim()) return;

    const newEntry: WatchlistEntry = {
      id: `WL-0${watchlist.length + 1}`,
      name: newName.trim(),
      category: newCategory,
      threatLevel: newThreat,
      primaryCrime: newCrime.trim(),
      triggerCondition: newCondition.trim() || 'Trigger real-time alert on subsequent FIR filing',
      lastPing: 'Just now · Initialized',
      assignedAnalyst: 'Dr. Priya Rao',
      status: 'ACTIVE_MONITORING',
      riskScore: newThreat === 'CRITICAL' ? 95 : newThreat === 'HIGH' ? 86 : 75,
    };

    setWatchlist([newEntry, ...watchlist]);
    setIsAdding(false);
    setNewName('');
    setNewCrime('');
    setNewCondition('');
  };

  const handleDelete = (id: string) => {
    setWatchlist(watchlist.filter((w) => w.id !== id));
  };

  const filteredList = watchlist.filter((item) => {
    if (filterThreat !== 'ALL' && item.threatLevel !== filterThreat) return false;
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              REAL-TIME WATCH ENGINE
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Automated Alert Triggers & ANPR Nexus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Intelligence Watchlist & Trigger Rules
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Active surveillance triggers for high-threat kingpins, volatile junctions, and flagged logistics vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white font-mono text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Target to Watchlist</span>
          </button>
        </div>
      </div>

      {/* ── MODAL: ADD NEW TARGET ── */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-2xl flex flex-col gap-4 font-mono text-xs text-[var(--text-primary)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h2 className="text-sm font-bold uppercase text-[var(--text-primary)]">
                  Configure Intelligence Watch Target
                </h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Target Name / Entity:</label>
                  <input
                    type="text"
                    placeholder="e.g. Anand Shinde or Silk Board Underpass"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Category:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none"
                    >
                      <option value="SUSPECT">Suspect / Person</option>
                      <option value="LOCATION">Volatile Location</option>
                      <option value="VEHICLE">Flagged Vehicle</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Threat Level:</label>
                    <select
                      value={newThreat}
                      onChange={(e) => setNewThreat(e.target.value as any)}
                      className="px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none"
                    >
                      <option value="CRITICAL">Critical (Immediate SP Alert)</option>
                      <option value="HIGH">High (Daily Telemetry Ping)</option>
                      <option value="ELEVATED">Elevated (Standard Monitored)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Primary Offense / Profile:</label>
                  <input
                    type="text"
                    placeholder="e.g. Armed Robbery / Inter-district getaway"
                    value={newCrime}
                    onChange={(e) => setNewCrime(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">Automated Alert Trigger Rule:</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Trigger priority alert if vehicle ANPR matches at NH-48 toll gate..."
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-bold hover:opacity-90"
                >
                  Confirm Watchlist Rule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FILTER TABS & SEARCH ── */}
      <div className="p-4 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[var(--cyan-accent)]" /> Threat Filter:
          </span>
          {(['ALL', 'CRITICAL', 'HIGH'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterThreat(lvl)}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                filterThreat === lvl
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--surface-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="relative font-mono text-xs min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search watchlist target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
          />
        </div>
      </div>

      {/* ── WATCHLIST GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((target) => (
          <motion.div
            key={target.id}
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between gap-3 font-mono text-xs"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] px-2 py-0.5 rounded bg-[var(--surface-1)] text-[var(--text-secondary)] font-bold">
                  {target.id} · {target.category}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    target.threatLevel === 'CRITICAL'
                      ? 'bg-[var(--status-critical)]/15 text-[var(--status-critical)] border border-[var(--status-critical)]/30'
                      : 'bg-[var(--status-warning)]/15 text-[var(--status-warning)] border border-[var(--status-warning)]/30'
                  }`}
                >
                  {target.threatLevel} ({target.riskScore})
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{target.name}</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{target.primaryCrime}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-[10px] flex flex-col gap-1">
                <span className="text-[var(--text-secondary)] font-bold uppercase">Trigger Rule:</span>
                <span className="text-[var(--text-primary)] leading-tight">{target.triggerCondition}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1 text-[var(--cyan-accent)]">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>{target.lastPing}</span>
              </span>
              <button
                onClick={() => handleDelete(target.id)}
                className="p-1 rounded hover:bg-[var(--status-critical)]/10 text-[var(--text-secondary)] hover:text-[var(--status-critical)] transition-colors"
                title="Remove from Watchlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
