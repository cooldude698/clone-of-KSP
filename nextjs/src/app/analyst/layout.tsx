'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  GitBranch,
  SlidersHorizontal,
  FileSearch,
  Users,
  MessageSquare,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  LogOut,
  Globe,
  Check,
  Radio,
  Sliders
} from 'lucide-react';
import dynamic from 'next/dynamic';
import DrishtiLogo from '@/components/DrishtiLogo';
import QuickRoleSwitcher from '@/components/QuickRoleSwitcher';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { AnalystTelemetryProvider } from '@/context/AnalystTelemetryContext';

const AlertNotification = dynamic(() => import('@/components/AlertNotification'), { ssr: false });

const ANALYST_NAV_ITEMS = [
  { id: 'overview', label: 'Intelligence Overview', href: '/analyst', icon: LayoutDashboard },
  { id: 'workbench', label: 'Intel Workbench', href: '/analyst/workbench', icon: Sliders },
  { id: 'heatmap', label: 'Crime Density & Heatmap', href: '/analyst/heatmap', icon: Map },
  { id: 'network', label: 'Cross-District Syndicates', href: '/analyst/network', icon: GitBranch },
  { id: 'patterns', label: 'Pattern & MO Intel', href: '/analyst/patterns', icon: SlidersHorizontal },
  { id: 'reports', label: 'FIR Deep Analytics', href: '/analyst/reports', icon: FileSearch },
  { id: 'watchlist', label: 'Recidivism Watchlist', href: '/analyst/watchlist', icon: Users },
  { id: 'chat', label: 'Analyst Co-Pilot', href: '/analyst/chat', icon: MessageSquare },
];

function AnalystHeader() {
  const { language, setLanguage, supportedLanguages, currentLanguageObj } = useLanguage() as any;
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [officerName, setOfficerName] = useState('Dr. Priya Rao');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userName');
      if (stored && stored.includes('Priya')) setOfficerName(stored);
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

      {/* Right Controls: Quick Role Switcher, Telemetry Badges, Language, Drishti AI Button, Bell, Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Real-time Analyst Status Badges (Teal / Indigo Palette) */}
        <div className="hidden xl:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 shadow-xs text-xs font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] text-teal-700 font-medium">SCRB Sync:</span>
            <span className="text-xs font-bold font-heading text-teal-900">5.35L FIRs</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-800 shadow-xs text-xs font-semibold whitespace-nowrap">
            <span className="text-[11px] text-indigo-600 font-medium">Accuracy:</span>
            <span className="text-xs font-bold font-heading text-indigo-900">97.4%</span>
          </div>
        </div>

        {/* Quick Role Switcher */}
        <QuickRoleSwitcher />

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
                      ? 'bg-teal-50 text-teal-700 font-bold'
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
        <AlertNotification />

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
      if (stored && stored.includes('Priya')) setOfficerName(stored);
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
                  ? 'bg-[#0F5257] text-white rounded-2xl font-bold shadow-sm'
                  : 'text-gray-600 hover:text-[#0F5257] hover:bg-[#F5F7F7] rounded-2xl'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                  active ? 'text-teal-300' : 'text-gray-400 group-hover:text-[#0F5257]'
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
        <div className="flex h-screen bg-[#F5F7F7] overflow-hidden text-[#14201F] font-sans">
          {/* Main Sidebar */}
          <AnalystSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            {/* Header */}
            <AnalystHeader />

            {/* Scrollable Page Viewport */}
            <main ref={mainContentRef} className="flex-1 overflow-y-auto px-6 sm:px-8 pb-10 custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </AnalystTelemetryProvider>
    </LanguageProvider>
  );
}
