'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield,
  FileText, Camera, Users, MapPin, Activity, ArrowRight,
  Clock, ShieldAlert, CheckCircle2, ChevronRight
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
    bg: 'bg-phosphor-500/15',
    border: 'border-phosphor-500/30',
    sparkline: [20, 25, 22, 30, 28, 35, 40, 38, 45, 50]
  },
  {
    id: 'stat-active-cameras',
    label: 'Active Cameras',
    value: '6,842',
    change: '+0.5%',
    up: true,
    icon: Camera,
    color: 'text-success-500',
    bg: 'bg-success-500/15',
    border: 'border-success-500/30',
    sparkline: [40, 42, 41, 45, 45, 48, 50, 49, 52, 55]
  },
  {
    id: 'stat-high-risk',
    label: 'High-Risk Suspects',
    value: '37',
    change: '+3',
    up: false,
    icon: AlertTriangle,
    color: 'text-critical-500',
    bg: 'bg-critical-500/15',
    border: 'border-critical-500/30',
    sparkline: [10, 15, 12, 18, 20, 25, 22, 30, 35, 37]
  },
  {
    id: 'stat-cases-solved',
    label: 'Cases Solved (MTD)',
    value: '89',
    change: '+12.6%',
    up: true,
    icon: Shield,
    color: 'text-warn-500',
    bg: 'bg-warn-500/15',
    border: 'border-warn-500/30',
    sparkline: [5, 8, 12, 15, 18, 25, 30, 35, 40, 45]
  },
];

const RECENT_FIRS = [
  { case_number: 'FIR-2026-BL-4921', crime_type: 'vehicle_theft', district: 'Bengaluru Urban', case_status: 'open', date: '2026-07-17', assignee: 'Me' },
  { case_number: 'FIR-2026-MY-1103', crime_type: 'robbery', district: 'Mysuru', case_status: 'under_investigation', date: '2026-07-17', assignee: 'Other' },
  { case_number: 'FIR-2026-BL-4920', crime_type: 'chain_snatching', district: 'Bengaluru Urban', case_status: 'open', date: '2026-07-16', assignee: 'Me' },
  { case_number: 'FIR-2026-HB-0872', crime_type: 'assault', district: 'Hubballi', case_status: 'closed', date: '2026-07-15', assignee: 'Me' },
  { case_number: 'FIR-2026-MG-0491', crime_type: 'theft', district: 'Mangaluru', case_status: 'under_investigation', date: '2026-07-14', assignee: 'Other' },
];

const HOTSPOT_AREAS = [
  { area: 'Silk Board Junction', district: 'Bengaluru Urban', count: 48, max: 50, severity: 'critical' },
  { area: 'MG Road Corridor', district: 'Bengaluru Urban', count: 32, max: 50, severity: 'high' },
  { area: 'Mysuru Palace Area', district: 'Mysuru', count: 24, max: 50, severity: 'high' },
  { area: 'Hubballi Old Town', district: 'Hubballi-Dharwad', count: 18, max: 50, severity: 'medium' },
  { area: 'Mangaluru Port', district: 'Mangaluru', count: 9, max: 50, severity: 'low' },
];

const STATUS_COLORS = {
  open: 'bg-critical-500/15 text-critical-500 border-critical-500/30',
  under_investigation: 'bg-warn-500/15 text-warn-500 border-warn-500/30',
  closed: 'bg-success-500/15 text-success-500 border-success-500/30',
};

const STATUS_ICONS = {
  open: AlertTriangle,
  under_investigation: Clock,
  closed: CheckCircle2
};

const SEVERITY_COLORS = {
  critical: 'bg-critical-500',
  high: 'bg-warn-500',
  medium: 'bg-phosphor-500',
  low: 'bg-success-500',
};

// ── Components ───────────────────────────────────────────────────────

function Sparkline({ data, colorClass }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 -10 100 120" className={`w-16 h-8 opacity-60 ${colorClass} drop-shadow-md`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function StatCard({ id, label, value, change, up, icon: Icon, color, bg, border, sparkline, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), delay); }, [delay]);

  return (
    <div
      id={id}
      className={`relative overflow-hidden glass-card rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 cursor-default
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold
          ${up ? 'text-success-500 bg-success-500/10' : 'text-critical-500 bg-critical-500/10'}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {change}
        </div>
      </div>
      
      <div className="relative z-10 flex items-end justify-between">
        <div>
          <p className="text-3xl font-black text-paper-100 font-mono tracking-tight">{value}</p>
          <p className="text-sm font-semibold text-paper-100/50 mt-1 uppercase tracking-wider">{label}</p>
        </div>
        <div className="pb-2">
          <Sparkline data={sparkline} colorClass={color} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const [role, setRole] = useState('Inspector');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    setRole(localStorage.getItem('drishti_role') || 'Inspector');
  }, []);

  const displayedFIRs = activeTab === 'all' 
    ? RECENT_FIRS 
    : RECENT_FIRS.filter(f => f.assignee === 'Me');

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      
      {/* ── Hero Welcome Section ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-steel-700/50">
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-paper-100 tracking-tight mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {role}
            </h1>
            <p className="text-paper-100/60 text-base max-w-xl">
              Welcome to the DRISHTI Command Center. Here is the latest intelligence brief for {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}.
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-void-000 border border-steel-600">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
            </div>
            <div>
              <p className="text-xs font-medium text-paper-100/80 uppercase tracking-widest">System Status: Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {STAT_CARDS.map((s, idx) => (
          <StatCard key={s.id} {...s} delay={100 + (idx * 100)} />
        ))}
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Recent FIRs */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-steel-600 bg-void-000">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-phosphor-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-paper-100">Live Case Feed</h3>
                  <p className="text-xs text-paper-100/50 uppercase tracking-wider">Recently logged FIRs</p>
                </div>
              </div>
              
              <div className="flex bg-steel-600 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'all' ? 'bg-steel-700 shadow-sm text-paper-100' : 'text-paper-100/50 hover:text-paper-100'}`}
                >
                  All Cases
                </button>
                <button 
                  onClick={() => setActiveTab('me')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'me' ? 'bg-steel-700 shadow-sm text-paper-100' : 'text-paper-100/50 hover:text-paper-100'}`}
                >
                  Assigned to Me
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto divide-y divide-steel-600">
              {displayedFIRs.map((fir, idx) => {
                const StatusIcon = STATUS_ICONS[fir.case_status];
                return (
                  <div key={fir.case_number} className="group flex items-center justify-between p-5 hover:bg-steel-600/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="hidden sm:flex flex-col items-center justify-center w-14 py-2 rounded-lg bg-steel-600/20 border border-steel-600/30 group-hover:border-phosphor-500/30 transition-colors">
                        <span className="text-[10px] text-paper-100/40 uppercase font-bold">Jul</span>
                        <span className="text-lg font-black text-paper-100 font-mono">{fir.date.split('-')[2]}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-mono font-bold text-phosphor-500 group-hover:text-phosphor-400 transition-colors">{fir.case_number}</p>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLORS[fir.case_status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {fir.case_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-paper-100 capitalize mb-1">{fir.crime_type.replace(/_/g, ' ')}</h4>
                        <div className="flex items-center gap-3 text-xs text-paper-100/50">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {fir.district}</span>
                          <span className="w-1 h-1 rounded-full bg-steel-600/50" />
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {fir.assignee === 'Me' ? 'Assigned to You' : 'Unassigned / Others'}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-paper-100/20 group-hover:text-paper-100 group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}
              {displayedFIRs.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-paper-100/50">No cases found for this filter.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-steel-600 bg-void-000">
              <Link href="/dashboard/logs" className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-phosphor-500 text-sm font-semibold transition-all">
                Query via AI Co-Pilot <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Hotspots & Alerts */}
        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-steel-600 bg-void-000">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-critical-500 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-paper-100">Crime Hotspots</h3>
                <p className="text-xs text-paper-100/50 uppercase tracking-wider">High Frequency Zones</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {HOTSPOT_AREAS.map((h, i) => {
                const percentage = (h.count / h.max) * 100;
                return (
                  <div key={i} className="group cursor-default">
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-paper-100 group-hover:text-phosphor-500 transition-colors">{h.area}</p>
                        <p className="text-[11px] text-paper-100/50 uppercase tracking-widest mt-0.5">{h.district}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black font-mono text-paper-100">{h.count}</span>
                        <span className="text-[10px] text-paper-100/40 ml-1">incidents</span>
                      </div>
                    </div>
                    {/* Progress bar container */}
                    <div className="h-1.5 w-full bg-steel-600 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full ${SEVERITY_COLORS[h.severity]} relative overflow-hidden transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      >
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-steel-600 bg-void-000">
              <Link href="/dashboard/map" className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-steel-600 hover:bg-steel-600/80 text-paper-100 text-sm font-semibold transition-all">
                Open Full Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          {/* System Announcement/Tip */}
          <div className="glass-card rounded-2xl p-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
             <div className="relative z-10 flex items-start gap-4">
               <div className="mt-1">
                 <Shield className="w-6 h-6 text-phosphor-500" />
               </div>
               <div>
                 <h4 className="text-sm font-semibold text-paper-100 mb-1">Tip: Voice Commands</h4>
                 <p className="text-xs text-paper-100/70 leading-relaxed">
                   Hold the spacebar anywhere on the dashboard to activate Drishti. Try asking <em>&quot;Show me hotspots in Bengaluru&quot;</em> or <em>&quot;Any new cases assigned to me?&quot;</em>
                 </p>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
