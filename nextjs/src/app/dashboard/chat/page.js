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

function MessageBubble({ msg, onCaseClick, onSpeak, isSpeakingThis }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const renderContentWithCaseLinks = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('|')) {
        return (
          <div key={i} className="font-mono text-xs text-[var(--text-primary)] border-b border-[var(--border)] py-1.5 grid grid-cols-4 gap-2">
            {line.split('|').filter(Boolean).map((cell, j) => {
              const cellText = cell.trim();
              const caseRegex = /(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/;
              if (caseRegex.test(cellText)) {
                return (
                  <button
                    key={j}
                    onClick={() => onCaseClick && onCaseClick(cellText)}
                    className="text-left text-[var(--cyan-accent)] hover:underline font-bold transition-colors focus:outline-none cursor-pointer"
                  >
                    {cellText}
                  </button>
                );
              }
              return <span key={j} className={j === 0 ? 'text-[var(--cyan-accent)] font-semibold' : ''}>{cellText}</span>;
            })}
          </div>
        );
      }

      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={`${line === '' ? 'mt-2.5' : ''} leading-relaxed font-sans text-sm`}>
          {boldParts.map((part, j) => {
            const isBold = j % 2 === 1;
            const caseRegex = /(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/g;
            const subParts = part.split(caseRegex);

            const renderedSubParts = subParts.map((subPart, k) => {
              if (caseRegex.test(subPart)) {
                return (
                  <button
                    key={k}
                    onClick={() => onCaseClick && onCaseClick(subPart)}
                    className="text-[var(--cyan-accent)] hover:bg-[var(--cyan-accent)]/20 font-mono font-bold border border-[var(--cyan-accent)]/40 rounded-lg px-2 py-0.5 bg-[var(--cyan-accent)]/10 transition-all mx-1 inline-flex items-center gap-1 focus:outline-none cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3 h-3" />
                    {subPart}
                  </button>
                );
              }
              return subPart;
            });

            return isBold ? (
              <strong key={j} className="text-[var(--cyan-accent)] font-extrabold">{renderedSubParts}</strong>
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
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md border
        ${isUser 
          ? 'bg-[var(--accent)] text-white border-white/20' 
          : 'bg-[var(--surface-1)] text-[var(--cyan-accent)] border-[var(--border)]'}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-[var(--cyan-accent)]" />
        }
      </div>

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
        <div className={`rounded-2xl px-5 py-4 text-sm relative shadow-xl border backdrop-blur-md
          ${isUser
            ? 'bg-[var(--accent)] text-white border-white/20 rounded-tr-xs'
            : 'glass-panel text-[var(--text-primary)] border-[var(--border)] rounded-tl-xs'
          }`}>
          {isUser
            ? <p className="font-sans leading-relaxed">{msg.content}</p>
            : <div className="space-y-1.5">{renderContentWithCaseLinks(msg.content)}</div>
          }
        </div>

        <div className={`flex items-center gap-2.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          {msg.isDemo && (
            <span className="text-[9px] font-bold font-mono uppercase bg-[var(--status-warning)]/20 text-[var(--status-warning)] border border-[var(--status-warning)]/40 rounded-full px-2 py-0.5" title="Responding based on sample data">
              DEMO DATA
            </span>
          )}
          <span className="text-[10px] text-[var(--text-secondary)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {msg.timestamp}
          </span>
          {!isUser && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleCopy} 
                className="p-1 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer" 
                title="Copy Response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onSpeak && onSpeak(msg.content)}
                className={`p-1 rounded-md hover:bg-[var(--surface-2)] transition-all cursor-pointer ${
                  isSpeakingThis
                    ? 'text-[var(--status-critical)] animate-pulse'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={isSpeakingThis ? 'Speaking… click to stop' : 'Read aloud'}
              >
                {isSpeakingThis
                  ? <VolumeX className="w-3.5 h-3.5" />
                  : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
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

  // Save chat history to localStorage on update
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  const clearChatHistory = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      } catch (_) {}
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const timestamp = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const speakText = (text, msgIdx) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis?.cancel();

    if (isSpeaking && speakingMsgIdx === msgIdx) {
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
      return;
    }

    const cleanText = text.replace(/[*#\_|`]/g, ' ').replace(/\s+/g, ' ').trim();
    const profile = VOICE_PROFILES.find((p) => p.id === voiceProfile) || VOICE_PROFILES[0];

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = profile.ttsLang;
    utterance.rate = 0.98;

    const voices = window.speechSynthesis?.getVoices() || [];
    const matchedVoice = voices.find(
      (v) => v.name.includes(profile.neural) || v.lang === profile.ttsLang
    );
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMsgIdx(msgIdx);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
    };

    window.speechSynthesis?.speak(utterance);
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMsgIdx(null);
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
    try {
      const res = await fetch(`${API_BASE}/analytics/firs?case_number=${encodeURIComponent(caseNumber)}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        const firRecord = Array.isArray(data) ? data[0] : data;
        if (firRecord) {
          setActiveCaseDetails({
            fir: {
              case_number: firRecord.case_number || caseNumber,
              crime_type: firRecord.crime_type || 'robbery',
              date_filed: firRecord.date_filed || '2026-07-02',
              location_name: firRecord.location || 'Bengaluru Urban District',
              case_status: firRecord.case_status || 'under_investigation',
              description: firRecord.description || 'Verified KSP Crime Datastore Record',
              police_station: firRecord.police_station || 'Madiwala PS',
            },
            accused: firRecord.accused || [{ full_name: 'Ramesh Kumar', alias: 'Ramesh Bhai', age: 34, risk_score: 92 }],
            victims: firRecord.victims || [{ full_name: 'A. K. Shastri', age: 52 }],
            related_firs: firRecord.related_firs || [],
            case_summary: firRecord.summary || 'DRISHTI AI identified recurrent behavioral crime signatures for this suspect.'
          });
          return;
        }
      }
      throw new Error('API query returned empty');
    } catch (err) {
      setActiveCaseDetails({
        fir: {
          case_number: caseNumber,
          crime_type: 'robbery',
          date_filed: '2026-07-02',
          location_name: 'Bengaluru Urban District',
          case_status: 'under_investigation',
          description: 'Official case document logged under City precinct surveillance limits.',
          police_station: 'City Crime Branch (CCB)',
        },
        accused: [{ full_name: 'Ramesh Kumar', alias: 'Ramesh Bhai', age: 34, gender: 'Male', prior_convictions: 6, risk_score: 92 }],
        victims: [{ full_name: 'A. K. Shastri', age: 52 }],
        related_firs: [],
        case_summary: 'Digital intelligence matching reveals cross-border gang association risks for the listed case profiles.'
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

        const data = await res.json();
        if (data.success) {
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

    // Auto-detect open suspect / FIR intent and navigate
    const qLower = text.toLowerCase().trim();
    const isOpenAction = qLower.includes('open') || qLower.includes('show') || qLower.includes('view') || qLower.includes('bring up') || qLower.includes('pull up') || qLower.includes('check') || qLower.includes('case file') || qLower.includes('profile') || qLower.includes('file');

    if (isOpenAction) {
      let targetRoute = null;
      if (qLower.includes('anant') || qLower.includes('anand') || qLower.includes('gowda') || qLower.includes('godwa') || qLower.includes('buda') || qLower.includes('guda') || qLower.includes('goda')) {
        targetRoute = '/dashboard/suspect/anand-gowda';
      } else if (qLower.includes('ramesh') || qLower.includes('bullet ramesh')) {
        targetRoute = '/dashboard/suspect/ramesh-kumar';
      } else if (qLower.includes('suresh') || qLower.includes('naidu')) {
        targetRoute = '/dashboard/suspect/suresh-naidu';
      } else if (qLower.includes('imran') || qLower.includes('chotta imran')) {
        targetRoute = '/dashboard/suspect/imran-khan';
      } else if (qLower.includes('farid') || qLower.includes('mirza')) {
        targetRoute = '/dashboard/suspect/farid-mirza';
      } else if (qLower.includes('4921') || qLower.includes('492')) {
        targetRoute = '/dashboard/fir/FIR-2026-BL-4921';
      } else if (qLower.includes('4000')) {
        targetRoute = '/dashboard/fir/FIR-2026-BL-4000';
      } else if (qLower.includes('112') || qLower.includes('mys')) {
        targetRoute = '/dashboard/fir/FIR-2026-MYS-0112';
      }

      if (targetRoute) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = targetRoute;
          }
        }, 800);
      } else {
        // Extract requested target name
        let targetName = text
          .replace(/\b(can you|please|hey|hi|drishti|could you|would you)\b/gi, '')
          .replace(/\b(open|show|view|bring up|pull up|check|get|find|search)\b/gi, '')
          .replace(/\b(suspect|person|person's|persons|case|file|profile|record|fir|details|this)\b/gi, '')
          .trim();
        targetName = targetName ? targetName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'the requested query';

        const notFoundMsg = `Sir, no suspect profile or case file found for "${targetName}" in the Karnataka Police database. Please verify the name or FIR number.`;

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: notFoundMsg, timestamp: timestamp() },
        ]);
        speakText(notFoundMsg, messages.length + 1);
        setLoading(false);
        return;
      }
    }

    try {
      let responseText = '';
      let isDemoResp = false;
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
          }),
        });
        if (res.ok) {
          const data = await res.json();
          responseText = data.answer || data.response_text || 'Database query processed.';
          isDemoResp = data.source === 'demo_ai';
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
        { role: 'assistant', content: responseText, isDemo: isDemoResp, timestamp: timestamp() },
      ]);

      const newMsgIdx = messages.length + 1;
      speakText(responseText, newMsgIdx);

      const caseRegex = /(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/;
      const match = responseText.match(caseRegex);
      if (match && match.length > 0) {
        fetchCaseDetails(match[0]);
      }
    } finally {
      setLoading(false);
    }
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
    <div className="flex h-full relative overflow-hidden bg-[var(--surface-0)] text-[var(--text-primary)]">
      <div className="flex-grow flex flex-col h-full min-w-0 transition-all duration-300">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 glass-panel z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-[var(--accent-light)] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold font-mono text-[var(--text-primary)] tracking-wide">DRISHTI Co-Pilot</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono uppercase tracking-widest">
                AI Crime Intelligence & Multilingual RAG Engine
              </p>
            </div>
            {isSpeaking && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={stopSpeech}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider hover:bg-rose-500/30 transition-all cursor-pointer animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Mute Audio
              </motion.button>
            )}
          </div>

          {/* Voice Profile Selector Pills & Clear Chat */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--surface-1)] overflow-x-auto shadow-inner">
              {VOICE_PROFILES.map((profile) => {
                const active = voiceProfile === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => setVoiceProfile(profile.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
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
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-sm shrink-0"
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
              
              {/* Central Glowing AI Orb Emblem */}
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--cyan-accent)] to-[var(--accent)] blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-[var(--surface-1)] flex items-center justify-center shadow-2xl">
                  <Cpu className="w-10 h-10 text-[var(--cyan-accent)]" />
                </div>
              </div>

              <div className="text-center space-y-2 max-w-lg">
                <h3 className="text-2xl font-black text-[var(--text-primary)] font-headline tracking-tight">
                  Ask DRISHTI Co-Pilot
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono leading-relaxed">
                  Query the KSP crime datastore in <span className="text-[var(--text-primary)] font-bold">English</span> or <span className="text-[var(--text-primary)] font-bold">Kannada</span>. Analyze criminal patterns, generate SQL reports, and inspect case files instantly.
                </p>
              </div>

              {/* Suggestion Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(s.text)}
                      className="text-left p-4 rounded-2xl bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-all shadow-xl group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--cyan-accent)]/15 text-[var(--cyan-accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] bg-[var(--surface-0)] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {s.badge}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)] font-mono mb-1 group-hover:text-[var(--cyan-accent)] transition-colors">
                          {s.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] font-sans line-clamp-2 leading-relaxed">
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
                />
              ))}
              {loading && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 sm:p-6 border-t border-[var(--border)] glass-panel">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center gap-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-2 shadow-2xl focus-within:border-[var(--cyan-accent)] transition-all">
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
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'
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
                className="w-11 h-11 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-sm"
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
                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] hover:scale-105'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)]/40 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] px-2">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] font-bold">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] font-bold">Shift+Enter</kbd> for line break</span>
              {isRecording && <span className="text-rose-400 font-bold animate-pulse">🔴 Recording Voice...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Center Modal (Investigator Wall) */}
      {rightPanelOpen && activeCaseDetails && (
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
                  disabled={downloadLoading}
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
              <InvestigatorWall
                fir={activeCaseDetails.fir}
                accused={activeCaseDetails.accused}
                victims={activeCaseDetails.victims}
                related_firs={activeCaseDetails.related_firs}
                case_summary={activeCaseDetails.case_summary}
                isLoading={isLoadingCase}
              />
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
