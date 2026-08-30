'use client';

import React, { useEffect, useState } from 'react';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import PoliceIntelligenceRenderer from '@/components/PoliceIntelligenceRenderer';

const cn = (...classes) => classes.filter(Boolean).join(' ');


const DrishtiOrb = ({
  state = 'idle',
  onClick,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  className,
  compact = false,
  audioLevel = 0,
  pendingTranscript = '',
  orbResponse = '',
  onConfirmSend,
  onCancelTranscript,
  showTypingInput = false,
  onToggleTyping,
  typingText = '',
  onTypingChange,
  onTypingSubmit,
  onPttStart,
  onPttEnd,
  isListening = false,
  liveTranscript = '',
  onReadAloud,
  onDismissResponse,
  onOpenPanel,
  isMuted = false,
  onToggleMute,
  suggestions = [],
  onSelectSuggestion,
  isSpeaking = false,
  onStopSpeaking,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!liveTranscript && !pendingTranscript && !orbResponse) {
      setIsDismissed(false);
    }
  }, [liveTranscript, pendingTranscript, orbResponse]);

  const handleDismissBubble = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setIsDismissed(true);
    onCancelTranscript?.();
    onDismissResponse?.();
  };

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0 });
  const activePosition = React.useRef({ x: 0, y: 0 });
  const currentPos = React.useRef({ x: 0, y: 0 });
  const hasMoved = React.useRef(false);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button')
    ) {
      return;
    }
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = {
      x: e.clientX - activePosition.current.x,
      y: e.clientY - activePosition.current.y
    };

    const handleMouseMove = (moveEvent) => {
      if (!isDragging.current) return;
      const dx = moveEvent.clientX - dragStart.current.x;
      const dy = moveEvent.clientY - dragStart.current.y;
      if (Math.abs(dx - activePosition.current.x) > 3 || Math.abs(dy - activePosition.current.y) > 3) {
        hasMoved.current = true;
      }
      currentPos.current = { x: dx, y: dy };
      setPosition({ x: dx, y: dy });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      activePosition.current = currentPos.current;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button')
    ) {
      return;
    }
    const touch = e.touches[0];
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = {
      x: touch.clientX - activePosition.current.x,
      y: touch.clientY - activePosition.current.y
    };

    const handleTouchMove = (moveEvent) => {
      if (!isDragging.current) return;
      const moveTouch = moveEvent.touches[0];
      const dx = moveTouch.clientX - dragStart.current.x;
      const dy = moveTouch.clientY - dragStart.current.y;
      if (Math.abs(dx - activePosition.current.x) > 3 || Math.abs(dy - activePosition.current.y) > 3) {
        hasMoved.current = true;
      }
      currentPos.current = { x: dx, y: dy };
      setPosition({ x: dx, y: dy });
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      activePosition.current = currentPos.current;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleOrbClick = (e) => {
    if (hasMoved.current) {
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  // Determine current effective state for hue mapping
  const effectiveState = isListening ? 'listening' : state;

  if (!isClient) return null;

  // ── COMPACT MODE (when docked or mini) ──
  if (compact) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 w-14 h-14",
          className
        )}
        onClick={handleOrbClick}
      >
        <VoicePoweredOrb
          enableVoiceControl={isListening}
          hue={effectiveState === 'thinking' || effectiveState === 'processing' ? 120 : 0}
          voiceSensitivity={2.0}
          maxRotationSpeed={1.5}
          maxHoverIntensity={0.6}
          className="w-full h-full rounded-full overflow-hidden"
        />
      </div>
    );
  }

  // ── FULL FLOATING AURA ORB MODE ──
  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        "fixed bottom-6 right-6 z-[9999] flex flex-col items-center select-none gap-2 cursor-grab",
        isDragging.current && "cursor-grabbing"
      )}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none'
      }}
    >

      {/* ── LIVE LISTENING & INTELLIGENCE RESPONSE HUD CARD (Tactical Glassmorphism) ── */}
      {!isDismissed && (liveTranscript || pendingTranscript || orbResponse) && (
        <div className="w-[340px] sm:w-[440px] max-w-[94vw] rounded-2xl overflow-hidden mb-3 animate-fade-in relative z-20 shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_30px_rgba(59,130,246,0.18)] border border-slate-700/80 dark:border-slate-800 bg-slate-900/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl text-slate-100">
          {/* Top ambient blue/cyan accent glow bar */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600" />

          <div className="p-4 relative z-10 text-slate-100">
            {/* Live transcript while listening */}
            {liveTranscript && !pendingTranscript && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                    <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold font-mono">
                      LISTENING TO VOICE…
                    </span>
                  </div>
                  <button
                    onClick={handleDismissBubble}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/80 p-1 rounded-lg transition-all text-xs cursor-pointer"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-cyan-100 font-mono leading-relaxed shadow-inner">
                  &quot;{liveTranscript}&quot;
                </div>
              </div>
            )}

            {/* Pending transcript confirmation ("Did you say: ...") */}
            {pendingTranscript && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🎙️</span>
                    <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold font-mono">
                      VOICE TRANSCRIPT VERIFICATION
                    </span>
                  </div>
                  <button
                    onClick={handleDismissBubble}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/80 p-1 rounded-lg transition-all text-xs cursor-pointer"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-slate-950/90 rounded-xl border border-blue-500/40 text-xs text-slate-100 font-medium leading-relaxed shadow-inner">
                  &quot;{pendingTranscript}&quot;
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onConfirmSend?.(); }}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Send Query</span>
                    <span className="text-[10px] opacity-80 font-mono px-1 py-0.2 bg-black/30 rounded">↵</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onCancelTranscript?.(); }}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer border border-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Voice response bubble */}
            {!liveTranscript && !pendingTranscript && orbResponse && (
              <div className="space-y-3">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[10px] shrink-0 text-blue-400 shadow-xs">
                      🛡️
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold tracking-wider text-white uppercase">
                        DRISHTI INTEL HUD
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isSpeaking ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onStopSpeaking?.(); }}
                        className="text-red-300 hover:text-white hover:bg-red-500/30 bg-red-500/20 border border-red-500/50 px-2.5 py-1 rounded-lg cursor-pointer transition-all text-xs flex items-center gap-1.5 font-mono font-bold animate-pulse shadow-xs"
                        title="Stop audio speech immediately"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Stop Audio</span>
                      </button>
                    ) : onReadAloud ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReadAloud(); }}
                        className="text-slate-300 hover:text-white hover:bg-blue-500/20 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-lg cursor-pointer transition-all text-xs flex items-center gap-1 font-mono"
                        title="Read Aloud"
                      >
                        🔊 Listen
                      </button>
                    ) : null}
                    {onOpenPanel && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenPanel(); }}
                        className="text-slate-300 hover:text-white hover:bg-blue-500/20 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-lg cursor-pointer transition-all text-xs font-mono"
                        title="Open Full Copilot Workspace"
                      >
                        ↗ Panel
                      </button>
                    )}
                    <button
                      onClick={handleDismissBubble}
                      className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg cursor-pointer transition-all text-xs ml-0.5"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Render Rich Intelligence Response */}
                <div className="max-h-80 overflow-y-auto drishti-scrollbar pr-1">
                  <PoliceIntelligenceRenderer text={orbResponse} isDark={true} theme="dark" mode="bubble" />
                </div>

                {/* Interactive Recommended Queries (Clean 2-Column Grid) */}
                {suggestions && suggestions.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="text-cyan-400">⚡</span>
                        <span>Recommended Next Inquiries</span>
                      </span>
                      <span className="text-[9px] font-medium text-cyan-400/80">Click to ask</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {suggestions.slice(0, 4).map((sug, sIdx) => {
                        const s = (sug || '').toLowerCase();
                        let icon = '⚡';
                        if (s.includes('theft') || s.includes('vehicle') || s.includes('car') || s.includes('bike')) icon = '🚔';
                        else if (s.includes('suspect') || s.includes('target') || s.includes('ramesh') || s.includes('imran') || s.includes('roster')) icon = '🎯';
                        else if (s.includes('hotspot') || s.includes('silk') || s.includes('area') || s.includes('camera') || s.includes('anpr')) icon = '📍';
                        else if (s.includes('sop') || s.includes('panchanama') || s.includes('bns') || s.includes('ipc') || s.includes('law')) icon = '⚖️';

                        return (
                          <button
                            key={sIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSuggestion?.(sug);
                            }}
                            className="group relative flex items-center gap-2 p-2 rounded-xl text-left bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-cyan-500/50 transition-all cursor-pointer shadow-2xs active:scale-[0.98] overflow-hidden"
                            title={sug}
                          >
                            <span className="w-5 h-5 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[10px] shrink-0 text-cyan-300">
                              {icon}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white line-clamp-1 leading-tight flex-1">
                              {sug}
                            </span>
                            <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tactical Footer */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>KSP CCTNS v4.2 • Grid Synced</span>
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined') {
                        navigator.clipboard.writeText(orbResponse);
                      }
                    }}
                    className="hover:text-cyan-400 cursor-pointer flex items-center gap-1 transition-colors font-medium text-slate-300"
                  >
                    📋 Copy Brief
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VOICE POWERED ORB (WebGL Shader) ── */}
      <div
        onClick={handleOrbClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={cn(
          "cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32",
          className
        )}
      >
        <VoicePoweredOrb
          enableVoiceControl={isListening}
          hue={effectiveState === 'thinking' || effectiveState === 'processing' ? 120 : 0}
          voiceSensitivity={2.0}
          maxRotationSpeed={1.5}
          maxHoverIntensity={0.8}
          className="w-full h-full rounded-full overflow-hidden"
        />
      </div>

      {/* ── FLOATING CONTROLS PILL (Tactical Sleek) ── */}
      <div className="flex items-center gap-2 bg-slate-900/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border border-slate-700/80 px-3 py-1.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.5)] animate-fade-in mt-1 text-slate-200">
        {/* PTT HOLD TO TALK BUTTON */}
        <button
          onMouseDown={(e) => { e.preventDefault(); onPttStart?.(); }}
          onMouseUp={(e) => { e.preventDefault(); onPttEnd?.(); }}
          onMouseLeave={isListening ? (e) => { e.preventDefault(); onPttEnd?.(); } : undefined}
          onTouchStart={(e) => { e.preventDefault(); onPttStart?.(); }}
          onTouchEnd={(e) => { e.preventDefault(); onPttEnd?.(); }}
          className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider select-none transition-all duration-200 flex items-center gap-1.5 h-7 cursor-pointer
            ${isListening
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'}`}
        >
          {isListening && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          {isListening ? 'Listening…' : 'Hold to Talk'}
        </button>

        {/* Keyboard Input Trigger */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleTyping?.(); }}
          className={`p-1.5 rounded-full transition-all cursor-pointer ${
            showTypingInput
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Type query"
        >
          ⌨
        </button>

        {/* Mute Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMute?.(); }}
          className={`p-1.5 rounded-full transition-all cursor-pointer ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Typing input popup when keyboard clicked */}
      {showTypingInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTypingSubmit?.(typingText);
          }}
          className="mt-2 w-72 flex items-center gap-1.5 bg-slate-900/95 dark:bg-[#0B0F19]/95 border border-slate-700/80 rounded-full px-3 py-1.5 shadow-2xl backdrop-blur-xl animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={typingText}
            onChange={(e) => onTypingChange?.(e.target.value)}
            placeholder="Ask Drishti AI..."
            autoFocus
            className="flex-1 text-xs bg-transparent text-white focus:outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-xs font-bold transition-all shadow-xs"
          >
            ↑
          </button>
        </form>
      )}

    </div>
  );
};

export default DrishtiOrb;
