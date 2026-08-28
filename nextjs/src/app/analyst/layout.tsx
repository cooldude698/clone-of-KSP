'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  MapPin,
  Sparkles,
  GitBranch,
  FileSpreadsheet,
  ShieldAlert,
  Bot,
  Layers,
  ChevronLeft,
  ChevronRight,
  Radio,
  Activity,
  ArrowRightLeft,
  LogOut,
  Bell,
  Cpu,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Flame,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import DrishtiLogo from '@/components/DrishtiLogo';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { AnalystTelemetryProvider, useAnalystTelemetry } from '@/context/AnalystTelemetryContext';

const ANALYST_NAV_ITEMS = [
  {
    href: '/analyst',
    icon: BarChart3,
    label: 'Intelligence Hub',
    badge: 'LIVE 3s',
    desc: 'KPIs, trend forecasts & real-time anomaly stream',
  },
  {
    href: '/analyst/heatmap',
    icon: MapPin,
    label: 'Predictive Heatmap',
    badge: 'AI SPATIAL',
    desc: 'Time-sliced density & 7-day projection zones',
  },
  {
    href: '/analyst/patterns',
    icon: Fingerprint,
    label: 'Pattern & MO Intel',
    badge: 'CLUSTERING',
    desc: 'Modus Operandi correlation & repeat offenders',
  },
  {
    href: '/analyst/network',
    icon: GitBranch,
    label: 'Syndicate Nexus',
    badge: 'MULTI-HOP',
    desc: 'Criminal ring link analysis & kingpin graph',
  },
  {
    href: '/analyst/reports',
    icon: FileSpreadsheet,
    label: 'Report Generator',
    badge: 'EXPORT',
    desc: 'Weekly digests, PDF briefs & comparative tables',
  },
  {
    href: '/analyst/watchlist',
    icon: ShieldAlert,
    label: 'Intelligence Watchlist',
    badge: 'TRIGGERS',
    desc: 'High-threat targets, volatile zones & ANPR pings',
  },
  {
    href: '/analyst/chat',
    icon: Bot,
    label: 'Analyst Co-Pilot',
    badge: 'AI CORE',
    desc: 'Specialized deep statistical querying agent',
  },
];

function AnalystHeader() {
  const router = useRouter();
  const { tick, lastUpdated, isPulseActive, confidenceScore, latestAnomaly } = useAnalystTelemetry();
  const [officerName, setOfficerName] = useState('Dr. Priya Rao');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userName');
      if (stored && stored !== 'V. Sharma') setOfficerName(stored);
    } catch {}
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--surface-0)]/90 border-b border-[var(--border)] px-4 sm:px-6 py-2.5 flex items-center justify-between transition-colors duration-200">
      {/* Left: Clean Brand Logo */}
      <div className="flex items-center gap-3">
        <DrishtiLogo variant="compact" size="md" href="/analyst" />
      </div>

      {/* Center: Real-time 3s Pulse & Dynamic Live Telemetry */}
      <div className="hidden md:flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--surface-1)] border border-[var(--border)] shadow-inner">
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isPulseActive ? 'bg-[var(--cyan-accent)] scale-110 shadow-sm shadow-[var(--cyan-accent)]' : 'bg-gray-400 scale-90'
            }`}
          />
          <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
            3s TELEMETRY:
          </span>
          <span className="text-[11px] font-semibold text-[var(--text-primary)]" suppressHydrationWarning>
            #{tick} · {confidenceScore}% CONFIDENCE
          </span>
        </div>

        {/* Streaming Anomaly Feed Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--surface-1)] border border-[var(--border)] max-w-sm overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-critical)] animate-ping" />
          <span className="text-[10px] font-bold text-[var(--status-critical)] uppercase tracking-wide">
            LIVE:
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] truncate" suppressHydrationWarning>
            {latestAnomaly.title} ({latestAnomaly.location})
          </span>
        </div>
      </div>

      {/* Right: Timestamp & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Time Stamp */}
        <div className="hidden sm:block px-2.5 py-1 rounded bg-[var(--surface-1)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-secondary)]" suppressHydrationWarning>
          {lastUpdated || '18:00:00 IST'}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}

function AnalystSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (val: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [officerName, setOfficerName] = useState('Dr. Priya Rao');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userName');
      if (stored && stored !== 'V. Sharma') setOfficerName(stored);
    } catch {}
  }, []);

  return (
    <aside
      className={`fixed top-[53px] bottom-0 left-0 z-30 bg-[var(--surface-0)] border-r border-[var(--border)] transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3 flex flex-col gap-1 overflow-y-auto flex-1 custom-scrollbar">
        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
          {!isCollapsed && (
            <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.15em] font-bold">
              Analyst Workspaces
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-all ml-auto cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {ANALYST_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--accent)] text-white font-bold shadow-md shadow-[var(--accent-glow)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-[var(--cyan-accent)]'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate tracking-normal">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: User Profile & Sign Out (Matching Inspector Style) */}
      <div className={`p-4 border-t border-[var(--border)] bg-[var(--surface-0)] ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] mb-2 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
              PR
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{officerName}</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono font-medium truncate">Chief Crime Analyst</p>
            </div>
          </div>
        )}
        <button
          id="analyst-logout-btn"
          onClick={() => {
            localStorage.clear();
            router.push('/');
          }}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-all text-xs font-semibold cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <LanguageProvider>
      <AnalystTelemetryProvider>
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-200">
          <AnalystHeader />

          <div className="flex flex-1 pt-0">
            <AnalystSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main
              className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-53px)] ${
                isCollapsed ? 'ml-16' : 'ml-64'
              }`}
            >
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </AnalystTelemetryProvider>
    </LanguageProvider>
  );
}
