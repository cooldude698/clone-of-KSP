'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, Shield, AlertTriangle, CheckCircle2, 
  MapPin, Car, Radio, Scale, ArrowRight, Eye, Sparkles,
  ChevronRight, ExternalLink, Hash, CornerDownRight
} from 'lucide-react';

/**
 * PoliceIntelligenceRenderer
 * Enterprise-grade, clean KSP Police Intelligence renderer.
 * Formats structured intelligence, tables, case dockets, and tactical directives.
 * Zero neon clutter, zero stray asterisks, highly readable for executive command.
 */

// Helper to determine threat rating styling from string
function getThreatBadge(scoreText) {
  const match = scoreText.match(/(\d{1,3})\s*\/\s*100/);
  const score = match ? parseInt(match[1], 10) : null;
  const isCritical = scoreText.toLowerCase().includes('critical') || (score !== null && score >= 85);
  const isHigh = scoreText.toLowerCase().includes('high') || (score !== null && score >= 70 && score < 85);

  if (isCritical) {
    return {
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      dotClass: 'bg-red-500',
      label: 'CRITICAL',
    };
  }
  if (isHigh) {
    return {
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      dotClass: 'bg-amber-500',
      label: 'HIGH',
    };
  }
  return {
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    dotClass: 'bg-emerald-500',
    label: 'ACTIVE',
  };
}

// Tokenizes inline elements (bold, links, code, case numbers, statutes)
function renderInlineContent(content, isDark) {
  if (!content) return null;

  // Clean raw markdown artifact quotes like *" or "*
  let normalized = content
    .replace(/\*["']|["']\*/g, '"')
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
      
      const linkClasses = "inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold transition-all " +
        (isDark 
          ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-400/40" 
          : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200");

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
          className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          {renderInlineContent(inner, isDark)}
        </strong>
      );
    }

    // 3. Inline Code: `code`
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      const codeText = token.slice(1, -1).trim();

      // Check if it's a vehicle license plate
      if (/KA[-\s]?\d{2}[-\s]?[A-Z]{1,3}[-\s]?\d{1,4}/i.test(codeText)) {
        return (
          <span 
            key={idx}
            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-1.5 py-0.5 mx-0.5 rounded border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          >
            <Car className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{codeText}</span>
          </span>
        );
      }

      // Check if it's a Threat/Risk score
      if (/\d{1,3}\s*\/\s*100/.test(codeText)) {
        const badge = getThreatBadge(codeText);
        return (
          <span 
            key={idx}
            className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-1.5 py-0.5 mx-0.5 rounded border ${badge.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
            <span>{codeText}</span>
          </span>
        );
      }

      // Standard Monospace Code Badge
      return (
        <code 
          key={idx} 
          className={`font-mono text-[11px] font-medium px-1.5 py-0.5 mx-0.5 rounded border ${
            isDark 
              ? 'bg-zinc-800 text-zinc-200 border-zinc-700' 
              : 'bg-zinc-100 text-zinc-800 border-zinc-200'
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
          className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-1.5 py-0.5 mx-0.5 rounded border transition-all ${
            isDark 
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' 
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
          className={`inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 py-0.5 mx-0.5 rounded border ${
            isDark
              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}
        >
          <Scale className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
          <span>{token}</span>
        </span>
      );
    }

    // Clean any stray asterisks at start or end
    const cleaned = token.replace(/^\*+|\*+$/g, '');
    return <span key={idx}>{cleaned}</span>;
  });
}

/**
 * Main Police Intelligence View Component
 */
export default function PoliceIntelligenceRenderer({
  text = '',
  isDark = true,
  mode = 'panel',
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
    <div className={`space-y-2.5 text-xs sm:text-[13px] leading-relaxed font-sans ${isDark ? 'text-slate-200' : 'text-slate-700'} ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'spacer') {
          return <div key={idx} className="h-0.5" />;
        }

        // ── TABLE / KEY-VALUE INTELLIGENCE CARD ──
        if (block.type === 'table') {
          if (!block.rows || !block.rows.length) return null;
          const [header, ...bodyRows] = block.rows;
          const isTwoCol = header && header.length === 2;

          if (isTwoCol) {
            return (
              <div 
                key={idx}
                className={`my-2.5 rounded-xl border overflow-hidden transition-all ${
                  isDark 
                    ? 'bg-slate-900/60 border-slate-800' 
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Table Header Bar */}
                <div className={`flex items-center justify-between px-3.5 py-1.5 border-b text-[10.5px] font-semibold uppercase tracking-wider font-mono ${
                  isDark 
                    ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' 
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <span>{header[0] ? renderInlineContent(header[0], isDark) : 'Parameter'}</span>
                  <span>{header[1] ? renderInlineContent(header[1], isDark) : 'Intelligence Record'}</span>
                </div>

                {/* Key-Value Spec Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {bodyRows.map((row, rIdx) => {
                    const label = row[0] || '';
                    const val = row[1] || '';
                    return (
                      <div 
                        key={rIdx}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between px-3.5 py-2 text-xs gap-1 transition-colors ${
                          rIdx % 2 === 0 
                            ? 'bg-transparent' 
                            : isDark ? 'bg-slate-900/30' : 'bg-slate-50/50'
                        }`}
                      >
                        <div className={`font-medium shrink-0 sm:w-2/5 pr-2 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {renderInlineContent(label, isDark)}
                        </div>
                        <div className={`sm:w-3/5 break-words ${
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
              className={`my-2.5 overflow-x-auto rounded-xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <table className="w-full text-xs text-left border-collapse">
                {header && (
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                      {header.map((col, cIdx) => (
                        <th 
                          key={cIdx} 
                          className={`px-3 py-2 font-semibold uppercase tracking-wider text-[10px] font-mono ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
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
                      className={`border-b last:border-0 ${
                        rIdx % 2 === 0 
                          ? 'bg-transparent' 
                          : isDark ? 'bg-slate-900/30' : 'bg-slate-50/50'
                      } ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
                    >
                      {row.map((cell, cIdx) => (
                        <td 
                          key={cIdx} 
                          className="px-3 py-2 leading-relaxed"
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
          return (
            <div key={idx} className="mt-3.5 mb-1.5 first:mt-0">
              <h4 className={`text-xs sm:text-[13px] font-semibold tracking-tight uppercase font-mono ${
                isDark ? 'text-blue-400' : 'text-blue-700'
              }`}>
                {renderInlineContent(block.text, isDark)}
              </h4>
              <div className={`h-[1px] w-full mt-1 ${
                isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`} />
            </div>
          );
        }

        // ── NUMBERED DIRECTIVE ITEM (1., 2., 3.) ──
        if (block.type === 'numbered') {
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1 pl-0.5">
              <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-mono font-semibold shrink-0 mt-0.5 ${
                isDark 
                  ? 'bg-slate-800 text-blue-400 border border-slate-700' 
                  : 'bg-slate-100 text-blue-700 border border-slate-200'
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
            <div key={idx} className="flex items-start gap-2 my-1 pl-0.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                isDark ? 'bg-blue-400' : 'bg-blue-600'
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
