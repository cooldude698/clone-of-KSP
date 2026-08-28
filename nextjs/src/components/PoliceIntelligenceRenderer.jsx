'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, Shield, AlertTriangle, CheckCircle2, 
  MapPin, Car, Radio, Scale, ArrowRight, Eye, Sparkles,
  ChevronRight, ExternalLink, Hash
} from 'lucide-react';

/**
 * PoliceIntelligenceRenderer
 * Highly polished, executive KSP Police Intelligence renderer.
 * Converts markdown text into structured, glassmorphic police UI components.
 * Eliminates all raw asterisks, unrendered pipes, and formatting glitches.
 */

// Helper to determine threat rating styling from string
function getThreatBadge(scoreText) {
  const match = scoreText.match(/(\d{1,3})\s*\/\s*100/);
  const score = match ? parseInt(match[1], 10) : null;
  const isCritical = scoreText.toLowerCase().includes('critical') || (score !== null && score >= 85);
  const isHigh = scoreText.toLowerCase().includes('high') || (score !== null && score >= 70 && score < 85);

  if (isCritical) {
    return {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-500 dark:text-rose-400',
      dot: 'bg-rose-500 animate-pulse',
      label: 'CRITICAL',
    };
  }
  if (isHigh) {
    return {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500',
      label: 'HIGH',
    };
  }
  return {
    bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'ACTIVE',
  };
}

// Tokenizes inline elements (bold, links, code, case numbers, statutes)
function renderInlineContent(content, isDark) {
  if (!content) return null;

  // Normalize and remove stray multiple asterisks (e.g. ***, ****)
  let normalized = content
    .replace(/\*{3,}/g, '**')
    .replace(/_{3,}/g, '_');

  // Match: [text](url) | **bold** | `code` | case numbers | statutes
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|KAR\/[A-Z0-9]+\/\d+\/\d+|FIR-\d{4}-[A-Z0-9]+-\d+|(?:IPC|BNS|NDPS|IT Act)\s*(?:§|Section)?\s*[\w\d()]+)/g;
  const tokens = normalized.split(tokenRegex);

  return tokens.map((token, idx) => {
    if (!token) return null;

    // 1. Markdown Link: [text](url)
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      const isInternal = linkUrl.startsWith('/');
      
      const linkClasses = "inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-bold transition-all " +
        (isDark 
          ? "bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-400 shadow-xs" 
          : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 shadow-xs");

      if (isInternal) {
        return (
          <Link key={idx} href={linkUrl} className={linkClasses}>
            <FileText className="w-3 h-3 text-blue-500 shrink-0" />
            <span>{linkText}</span>
          </Link>
        );
      }
      return (
        <a key={idx} href={linkUrl} target="_blank" rel="noopener noreferrer" className={linkClasses}>
          <span>{linkText}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
        </a>
      );
    }

    // 2. Bold text: **text**
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      const inner = token.slice(2, -2).trim();
      return (
        <strong 
          key={idx} 
          className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}
        >
          {renderInlineContent(inner, isDark)}
        </strong>
      );
    }

    // 3. Inline Code: `code`
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      const codeText = token.slice(1, -1).trim();

      // Check if it's a vehicle license plate (e.g. KA-01-MJ-8821 or KA-04-...)
      if (/KA[-\s]?\d{2}[-\s]?[A-Z]{1,3}[-\s]?\d{1,4}/i.test(codeText)) {
        return (
          <span 
            key={idx}
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 mx-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
          >
            <Car className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{codeText}</span>
          </span>
        );
      }

      // Check if it's a Threat/Risk score (e.g. 94/100)
      if (/\d{1,3}\s*\/\s*100/.test(codeText)) {
        const badge = getThreatBadge(codeText);
        return (
          <span 
            key={idx}
            className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 mx-0.5 rounded border ${badge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            <span>{codeText}</span>
          </span>
        );
      }

      // Standard Monospace Code Badge
      return (
        <code 
          key={idx} 
          className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 mx-0.5 rounded border transition-colors ${
            isDark 
              ? 'bg-slate-800/80 text-cyan-300 border-slate-700' 
              : 'bg-slate-100 text-cyan-800 border-slate-300'
          }`}
        >
          {codeText}
        </code>
      );
    }

    // 4. Standalone Case Number (e.g. KAR/BEN/2024/0747)
    const singleCaseRegex = /^(KAR\/[A-Z0-9]+\/\d+\/\d+|FIR-\d{4}-[A-Z0-9]+-\d+)$/i;
    if (singleCaseRegex.test(token)) {
      return (
        <Link
          key={idx}
          href={`/dashboard/fir/${encodeURIComponent(token)}`}
          className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 mx-0.5 rounded border transition-all ${
            isDark 
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25' 
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
        >
          <FileText className="w-3 h-3 text-blue-500 shrink-0" />
          <span>{token}</span>
        </Link>
      );
    }

    // 5. Legal Statute Badges (e.g. IPC §379, BNS §303, NDPS §21)
    const isStatute = /^(IPC|BNS|NDPS|IT Act)\s*(?:§|Section)?\s*[\w\d()]+/i.test(token);
    if (isStatute && token.length < 25) {
      return (
        <span 
          key={idx}
          className={`inline-flex items-center gap-0.5 text-[10.5px] font-semibold px-1.5 py-0.5 mx-0.5 rounded border ${
            isDark
              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}
        >
          <Scale className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
          <span>{token}</span>
        </span>
      );
    }

    // Regular cleaned text (remove any trailing unclosed asterisks)
    const cleanedText = token.replace(/^\*+|\*+$/g, '');
    return <span key={idx}>{cleanedText}</span>;
  });
}

/**
 * Main Police Intelligence View Component
 */
export default function PoliceIntelligenceRenderer({
  text = '',
  isDark = true,
  mode = 'panel', // 'panel' | 'bubble' | 'chat'
  isTyping = false,
  className = '',
}) {
  if (!text) return null;

  // Split content into lines and construct structured AST blocks
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

    // Numbered Item: 1., 2., 3.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      blocks.push({ type: 'numbered', num: numMatch[1], text: numMatch[2] });
      continue;
    }

    // Bullet Item: -, *, •
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({ type: 'bullet', text: bulletMatch[1] });
      continue;
    }

    // Paragraph
    blocks.push({ type: 'p', text: trimmed });
  }

  return (
    <div className={`space-y-2.5 text-xs sm:text-[13px] leading-relaxed font-sans ${isDark ? 'text-slate-200' : 'text-slate-800'} ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'spacer') {
          return <div key={idx} className="h-1" />;
        }

        // ── TABLE / KEY-VALUE INTELLIGENCE CARD ──
        if (block.type === 'table') {
          if (!block.rows || !block.rows.length) return null;
          const [header, ...bodyRows] = block.rows;

          // If table has 2 columns (e.g. Parameter | Intelligence Record), render as sleek high-tech spec grid
          const isTwoCol = header && header.length === 2;

          if (isTwoCol && mode !== 'table-raw') {
            return (
              <div 
                key={idx}
                className={`my-3 rounded-xl border overflow-hidden shadow-sm transition-all ${
                  isDark 
                    ? 'bg-[#0B132B]/60 border-slate-800/80' 
                    : 'bg-white/90 border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                }`}
              >
                {/* Table Header Pill Bar */}
                <div className={`flex items-center justify-between px-3.5 py-2 border-b text-[10.5px] font-bold uppercase tracking-wider font-mono ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800 text-cyan-400' 
                    : 'bg-slate-100/90 border-slate-200 text-blue-700'
                }`}>
                  <span>{header[0] ? renderInlineContent(header[0], isDark) : 'Parameter'}</span>
                  <span>{header[1] ? renderInlineContent(header[1], isDark) : 'Intelligence Record'}</span>
                </div>

                {/* Key-Value Spec Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {bodyRows.map((row, rIdx) => {
                    const label = row[0] || '';
                    const val = row[1] || '';
                    return (
                      <div 
                        key={rIdx}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between px-3.5 py-2 text-xs gap-1.5 transition-colors ${
                          rIdx % 2 === 0 
                            ? isDark ? 'bg-slate-900/20' : 'bg-transparent'
                            : isDark ? 'bg-slate-900/50' : 'bg-slate-50/70'
                        } hover:${isDark ? 'bg-blue-950/20' : 'bg-blue-50/50'}`}
                      >
                        <div className={`font-semibold shrink-0 sm:w-2/5 pr-2 ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {renderInlineContent(label, isDark)}
                        </div>
                        <div className={`sm:w-3/5 break-words font-medium ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                          {renderInlineContent(val, isDark)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // General Multi-Column Table
          return (
            <div 
              key={idx} 
              className={`my-3 overflow-x-auto rounded-xl border shadow-sm ${
                isDark ? 'bg-[#0B132B]/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <table className="w-full text-xs text-left border-collapse">
                {header && (
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                      {header.map((col, cIdx) => (
                        <th 
                          key={cIdx} 
                          className={`px-3 py-2 font-bold uppercase tracking-wider text-[10px] font-mono ${
                            isDark ? 'text-cyan-400' : 'text-blue-700'
                          }`}
                        >
                          {renderInlineContent(col, isDark)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr 
                      key={rIdx}
                      className={`border-b last:border-0 transition-colors ${
                        rIdx % 2 === 0 
                          ? 'bg-transparent' 
                          : isDark ? 'bg-slate-900/40' : 'bg-slate-50/60'
                      } ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}
                    >
                      {row.map((cell, cIdx) => (
                        <td 
                          key={cIdx} 
                          className={`px-3 py-2 leading-relaxed ${
                            cIdx === 0 ? 'font-semibold' : ''
                          }`}
                        >
                          {renderInlineContent(cell, isDark)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // ── HEADING BLOCK ──
        if (block.type === 'heading') {
          // Detect header intent
          const lowerH = block.text.toLowerCase();
          const isDirective = lowerH.includes('directive') || lowerH.includes('recommendation') || lowerH.includes('action');
          const isDocket = lowerH.includes('docket') || lowerH.includes('case') || lowerH.includes('fir');
          const isMO = lowerH.includes('modus') || lowerH.includes('m.o') || lowerH.includes('pattern');

          return (
            <div key={idx} className="mt-3.5 mb-1.5 first:mt-0">
              <div className="flex items-center gap-1.5">
                {isDirective && <span className="text-amber-500 text-xs">🎯</span>}
                {isDocket && <FileText className="w-3.5 h-3.5 text-blue-400" />}
                {isMO && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                <h4 className={`text-xs sm:text-[13px] font-bold tracking-tight uppercase font-mono ${
                  isDirective 
                    ? 'text-amber-500 dark:text-amber-400' 
                    : isDark ? 'text-cyan-300' : 'text-blue-700'
                }`}>
                  {renderInlineContent(block.text, isDark)}
                </h4>
              </div>
              <div className={`h-[1px] w-full mt-1 ${
                isDark ? 'bg-gradient-to-r from-blue-500/30 via-slate-800 to-transparent' : 'bg-gradient-to-r from-blue-400/40 via-slate-200 to-transparent'
              }`} />
            </div>
          );
        }

        // ── NUMBERED DIRECTIVE ITEM (1., 2., 3.) ──
        if (block.type === 'numbered') {
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1 pl-1">
              <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                isDark 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                  : 'bg-blue-100 text-blue-700 border border-blue-300'
              }`}>
                {block.num}
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInlineContent(block.text, isDark)}
              </div>
            </div>
          );
        }

        // ── BULLET ITEM (-, *) ──
        if (block.type === 'bullet') {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                isDark ? 'bg-cyan-400/80 shadow-[0_0_6px_rgba(34,211,238,0.6)]' : 'bg-blue-600'
              }`} />
              <div className="flex-1 leading-relaxed">
                {renderInlineContent(block.text, isDark)}
              </div>
            </div>
          );
        }

        // ── REGULAR PARAGRAPH ──
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineContent(block.text, isDark)}
          </p>
        );
      })}

      {/* Typing cursor if actively streaming */}
      {isTyping && (
        <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse align-middle rounded-full" />
      )}
    </div>
  );
}
