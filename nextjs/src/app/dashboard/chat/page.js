'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Sparkles, Copy, Check, X, ShieldAlert, FileText } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import InvestigatorWall from '@/components/InvestigatorWall';
import VoiceDebugStatus from '@/components/VoiceDebugStatus';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const SUGGESTIONS = [
  'Show all vehicle thefts in Bengaluru this month',
  'ಕಳೆದ ತಿಂಗಳ ದರೋಡೆ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ',
  'List top repeat offenders with risk score > 70',
  'Show details for case FIR-2026-BL-4921',
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
      // Table row
      if (line.startsWith('|')) {
        return (
          <div key={i} className="font-mono text-xs text-paper-100/80 border-b border-steel-600/40 py-1 grid grid-cols-4 gap-2">
            {line.split('|').filter(Boolean).map((cell, j) => {
              const cellText = cell.trim();
              const caseRegex = /(KAR\/[A-Z]+\/\d+\/\d+|FIR-\d{4}-[A-Z]+-\d+)/;
              if (caseRegex.test(cellText)) {
                return (
                  <button
                    key={j}
                    onClick={() => onCaseClick && onCaseClick(cellText)}
                    className="text-left text-phosphor-500 hover:text-phosphor-500/80 font-bold hover:underline transition-colors focus:outline-none"
                  >
                    {cellText}
                  </button>
                );
              }
              return <span key={j} className={j === 0 ? 'text-phosphor-500 font-semibold' : ''}>{cellText}</span>;
            })}
          </div>
        );
      }

      // Bold parts parsing
      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={`${line === '' ? 'mt-2' : ''} leading-relaxed`}>
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
                    className="text-phosphor-500 hover:text-phosphor-500/80 font-mono font-bold border border-phosphor-500/30 rounded px-1.5 py-0.5 bg-phosphor-500/10 hover:bg-phosphor-500/20 transition-all mx-0.5 focus:outline-none"
                  >
                    {subPart}
                  </button>
                );
              }
              return subPart;
            });

            return isBold ? (
              <strong key={j} className="text-phosphor-500 font-semibold">{renderedSubParts}</strong>
            ) : (
              <span key={j}>{renderedSubParts}</span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
        ${isUser ? 'bg-phosphor-500/30 border border-phosphor-500/40' : 'bg-steel-600/50 border border-steel-600/60'}`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-phosphor-500" />
          : <Bot className="w-3.5 h-3.5 text-paper-100/70" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm relative
          ${isUser
            ? 'bg-phosphor-500 text-paper-100 rounded-tr-sm'
            : 'bg-steel-700 text-paper-100/90 border border-steel-600/40 rounded-tl-sm'
          }`}>
          {isUser
            ? <p>{msg.content}</p>
            : <div className="space-y-1">{renderContentWithCaseLinks(msg.content)}</div>
          }
        </div>
        {/* Timestamp + actions */}
        <div className={`flex items-center gap-2 transition-opacity ${isUser ? 'flex-row-reverse' : ''}`}>
          {msg.isDemo && (
            <span className="text-[9px] font-bold font-mono uppercase bg-warn-500/20 text-warn-500 border border-warn-500/30 rounded px-1 py-0.5" title="Responding based on sample data">
              Demo Data
            </span>
          )}
          <span className="text-[10px] text-paper-100/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{msg.timestamp}</span>
          {!isUser && (
            <>
              <button onClick={handleCopy} className="text-paper-100/40 hover:text-paper-100/80 transition-colors" title="Copy">
                {copied ? <Check className="w-3 h-3 text-success-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={() => onSpeak && onSpeak(msg.content)}
                className={`transition-colors ${
                  isSpeakingThis
                    ? 'text-phosphor-500 animate-pulse'
                    : 'text-paper-100/40 hover:text-paper-100/80'
                }`}
                title={isSpeakingThis ? 'Speaking… click to stop' : 'Read aloud'}
              >
                {isSpeakingThis
                  ? <VolumeX className="w-3 h-3" />
                  : <Volume2 className="w-3 h-3" />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-lg bg-steel-600/50 border border-steel-600/60 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-paper-100/70" />
      </div>
      <div className="bg-steel-700 border border-steel-600/40 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-phosphor-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('en');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micPermission, setMicPermission] = useState('prompt');
  const [error, setError] = useState(null);
  const consecutiveErrorsRef = useRef(0);
  const [conversationId, setConversationId] = useState('');
  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const pttStartTimeRef = useRef(0);
  const isHoldingRef = useRef(false);
  const shouldRestartRef = useRef(false); // tracks user intent: true = keep mic on

  // Investigator Wall states
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeCaseDetails, setActiveCaseDetails] = useState(null);
  const [isLoadingCase, setIsLoadingCase] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    // Generate a unique session ID for the conversation
    setConversationId('conv_' + Math.random().toString(36).substr(2, 9));
  }, []);

  const downloadReport = () => {
    if (downloadLoading) return;
    setDownloadLoading(true);

    try {
      const username = localStorage.getItem('userName') || 'KSP Officer';
      const userRole  = localStorage.getItem('drishti_role') || 'Inspector';
      const empId     = localStorage.getItem('drishti_employee_id') || 'KSP-0000';
      const caseRef   = selectedFIR || 'General Intelligence';
      const now       = new Date();
      const dateStr   = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      const timeStr   = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Build conversation transcript HTML
      const transcriptHTML = messages.map((m) => {
        const sender = m.role === 'user' ? `<strong>${username}</strong>` : '<strong>DRISHTI AI</strong>';
        const cleanContent = m.content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br/>');
        return `
          <div class="print-section" style="margin-bottom:10pt;padding:7pt 10pt;border-left:3pt solid ${
            m.role === 'user' ? '#2E6B4C' : '#c7ccc7'
          };background:${ m.role === 'user' ? '#f0f4f2' : '#fafafa' };border-radius:3pt">
            <div style="font-size:8pt;color:#888;margin-bottom:3pt">${sender} &nbsp;&bull;&nbsp; ${m.timestamp}</div>
            <div style="font-size:10pt;line-height:1.55">${cleanContent}</div>
          </div>`;
      }).join('');

      // Build accused table rows (if case is open)
      const accusedRows = activeCaseDetails?.accused?.map((a) => `
        <tr>
          <td class="print-mono">${a.full_name}</td>
          <td>${a.alias || '—'}</td>
          <td>${a.age || '—'}</td>
          <td>${a.prior_convictions ?? '—'}</td>
          <td><strong style="color:#B91C1C">${a.risk_score ?? '—'}/100</strong></td>
        </tr>`).join('') || '<tr><td colspan="5" style="color:#aaa">No accused data</td></tr>';

      // Build FIR info block
      const fir = activeCaseDetails?.fir;
      const firBlock = fir ? `
        <div class="print-section" style="margin-bottom:14pt">
          <h2 class="print-h2">Case File Summary</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8pt">
            <div><span class="print-label">Case Number</span><br/><span class="print-mono" style="font-weight:700">${fir.case_number}</span></div>
            <div><span class="print-label">Crime Type</span><br/><span class="print-value">${(fir.crime_type||'').replace(/_/g,' ').toUpperCase()}</span></div>
            <div><span class="print-label">Date Filed</span><br/><span class="print-value">${fir.date_filed || '—'}</span></div>
            <div><span class="print-label">Police Station</span><br/><span class="print-value">${fir.police_station || '—'}</span></div>
            <div><span class="print-label">Location</span><br/><span class="print-value">${fir.location_name || '—'}</span></div>
            <div><span class="print-label">Status</span><br/><span class="print-badge">${(fir.case_status||'unknown').replace(/_/g,' ')}</span></div>
          </div>
          ${fir.description ? `<div style="margin-top:8pt"><span class="print-label">Description</span><br/><span style="font-size:9.5pt">${fir.description}</span></div>` : ''}
        </div>
        <div class="print-section" style="margin-bottom:14pt">
          <h2 class="print-h2">Accused Profiles</h2>
          <table class="print-table">
            <thead><tr><th>Full Name</th><th>Alias</th><th>Age</th><th>Prior FIRs</th><th>Risk Score</th></tr></thead>
            <tbody>${accusedRows}</tbody>
          </table>
        </div>` : '';

      // Inject into the hidden print container
      const container = document.getElementById('drishti-print-report');
      if (!container) return;

      container.innerHTML = `
        <!-- KSP Letterhead -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16pt;padding-bottom:10pt;border-bottom:2pt solid #2E6B4C">
          <div>
            <div class="print-h1" style="font-size:20pt;letter-spacing:-0.02em">DRISHTI — ದೃಷ್ಟಿ</div>
            <div style="font-size:9pt;color:#2E6B4C;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Karnataka State Police &mdash; Crime Intelligence Platform</div>
          </div>
          <div style="text-align:right">
            <div class="print-stamp">CONFIDENTIAL</div>
          </div>
        </div>

        <!-- Meta block -->
        <div class="print-section" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8pt;margin-bottom:14pt;padding:8pt;background:#f9fafb;border:0.5pt solid #e1e4e1;border-radius:4pt">
          <div><span class="print-label">Investigator</span><br/><span class="print-value" style="font-weight:700">${username}</span></div>
          <div><span class="print-label">Role / Badge</span><br/><span class="print-value">${userRole} &nbsp;&bull;&nbsp; <span class="print-mono">${empId}</span></span></div>
          <div><span class="print-label">Generated</span><br/><span class="print-mono">${dateStr}, ${timeStr}</span></div>
          <div><span class="print-label">Case Reference</span><br/><span class="print-mono" style="font-weight:700">${caseRef}</span></div>
          <div><span class="print-label">Session ID</span><br/><span class="print-mono">${conversationId}</span></div>
          <div><span class="print-label">Language</span><br/><span class="print-value">${language === 'en' ? 'English (en-IN)' : 'Kannada (ಕನ್ನಡ)'}</span></div>
        </div>

        ${firBlock}

        <!-- AI Intelligence Summary -->
        ${activeCaseDetails?.case_summary ? `
        <div class="print-section" style="margin-bottom:14pt;padding:8pt;background:#f0f4f2;border-left:3pt solid #2E6B4C;border-radius:3pt">
          <h3 class="print-h3">AI Intelligence Summary</h3>
          <p style="font-size:10pt;line-height:1.6;color:#222">${activeCaseDetails.case_summary}</p>
        </div>` : ''}

        <!-- Conversation Transcript -->
        <div class="print-section">
          <h2 class="print-h2">Co-Pilot Conversation Transcript</h2>
          ${messages.length === 0
            ? '<p style="color:#aaa;font-size:9pt">No conversation recorded in this session.</p>'
            : transcriptHTML
          }
        </div>

        <!-- Footer -->
        <div class="print-footer-line">
          DRISHTI Intelligence Platform &mdash; Karnataka State Police &mdash; Generated ${dateStr} at ${timeStr}<br/>
          This document is classified CONFIDENTIAL and intended solely for authorised law enforcement personnel.
        </div>`;

      // Print (browser shows Save as PDF dialog)
      setTimeout(() => {
        window.print();
      }, 120);

    } catch (err) {
      console.error('Report generation failed', err);
      alert('Could not generate report. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  useEffect(() => {
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' }).then(r => {
        setMicPermission(r.state);
        r.onchange = () => setMicPermission(r.state);
      }).catch(() => {});
    }
  }, []);

  // ── TTS helpers ────────────────────────────────────────────────
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMsgIdx(null);
  };

  const speakText = (text, msgIdx) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    // Toggle off if already speaking this message
    if (speakingMsgIdx === msgIdx && isSpeaking) {
      stopSpeech();
      return;
    }
    stopSpeech();
    try {
      const cleanText = text.replace(/[|*#`\-]/g, ' ').substring(0, 600);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'en' ? 'en-IN' : 'kn-IN';
      utterance.rate = 0.95;
      utterance.onstart = () => { setIsSpeaking(true); setSpeakingMsgIdx(msgIdx); };
      utterance.onend = () => { setIsSpeaking(false); setSpeakingMsgIdx(null); };
      utterance.onerror = () => { setIsSpeaking(false); setSpeakingMsgIdx(null); };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS failed', e);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const timestamp = () =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const fetchCaseDetails = async (caseNumber) => {
    setSelectedFIR(caseNumber);
    setRightPanelOpen(true);
    setIsLoadingCase(true);
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
              location_name: firRecord.location || 'Silk Board, Bengaluru',
              case_status: firRecord.case_status || 'under_investigation',
              description: firRecord.description || 'Criminal action indexed in precinct logs.',
              police_station: firRecord.police_station || 'Madiwala PS',
            },
            accused: firRecord.accused || [
              { full_name: 'Ramesh Kumar', alias: 'Ramesh Bhai', age: 34, gender: 'Male', prior_convictions: 6, modus_operandi: 'Highway robbery accomplice link', risk_score: 92 }
            ],
            victims: firRecord.victims || [
              { full_name: 'A. K. Shastri', age: 52, vulnerability_score: 60 }
            ],
            related_firs: firRecord.related_firs || [],
            case_summary: firRecord.summary || 'DRISHTI AI identified recurrent behavioral crime signatures for this suspect.'
          });
          return;
        }
      }
      throw new Error('API query returned empty or failed');
    } catch (err) {
      console.warn('Fallback to mock case details in chat', err);
      // Fallback details matching InvestigatorWallProps contract
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
        accused: [
          { full_name: 'Ramesh Kumar', alias: 'Ramesh Bhai', age: 34, gender: 'Male', prior_convictions: 6, modus_operandi: 'Highway robbery accomplice link', risk_score: 92 }
        ],
        victims: [
          { full_name: 'A. K. Shastri', age: 52, vulnerability_score: 60 }
        ],
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
          const cardMsg = `📄 **AUTOMATED FIR ENTRY STORED IN CATALYST DATASTORE**\n\n- **Case Number:** \`${rec.case_number}\`\n- **Crime Type:** ${rec.crime_type_code}\n- **District:** ${rec.district_name}\n- **Police Station:** ${rec.police_station}\n- **Date Filed:** ${rec.date_filed}\n- **Status:** ${rec.status}\n\n**Document Summary:**\n_${rec.description}_\n\n✅ *This case has been indexed into Catalyst DataStore and is now searchable by DRISHTI RAG.*`;

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

    try {
      let responseText = '';
      let isDemoResp = false;
      try {
        const res = await fetch('/api/askDrishtiAI', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text,
            lang: language,
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
        console.error('Copilot Chat API error, invoking local demo fallback:', err);
        const { generateAIResponseFromDemoData } = await import('@/lib/demo-data');
        const demoRes = generateAIResponseFromDemoData(text);
        responseText = demoRes.answer;
        isDemoResp = true;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: responseText, isDemo: isDemoResp, timestamp: timestamp() },
      ]);

      // Auto-read the assistant response
      const newMsgIdx = messages.length + 1;
      speakText(responseText, newMsgIdx);

      // Check if response mentions a specific FIR number to slide open the InvestigatorWall
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
    if (micPermission !== 'granted') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setMicPermission('granted');
      } catch {
        setMicPermission('denied');
        setError('not-allowed');
        return;
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    stopSpeech();

    // Stop any existing instance cleanly before creating a new one
    if (recognitionRef.current) {
      shouldRestartRef.current = false;
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.lang = language === 'en' ? 'en-IN' : 'kn-IN';
    rec.continuous = true;
    rec.interimResults = true;
    // Use a stable accumulated transcript across results
    let finalTranscript = '';

    rec.onresult = (e) => {
      setError(null);
      consecutiveErrorsRef.current = 0;
      // Only process new results from resultIndex to avoid re-concatenating old ones
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
      const err = e.error;
      setError(err);
      // Non-fatal errors — don't kill the mic UI state
      if (err === 'no-speech' || err === 'network') return;
      // Fatal errors: aborted by user or hardware issue
      consecutiveErrorsRef.current += 1;
      shouldRestartRef.current = false;
      setIsRecording(false);
    };

    rec.onend = () => {
      // If user didn't explicitly stop, auto-restart to keep mic active
      if (shouldRestartRef.current) {
        const pendingFinal = finalTranscript.trim();
        // Reset for next segment but keep accumulated text in input
        finalTranscript = '';
        try {
          const newRec = new SpeechRecognition();
          recognitionRef.current = newRec;
          newRec.lang = rec.lang;
          newRec.continuous = true;
          newRec.interimResults = true;
          newRec.onresult = rec.onresult;
          newRec.onerror = rec.onerror;
          newRec.onend = rec.onend;
          newRec.start();
          return; // stay recording, don't flip isRecording off
        } catch (_) {
          shouldRestartRef.current = false;
        }
      }
      // User explicitly stopped or fatal error — finalize
      setIsRecording(false);
      const finalText = finalTranscript.trim();
      finalTranscript = '';
      if (finalText) {
        sendMessage(finalText);
        setInput('');
      }
    };

    try {
      shouldRestartRef.current = true;
      rec.start();
      setIsRecording(true);
    } catch (error) {
      shouldRestartRef.current = false;
      if (error.name === 'InvalidStateError') return;
      console.error('Failed to start voice:', error);
      setIsRecording(false);
    }
  };

  const stopVoice = () => {
    shouldRestartRef.current = false; // signal onend NOT to auto-restart
    try { recognitionRef.current?.stop(); } catch (_) {}
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
      const duration = Date.now() - pttStartTimeRef.current;
      if (duration >= 250) {
        stopVoice();
      }
    }
  };

  const handleMicClick = (e) => {
    const duration = Date.now() - pttStartTimeRef.current;
    if (duration >= 250) {
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
    <div className="flex h-full relative overflow-hidden bg-void-000">
      {/* Left Chat Window */}
      <div className="flex-grow flex flex-col h-full min-w-0 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-steel-600/40 flex-shrink-0 bg-void-000">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-phosphor-500/20 border border-phosphor-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-phosphor-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-paper-100 font-mono">DRISHTI Co-Pilot</h2>
              <p className="text-xs text-paper-100/50">AI Crime Intelligence Assistant</p>
            </div>
            {/* Global mute button — visible only while TTS is playing */}
            {isSpeaking && (
              <button
                id="mute-tts-btn"
                onClick={stopSpeech}
                title="Stop reading aloud"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-critical-500/15 border border-critical-500/40
                  text-critical-500 text-xs font-mono font-bold uppercase tracking-wider hover:bg-critical-500/25
                  transition-all animate-pulse select-none"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Mute
              </button>
            )}
          </div>
          {/* Language toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-steel-700 border border-steel-600/40">
            {['en', 'kn'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                id={`lang-${lang}`}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                  ${language === lang
                    ? 'bg-phosphor-500 text-paper-100'
                    : 'text-paper-100/60 hover:text-paper-100'}`}
              >
                {lang === 'en' ? 'EN' : 'ಕನ್ನಡ'}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-void-000 bg-opacity-100">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 pb-10">
              <div className="w-16 h-16 rounded-2xl bg-phosphor-500/10 border border-phosphor-500/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-phosphor-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-paper-100 font-mono">Ask DRISHTI</h3>
                <p className="text-sm text-paper-100/50 mt-1 max-w-xs">
                  Query the KSP crime database in English or Kannada. I can generate SQL, analyse trends, and summarize case files.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-left px-4 py-3 rounded-xl bg-steel-700 border border-steel-600/40
                      text-sm text-paper-100/80 hover:border-phosphor-500/40 hover:text-phosphor-500
                      transition-all hover:bg-steel-600/40 font-mono"
                  >
                    {s}
                  </button>
                ))}
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

        {/* Input Bar */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-steel-600/40 bg-steel-700/60">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            {/* Voice Button */}
            <button
              id="voice-btn"
              onClick={handleMicClick}
              onMouseDown={handlePttStart}
              onMouseUp={handlePttEnd}
              onTouchStart={handlePttStart}
              onTouchEnd={handlePttEnd}
              disabled={!speechSupported}
              title={speechSupported ? (isRecording ? 'Release to send / Click to stop' : 'Hold to Talk / Click to toggle') : 'Voice not supported — use Chrome'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                ${isRecording
                  ? 'bg-critical-500 text-paper-100 animate-pulse'
                  : speechSupported
                    ? 'bg-steel-700 border border-steel-600/40 text-paper-100/60 hover:text-phosphor-500 hover:border-phosphor-500/40'
                    : 'bg-steel-700 border border-steel-600/40 text-paper-100/30 cursor-not-allowed'
                }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* File / FIR Document Upload Button */}
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
              title="Upload FIR Document or Case File to Catalyst DataStore"
              className="w-10 h-10 rounded-xl bg-steel-700 border border-steel-600/40 text-paper-100/60 hover:text-phosphor-500 hover:border-phosphor-500/40 flex items-center justify-center flex-shrink-0 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
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
                placeholder={language === 'en'
                  ? 'Ask about crimes, suspects, or case files…'
                  : 'ಅಪರಾಧ, ಶಂಕಿತರು ಅಥವಾ ಪ್ರಕರಣಗಳ ಬಗ್ಗೆ ಕೇಳಿ…'
                }
                rows={1}
                style={{ resize: 'none', overflowY: 'hidden' }}
                className="w-full px-4 py-2.5 rounded-xl bg-steel-700 border border-steel-600/40 text-paper-100 text-sm
                  placeholder-paper-100/30 focus:outline-none focus:border-phosphor-500 focus:ring-1 focus:ring-phosphor-500/20
                  transition-all"
              />
            </div>

            {/* Send */}
            <button
              id="send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                ${input.trim() && !loading
                  ? 'bg-phosphor-500 text-paper-100 hover:bg-phosphor-500/80'
                  : 'bg-steel-700 border border-steel-600/40 text-paper-100/30 cursor-not-allowed'
                }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-paper-100/40 mt-2">
            Press Enter to send · Shift+Enter for new line · {isRecording && '🔴 Recording…'}
          </p>
        </div>
      </div>

      {/* Slide-in panel (Investigator Wall) */}
      {rightPanelOpen && activeCaseDetails && (
        <>
          <div
            onClick={() => setRightPanelOpen(false)}
            className="fixed inset-0 bg-void-000/60 backdrop-blur-sm z-[99998] animate-fade-in"
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[700px] border-l border-steel-600 bg-steel-700 flex flex-col animate-slide-in z-[99999] shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-steel-600 shrink-0 bg-steel-700/80 sticky top-0 z-30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-critical-500">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-bold font-mono tracking-widest uppercase">Investigator Wall</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadReport}
                  disabled={downloadLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-phosphor-500 text-paper-100 hover:bg-phosphor-500/80 disabled:opacity-50 text-xs font-mono font-bold uppercase transition-all shadow-sm select-none active:scale-[0.98] outline-none"
                  title="Download Investigation PDF Report"
                >
                  {downloadLoading ? (
                    <>
                      <Spinner size="sm" className="mr-1 text-current" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="w-8 h-8 rounded-lg bg-steel-600/50 hover:bg-steel-600 flex items-center justify-center text-paper-100/60 hover:text-paper-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
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

      {/* Hidden print-only report container — populated by downloadReport() before window.print() */}
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
