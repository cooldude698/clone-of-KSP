'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield,
  FileText, Camera, Users, MapPin, Activity, ArrowRight
} from 'lucide-react';

// ── Mock data ─────────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    id: 'stat-total-firs',
    label: 'Total FIRs (Last 30d)',
    value: '1,284',
    change: '+8.2%',
    up: true,
    icon: FileText,
    color: 'text-phosphor-500',
    bg: 'bg-phosphor-500/10',
    border: 'border-phosphor-500/20',
  },
  {
    id: 'stat-active-cameras',
    label: 'Active Cameras',
    value: '6,842',
    change: '+0.5%',
    up: true,
    icon: Camera,
    color: 'text-success-500',
    bg: 'bg-success-500/10',
    border: 'border-success-500/20',
  },
  {
    id: 'stat-high-risk',
    label: 'High-Risk Suspects',
    value: '37',
    change: '+3',
    up: false,
    icon: AlertTriangle,
    color: 'text-critical-500',
    bg: 'bg-critical-500/10',
    border: 'border-critical-500/20',
  },
  {
    id: 'stat-cases-solved',
    label: 'Cases Solved (MTD)',
    value: '89',
    change: '+12.6%',
    up: true,
    icon: Shield,
    color: 'text-warn-500',
    bg: 'bg-warn-500/10',
    border: 'border-warn-500/20',
  },
];

const RECENT_FIRS = [
  { case_number: 'FIR-2026-BL-4921', crime_type: 'vehicle_theft', district: 'Bengaluru Urban', case_status: 'open', date: '2026-07-17' },
  { case_number: 'FIR-2026-MY-1103', crime_type: 'robbery', district: 'Mysuru', case_status: 'under_investigation', date: '2026-07-17' },
  { case_number: 'FIR-2026-BL-4920', crime_type: 'chain_snatching', district: 'Bengaluru Urban', case_status: 'open', date: '2026-07-16' },
  { case_number: 'FIR-2026-HB-0872', crime_type: 'assault', district: 'Hubballi', case_status: 'closed', date: '2026-07-15' },
  { case_number: 'FIR-2026-MG-0491', crime_type: 'theft', district: 'Mangaluru', case_status: 'under_investigation', date: '2026-07-14' },
];

const HOTSPOT_AREAS = [
  { area: 'Silk Board Junction', district: 'Bengaluru Urban', count: 48, severity: 'critical' },
  { area: 'MG Road Corridor', district: 'Bengaluru Urban', count: 32, severity: 'high' },
  { area: 'Mysuru Palace Area', district: 'Mysuru', count: 24, severity: 'high' },
  { area: 'Hubballi Old Town', district: 'Hubballi-Dharwad', count: 18, severity: 'medium' },
];

const STATUS_COLORS = {
  open: 'bg-critical-500/20 text-critical-500 border-critical-500/30',
  under_investigation: 'bg-warn-500/20 text-warn-500 border-warn-500/30',
  closed: 'bg-success-500/20 text-success-500 border-success-500/30',
};

const SEVERITY_COLORS = {
  critical: 'bg-critical-500',
  high: 'bg-warn-500',
  medium: 'bg-phosphor-500',
  low: 'bg-success-500',
};

function StatCard({ id, label, value, change, up, icon: Icon, color, bg, border }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div
      id={id}
      className={`glass-card rounded-xl p-5 ${border} transition-all duration-500 hover:border-opacity-60 hover:-translate-y-0.5
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${bg} ${border} border flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-success-500' : 'text-critical-500'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold text-paper-100 font-mono">{value}</p>
      <p className="text-xs text-paper-100/50 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardOverview() {
  const [role, setRole] = useState('Inspector');
  useEffect(() => {
    setRole(localStorage.getItem('drishti_role') || 'Inspector');
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-card rounded-xl px-6 py-5 border border-phosphor-500/20 flex items-center justify-between">
        <div>
          <h2 className="text-paper-100 font-semibold text-lg">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Officer
          </h2>
          <p className="text-paper-100/60 text-sm mt-0.5">
            DRISHTI Intelligence Platform — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/10 border border-success-500/20">
          <Activity className="w-4 h-4 text-success-500" />
          <span className="text-xs text-success-500 font-medium">All Systems Operational</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent FIRs */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-steel-600/40">
          <div className="flex items-center justify-between px-5 py-4 border-b border-steel-600/40">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-phosphor-500" />
              <h3 className="text-sm font-semibold text-paper-100">Recent FIRs</h3>
            </div>
            <Link href="/dashboard/chat" className="flex items-center gap-1 text-xs text-phosphor-500 hover:text-phosphor-500/80 transition-colors">
              Query via Co-Pilot <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-steel-600/30">
            {RECENT_FIRS.map((fir) => (
              <div key={fir.case_number} className="flex items-center gap-4 px-5 py-3.5 hover:bg-steel-600/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-phosphor-500 truncate">{fir.case_number}</p>
                  <p className="text-sm text-paper-100/80 mt-0.5 capitalize">
                    {fir.crime_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-paper-100/40" />
                    <span className="text-xs text-paper-100/50">{fir.district}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border capitalize
                    ${STATUS_COLORS[fir.case_status] || STATUS_COLORS.open}`}>
                    {fir.case_status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crime Hotspots */}
        <div className="glass-card rounded-xl border border-steel-600/40">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-steel-600/40">
            <MapPin className="w-4 h-4 text-critical-500" />
            <h3 className="text-sm font-semibold text-paper-100">Top Hotspots</h3>
          </div>
          <div className="p-4 space-y-3">
            {HOTSPOT_AREAS.map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-steel-600/20 border border-steel-600/30">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_COLORS[h.severity]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-paper-100/90 truncate">{h.area}</p>
                  <p className="text-xs text-paper-100/50">{h.district}</p>
                </div>
                <span className="text-xs font-mono font-bold text-critical-500">{h.count}</span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <Link
              href="/dashboard/map"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                bg-phosphor-500/10 border border-phosphor-500/20 text-phosphor-500 text-xs font-medium
                hover:bg-phosphor-500/20 transition-all"
            >
              <MapPin className="w-3 h-3" /> View Full Map
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/chat', label: 'Ask Co-Pilot', desc: 'Query in English or Kannada', icon: '🤖' },
          { href: '/dashboard/network', label: 'Network Graph', desc: 'Suspect relationship map', icon: '🕸' },
          { href: '/dashboard/surveillance', label: 'Surveillance', desc: 'Live camera feeds', icon: '📷' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="glass-card rounded-xl p-4 border border-steel-600/40 hover:border-phosphor-500/40
              transition-all hover:-translate-y-0.5 group"
          >
            <div className="text-2xl mb-3">{item.icon}</div>
            <p className="text-sm font-semibold text-paper-100 group-hover:text-phosphor-500 transition-colors">
              {item.label}
            </p>
            <p className="text-xs text-paper-100/50 mt-1">{item.desc}</p>
            <ArrowRight className="w-4 h-4 text-phosphor-500/60 mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
