'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Search, Trash2, Download, MessageSquare, AlertCircle, 
  User, MapPin, Calendar, Clock, ChevronRight, X, Filter, Bot,
  FileText, CheckCircle2, ArrowUpRight, Volume2, Radio, Sparkles,
  ShieldAlert, ShieldCheck, Car, Crosshair, Terminal,
  Database, RefreshCw, Layers, Compass, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PoliceIntelligenceRenderer from '@/components/PoliceIntelligenceRenderer';
import { generateContextualSuggestions } from '@/lib/drishtiIntelligenceEngine';

// Default pre-populated structured session cards for Police Officers
const DEFAULT_SESSION_CARDS = [
  {
    id: 'session-anand-gowda',
    subject: 'Target Dossier: Anand Gowda',
    type: 'suspect',
    badge: 'ACTIVE WATCHLIST',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    icon: UserCheck,
    time: '11:45 AM',
    date: 'Today, 26 July',
    msgCount: 4,
    summary: 'Inquiry regarding 4 active FIRs for extortion & chain snatching in Jayanagar 4th Block.',
    messages: [
      { role: 'user', content: 'Can you open this person case file Anand Gowda', timestamp: '11:42 AM' },
      { role: 'assistant', content: 'Opening suspect profile for Anand Gowda, Sir.', timestamp: '11:42 AM' },
      { role: 'user', content: 'Give me full criminal history and risk score for Anand Gowda', timestamp: '11:43 AM' },
      { role: 'assistant', content: 'Sir, Anand Gowda (SUS-8842) has 4 linked FIRs for vehicle theft and extortion. Risk score is 72/100 (HIGH). Rides stolen KTM Duke motorcycle KA-05-EV-9012 with fake plates. Last sighted near Jayanagar 4th Block.', timestamp: '11:45 AM' }
    ]
  },
  {
    id: 'session-zakir-hussain',
    subject: 'Verification: Zakir Hussain',
    type: 'unindexed',
    badge: 'NO RECORD FOUND',
    badgeColor: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
    icon: AlertCircle,
    time: '11:32 AM',
    date: 'Today, 26 July',
    msgCount: 2,
    summary: 'Verification search for suspect Zakir Hussain in MCCTNS & State database.',
    messages: [
      { role: 'user', content: 'Hey can you open Zakir Hussain file', timestamp: '11:32 AM' },
      { role: 'assistant', content: 'Sir, no suspect profile or case file found for "Zakir Hussain" in the Karnataka Police database. Please verify the name or FIR number.', timestamp: '11:32 AM' }
    ]
  },
  {
    id: 'session-ramesh-kumar',
    subject: 'Target Dossier: Ramesh Kumar ("Bullet Ramesh")',
    type: 'suspect',
    badge: 'ABSCONDING',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    icon: ShieldAlert,
    time: '10:15 AM',
    date: 'Today, 26 July',
    msgCount: 4,
    summary: 'Inter-district gang tracking & Hebbal Toll ANPR camera alert coordination.',
    messages: [
      { role: 'user', content: 'Where was Bullet Ramesh last spotted on ANPR camera?', timestamp: '10:12 AM' },
      { role: 'assistant', content: 'Sir, Ramesh Kumar (SUS-8842) was tracked passing Hebbal Toll approach heading North at 02:15 AM. Flagged high risk for inter-state vehicle transport.', timestamp: '10:13 AM' },
      { role: 'user', content: 'Which police stations have active warrants against him?', timestamp: '10:14 AM' },
      { role: 'assistant', content: 'Active arrest warrants issued by HSR Layout PS (FIR-2026-BL-4921) and Mysuru Saraswathipuram PS (FIR-2025-MY-892).', timestamp: '10:15 AM' }
    ]
  },
  {
    id: 'session-indiranagar-patrol',
    subject: 'ANPR Corridor: Indiranagar 100ft Road',
    type: 'location',
    badge: 'HOTSPOT BRIEF',
    badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    icon: MapPin,
    time: '09:40 AM',
    date: 'Today, 26 July',
    msgCount: 3,
    summary: 'Crime analysis and night Hoysala patrol deployment briefing for Indiranagar 100ft Road.',
    messages: [
      { role: 'user', content: 'So can you tell me everything near Indiranagar', timestamp: '09:38 AM' },
      { role: 'assistant', content: 'Sir, Indiranagar has 38 active FIR records this month, concentrated around 100 Feet Road and 80 Feet Road. Crime types include night vehicle theft (IPC 379) and pub altercation disputes.', timestamp: '09:39 AM' },
      { role: 'user', content: 'What is the Hoysala patrol plan for tonight?', timestamp: '09:40 AM' },
      { role: 'assistant', content: 'Hoysala 14 and 19 deployed between 23:00 to 04:00 hrs with static ANPR checkpoint at 100 Feet Road flyover.', timestamp: '09:40 AM' }
    ]
  },
  {
    id: 'session-vehicle-theft',
    subject: 'Plate Track: [KA-01-MJ-8821]',
    type: 'fir',
    badge: 'FIR TRACKED',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    icon: Car,
    time: 'Yesterday',
    date: '25 July',
    msgCount: 3,
    summary: 'Case file FIR-2026-BL-4921 vehicle theft tracking & camera feed verification.',
    messages: [
      { role: 'user', content: 'Open case file FIR-2026-BL-4921', timestamp: '04:15 PM' },
      { role: 'assistant', content: 'Opening case file FIR-2026-BL-4921, Sir.', timestamp: '04:15 PM' },
      { role: 'user', content: 'Show camera footage sightings for KA-01-MJ-8821', timestamp: '04:16 PM' },
      { role: 'assistant', content: 'Vehicle KA-01-MJ-8821 sighted at Vijayanagar TTMC (CAM-BLR-0010) and Silk Board Metro junction.', timestamp: '04:16 PM' }
    ]
  }
];

export default function LogsPage() {
  const router = useRouter();
  const [sessionCards, setSessionCards] = useState(DEFAULT_SESSION_CARDS);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [mounted, setMounted]           = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [exportingId, setExportingId]   = useState(null);

  const handleOpenInCopilot = (card, e) => {
    e?.stopPropagation();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drishti_chat_history_v2', JSON.stringify(card.messages));
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
    router.push('/dashboard/chat');
  };

  const handleOpenInOrb = (card, e) => {
    e?.stopPropagation();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drishti_session_logs', JSON.stringify(card.messages));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('drishti-open-orb', { detail: { messages: card.messages } }));
      } catch (_) {}
    }
  };

  const handleDeleteCard = (cardId) => {
    setSessionCards(prev => prev.filter(c => c.id !== cardId));
    if (selectedCard?.id === cardId) setSelectedCard(null);
  };

  // Load Catalyst Datastore conversations and local chat history into cards
  useEffect(() => {
    setMounted(true);

    const loadSessionLogs = async () => {
      try {
        let catalystCards = [];
        try {
          const res = await fetch('/api/conversations');
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.conversations)) {
              catalystCards = data.conversations.filter(c => c.messages && c.messages.length > 0).map((c, i) => {
                const subject = c.subject || extractSubjectFromText(c.preview || c.messages[0]?.content) || 'Investigation Dossier';
                return buildCardObject(subject, c.messages, i, c.conversation_id);
              });
            }
          }
        } catch (_) {}

        const rawUserChat = localStorage.getItem('drishti_chat_history_v2');
        const rawSessionLogs = localStorage.getItem('drishti_session_logs');
        
        let allMessages = [];
        if (rawUserChat) {
          try {
            const parsed = JSON.parse(rawUserChat);
            if (Array.isArray(parsed)) allMessages.push(...parsed);
          } catch (_) {}
        }
        if (rawSessionLogs) {
          try {
            const parsed = JSON.parse(rawSessionLogs);
            if (Array.isArray(parsed)) allMessages.push(...parsed);
          } catch (_) {}
        }

        const uniqueMessages = [];
        const seen = new Set();
        allMessages.forEach(msg => {
          const key = `${msg.role}:${(msg.content || '').slice(0, 60)}:${msg.timestamp || ''}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueMessages.push(msg);
          }
        });

        const userCards = uniqueMessages.length > 0 ? segmentMessagesIntoCards(uniqueMessages) : [];
        
        const cardMap = new Map();
        [...catalystCards, ...userCards, ...DEFAULT_SESSION_CARDS].forEach(card => {
          if (!cardMap.has(card.id)) {
            cardMap.set(card.id, card);
          }
        });

        setSessionCards(Array.from(cardMap.values()));
      } catch (e) {
        console.error('Error parsing session logs:', e);
        setSessionCards(DEFAULT_SESSION_CARDS);
      }
    };

    loadSessionLogs();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', loadSessionLogs);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', loadSessionLogs);
      }
    };
  }, []);

  // Intelligent Police Classification Engine
  function segmentMessagesIntoCards(messages) {
    const cards = [];
    const groups = new Map();

    messages.forEach((msg) => {
      const text = msg.content || '';
      const subject = extractSubjectFromText(text) || 'Shift Briefing & Operational Status';

      if (!groups.has(subject)) {
        groups.set(subject, []);
      }
      groups.get(subject).push(msg);
    });

    let idx = 0;
    groups.forEach((msgs, subject) => {
      cards.push(buildCardObject(subject, msgs, idx++));
    });

    return cards;
  }

  function extractSubjectFromText(text) {
    if (!text) return null;
    const q = text.toLowerCase();
    
    // Check for explicit FIR case number
    const firMatch = text.match(/(KAR\/[A-Z0-9]+\/\d+\/\d+|FIR-\d{4}-[A-Z0-9]+-\d+)/i);
    if (firMatch) return `Case Docket: ${firMatch[0].toUpperCase()}`;

    // Check for license plate
    const plateMatch = text.match(/KA[-\s]?\d{2}[-\s]?[A-Z]{1,3}[-\s]?\d{1,4}/i);
    if (plateMatch) return `Plate Intercept: [${plateMatch[0].toUpperCase()}]`;

    // Suspects
    if (q.includes('vikram') || q.includes('malhotra')) return 'Target Dossier: Vikram Malhotra (Cyber)';
    if (q.includes('anand') || q.includes('gowda')) return 'Target Dossier: Anand Gowda';
    if (q.includes('zakir') || q.includes('hussain')) return 'Verification: Zakir Hussain';
    if (q.includes('ramesh') || q.includes('bullet ramesh')) return 'Target Dossier: Ramesh Kumar';
    if (q.includes('suresh') || q.includes('naidu')) return 'Target Dossier: Suresh Naidu';
    if (q.includes('imran') || q.includes('khan')) return 'Target Dossier: Imran Khan';
    if (q.includes('farid') || q.includes('mirza')) return 'Target Dossier: Farid Mirza';

    // Hotspots & ANPR
    if (q.includes('silk board')) return 'ANPR Corridor: Silk Board Junction';
    if (q.includes('indiranagar')) return 'ANPR Corridor: Indiranagar 100ft Rd';
    if (q.includes('koramangala')) return 'ANPR Corridor: Koramangala 4th Block';
    if (q.includes('whitefield')) return 'ANPR Corridor: Whitefield TTMC';
    if (q.includes('hebbal')) return 'ANPR Corridor: Hebbal Toll Expressway';

    // SOP & Categories
    if (q.includes('panchanama') || q.includes('mahajaru')) return 'Legal SOP: Spot Panchanama Directive';
    if (q.includes('cyber') || q.includes('1930') || q.includes('fraud')) return 'Statute Directive: Cyber Fraud §66D';
    if (q.includes('ndps') || q.includes('drug') || q.includes('ganja')) return 'Statute Directive: NDPS Seizure Protocol';
    if (q.includes('theft') || q.includes('stolen') || q.includes('vehicle')) return 'Case Analysis: Vehicle Theft Network';
    if (q.includes('repeat') || q.includes('offender') || q.includes('watchlist')) return 'Strategic Intel: Repeat Offender Grid';

    // General Greeting / Status queries
    if (q.includes('hi') || q.includes('hello') || q.includes('good morning') || q.includes('good evening') || q.includes('who are you') || q.includes('what can you do') || q.includes('help')) {
      return 'Shift Briefing & Operational Status';
    }

    const clean = text.replace(/[*#\_|`]/g, ' ').replace(/^(can you|please|hey|hi|drishti|open|show|view|tell me|list|give me|find)\b/gi, '').trim();
    const words = clean.split(/\s+/).slice(0, 4).join(' ');
    if (words && words.length > 3) {
      return `Operational Inquiry: ${words.charAt(0).toUpperCase() + words.slice(1)}`;
    }

    return 'Shift Command Session';
  }

  function buildCardObject(subject, messages, idx, customId = null) {
    const s = subject.toLowerCase();
    const isUnindexed = messages.some(m => m.content?.includes('no suspect profile') || m.content?.includes('no case file found'));
    const isBriefing = s.includes('briefing') || s.includes('command session');
    const isLocation = s.includes('anpr') || s.includes('corridor') || s.includes('junction') || s.includes('hotspot');
    const isFir = s.includes('case docket') || s.includes('plate') || s.includes('vehicle');

    let type = 'suspect';
    let badge = 'SUSPECT DOSSIER';
    let badgeColor = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    let icon = UserCheck;

    if (isUnindexed) {
      type = 'unindexed';
      badge = 'NO RECORD FOUND';
      badgeColor = 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30';
      icon = AlertCircle;
    } else if (isBriefing) {
      type = 'briefing';
      badge = 'OPERATIONAL BRIEF';
      badgeColor = 'bg-slate-500/15 text-slate-700 dark:text-zinc-300 border-slate-500/30';
      icon = Radio;
    } else if (isLocation) {
      type = 'location';
      badge = 'ANPR CORRIDOR';
      badgeColor = 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      icon = MapPin;
    } else if (isFir) {
      type = 'fir';
      badge = 'CASE DOCKET';
      badgeColor = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      icon = FileText;
    }

    const firstMsgTime = messages[0]?.timestamp || 'Just now';
    const firstUserQuery = messages.find(m => m.role === 'user')?.content || messages[0]?.content || 'Session inquiry';

    return {
      id: customId || `user-session-${idx}-${Date.now()}`,
      subject,
      type,
      badge,
      badgeColor,
      icon,
      time: firstMsgTime,
      date: 'Active Session',
      msgCount: messages.length,
      summary: firstUserQuery.slice(0, 180),
      messages,
    };
  }

  // Filter cards by search query and category filter
  const filteredCards = useMemo(() => {
    return sessionCards.filter(card => {
      const matchesType = filterType === 'all' || card.type === filterType;
      const q = search.toLowerCase().trim();
      if (!q) return matchesType;

      const matchesSubject = card.subject.toLowerCase().includes(q);
      const matchesSummary = card.summary.toLowerCase().includes(q);
      const matchesMessages = card.messages.some(m => (m.content || '').toLowerCase().includes(q));

      return matchesType && (matchesSubject || matchesSummary || matchesMessages);
    });
  }, [sessionCards, search, filterType]);

  const handleClearAllLogs = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    localStorage.removeItem('drishti_chat_history_v2');
    localStorage.removeItem('drishti_session_logs');
    setSessionCards([]);
    setSelectedCard(null);
    setConfirmClear(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-full bg-slate-50/50 dark:bg-[#09090B] flex flex-col font-sans">
      
      {/* ── Top Header ── */}
      <div className="px-4 sm:px-7 py-5 border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#121215]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight uppercase">
                  OPERATIONAL INTELLIGENCE AUDIT LOGS
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {sessionCards.length} Dossiers
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Karnataka State Police CCTNS • Autonomous Case Dossiers & Shift Transcripts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAllLogs}
              disabled={sessionCards.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer disabled:opacity-40 shadow-xs
                ${confirmClear 
                  ? 'bg-red-600 text-white border border-red-500' 
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-red-600 hover:bg-red-500/10 hover:border-red-500/30'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Confirm Clear All' : 'Clear All Dossiers'}</span>
            </button>
            {confirmClear && (
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── Catalyst Cron & Ingestion Telemetry ── */}
        <div className="max-w-7xl mx-auto mt-4 p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-zinc-100">Zoho Catalyst QuickML Pipeline</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                  CRON (0 0 * * *)
                </span>
              </div>
              <span className="text-slate-500 dark:text-zinc-400 text-[11px] block">
                Nightly Crime Risk Recalculator & CCTNS DataStore Ingestion Triggers Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
              Listener: ON-FIR-INSERT
            </span>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/server/cron-night-recalc');
                  if (res.ok) alert('Catalyst Cron Recalculation executed successfully!');
                } catch (e) {
                  alert('Cron execute error: ' + e.message);
                }
              }}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
            >
              Trigger Recalculation
            </button>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="max-w-7xl mx-auto mt-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search audit dossiers by suspect name, ANPR corridor, or case number…"
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Dossiers' },
              { id: 'suspect', label: 'Suspects' },
              { id: 'location', label: 'ANPR Corridors' },
              { id: 'fir', label: 'Case Files' },
              { id: 'briefing', label: 'Shift Briefings' },
              { id: 'unindexed', label: 'Unindexed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-mono shadow-xs
                  ${filterType === tab.id 
                    ? 'bg-blue-600 text-white shadow-blue-500/20' 
                    : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="flex-1 p-4 sm:p-7 overflow-auto">
        {/* ── AI Context Smart Suggestions ── */}
        {(() => {
          // Collect all messages from all session cards for context
          const allMessages = sessionCards.flatMap(c => c.messages || []);
          const contextSuggestions = generateContextualSuggestions(allMessages, '/dashboard/logs', 'en');
          
          if (contextSuggestions.length === 0) return null;
          
          return (
            <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl border bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 border-blue-500/20 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🤖</span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">
                  DRISHTI Smart Suggestions
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 font-bold font-mono">
                  AI CONTEXT
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {contextSuggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    onClick={() => {
                      // If it's a navigation suggestion, navigate; otherwise open orb with the query
                      const isNav = suggestion.action.startsWith('open ') && !suggestion.action.includes('dossier') && !suggestion.action.includes('Show') && !suggestion.action.includes('Check') && !suggestion.action.includes('Track');
                      if (isNav) {
                        const navMap = {
                          'open crime map': '/dashboard/map',
                          'open surveillance': '/dashboard/surveillance',
                          'open network graph': '/dashboard/network',
                          'open panchanama': '/dashboard/fir/panchanama',
                        };
                        const path = navMap[suggestion.action];
                        if (path) { router.push(path); return; }
                      }
                      // Otherwise fire as a Drishti query via the orb
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('drishti-open-orb', {
                          detail: {
                            messages: [{ role: 'user', content: suggestion.action, timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]
                          }
                        }));
                        // Also trigger the query immediately
                        try {
                          localStorage.setItem('drishti_pending_query', suggestion.action);
                          window.dispatchEvent(new Event('storage'));
                        } catch (_) {}
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all bg-[var(--surface-1)] hover:bg-blue-500/15 border-[var(--border)] hover:border-blue-500/30 text-[var(--text-primary)] hover:text-blue-400 font-medium font-mono cursor-pointer shadow-sm"
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                    {suggestion.priority === 'high' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">No Matching Audit Dossiers</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Try adjusting your filter or query DRISHTI Copilot to log new operational intelligence.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filteredCards.map((card) => {
              const CardIcon = card.icon || FileText;
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedCard(card)}
                  className="bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md rounded-2xl p-4 sm:p-5 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon + Title + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-200 shrink-0">
                          <CardIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white font-mono truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {card.subject}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{card.date} • {card.time}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider border shrink-0 ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    {/* Summary Snippet */}
                    <div className="bg-slate-50/80 dark:bg-zinc-900/60 rounded-xl p-3 border border-slate-200/60 dark:border-zinc-800/80">
                      <p className="text-xs text-slate-700 dark:text-zinc-300 font-sans leading-relaxed line-clamp-2">
                        &ldquo;{card.summary}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Footer Row: Messages count & Linking Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-slate-400 text-[11px]">
                      {card.msgCount} message{card.msgCount !== 1 ? 's' : ''}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleOpenInCopilot(card, e)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Continue this conversation in Co-Pilot Workspace"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={(e) => handleOpenInOrb(card, e)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Load this session into Drishti Voice Orb"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Orb</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Delete AI Log from Datastore"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Full Conversation Detail Modal ── */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white dark:bg-[#121215] flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <selectedCard.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">
                        {selectedCard.subject}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${selectedCard.badgeColor}`}>
                        {selectedCard.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Recorded on {selectedCard.date} at {selectedCard.time} • {selectedCard.msgCount} Messages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleOpenInCopilot(selectedCard, e)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Open in Copilot"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copilot</span>
                  </button>

                  <button
                    onClick={(e) => handleOpenInOrb(selectedCard, e)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Load thread into Drishti Orb Voice Assistant"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Orb</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCard(selectedCard.id)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
                    title="Delete Session Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedCard(null)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Message Thread */}
              <div className="flex-1 overflow-auto p-6 space-y-4 bg-slate-50/50 dark:bg-zinc-950/40">
                {selectedCard.messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={idx}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-[#121215] text-slate-900 dark:text-zinc-100 border border-slate-200/90 dark:border-zinc-800 rounded-tl-xs'
                        }`}
                      >
                        <div className={`flex items-center justify-between gap-4 mb-2 pb-1.5 border-b ${isUser ? 'border-blue-500/40' : 'border-slate-100 dark:border-zinc-800/80'}`}>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isUser ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                            {isUser ? 'Police Officer' : 'DRISHTI AI Intelligence'}
                          </span>
                          <span className={`text-[10px] font-mono ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                            {msg.timestamp || '11:45 AM'}
                          </span>
                        </div>

                        {isUser ? (
                          <p className="font-sans text-xs leading-relaxed text-white font-medium">{msg.content}</p>
                        ) : (
                          <PoliceIntelligenceRenderer text={msg.content} isDark={true} theme="default" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121215] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-medium">
                  Karnataka State Police • SCRB Telemetry Audit
                </span>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all cursor-pointer shadow-xs"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
