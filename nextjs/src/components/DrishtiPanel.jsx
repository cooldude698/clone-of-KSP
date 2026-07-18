'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, X, Volume2, VolumeX, ChevronDown, History, Pin } from 'lucide-react';

/** Typewriter — reveals text character by character */
function useTypewriter(text, speed = 16) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(true);
  const prevRef = useRef('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (!text || text === prevRef.current) return;
    prevRef.current = text;
    let i = 0;
    setDisplayed('');
    setDone(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timerRef.current); setDone(true); }
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [text, speed]);

  const skip = useCallback(() => {
    clearInterval(timerRef.current);
    setDisplayed(prevRef.current);
    setDone(true);
  }, []);

  return { displayed, done, skip };
}

/** Renders markdown-lite: bold (**text**) and newlines */
function ResponseText({ text, isTyping, onSkip }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <span>
      {parts.map((p, i) => {
        if (p === '\n') return <br key={i} />;
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
        return <span key={i}>{p}</span>;
      })}
      {isTyping && <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

export default function DrishtiPanel({
  isOpen,
  onClose,
  orbState,
  liveTranscript,
  response,
  sessionLogs,
  onSendText,
  onChipClick,
  onPttStart,
  onPttEnd,
  isSpeaking,
  onStopSpeaking,
  isListening,
  language,
  onLanguageChange,
  greetingText,
  micPermission,
  onRequestMicPermission,
  orbPinned,
  onToggleOrbPin,
}) {
  const [inputText, setInputText] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const latestResponseText = response?.response_text || greetingText || '';
  const { displayed, done, skip } = useTypewriter(latestResponseText, 16);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessionLogs.length, displayed]);

  const handleSend = () => {
    if (inputText.trim()) { onSendText(inputText); setInputText(''); }
  };

  const stateColor = {
    idle: 'bg-slate-500',
    listening: 'bg-emerald-400',
    thinking: 'bg-amber-400',
    speaking: 'bg-cyan-400',
  }[orbState] || 'bg-slate-500';

  const stateLabel = {
    idle: 'Ready',
    listening: 'Listening…',
    thinking: 'Processing…',
    speaking: 'Speaking…',
  }[orbState] || 'Ready';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — subtle, doesn't cover main content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] pointer-events-none"
            style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 60%)' }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 h-full w-[400px] z-[9995] flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #0d1117 0%, #0a0f1a 100%)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
            }}
          >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                {/* State indicator dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500 ${stateColor} ${orbState !== 'idle' ? 'animate-pulse' : ''}`} />
                <div>
                  <span className="text-white text-sm font-bold tracking-[0.12em] uppercase">Drishti</span>
                  <span className="text-white/35 text-[11px] ml-2 font-mono">{stateLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Language */}
                <div className="flex bg-white/5 rounded-lg border border-white/8 p-0.5">
                  {['en', 'kn'].map(l => (
                    <button key={l} onClick={() => onLanguageChange?.(l)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all
                        ${language === l ? 'bg-blue-600 text-white' : 'text-white/35 hover:text-white'}`}>
                      {l === 'en' ? 'EN' : 'ಕನ್ನಡ'}
                    </button>
                  ))}
                </div>
                {/* Logs toggle */}
                <button onClick={() => setShowLogs(v => !v)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                    ${showLogs ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/40 hover:text-white border border-white/8'}`}
                  title="Session logs">
                  <History className="w-3.5 h-3.5" />
                </button>
                {/* Change 6: Orb pin toggle */}
                <button
                  onClick={onToggleOrbPin}
                  title={orbPinned ? 'Orb always visible (click to hide when panel closes)' : 'Show orb only when called'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border
                    ${orbPinned
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                      : 'bg-white/5 text-white/40 border-white/8 hover:text-white'}`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                {/* Close */}
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ─── Mic permission gate ─── */}
            {micPermission !== 'granted' ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-semibold mb-1.5">Microphone Access Needed</p>
                  <p className="text-white/40 text-xs leading-relaxed max-w-[240px]">
                    Drishti uses your mic only when you hold the talk button. Your audio is never stored.
                  </p>
                </div>
                <button onClick={onRequestMicPermission}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/25">
                  Allow Microphone
                </button>
                {micPermission === 'denied' && (
                  <p className="text-red-400 text-[11px] text-center">
                    Blocked — enable mic in browser settings, then reload.
                  </p>
                )}
              </div>
            ) : showLogs ? (
              /* ─── Logs View ─── */
              <div className="flex-1 overflow-y-auto drishti-scrollbar px-4 py-4 space-y-3">
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-3">
                  {sessionLogs.length} interaction{sessionLogs.length !== 1 ? 's' : ''} this session
                </p>
                {sessionLogs.length === 0 && (
                  <p className="text-white/25 text-sm text-center pt-10">No logs yet.</p>
                )}
                {sessionLogs.map((log, i) => (
                  <div key={i} className={`px-3.5 py-3 rounded-xl border text-xs leading-relaxed
                    ${log.role === 'user'
                      ? 'bg-blue-600/8 border-blue-500/15 text-blue-100 ml-6'
                      : 'bg-white/3 border-white/6 text-white/65 mr-6'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] uppercase tracking-widest font-bold ${log.role === 'user' ? 'text-blue-400' : 'text-cyan-400'}`}>
                        {log.role === 'user' ? 'You' : 'Drishti'}
                      </span>
                      <span className="text-[9px] text-white/20 font-mono">{log.timestamp}</span>
                    </div>
                    {log.content}
                  </div>
                ))}
              </div>
            ) : (
              /* ─── Chat View ─── */
              <div ref={scrollRef} className="flex-1 overflow-y-auto drishti-scrollbar px-4 py-4 space-y-3">

                {/* All past messages */}
                {sessionLogs.slice(0, -1).map((log, i) => (
                  <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                      ${log.role === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/20 text-blue-100 rounded-br-md'
                        : 'bg-white/5 border border-white/8 text-white/80 rounded-bl-md'}`}>
                      <p className="whitespace-pre-wrap">{log.content}</p>
                      <span className="text-[9px] text-white/20 font-mono mt-1 block">{log.timestamp}</span>
                    </div>
                  </div>
                ))}

                {/* Latest Drishti response (typewriter) */}
                {latestResponseText && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md bg-white/5 border border-white/8 text-sm text-white/80 leading-relaxed">
                      <ResponseText text={displayed} isTyping={!done} onSkip={skip} />
                      {!done && (
                        <button onClick={skip} className="block mt-1.5 text-[10px] text-white/25 hover:text-white/45 transition-colors">
                          skip →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Live transcript while PTT held */}
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-emerald-500/8 border border-emerald-500/20 text-sm text-emerald-200/80">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] text-emerald-400 uppercase tracking-wider font-bold">Listening</span>
                      </div>
                      <p className="italic text-emerald-200/60 min-h-[18px]">
                        {liveTranscript || 'Speak now…'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Thinking indicator */}
                {orbState === 'thinking' && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/5 border border-white/8">
                      <div className="flex gap-1 items-center">
                        {[0,1,2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                            style={{ animationDelay: `${i*0.15}s`, animationDuration: '0.8s' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggestion chips */}
                {response?.follow_up_suggestions?.length > 0 && done && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {response.follow_up_suggestions.map((s, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => onChipClick?.(s)}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/55 text-[11px]
                          hover:bg-blue-500/10 hover:border-blue-500/25 hover:text-blue-300 transition-all text-left"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                )}

                <div className="h-2" />
              </div>
            )}

            {/* ─── Bottom Input Bar (only when mic granted) ─── */}
            {micPermission === 'granted' && (
              <div className="px-4 py-3 border-t border-white/[0.07] flex-shrink-0"
                style={{ background: 'rgba(6,11,24,0.8)', backdropFilter: 'blur(12px)' }}>

                {/* Stop speaking */}
                {isSpeaking && (
                  <button onClick={onStopSpeaking}
                    className="w-full mb-2.5 py-2 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-[11px] font-semibold uppercase tracking-wider hover:bg-red-500/15 transition-all flex items-center justify-center gap-2">
                    <VolumeX className="w-3.5 h-3.5" />
                    Stop Speaking
                  </button>
                )}

                <div className="flex items-center gap-2">
                  {/* PTT Button */}
                  <button
                    onMouseDown={onPttStart}
                    onMouseUp={onPttEnd}
                    onMouseLeave={isListening ? onPttEnd : undefined}
                    onTouchStart={(e) => { e.preventDefault(); onPttStart?.(); }}
                    onTouchEnd={(e) => { e.preventDefault(); onPttEnd?.(); }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 select-none transition-all
                      ${isListening
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                        : 'bg-white/6 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    title="Hold to talk"
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Text input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={language === 'en' ? 'Type a message…' : 'ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ…'}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                      placeholder-white/20 focus:outline-none focus:border-blue-500/40 focus:ring-1
                      focus:ring-blue-500/15 transition-all"
                  />

                  {/* Send */}
                  <button onClick={handleSend} disabled={!inputText.trim()}
                    className="w-10 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-500
                      disabled:opacity-25 disabled:pointer-events-none transition-all flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-2 text-[9px] text-white/18 font-mono text-center">
                  Hold 🎤 to talk · <kbd className="opacity-60 bg-white/10 px-1 py-0.5 rounded text-[8px]">Ctrl+Alt</kbd> PTT · <kbd className="opacity-60 bg-white/10 px-1 py-0.5 rounded text-[8px]">Space</kbd> open · Double-clap to wake
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
