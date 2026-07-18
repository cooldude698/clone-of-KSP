'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart2, MapPin, AlertOctagon } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const MONTHLY_DATA = [
  { month: 'Aug', crimes: 312, solved: 178 },
  { month: 'Sep', crimes: 298, solved: 165 },
  { month: 'Oct', crimes: 341, solved: 190 },
  { month: 'Nov', crimes: 289, solved: 162 },
  { month: 'Dec', crimes: 267, solved: 155 },
  { month: 'Jan', crimes: 301, solved: 172 },
  { month: 'Feb', crimes: 318, solved: 184 },
  { month: 'Mar', crimes: 356, solved: 198 },
  { month: 'Apr', crimes: 334, solved: 189 },
  { month: 'May', crimes: 342, solved: 195 },
  { month: 'Jun', crimes: 365, solved: 204 },
  { month: 'Jul', crimes: 322, solved: 186 },
];

const DISTRICT_DATA = [
  { district: 'Bengaluru Urban', count: 1284, color: '#c8372d' },
  { district: 'Mysuru',         count: 487,  color: '#e05a3a' },
  { district: 'Hubballi',       count: 312,  color: '#f0a848' },
  { district: 'Mangaluru',      count: 278,  color: '#4A8B6F' },
  { district: 'Belagavi',       count: 245,  color: '#2d7a5a' },
  { district: 'Kalaburagi',     count: 198,  color: '#5fa8f0' },
];

const CRIME_TYPES = [
  { type: 'Vehicle Theft',   count: 423, pct: 33 },
  { type: 'Chain Snatching', count: 287, pct: 22 },
  { type: 'Robbery',         count: 201, pct: 16 },
  { type: 'Assault',         count: 189, pct: 15 },
  { type: 'Burglary',        count: 162, pct: 13 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-steel-700 border border-steel-600/60 rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-paper-100/50 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [role, setRole] = useState('Analyst');
  useEffect(() => { setRole(localStorage.getItem('drishti_role') || 'Analyst'); }, []);

  const totalCrimes = MONTHLY_DATA.reduce((s, m) => s + m.crimes, 0);
  const totalSolved = MONTHLY_DATA.reduce((s, m) => s + m.solved, 0);
  const solveRate = Math.round((totalSolved / totalCrimes) * 100);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-paper-100">Crime Analytics</h2>
          <p className="text-xs text-paper-100/50 mt-0.5">Karnataka State -- Last 12 months</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-phosphor-500/10 border border-phosphor-500/20">
          <BarChart2 className="w-3.5 h-3.5 text-phosphor-500" />
          <span className="text-xs text-phosphor-500 font-medium">Live Analytics</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total FIRs (YTD)', value: totalCrimes.toLocaleString(), up: true,  change: '+8.2%',  color: 'text-phosphor-500' },
          { label: 'Cases Solved',     value: totalSolved.toLocaleString(), up: true,  change: '+11%',   color: 'text-success-500' },
          { label: 'Solve Rate',       value: `${solveRate}%`,              up: true,  change: '+2.4pp', color: 'text-success-500' },
          { label: 'Active Districts', value: '30',                         up: false, change: '-',      color: 'text-paper-100/50' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card rounded-xl p-4 border border-steel-600/40">
            <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-paper-100/50 mt-1">{kpi.label}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs ${kpi.up ? 'text-success-500' : 'text-critical-500'}`}>
              {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-xl border border-steel-600/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-steel-600/40">
            <p className="text-sm font-semibold text-paper-100">Monthly Crime Trend</p>
            <p className="text-xs text-paper-100/50 mt-0.5">Registered FIRs vs Solved cases</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,71,80,0.4)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.5 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.5 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} formatter={(v) => <span style={{ color: 'var(--color-paper-100)', opacity: 0.6 }}>{v}</span>} />
                <Line type="monotone" dataKey="crimes" stroke="#c8372d" strokeWidth={2} dot={false} name="Registered" />
                <Line type="monotone" dataKey="solved"  stroke="#4A8B6F" strokeWidth={2} dot={false} name="Solved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-steel-600/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-steel-600/40">
            <p className="text-sm font-semibold text-paper-100">Top Crime Districts</p>
            <p className="text-xs text-paper-100/50 mt-0.5">FIRs by district (YTD)</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DISTRICT_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,71,80,0.4)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.5 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="district" type="category" tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.7 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="FIRs">
                  {DISTRICT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-xl border border-steel-600/40">
          <div className="px-5 py-4 border-b border-steel-600/40">
            <p className="text-sm font-semibold text-paper-100">Crime Type Breakdown</p>
          </div>
          <div className="p-4 space-y-3">
            {CRIME_TYPES.map((c) => (
              <div key={c.type} className="flex items-center gap-3">
                <span className="text-xs text-paper-100/60 w-28 flex-shrink-0">{c.type}</span>
                <div className="flex-1 h-2 bg-steel-600/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-phosphor-500 rounded-full transition-all duration-700"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-paper-100/60 w-8 text-right">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl border border-steel-600/40">
          <div className="px-5 py-4 border-b border-steel-600/40 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-warn-500" />
            <p className="text-sm font-semibold text-paper-100">Under-Reporting Zones</p>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs text-paper-100/50 mb-3">Districts with FIR rate greater than 40% below state average</p>
            {[
              { district: 'Raichur', rate: 18.2, expected: 45.1 },
              { district: 'Bidar',   rate: 21.4, expected: 45.1 },
              { district: 'Yadgir',  rate: 23.7, expected: 45.1 },
              { district: 'Koppal',  rate: 26.8, expected: 45.1 },
            ].map((z) => (
              <div key={z.district} className="flex items-center justify-between p-3 rounded-lg bg-warn-500/5 border border-warn-500/15">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-warn-500" />
                  <div>
                    <p className="text-sm text-paper-100/90">{z.district}</p>
                    <p className="text-[10px] text-paper-100/40">Expected: {z.expected} FIRs/lakh</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-warn-500 font-mono">{z.rate}</p>
                  <p className="text-[10px] text-paper-100/40">FIRs/lakh</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}