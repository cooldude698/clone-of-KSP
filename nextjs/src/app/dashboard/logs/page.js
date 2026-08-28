'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Search, Trash2, Download, MessageSquare, AlertCircle, 
  User, MapPin, Calendar, Clock, ChevronRight, X, Filter, Bot,
  FileText, CheckCircle2, ArrowUpRight, Volume2, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Default pre-populated structured session cards for Police Officers
const DEFAULT_SESSION_CARDS = [
  {
    id: 'session-anand-gowda',
    subject: 'Anand Gowda',
    type: 'suspect',
    badge: 'ACTIVE WATCHLIST',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: User,
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
    subject: 'Zakir Hussain',
    type: 'unindexed',
    badge: 'NO RECORD FOUND',
    badgeColor: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
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
    subject: 'Ramesh Kumar (Bullet Ramesh)',
    type: 'suspect',
    badge: 'ABSCONDING',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    icon: User,
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
    subject: 'Indiranagar & 100 Feet Road',
    type: 'location',
    badge: 'HOTSPOT BRIEF',
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
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
    subject: 'Vehicle Theft KA-01-MJ-8821',
    type: 'fir',
    badge: 'FIR TRACKED',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: FileText,
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
  const [filterType, setFilterType]     = useState('all'); // all, suspect, unindexed, location, fir
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
                const subject = c.subject || extractSubjectFromText(c.preview || c.messages[0]?.content) || 'Catalyst Investigation Log';
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

        // Deduplicate messages by role, content snippet and timestamp
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
        
        // Deduplicate cards by id
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

  // Algorithm to segment chat messages by person / subject
  function segmentMessagesIntoCards(messages) {
    const cards = [];
    const groups = new Map();

    messages.forEach((msg) => {
      const text = msg.content || '';
      const subject = extractSubjectFromText(text) || 'Active Shift Session';

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
    const firMatch = text.match(/(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/i);
    if (firMatch) return `Case ${firMatch[0].toUpperCase()}`;

    if (q.includes('vikram') || q.includes('malhotra') || q.includes('9104')) return 'Vikram Malhotra (Cyber Fraud)';
    if (q.includes('anand') || q.includes('gowda') || q.includes('buda')) return 'Anand Gowda';
    if (q.includes('zakir') || q.includes('hussain')) return 'Zakir Hussain';
    if (q.includes('ramesh') || q.includes('bullet ramesh')) return 'Ramesh Kumar';
    if (q.includes('suresh') || q.includes('naidu')) return 'Suresh Naidu';
    if (q.includes('imran') || q.includes('khan')) return 'Imran Khan';
    if (q.includes('farid') || q.includes('mirza')) return 'Farid Mirza';
    if (q.includes('silk board') || q.includes('anpr') || q.includes('camera')) return 'Silk Board & ANPR Surveillance';
    if (q.includes('repeat') || q.includes('offender')) return 'Repeat Offenders Intel';
    if (q.includes('cyber') || q.includes('1930') || q.includes('helpline')) return 'Cyber Fraud 1930 Helpline SOP';
    if (q.includes('ndps') || q.includes('drug') || q.includes('seizure')) return 'NDPS Drug Seizure SOP';
    if (q.includes('indiranagar')) return 'Indiranagar Area';
    if (q.includes('vehicle') || q.includes('theft') || q.includes('4921')) return 'Vehicle Theft Analysis';

    // Auto-extract dynamic subject title from user query
    const clean = text.replace(/[*#\_|`]/g, ' ').replace(/^(can you|please|hey|hi|drishti|open|show|view|tell me|list|give me|find)\b/gi, '').trim();
    const words = clean.split(/\s+/).slice(0, 4).join(' ');
    if (words && words.length > 3) {
      return words.charAt(0).toUpperCase() + words.slice(1);
    }

    return null;
  }

  function buildCardObject(subject, messages, idx, customId = null) {
    const isUnindexed = messages.some(m => m.content?.includes('no suspect profile') || m.content?.includes('no case file found'));
    const isLocation = subject.toLowerCase().includes('indiranagar') || subject.toLowerCase().includes('area') || subject.toLowerCase().includes('silk board') || subject.toLowerCase().includes('anpr');
    const isFir = subject.toLowerCase().includes('fir') || subject.toLowerCase().includes('theft') || subject.toLowerCase().includes('case');

    const type = isUnindexed ? 'unindexed' : isLocation ? 'location' : isFir ? 'fir' : 'suspect';
    const badge = isUnindexed ? 'NO RECORD FOUND' : isLocation ? 'LOCATION BRIEF' : isFir ? 'FIR TRACKED' : 'SUSPECT INQUIRY';
    const badgeColor = isUnindexed
      ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
      : isLocation
      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
      : isFir
      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';

    const icon = isUnindexed ? AlertCircle : isLocation ? MapPin : isFir ? FileText : User;
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
      const matchesMessages = card.messages.some(m => m.content.toLowerCase().includes(q));

      return matchesType && (matchesSubject || matchesSummary || matchesMessages);
    });
  }, [sessionCards, search, filterType]);

  const handleExportCard = async (card) => {
    setExportingId(card.id);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: card.id,
          title: `DRISHTI Intelligence Log — ${card.subject}`,
          officer_name: 'Inspector V. Sharma',
          badge_number: 'KSP-4421',
          messages: card.messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.content_base64) {
          const byteChars = atob(data.content_base64);
          const byteArr = new Uint8Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
          const blob = new Blob([byteArr], { type: data.content_type || 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filename || `DRISHTI_Report_${card.id}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          setExportingId(null);
          return;
        }
      }
      throw new Error('PDF export failed');
    } catch (e) {
      // Fallback to txt if PDF fails
      const lines = card.messages.map(l =>
        `[${l.timestamp || '??:??'}] ${l.role === 'user' ? 'OFFICER' : 'DRISHTI AI'}: ${l.content}`
      );
      const txt = [
        `=== DRISHTI POLICE AI LOG: ${card.subject.toUpperCase()} ===`,
        `Date: ${card.date} at ${card.time}`,
        `Category: ${card.badge}`,
        `Total Messages: ${card.msgCount}`,
        '====================================================',
        '',
        ...lines,
      ].join('\n');
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drishti-log-${card.subject.toLowerCase().replace(/\s+/g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExportingId(null);
  };

  const handleDeleteCard = async (cardId) => {
    setSessionCards(prev => prev.filter(c => c.id !== cardId));
    if (selectedCard?.id === cardId) setSelectedCard(null);
    try {
      await fetch(`/api/conversations?conversation_id=${encodeURIComponent(cardId)}`, { method: 'DELETE' });
    } catch (_) {}
  };

  const handleClearAllLogs = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    localStorage.removeItem('drishti_chat_history_v2');
    localStorage.removeItem('drishti_session_logs');
    setSessionCards([]);
    setSelectedCard(null);
    setConfirmClear(false);
  };

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ' '));
    utt.lang = 'en-IN';
    utt.rate = 0.95;
    window.speechSynthesis.speak(utt);
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 text-[var(--text-primary)] font-sans">
      {/* ── Top Header Container ── */}
      <div className="space-y-4 pb-4 border-b border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">DRISHTI AI Subject Log Cards</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {sessionCards.length} Cards Saved
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                Conversations grouped automatically by person & topic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAllLogs}
              disabled={sessionCards.length === 0}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer disabled:opacity-40
                ${confirmClear 
                  ? 'bg-red-600 text-white border border-red-500' 
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-red-500 hover:bg-red-500/10 hover:border-red-500/30'}`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{confirmClear ? 'Confirm Clear All' : 'Clear Log Cards'}</span>
            </button>
            {confirmClear && (
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── Catalyst Cron & DataStore Event Bus Status ── */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-slate-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="font-bold text-amber-400">Catalyst Cron (Schedule: 0 0 * * *)</span>
              <span className="text-slate-400 text-[11px] block">Nightly Crime Risk Recalculator & DataStore Ingestion Triggers Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-emerald-400 font-bold border border-slate-700">
              DataStore Listener: on-fir-insert
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
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all cursor-pointer shadow-sm"
            >
              Trigger Cron Now
            </button>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="mt-5 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cards by suspect name, topic, or message content..."
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Cards' },
              { id: 'suspect', label: 'Suspect Files' },
              { id: 'unindexed', label: 'No Record Found' },
              { id: 'location', label: 'Location Briefs' },
              { id: 'fir', label: 'FIR Tracked' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer font-mono
                  ${filterType === tab.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="flex-1 p-6 overflow-auto">
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-[var(--text-primary)]">No Subject Cards Found</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Try clearing your search filter or talk to Drishti to create a new session card.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {filteredCards.map((card) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedCard(card)}
                  className="bg-white border border-slate-200/90 hover:border-blue-500/40 transition-all shadow-md hover:shadow-lg rounded-2xl p-5 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon + Title + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <CardIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-slate-900 font-mono truncate group-hover:text-blue-600 transition-colors">
                            {card.subject}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{card.date} • {card.time}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold tracking-wider border flex-shrink-0 ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    {/* Summary Snippet */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                      <p className="text-xs text-slate-700 font-sans leading-relaxed line-clamp-2">
                        &ldquo;{card.summary}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Footer Row: Messages count & Linking Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-slate-500">
                      {card.msgCount} message{card.msgCount !== 1 ? 's' : ''}
                    </span>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <button
                        onClick={(e) => handleOpenInCopilot(card, e)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Continue this conversation in Co-Pilot Chat"
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
                        className="p-1 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Delete AI Log from Datastore"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Full Conversation Detail Modal / Drawer ── */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <selectedCard.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900 font-mono">
                        {selectedCard.subject}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${selectedCard.badgeColor}`}>
                        {selectedCard.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Recorded on {selectedCard.date} at {selectedCard.time} • {selectedCard.msgCount} Messages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenInCopilot(selectedCard)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Continue thread in Co-Pilot Chat"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open in Co-Pilot</span>
                  </button>

                  <button
                    onClick={() => handleOpenInOrb(selectedCard)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Load thread into Drishti Orb Voice Assistant"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open in Orb</span>
                  </button>

                  <button
                    onClick={() => handleExportCard(selectedCard)}
                    disabled={exportingId === selectedCard?.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Export as PDF"
                  >
                    {exportingId === selectedCard?.id
                      ? <span className="text-[10px] font-mono text-[var(--text-secondary)] animate-pulse">...</span>
                      : <Download className="w-4 h-4 text-slate-600" />
                    }
                  </button>

                  <button
                    onClick={() => handleDeleteCard(selectedCard.id)}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer"
                    title="Delete Session Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedCard(null)}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Message Thread */}
              <div className="flex-1 overflow-auto p-6 space-y-4 bg-slate-50/50">
                {selectedCard.messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={idx}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] p-4 rounded-2xl text-sm leading-relaxed border shadow-md ${
                          isUser
                            ? 'bg-blue-600 text-white border-blue-500 rounded-tr-xs'
                            : 'bg-white text-slate-900 border-slate-200/90 rounded-tl-xs'
                        }`}
                      >
                        <div className={`flex items-center justify-between gap-4 mb-2 pb-1.5 border-b ${isUser ? 'border-blue-500/40' : 'border-slate-100'}`}>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isUser ? 'text-white' : 'text-blue-600'}`}>
                            {isUser ? 'Officer / Inspector' : 'DRISHTI AI Intelligence'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>{msg.timestamp || '11:45 AM'}</span>
                            {!isUser && (
                              <button
                                onClick={() => speakText(msg.content)}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                title="Listen Audio"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className={`whitespace-pre-wrap font-sans text-sm leading-relaxed ${isUser ? 'text-white font-medium' : 'text-slate-800'}`}>{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-medium">
                  Karnataka State Police AI Command Center
                </span>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Close Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
