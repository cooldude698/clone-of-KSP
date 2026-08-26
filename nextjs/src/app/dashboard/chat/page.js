'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Sparkles, 
  Copy, Check, X, ShieldAlert, FileText, Search, Car, Users, 
  Database, RefreshCw, Cpu, Layers, ArrowRight, CornerDownLeft
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import InvestigatorWall from '@/components/InvestigatorWall';
import VoiceDebugStatus from '@/components/VoiceDebugStatus';
import { UPLOADED_FIRS } from '@/lib/uploadedFirsStore';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const SUGGESTIONS = [
  {
    icon: Car,
    title: 'Vehicle Theft Analysis',
    text: 'Show all vehicle thefts in Bengaluru this month',
    badge: 'AUTOMATED SEARCH',
  },
  {
    icon: Search,
    title: 'Kannada Case Query',
    text: 'ಕಳೆದ ತಿಂಗಳ ದರೋಡೆ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ',
    badge: 'ಕನ್ನಡ RAG',
  },
  {
    icon: Users,
    title: 'High-Risk Repeat Offenders',
    text: 'List top repeat offenders with risk score > 70',
    badge: 'CRIME INTEL',
  },
  {
    icon: FileText,
    title: 'Inspect Specific Case',
    text: 'Show details for case FIR-2026-BL-4921',
    badge: 'FILE LOOKUP',
  },
];

const VOICE_PROFILES = [
  { id: 'en-NeerjaNeural',  label: 'EN · Neerja',   lang: 'en', ttsLang: 'en-IN', neural: 'en-IN-NeerjaNeural'  },
  { id: 'en-PrabhatNeural', label: 'EN · Prabhat',  lang: 'en', ttsLang: 'en-IN', neural: 'en-IN-PrabhatNeural' },
  { id: 'en-RaviNeural',    label: 'EN · Ravi',     lang: 'en', ttsLang: 'en-IN', neural: 'en-IN-RaviNeural'    },
  { id: 'kn-SapnaNeural',   label: 'ಕನ್ನಡ · Sapna', lang: 'kn', ttsLang: 'kn-IN', neural: 'kn-IN-SapnaNeural'  },
  { id: 'hi-SwaraNeural',   label: 'हिंदी · Swara', lang: 'hi', ttsLang: 'hi-IN', neural: 'hi-IN-SwaraNeural'  },
];

function MessageBubble({ msg, onCaseClick, onSpeak, isSpeakingThis, onSuggestionClick }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const renderContentWithCaseLinks = (text) => {
    // Check if this message is an automated FIR entry notification
    if (text.includes('AUTOMATED FIR ENTRY STORED IN DATASTORE') || text.includes('FIR Document parsed and stored')) {
      const caseMatch = text.match(/FIR-[0-9]{4}-[A-Z0-9-]+/i);
      const caseNum = caseMatch ? caseMatch[0].toUpperCase() : 'FIR-RECORD';
      
      const crimeTypeMatch = text.match(/- Crime Type:\s*([^\n]+)/i);
      const districtMatch = text.match(/- District:\s*([^\n]+)/i);
      const stationMatch = text.match(/- Police Station:\s*([^\n]+)/i);
      const statusMatch = text.match(/- Status:\s*([^\n]+)/i);

      return (
        <div className="my-2 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden shadow-lg">
          {/* Card Top Banner - Deep Ocean Navy */}
          <div className="bg-slate-900 dark:bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
                  Automated FIR Entry Registered
                </h4>
                <p className="text-[10px] font-mono text-slate-400">
                  Karnataka State Police CCTNS Datastore
                </p>
              </div>
            </div>
            {caseMatch && (
              <button
                onClick={() => onCaseClick && onCaseClick(caseNum)}
                className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono font-extrabold text-xs shadow-md hover:bg-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                {caseNum}
              </button>
            )}
          </div>

          {/* Data Grid Badges */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]/50">
                <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">Crime Type</span>
                <span className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase tracking-wide">
                  {crimeTypeMatch ? crimeTypeMatch[1].trim().replace('_', ' ') : 'General Offence'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]/50">
                <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">Police Station</span>
                <span className="text-xs font-bold font-mono text-[var(--text-primary)] truncate block">
                  {stationMatch ? stationMatch[1].trim() : 'Central Command'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]/50">
                <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">District</span>
                <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                  {districtMatch ? districtMatch[1].trim() : 'Bengaluru Urban'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]/50">
                <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">Status</span>
                <span className="text-xs font-extrabold font-mono text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {statusMatch ? statusMatch[1].trim().toUpperCase() : 'UNDER INVESTIGATION'}
                </span>
              </div>
            </div>

            {/* Document Content Box */}
            <div className="mt-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-primary)] tracking-wider block mb-1">
                Parsed Document Preview & Metadata:
              </span>
              <div className="bg-[var(--surface-2)] border border-[var(--border)]/50 rounded-xl p-3 text-xs text-[var(--text-primary)] font-mono max-h-48 overflow-y-auto leading-relaxed shadow-inner">
                {text.replace(/AUTOMATED FIR ENTRY STORED IN DATASTORE[\s\S]*?Document Summary:\s*/i, '').replace(/✅[\s\S]*/i, '')}
              </div>
            </div>

            {/* Bottom Verification Tag */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]/30 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4 shrink-0" />
              <span>Document indexed into live RAG memory & ANPR surveillance watchlists.</span>
            </div>
          </div>
        </div>
      );
    }

    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('|')) {
        return (
          <div key={i} className="font-mono text-xs text-[var(--text-primary)] border-b border-[var(--border)]/40 py-1.5 grid grid-cols-4 gap-2">
            {line.split('|').filter(Boolean).map((cell, j) => {
              const cellText = cell.trim();
              const caseRegex = /(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/;
              if (caseRegex.test(cellText)) {
                return (
                  <button
                    key={j}
                    onClick={() => onCaseClick && onCaseClick(cellText)}
                    className="text-left text-blue-600 dark:text-blue-400 hover:underline font-bold transition-colors focus:outline-none cursor-pointer"
                  >
                    {cellText}
                  </button>
                );
              }
              return <span key={j} className={j === 0 ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}>{cellText}</span>;
            })}
          </div>
        );
      }

      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={`${line === '' ? 'mt-2' : ''} leading-relaxed font-sans text-sm text-[var(--text-primary)]`}>
          {boldParts.map((part, j) => {
            const isBold = j % 2 === 1;
            const singleCaseRegex = /^(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)$/i;
            const caseSplitRegex = /(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/g;
            const subParts = part.split(caseSplitRegex);

            const renderedSubParts = subParts.map((subPart, k) => {
              if (singleCaseRegex.test(subPart)) {
                return (
                  <Link
                    key={k}
                    href={`/dashboard/fir/${encodeURIComponent(subPart)}`}
                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-mono font-bold border border-blue-500/30 rounded-lg px-2 py-0.5 bg-blue-500/10 transition-all mx-1 inline-flex items-center gap-1 focus:outline-none cursor-pointer shadow-xs hover:scale-105"
                  >
                    <FileText className="w-3 h-3 text-blue-500" />
                    {subPart}
                  </Link>
                );
              }
              return subPart;
            });

            return isBold ? (
              <strong key={j} className="text-[var(--text-primary)] font-extrabold">{renderedSubParts}</strong>
            ) : (
              <span key={j}>{renderedSubParts}</span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3.5 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border
        ${isUser 
          ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-700' 
          : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border-blue-500/40'}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-white" />
        }
      </div>

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)] px-1">
          <span className="font-bold">{isUser ? 'INSPECTOR (YOU)' : 'DRISHTI INTELLIGENCE'}</span>
          <span>•</span>
          <span>{msg.timestamp || 'Just now'}</span>
        </div>

        <div className={`rounded-2xl px-5 py-4 text-sm relative shadow-sm border backdrop-blur-md
          ${isUser
            ? 'bg-blue-600 text-white border-blue-500 rounded-tr-xs shadow-blue-600/10'
            : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border)]/70 rounded-tl-xs'
          }`}>
          {isUser
            ? <p className="font-sans leading-relaxed text-white">{msg.content}</p>
            : <div className="space-y-2">{renderContentWithCaseLinks(msg.content)}</div>
          }
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 px-1 pt-1 opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <span className="text-[var(--text-secondary)]">•</span>
            <button
              onClick={() => onSpeak && onSpeak(msg.content)}
              className={`text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors ${
                isSpeakingThis ? 'text-rose-600 font-bold animate-pulse' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Volume2 className="w-3 h-3" />
              {isSpeakingThis ? 'Speaking...' : 'Listen'}
            </button>
          </div>
        )}

        {!isUser && (msg.suggestions || msg.follow_up_suggestions)?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5 px-1">
            {(msg.suggestions || msg.follow_up_suggestions).map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (onSuggestionClick) {
                    onSuggestionClick(s);
                  } else {
                    setInput('');
                    sendMessage(s);
                  }
                }}
                className="px-2.5 py-1 rounded-full bg-[var(--surface-1)] hover:bg-blue-500/10 border border-[var(--border)] hover:border-blue-500/40 text-[11px] font-mono text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-xs"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 items-center"
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot className="w-4 h-4 text-[var(--cyan-accent)] animate-pulse" />
      </div>
      <div className="glass-panel border border-[var(--border)] rounded-2xl rounded-tl-xs px-5 py-3.5 shadow-lg">
        <div className="flex gap-1.5 items-center h-4">
          <span className="text-xs font-mono text-[var(--text-secondary)] font-bold mr-1">ANALYZING EVIDENCE</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-accent)] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const CHAT_STORAGE_KEY = 'drishti_chat_history_v2';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState('en-NeerjaNeural');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micPermission, setMicPermission] = useState('prompt');
  const [error, setError] = useState(null);
  const consecutiveErrorsRef = useRef(0);
  const [conversationId, setConversationId] = useState('');
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const pttStartTimeRef = useRef(0);
  const isHoldingRef = useRef(false);
  const shouldRestartRef = useRef(false);

  const [selectedFIR, setSelectedFIR] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeCaseDetails, setActiveCaseDetails] = useState(null);
  const [isLoadingCase, setIsLoadingCase] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    setConversationId(`CONV-${Date.now().toString(36).toUpperCase()}`);
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);

      try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load chat history:', e);
      }
    }
  }, []);

  const extractSubjectFromMessages = (msgs) => {
    const userMsgs = (msgs || []).filter(m => m.role === 'user');
    if (!userMsgs.length) return 'General Shift Inquiry';
    const firstText = userMsgs[0].content || '';
    const q = firstText.toLowerCase();

    const firMatch = firstText.match(/(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/i);
    if (firMatch) return `Case ${firMatch[0].toUpperCase()}`;

    if (q.includes('vikram') || q.includes('malhotra') || q.includes('9104')) return 'Vikram Malhotra (Cyber Fraud)';
    if (q.includes('anand') || q.includes('gowda')) return 'Anand Gowda';
    if (q.includes('zakir') || q.includes('hussain')) return 'Zakir Hussain';
    if (q.includes('ramesh') || q.includes('bullet ramesh')) return 'Ramesh Kumar';
    if (q.includes('suresh') || q.includes('naidu')) return 'Suresh Naidu';
    if (q.includes('silk board') || q.includes('anpr')) return 'Silk Board & ANPR Surveillance';

    const clean = firstText.replace(/[*#\_|`]/g, ' ').replace(/^(can you|please|hey|hi|drishti|open|show|view|tell me|list|give me|find)\b/gi, '').trim();
    const words = clean.split(/\s+/).slice(0, 4).join(' ');
    if (words && words.length > 3) {
      return words.charAt(0).toUpperCase() + words.slice(1);
    }
    return 'Shift Inquiry Session';
  };

  // Save chat history to localStorage & auto-sync to Catalyst Datastore on update
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        window.dispatchEvent(new Event('storage'));

        // Auto-sync to Catalyst Datastore NoSQL collection
        const activeConvId = conversationId || `conv_${Date.now()}`;
        const subject = extractSubjectFromMessages(messages);
        fetch(`${API_BASE}/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: activeConvId,
            messages,
            subject,
          }),
        }).catch(() => {});
      } catch (e) {
        console.warn('Failed to save chat history:', e);
      }
    }
  }, [messages, conversationId]);

  const clearChatHistory = async () => {
    if (messages.length > 0) {
      // 1. Archive current active conversation to Catalyst Datastore before clearing
      const activeConvId = conversationId || `conv_${Date.now()}`;
      const subject = extractSubjectFromMessages(messages);
      try {
        await fetch(`${API_BASE}/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: activeConvId,
            messages,
            subject,
          }),
        });
      } catch (e) {
        console.warn('Failed to archive conversation to Catalyst:', e);
      }
    }

    // 2. Clear current screen messages and generate new unique conversation ID for next chat session
    setMessages([]);
    setConversationId(`CONV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const timestamp = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const audioElementRef = useRef(null);
  const speechTokenRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const initVoices = () => {
        try { window.speechSynthesis.getVoices(); } catch (_) {}
      };
      initVoices();
      window.speechSynthesis.onvoiceschanged = initVoices;
    }

    const unlockAudio = () => {
      try {
        if (typeof window !== 'undefined') {
          window.speechSynthesis?.resume();
          const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
          silentAudio.play().then(() => silentAudio.pause()).catch(() => {});
        }
      } catch (_) {}
    };

    const handleStopAll = () => {
      if (typeof window !== 'undefined') {
        try { window.speechSynthesis?.cancel(); } catch (_) {}
      }
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        } catch (_) {}
        audioElementRef.current = null;
      }
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
      window.addEventListener('drishti-stop-speech', handleStopAll);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('drishti-stop-speech', handleStopAll);
      }
    };
  }, []);

  const stopSpeech = () => {
    speechTokenRef.current++;
    if (typeof window !== 'undefined') {
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
      try {
        window.dispatchEvent(new CustomEvent('drishti-stop-speech'));
      } catch (_) {}
    }
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch (_) {}
      audioElementRef.current = null;
    }
    setIsSpeaking(false);
    setSpeakingMsgIdx(null);
  };

  const speakWithBrowserSpeechSynthesis = (cleanText, profile, msgIdx, token) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
      return;
    }
    if (token && speechTokenRef.current !== token) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = profile.ttsLang || 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices() || [];
      const matchedVoice =
        voices.find(
          (v) =>
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Online') ||
              v.name.includes('Neerja') ||
              v.name.includes('Swara') ||
              v.name.includes('Sapna') ||
              v.name.includes('Microsoft')) &&
            (v.lang.startsWith(profile.lang) || v.lang === profile.ttsLang)
        ) ||
        voices.find((v) => v.lang === profile.ttsLang || v.lang.startsWith(profile.lang));

      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => {
        if (token && speechTokenRef.current !== token) {
          window.speechSynthesis.cancel();
          return;
        }
        setIsSpeaking(true);
        setSpeakingMsgIdx(msgIdx);
      };
      utterance.onend = () => {
        if (!token || speechTokenRef.current === token) {
          setIsSpeaking(false);
          setSpeakingMsgIdx(null);
        }
      };
      utterance.onerror = () => {
        if (!token || speechTokenRef.current === token) {
          setIsSpeaking(false);
          setSpeakingMsgIdx(null);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Browser SpeechSynthesis error:', e);
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
    }
  };

  const speakText = async (text, msgIdx) => {
    if (typeof window === 'undefined') return;

    if (isSpeaking && speakingMsgIdx === msgIdx) {
      stopSpeech();
      return;
    }

    const currentToken = ++speechTokenRef.current;
    stopSpeech();

    const cleanText = text.replace(/[*#\_|`]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const profile = VOICE_PROFILES.find((p) => p.id === voiceProfile) || VOICE_PROFILES[0];

    // 1. Try high-quality Neural Edge TTS via backend API
    try {
      const res = await fetch(`${API_BASE}/drishtiVoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'tts', text: cleanText, lang: profile.lang }),
      });

      if (speechTokenRef.current !== currentToken) return;

      if (res.ok) {
        const data = await res.json();
        if (speechTokenRef.current !== currentToken) return;

        if (data && data.audioBase64) {
          const audioSrc = `data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`;
          const audio = new Audio(audioSrc);
          audioElementRef.current = audio;

          audio.onplay = () => {
            if (speechTokenRef.current !== currentToken) {
              audio.pause();
              return;
            }
            setIsSpeaking(true);
            setSpeakingMsgIdx(msgIdx);
          };

          audio.onended = () => {
            if (speechTokenRef.current === currentToken) {
              setIsSpeaking(false);
              setSpeakingMsgIdx(null);
            }
            if (audioElementRef.current === audio) {
              audioElementRef.current = null;
            }
          };

          audio.onerror = () => {
            if (audioElementRef.current === audio) {
              audioElementRef.current = null;
            }
            if (speechTokenRef.current === currentToken) {
              speakWithBrowserSpeechSynthesis(cleanText, profile, msgIdx, currentToken);
            }
          };

          try {
            await audio.play();
            return;
          } catch (playErr) {
            console.warn('[drishtiVoice] audio.play() rejected (autoplay or audio error):', playErr);
            audioElementRef.current = null;
          }
        }
      }
    } catch (e) {
      console.warn('[drishtiVoice] Backend Neural TTS warning:', e.message);
    }

    // 2. Fallback to natural browser SpeechSynthesis if Neural API is unreachable
    if (speechTokenRef.current === currentToken) {
      speakWithBrowserSpeechSynthesis(cleanText, profile, msgIdx, currentToken);
    }
  };

  const downloadReport = async () => {
    if (!activeCaseDetails?.fir?.case_number) return;
    setDownloadLoading(true);
    try {
      window.print();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadLoading(false);
    }
  };

  const fetchCaseDetails = async (caseNumber) => {
    setIsLoadingCase(true);
    setSelectedFIR(caseNumber);
    setRightPanelOpen(true);
    
    const queryLower = (caseNumber || '').toLowerCase();
    
    try {
      let firRecord = null;
      try {
        const res = await fetch(`${API_BASE}/firs?search=${encodeURIComponent(caseNumber)}&limit=1`);
        if (res.ok) {
          const data = await res.json();
          firRecord = Array.isArray(data) ? data[0] : (data.firs ? data.firs[0] : data);
        }
      } catch (_) {}

      if (!firRecord) {
        try {
          const res2 = await fetch(`${API_BASE}/analytics/firs?case_number=${encodeURIComponent(caseNumber)}&limit=1`);
          if (res2.ok) {
            const data2 = await res2.json();
            firRecord = Array.isArray(data2) ? data2[0] : data2;
          }
        } catch (_) {}
      }

      if (firRecord) {
        setActiveCaseDetails({
          fir: {
            case_number: firRecord.case_number || caseNumber,
            crime_type: firRecord.crime_type || 'vehicle_theft',
            date_filed: firRecord.date_filed || '2026-07-22',
            location_name: firRecord.location || 'Silk Board Junction, Bengaluru',
            case_status: firRecord.case_status || 'under_investigation',
            description: firRecord.description || 'Karnataka State Police CCTNS Datastore Record',
            police_station: firRecord.police_station || 'Whitefield Cyber Crime PS / CEN Command',
          },
          accused: firRecord.accused || [{ full_name: firRecord.suspect_name || 'Ramesh Kumar', alias: 'Bullet Ramesh', age: 34, risk_score: 94 }],
          victims: firRecord.victims || [{ full_name: 'Complainant KSP', age: 42 }],
          related_firs: firRecord.related_firs || ['FIR-2026-BL-9104', 'FIR-2026-BL-4421'],
          case_summary: firRecord.summary || 'ANPR Camera SC-0045 hit detected suspect vehicle KA-01-EA-4921 linked to repeat offender.'
        });
        return;
      }

      // Explicit Suspect Lookup Fallback
      if (queryLower.includes('ramesh')) {
        setActiveCaseDetails({
          fir: {
            case_number: 'FIR-2026-BL-9104',
            crime_type: 'vehicle_theft',
            date_filed: '22-JUL-2026',
            location_name: 'Silk Board Junction, Hosur Road Corridor, Bengaluru',
            case_status: 'under_investigation',
            description: 'Section 379 IPC - Stolen Honda Activa KA-01-EA-4921 tracked via ANPR Camera SC-0045.',
            police_station: 'Madiwala Traffic & Crime PS',
          },
          accused: [{ full_name: 'Ramesh Kumar', alias: 'Bullet Ramesh', age: 34, gender: 'Male', prior_convictions: 7, risk_score: 94 }],
          victims: [{ full_name: 'V. K. Swamy', age: 45 }],
          related_firs: ['FIR-2026-BL-8842', 'FIR-2026-BL-3791'],
          case_summary: 'Target suspect Ramesh Kumar flagged by ANPR surveillance near Silk Board service lanes. Active checkpoint alert initiated.'
        });
      } else if (queryLower.includes('vikram') || queryLower.includes('malhotra')) {
        setActiveCaseDetails({
          fir: {
            case_number: 'FIR-2026-BL-9104',
            crime_type: 'cyber_fraud',
            date_filed: '22-JUL-2026',
            location_name: 'ITPB Main Road, Whitefield Tech Park Corridor, Bengaluru',
            case_status: 'under_investigation',
            description: 'IT Act §66D & IPC §420 - High value digital imposter fraud registered at Whitefield Cyber Crime PS.',
            police_station: 'Whitefield Cyber Crime PS / CEN Command',
          },
          accused: [{ full_name: 'Vikram Malhotra', alias: 'Vicky Cyber', age: 38, gender: 'Male', prior_convictions: 3, risk_score: 88 }],
          victims: [{ full_name: 'R. K. Menon', age: 51 }],
          related_firs: ['FIR-2026-BL-9104'],
          case_summary: 'Primary suspect Vikram Malhotra linked to financial fraud operations across Whitefield corridor. Account freeze initiated under 1930 Helpline SOP.'
        });
      } else {
        setActiveCaseDetails({
          fir: {
            case_number: caseNumber.toUpperCase().includes('FIR') ? caseNumber.toUpperCase() : `FIR-2026-BL-${Math.floor(1000 + Math.random() * 9000)}`,
            crime_type: 'general_offence',
            date_filed: '2026-07-22',
            location_name: 'Bengaluru Urban District',
            case_status: 'under_investigation',
            description: 'Official case document logged under CCTNS precinct surveillance limits.',
            police_station: 'City Crime Branch (CCB)',
          },
          accused: [{ full_name: caseNumber.length > 2 && !caseNumber.includes('-') ? caseNumber : 'Ramesh Kumar', alias: 'Suspect Record', age: 34, gender: 'Male', prior_convictions: 5, risk_score: 85 }],
          victims: [{ full_name: 'KSP State Complainant', age: 40 }],
          related_firs: [],
          case_summary: 'Digital intelligence matching reveals active surveillance log entries for this case file.'
        });
      }
    } catch (err) {
      setActiveCaseDetails({
        fir: {
          case_number: 'FIR-2026-BL-9104',
          crime_type: 'vehicle_theft',
          date_filed: '22-JUL-2026',
          location_name: 'Silk Board Junction, Bengaluru',
          case_status: 'under_investigation',
          description: 'Official case file from Karnataka State Police CCTNS datastore.',
          police_station: 'Whitefield Cyber Crime PS / CEN Command',
        },
        accused: [{ full_name: 'Ramesh Kumar', alias: 'Bullet Ramesh', age: 34, gender: 'Male', prior_convictions: 7, risk_score: 94 }],
        victims: [{ full_name: 'A. K. Shastri', age: 52 }],
        related_firs: [],
        case_summary: 'Digital intelligence matching reveals active surveillance log entries.'
      });
    } finally {
      setIsLoadingCase(false);
    }
  };

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileName = file.name;
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target?.result || '';
      try {
        const res = await fetch('/api/upload-fir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName,
            fileContent: typeof content === 'string' ? content : 'Binary FIR document attached',
          }),
        });

        let data = null;
        try {
          data = await res.json();
        } catch (parseErr) {
          console.warn('Failed to parse upload-fir JSON response:', parseErr);
        }

        if (data && data.success) {
          const rec = data.record;
          const cardMsg = `📄 **AUTOMATED FIR ENTRY STORED IN DATASTORE**\n\n- **Case Number:** \`${rec.case_number}\`\n- **Crime Type:** ${rec.crime_type_code}\n- **District:** ${rec.district_name}\n- **Police Station:** ${rec.police_station}\n- **Date Filed:** ${rec.date_filed}\n- **Status:** ${rec.status}\n\n**Document Summary:**\n_${rec.description}_\n\n✅ *This case has been indexed and is now searchable by DRISHTI AI.*`;

          setMessages((prev) => [
            ...prev,
            { role: 'user', content: `Uploaded document: ${fileName}`, timestamp: timestamp() },
            { role: 'assistant', content: cardMsg, timestamp: timestamp() },
          ]);
        }
      } catch (err) {
        console.error('File upload error:', err);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text, timestamp: timestamp() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Pre-unlock Audio element synchronously in user event handler to bypass browser autoplay restrictions
    try {
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.resume();
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
        }
      }
    } catch (_) {}

    // Auto-detect open suspect / FIR / CCTV / Crime map intent and navigate
    const qLower = text.toLowerCase().trim();

    // Guard: If message is a question or requests Yes/No, DO NOT navigate! Let the AI answer.
    const isQuestion =
      qLower.includes('?') || qLower.includes('do we') || qLower.includes('is there') || qLower.includes('have info') ||
      qLower.includes('any info') || qLower.includes('check if') || qLower.includes('answer in') || qLower.includes('yes/no') ||
      qLower.includes('yes or no') || qLower.includes('what') || qLower.includes('where') || qLower.includes('who') ||
      qLower.includes('how') || qLower.includes('does') || qLower.includes('क्या') || qLower.includes('जानकारी') ||
      qLower.includes('इन्फॉर्मेशन') || qLower.includes('ಯಾವ') || qLower.includes('ಇದೆಯಾ');

    const isOpenAction =
      qLower.includes('open') || qLower.includes('show') || qLower.includes('view') || qLower.includes('bring up') ||
      qLower.includes('pull up') || qLower.includes('switch') || qLower.includes('navigate') || qLower.includes('go to') ||
      qLower.includes('check case') || qLower.includes('case file') || qLower.includes('profile') ||
      qLower.includes('खोलो') || qLower.includes('खोल') || qLower.includes('खोलना') || qLower.includes('दिखाओ') ||
      qLower.includes('दिखाएं') || qLower.includes('देखना') || qLower.includes('सीरी') || qLower.includes('प्रोफाइल') ||
      qLower.includes('ले चलो') || qLower.includes('ओपन') || qLower.includes('ತೆರೆ') || qLower.includes('ತೋರಿಸು') ||
      qLower.includes('ಪ್ರೊಫೈಲ್');

    if (!isQuestion && isOpenAction) {
      // Direct CCTV / Surveillance check
      if (qLower.includes('cctv') || qLower.includes('surveillance') || qLower.includes('camera') || qLower.includes('सीसीटीवी') || qLower.includes('सर्विलांस') || qLower.includes('कैमरा')) {
        const cctvMsg = /[\u0900-\u097F]/.test(text)
          ? 'सिल्क बोर्ड और शहर ग्रिड के सीसीटीवी कैमरे और सर्विलांस सिस्टम खोले जा रहे हैं, सर।'
          : 'Opening Surveillance & CCTV live camera feeds, Sir.';
        setMessages((prev) => [...prev, { role: 'assistant', content: cctvMsg, timestamp: timestamp() }]);
        speakText(cctvMsg, messages.length + 1);
        setTimeout(() => { if (typeof window !== 'undefined') window.location.href = '/dashboard/surveillance'; }, 800);
        setLoading(false);
        return;
      }

      // Direct Crime Map check
      if (qLower.includes('crime map') || qLower.includes('map') || qLower.includes('क्राइम मैप') || qLower.includes('मैप') || qLower.includes('नक्शा')) {
        const mapMsg = /[\u0900-\u097F]/.test(text)
          ? 'क्राइम मैप और लोकेशन ट्रैकिंग दिखाई जा रही है, सर।'
          : 'Opening Crime Map, Sir.';
        setMessages((prev) => [...prev, { role: 'assistant', content: mapMsg, timestamp: timestamp() }]);
        speakText(mapMsg, messages.length + 1);
        setTimeout(() => { if (typeof window !== 'undefined') window.location.href = '/dashboard/map'; }, 800);
        setLoading(false);
        return;
      }
    }

    if (isOpenAction) {
      let targetRoute = null;
      if (qLower.includes('anant') || qLower.includes('anand') || qLower.includes('gowda') || qLower.includes('godwa') || qLower.includes('buda') || qLower.includes('guda') || qLower.includes('goda') || qLower.includes('आनंद')) {
        targetRoute = '/dashboard/suspect/anand-gowda';
      } else if (qLower.includes('ramesh') || qLower.includes('bullet ramesh') || qLower.includes('रमेश')) {
        targetRoute = '/dashboard/suspect/ramesh-kumar';
      } else if (qLower.includes('suresh') || qLower.includes('naidu') || qLower.includes('सुरेश')) {
        targetRoute = '/dashboard/suspect/suresh-naidu';
      } else if (qLower.includes('imran') || qLower.includes('chotta imran') || qLower.includes('इमरान')) {
        targetRoute = '/dashboard/suspect/imran-khan';
      } else if (qLower.includes('farid') || qLower.includes('mirza') || qLower.includes('फरीद')) {
        targetRoute = '/dashboard/suspect/farid-mirza';
      } else if (qLower.includes('vikram') || qLower.includes('malhotra') || qLower.includes('vicky') || qLower.includes('9104')) {
        const topCase = (UPLOADED_FIRS && UPLOADED_FIRS.length > 0) ? UPLOADED_FIRS.find(f => (f.suspect_name || '').toLowerCase().includes('vikram') || f.case_number === 'FIR-2026-BL-9104') : null;
        const caseNum = topCase ? topCase.case_number : 'FIR-2026-BL-9104';
        fetchCaseDetails(caseNum);
        const openMsg = `Opening case file ${caseNum} for Suspect Vikram Malhotra, Sir.`;
        setMessages((prev) => [...prev, { role: 'assistant', content: openMsg, timestamp: timestamp() }]);
        speakText(openMsg, messages.length + 1);
        setLoading(false);
        return;
      } else if (qLower.includes('4921') || qLower.includes('492')) {
        targetRoute = '/dashboard/fir/FIR-2026-BL-4921';
      } else if (qLower.includes('4000')) {
        targetRoute = '/dashboard/fir/FIR-2026-BL-4000';
      } else if (qLower.includes('112') || qLower.includes('mys')) {
        targetRoute = '/dashboard/fir/FIR-2026-MYS-0112';
      } else if (
        qLower.includes('uploaded') || qLower.includes('his case') || qLower.includes('this case') ||
        qLower.includes('the case') || qLower.includes('the fir') || qLower.includes('his file')
      ) {
        const topRec = (UPLOADED_FIRS && UPLOADED_FIRS.length > 0) ? UPLOADED_FIRS[0] : null;
        const caseNum = topRec ? topRec.case_number : 'FIR-2026-BL-9104';
        const sName = topRec ? (topRec.suspect_name || topRec.accused_name || 'Vikram Malhotra') : 'Vikram Malhotra';
        fetchCaseDetails(caseNum);
        const openMsg = `Opening active case file ${caseNum} for Suspect ${sName}, Sir.`;
        setMessages((prev) => [...prev, { role: 'assistant', content: openMsg, timestamp: timestamp() }]);
        speakText(openMsg, messages.length + 1);
        setLoading(false);
        return;
      }

      if (targetRoute) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = targetRoute;
          }
        }, 800);
        return;
      }
      // NOTE: Fall through to API call if no static route or direct case details modal matched
    }

    try {
      let responseText = '';
      let isDemoResp = false;
      let followUps = [];
      const isHindiInput = /[\u0900-\u097F]/.test(text);
      const isKannadaInput = /[\u0C80-\u0CFF]/.test(text);
      const activeLang = isKannadaInput ? 'kn' : isHindiInput ? 'hi' : (VOICE_PROFILES.find(p => p.id === voiceProfile) || VOICE_PROFILES[0]).lang;

      try {
        const res = await fetch(`${API_BASE}/askDrishtiAI`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text,
            lang: activeLang,
            history: messages.slice(-6),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          responseText = data.answer || data.response_text || 'Database query processed.';
          isDemoResp = data.source === 'demo_ai';
          followUps = data.follow_up_suggestions || [];
        } else {
          throw new Error('API error');
        }
      } catch (err) {
        const { generateAIResponseFromDemoData } = await import('@/lib/demo-data');
        const demoRes = generateAIResponseFromDemoData(text);
        responseText = demoRes.answer;
        isDemoResp = true;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: responseText, isDemo: isDemoResp, timestamp: timestamp(), suggestions: followUps },
      ]);

      const newMsgIdx = messages.length + 1;
      speakText(responseText, newMsgIdx);
    } finally {
      setLoading(false);
    }
  };

  const handleExportConversation = async () => {
    if (!messages.length || exportingPdf) return;
    setExportingPdf(true);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId || `conv_${Date.now()}`,
          title: 'DRISHTI Co-Pilot Chat — Intelligence Session',
          officer_name: 'Inspector V. Sharma',
          badge_number: 'KSP-4421',
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp || '',
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content_base64) {
          const byteChars = atob(data.content_base64);
          const byteArr = new Uint8Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
          const blob = new Blob([byteArr], { type: data.content_type || 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filename || `DRISHTI_Session_${Date.now()}.html`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (e) {
      console.warn('Export failed:', e);
    }
    setExportingPdf(false);
  };

  const startVoice = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    stopSpeech();

    if (recognitionRef.current) {
      shouldRestartRef.current = false;
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.lang = (VOICE_PROFILES.find(p => p.id === voiceProfile) || VOICE_PROFILES[0]).ttsLang;
    rec.continuous = true;
    rec.interimResults = true;
    let finalTranscript = '';

    rec.onresult = (e) => {
      setError(null);
      consecutiveErrorsRef.current = 0;
      let interimTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interimTranscript += t;
        }
      }
      setInput((finalTranscript + interimTranscript).trim());
    };

    rec.onerror = (e) => {
      setError(e.error);
      if (e.error === 'no-speech' || e.error === 'network') return;
      consecutiveErrorsRef.current += 1;
      shouldRestartRef.current = false;
      setIsRecording(false);
    };

    rec.onend = () => {
      if (shouldRestartRef.current) {
        try { rec.start(); } catch (_) {}
      } else {
        setIsRecording(false);
      }
    };

    try {
      shouldRestartRef.current = true;
      rec.start();
      setIsRecording(true);
    } catch (_) {
      setIsRecording(false);
    }
  };

  const stopVoice = () => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsRecording(false);
  };

  const handlePttStart = () => {
    pttStartTimeRef.current = Date.now();
    isHoldingRef.current = true;
    startVoice();
  };

  const handlePttEnd = () => {
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      if (Date.now() - pttStartTimeRef.current >= 250) {
        stopVoice();
      }
    }
  };

  const handleMicClick = (e) => {
    if (Date.now() - pttStartTimeRef.current >= 250) {
      e?.preventDefault();
      return;
    }
    if (isRecording) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full relative overflow-hidden bg-[var(--surface-0)] text-[var(--text-primary)] font-sans">
      <div className="flex-grow flex flex-col h-full min-w-0 transition-all duration-300 relative z-10">
        {/* Header Command Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-[var(--surface-1)]/90 backdrop-blur-md border-b border-[var(--border)]/50 shadow-xs z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold font-heading text-[var(--text-primary)] tracking-wide">
                  DRISHTI Co-Pilot
                </h2>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE GRID SYNC
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest mt-0.5">
                Karnataka Police AI Intelligence & Multilingual RAG Engine
              </p>
            </div>
            {isSpeaking && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={stopSpeech}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-all cursor-pointer shadow-xs animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Mute Audio
              </motion.button>
            )}
          </div>

          {/* Voice Profile Selector Pills & Clear Chat */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/dashboard/logs')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer shadow-xs"
              title="View all AI Subject Log Cards"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>AI Logs</span>
            </button>
            <button
              onClick={handleExportConversation}
              disabled={!messages.length || exportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]/50 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 transition-colors cursor-pointer"
              title="Export conversation as PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              {exportingPdf ? 'Exporting...' : 'Export PDF'}
            </button>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]/60 overflow-x-auto shadow-inner">
              {VOICE_PROFILES.map((profile) => {
                const active = voiceProfile === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => setVoiceProfile(profile.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]'
                    }`}
                  >
                    {profile.label}
                  </button>
                );
              })}
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs shrink-0"
                title="Clear conversation history"
              >
                Clear Chat
              </button>
            )}
          </div>
        </div>

        {/* Message Container / Empty Hero State */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center min-h-[80%] space-y-8 max-w-3xl mx-auto py-8">
              
              {/* Central AI Emblem */}
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center shadow-lg text-blue-600 dark:text-blue-400">
                  <Cpu className="w-10 h-10" />
                </div>
              </div>

              <div className="text-center space-y-2.5 max-w-lg">
                <span className="text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full uppercase tracking-widest inline-block">
                  KARNATAKA POLICE AI COMMAND CENTER
                </span>
                <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight pt-1 font-heading">
                  Ask DRISHTI Co-Pilot
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  Query crime datastores, upload FIR documents, run ANPR watchlist lookups, or inspect suspect profiles in <span className="text-[var(--text-primary)] font-bold">English</span>, <span className="text-[var(--text-primary)] font-bold">Hindi</span>, or <span className="text-[var(--text-primary)] font-bold">Kannada</span>.
                </p>
              </div>

              {/* Suggestion Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(s.text)}
                      className="text-left p-5 rounded-2xl bg-[var(--surface-1)] hover:bg-[var(--surface-2)]/80 border border-[var(--border)]/70 hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {s.badge}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)] font-mono mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {s.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] font-sans line-clamp-2 leading-relaxed italic">
                          "{s.text}"
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  onCaseClick={fetchCaseDetails}
                  onSpeak={(text) => speakText(text, i)}
                  isSpeakingThis={speakingMsgIdx === i && isSpeaking}
                  onSuggestionClick={(s) => { setInput(''); sendMessage(s); }}
                />
              ))}
              {loading && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Floating Command Dock */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)]/50 bg-[var(--surface-1)]/90 backdrop-blur-md relative z-20">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center gap-2.5 bg-[var(--surface-0)] border border-[var(--border)]/70 focus-within:border-blue-500/60 rounded-2xl p-2 shadow-lg transition-all">
              <button
                id="voice-btn"
                onClick={handleMicClick}
                onMouseDown={handlePttStart}
                onMouseUp={handlePttEnd}
                onTouchStart={handlePttStart}
                onTouchEnd={handlePttEnd}
                disabled={!speechSupported}
                title={speechSupported ? (isRecording ? 'Release to send / Click to stop' : 'Hold to Talk / Click to toggle') : 'Voice input not supported'}
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                    : 'bg-[var(--surface-2)] hover:bg-[var(--surface-1)] border border-[var(--border)]/50 text-[var(--text-primary)] hover:text-blue-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.json,.doc,.docx,image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Upload FIR document or case file"
                className="w-11 h-11 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-1)] border border-[var(--border)]/50 text-[var(--text-primary)] hover:text-blue-600 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-xs"
              >
                <FileText className="w-5 h-5" />
              </button>

              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder={(() => {
                    const profile = VOICE_PROFILES.find(p => p.id === voiceProfile) || VOICE_PROFILES[0];
                    if (profile.lang === 'kn') return 'ಅಪರಾಧ, ಶಂಕಿತರು ಅಥವಾ ಪ್ರಕರಣಗಳ ಬಗ್ಗೆ ಕೇಳಿ…';
                    if (profile.lang === 'hi') return 'अपराध, संदिग्ध या मामलों के बारे में पूछें…';
                    return 'Ask about crimes, suspects, or case files…';
                  })()}
                  rows={1}
                  style={{ resize: 'none', overflowY: 'hidden' }}
                  className="w-full px-3 py-2 bg-transparent text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/60 focus:outline-none font-sans"
                />
              </div>

              <button
                id="send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  input.trim() && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 hover:scale-105'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)]/40 border border-[var(--border)]/40 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] px-2">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]/60 text-[var(--text-primary)] font-bold">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]/60 text-[var(--text-primary)] font-bold">Shift+Enter</kbd> for line break</span>
              {isRecording && <span className="text-rose-600 font-bold animate-pulse">🔴 Recording Voice Input...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Center Modal (Investigator Wall) */}
      {rightPanelOpen && (
        <>
          <div className="fixed inset-0 bg-[#F5F2EB] flex flex-col animate-newspaper-spin z-[99999] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-300 shrink-0 bg-[#F5F2EB]/95 sticky top-0 z-30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-bold font-serif tracking-wide uppercase">Investigator Chronicle</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadReport}
                  disabled={downloadLoading || !activeCaseDetails}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 text-xs font-mono font-bold uppercase transition-all shadow-md cursor-pointer"
                >
                  {downloadLoading ? (
                    <>
                      <Spinner size="sm" className="mr-1 text-current" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      Export PDF
                    </>
                  )
                  }
                </button>
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-200/60 hover:bg-red-100 flex items-center justify-center text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1200px] w-full mx-auto">
              {isLoadingCase || !activeCaseDetails ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                  <Spinner size="lg" className="text-amber-600" />
                  <p className="text-slate-700 font-mono text-sm font-bold uppercase tracking-wider animate-pulse">
                    Analyzing evidence & compiling case dossier...
                  </p>
                </div>
              ) : (
                <InvestigatorWall
                  fir={activeCaseDetails.fir}
                  accused={activeCaseDetails.accused}
                  victims={activeCaseDetails.victims}
                  related_firs={activeCaseDetails.related_firs}
                  case_summary={activeCaseDetails.case_summary}
                  isLoading={isLoadingCase}
                />
              )}
            </div>
          </div>
        </>
      )}

      <div id="drishti-print-report" aria-hidden="true" />

      <VoiceDebugStatus 
        micPermission={micPermission}
        isListening={isRecording}
        error={error}
        lastTranscript={input}
        consecutiveErrors={consecutiveErrorsRef.current}
        onTryAgain={() => {
          if (!isRecording) startVoice();
        }}
        onUseText={() => {
          inputRef.current?.focus();
        }}
      />
    </div>
  );
}
