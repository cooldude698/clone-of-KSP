'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { AgentAudioVisualizerAura } from '@/components/agents-ui/agent-audio-visualizer-aura';
import PoliceIntelligenceRenderer from '@/components/PoliceIntelligenceRenderer';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Exact color and colorShift specifications from user requirements
const AURA_STATE_CONFIG = {
  connecting: {
    color: '#2bff00',
    colorShift: 0.62,
    state: 'connecting',
  },
  listening: {
    color: '#0066ff',
    colorShift: 0.83,
    state: 'listening',
  },
  speaking: {
    color: '#00ff09',
    colorShift: 0.3,
    state: 'speaking',
  },
  thinking: {
    color: '#ff0026',
    colorShift: 0.18,
    state: 'thinking',
  },
  processing: {
    color: '#ff0026',
    colorShift: 0.18,
    state: 'thinking',
  },
  idle: {
    color: '#0066ff',
    colorShift: 0.83,
    state: 'listening',
  },
};

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
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { resolvedTheme } = useTheme();

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

  // Determine current Aura configuration based on effective state
  const effectiveState = isListening ? 'listening' : state;
  const config = AURA_STATE_CONFIG[effectiveState] || AURA_STATE_CONFIG.idle;

  if (!isClient) return null;

  // ── COMPACT MODE (when docked or mini) ──
  if (compact) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95",
          className
        )}
        onClick={handleOrbClick}
      >
        <AgentAudioVisualizerAura
          size="sm"
          color={config.color}
          colorShift={config.colorShift}
          state={config.state}
          themeMode={resolvedTheme === 'light' ? 'light' : 'dark'}
          className="w-14 h-14"
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

      {/* ── LIVE LISTENING & INTELLIGENCE RESPONSE HUD CARD ── */}
      {!isDismissed && (liveTranscript || pendingTranscript || orbResponse) && (
        <div className="w-[340px] sm:w-[420px] max-w-[94vw] rounded-2xl overflow-hidden mb-3 animate-fade-in relative z-20 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(59,130,246,0.18)] border border-slate-700/80 dark:border-blue-500/30">
          {/* Top ambient accent glow line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500" />

          <div
            style={{
              background: 'rgba(11, 15, 25, 0.94)',
              backdropFilter: 'blur(28px)',
            }}
            className="p-4 relative z-10 text-white"
          >
            {/* Live transcript while listening */}
            {liveTranscript && !pendingTranscript && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-bold font-mono">
                      LISTENING TO VOICE…
                    </span>
                  </div>
                  <button
                    onClick={handleDismissBubble}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-all text-xs"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-cyan-100/90 font-mono leading-relaxed">
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
                    <span className="text-[10px] text-blue-300 uppercase tracking-wider font-bold font-mono">
                      VOICE TRANSCRIPT VERIFICATION
                    </span>
                  </div>
                  <button
                    onClick={handleDismissBubble}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-all text-xs"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-blue-500/20 text-xs text-slate-100 font-medium leading-relaxed shadow-inner">
                  &quot;{pendingTranscript}&quot;
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onConfirmSend?.(); }}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Send Query</span>
                    <span className="text-[10px] opacity-75 font-mono px-1 py-0.2 bg-black/25 rounded">↵</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onCancelTranscript?.(); }}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer"
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
                    <div className="w-5 h-5 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-[10px] shrink-0">
                      🛡️
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold tracking-wider text-slate-100 uppercase">
                        DRISHTI INTEL HUD
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {onReadAloud && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReadAloud(); }}
                        className="text-slate-400 hover:text-cyan-300 hover:bg-slate-800 px-2 py-1 rounded-lg cursor-pointer transition-all text-xs flex items-center gap-1 font-mono"
                        title="Read Aloud"
                      >
                        🔊 Listen
                      </button>
                    )}
                    {onOpenPanel && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenPanel(); }}
                        className="text-slate-400 hover:text-cyan-300 hover:bg-slate-800 px-2 py-1 rounded-lg cursor-pointer transition-all text-xs font-mono"
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
                  <PoliceIntelligenceRenderer text={orbResponse} isDark={true} mode="bubble" />
                </div>

                {/* Tactical Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>KSP CCTNS v4.2 • Grid Synced</span>
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined') {
                        navigator.clipboard.writeText(orbResponse);
                      }
                    }}
                    className="hover:text-cyan-300 cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    📋 Copy Brief
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AURA AUDIO VISUALIZER ── */}
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
        <AgentAudioVisualizerAura
          size="lg"
          color={config.color}
          colorShift={config.colorShift}
          state={config.state}
          themeMode={resolvedTheme === 'light' ? 'light' : 'dark'}
          className="w-full h-full"
        />
      </div>

      {/* ── FLOATING CONTROLS PILL ── */}
      <div className="flex items-center gap-2 bg-[#EDE4D5]/98 dark:bg-[#231F1A]/95 backdrop-blur-xl border border-[#D8C9B4] dark:border-[#42392E] px-3 py-1.5 rounded-full shadow-[0_10px_35px_rgba(140,115,85,0.22)] animate-fade-in mt-1">
        {/* PTT HOLD TO TALK BUTTON */}
        <button
          onMouseDown={(e) => { e.preventDefault(); onPttStart?.(); }}
          onMouseUp={(e) => { e.preventDefault(); onPttEnd?.(); }}
          onMouseLeave={isListening ? (e) => { e.preventDefault(); onPttEnd?.(); } : undefined}
          onTouchStart={(e) => { e.preventDefault(); onPttStart?.(); }}
          onTouchEnd={(e) => { e.preventDefault(); onPttEnd?.(); }}
          className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider select-none transition-all duration-200 flex items-center gap-1.5 h-7 cursor-pointer
            ${isListening
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'bg-[#DFD2BF] dark:bg-[#342D24] hover:bg-[#D4C3AC] dark:hover:bg-[#433B30] text-[#3B2F23] dark:text-[#EFE6D8] border border-[#CBB9A0] dark:border-[#4D4235]'}`}
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
              : 'text-[#665440] hover:text-[#251D14] dark:text-[#D1C2AF] dark:hover:text-white hover:bg-[#DFD2BF] dark:hover:bg-[#342D24]'
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
              ? 'bg-rose-500/20 text-rose-500'
              : 'text-[#665440] hover:text-[#251D14] dark:text-[#D1C2AF] dark:hover:text-white hover:bg-[#DFD2BF] dark:hover:bg-[#342D24]'
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
          className="mt-2 w-72 flex items-center gap-1.5 bg-[#EDE4D5] dark:bg-[#231F1A] border border-[#D8C9B4] dark:border-[#42392E] rounded-full px-3 py-1.5 shadow-[0_10px_35px_rgba(140,115,85,0.22)] animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={typingText}
            onChange={(e) => onTypingChange?.(e.target.value)}
            placeholder="Ask Drishti AI..."
            autoFocus
            className="flex-1 text-xs bg-transparent text-[#251D14] dark:text-white focus:outline-none placeholder:text-[#8C7A68]"
          />
          <button
            type="submit"
            className="w-6 h-6 rounded-full bg-[#3B2F23] dark:bg-[#DFD2BF] text-[#EDE4D5] dark:text-[#231F1A] flex items-center justify-center text-xs font-bold hover:opacity-80"
          >
            ↑
          </button>
        </form>
      )}

    </div>
  );
};

export default DrishtiOrb;
