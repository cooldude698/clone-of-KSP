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
    // Check if this message is an automated FIR entry notification
    if (text.includes('AUTOMATED FIR ENTRY STORED IN DATASTORE') || text.includes('FIR Document parsed and stored')) {
      const caseMatch = text.match(/FIR-[0-9]{4}-[A-Z0-9-]+/i);
      const caseNum = caseMatch ? caseMatch[0].toUpperCase() : 'FIR-RECORD';
      
      const crimeTypeMatch = text.match(/- Crime Type:\s*([^\n]+)/i);
      const districtMatch = text.match(/- District:\s*([^\n]+)/i);
      const stationMatch = text.match(/- Police Station:\s*([^\n]+)/i);
      const statusMatch = text.match(/- Status:\s*([^\n]+)/i);

      return (
        <div className="my-2 rounded-2xl bg-[#FAF6F0] border border-[#7A90A8]/40 overflow-hidden shadow-xl shadow-slate-300/40">
          {/* Card Top Banner - Deep Ocean Navy */}
          <div className="bg-[#1E2733] px-4 py-3 border-b border-[#7A90A8]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#AECAE8]/20 border border-[#AECAE8]/40 text-[#AECAE8] flex items-center justify-center shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
                  Automated FIR Entry Registered
                </h4>
                <p className="text-[10px] font-mono text-[#AECAE8]">
                  Karnataka State Police CCTNS Datastore
                </p>
              </div>
            </div>
            {caseMatch && (
              <button
                onClick={() => onCaseClick && onCaseClick(caseNum)}
                className="px-3 py-1 rounded-lg bg-[#AECAE8]/20 border border-[#AECAE8]/40 text-[#AECAE8] font-mono font-extrabold text-xs shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#AECAE8]" />
                {caseNum}
              </button>
            )}
          </div>

          {/* Data Grid Badges - Coastal Sand & Navy */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#EFEAE4] border border-[#7A90A8]/30">
                <span className="text-[10px] font-mono uppercase text-[#48596D] block">Crime Type</span>
                <span className="text-xs font-bold font-mono text-[#1E2733] uppercase tracking-wide">
                  {crimeTypeMatch ? crimeTypeMatch[1].trim().replace('_', ' ') : 'General Offence'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EFEAE4] border border-[#7A90A8]/30">
                <span className="text-[10px] font-mono uppercase text-[#48596D] block">Police Station</span>
                <span className="text-xs font-bold font-mono text-[#1E2733] truncate block">
                  {stationMatch ? stationMatch[1].trim() : 'Central Command'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EFEAE4] border border-[#7A90A8]/30">
                <span className="text-[10px] font-mono uppercase text-[#48596D] block">District</span>
                <span className="text-xs font-bold font-mono text-[#1E2733]">
                  {districtMatch ? districtMatch[1].trim() : 'Bengaluru Urban'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EFEAE4] border border-[#7A90A8]/30">
                <span className="text-[10px] font-mono uppercase text-[#48596D] block">Status</span>
                <span className="text-xs font-extrabold font-mono text-[#A68A69] inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A68A69] animate-pulse" />
                  {statusMatch ? statusMatch[1].trim().toUpperCase() : 'UNDER INVESTIGATION'}
                </span>
              </div>
            </div>

            {/* Document Content Box */}
            <div className="mt-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#1E2733] tracking-wider block mb-1">
                Parsed Document Preview & Metadata:
              </span>
              <div className="bg-[#EFEAE4] border border-[#7A90A8]/30 rounded-xl p-3 text-xs text-[#1E2733] font-mono max-h-48 overflow-y-auto leading-relaxed shadow-inner">
                {text.replace(/AUTOMATED FIR ENTRY STORED IN DATASTORE[\s\S]*?Document Summary:\s*/i, '').replace(/✅[\s\S]*/i, '')}
              </div>
            </div>

            {/* Bottom Verification Tag */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#7A90A8]/20 text-[11px] font-mono text-emerald-700">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
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
          <div key={i} className="font-mono text-xs text-[#1E2733] border-b border-[#7A90A8]/30 py-1.5 grid grid-cols-4 gap-2">
            {line.split('|').filter(Boolean).map((cell, j) => {
              const cellText = cell.trim();
              const caseRegex = /(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/;
              if (caseRegex.test(cellText)) {
                return (
                  <button
                    key={j}
                    onClick={() => onCaseClick && onCaseClick(cellText)}
                    className="text-left text-[#1E2733] hover:underline font-bold transition-colors focus:outline-none cursor-pointer"
                  >
                    {cellText}
                  </button>
                );
              }
              return <span key={j} className={j === 0 ? 'text-[#1E2733] font-semibold' : ''}>{cellText}</span>;
            })}
          </div>
        );
      }

      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={`${line === '' ? 'mt-2' : ''} leading-relaxed font-sans text-sm text-[#1E2733]`}>
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
                    className="text-[#1E2733] hover:bg-[#1E2733]/20 font-mono font-bold border border-[#1E2733]/40 rounded-lg px-2 py-0.5 bg-[#1E2733]/10 transition-all mx-1 inline-flex items-center gap-1 focus:outline-none cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3 h-3 text-[#1E2733]" />
                    {subPart}
                  </button>
                );
              }
              return subPart;
            });

            return isBold ? (
              <strong key={j} className="text-[#1E2733] font-extrabold">{renderedSubParts}</strong>
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
          ? 'bg-[#1E2733] text-white border-[#1E2733]/40 shadow-slate-400/30' 
          : 'bg-[#FAF6F0] text-[#1E2733] border-[#7A90A8]/40 shadow-slate-300/40'}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-[#1E2733]" />
        }
      </div>

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#48596D] px-1">
          <span>{isUser ? 'INSPECTOR (YOU)' : 'DRISHTI INTELLIGENCE'}</span>
          <span>•</span>
          <span>{msg.timestamp || 'Just now'}</span>
        </div>

        <div className={`rounded-2xl px-5 py-4 text-sm relative shadow-lg border backdrop-blur-md
          ${isUser
            ? 'bg-[#1E2733] text-white border-[#1E2733]/40 rounded-tr-xs shadow-slate-400/30'
            : 'bg-[#FAF6F0] text-[#1E2733] border-[#7A90A8]/30 rounded-tl-xs shadow-slate-300/40'
          }`}>
          {isUser
            ? <p className="font-sans leading-relaxed text-white">{msg.content}</p>
            : <div className="space-y-2">{renderContentWithCaseLinks(msg.content)}</div>
          }
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 px-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-[10px] font-mono text-[#48596D] hover:text-[#1E2733] flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <span className="text-[#7A90A8]">•</span>
            <button
              onClick={() => onSpeak && onSpeak(msg.content)}
              className={`text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors ${
                isSpeakingThis ? 'text-rose-600 font-bold animate-pulse' : 'text-[#48596D] hover:text-[#1E2733]'
              }`}
            >
              <Volume2 className="w-3 h-3" />
              {isSpeakingThis ? 'Speaking...' : 'Listen'}
            </button>
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
            history: messages.slice(-6),
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
    <div className="flex h-full relative overflow-hidden bg-[var(--surface-0)] text-[var(--text-primary)] font-sans">
      <div className="flex-grow flex flex-col h-full min-w-0 transition-all duration-300 relative z-10">
        {/* Header Command Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-3.5 bg-[var(--surface-1)]/90 backdrop-blur-md border-b border-[var(--border)]/30 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E2733] text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-[#AECAE8] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold font-mono text-[#1E2733] tracking-wide">
                  DRISHTI Co-Pilot
                </h2>
                <span className="inline-flex items-center gap-1 bg-[#16A34A]/10 text-emerald-700 border border-emerald-600/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  LIVE GRID SYNC
                </span>
              </div>
              <p className="text-[10px] text-[#48596D] font-mono uppercase tracking-widest">
                Karnataka Police AI Intelligence & Multilingual RAG Engine
              </p>
            </div>
            {isSpeaking && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={stopSpeech}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 text-xs font-mono font-bold uppercase tracking-wider hover:bg-rose-200 transition-all cursor-pointer shadow-sm animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Mute Audio
              </motion.button>
            )}
          </div>

          {/* Voice Profile Selector Pills & Clear Chat */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#EFEAE4] border border-[#7A90A8]/30 overflow-x-auto shadow-inner">
              {VOICE_PROFILES.map((profile) => {
                const active = voiceProfile === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => setVoiceProfile(profile.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#1E2733] text-white shadow-md'
                        : 'text-[#1E2733] hover:text-[#1E2733] hover:bg-[#E2D8CC]'
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
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-sm shrink-0"
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
                <div className="absolute inset-0 rounded-3xl bg-[#7A90A8] blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-[#FAF6F0] border border-[#7A90A8]/40 flex items-center justify-center shadow-xl">
                  <Cpu className="w-10 h-10 text-[#1E2733]" />
                </div>
              </div>

              <div className="text-center space-y-2 max-w-lg">
                <span className="text-[10px] font-mono font-extrabold text-[#A68A69] bg-[#A68A69]/10 border border-[#A68A69]/30 px-3 py-1 rounded-full uppercase tracking-widest">
                  KARNATAKA POLICE AI COMMAND CENTER
                </span>
                <h3 className="text-3xl font-black text-[#1E2733] tracking-tight pt-1">
                  Ask DRISHTI Co-Pilot
                </h3>
                <p className="text-xs sm:text-sm text-[#48596D] font-mono leading-relaxed">
                  Query crime datastores, upload FIR documents, run ANPR watchlist lookups, or inspect suspect profiles in <span className="text-[#1E2733] font-bold">English</span>, <span className="text-[#1E2733] font-bold">Hindi</span>, or <span className="text-[#1E2733] font-bold">Kannada</span>.
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
                      className="text-left p-4.5 rounded-2xl bg-[#FAF6F0] hover:bg-[#FAF6F0]/90 border border-[#7A90A8]/40 hover:border-[#1E2733]/50 transition-all shadow-md hover:shadow-lg group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1E2733]/10 border border-[#1E2733]/20 text-[#1E2733] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-5 h-5 text-[#1E2733]" />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[#A68A69] bg-[#EFEAE4] border border-[#A68A69]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {s.badge}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E2733] font-mono mb-1 group-hover:text-[#1E2733] transition-colors">
                          {s.title}
                        </p>
                        <p className="text-xs text-[#48596D] font-sans line-clamp-2 leading-relaxed">
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

        {/* Input Floating Command Dock */}
        <div className="p-4 sm:p-5 border-t border-[#7A90A8]/30 bg-[#EFEAE4]/90 backdrop-blur-md relative z-20">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center gap-2.5 bg-[#FAF6F0] border border-[#7A90A8]/40 rounded-2xl p-2 shadow-xl shadow-slate-400/20 focus-within:border-[#1E2733] transition-all">
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
                    : 'bg-[#E2D8CC] hover:bg-[#D5C7B5] border border-[#7A90A8]/30 text-[#1E2733]'
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
                className="w-11 h-11 rounded-xl bg-[#E2D8CC] hover:bg-[#D5C7B5] border border-[#7A90A8]/30 text-[#1E2733] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-sm"
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
                  className="w-full px-3 py-2 bg-transparent text-[#1E2733] text-sm placeholder-[#48596D]/60 focus:outline-none font-sans"
                />
              </div>

              <button
                id="send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  input.trim() && !loading
                    ? 'bg-[#1E2733] hover:bg-[#2B3848] text-white shadow-lg shadow-[#1E2733]/30 hover:scale-105'
                    : 'bg-[#E2D8CC] text-[#48596D]/40 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#48596D] px-2">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#FAF6F0] border border-[#7A90A8]/40 text-[#1E2733] font-bold">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-[#FAF6F0] border border-[#7A90A8]/40 text-[#1E2733] font-bold">Shift+Enter</kbd> for line break</span>
              {isRecording && <span className="text-rose-600 font-bold animate-pulse">🔴 Recording Voice Input...</span>}
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
