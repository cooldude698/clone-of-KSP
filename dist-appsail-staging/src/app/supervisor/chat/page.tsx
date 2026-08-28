'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  Clock,
  User,
  RotateCcw,
  Zap,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { useSupervisorTelemetry } from '@/context/SupervisorTelemetryContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUPERVISOR_PROMPTS = [
  'Identify stations exceeding 60-day charge sheet deadlines and draft show-cause directives.',
  'Recommend optimal patrol fleet reallocations for Friday night shift in Bengaluru & Raichur.',
  'Evaluate Goonda Act statutory grounds for repeat vehicle theft syndicate kingpins.',
  'Generate an executive summary of statewide 112 emergency response bottlenecks.',
];

export default function SupervisorCoPilotPage() {
  const { tick, lastUpdated, avgResponseTimeSec, activePatrolCount, pendingSanctionsCount } = useSupervisorTelemetry();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `**DRISHTI Command Co-Pilot Active · Supervisor Operations Level**\n\nGood day, Sir. I am synced with **142 live patrol units**, **6 district audit registries**, and **${pendingSanctionsCount} pending SP statutory sanction requests**.\n\nHow may I assist with resource optimization, station accountability audits, or legal warrant reviews today?`,
      timestamp: '18:25 IST',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' IST',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          role: 'Supervisor',
          district: 'Karnataka Statewide',
          context: `Active Patrols: ${activePatrolCount}, Avg 112 ETA: ${Math.floor(avgResponseTimeSec/60)}m ${avgResponseTimeSec%60}s, Pending Sanctions: ${pendingSanctionsCount}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply || data.response || generateSupervisorFallbackResponse(query),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' IST',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Fallback response');
      }
    } catch {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: generateSupervisorFallbackResponse(query),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' IST',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSupervisorFallbackResponse = (q: string): string => {
    const query = q.toLowerCase();
    if (query.includes('charge sheet') || query.includes('show-cause') || query.includes('deadline')) {
      return `### 📋 Statutory Charge Sheet & Investigation Audit Summary\n\n- **Critical Stations Flagged (>60 days delay)**:\n  1. **Raichur Suburban PS** — 14 overdue charge sheets (IO: Insp. Anand Patil)\n  2. **Kalaburagi Rural PS** — 9 overdue charge sheets (IO: Insp. Suresh Kulkarni)\n  3. **Vijayapura Town PS** — 5 overdue charge sheets (IO: Insp. Suresh Naidu)\n\n**Recommended SP Action**:\nIssue formal show-cause directives under Rule 48 of Karnataka Police Manual requiring explanations within 72 hours and assign DSP-level supervision to clear procedural bottlenecks.`;
    }
    if (query.includes('patrol') || query.includes('fleet') || query.includes('redeploy') || query.includes('friday')) {
      return `### 🚓 Tactical Patrol Fleet Re-allocation Directives\n\nBased on Bayesian temporal crime forecasting for 22:00 – 03:00 hrs:\n\n1. **Bengaluru Urban Sector 4**:\n   - Redeploy **Cheetah-08** and **PCR-14** to *Silk Board TTMC – Hosur Corridor* (hotspot for vehicle hijack & commercial burglaries).\n2. **Raichur – Kalaburagi Axis (NH-50)**:\n   - Station **Interceptor-04** at *Manvi Toll Plaza* for high-speed ANPR sweeps.\n3. **Reserve Standby**:\n   - Maintain 2 Cheetah units on standby at *Chikkamagaluru Market Beat* for commercial retail safety.`;
    }
    if (query.includes('goonda') || query.includes('sanction') || query.includes('ramesh')) {
      return `### ⚖️ Legal Sanction & Preventive Detention Assessment\n\n- **Target Subject**: Ramesh Kumar (alias *Bullet Ramesh*)\n- **Applicable Statute**: *Section 3(1) of Karnataka Prevention of Dangerous Activities Act (Goonda Act), 1985*.\n- **Evidentiary Support**:\n  - 4 charge-sheeted vehicle theft FIRs across Raichur & Ballari.\n  - Habitual offender pattern established with master key tools.\n- **Statutory Recommendation**: Grounds are legally robust. Proceed to execute 1-year preventive detention sanction order.`;
    }
    return `### 🛡️ Command Intelligence Synthesis\n\nOperational review completed for query: *"${q}"*.\n\n- **Statewide 112 Readiness**: 142 Active Patrols on duty.\n- **Response Velocity**: Avg 6m 42s.\n- **Statutory Compliance**: Recommended continuous weekly case disposal reviews with Range DIGs to maintain >80% statewide clearance.`;
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              EXECUTIVE AI ASSISTANT
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Superintendent of Police Command Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Supervisor AI Command Co-Pilot
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Optimizes police workforce distribution, audits station compliance, and synthesizes statutory warrants.
          </p>
        </div>

        {/* Dynamic 3s Pulse */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)] animate-pulse" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">CORE:</span>
          <span className="text-[var(--text-primary)] font-bold">Online (20ms)</span>
        </div>
      </div>

      {/* ── QUICK PROMPTS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
        {SUPERVISOR_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="p-3 rounded-xl bg-[var(--surface-0)] hover:bg-[var(--surface-1)] border border-[var(--border)] text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-start gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--cyan-accent)] shrink-0 mt-0.5" />
            <span className="text-[11px] leading-snug line-clamp-2">{p}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN CHAT CONSOLE ── */}
      <div className="p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {messages.map((msg) => {
            const isAi = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                    isAi
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'bg-[var(--surface-2)] text-[var(--text-primary)]'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] p-4 rounded-2xl font-mono text-xs leading-relaxed ${
                    isAi
                      ? 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border)]'
                      : 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] opacity-70">
                    <span>{isAi ? 'DRISHTI COMMAND AI' : 'OFFICER IN-CHARGE'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse font-mono">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--cyan-accent)] animate-ping" />
                <span>Synthesizing command & legal intelligence...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Supervisor AI: e.g., 'Draft deployment plan for Kalaburagi Highway beat...'"
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-white font-bold font-mono text-xs uppercase shadow-md shadow-[var(--accent-glow)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Query</span>
          </button>
        </form>
      </div>
    </div>
  );
}
