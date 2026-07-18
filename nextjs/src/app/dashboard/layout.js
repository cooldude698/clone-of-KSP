'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Map, GitBranch,
  Camera, BarChart2, LogOut, Shield, ChevronLeft,
  ChevronRight, AlertTriangle, User, History,
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
  { href: '/dashboard/logs',         icon: History,         label: 'AI Logs',        id: 'nav-logs' },
];

// ─── Change 5: Local intent detector ─────────────────────────────────────────
function detectLocalIntent(query) {
  const q = query.toLowerCase().trim();
  if (q.includes('go to') || q.includes('open') || q.includes('show me')) {
    if (q.includes('map') || q.includes('crime map'))
      return { type: 'navigate', path: '/dashboard/map',          reply: 'Opening the Crime Map for you, Sir.' };
    if (q.includes('analytic') || q.includes('trend'))
      return { type: 'navigate', path: '/dashboard/analytics',    reply: 'Opening Analytics now.' };
    if (q.includes('surveillance') || q.includes('camera'))
      return { type: 'navigate', path: '/dashboard/surveillance', reply: 'Switching to Surveillance.' };
    if (q.includes('network') || q.includes('graph'))
      return { type: 'navigate', path: '/dashboard/network',      reply: 'Opening the Network Graph.' };
    if (q.includes('chat') || q.includes('co-pilot'))
      return { type: 'navigate', path: '/dashboard/chat',         reply: 'Opening Co-Pilot Chat.' };
  }
  if (['yes', 'yeah', 'sure', 'okay', 'ok'].includes(q))
    return { type: 'confirm', reply: 'On it, Sir.' };
  return null;
}

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

  // ─── Change 1 & 6: Orb pin state ─────────────────────────────────
  const [orbPinned, setOrbPinned] = useState(true);

  // ─── Change 2: Proactive suggestion state ────────────────────────
  const [proactiveSuggestion, setProactiveSuggestion] = useState(null);
  // ref so timers can read latest values without stale closure
  const isPanelOpenRef  = useRef(false);
  const hasInteractedRef = useRef(false);
  const proactiveDismissedUntilRef = useRef(0);

  isPanelOpenRef.current = isPanelOpen;

  const pttActiveRef = useRef(false);
  const roleRef      = useRef(role);
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
    // Change 3: wire real-time audio level
    audioLevel,
  } = useDrishtiVoice({
    enableClapWake: false,
    onWake: () => {
      // Disabled clap wake to prevent random opening
    },
    onSpeakStart: () => setOrbState('speaking'),
    onSpeakEnd:   () => setOrbState('idle'),
    onError:      () => {},
  });

  // ─── Change 5: handleQuery with local intent ─────────────────────
  const ts = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const handleQuery = useCallback(async (queryText) => {
    if (!queryText?.trim()) return;
    hasInteractedRef.current = true;

    // Dismiss proactive suggestion if open
    setProactiveSuggestion(null);

    setOrbState('thinking');
    setSessionLogs(prev => [...prev, { role: 'user', content: queryText, timestamp: ts() }]);

    // ── Local intent check (Change 5) ──
    const localResult = detectLocalIntent(queryText);
    if (localResult) {
      if (localResult.type === 'navigate') router.push(localResult.path);
      const reply = localResult.reply;
      setResponse({ response_text: reply, follow_up_suggestions: [], confidence: 1.0 });
      setSessionLogs(prev => [...prev, { role: 'assistant', content: reply, timestamp: ts() }]);
      setOrbState('speaking');
      speak(reply, language === 'en' ? 'en-IN' : 'kn-IN');
      return; // skip API call
    }

    try {
      // Fix 4: use new direct AI route (Groq primary, Gemini fallback)
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          language,
          conversation_id: conversationId,
          // Fix 4: send recent conversation history for context
          conversation_history: sessionLogs.slice(-6).map(log => ({
            role: log.role,
            content: log.content,
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setResponse(data);
      if (data.conversation_id) setConversationId(data.conversation_id);

      const text = data.response_text;
      if (text) {
        setSessionLogs(prev => [...prev, { role: 'assistant', content: text, timestamp: ts() }]);
        setOrbState('speaking');
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
  }, [language, conversationId, sessionLogs, speak, router]);

  // ─── Change 4: Sync sessionLogs to localStorage ──────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionLogs.length > 0) {
      try {
        localStorage.setItem('drishti_session_logs', JSON.stringify(sessionLogs));
      } catch (_) {}
    }
  }, [sessionLogs]);

  // ─── PTT handlers ────────────────────────────────────────────────
  const pttStartRef = useRef(0);

  const handlePttStart = useCallback(() => {
    if (pttActiveRef.current) return;
    pttActiveRef.current = true;
    pttStartRef.current = Date.now();
    hasInteractedRef.current = true;

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
      setOrbState('idle');
      return;
    }
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
    hasInteractedRef.current = true;
    setProactiveSuggestion(null);
    if (!hasGreeted) triggerGreeting();
  }, [hasGreeted, triggerGreeting]);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    if (isListening) { stopListeningAndGetTranscript(); }
    stopSpeaking();
    setOrbState('idle');
  }, [isListening, stopListeningAndGetTranscript, stopSpeaking]);

  // ─── Change 2: Proactive suggestion system ───────────────────────
  // FIX 6: context-aware proactive suggestions based on time + session history
  const getProactiveSuggestion = useCallback((logs = []) => {
    const hour = new Date().getHours();
    const isNight = hour >= 21 || hour < 6;
    const isEvening = hour >= 17 && hour < 21;
    const hasTalkedBefore = logs.length > 0;

    // If officer has already talked to Drishti this session, suggest continuation
    if (hasTalkedBefore) {
      const lastUserMsg = [...logs].reverse().find(l => l.role === 'user');
      if (lastUserMsg?.content) {
        const last = lastUserMsg.content.toLowerCase();
        if (last.includes('vehicle') || last.includes('theft') || last.includes('car') || last.includes('bike'))
          return { text: "I found more leads on that vehicle case. Want to continue?", action: "Continue the vehicle theft investigation we were discussing", icon: '🔍' };
        if (last.includes('hotspot') || last.includes('cluster') || last.includes('area'))
          return { text: "There's a related area you might want to check. Shall I pull it up?", action: "Show me related crime clusters from our earlier analysis", icon: '🔍' };
      }
    }

    // Context-aware suggestions by page + time of day
    const suggestions = {
      '/dashboard': isNight
        ? { text: "Night shift active, Sir. 3 incidents logged in the last hour. Shall I brief you?", action: "Brief me on incidents from the last hour" }
        : { text: "Good to see you, Sir. Want a quick summary of today's activity in your district?", action: "Give me today's crime activity summary for my district" },
      '/dashboard/map': {
        text: isEvening
          ? "Evening hotspots are different from daytime patterns, Sir. Want me to highlight the high-risk areas for tonight?"
          : "Want me to overlay this week's crime clusters on the map?",
        action: isEvening
          ? "Show evening crime hotspots and high-risk areas for tonight"
          : "Show this week's crime cluster hotspots on the map"
      },
      '/dashboard/analytics': {
        text: "I can compare this month's trends against last month. Worth a look?",
        action: "Compare this month's crime trends against last month and highlight changes"
      },
      '/dashboard/surveillance': {
        text: isNight
          ? "Night vision cameras are active. Want me to flag any vehicles that appeared multiple times tonight?"
          : "Want me to scan for any vehicles that triggered ANPR alerts today?",
        action: isNight
          ? "Flag vehicles that appeared multiple times on surveillance tonight"
          : "Show vehicles that triggered ANPR alerts today"
      },
      '/dashboard/network': {
        text: "I can identify the top 3 most connected individuals in this network. Shall I?",
        action: "Identify the top 3 most connected individuals in the criminal network and explain their links"
      },
      '/dashboard/chat': {
        text: "Ready when you are, Sir. What's on your mind?",
        action: "What are the most important things I should know right now?"
      },
    };

    const entry = suggestions[pathname] || suggestions['/dashboard'];
    return { text: entry.text, action: entry.action, icon: '🔍' };
  }, [pathname]);

  const triggerProactiveSuggestion = useCallback((logs = []) => {
    if (isPanelOpenRef.current) return;
    if (hasInteractedRef.current) return;
    if (Date.now() < proactiveDismissedUntilRef.current) return;

    const suggestion = getProactiveSuggestion(logs);
    setProactiveSuggestion(suggestion);

    // Auto-dismiss after 15s
    const autoTimer = setTimeout(() => setProactiveSuggestion(null), 15000);
    return () => clearTimeout(autoTimer);
  }, [getProactiveSuggestion]);

  // Fire 30s after mount if user hasn't interacted
  useEffect(() => {
    const t = setTimeout(() => triggerProactiveSuggestion(sessionLogs), 30000);
    return () => clearTimeout(t);
  }, [triggerProactiveSuggestion, sessionLogs]);

  // Fire on pathname change (navigation)
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      hasInteractedRef.current = false;
      setProactiveSuggestion(null);
      const t = setTimeout(() => triggerProactiveSuggestion(sessionLogs), 5000);
      return () => clearTimeout(t);
    }
  }, [pathname, triggerProactiveSuggestion, sessionLogs]);

  // Every 5 minutes if panel is closed
  useEffect(() => {
    const t = setInterval(() => {
      if (!isPanelOpenRef.current) triggerProactiveSuggestion(sessionLogs);
    }, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [triggerProactiveSuggestion, sessionLogs]);

  // ─── Change 6: Orb pin — load/save localStorage ──────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('drishti_orb_pinned');
    if (stored !== null) setOrbPinned(stored === 'true');
  }, []);

  const handleToggleOrbPin = useCallback(() => {
    setOrbPinned(prev => {
      const next = !prev;
      localStorage.setItem('drishti_orb_pinned', String(next));
      return next;
    });
  }, []);

  // ─── Change 3: Space bar hotkey ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
    const held = { ctrl: false, alt: false, meta: false, shift: false };
    let kbPttActive = false;

    const isInputFocused = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || el.isContentEditable;
    };

    const down = (e) => {
      if (e.key === 'Control') held.ctrl = true;
      if (e.key === 'Alt')     held.alt  = true;
      if (e.key === 'Meta')    held.meta = true;
      if (e.key === 'Shift')   held.shift = true;

      // Original Ctrl+Alt / Cmd+Shift PTT
      const trigger = mac ? (held.meta && held.shift) : (held.ctrl && held.alt);
      if (trigger && !kbPttActive) {
        kbPttActive = true;
        if (!isPanelOpen) { setIsPanelOpen(true); }
        if (!hasGreeted)  { triggerGreeting(); setTimeout(handlePttStart, 500); }
        else              { handlePttStart(); }
      }

      // Space bar shortcut (Change 3)
      if (e.key === ' ' && !isInputFocused() && !e.repeat) {
        e.preventDefault();
        if (!isPanelOpen) {
          setIsPanelOpen(true);
          hasInteractedRef.current = true;
          setProactiveSuggestion(null);
          if (!hasGreeted) triggerGreeting();
        } else {
          handlePttStart();
        }
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

  // ─── Change 1: Orb visibility logic ─────────────────────────────
  // orbPinned=true → always show; false → only when panel closed
  const showOrb = orbPinned || !isPanelOpen;

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
        orbPinned={orbPinned}
        onToggleOrbPin={handleToggleOrbPin}
      />

      {/* ── DRISHTI ORB (Change 1) ── */}
      {/* When panel is open and orb is pinned, render compact orb anchored to top-right of panel */}
      {isPanelOpen && orbPinned && (
        <div className="fixed top-2 right-[408px] z-[9996]">
          <DrishtiOrb
            state={orbState}
            onClick={closePanel}
            compact={true}
            audioLevel={isListening ? audioLevel : 0}
          />
        </div>
      )}
      {/* Full orb when panel is closed (or orbPinned off + panel closed) */}
      {!isPanelOpen && showOrb && (
        <DrishtiOrb
          state={orbState}
          onClick={openPanel}
          compact={false}
          audioLevel={isListening ? audioLevel : 0}
        />
      )}

      {/* ── Change 3: Keyboard shortcut hint ── */}
      {!isPanelOpen && (
        <div className="fixed bottom-2 right-8 z-[9998] pointer-events-none">
          <span className="text-[10px] text-white/20 font-mono">
            Space — open Drishti · Hold to talk
          </span>
        </div>
      )}

      {/* ── Change 2: Proactive suggestion toast ── */}
      <AnimatePresence>
        {proactiveSuggestion && (
          <motion.div
            key="proactive-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-48 right-8 z-[9998] w-72"
          >
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
              <p className="text-white/80 text-sm leading-relaxed">
                {proactiveSuggestion.icon && <span className="mr-1.5">{proactiveSuggestion.icon}</span>}
                {proactiveSuggestion.text}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setProactiveSuggestion(null);
                    openPanel();
                    // Small delay so panel opens first
                    setTimeout(() => handleQuery(proactiveSuggestion.action), 400);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setProactiveSuggestion(null);
                    proactiveDismissedUntilRef.current = Date.now() + 10 * 60 * 1000;
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 text-xs font-semibold transition-all border border-white/8"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
