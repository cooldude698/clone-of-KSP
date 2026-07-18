'use client';

import { useState, useEffect, useMemo } from 'react';
import { Shield, Search, Trash2, Download, MessageSquare, AlertCircle } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs]           = useState([]);
  const [search, setSearch]       = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [mounted, setMounted]     = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('drishti_session_logs');
      if (raw) setLogs(JSON.parse(raw));
    } catch (_) {}
  }, []);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(l => l.content?.toLowerCase().includes(q));
  }, [logs, search]);

  // Group by date — we don't store dates per message so use session grouping
  // Since logs are from localStorage, we treat the first message timestamp as session marker
  const grouped = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    filtered.forEach((log) => {
      // Use the timestamp as-is (HH:MM). For a real app we'd store full date.
      const groupKey = 'Session'; // single session grouping — simple and honest
      if (!currentGroup || currentGroup.key !== groupKey) {
        currentGroup = { key: groupKey, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(log);
    });
    return groups;
  }, [filtered]);

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    localStorage.removeItem('drishti_session_logs');
    setLogs([]);
    setConfirmClear(false);
  };

  const handleExport = () => {
    const lines = logs.map(l =>
      `[${l.timestamp || '??:??'}] ${l.role === 'user' ? 'YOU' : 'DRISHTI'}: ${l.content}`
    );
    const txt = [
      '=== DRISHTI ದೃಷ್ಟಿ — Conversation Log ===',
      `Exported: ${new Date().toLocaleString('en-IN')}`,
      `Total messages: ${logs.length}`,
      '=========================================',
      '',
      ...lines,
    ].join('\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drishti-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-full bg-void-000 flex flex-col">

      {/* ── Page Header ── */}
      <div className="px-6 py-5 border-b border-steel-600/40 bg-steel-700/40 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-phosphor-500/15 border border-phosphor-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-phosphor-500" />
            </div>
            <div>
              <h2 className="text-paper-100 font-bold text-base tracking-wide">DRISHTI Conversation Logs</h2>
              <p className="text-paper-100/40 text-xs font-mono">ದೃಷ್ಟಿ · {logs.length} message{logs.length !== 1 ? 's' : ''} on record</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-steel-600/50 border border-steel-600/60 text-paper-100/70 hover:text-paper-100 hover:bg-steel-600 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export .txt
            </button>
            <button
              onClick={handleClear}
              disabled={logs.length === 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none
                ${confirmClear
                  ? 'bg-red-600 text-white border border-red-500'
                  : 'bg-steel-600/50 border border-steel-600/60 text-warn-500 hover:bg-red-600/15 hover:border-red-500/30'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmClear ? 'Confirm Clear' : 'Clear Logs'}
            </button>
            {confirmClear && (
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg bg-steel-600/50 border border-steel-600/60 text-paper-100/50 hover:text-paper-100 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-paper-100/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-steel-600/30 border border-steel-600/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-paper-100 placeholder-paper-100/25 focus:outline-none focus:border-phosphor-500/40 focus:ring-1 focus:ring-phosphor-500/15 transition-all font-mono"
          />
        </div>
      </div>

      {/* ── Log Content ── */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {logs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-steel-700/60 border border-steel-600/40 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-paper-100/20" />
            </div>
            <div className="text-center">
              <p className="text-paper-100/50 text-sm font-semibold">No conversations yet.</p>
              <p className="text-paper-100/25 text-xs mt-1">Start talking to Drishti.</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* No search results */
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-steel-700/60 border border-steel-600/40 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-paper-100/20" />
            </div>
            <div className="text-center">
              <p className="text-paper-100/50 text-sm font-semibold">No results for &ldquo;{search}&rdquo;</p>
              <p className="text-paper-100/25 text-xs mt-1">Try a different keyword.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {grouped.map((group, gi) => (
              <div key={gi}>
                {/* Group date separator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-steel-600/40" />
                  <span className="text-[10px] uppercase tracking-widest text-paper-100/25 font-mono font-bold">
                    {group.key}
                  </span>
                  <div className="h-px flex-1 bg-steel-600/40" />
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {group.messages.map((log, i) => (
                    <div
                      key={i}
                      className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                          ${log.role === 'user'
                            ? 'bg-blue-600/15 border border-blue-500/20 text-blue-100 rounded-br-md'
                            : 'bg-steel-700/70 border border-steel-600/50 text-paper-100/75 rounded-bl-md'}`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1.5">
                          <span className={`text-[9px] uppercase tracking-widest font-bold
                            ${log.role === 'user' ? 'text-blue-400' : 'text-phosphor-500'}`}>
                            {log.role === 'user' ? 'You' : 'Drishti'}
                          </span>
                          {log.timestamp && (
                            <span className="text-[9px] text-paper-100/20 font-mono">{log.timestamp}</span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap">{log.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Scroll padding */}
            <div className="h-8" />
          </div>
        )}
      </div>
    </div>
  );
}
