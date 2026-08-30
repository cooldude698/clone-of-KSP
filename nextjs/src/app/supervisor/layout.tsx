'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardCheck,
  Navigation,
  GitBranch,
  AlertTriangle,
  History,
  Bot,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Clock,
  Shield,
  Sparkles,
  Search,
  Globe,
  Check,
  ChevronDown
} from 'lucide-react';
import DrishtiLogo from '@/components/DrishtiLogo';
import useDrishtiVoice from '@/components/DrishtiVoice';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { SupervisorTelemetryProvider, useSupervisorTelemetry } from '@/context/SupervisorTelemetryContext';
import { cleanTextForSpeech } from '@/lib/speechUtils';

// Lazy load Drishti floating components
const DrishtiOrb = dynamic(() => import('@/components/DrishtiOrb'), { ssr: false });
const DrishtiPanel = dynamic(() => import('@/components/DrishtiPanel'), { ssr: false });
const AlertNotification = dynamic(() => import('@/components/AlertNotification'), { ssr: false });
import QuickRoleSwitcher from '@/components/QuickRoleSwitcher';

export const SUPERVISOR_NAV_ITEMS = [
  {
    href: '/supervisor',
    icon: LayoutDashboard,
    label: 'Operations Command',
    id: 'nav-sup-ops',
  },
  {
    href: '/supervisor/performance',
    icon: Users,
    label: 'Officer & Station Performance',
    id: 'nav-sup-performance',
  },
  {
    href: '/supervisor/assignment',
    icon: CheckSquare,
    label: 'Case Assignment',
    id: 'nav-sup-assignment',
  },
  {
    href: '/supervisor/approvals',
    icon: ClipboardCheck,
    label: 'Sanctions & Warrants',
    id: 'nav-sup-approvals',
  },
  {
    href: '/supervisor/dispatch',
    icon: Navigation,
    label: 'Fleet & Patrol Dispatch',
    id: 'nav-sup-dispatch',
  },
  {
    href: '/supervisor/network',
    icon: GitBranch,
    label: 'Cross-Station Network Graph',
    id: 'nav-sup-network',
  },
  {
    href: '/supervisor/escalations',
    icon: AlertTriangle,
    label: 'Emergency Broadcast & QRT',
    id: 'nav-sup-escalations',
  },
  {
    href: '/supervisor/audit',
    icon: History,
    label: 'Audit & Compliance Logs',
    id: 'nav-sup-audit',
  },
  {
    href: '/supervisor/chat',
    icon: Bot,
    label: 'Supervisor Co-Pilot',
    id: 'nav-sup-chat',
  },
];

function SupervisorHeader({ onOpenDrishti }: { onOpenDrishti: () => void }) {
  const { tick, lastUpdated, isPulseActive, avgResponseTimeSec, pendingSanctionsCount } = useSupervisorTelemetry();
  const { language, setLanguage, supportedLanguages, currentLanguageObj, t } = useLanguage() as any;
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const minutes = Math.floor(avgResponseTimeSec / 60);
  const seconds = avgResponseTimeSec % 60;
  const timeFormatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

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
          placeholder="Search officers, stations, approvals, FIRs..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200/80 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 shadow-xs transition-all"
        />
      </div>

      {/* Right Section: Live Telemetry, Role Switcher, Language, Drishti AI & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Streamlined Live Fleet & ETA Capsule */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200/80 shadow-xs text-xs font-semibold text-gray-700 whitespace-nowrap">
          <span
            className={`w-2 h-2 rounded-full transition-all shrink-0 ${
              isPulseActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="font-mono text-gray-900 font-bold">142 Patrols Active</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500 font-mono text-[11px]">112 ETA: {timeFormatted}</span>
        </div>

        {pendingSanctionsCount > 0 && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span className="font-mono text-[11px] font-bold uppercase">{pendingSanctionsCount} Sanctions</span>
          </div>
        )}

        {/* Quick Role Switcher */}
        <QuickRoleSwitcher />

        {/* Interactive Language Selector Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            id="sup-language-selector-btn"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200/80 text-xs font-bold text-gray-700 hover:border-gray-400 transition-all shadow-xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>{currentLanguageObj?.short || 'EN'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-gray-100 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Select Language
              </div>
              {supportedLanguages.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLanguage(l.id);
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                    language === l.id
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </div>
                  {language === l.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant Quick Trigger (Black Pill) */}
        <button
          onClick={onOpenDrishti}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold hover:opacity-90 shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Drishti AI</span>
        </button>

        {/* Notification Bell */}
        <AlertNotification />

        {/* Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            RK
          </div>
        </div>
      </div>
    </header>
  );
}

function SupervisorSidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (val: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [officerName, setOfficerName] = useState('Dr. Rajesh Kumar, IPS');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userName');
      if (stored && stored !== 'V. Sharma' && stored !== 'Dr. Priya Rao') setOfficerName(stored);
    } catch {}
  }, []);

  const isActive = (href: string) => {
    if (href === '/supervisor') return pathname === '/supervisor';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('drishti_role');
      localStorage.removeItem('drishti_employee_id');
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
        <DrishtiLogo variant={collapsed ? 'icon' : 'compact'} size="md" href="/supervisor" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {SUPERVISOR_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              id={item.id}
              className={`flex items-center transition-all duration-150 group relative text-sm font-semibold rounded-2xl ${
                collapsed ? 'w-12 h-12 justify-center mx-auto' : 'gap-3.5 px-4 py-3'
              } ${
                active
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                  active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'
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
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-700">
              RK
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{officerName}</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">DySP · Central Command</p>
            </div>
          </div>
        )}
        <button
          id="sup-logout-btn"
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

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all z-30 shadow-sm cursor-pointer"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [response, setResponse] = useState<any>(null);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [pendingTranscript, setPendingTranscript] = useState('');
  const [orbResponse, setOrbResponse] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // Auto-scroll main content area to top on page navigation
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  const {
    startListening,
    stopListeningAndGetTranscript,
    speak,
    stopSpeaking,
    requestMicPermission,
    isListening,
    isSpeaking,
    liveTranscript,
    micPermission,
    audioLevel,
  } = (useDrishtiVoice as any)({
    enableClapWake: false,
    onSpeakStart: () => setOrbState('speaking'),
    onSpeakEnd: () => setOrbState('idle'),
  });

  const handleQuery = useCallback(async (queryText: string) => {
    if (!queryText?.trim()) return;
    setOrbState('thinking');
    const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setSessionLogs((prev) => [...prev, { role: 'user', content: queryText, timestamp: ts }]);

    try {
      const res = await fetch('/api/askDrishtiAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          portal: 'supervisor',
          role: 'Supervisor',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.answer || data.response_text || 'Acknowledged, Sir. Query processed.';
        setResponse({
          response_text: text,
          follow_up_suggestions: data.follow_up_suggestions || [],
          confidence: 0.95,
        });
        setOrbResponse(text);
        setSessionLogs((prev) => [...prev, { role: 'assistant', content: text, timestamp: ts }]);
        setOrbState('speaking');
        if (!isMuted) speak(cleanTextForSpeech(text), 'en-IN');
      } else {
        throw new Error('API query failed');
      }
    } catch {
      const fallback = 'Jai Hind, Sir. DRISHTI Supervisory Co-Pilot is standing by across all 4 division stations.';
      setResponse({ response_text: fallback, follow_up_suggestions: [] });
      setOrbResponse(fallback);
      setOrbState('idle');
    }
  }, [isMuted, speak]);

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => {
    setIsPanelOpen(false);
    stopSpeaking();
    setOrbState('idle');
  };

  const OrbComponent = DrishtiOrb as any;
  const PanelComponent = DrishtiPanel as any;

  return (
    <LanguageProvider>
      <SupervisorTelemetryProvider>
        <div className="flex h-screen bg-[#F4F5F8] overflow-hidden">
          <SupervisorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

          <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#F4F5F8]">
            <SupervisorHeader onOpenDrishti={openPanel} />

            <main ref={mainContentRef} className="flex-1 overflow-auto px-4 sm:px-8 pb-8">
              {children}
            </main>
          </div>

          {/* Drishti AI Floating Orb & Panel */}
          {pathname !== '/supervisor/chat' && (
            <>
              {isPanelOpen ? (
                <div className="fixed top-[12px] right-[382px] z-[9996]">
                  <OrbComponent
                    state={orbState}
                    onClick={closePanel}
                    compact={true}
                    audioLevel={isListening ? audioLevel : 0}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted((p) => !p)}
                  />
                </div>
              ) : (
                <OrbComponent
                  state={orbState}
                  onClick={openPanel}
                  compact={false}
                  audioLevel={isListening ? audioLevel : 0}
                  pendingTranscript={pendingTranscript}
                  orbResponse={orbResponse}
                  onConfirmSend={() => {
                    handleQuery(pendingTranscript);
                    setPendingTranscript('');
                  }}
                  onCancelTranscript={() => setPendingTranscript('')}
                  showTypingInput={false}
                  onToggleTyping={() => {}}
                  typingText=""
                  onTypingChange={() => {}}
                  onTypingSubmit={() => {}}
                  onPttStart={() => {
                    if (isSpeaking) stopSpeaking();
                    setOrbState('listening');
                    startListening('en-IN');
                  }}
                  onPttEnd={async () => {
                    const text = await stopListeningAndGetTranscript();
                    setOrbState('idle');
                    if (text?.trim()) setPendingTranscript(text.trim());
                  }}
                  isListening={isListening}
                  liveTranscript={liveTranscript}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((p) => !p)}
                  onReadAloud={() => {
                    if (orbResponse) speak(cleanTextForSpeech(orbResponse), 'en-IN');
                  }}
                  onOpenPanel={openPanel}
                  onDismissResponse={() => setOrbResponse('')}
                  isSpeaking={isSpeaking || orbState === 'speaking'}
                  onStopSpeaking={() => {
                    stopSpeaking();
                    setOrbState('idle');
                  }}
                  suggestions={response?.follow_up_suggestions || []}
                  onSelectSuggestion={(sug: string) => handleQuery(sug)}
                />
              )}

              <PanelComponent
                isOpen={isPanelOpen}
                onClose={closePanel}
                orbState={orbState}
                liveTranscript={liveTranscript}
                response={response}
                sessionLogs={sessionLogs}
                onSendText={handleQuery}
                onChipClick={handleQuery}
                onPttStart={() => {
                  if (isSpeaking) stopSpeaking();
                  setOrbState('listening');
                  startListening('en-IN');
                }}
                onPttEnd={async () => {
                  const text = await stopListeningAndGetTranscript();
                  setOrbState('idle');
                  if (text?.trim()) handleQuery(text.trim());
                }}
                isSpeaking={isSpeaking}
                onStopSpeaking={stopSpeaking}
                isListening={isListening}
                language="en"
                onLanguageChange={() => {}}
                greetingText="Jai Hind, Sir. DRISHTI Supervisory Command is active."
                micPermission={micPermission}
                onRequestMicPermission={requestMicPermission}
                orbPinned={true}
                onToggleOrbPin={() => {}}
                onSpeakText={(text: string) => speak(cleanTextForSpeech(text), 'en-IN')}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((p) => !p)}
              />
            </>
          )}
        </div>
      </SupervisorTelemetryProvider>
    </LanguageProvider>
  );
}
