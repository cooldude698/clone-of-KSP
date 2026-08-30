'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  GitBranch,
  MessageSquare,
  FileText,
  Fingerprint,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Globe,
  Check,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import DrishtiLogo from '@/components/DrishtiLogo';
import QuickRoleSwitcher from '@/components/QuickRoleSwitcher';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { AnalystTelemetryProvider, useAnalystTelemetry } from '@/context/AnalystTelemetryContext';

export const ANALYST_NAV_ITEMS = [
  { href: '/analyst', icon: LayoutDashboard, label: 'Intelligence Overview', id: 'nav-overview' },
  { href: '/analyst/heatmap', icon: Map, label: 'Crime Density & Heatmap', id: 'nav-map' },
  { href: '/analyst/network', icon: GitBranch, label: 'Cross-District Syndicates', id: 'nav-network' },
  { href: '/analyst/patterns', icon: Fingerprint, label: 'Pattern & MO Intel', id: 'nav-patterns' },
  { href: '/analyst/reports', icon: FileText, label: 'FIR Deep Analytics', id: 'nav-fir' },
  { href: '/analyst/watchlist', icon: User, label: 'Recidivism Watchlist', id: 'nav-suspect' },
  { href: '/analyst/chat', icon: MessageSquare, label: 'Analyst Co-Pilot', id: 'nav-chat' },
];

function AnalystHeader() {
  const router = useRouter();
  const [officerName, setOfficerName] = useState('Dr. Priya Rao');
  const { language, setLanguage, supportedLanguages, currentLanguageObj } = useLanguage() as any;
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userName');
      if (stored && stored !== 'V. Sharma') setOfficerName(stored);
    } catch {}
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-transparent flex-shrink-0 z-10 relative">
      {/* Minimalist Rounded Pill Search */}
      <div className="relative w-72 sm:w-80">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search patterns, MO rings, FIRs, syndicates..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/10 shadow-xs transition-all"
        />
      </div>

      {/* Right Controls: Telemetry Badges, Language, Drishti AI Button, Bell, Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Analyst Status Badges (Teal Palette) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 shadow-xs text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono font-bold">SCRB SYNC:</span>
            <span className="text-[11px] font-mono font-bold">5.35L FIRS</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 shadow-xs text-xs font-semibold">
            <span className="text-[10px] uppercase font-mono font-bold">AI ACCURACY:</span>
            <span className="text-[11px] font-mono font-bold">97.4%</span>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200/80 text-xs font-bold text-gray-700 hover:border-gray-400 transition-all shadow-xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>{currentLanguageObj?.short || 'EN'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-gray-100 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Select Language
              </div>
              {supportedLanguages.map((l: any) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLanguage(l.id);
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                    language === l.id
                      ? 'bg-teal-50 text-teal-600 font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </div>
                  {language === l.id && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drishti AI Pill Button */}
        <Link
          href="/analyst/chat"
          className="px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span>Drishti AI</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="w-9 h-9 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>
        </div>

        {/* Avatar Circle */}
        <div className="w-9 h-9 rounded-full bg-teal-900 text-teal-100 flex items-center justify-center font-bold text-xs shadow-xs">
          PR
        </div>
      </div>
    </header>
  );
}

function AnalystSidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (val: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [officerName, setOfficerName] = useState('Dr. Priya Rao');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userName');
      if (stored && stored !== 'V. Sharma' && !stored.includes('Rajesh') && stored.includes('Priya')) {
        setOfficerName(stored);
      }
    } catch {}
  }, []);

  const isActive = (href: string) => {
    if (href === '/analyst') return pathname === '/analyst';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
    } catch {}
    router.push('/');
  };

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-gray-100 relative z-20 shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center px-4 py-5 ${collapsed ? 'justify-center px-2' : 'pr-6'}`}>
        <DrishtiLogo variant={collapsed ? 'icon' : 'compact'} size="md" href="/analyst" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {ANALYST_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center gap-3.5 px-4 py-3 text-xs font-semibold transition-all relative ${
                active
                  ? 'bg-slate-900 text-white rounded-2xl font-bold shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-2xl'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                  active ? 'text-teal-400' : 'text-gray-400 group-hover:text-gray-900'
                }`}
              />
              {!collapsed && <span className="tracking-normal truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-gray-900 text-white shadow-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className={`p-4 border-t border-gray-100 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50 mb-2">
            <div className="w-9 h-9 rounded-full bg-teal-900 text-teal-100 flex items-center justify-center font-bold text-xs">
              PR
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{officerName}</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">Chief Crime Analyst · SCRB</p>
            </div>
          </div>
        )}
        <button
          id="analyst-logout-btn"
          onClick={handleLogout}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-xs font-semibold ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <LanguageProvider>
      <AnalystTelemetryProvider>
        <div className="flex h-screen bg-[#F4F5F8] overflow-hidden text-slate-900 font-sans">
          <AnalystSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

          <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#F4F5F8]">
            <AnalystHeader />

            <main ref={mainContentRef} className="flex-1 overflow-auto px-4 sm:px-8 pb-8">
              {children}
            </main>
          </div>
        </div>
      </AnalystTelemetryProvider>
    </LanguageProvider>
  );
}
