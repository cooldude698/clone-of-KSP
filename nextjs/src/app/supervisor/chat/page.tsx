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
  FileCheck,
  Building2,
  Navigation
} from 'lucide-react';
import { useSupervisorTelemetry } from '@/context/SupervisorTelemetryContext';
import { cleanTextForSpeech } from '@/lib/speechUtils';

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
      content: `**DRISHTI Command Co-Pilot Active · Supervisor Operations Level**\n\nJai Hind, Sir. I am synchronized with **142 active patrol units**, **4 division police stations**, and **${pendingSanctionsCount} pending SP statutory sanction requests**.\n\nHow may I assist with patrol resource dispatch, station performance audits, or Goonda Act warrant reviews today?`,
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
      const res = await fetch('/api/askDrishtiAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          portal: 'supervisor',
          role: 'Supervisor',
          context: `Active Patrols: ${activePatrolCount}, Avg 112 ETA: ${Math.floor(avgResponseTimeSec / 60)}m ${avgResponseTimeSec % 60}s, Pending Sanctions: ${pendingSanctionsCount}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.answer || data.response_text || generateSupervisorFallbackResponse(query),
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

  function generateSupervisorFallbackResponse(q: string): string {
    const query = q.toLowerCase();
    if (query.includes('charge sheet') || query.includes('directive') || query.includes('deadline')) {
      return `**Audit Analysis for 60-Day Statutory Compliance:**\n\n- **Indiranagar PS**: 23 active cases, 2 cases exceeding 60 days without charge sheets (KAR/BEN/2024/0122).\n- **Cubbon Park PS**: 1 case overdue 48h for ballistics report (KAR/BEN/2024/2250).\n\n**Recommendation:** Issue statutory reminder notice to Insp. Anand Deshmukh regarding Section 193 BNSS final report submission.`;
    }
    if (query.includes('patrol') || query.includes('reallocate') || query.includes('night') || query.includes('fleet')) {
      return `**Patrol Optimization Recommendation:**\n\n- **High Risk Corridor**: Silk Board TTMC → Hosur Road (Peak theft window 22:00-04:00 hrs).\n- **Action**: Re-route **PCR-14** and **Cheetah-08** to Attibele checkpost chokepoints.\n- **Drone Unit DU-01**: Station at Outer Ring Road Bellandur Flyover for optical transit surveillance.`;
    }
    if (query.includes('goonda') || query.includes('warrant') || query.includes('sanction')) {
      return `**Statutory Review for Goonda Act Detention:**\n\n- **Target**: Ramesh Kumar (alias Bullet Ramesh, SUS-8842).\n- **Grounds**: 7 repeat vehicle theft FIRs across 3 districts with 433MHz frequency jammer recoveries.\n- **Statutory Threshold**: Satisfies Section 3 of Karnataka Prevention of Dangerous Activities Act (Goonda Act). Sanction approved for 6-month preventive custody.`;
    }
    return `Jai Hind, Sir. DRISHTI Supervisory Co-Pilot processed your inquiry for **Karnataka Sector 4 Command**. All 4 division stations (Ashoknagar, Cubbon Park, Ulsoor, Indiranagar) and 142 moving patrol units are operational under your command matrix.`;
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 h-[calc(100vh-120px)] text-slate-900">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Supervisor Co-Pilot Intelligence Chat
            </h1>
            <p className="text-xs text-slate-500">
              QuickML RAG Engine · Synced with 4 Stations, 142 Patrols & Statutory Sanction Queue
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Supervisor Level</span>
        </div>
      </div>

      {/* ── MESSAGES CONTAINER ── */}
      <div className="flex-1 overflow-y-auto p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4 custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white border-slate-900 rounded-tr-none'
                    : 'bg-slate-50 border-slate-200/80 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <span
                  className={`text-[9px] font-mono mt-2 block ${
                    isUser ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-lg">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 rounded-tl-none">
              Scanning station logs, active patrols & statutory databases...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── QUICK PROMPTS CHIPS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {SUPERVISOR_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:text-slate-900 whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ── INPUT BOX ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 rounded-full bg-white border border-slate-200 shadow-sm shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Drishti Co-Pilot about patrol redeployment, inspector caseloads, or warrant approvals..."
          className="flex-1 px-4 py-2 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-full bg-slate-900 hover:scale-105 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
