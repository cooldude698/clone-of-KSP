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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Fingerprint,
  Radio,
  SlidersHorizontal,
  Shield,
  Clock,
  Globe,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Building2,
  Scale,
  User,
  Map,
  History,
  Navigation,
  Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import DrishtiLogo from '@/components/DrishtiLogo';
import QuickRoleSwitcher from '@/components/QuickRoleSwitcher';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { AnalystTelemetryProvider, useAnalystTelemetry } from '@/context/AnalystTelemetryContext';

const ANALYST_NAV_ITEMS = [
  { href: '/analyst', icon: LayoutDashboard, label: 'Overview', id: 'nav-overview' },
  { href: '/analyst/heatmap', icon: Map, label: 'Crime Map', id: 'nav-map' },
  { href: '/analyst/network', icon: GitBranch, label: 'Network Graph', id: 'nav-network' },
  { href: '/analyst/chat', icon: MessageSquare, label: 'Co-Pilot Chat', id: 'nav-chat' },
  { href: '/analyst/reports', icon: FileText, label: 'FIR Registry', id: 'nav-fir' },
  { href: '/analyst/patterns', icon: Fingerprint, label: 'Pattern & MO Intel', id: 'nav-patterns' },
  { href: '/analyst/watchlist', icon: User, label: 'Suspect Roster', id: 'nav-suspect' },
];

function AnalystHeader() {
  const router = useRouter();
  const [officerName, setOfficerName] = useState('Dr. Priya Rao');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userName');
      if (stored && stored !== 'V. Sharma') setOfficerName(stored);
    } catch {}
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between transition-colors">
      {/* Left: Clean Brand Logo */}
      <div className="flex items-center gap-3">
        <DrishtiLogo variant="compact" size="md" href="/analyst" />
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs w-80 text-slate-500 hover:border-slate-400 dark:hover:border-slate-600 transition-all">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search cases, suspects, FIRs..."
          className="bg-transparent border-none outline-none w-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
          readOnly
        />
      </div>

      {/* Right Controls: Language, Drishti AI Button, Bell, Avatar, Theme */}
      <div className="flex items-center gap-3">
        {/* Language selector pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>EN</span>
        </div>

        {/* Drishti AI pill button */}
        <Link
          href="/analyst/chat"
          className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
          <span>Drishti AI</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User profile avatar circle */}
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shadow-xs">
          PR
        </div>

        {/* Theme toggle */}
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
      className={`fixed top-[53px] bottom-0 left-0 z-30 bg-white dark:bg-[#18181B] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="p-3 flex flex-col gap-1 overflow-y-auto flex-1 custom-scrollbar">
        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-700 transition-all ml-auto cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {ANALYST_NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === 0 ? pathname === '/analyst' : pathname.startsWith(item.href) && item.href !== '/analyst';

            return (
              <Link
                key={item.label + idx}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white dark:text-black' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: User Profile & Sign Out (Matching Inspector Style) */}
      <div className={`p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs">
              PR
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{officerName}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">Chief Crime Analyst</p>
            </div>
          </div>
        )}
        <button
          id="analyst-logout-btn"
          onClick={() => {
            localStorage.clear();
            router.push('/');
          }}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-xs font-semibold cursor-pointer ${
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
        <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0B0F17] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
          <AnalystHeader />

          <div className="flex flex-1 pt-0">
            <AnalystSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main
              className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-53px)] ${
                isCollapsed ? 'ml-16' : 'ml-60'
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
