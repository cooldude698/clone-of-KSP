'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  BarChart3,
  Radio,
  ChevronDown,
  ArrowRight,
  Check,
  Zap,
  Sparkles,
  Users,
  Compass
} from 'lucide-react';

const ROLES = [
  {
    id: 'inspector',
    label: 'Field Inspector',
    shortLabel: 'Inspector',
    roleTag: 'INVESTIGATION',
    jurisdiction: 'HSR Layout PS · Field Investigation',
    officer: 'Insp. V. Sharma',
    badgeNo: 'KSP-4092',
    href: '/dashboard',
    icon: Shield,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    borderClass: 'border-blue-200 dark:border-blue-800',
    activeIndicator: 'bg-blue-500',
    capabilities: ['FIR Dossiers & Panchanama', 'Evidence Wall & Custom Pins', 'ANPR Vehicle Trail Scrubber', 'Suspect Registry & Aliases']
  },
  {
    id: 'analyst',
    label: 'Crime Intelligence Analyst',
    shortLabel: 'Analyst',
    roleTag: 'SCRB INTEL',
    jurisdiction: 'SCRB State Crime Intelligence Command',
    officer: 'Dr. Priya Rao',
    badgeNo: 'SCRB-8801',
    href: '/analyst',
    icon: BarChart3,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/50',
    borderClass: 'border-purple-200 dark:border-purple-800',
    activeIndicator: 'bg-purple-500',
    capabilities: ['Multi-layer Crime Heatmaps', 'Cross-District Network Graphs', 'Pattern & MO Intel Clusters', 'Predictive Crime Trends']
  },
  {
    id: 'supervisor',
    label: 'Command Supervisor',
    shortLabel: 'Supervisor',
    roleTag: 'HQ DISPATCH',
    jurisdiction: 'Bengaluru Police HQ · Sector Command',
    officer: 'DCP K. Reddy',
    badgeNo: 'BPS-102',
    href: '/supervisor',
    icon: Radio,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    activeIndicator: 'bg-emerald-500',
    capabilities: ['112 Fleet & Patrol Tracking', 'Sanctions & Arrest Warrants', 'Emergency QRT Broadcast', 'Station Audit & Telemetry']
  }
];

export default function QuickRoleSwitcher({ compact = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine current active role from route pathname
  const currentRole = ROLES.find(r => pathname?.startsWith(r.href)) || ROLES[0];
  const CurrentIcon = currentRole.icon;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
      // Alt + R shortcut to toggle Role Switcher
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectRole = (role) => {
    setIsOpen(false);
    if (pathname !== role.href && !pathname?.startsWith(role.href)) {
      router.push(role.href);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="quick-role-switcher-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#18181B] border border-gray-200/90 dark:border-zinc-800 text-xs font-bold text-gray-800 dark:text-gray-100 hover:border-gray-400 dark:hover:border-zinc-600 shadow-2xs transition-all cursor-pointer ${
          isOpen ? 'ring-2 ring-blue-500/20 border-blue-400 dark:border-blue-600' : ''
        }`}
        title="Quick Role Switcher (Alt + R): Inspector / Analyst / Supervisor"
      >
        <span className={`w-2 h-2 rounded-full ${currentRole.activeIndicator} animate-pulse shrink-0`} />
        
        <div className="flex items-center gap-1.5">
          <CurrentIcon className={`w-3.5 h-3.5 ${currentRole.colorClass} shrink-0`} />
          <span className="font-extrabold tracking-tight hidden sm:inline">{currentRole.label}</span>
          <span className="font-extrabold tracking-tight sm:hidden">{currentRole.shortLabel}</span>
        </div>

        <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 hidden md:inline">
          [{currentRole.roleTag}]
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'group-hover:text-gray-700 dark:group-hover:text-zinc-200'}`} />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200/90 dark:border-zinc-800 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
          
          {/* Header Banner */}
          <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800/80 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                KSP Command Portal Switcher
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-zinc-500">
              Alt + R
            </span>
          </div>

          {/* Role Cards List */}
          <div className="space-y-1.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = currentRole.id === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex flex-col gap-1.5 relative ${
                    isActive
                      ? `${role.bgClass} ${role.borderClass} ring-1 ${role.colorClass.includes('blue') ? 'ring-blue-400/40' : role.colorClass.includes('purple') ? 'ring-purple-400/40' : 'ring-emerald-400/40'}`
                      : 'bg-white dark:bg-zinc-900/60 border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:border-gray-200 dark:hover:border-zinc-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isActive ? `${role.bgClass} ${role.borderClass} ${role.colorClass}` : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                            {role.label}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${role.bgClass} ${role.colorClass} border ${role.borderClass}`}>
                            {role.roleTag}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                          {role.jurisdiction}
                        </p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                        <Check className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0">
                        <span>Switch</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Capabilities Chip Strip */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-gray-100 dark:border-zinc-800/60">
                    <span className="text-[9.5px] text-gray-400 dark:text-zinc-500 font-mono">
                      Officer: <strong className="text-gray-700 dark:text-zinc-300 font-semibold">{role.officer}</strong>
                    </span>
                    <span className="text-[9.5px] text-gray-300 dark:text-zinc-600">·</span>
                    <span className="text-[9.5px] text-gray-500 dark:text-zinc-400 truncate max-w-[210px]">
                      {role.capabilities.slice(0, 2).join(' · ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80 px-2 flex items-center justify-between text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
            <span>DRISHTI Role Intelligence v2.4</span>
            <span>Real-Time Sync Active</span>
          </div>

        </div>
      )}
    </div>
  );
}
