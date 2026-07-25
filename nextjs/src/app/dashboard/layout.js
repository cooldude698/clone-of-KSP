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

  // Greetings
  if (/^(hi|hello|hey|whats\s*up|what's\s*up|greetings|hello\s*drishti|hi\s*drishti|good\s*morning|good\s*afternoon|good\s*evening)(\s+(.*))?$/.test(q))
    return { type: 'greeting', reply: 'Hello, Sir. Drishti is active. How can I assist you with the intelligence network today?' };

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
  const mainContentRef = useRef(null);

  // Auto-scroll main content area to top on page navigation
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [pathname]);

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

  const originalResponseRef = useRef({ text: '', lang: 'en' });

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

  const handleQuery = useCallback(async (queryText, isFollowUp = false) => {
    if (!queryText?.trim()) return;

    // Stop any currently playing audio immediately upon receiving a new query
    stopSpeaking();

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
    const localResult = isFollowUp ? null : detectLocalIntent(queryText);
    if (localResult) {
      if (localResult.type === 'navigate') router.push(localResult.path);
      const reply = localResult.reply;
      setResponse({ response_text: reply, follow_up_suggestions: [], confidence: 1.0 });
      originalResponseRef.current = { text: reply, lang: 'en' };
      setSessionLogs(prev => [...prev, { role: 'assistant', content: reply, timestamp: ts() }]);
      setOrbState('speaking');
      setStateOverrideLabel('Speaking');
      speak(reply, language === 'en' ? 'en-IN' : language === 'kn' ? 'kn-IN' : 'hi-IN');

      // After 1.8s, automatically fire a follow-up intel query for this page
      if (localResult.followUpQuery) {
        setTimeout(() => {
          handleQuery(localResult.followUpQuery, true);
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
      originalResponseRef.current = { text: text, lang: data.language || targetLang || 'en' };

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
      originalResponseRef.current = { text: fallback, lang: 'en' };
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
    originalResponseRef.current = { text: greeting, lang: 'en' };
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

  const shouldSpeakOnLangChangeRef = useRef(false);

  const handleSpeakText = useCallback((text, locale) => {
    if (isMutedRef.current) return;
    const targetLang = locale.split('-')[0];
    shouldSpeakOnLangChangeRef.current = true;
    setLanguage(targetLang);
  }, []);

  // Automatically translate current response or greeting when active language changes
  useEffect(() => {
    const targetLang = language;
    const sourceLang = originalResponseRef.current.lang || 'en';
    const sourceText = originalResponseRef.current.text;

    if (!sourceText) return;

    const locale = targetLang === 'kn' ? 'kn-IN' : targetLang === 'hi' ? 'hi-IN' : 'en-IN';

    if (targetLang === sourceLang) {
      if (response && response.response_text !== sourceText) {
        setResponse(prev => prev ? { ...prev, response_text: sourceText } : null);
      } else if (!response && greetingText !== sourceText) {
        setGreetingText(sourceText);
      }
      if (shouldSpeakOnLangChangeRef.current) {
        shouldSpeakOnLangChangeRef.current = false;
        setOrbState('speaking');
        speak(sourceText, locale);
      }
    } else {
      (async () => {
        try {
          setOrbState('thinking');
          setStateOverrideLabel('Translating…');
          const res = await fetch('/server/askDrishtiAI/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'translate',
              text: sourceText,
              sourceLang,
              targetLang,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              const translatedText = data.text;
              if (response && response.response_text !== translatedText) {
                setResponse(prev => prev ? { ...prev, response_text: translatedText } : null);
              } else if (!response && greetingText !== translatedText) {
                setGreetingText(translatedText);
              }
              setOrbState('idle');
              setStateOverrideLabel('');
              if (shouldSpeakOnLangChangeRef.current) {
                shouldSpeakOnLangChangeRef.current = false;
                setOrbState('speaking');
                speak(data.spokenText || translatedText, locale);
              }
            }
          } else {
            setOrbState('idle');
            setStateOverrideLabel('');
          }
        } catch (err) {
          console.warn('[DRISHTI] Translation failed:', err.message);
          setOrbState('idle');
          setStateOverrideLabel('');
        }
      })();
    }
  }, [language, speak]);

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

  // ─── Keyboard Shortcuts: Ctrl+Alt (Win/Linux) or Cmd+Shift (Mac) ───────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
    const held = { ctrl: false, alt: false, meta: false, shift: false };
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

      // Strict Ctrl+Alt (Win/Linux) or Cmd+Shift (Mac) PTT
      const trigger = mac ? (held.meta && held.shift) : (held.ctrl && held.alt);
      if (trigger && !modifierPttActive) {
        modifierPttActive = true;
        hasInteractedRef.current = true;
        setProactiveSuggestion(null);
        if (!hasGreeted) { triggerGreeting(); setTimeout(handlePttStart, 500); }
        else             { handlePttStart(); }
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
      

      const released = mac ? (!held.meta || !held.shift) : (!held.ctrl || !held.alt);
      if (modifierPttActive && released) {
        modifierPttActive = false;
        handlePttEnd();
      }
    };

    const blur = () => {
      held.ctrl = held.alt = held.meta = held.shift = false;
      if (modifierPttActive) {
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
      <aside className={`flex flex-col transition-all duration-300 ease-in-out bg-[var(--surface-1)] border-r border-[var(--border)] relative z-20 shadow-2xl ${collapsed ? 'w-16' : 'w-64'}`}>
        {/* Brand Header */}
        <div className={`flex items-center gap-3 px-5 py-5 border-b border-[var(--border-subtle)] ${collapsed ? 'justify-center px-2' : ''}`}>
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#1E2733] text-white flex items-center justify-center flex-shrink-0 group/logo overflow-hidden border border-[var(--accent)]/40 shadow-lg">
            {/* Cybernetic scanning line */}
            <div className="absolute inset-x-0 h-0.5 bg-emerald-400/80 top-0 animate-[scan_2s_ease-in-out_infinite]" />
            <Eye className="w-5 h-5 text-white z-10 transition-transform duration-300 group-hover/logo:scale-110" />
            
            {/* Corner brackets */}
            <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-white/50" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-white/50" />
            <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-white/50" />
            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-white/50" />
          </div>
          {!collapsed && (
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-primary)] font-black tracking-widest text-base font-headline">DRISHTI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
              </div>
              <p className="text-[var(--text-secondary)] text-[10px] font-mono tracking-wider uppercase">KSP TACTICAL AI</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-5 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, id }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} id={id}
                className={`flex items-center transition-all group relative font-mono text-xs font-bold
                  ${collapsed 
                    ? 'w-10 h-10 justify-center mx-auto rounded-xl' 
                    : 'gap-3 px-3.5 py-3 rounded-xl'
                  }
                  ${active 
                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'}`}
                title={collapsed ? label : undefined}
              >
                {!collapsed && active && (
                  <motion.div
                    layoutId="activeNavHighlight"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm"
                  />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`} />
                {!collapsed && <span className="tracking-wide text-xs">{label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] shadow-2xl text-xs font-mono font-bold text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className={`p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-0)]/50 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] mb-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center flex-shrink-0 border border-[var(--border)]">
                <User className="w-4 h-4 text-[var(--text-primary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold font-mono text-[var(--text-primary)] truncate">{employeeId}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">{role}</span>
                </div>
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
        <main ref={mainContentRef} className="flex-1 overflow-auto bg-void-000">{children}</main>
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
        onSpeakText={handleSpeakText}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* ── DRISHTI ORB ── */}
      {/* When panel is open, render compact orb anchored to panel header */}
      {isPanelOpen && (
        <div className="fixed top-[12px] right-[382px] z-[9996]">
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
      {/* Full floating orb when panel is closed */}
      {!isPanelOpen && (
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


    </div>
  );
}
