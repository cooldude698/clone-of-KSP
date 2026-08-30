'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  BarChart3,
  Radio,
  ChevronDown,
  Check,
  Compass,
  ArrowRight
} from 'lucide-react';

const ROLES = [
  {
    id: 'inspector',
    name: 'Field Inspector',
    officer: 'Insp. V. Sharma',
    station: 'HSR Layout PS',
    href: '/dashboard',
    icon: Shield,
  },
  {
    id: 'analyst',
    name: 'Crime Analyst',
    officer: 'Dr. Priya Rao',
    station: 'SCRB Command',
    href: '/analyst',
    icon: BarChart3,
  },
  {
    id: 'supervisor',
    name: 'Command Supervisor',
    officer: 'DCP K. Reddy',
    station: 'Bengaluru City HQ',
    href: '/supervisor',
    icon: Radio,
  }
];

export default function QuickRoleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Match current active role
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
    if (!pathname?.startsWith(role.href)) {
      router.push(role.href);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Pill Button matching DRISHTI Top Bar */}
      <button
        type="button"
        id="quick-role-switcher-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-600 transition-all shadow-xs cursor-pointer"
        title="Switch Portal (Alt + R): Inspector / Analyst / Supervisor"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-bold tracking-tight">{currentRole.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180 text-gray-700 dark:text-gray-200' : ''}`} />
      </button>

      {/* Clean Minimalist Menu matching Language Dropdown Theme */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-gray-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
          
          {/* Header */}
          <div className="px-3.5 py-1.5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            <span>Select Role Portal</span>
            <span className="font-mono">Alt + R</span>
          </div>

          {/* Role Items */}
          <div className="p-1 space-y-0.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = currentRole.id === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {role.name}
                      </p>
                      <p className={`text-[10px] truncate leading-tight mt-0.5 ${
                        isActive ? 'text-white/80 dark:text-black/70' : 'text-gray-400 dark:text-zinc-500'
                      }`}>
                        {role.officer} · {role.station}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <Check className="w-4 h-4 shrink-0 text-white dark:text-black ml-2" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-gray-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
