'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Sparkles, 
  Copy, Check, X, ShieldAlert, FileText, Search, Car, Users, 
  Database, RefreshCw, Cpu, Layers, ArrowRight, CornerDownLeft, Globe,
  ChevronDown, ChevronUp, FileDown, Printer
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import InvestigatorWall from '@/components/InvestigatorWall';
import VoiceDebugStatus from '@/components/VoiceDebugStatus';
import { DrishtiEmblem } from '@/components/DrishtiLogo';
import { UPLOADED_FIRS } from '@/lib/uploadedFirsStore';
import { useLanguage } from '@/context/LanguageContext';

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

function FormattedText({ text, onCaseClick, maxLines = 25 }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  // Inline markdown tokenizer
  const renderInline = (content) => {
    if (!content) return null;

    // Tokenize links [text](url), bold **text**, code `text`, and standalone case numbers
    // Regex matches: [text](url) OR **bold** OR `code` OR (KAR/...|FIR-...)
    const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|KAR\/[A-Z0-9]+\/\d+\/\d+|FIR-\d{4}-[A-Z0-9]+-\d+)/g;
    const tokens = content.split(tokenRegex);

    return tokens.map((token, idx) => {
      if (!token) return null;

      // 1. Markdown Link: [text](url)
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        return (
          <Link
            key={idx}
            href={linkUrl}
            className="text-sky-600 dark:text-sky-400 hover:text-sky-500 font-mono font-bold border border-sky-500/30 rounded px-1.5 py-0.5 bg-sky-500/10 hover:bg-sky-500/20 transition-all mx-0.5 inline-flex items-center gap-1 focus:outline-none cursor-pointer text-xs"
          >
            <FileText className="w-3 h-3 text-sky-500" />
            <span>{linkText}</span>
          </Link>
        );
      }

      // 2. Bold text: **text**
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        const inner = token.slice(2, -2);
        return (
          <strong key={idx} className="text-gray-950 dark:text-white font-bold">
            {renderInline(inner)}
          </strong>
        );
      }

      // 3. Inline Code: `code`
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        const codeText = token.slice(1, -1);
        return (
          <code key={idx} className="font-mono bg-sky-500/10 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-500/25 rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-tight mx-0.5">
            {codeText}
          </code>
        );
      }

      // 4. Standalone Case Number
      const singleCaseRegex = /^(KAR\/[A-Z0-9]+\/\d+\/\d+|FIR-\d{4}-[A-Z0-9]+-\d+)$/i;
      if (singleCaseRegex.test(token)) {
        return (
          <Link
            key={idx}
            href={`/dashboard/fir/${encodeURIComponent(token)}`}
            className="text-sky-600 dark:text-sky-400 hover:text-sky-500 font-mono font-bold border border-sky-500/30 rounded px-1.5 py-0.5 bg-sky-500/10 hover:bg-sky-500/20 transition-all mx-0.5 inline-flex items-center gap-1 focus:outline-none cursor-pointer text-xs"
          >
            <FileText className="w-3 h-3 text-sky-500" />
            <span>{token}</span>
          </Link>
        );
      }

      // Plain text (clean single trailing artifact asterisks)
      return <span key={idx}>{token.replace(/^\*+|\*+$/g, '')}</span>;
    });
  };

  // Block Level Markdown Parsing
  const rawLines = text.split('\n');
  const blocks = [];
  let currentTable = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Check if line is part of a markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const isDivider = /^\|\s*:?-+:?\s*\|/.test(trimmed);
      if (!currentTable) {
        currentTable = { type: 'table', rows: [] };
        blocks.push(currentTable);
      }
      if (!isDivider) {
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      currentTable = null;
    }

    if (!trimmed) {
      blocks.push({ type: 'spacer' });
      continue;
    }

    // Heading: ###, ##, #
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      continue;
    }

    // Bullet item: -, *, •
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({ type: 'bullet', text: bulletMatch[1] });
      continue;
    }

    // Numbered item: 1., 2.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      blocks.push({ type: 'numbered', num: numMatch[1], text: numMatch[2] });
      continue;
    }

    // Regular paragraph
    blocks.push({ type: 'p', text: trimmed });
  }

  const isLong = blocks.length > maxLines;
  const displayBlocks = isLong && !expanded ? blocks.slice(0, maxLines) : blocks;

  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed font-sans text-gray-800 dark:text-gray-200">
      {displayBlocks.map((block, idx) => {
        if (block.type === 'spacer') {
          return <div key={idx} className="h-1" />;
        }

        // Table Block
        if (block.type === 'table') {
          if (!block.rows.length) return null;
          const [header, ...body] = block.rows;
          return (
            <div key={idx} className="my-2.5 overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                {header && (
                  <thead>
                    <tr className="bg-gray-100/90 dark:bg-zinc-800/90 border-b border-gray-200 dark:border-zinc-700">
                      {header.map((col, cIdx) => (
                        <th key={cIdx} className="px-3.5 py-2 font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10.5px] font-sans">
                          {renderInline(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {body.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={`border-b border-gray-100 dark:border-zinc-800/80 last:border-0 transition-colors ${
                        rIdx % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-zinc-800/30'
                      }`}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-3.5 py-2 leading-relaxed ${
                            cIdx === 0
                              ? 'font-semibold text-gray-900 dark:text-gray-100 w-1/3 min-w-[140px]'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Heading Block
        if (block.type === 'heading') {
          return (
            <h4 key={idx} className="text-[13.5px] font-bold text-gray-900 dark:text-white mt-3 mb-1 flex items-center gap-1.5 tracking-tight">
              {renderInline(block.text)}
            </h4>
          );
        }

        // Bullet Point Block
        if (block.type === 'bullet') {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 flex-shrink-0" />
              <div className="flex-1 leading-snug">{renderInline(block.text)}</div>
            </div>
          );
        }

        // Numbered List Block
        if (block.type === 'numbered') {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-[11px] font-bold font-mono text-sky-600 dark:text-sky-400 bg-sky-500/10 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                {block.num}
              </span>
              <div className="flex-1 leading-snug">{renderInline(block.text)}</div>
            </div>
          );
        }

        // Paragraph Block
        return (
          <p key={idx} className="leading-snug py-0.5">
            {renderInline(block.text)}
          </p>
        );
      })}

      {isLong && (
        <div className="pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-semibold text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
          >
            {expanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Read more ({blocks.length - maxLines} more sections)</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

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

      const cleanedPreview = text
        .replace(/AUTOMATED FIR ENTRY STORED IN DATASTORE[\s\S]*?Document Summary:\s*/i, '')
        .replace(/✅[\s\S]*/i, '')
        .replace(/^\s*[\*_#]+\s*/gm, '')
        .trim();

      return (
        <div className="my-1 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-xs max-w-full sm:max-w-[520px]">
          {/* Card Top Banner */}
          <div className="bg-gray-950 dark:bg-black px-3 py-2 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <FileText className="w-3 h-3" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight">
                  Automated FIR Entry Registered
                </h4>
                <p className="text-[9.5px] text-gray-400 font-mono">
                  Karnataka Police CCTNS Datastore
                </p>
              </div>
            </div>
            {caseMatch && (
              <button
                onClick={() => onCaseClick && onCaseClick(caseNum)}
                className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-mono font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-sky-400" />
                {caseNum}
              </button>
            )}
          </div>

          {/* Data Grid Badges */}
          <div className="p-2.5 space-y-2 bg-white dark:bg-zinc-900">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                <span className="text-[8.5px] font-mono uppercase text-gray-400 block font-medium">Crime Type</span>
                <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight block truncate">
                  {crimeTypeMatch ? crimeTypeMatch[1].trim().replace('_', ' ') : 'General Offence'}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                <span className="text-[8.5px] font-mono uppercase text-gray-400 block font-medium">Police Station</span>
                <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate block">
                  {stationMatch ? stationMatch[1].trim() : 'Central Command'}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                <span className="text-[8.5px] font-mono uppercase text-gray-400 block font-medium">District</span>
                <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate block">
                  {districtMatch ? districtMatch[1].trim() : 'Bengaluru Urban'}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                <span className="text-[8.5px] font-mono uppercase text-gray-400 block font-medium">Status</span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {statusMatch ? statusMatch[1].trim().toUpperCase() : 'INVESTIGATING'}
                </span>
              </div>
            </div>

            {/* Document Content Box */}
            <div className="mt-1">
              <span className="text-[9.5px] font-mono font-bold uppercase text-gray-400 tracking-wider block mb-1">
                Parsed Document Preview & Metadata:
              </span>
              <div className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/70 dark:border-zinc-700/60 rounded-lg p-2 text-xs">
                <FormattedText text={cleanedPreview} onCaseClick={onCaseClick} maxLines={15} />
              </div>
            </div>

            {/* Bottom Verification Tag */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-zinc-800 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3 h-3 shrink-0" />
              <span>Document indexed into live RAG memory & ANPR watchlists.</span>
            </div>
          </div>
        </div>
      );
    }

    return <FormattedText text={text} onCaseClick={onCaseClick} maxLines={15} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`flex gap-2.5 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs border ${
        isUser 
          ? 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border-gray-200 dark:border-zinc-700' 
          : 'bg-black dark:bg-white text-white dark:text-black border-black/10 dark:border-white/20 p-1.5'}`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-gray-700 dark:text-zinc-200" />
          : <DrishtiEmblem className="w-full h-full" color="currentColor" />
        }
      </div>

      <div className={`max-w-[85%] sm:max-w-[560px] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-gray-400 dark:text-gray-500 px-1">
          <span className="font-semibold">{isUser ? 'Inspector (You)' : 'DRISHTI Co-Pilot'}</span>
          <span>·</span>
          <span>{msg.timestamp || 'Just now'}</span>
        </div>

        <div className={`rounded-2xl text-[13px] relative shadow-xs border ${
          isUser
            ? 'max-w-[85%] sm:max-w-[420px] bg-gray-950 dark:bg-white text-white dark:text-gray-950 border-gray-900 dark:border-white rounded-tr-xs px-3.5 py-2'
            : 'bg-white dark:bg-[#18181B] text-gray-900 dark:text-gray-100 border-gray-200/80 dark:border-gray-800/80 rounded-tl-xs p-3'
        }`}>
          {isUser
            ? <p className="font-sans leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
            : (
              <div className="space-y-2">
                <div>{renderContentWithCaseLinks(msg.content)}</div>
                
                {/* Interactive Suspect Intelligence Cards */}
                {!isUser && msg.suspects && msg.suspects.length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-zinc-800/80">
                    <span className="text-[9.5px] font-mono font-bold uppercase text-sky-600 dark:text-sky-400 tracking-wider block">
                      Target Suspect Intelligence Cards ({msg.suspects.length}):
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.suspects.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</h5>
                                {s.alias && <span className="text-[10px] text-slate-400">(&ldquo;{s.alias}&rdquo;)</span>}
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  Risk {s.risk_score}/100
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                {s.primary_crime} · {s.last_known_vehicle || 'Under Watch'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                            <button
                              onClick={() => onCaseClick && onCaseClick(s.active_firs?.[0] || 'FIR-2026-BL-9104')}
                              className="px-2 py-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Dossier →
                            </button>
                            <a
                              href="/dashboard/map"
                              className="px-2 py-1 rounded-md bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold transition-colors"
                            >
                              Live Map
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Case Docket Cards */}
                {!isUser && msg.case_cards && msg.case_cards.length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-zinc-800/80">
                    <span className="text-[9.5px] font-mono font-bold uppercase text-sky-600 dark:text-sky-400 tracking-wider block">
                      Connected CCTNS Case Dockets ({msg.case_cards.length}):
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.case_cards.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">{c.case_number}</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                              {c.crime_type} · <span className="text-slate-400">{c.police_station}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => onCaseClick && onCaseClick(c.case_number)}
                            className="px-2 py-1 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                          >
                            Open Docket
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          }
        </div>

        {!isUser && (
          <div className="flex items-center gap-3 px-1 pt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-[10px] font-mono text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <button
              onClick={() => onSpeak && onSpeak(msg.content)}
              className={`text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors ${
                isSpeakingThis ? 'text-rose-500 font-bold animate-pulse' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
                className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/30 border border-gray-200 dark:border-zinc-700 hover:border-sky-500/40 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-all cursor-pointer shadow-xs"
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
  const [stage, setStage] = useState(0);
  const stages = [
    'Correlating CCTNS Crime Records...',
    'Synthesizing Multilingual RAG...',
    'Querying ANPR Camera Watchlists...',
    'Formulating Tactical Directives...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 items-center"
    >
      <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black border border-black/10 dark:border-white/20 flex items-center justify-center flex-shrink-0 p-1.5 shadow-xs">
        <DrishtiEmblem className="w-full h-full animate-pulse" color="currentColor" />
      </div>
      <div className="bg-white dark:bg-[#18181B] border border-sky-500/30 dark:border-sky-500/20 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-sm">
        <div className="flex gap-2 items-center h-5">
          <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-ping" />
          <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold tracking-tight">
            {stages[stage]}
          </span>
          <div className="flex gap-1 items-center ml-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const CHAT_STORAGE_KEY = 'drishti_chat_history_v2';

export default function ChatPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState(
    language === 'kn' ? 'kn-SapnaNeural' : language === 'hi' ? 'hi-SwaraNeural' : 'en-NeerjaNeural'
  );
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micPermission, setMicPermission] = useState('prompt');
  const [error, setError] = useState(null);
  const consecutiveErrorsRef = useRef(0);
  const [conversationId, setConversationId] = useState('');

  useEffect(() => {
    if (language === 'kn') {
      setVoiceProfile('kn-SapnaNeural');
    } else if (language === 'hi') {
      setVoiceProfile('hi-SwaraNeural');
    } else {
      setVoiceProfile('en-NeerjaNeural');
    }
  }, [language]);
  
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
    try {
      let responseText = '';
      let isDemoResp = false;
      let followUps = [];
      let suspectsList = [];
      let casesList = [];
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
          suspectsList = data.suspects || [];
          casesList = data.case_cards || [];
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
        {
          role: 'assistant',
          content: responseText,
          isDemo: isDemoResp,
          timestamp: timestamp(),
          suggestions: followUps,
          suspects: suspectsList,
          case_cards: casesList,
        },
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

  const voiceTranscriptRef = useRef('');

  const startVoice = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    stopSpeech();

    if (recognitionRef.current) {
      shouldRestartRef.current = false;
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    voiceTranscriptRef.current = '';
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
      const combined = (finalTranscript + interimTranscript).trim();
      voiceTranscriptRef.current = combined;
      setInput(combined);
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
    
    // Auto-submit voice query if speech was recognized
    const speechText = voiceTranscriptRef.current.trim() || input.trim();
    if (speechText) {
      voiceTranscriptRef.current = '';
      setTimeout(() => sendMessage(speechText), 150);
    }
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
    <div className="flex h-full relative overflow-hidden bg-[#F8F9FB] dark:bg-[#09090B] text-gray-900 dark:text-gray-100 font-sans">
      <div className="flex-grow flex flex-col h-full min-w-0 transition-all duration-300 relative z-10">
        {/* Header Command Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 shadow-xs z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center p-1.5 shadow-xs flex-shrink-0">
              <DrishtiEmblem className="w-full h-full" color="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white font-sans tracking-tight">
                  DRISHTI Co-Pilot
                </h2>
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE GRID
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                Karnataka Police AI Intelligence & Multilingual RAG Engine
              </p>
            </div>
            {isSpeaking && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={stopSpeech}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-all cursor-pointer shadow-xs animate-pulse ml-2"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute</span>
              </motion.button>
            )}
          </div>

          {/* Action Buttons & Compact Language Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard/logs')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
              title="View all AI Subject Log Cards"
            >
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>AI Logs</span>
            </button>
            <button
              onClick={handleExportConversation}
              disabled={!messages.length || exportingPdf}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
              title="Export conversation as PDF"
            >
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>{exportingPdf ? 'Exporting...' : 'PDF'}</span>
            </button>

            {/* Compact Voice Profile Dropdown */}
            <div className="relative flex items-center">
              <select
                value={voiceProfile}
                onChange={(e) => setVoiceProfile(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none"
                title="Select Speech Voice & Language"
              >
                {VOICE_PROFILES.map((profile) => (
                  <option key={profile.id} value={profile.id} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                    {profile.label}
                  </option>
                ))}
              </select>
            </div>

            {messages.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportConversation}
                  disabled={exportingPdf}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
                  title="Export Intelligence Dossier (PDF/HTML)"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{exportingPdf ? 'Exporting...' : 'Export PDF'}</span>
                </button>
                <button
                  onClick={clearChatHistory}
                  className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-all cursor-pointer shrink-0"
                  title="Clear conversation history"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Container / Empty Hero State */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          <div className="max-w-3xl lg:max-w-4xl mx-auto w-full space-y-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-6 text-center max-w-xl mx-auto py-6">
                
                {/* Central AI Emblem */}
                <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center p-3 shadow-md">
                  <DrishtiEmblem className="w-full h-full" color="currentColor" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 px-3 py-0.5 rounded-full uppercase tracking-widest inline-block">
                    Karnataka Police AI Command
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-sans">
                    How can DRISHTI assist today?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-sans leading-relaxed max-w-md mx-auto">
                    Query CCTNS crime datastores, parse FIR documents, inspect suspects, or run ANPR lookups in <span className="font-semibold text-gray-800 dark:text-gray-200">English</span>, <span className="font-semibold text-gray-800 dark:text-gray-200">ಕನ್ನಡ</span>, or <span className="font-semibold text-gray-800 dark:text-gray-200">हिंदी</span>.
                  </p>
                </div>

                {/* Suggestion Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                  {SUGGESTIONS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.button
                        key={i}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => sendMessage(s.text)}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-gray-50 dark:hover:bg-zinc-800/80 border border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all shadow-xs group cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[8.5px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {s.badge}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white font-sans mb-0.5">
                            {s.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-sans line-clamp-2 leading-relaxed">
                            &ldquo;{s.text}&rdquo;
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
        </div>

        {/* Input Floating Command Dock */}
        <div className="p-3 sm:p-4 border-t border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md relative z-20">
          <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-1.5">
            <div className="flex items-center gap-2 bg-[#F4F5F8] dark:bg-[#111317] border border-gray-200 dark:border-zinc-800 focus-within:border-gray-400 dark:focus-within:border-zinc-600 rounded-2xl p-1.5 px-2.5 shadow-sm transition-all">
              <button
                id="voice-btn"
                onClick={handleMicClick}
                onMouseDown={handlePttStart}
                onMouseUp={handlePttEnd}
                onTouchStart={handlePttStart}
                onTouchEnd={handlePttEnd}
                disabled={!speechSupported}
                title={speechSupported ? (isRecording ? 'Release to send / Click to stop' : 'Hold to Talk / Click to toggle') : 'Voice input not supported'}
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                    : 'bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200/80 dark:border-zinc-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
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
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200/80 dark:border-zinc-700 text-gray-700 dark:text-gray-200 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4" />
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
                  className="w-full px-2 py-1.5 bg-transparent text-gray-900 dark:text-gray-100 text-[13.5px] placeholder-gray-400 focus:outline-none font-sans"
                />
              </div>

              <button
                id="send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  input.trim() && !loading
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 shadow-xs'
                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-gray-500 px-2">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-bold">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-bold">Shift+Enter</kbd> for line break</span>
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
