'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Map, GitBranch,
  Camera, BarChart2, LogOut, Shield, ChevronLeft,
  ChevronRight, AlertTriangle, User, History, Eye, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import useDrishtiVoice from '@/components/DrishtiVoice'; // hook — must be static import

// ── Lazy-loaded heavy components ─────────────────────────────────────────────
// Deferred so they don't block the initial sidebar + page render.
// DrishtiOrb/Panel are only needed after the user clicks the orb (interaction-driven).
const AlertNotification  = dynamic(() => import('@/components/AlertNotification'),  { ssr: false });
const DrishtiOrb         = dynamic(() => import('@/components/DrishtiOrb'),          { ssr: false });
const DrishtiPanel       = dynamic(() => import('@/components/DrishtiPanel'),         { ssr: false });
const VoiceDebugStatus   = dynamic(() => import('@/components/VoiceDebugStatus'),    { ssr: false });
const SystemStatusFooter = dynamic(() => import('@/components/SystemStatusFooter'),  { ssr: false });


const NAV_ITEMS = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Overview',       id: 'nav-overview' },
  { href: '/dashboard/chat',         icon: MessageSquare,   label: 'Co-Pilot Chat',  id: 'nav-chat' },
  { href: '/dashboard/map',          icon: Map,             label: 'Crime Map',      id: 'nav-map' },
  { href: '/dashboard/network',      icon: GitBranch,       label: 'Network Graph',  id: 'nav-network' },
  { href: '/dashboard/surveillance', icon: Camera,          label: 'Surveillance',   id: 'nav-surveillance' },
  { href: '/dashboard/analytics',    icon: BarChart2,       label: 'Analytics',      id: 'nav-analytics' },
  { href: '/dashboard/logs',         icon: History,         label: 'AI Logs',        id: 'nav-logs' },
  { href: '/dashboard/trail',        icon: Navigation,      label: 'Geo Trail',      id: 'nav-trail' },
];

// ─── Local intent detector (expanded) ───────────────────────────────────────
function detectLocalIntent(query) {
  const q = query.toLowerCase().trim();

  // Navigation — many natural phrasings
  const nav = (path, reply, followUpQuery) => ({ type: 'navigate', path, reply, followUpQuery });

  if (/\b(map|crime map|hotspot|heatmap|location|where.*crime)\b/.test(q))
    return nav('/dashboard/map', 'Opening the Crime Map, Sir.', 'Give me a quick briefing on the current hotspots.');

  if (/\b(analytic|trend|statistic|report|monthly)\b/.test(q))
    return nav('/dashboard/analytics', 'Pulling up Analytics, Sir.', 'Summarize the crime trend for this month.');

  if (/\b(camera|surveillance|cctv|feed|anpr|watch)\b/.test(q))
    return nav('/dashboard/surveillance', 'Switching to Surveillance, Sir.', 'How many cameras are online and any active ANPR alerts?');

  if (/\b(network|gang|connection|syndicate)\b/.test(q))
    return nav('/dashboard/network', 'Opening the Network Graph, Sir.', 'Who are the key suspects in the current network?');

  if (/\b(trail|track|route|vehicle route)\b/.test(q))
    return nav('/dashboard/trail', 'Opening Geo Trail Tracker, Sir.', 'Any active vehicle trails being tracked?');

  if (/\b(chat|copilot|co-pilot|assistant)\b/.test(q))
    return nav('/dashboard/chat', 'Opening Co-Pilot Chat, Sir.', null);

  if (/\b(overview|home|dashboard|summary)\b/.test(q))
    return nav('/dashboard', 'Going to Overview, Sir.', 'Give me a status summary of active cases.');

  // Confirmations
  if (/^(yes|yeah|sure|okay|ok|do it|go ahead|proceed|affirmative)$/.test(q))
    return { type: 'confirm', reply: 'On it, Sir.' };

  return null;
}

const getLocale = (l) => (l === 'kn' ? 'kn-IN' : l === 'hi' ? 'hi-IN' : 'en-IN');

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
  // Status label shown in DrishtiPanel header (overrides the default orbState label)
  const [stateOverrideLabel, setStateOverrideLabel] = useState('');

  // ─── Change 1 & 6: Orb pin state ─────────────────────────────────
  const [orbPinned, setOrbPinned] = useState(true);

  // ─── Orb interaction state ───────────────────────────────────────
  const [pendingTranscript, setPendingTranscript] = useState('');  // words captured, not yet sent
  const pendingTranscriptRef = useRef(''); // mirror for Enter-key handler (avoids stale closure)
  useEffect(() => { pendingTranscriptRef.current = pendingTranscript; }, [pendingTranscript]);
  const [orbResponse,       setOrbResponse]       = useState('');  // last AI response text for bubble
  const [showTypingInput,   setShowTypingInput]   = useState(false); // type-instead input visible
  const [typingText,        setTypingText]        = useState('');  // text in the typing input

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
    error,
    consecutiveErrors,
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
    setOrbResponse('');
    setPendingTranscript('');
    hasInteractedRef.current = true;

    // Dismiss proactive suggestion if open
    setProactiveSuggestion(null);

    setOrbState('thinking');
    setStateOverrideLabel('Thinking…');
    setSessionLogs(prev => [...prev, { role: 'user', content: queryText, timestamp: ts() }]);

    // Auto-detect if input contains Kannada or Hindi script
    const isKannadaInput = /[\u0C80-\u0CFF]/.test(queryText);
    const isHindiInput = /[\u0900-\u097F]/.test(queryText);
    const targetLang = isKannadaInput ? 'kn' : isHindiInput ? 'hi' : language;

    // ── Local intent check ──
    const localResult = detectLocalIntent(queryText);
    if (localResult) {
      if (localResult.type === 'navigate') router.push(localResult.path);
      const reply = localResult.reply;
      setResponse({ response_text: reply, follow_up_suggestions: [], confidence: 1.0 });
      setSessionLogs(prev => [...prev, { role: 'user', content: queryText, timestamp: ts() }]);
      setSessionLogs(prev => [...prev, { role: 'assistant', content: reply, timestamp: ts() }]);
      setOrbState('speaking');
      setStateOverrideLabel('Speaking');
      speak(reply, language === 'en' ? 'en-IN' : language === 'kn' ? 'kn-IN' : 'hi-IN');

      // After 1.8s, automatically fire a follow-up intel query for this page
      if (localResult.followUpQuery) {
        setTimeout(() => {
          handleQuery(localResult.followUpQuery);
        }, 1800);
      }
      return; // skip API call
    }

    // ── Jarvis-style cycling thinking labels ──
    const thinkingLabels = [
      'Scanning FIR database…',
      'Cross-referencing ANPR…',
      'Checking repeat offenders…',
      'Building intelligence…',
    ];
    let labelIdx = 0;
    const thinkingInterval = setInterval(() => {
      labelIdx = (labelIdx + 1) % thinkingLabels.length;
      setStateOverrideLabel(thinkingLabels[labelIdx]);
    }, 1200);

    try {
      // ── Call askDrishtiAI (QuickML RAG primary, Gemini fallback, rawData last-resort) ──
      const res = await fetch('/server/askDrishtiAI/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          lang: targetLang,
          sessionHistory: sessionLogs.slice(-6).map(l => ({ role: l.role, content: l.content })),
        }),
      });
      clearInterval(thinkingInterval);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const text = data.answer || '';
      const source = data.source || 'quickml';

      // Map source -> status label
      const speakingLabel = source === 'quickml' ? 'Speaking' : 'Speaking (fallback)';

      // Build a response object compatible with the existing DrishtiPanel display
      const compatResponse = {
        response_text: text,
        visualization: { type: 'none', title: '', data: {} },
        follow_up_suggestions: data.follow_up_suggestions || [],
        confidence: source === 'quickml' ? 0.9 : 0.6,
        language_detected: data.language || language,
        emotion: 'calm',
        urgency: 'low',
        source,
        stats: data.stats || null,
      };
      setResponse(compatResponse);

      if (text) {
        setSessionLogs(prev => [...prev, { role: 'assistant', content: text, timestamp: ts() }]);
        setOrbState('speaking');
        setStateOverrideLabel(speakingLabel);
        if (text) setOrbResponse(text);
        // Pass data.language so TTS uses the correct locale
        const ttsLang = (data.language || targetLang) === 'kn' ? 'kn-IN' : (data.language || targetLang) === 'hi' ? 'hi-IN' : 'en-IN';
        const spokenText = data.spokenAnswer || text;
        const clean = spokenText.replace(/[|*#`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800);
        safeSpeak(clean, ttsLang);
      } else {
        setOrbState('idle');
        setStateOverrideLabel('');
      }
    } catch {
      clearInterval(thinkingInterval);
      setOrbState('idle');
      setStateOverrideLabel('');
      const fallback = "I'm having trouble reaching the network right now, Sir. Please try again.";
      setResponse({ response_text: fallback, follow_up_suggestions: [], urgency: 'low' });
      setSessionLogs(prev => [...prev, { role: 'assistant', content: fallback, timestamp: ts() }]);
      setOrbResponse("I'm having trouble reaching the network right now, Sir. Please try again.");
    }
  }, [language, sessionLogs, speak, router]);

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
    startListening(getLocale(language));
  }, [isSpeaking, stopSpeaking, startListening, language]);

  const handlePttEnd = useCallback(async () => {
    if (!pttActiveRef.current) return;
    pttActiveRef.current = false;

    // Give the recognition engine 300ms to finalize its last speech event
    await new Promise(r => setTimeout(r, 300));

    // stopListeningAndGetTranscript reads directly from refs (never stale)
    const finalQuery = stopListeningAndGetTranscript().trim();
    setOrbState('idle');

    if (!finalQuery) return;

    // ── CONFIRM-TO-SEND: show the transcript in the bubble ──
    // The user must press Enter / click Send to dispatch the query.
    // This replaces the old auto-send behaviour.
    setPendingTranscript(finalQuery);
  }, [stopListeningAndGetTranscript]);

  const handleConfirmSend = useCallback(() => {
    if (!pendingTranscript.trim()) return;
    const text = pendingTranscript;
    setPendingTranscript('');
    handleQuery(text);
  }, [pendingTranscript, handleQuery]);

  const handleCancelTranscript = useCallback(() => {
    setPendingTranscript('');
    setOrbState('idle');
  }, []);

  const handleConfirmTyping = useCallback(() => {
    if (!typingText.trim()) return;
    const text = typingText;
    setTypingText('');
    setShowTypingInput(false);
    handleQuery(text);
  }, [typingText, handleQuery]);

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
    setTimeout(() => speak(greeting, getLocale(language)), 400);
  }, [hasGreeted, language, speak]);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
    hasInteractedRef.current = true;
    setProactiveSuggestion(null);
    if (!hasGreeted) triggerGreeting();
  }, [hasGreeted, triggerGreeting]);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setStateOverrideLabel('');
    if (isListening) { stopListeningAndGetTranscript(); }
    stopSpeaking();
    setOrbState('idle');
  }, [isListening, stopListeningAndGetTranscript, stopSpeaking]);

  // ─── Permanent Mute State ──────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) stopSpeaking();
      return next;
    });
  }, [stopSpeaking]);

  const safeSpeak = useCallback((text, lang) => {
    if (isMutedRef.current) return;
    speak(text, lang);
  }, [speak]);

  // ─── Keyboard Shortcuts (Alt+O: Toggle Panel, Alt+M: Toggle Mute, Enter: confirm pending) ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        setIsPanelOpen(prev => !prev);
      }
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        handleToggleMute();
      }
      // Enter to confirm the pending voice transcript bubble
      if (e.key === 'Enter' && !e.shiftKey) {
        const activeTag = document.activeElement?.tagName;
        // Only fire if focus is NOT inside a text input / textarea
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          // Use the ref so we always read fresh value, not a closure-captured one
          const pending = pendingTranscriptRef.current?.trim();
          if (pending) {
            e.preventDefault();
            setPendingTranscript('');
            handleQuery(pending);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMute, handleQuery]);

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
    let spacePttActive = false;
    let modifierPttActive = false;

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
      if (trigger && !modifierPttActive && !spacePttActive) {
        modifierPttActive = true;
        hasInteractedRef.current = true;
        setProactiveSuggestion(null);
        if (!hasGreeted) { triggerGreeting(); setTimeout(handlePttStart, 500); }
        else             { handlePttStart(); }
      }

      // Space bar shortcut (Change 3)
      if (e.key === ' ' && !isInputFocused() && !e.repeat) {
        e.preventDefault();
        if (!modifierPttActive && !spacePttActive) {
          spacePttActive = true;
          hasInteractedRef.current = true;
          setProactiveSuggestion(null);
          if (!hasGreeted) { triggerGreeting(); setTimeout(handlePttStart, 500); }
          else             { handlePttStart(); }
        }
      }

      // Enter to confirm pending voice transcript
      if (e.key === 'Enter' && pendingTranscript && !isInputFocused()) {
        e.preventDefault();
        handleConfirmSend();
      }
      // Escape to cancel pending transcript
      if (e.key === 'Escape' && pendingTranscript) {
        e.preventDefault();
        handleCancelTranscript();
      }
    };

    const up = (e) => {
      if (e.key === 'Control') held.ctrl = false;
      if (e.key === 'Alt')     held.alt  = false;
      if (e.key === 'Meta')    held.meta = false;
      if (e.key === 'Shift')   held.shift = false;
      
      if (spacePttActive && e.key === ' ') {
        spacePttActive = false;
        handlePttEnd();
      }

      const released = mac ? (!held.meta || !held.shift) : (!held.ctrl || !held.alt);
      if (modifierPttActive && released) {
        modifierPttActive = false;
        handlePttEnd();
      }
    };

    const blur = () => {
      held.ctrl = held.alt = held.meta = held.shift = false;
      if (spacePttActive || modifierPttActive) {
        spacePttActive = false;
        modifierPttActive = false;
        handlePttEnd();
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    window.addEventListener('blur',    blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup',   up);
      window.removeEventListener('blur',    blur);
    };
  }, [isPanelOpen, hasGreeted, triggerGreeting, handlePttStart, handlePttEnd, pendingTranscript, handleConfirmSend, handleCancelTranscript]);

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
      <aside className={`flex flex-col transition-all duration-300 ease-in-out bg-void-000 relative z-20 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className={`flex items-center gap-3 px-6 py-6 ${collapsed ? 'justify-center px-4' : ''}`}>
          <div className="relative w-8 h-8 rounded bg-accent text-white flex items-center justify-center flex-shrink-0 group/logo overflow-hidden border border-accent/20">
            {/* Cool cybernetic scanning line */}
            <div className="absolute inset-x-0 h-0.5 bg-status-success/80 top-0 animate-[scan_2s_ease-in-out_infinite]" />
            <Eye className="w-4 h-4 text-white z-10 transition-transform duration-300 group-hover/logo:scale-110" />
            
            {/* Corner brackets */}
            <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-white/40" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-white/40" />
            <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-white/40" />
            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-white/40" />
          </div>
          {!collapsed && (
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <span className="text-paper-100 font-bold tracking-widest text-sm font-sans">DRISHTI</span>
                {/* Active scan status blinker */}
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
              </div>
              <p className="text-paper-100/40 text-[9px] font-kannada tracking-wide uppercase mt-0.5">ದೃಷ್ಟಿ · matrix active</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, id }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} id={id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative
                  ${active ? 'bg-black/5 dark:bg-white/10 text-paper-100 font-semibold' : 'text-paper-100/60 hover:text-paper-100 hover:bg-black/5 dark:hover:bg-white/5'}`}
                title={collapsed ? label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-phosphor-500' : 'text-paper-100/40 group-hover:text-paper-100'}`} />
                {!collapsed && <span className="text-sm tracking-wide">{label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-void-000 shadow-xl text-xs text-paper-100/90 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-steel-600/30">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`px-4 py-4 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-transparent mb-3">
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-paper-100/70" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-paper-100/90 truncate tracking-wide">{employeeId}</p>
                <p className="text-[10px] text-paper-100/40 uppercase tracking-widest mt-0.5">{role}</p>
              </div>
            </div>
          )}
          <button id="logout-btn" onClick={handleLogout}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-paper-100/40 hover:text-paper-100 hover:bg-steel-600/10 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-steel-700 border border-steel-600 flex items-center justify-center text-paper-100/50 hover:text-paper-100 transition-all z-30 shadow-sm"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-void-000 border-l border-steel-600">
        <header className="flex items-center justify-between px-8 py-5 bg-transparent flex-shrink-0 z-10 relative">
          <div>
            <h1 className="text-xl font-semibold text-paper-100 tracking-tight">
              {NAV_ITEMS.find(n => isActive(n.href))?.label || 'Dashboard'}
            </h1>
            <p className="text-[11px] text-paper-100/40 tracking-wider uppercase mt-1">Karnataka State Police</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5">
              <span className="text-[12px] font-medium text-paper-100/60">{currentTime}</span>
            </div>
            <ThemeToggle />
            <AlertNotification />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-steel-600/20 bg-steel-600/10">
              <User className="w-3.5 h-3.5 text-paper-100/40" />
              <span className="text-[10px] text-paper-100/60 tracking-widest uppercase font-semibold">{role}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-void-000">{children}</main>
        <SystemStatusFooter />
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
        onSpeakText={safeSpeak}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
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
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
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
          pendingTranscript={pendingTranscript}
          orbResponse={orbResponse}
          onConfirmSend={handleConfirmSend}
          onCancelTranscript={handleCancelTranscript}
          showTypingInput={showTypingInput}
          onToggleTyping={() => {
            setShowTypingInput(v => !v);
            setPendingTranscript('');
            setTypingText('');
          }}
          typingText={typingText}
          onTypingChange={setTypingText}
          onTypingSubmit={handleConfirmTyping}
          onPttStart={handlePttStart}
          onPttEnd={handlePttEnd}
          isListening={isListening}
          liveTranscript={liveTranscript}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onReadAloud={() => {
            setOrbState('speaking');
            safeSpeak(orbResponse, getLocale(language));
          }}
        />
      )}


      {/* ── Change 2: Proactive suggestion toast ── */}
      <AnimatePresence>
        {proactiveSuggestion && (
          <motion.div
            key="proactive-toast"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-12 right-[360px] z-[9998] w-72"
          >
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
              <p className="text-white/80 text-sm leading-relaxed">
                {proactiveSuggestion.icon && <span className="mr-1.5">{proactiveSuggestion.icon}</span>}
                {proactiveSuggestion.text}
              </p>
              <div className="flex gap-2 mt-1">
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
                    setOrbState('speaking');
                    speak(proactiveSuggestion.text, getLocale(language));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10"
                  title="Read Aloud"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
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

      <VoiceDebugStatus 
        micPermission={micPermission}
        isListening={isListening}
        error={error}
        lastTranscript={liveTranscript || pendingTranscript}
        consecutiveErrors={consecutiveErrors}
        onTryAgain={() => {
          if (!isListening) {
             startListening(getLocale(language));
          }
        }}
        onUseText={() => {
           if (!isPanelOpen) openPanel();
           setShowTypingInput(true);
        }}
      />
    </div>
  );
}
