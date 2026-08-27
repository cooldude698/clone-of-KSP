'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Map, GitBranch,
  Camera, BarChart2, LogOut, Shield, ChevronLeft, ChevronRight,
  Newspaper, FileText, Server, Search, ChevronDown, Sparkles,
  User, History, Navigation, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import DrishtiLogo from '@/components/DrishtiLogo';
import useDrishtiVoice from '@/components/DrishtiVoice'; // hook — must be static import

// ── Lazy-loaded heavy components ─────────────────────────────────────────────
// Deferred so they don't block the initial sidebar + page render.
// DrishtiOrb/Panel are only needed after the user clicks the orb (interaction-driven).
const AlertNotification = dynamic(() => import('@/components/AlertNotification'), { ssr: false });
const DrishtiOrb = dynamic(() => import('@/components/DrishtiOrb'), { ssr: false });
const DrishtiPanel = dynamic(() => import('@/components/DrishtiPanel'), { ssr: false });


const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', id: 'nav-overview' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Co-Pilot Chat', id: 'nav-chat' },
  { href: '/dashboard/fir', icon: FileText, label: 'FIR Registry', id: 'nav-fir' },
  { href: '/dashboard/suspect', icon: User, label: 'Suspect Roster', id: 'nav-suspect' },
  { href: '/dashboard/map', icon: Map, label: 'Crime Map', id: 'nav-map' },
  { href: '/dashboard/network', icon: GitBranch, label: 'Network Graph', id: 'nav-network' },
  { href: '/dashboard/surveillance', icon: Camera, label: 'Surveillance', id: 'nav-surveillance' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics', id: 'nav-analytics' },
  { href: '/dashboard/logs', icon: History, label: 'AI Logs', id: 'nav-logs' },
  { href: '/dashboard/trail', icon: Navigation, label: 'Geo Trail', id: 'nav-trail' },
  { href: '/dashboard/news', icon: Newspaper, label: 'Live News', id: 'nav-news' },
];

function extractRequestedName(queryText) {
  let cleaned = queryText
    .replace(/\b(can you|please|hey|hi|drishti|could you|would you)\b/gi, '')
    .replace(/\b(open|show|view|bring up|pull up|check|get|find|search)\b/gi, '')
    .replace(/\b(suspect|person|person's|persons|case|file|profile|record|fir|details|this)\b/gi, '')
    .trim();

  if (!cleaned) return 'the requested query';
  return cleaned
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Local intent detector (expanded) ───────────────────────────────────────
function detectLocalIntent(query) {
  const q = query.toLowerCase().trim();
  const isHindi = /[\u0900-\u097F]/.test(query);
  const isKannada = /[\u0C80-\u0CFF]/.test(query);

  const nav = (path, reply, followUpQuery) => ({ type: 'navigate', path, reply, followUpQuery });

  // Guard: If query is a question or requests Yes/No, DO NOT navigate! Let the AI answer the query.
  const isQuestion =
    q.includes('?') || q.includes('do we') || q.includes('is there') || q.includes('have info') ||
    q.includes('any info') || q.includes('check if') || q.includes('answer in') || q.includes('yes/no') ||
    q.includes('yes or no') || q.includes('what') || q.includes('where') || q.includes('who') ||
    q.includes('how') || q.includes('does') || q.includes('क्या') || q.includes('जानकारी') ||
    q.includes('इन्फॉर्मेशन') || q.includes('ಯಾವ') || q.includes('ಇದೆಯಾ');

  if (isQuestion) {
    return null;
  }

  // Explicit Open/View/Navigate action verbs
  const isOpenAction =
    q.includes('open') || q.includes('show') || q.includes('view') || q.includes('bring up') ||
    q.includes('pull up') || q.includes('switch') || q.includes('navigate') || q.includes('go to') ||
    q.includes('check case') || q.includes('case file') || q.includes('profile') ||
    q.includes('खोलो') || q.includes('खोल') || q.includes('खोलना') || q.includes('दिखाओ') ||
    q.includes('दिखाएं') || q.includes('देखना') || q.includes('सीरी') || q.includes('प्रोफाइल') ||
    q.includes('ले चलो') || q.includes('ओपन') || q.includes('ತೆರೆ') || q.includes('ತೋರಿಸು') ||
    q.includes('ಪ್ರೊಫೈಲ್');

  // 1. CCTV & Surveillance Direct Intent (requires explicit open/view action verb or page request)
  if (
    isOpenAction && (
      /\b(cctv|surveillance|camera|feed|anpr|watch|सीसीटीवी|सर्विलांस|कैमरा|कैमरे|फीड|ಸಿಸಿಟಿವಿ|ಕ್ಯಾಮೆರಾ|ನಿಗಾ)\b/.test(q) ||
      q.includes('सीसीटीवी') || q.includes('सर्विलांस') || q.includes('कैमरा') || q.includes('ಸಿಸಿಟಿವಿ') || q.includes('ಕ್ಯಾಮೆರಾ')
    )
  ) {
    const reply = isHindi
      ? 'सिल्क बोर्ड और बेंगलुरु ग्रिड के सीसीटीवी कैमरे और सर्विलांस सिस्टम खोले जा रहे हैं, सर।'
      : isKannada
        ? 'ಸಿಸಿಟಿವಿ ಮತ್ತು ಕಣ್ಗಾವಲು ವ್ಯವಸ್ಥೆಯನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.'
        : 'Switching to Surveillance & CCTV live feeds, Sir.';
    return nav('/dashboard/surveillance', reply, null);
  }

  // 2. Crime Map Direct Intent (requires explicit open/view action verb)
  if (
    isOpenAction && (
      /\b(map|crime map|hotspot|heatmap|location|where.*crime|मैप|क्राइम मैप|नक्शा|लोकेशन|ಮ್ಯಾಪ್|ನಕ್ಷೆ)\b/.test(q) ||
      q.includes('मैप') || q.includes('नक्शा') || q.includes('ಮ್ಯಾಪ್') || q.includes('ನಕ್ಷೆ')
    )
  ) {
    const reply = isHindi
      ? 'क्राइम मैप और हॉटस्पॉट लोकेशन दिखाई जा रही है, सर।'
      : isKannada
        ? 'ಕ್ರೈಮ್ ಮ್ಯಾಪ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.'
        : 'Opening the Crime Map, Sir.';
    return nav('/dashboard/map', reply, 'Give me a quick briefing on the current hotspots.');
  }

  // 3. Suspect Profile & Case File Direct Intent
  if (isOpenAction) {
    if (q.includes('anant') || q.includes('anand') || q.includes('gowda') || q.includes('godwa') || q.includes('buda') || q.includes('guda') || q.includes('goda') || q.includes('आनंद') || q.includes('ಆನಂದ್')) {
      const reply = isHindi ? 'आनंद गौड़ा की संदिग्ध प्रोफाइल खोली जा रही है, सर।' : isKannada ? 'ಆನಂದ್ ಗೌಡ ಅವರ ಶಂಕಿತ ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.' : 'Opening suspect profile for Anand Gowda, Sir.';
      return nav('/dashboard/suspect/anand-gowda', reply, null);
    }
    if (q.includes('ramesh') || q.includes('bullet ramesh') || q.includes('रमेश') || q.includes('ರಮೇಶ್')) {
      const reply = isHindi ? 'रमेश कुमार ("बुलेट रमेश") की संदिग्ध प्रोफाइल और रिकॉर्ड खोला जा रहा है, सर।' : isKannada ? 'ರಮೇಶ್ ಕುಮಾರ್ ಅವರ ಶಂಕಿತ ಪ್ರೊಫೈಲ್ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.' : 'Opening suspect profile for Ramesh Kumar, Sir.';
      return nav('/dashboard/suspect/ramesh-kumar', reply, null);
    }
    if (q.includes('suresh') || q.includes('naidu') || q.includes('सुरेश') || q.includes('ಸುರೇಶ್')) {
      const reply = isHindi ? 'सुरेश नाईडू की संदिग्ध प्रोफाइल खोली जा रही है, सर।' : isKannada ? 'ಸುರೇಶ್ ನಾಯ್ಡು ಅವರ ಶಂಕಿತ ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.' : 'Opening suspect profile for Suresh Naidu, Sir.';
      return nav('/dashboard/suspect/suresh-naidu', reply, null);
    }
    if (q.includes('imran') || q.includes('chotta imran') || q.includes('इमरान') || q.includes('ಇಮ್ರಾನ್')) {
      const reply = isHindi ? 'इमरान खान की संदिग्ध प्रोफाइल खोली जा रही है, सर।' : isKannada ? 'ಇಮ್ರಾನ್ ಖಾನ್ ಅವರ ಶಂಕಿತ ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.' : 'Opening suspect profile for Imran Khan, Sir.';
      return nav('/dashboard/suspect/imran-khan', reply, null);
    }
    if (q.includes('farid') || q.includes('mirza') || q.includes('फरीद') || q.includes('ಫರೀದ್')) {
      const reply = isHindi ? 'फरीद मिर्जा की संदिग्ध प्रोफाइल खोली जा रही है, सर।' : isKannada ? 'ಫರೀದ್ ಮಿರ್ಜಾ ಅವರ ಶಂಕಿತ ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.' : 'Opening suspect profile for Farid Mirza, Sir.';
      return nav('/dashboard/suspect/farid-mirza', reply, null);
    }
    if (q.includes('4921') || q.includes('492')) {
      return nav('/dashboard/fir/FIR-2026-BL-4921', isKannada ? 'ಪ್ರಕರಣ ದಾಖಲೆ FIR-2026-BL-4921 ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.' : 'Opening case file FIR-2026-BL-4921, Sir.', null);
    }
    if (q.includes('4000')) {
      return nav('/dashboard/fir/FIR-2026-BL-4000', isKannada ? 'ಪ್ರಕರಣ ದಾಖಲೆ FIR-2026-BL-4000 ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.' : 'Opening case file FIR-2026-BL-4000, Sir.', null);
    }
    if (q.includes('112') || q.includes('mys')) {
      return nav('/dashboard/fir/FIR-2026-MYS-0112', isKannada ? 'ಪ್ರಕರಣ ದಾಖಲೆ FIR-2026-MYS-0112 ತೆರೆಯಲಾಗುತ್ತಿದೆ, ಸರ್.' : 'Opening case file FIR-2026-MYS-0112, Sir.', null);
    }

    // No matching registered suspect or FIR found in datastore
    const targetName = extractRequestedName(query);
    return {
      type: 'not_found',
      reply: isHindi
        ? `सर, "${targetName}" के लिए कोई संदिग्ध प्रोफ़ाइल या केस फ़ाइल नहीं मिली।`
        : isKannada
          ? `ಸರ್, "${targetName}" ಗಾಗಿ ಯಾವುದೇ ಶಂಕಿತ ಪ್ರೊಫೈಲ್ ಅಥವಾ ಎಫ್‌ಐಆರ್ ಸಿಗಲಿಲ್ಲ.`
          : `Sir, no suspect profile or case file found for "${targetName}" in the Karnataka Police database. Please verify the name or FIR number.`
    };
  }

  // Network Graph
  if (/\b(network|gang|connection|syndicate|नेटवर्क|गैंग|ಸಂಪರ್ಕ)\b/.test(q) || q.includes('नेटवर्क') || q.includes('गैंग')) {
    const reply = isHindi ? 'क्रिमिनल नेटवर्क ग्राफ खोला जा रहा है, सर।' : 'Opening the Network Graph, Sir.';
    return nav('/dashboard/network', reply, 'Who are the key suspects in the current network?');
  }

  // Analytics
  if (/\b(analytic|trend|statistic|report|monthly|एनालिटिक्स|ट्रेंड|रिपोर्ट)\b/.test(q) || q.includes('एनालिटिक्स')) {
    const reply = isHindi ? 'एनालिटिक्स और ट्रेंड्स खोले जा रहे हैं, सर।' : 'Pulling up Analytics, Sir.';
    return nav('/dashboard/analytics', reply, 'Summarize the crime trend for this month.');
  }

  // Geo Trail
  if (/\b(trail|track|route|vehicle route|ट्रेल|ट्रैक|रूट)\b/.test(q) || q.includes('ट्रेल') || q.includes('ट्रैक')) {
    const reply = isHindi ? 'जियो ट्रेल ट्रैकर खोला जा रहा है, सर।' : 'Opening Geo Trail Tracker, Sir.';
    return nav('/dashboard/trail', reply, 'Any active vehicle trails being tracked?');
  }

  // Co-Pilot Chat
  if (/\b(chat|copilot|co-pilot|assistant|चैट|सहायक)\b/.test(q) || q.includes('चैट')) {
    const reply = isHindi ? 'को-पायलट चैट खोली जा रही है, सर।' : 'Opening Co-Pilot Chat, Sir.';
    return nav('/dashboard/chat', reply, null);
  }

  // Overview
  if (/\b(overview|home|dashboard|summary|ओवरव्यू|होम|डैशबोर्ड|सारांश)\b/.test(q) || q.includes('ओवरव्यू') || q.includes('डैशबोर्ड')) {
    const reply = isHindi ? 'ओवरव्यू डैशबोर्ड खोला जा रहा है, सर।' : 'Going to Overview, Sir.';
    return nav('/dashboard', reply, 'Give me a status summary of active cases.');
  }

  // Confirmations
  if (/^(yes|yeah|sure|okay|ok|do it|go ahead|proceed|affirmative|हां|हाँ|ठीक है|ओके)$/.test(q))
    return { type: 'confirm', reply: isHindi ? 'ठीक है सर, कार्रवाई जारी है।' : 'On it, Sir.' };

  // Greetings
  if (/^(hi|hello|hey|whats\s*up|what's\s*up|greetings|hello\s*drishti|hi\s*drishti|good\s*morning|good\s*afternoon|good\s*evening|नमस्ते|हेलो|हाय)(\s+(.*))?$/.test(q))
    return { type: 'greeting', reply: isHindi ? 'नमस्ते सर। दृष्टि एआई सक्रिय है। आज मैं आपकी कैसे मदद कर सकता हूं?' : 'Hello, Sir. Drishti is active. How can I assist you with the intelligence network today?' };

  return null;
}

const getLocale = (l) => (l === 'kn' ? 'kn-IN' : l === 'hi' ? 'hi-IN' : 'en-IN');

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState('Inspector');
  const [employeeId, setEmployeeId] = useState('KSP-0000');
  const [officerName, setOfficerName] = useState('V. Sharma');
  const [currentTime, setCurrentTime] = useState('');
  const mainContentRef = useRef(null);

  // Auto-scroll main content area to top on page navigation
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  // ─── Drishti state ───────────────────────────────────────────────
  const [orbState, setOrbState] = useState('idle');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [greetingText, setGreetingText] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [dispatchToast, setDispatchToast] = useState(null);
  // Status label shown in DrishtiPanel header (overrides the default orbState label)
  const [stateOverrideLabel, setStateOverrideLabel] = useState('');

  // ─── Change 1 & 6: Orb pin state ─────────────────────────────────
  const [orbPinned, setOrbPinned] = useState(true);

  // ─── Orb interaction state ───────────────────────────────────────
  const [pendingTranscript, setPendingTranscript] = useState('');  // words captured, not yet sent
  const pendingTranscriptRef = useRef(''); // mirror for Enter-key handler (avoids stale closure)
  useEffect(() => { pendingTranscriptRef.current = pendingTranscript; }, [pendingTranscript]);
  const [orbResponse, setOrbResponse] = useState('');  // last AI response text for bubble
  const [showTypingInput, setShowTypingInput] = useState(false); // type-instead input visible
  const [typingText, setTypingText] = useState('');  // text in the typing input

  // ─── Change 2: Proactive suggestion state ────────────────────────
  const [proactiveSuggestion, setProactiveSuggestion] = useState(null);
  // ref so timers can read latest values without stale closure
  const isPanelOpenRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const proactiveDismissedUntilRef = useRef(0);

  isPanelOpenRef.current = isPanelOpen;

  const pttActiveRef = useRef(false);
  const roleRef = useRef(role);
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
    onSpeakEnd: () => setOrbState('idle'),
    onError: () => { },
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
      if (localResult.type === 'navigate') {
        if (typeof window !== 'undefined') {
          window.location.href = localResult.path;
        } else {
          router.push(localResult.path);
        }
      }
      const reply = localResult.reply;
      setResponse({ response_text: reply, follow_up_suggestions: [], confidence: 1.0 });
      originalResponseRef.current = { text: reply, lang: 'en' };
      setSessionLogs(prev => [...prev, { role: 'assistant', content: reply, timestamp: ts() }]);
      setOrbState('speaking');
      setStateOverrideLabel('Speaking');
      setOrbResponse(reply);

      const ttsLang = targetLang === 'kn' ? 'kn-IN' : targetLang === 'hi' ? 'hi-IN' : 'en-IN';
      const clean = reply.replace(/[|*#`]/g, ' ').replace(/\s+/g, ' ').trim();
      safeSpeak(clean, ttsLang);

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
      let res = await fetch('/api/askDrishtiAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          lang: targetLang,
          sessionHistory: sessionLogs.slice(-6).map(l => ({ role: l.role, content: l.content })),
        }),
      });
      if (!res.ok) {
        res = await fetch('/server/askDrishtiAI/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: queryText,
            lang: targetLang,
            sessionHistory: sessionLogs.slice(-6).map(l => ({ role: l.role, content: l.content })),
          }),
        });
      }
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

  // ─── Sync sessionLogs to localStorage & handle drishti-open-orb events ──────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('drishti_session_logs');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) setSessionLogs(parsed);
        }
      } catch (_) { }
    }

    const handleOpenOrbWithLogs = (e) => {
      setIsPanelOpen(true);
      if (e.detail && Array.isArray(e.detail.messages)) {
        setSessionLogs(e.detail.messages);
        try {
          localStorage.setItem('drishti_session_logs', JSON.stringify(e.detail.messages));
          window.dispatchEvent(new Event('storage'));
        } catch (_) { }
        const lastAssistantMsg = e.detail.messages.slice().reverse().find(m => m.role === 'assistant')?.content;
        if (lastAssistantMsg) {
          setOrbResponse(lastAssistantMsg);
          try { speak(lastAssistantMsg.replace(/[*#\_|`]/g, ' '), 'en-IN'); } catch (_) { }
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('drishti-open-orb', handleOpenOrbWithLogs);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('drishti-open-orb', handleOpenOrbWithLogs);
      }
    };
  }, [speak]);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionLogs.length > 0) {
      try {
        localStorage.setItem('drishti_session_logs', JSON.stringify(sessionLogs));
        window.dispatchEvent(new Event('storage'));
      } catch (_) { }
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
    if (isListening) {
      stopListeningAndGetTranscript();
    }
    stopSpeaking();
    setOrbState('idle');
  }, [isListening, stopListeningAndGetTranscript, stopSpeaking]);

  const handleConfirmTyping = useCallback(() => {
    if (!typingText.trim()) return;
    const text = typingText;
    setTypingText('');
    setShowTypingInput(false);
    handleQuery(text);
  }, [typingText, handleQuery]);

  // ─── Greeting Helper by Language ──────────────────────────────────
  const getGreetingForLang = useCallback((lang, role = 'Supervisor') => {
    const h = new Date().getHours();
    const timeKey = h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : h >= 17 && h < 21 ? 'evening' : 'night';

    if (lang === 'kn') {
      if (timeKey === 'morning') return `ಶುಭೋದಯ, ${role}. ದೃಷ್ಟಿ ಎಐ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಇತ್ತೀಚಿನ ಸನ್ನಿವೇಶದ ಮಾಹಿತಿ ಬೇಕೇ?`;
      if (timeKey === 'afternoon') return `ಶುಭ ಮಧ್ಯಾಹ್ನ, ${role}. ದೃಷ್ಟಿ ಸಿದ್ಧವಾಗಿದೆ. ಸ್ಥಿತಿಗತಿ ವರದಿ ಅಥವಾ ನಿರ್ದಿಷ್ಟ ಮಾಹಿತಿ ಬೇಕೇ?`;
      if (timeKey === 'evening') return `ಶುಭ ಸಂಜೆ, ${role}. ನಾನು ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ. ಇತ್ತೀಚಿನ ವರದಿ ನೀಡಬೇಕೇ?`;
      return `ಶುಭ ರಾತ್ರಿ, ${role}. ನೈಟ್ ಶಿಫ್ಟ್ ಸಕ್ರಿಯವಾಗಿದೆ. ಯಾವುದೇ ಮಾಹಿತಿ ಅಗತ್ಯವಿದ್ದರೆ ತಿಳಿಸಿ.`;
    }

    if (lang === 'hi') {
      if (timeKey === 'morning') return `शुभ प्रभात, ${role} जी। दृष्टि एआई ऑनलाइन है। क्या आपको ताज़ा अपडेट चाहिए?`;
      if (timeKey === 'afternoon') return `शुभ दोपहर, ${role} जी। दृष्टि तैयार है। क्या आपको स्थिति की जानकारी चाहिए या कोई विशिष्ट विवरण?`;
      if (timeKey === 'evening') return `शुभ संध्या, ${role} जी। मैं आपकी सहायता के लिए तैयार हूँ। हालिया गतिविधियों की जानकारी चाहिए?`;
      return `शुभ रात्रि, ${role} जी। नाइट शिफ्ट सक्रिय है। कोई भी जानकारी चाहिए हो तो बताइए।`;
    }

    if (timeKey === 'morning') return `Good morning, ${role}. Drishti is online. A lot can happen on a shift — want me to pull up the latest updates?`;
    if (timeKey === 'afternoon') return `Good afternoon, ${role}. Drishti is ready. Need a situation update or something specific?`;
    if (timeKey === 'evening') return `Good evening, ${role}. I'm here to assist. Say the word and I'll brief you on recent activity.`;
    return `Good evening, ${role}. Night shift active. I'll keep watch. Just say the word if you need anything.`;
  }, []);

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
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const targetLang = lang || 'en-IN';
      const cleanText = (text || '').replace(/[*#_`]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!cleanText) return;

      const utt = new SpeechSynthesisUtterance(cleanText);
      utt.lang = targetLang;
      utt.rate = 0.95;
      utt.pitch = 1.0;

      // Select best matching voice for clear pronunciation
      const voices = window.speechSynthesis.getVoices() || [];
      const bestVoice = voices.find(v => v.lang === targetLang) ||
        voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
      if (bestVoice) utt.voice = bestVoice;

      window.speechSynthesis.speak(utt);
    } catch (e) {
      console.warn('TTS speech trigger warning:', e);
    }
  }, []);

  // ─── Greeting on first open ──────────────────────────────────────
  const triggerGreeting = useCallback(() => {
    if (hasGreeted) return;
    setHasGreeted(true);

    const greeting = getGreetingForLang(language, roleRef.current);

    setGreetingText(greeting);
    originalResponseRef.current = { text: greeting, lang: language || 'en', isGreeting: true };
    setOrbState('speaking');
    setSessionLogs(prev => [...prev, {
      role: 'assistant', content: greeting,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }]);
    const locale = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    setTimeout(() => safeSpeak(greeting, locale), 400);
  }, [hasGreeted, language, safeSpeak, getGreetingForLang]);

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

  const shouldSpeakOnLangChangeRef = useRef(false);

  const handleLanguageChange = useCallback((newLang) => {
    shouldSpeakOnLangChangeRef.current = true;
    setLanguage(newLang);
  }, []);

  const handleSpeakText = useCallback((text, locale) => {
    if (isMutedRef.current) return;
    const targetLang = locale.split('-')[0];
    shouldSpeakOnLangChangeRef.current = true;
    setLanguage(targetLang);
  }, []);

  // Automatically translate current response or greeting when active language changes
  useEffect(() => {
    const targetLang = language;
    const locale = targetLang === 'kn' ? 'kn-IN' : targetLang === 'hi' ? 'hi-IN' : 'en-IN';

    const updateAssistantLog = (newText) => {
      setSessionLogs(prev => {
        if (!prev || prev.length === 0) return prev;
        const copy = [...prev];
        const lastIdx = copy.map(m => m.role).lastIndexOf('assistant');
        if (lastIdx !== -1) {
          copy[lastIdx] = { ...copy[lastIdx], content: newText };
        }
        return copy;
      });
    };

    if (!response || originalResponseRef.current?.isGreeting) {
      const translatedGreeting = getGreetingForLang(targetLang, roleRef.current);
      setGreetingText(translatedGreeting);
      updateAssistantLog(translatedGreeting);
      if (shouldSpeakOnLangChangeRef.current) {
        shouldSpeakOnLangChangeRef.current = false;
        setOrbState('speaking');
        safeSpeak(translatedGreeting, locale);
      }
      return;
    }

    const sourceLang = originalResponseRef.current.lang || 'en';
    const sourceText = originalResponseRef.current.text;
    if (!sourceText) return;

    if (targetLang === sourceLang) {
      if (response && response.response_text !== sourceText) {
        setResponse(prev => prev ? { ...prev, response_text: sourceText } : null);
        updateAssistantLog(sourceText);
      }
      if (shouldSpeakOnLangChangeRef.current) {
        shouldSpeakOnLangChangeRef.current = false;
        setOrbState('speaking');
        safeSpeak(sourceText, locale);
      }
    } else {
      (async () => {
        try {
          setOrbState('thinking');
          setStateOverrideLabel('Translating…');
          let res = await fetch('/api/askDrishtiAI', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'translate',
              text: sourceText,
              sourceLang,
              targetLang,
            }),
          });
          if (!res.ok) {
            res = await fetch('/server/askDrishtiAI/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mode: 'translate',
                text: sourceText,
                sourceLang,
                targetLang,
              }),
            });
          }
          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              const translatedText = data.text;
              setResponse(prev => prev ? { ...prev, response_text: translatedText } : null);
              updateAssistantLog(translatedText);
              setOrbState('idle');
              setStateOverrideLabel('');
              if (shouldSpeakOnLangChangeRef.current) {
                shouldSpeakOnLangChangeRef.current = false;
                setOrbState('speaking');
                safeSpeak(data.spokenText || translatedText, locale);
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
  }, [language, response, safeSpeak, getGreetingForLang]);

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
      if (e.key === 'Alt') held.alt = true;
      if (e.key === 'Meta') held.meta = true;
      if (e.key === 'Shift') held.shift = true;

      // Strict Ctrl+Alt (Win/Linux) or Cmd+Shift (Mac) PTT
      const trigger = mac ? (held.meta && held.shift) : (held.ctrl && held.alt);
      if (trigger && !modifierPttActive) {
        modifierPttActive = true;
        hasInteractedRef.current = true;
        setProactiveSuggestion(null);
        if (!hasGreeted) { triggerGreeting(); setTimeout(handlePttStart, 500); }
        else { handlePttStart(); }
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
      if (e.key === 'Alt') held.alt = false;
      if (e.key === 'Meta') held.meta = false;
      if (e.key === 'Shift') held.shift = false;


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
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [isPanelOpen, hasGreeted, triggerGreeting, handlePttStart, handlePttEnd, pendingTranscript, handleConfirmSend, handleCancelTranscript]);

  // ─── Load user info & clock ──────────────────────────────────────
  useEffect(() => {
    setRole(localStorage.getItem('drishti_role') || 'Inspector');
    setEmployeeId(localStorage.getItem('drishti_employee_id') || 'KSP-0000');
    let rawName = localStorage.getItem('userName') || localStorage.getItem('drishti_user_name') || 'V. Sharma';
    rawName = rawName.replace(/^(Inspector General|Sub-Inspector|Inspector|Officer|SI|DySP|SP|DSP)\s*/i, '').trim();
    if (rawName) setOfficerName(rawName);
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
    <div className="flex h-screen bg-[#F4F5F8] overflow-hidden">

      {/* ── MINIMALIST MODERN SIDEBAR ── */}
      <aside className={`flex flex-col transition-all duration-300 ease-in-out bg-white dark:bg-[#18181B] border-r border-gray-100 dark:border-gray-800 relative z-20 shadow-sm ${collapsed ? 'w-20' : 'w-60'}`}>
        {/* Brand Header */}
        <div className={`flex items-center px-4 py-5 ${collapsed ? 'justify-center px-2' : 'pr-6'}`}>
          <DrishtiLogo variant={collapsed ? 'icon' : 'compact'} size="md" href="/dashboard" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, id }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} prefetch={true} id={id}
                className={`flex items-center transition-all duration-150 group relative text-sm font-semibold rounded-2xl
                  ${collapsed
                    ? 'w-12 h-12 justify-center mx-auto'
                    : 'gap-3.5 px-4 py-3'
                  }
                  ${active
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
                title={collapsed ? label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${active ? 'text-white dark:text-black' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                {!collapsed && <span className="tracking-normal">{label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-gray-900 text-white shadow-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className={`p-4 border-t border-gray-100 dark:border-gray-800 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 mb-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-200">
                VS
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Insp. {officerName || 'V. Sharma'}</p>
                <p className="text-[10px] text-gray-400 font-medium truncate">{employeeId || 'KSP-4092'}</p>
              </div>
            </div>
          )}
          <button id="logout-btn" onClick={handleLogout}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-xs font-semibold ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all z-30 shadow-sm cursor-pointer"
          title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#F4F5F8] dark:bg-[#09090B]">
        {/* ── CLEAN DRIBBLE-STYLE TOP HEADER ── */}
        <header className="flex items-center justify-between px-8 py-5 bg-transparent flex-shrink-0 z-10 relative">
          {/* Minimalist Rounded Pill Search */}
          <div className="relative w-72 sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search cases, suspects, FIRs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 shadow-xs transition-all"
            />
          </div>

          {/* Right Section: Language, Alert Bell, Profile */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:text-black">
              <span>EN</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={openPanel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Drishti AI</span>
            </button>

            {/* Notification Bell */}
            <AlertNotification />

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                VS
              </div>
            </div>
          </div>
        </header>

        <main ref={mainContentRef} className="flex-1 overflow-auto px-4 sm:px-8 pb-8">{children}</main>
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
        onLanguageChange={handleLanguageChange}
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
          onDismissResponse={() => {
            setOrbResponse('');
            stopSpeaking();
            setOrbState('idle');
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
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
