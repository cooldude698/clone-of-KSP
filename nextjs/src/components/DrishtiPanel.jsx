'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, X, Volume2, VolumeX, History, Pin, Sun, Moon, Sparkles, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';

/** Typewriter — reveals text character by character */
function useTypewriter(text, speed = 14) {
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
function ResponseText({ text, isTyping, isDark }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <span className="leading-relaxed">
      {parts.map((p, i) => {
        if (p === '\n') return <br key={i} />;
        if (p.startsWith('**') && p.endsWith('**'))
          return (
            <strong key={i} className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              {p.slice(2, -2)}
            </strong>
          );
        return <span key={i}>{p}</span>;
      })}
      {isTyping && <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse align-middle rounded-full" />}
    </span>
  );
}

export default function DrishtiPanel({
  isOpen,
  onClose,
  orbState,
  liveTranscript,
  response,
  sessionLogs = [],
  onSendText,
  onChipClick,
  onPttStart,
  onPttEnd,
  isSpeaking,
  onStopSpeaking,
  isListening,
  language = 'en',
  onLanguageChange,
  greetingText,
  micPermission,
  onRequestMicPermission,
  orbPinned,
  onToggleOrbPin,
  stateOverrideLabel,
  onSpeakText,
  isMuted,
  onToggleMute,
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light'; // Automatically follows the app theme on the left side!

  const [inputText, setInputText] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [talkToTalk, setTalkToTalk] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const latestResponseText = response?.response_text || greetingText || '';
  const { displayed, done, skip } = useTypewriter(latestResponseText, 14);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessionLogs.length, displayed]);

  // Talk-to-talk hands-free loop: when speaking ends and talkToTalk is ON, restart listening
  useEffect(() => {
    if (talkToTalk && !isSpeaking && orbState === 'idle' && !isListening && isOpen) {
      const timer = setTimeout(() => {
        onPttStart?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [talkToTalk, isSpeaking, orbState, isListening, isOpen, onPttStart]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendText(inputText.trim());
      setInputText('');
    }
  };

  const stateColor = {
    idle: isDark ? 'bg-slate-400' : 'bg-slate-500',
    listening: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]',
    thinking: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]',
    speaking: 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]',
  }[orbState] || 'bg-slate-400';

  const stateLabel = stateOverrideLabel || ({
    idle: 'Ready',
    listening: 'Listening…',
    thinking: 'Analyzing…',
    speaking: 'Speaking',
  }[orbState] || 'Ready');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] pointer-events-none"
            style={{
              background: isDark
                ? 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 60%)'
                : 'linear-gradient(to left, rgba(0,0,0,0.2) 0%, transparent 60%)',
            }}
          />

          {/* Assistant Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`fixed top-0 right-0 h-full w-full max-w-[430px] z-[9995] flex flex-col pointer-events-auto border-l shadow-2xl transition-colors duration-300 ${
              isDark
                ? 'bg-[#0B0F19] border-slate-800/80 text-slate-100'
                : 'bg-[#F8FAFC] border-slate-200 text-slate-900'
            }`}
          >
            {/* ─── Top Header Bar ─── */}
            <div
              className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 backdrop-blur-md ${
                isDark ? 'bg-[#0F172A]/90 border-slate-800/80' : 'bg-white/90 border-slate-200 shadow-sm'
              }`}
            >
              {/* Left Brand Identity */}
              <div className="flex items-center gap-2.5">
                {!orbPinned && (
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${stateColor} ${orbState !== 'idle' ? 'animate-pulse' : ''}`} />
                )}
                <div className={orbPinned ? 'pl-11' : ''}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black tracking-widest uppercase font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      DRISHTI
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                      v2.4
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {stateLabel}
                  </span>
                </div>
              </div>

              {/* Right Action Bar */}
              <div className="flex items-center gap-1.5">
                {/* Language Switcher Pill */}
                <div className={`flex rounded-lg p-0.5 border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  {[
                    { id: 'en', label: 'EN' },
                    { id: 'kn', label: 'ಕನ್ನಡ' },
                    { id: 'hi', label: 'हिंदी' },
                  ].map(l => (
                    <button
                      key={l.id}
                      onClick={() => onLanguageChange?.(l.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        language === l.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Mute Toggle */}
                <button
                  onClick={onToggleMute}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs transition-all ${
                    isMuted
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  title={isMuted ? 'Unmute Audio' : 'Mute Spoken Audio'}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>

                {/* Orb Pin Toggle */}
                <button
                  onClick={onToggleOrbPin}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    orbPinned
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  title={orbPinned ? 'Orb Pinned' : 'Pin Orb'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ─── Police Intelligence Live Stat Bar ─── */}
            <div className={`grid grid-cols-4 gap-1.5 px-3 py-2 border-b flex-shrink-0 ${
              isDark ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className={`px-1.5 py-1 rounded-lg border text-center ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                <div className="text-xs font-bold text-red-500 font-mono">968</div>
                <div className={`text-[8px] font-semibold uppercase tracking-wider ${isDark ? 'text-red-300/60' : 'text-red-600'}`}>Active FIRs</div>
              </div>
              <div className={`px-1.5 py-1 rounded-lg border text-center ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <div className="text-xs font-bold text-amber-500 font-mono">49</div>
                <div className={`text-[8px] font-semibold uppercase tracking-wider ${isDark ? 'text-amber-300/60' : 'text-amber-600'}`}>Hotspots</div>
              </div>
              <div className={`px-1.5 py-1 rounded-lg border text-center ${isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'}`}>
                <div className="text-xs font-bold text-cyan-500 font-mono">12</div>
                <div className={`text-[8px] font-semibold uppercase tracking-wider ${isDark ? 'text-cyan-300/60' : 'text-cyan-600'}`}>Repeaters</div>
              </div>
              <div className={`px-1.5 py-1 rounded-lg border text-center ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="text-xs font-bold text-emerald-500 font-mono">94%</div>
                <div className={`text-[8px] font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-300/60' : 'text-emerald-600'}`}>CCTV Feed</div>
              </div>
            </div>



            {/* ─── Main Chat Content Container ─── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto drishti-scrollbar px-4 py-4 space-y-4">
              
              {/* History Messages */}
              {sessionLogs.slice(0, -1).map((log, i) => (
                <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`w-full max-w-[88%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed break-words overflow-hidden border shadow-sm ${
                      log.role === 'user'
                        ? 'bg-blue-600 text-white border-blue-500 rounded-tr-xs'
                        : isDark
                        ? 'bg-[#131C2E] border-slate-800 text-slate-200 rounded-tl-xs'
                        : 'bg-white border-slate-200 text-slate-800 rounded-tl-xs shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10 opacity-70">
                      <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
                        {log.role === 'user' ? 'Officer' : 'DRISHTI AI'}
                      </span>
                      <span className="text-[9px] font-mono">{log.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-wrap leading-relaxed">{log.content}</p>

                    {/* Audio buttons for Assistant messages */}
                    {log.role === 'assistant' && (
                      <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-700/30">
                        <button
                          onClick={() => onSpeakText?.(log.content, 'en-IN')}
                          className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          🔊 EN
                        </button>
                        <button
                          onClick={() => onSpeakText?.(log.content, 'kn-IN')}
                          className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          🔊 KN
                        </button>
                        <button
                          onClick={() => onSpeakText?.(log.content, 'hi-IN')}
                          className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          🔊 HI
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Latest Response Card */}
              {latestResponseText && (
                <div className="flex justify-start">
                  <div
                    className={`w-full max-w-[88%] px-4 py-3 rounded-2xl rounded-tl-xs text-xs sm:text-sm leading-relaxed break-words overflow-hidden border shadow-lg ${
                      isDark
                        ? 'bg-[#131C2E] border-slate-800 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-900 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-700/30">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[10px] font-mono uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-blue-400 animate-spin" />
                        DRISHTI INTELLIGENCE
                      </div>
                      {!done ? (
                        <button onClick={skip} className="text-[10px] text-blue-400 hover:underline">
                          skip typing →
                        </button>
                      ) : (
                        <span className={`text-[9px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Just now</span>
                      )}
                    </div>

                    <ResponseText text={displayed} isTyping={!done} isDark={isDark} />

                    {/* Audio Playback Toolbar */}
                    {done && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/30">
                        <span className={`text-[9px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Audio Output:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSpeakText?.(latestResponseText, 'en-IN')}
                            className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            🔊 EN
                          </button>
                          <button
                            onClick={() => onSpeakText?.(latestResponseText, 'kn-IN')}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            🔊 KN
                          </button>
                          <button
                            onClick={() => onSpeakText?.(latestResponseText, 'hi-IN')}
                            className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            🔊 HI
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Follow-up Prompts */}
              {response?.follow_up_suggestions?.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className={`text-[9px] uppercase tracking-widest font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Suggested Actions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {response.follow_up_suggestions.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => onChipClick?.(chip)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-all ${
                          isDark
                            ? 'bg-slate-900/80 border-slate-800 text-blue-300 hover:bg-blue-600/20 hover:border-blue-500/40'
                            : 'bg-white border-slate-200 text-blue-700 hover:bg-blue-50 shadow-sm'
                        }`}
                      >
                        ⚡ {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── Bottom Voice & Text Input Footer ─── */}
            <div className={`px-4 py-3 border-t flex-shrink-0 ${
              isDark ? 'bg-[#0F172A]/95 border-slate-800/80' : 'bg-white border-slate-200 shadow-md'
            }`}>

              {/* Stop Speaking Banner */}
              {isSpeaking && (
                <button
                  onClick={onStopSpeaking}
                  className="w-full mb-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  Stop Voice Output
                </button>
              )}

              <div className="flex items-center gap-2">
                {/* Glowing Mic Button */}
                {/* Glowing Mic Button — Supports both Click and Hold-to-Talk */}
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (micPermission !== 'granted') onRequestMicPermission?.();
                    onPttStart?.(e);
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    onPttEnd?.(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (micPermission !== 'granted') onRequestMicPermission?.();
                    onPttStart?.(e);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onPttEnd?.(e);
                  }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isListening
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-105 ring-4 ring-emerald-500/30 animate-pulse'
                      : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-blue-600/20 hover:border-blue-500/40 hover:text-blue-300'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm'
                  }`}
                  title={isListening ? 'Release or click to send voice query' : 'Hold or click to speak'}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce text-white' : ''}`} />
                </button>

                {/* Text Input Box */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    language === 'kn'
                      ? 'ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...'
                      : language === 'hi'
                      ? 'प्रश्न टाइप करें...'
                      : 'Ask DRISHTI intelligence...'
                  }
                  className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                  }`}
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center shadow-md shadow-blue-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Control Bar & Hands-Free Toggle */}
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
                <button
                  onClick={() => setTalkToTalk(v => !v)}
                  className={`px-2 py-0.5 rounded-md border flex items-center gap-1 font-sans transition-all ${
                    talkToTalk
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  🗣️ Hands-Free Talk: {talkToTalk ? 'ON' : 'OFF'}
                </button>

                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[9px] text-slate-300 border border-slate-700">Alt+O</kbd> to toggle panel
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
