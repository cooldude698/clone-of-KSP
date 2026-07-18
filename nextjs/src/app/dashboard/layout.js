'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Map, GitBranch,
  Camera, BarChart2, LogOut, Shield, ChevronLeft,
  ChevronRight, AlertTriangle, User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import AlertNotification from '@/components/AlertNotification';
import DrishtiOrb from '@/components/DrishtiOrb';
import DrishtiPanel from '@/components/DrishtiPanel';
import useDrishtiVoice from '@/components/DrishtiVoice';

const NAV_ITEMS = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Overview',       id: 'nav-overview' },
  { href: '/dashboard/chat',         icon: MessageSquare,   label: 'Co-Pilot Chat',  id: 'nav-chat' },
  { href: '/dashboard/map',          icon: Map,             label: 'Crime Map',      id: 'nav-map' },
  { href: '/dashboard/network',      icon: GitBranch,       label: 'Network Graph',  id: 'nav-network' },
  { href: '/dashboard/surveillance', icon: Camera,          label: 'Surveillance',   id: 'nav-surveillance' },
  { href: '/dashboard/analytics',    icon: BarChart2,       label: 'Analytics',      id: 'nav-analytics' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed,    setCollapsed]    = useState(false);
  const [role,         setRole]         = useState('Inspector');
  const [employeeId,   setEmployeeId]   = useState('KSP-0000');
  const [currentTime,  setCurrentTime]  = useState('');

  // ─── Drishti state ───────────────────────────────────────────────
  const [orbState,         setOrbState]         = useState('idle');
  const [isPanelOpen,      setIsPanelOpen]      = useState(false);
  const [response,         setResponse]         = useState(null);
  const [conversationId,   setConversationId]   = useState(null);
  const [language,         setLanguage]         = useState('en');
  const [greetingText,     setGreetingText]     = useState('');
  const [hasGreeted,       setHasGreeted]       = useState(false);
  const [sessionLogs,      setSessionLogs]      = useState([]);
  const [dispatchToast,    setDispatchToast]    = useState(null);

  const pttActiveRef    = useRef(false);
  const roleRef         = useRef(role);
  useEffect(() => { roleRef.current = role; }, [role]);

  // ─── Voice hook ──────────────────────────────────────────────────
  const {
    startListening,
    stopListeningAndGetTranscript,
    speak, stopSpeaking,
    requestMicPermission,
    isListening, isSpeaking,
    liveTranscript,
    micPermission,
  } = useDrishtiVoice({
    enableClapWake: true,
    onWake: () => {
      // Double-clap: open panel and start PTT
      setIsPanelOpen(true);
      if (!hasGreeted) {
        // greeting will trigger after panel opens
      } else {
        handlePttStart();
      }
    },
    onSpeakStart: () => setOrbState('speaking'),
    onSpeakEnd:   () => setOrbState('idle'),   // back to idle after speaking — do NOT auto-listen
    onError:      () => {},                    // all errors silently swallowed in hook
  });

  // ─── Send query to backend ───────────────────────────────────────
  const handleQuery = useCallback(async (queryText) => {
    if (!queryText?.trim()) return;

    setOrbState('thinking');
    const ts = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setSessionLogs(prev => [...prev, { role: 'user', content: queryText, timestamp: ts() }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, language, conversation_id: conversationId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setResponse(data);
      if (data.conversation_id) setConversationId(data.conversation_id);

      const text = data.response_text;
      if (text) {
        setSessionLogs(prev => [...prev, { role: 'assistant', content: text, timestamp: ts() }]);
        setOrbState('speaking');
        // Strip markdown for TTS
        const clean = text.replace(/[|*#`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800);
        speak(clean, language === 'en' ? 'en-IN' : 'kn-IN');
      } else {
        setOrbState('idle');
      }
    } catch {
      setOrbState('idle');
      const fallback = "I'm having trouble reaching the network right now, Sir. Please try again.";
      setResponse({ response_text: fallback, follow_up_suggestions: [], urgency: 'low' });
      setSessionLogs(prev => [...prev, { role: 'assistant', content: fallback, timestamp: ts() }]);
    }
  }, [language, conversationId, speak]);

  // ─── PTT handlers ────────────────────────────────────────────────
  const pttStartRef = useRef(0);

  const handlePttStart = useCallback(() => {
    if (pttActiveRef.current) return;
    pttActiveRef.current = true;
    pttStartRef.current = Date.now();

    if (isSpeaking) stopSpeaking();
    setOrbState('listening');
    startListening(language === 'en' ? 'en-IN' : 'kn-IN');
  }, [isSpeaking, stopSpeaking, startListening, language]);

  const handlePttEnd = useCallback(() => {
    if (!pttActiveRef.current) return;
    pttActiveRef.current = false;

    const duration = Date.now() - pttStartRef.current;
    const captured = stopListeningAndGetTranscript();

    if (duration < 300 || !captured) {
      // Too short or empty — ignore
      setOrbState('idle');
      return;
    }

    // We have a transcript — send it
    handleQuery(captured);
  }, [stopListeningAndGetTranscript, handleQuery]);

  // ─── Greeting on first open ──────────────────────────────────────
  const triggerGreeting = useCallback(() => {
    if (hasGreeted) return;
    setHasGreeted(true);

    const h = new Date().getHours();
    const greeting =
      h >= 5  && h < 12 ? `Good morning, ${roleRef.current}. Drishti is online. A lot can happen on a shift — want me to pull up the latest updates?`
      : h >= 12 && h < 17 ? `Good afternoon, ${roleRef.current}. Drishti is ready. Need a situation update or something specific?`
      : h >= 17 && h < 21 ? `Good evening, ${roleRef.current}. I'm here to assist. Say the word and I'll brief you on recent activity.`
      : `Good evening, ${roleRef.current}. Night shift active. I'll keep watch. Just say the word if you need anything.`;

    setGreetingText(greeting);
    setOrbState('speaking');
    setSessionLogs(prev => [...prev, {
      role: 'assistant', content: greeting,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setTimeout(() => speak(greeting, language === 'en' ? 'en-IN' : 'kn-IN'), 400);
  }, [hasGreeted, language, speak]);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
    if (!hasGreeted) triggerGreeting();
  }, [hasGreeted, triggerGreeting]);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    if (isListening) { stopListeningAndGetTranscript(); }
    stopSpeaking();
    setOrbState('idle');
  }, [isListening, stopListeningAndGetTranscript, stopSpeaking]);

  // ─── Keyboard PTT: Ctrl+Alt (Win/Linux) | Cmd+Shift (Mac) ───────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
    const held = { ctrl: false, alt: false, meta: false, shift: false };
    let kbPttActive = false;

    const down = (e) => {
      if (e.key === 'Control') held.ctrl = true;
      if (e.key === 'Alt')     held.alt  = true;
      if (e.key === 'Meta')    held.meta = true;
      if (e.key === 'Shift')   held.shift = true;
      const trigger = mac ? (held.meta && held.shift) : (held.ctrl && held.alt);
      if (trigger && !kbPttActive) {
        kbPttActive = true;
        if (!isPanelOpen) { setIsPanelOpen(true); }
        if (!hasGreeted)  { triggerGreeting(); setTimeout(handlePttStart, 500); }
        else              { handlePttStart(); }
      }
    };
    const up = (e) => {
      if (e.key === 'Control') held.ctrl = false;
      if (e.key === 'Alt')     held.alt  = false;
      if (e.key === 'Meta')    held.meta = false;
      if (e.key === 'Shift')   held.shift = false;
      const released = mac ? (!held.meta || !held.shift) : (!held.ctrl || !held.alt);
      if (released && kbPttActive) { kbPttActive = false; handlePttEnd(); }
    };
    const blur = () => {
      held.ctrl = held.alt = held.meta = held.shift = false;
      if (kbPttActive) { kbPttActive = false; handlePttEnd(); }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    window.addEventListener('blur',    blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup',   up);
      window.removeEventListener('blur',    blur);
    };
  }, [isPanelOpen, hasGreeted, triggerGreeting, handlePttStart, handlePttEnd]);

  // ─── Load user info & clock ──────────────────────────────────────
  useEffect(() => {
    setRole(localStorage.getItem('drishti_role') || 'Inspector');
    setEmployeeId(localStorage.getItem('drishti_employee_id') || 'KSP-0000');
  }, []);

  useEffect(() => {
    const tick = () => setCurrentTime(
      new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('drishti_role');
    localStorage.removeItem('drishti_employee_id');
    router.push('/');
  };

  const isActive = (href) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-void-000 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`flex flex-col transition-all duration-300 ease-in-out border-r border-steel-600/40 bg-steel-700 relative z-20 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-steel-600/40 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-phosphor-500/20 border border-phosphor-500/40 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-phosphor-500" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-paper-100 font-bold text-base tracking-wide">DRISHTI</span>
              <p className="text-warn-500 text-xs leading-none">ದೃಷ್ಟಿ</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, id }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} id={id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative
                  ${active ? 'bg-phosphor-500/20 text-phosphor-500 border border-phosphor-500/30' : 'text-paper-100/60 hover:text-paper-100 hover:bg-steel-600/50'}`}
                title={collapsed ? label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-phosphor-500' : ''}`} />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
                {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-phosphor-500" />}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded bg-steel-700 text-xs text-paper-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-steel-600/40">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`px-3 py-3 border-t border-steel-600/40 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-steel-600/40 mb-2">
              <div className="w-7 h-7 rounded-full bg-phosphor-500/30 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-phosphor-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-paper-100 truncate">{employeeId}</p>
                <p className="text-xs text-paper-100/50">{role}</p>
              </div>
            </div>
          )}
          <button id="logout-btn" onClick={handleLogout}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-paper-100/50 hover:text-critical-500 hover:bg-critical-500/10 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-steel-700 border border-steel-600/60 flex items-center justify-center text-paper-100/50 hover:text-paper-100 hover:bg-steel-600 transition-all z-30"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-steel-600/40 bg-steel-700/60 backdrop-blur-sm flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-paper-100">
              {NAV_ITEMS.find(n => isActive(n.href))?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-paper-100/50">Karnataka State Police — Crime Intelligence Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-steel-600/40 border border-steel-600/40">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500 pulse-phosphor" />
              <span className="text-xs font-mono text-paper-100/70">{currentTime}</span>
            </div>
            <ThemeToggle />
            <AlertNotification />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-steel-600/40 border border-steel-600/40">
              <AlertTriangle className="w-3 h-3 text-warn-500" />
              <span className="text-xs text-paper-100/70 font-mono">{role.toUpperCase()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-void-000">{children}</main>
      </div>

      {/* ── DRISHTI SIDE PANEL ── */}
      <DrishtiPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        orbState={orbState}
        liveTranscript={liveTranscript}
        response={response}
        sessionLogs={sessionLogs}
        onSendText={handleQuery}
        onChipClick={handleQuery}
        onPttStart={handlePttStart}
        onPttEnd={handlePttEnd}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
        isListening={isListening}
        language={language}
        onLanguageChange={setLanguage}
        greetingText={greetingText}
        micPermission={micPermission}
        onRequestMicPermission={requestMicPermission}
      />

      {/* ── DRISHTI ORB — hide when panel is open so it doesn't overlap ── */}
      {!isPanelOpen && (
        <DrishtiOrb
          state={orbState}
          onClick={openPanel}
        />
      )}

      {/* Dispatch toast */}
      <AnimatePresence>
        {dispatchToast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-24 inset-x-0 z-[9999] flex justify-center px-6 pointer-events-none"
          >
            <div className="bg-green-600/90 backdrop-blur-md border border-green-400 shadow-lg px-6 py-3 rounded-xl flex items-center gap-3">
              <span className="text-white font-bold text-sm">{dispatchToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
