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
  suggestions = [],
  onSelectSuggestion,
  isSpeaking = false,
  onStopSpeaking,
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

      {/* ── LIVE LISTENING & INTELLIGENCE RESPONSE HUD CARD (Beige Luxury Theme) ── */}
      {!isDismissed && (liveTranscript || pendingTranscript || orbResponse) && (
        <div className="w-[340px] sm:w-[430px] max-w-[94vw] rounded-2xl overflow-hidden mb-3 animate-fade-in relative z-20 shadow-[0_25px_60px_rgba(40,30,20,0.35),0_0_35px_rgba(217,119,6,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(217,119,6,0.18)] border border-[#DFD6C7] dark:border-[#3D362D]">
          {/* Top ambient amber accent line */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-600" />

          <div
            style={{
              background: 'rgba(253, 251, 247, 0.97)',
              backdropFilter: 'blur(30px)',
            }}
            className="p-4 relative z-10 text-[#28211A] dark:!bg-[#181512]/98 dark:!text-[#FAF6F0]"
          >
            {/* Live transcript while listening */}
            {liveTranscript && !pendingTranscript && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase tracking-widest font-bold font-mono">
                      LISTENING TO VOICE…
                    </span>
                  </div>
                  <button
                    onClick={handleDismissBubble}
                    className="text-[#7A6E60] hover:text-[#28211A] dark:text-[#A89C8D] dark:hover:text-white hover:bg-amber-500/15 p-1 rounded-lg transition-all text-xs cursor-pointer"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-3 bg-[#F2ECE1] dark:bg-[#221E1A] rounded-xl border border-[#DFD6C7] dark:border-[#352F28] text-xs text-amber-950 dark:text-amber-100 font-mono leading-relaxed">
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
                    <span className="text-[10px] text-amber-850 dark:text-amber-300 uppercase tracking-wider font-bold font-mono">
                      VOICE TRANSCRIPT VERIFICATION
                    </span>
                  </div>
                  <button
                    onClick={handleDismissBubble}
                    className="text-[#7A6E60] hover:text-[#28211A] dark:text-[#A89C8D] dark:hover:text-white hover:bg-amber-500/15 p-1 rounded-lg transition-all text-xs cursor-pointer"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-[#FAF7F2] dark:bg-[#201C18] rounded-xl border border-amber-500/30 text-xs text-[#28211A] dark:text-[#FAF6F0] font-medium leading-relaxed shadow-inner">
                  &quot;{pendingTranscript}&quot;
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onConfirmSend?.(); }}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-amber-600/25 flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Send Query</span>
                    <span className="text-[10px] opacity-80 font-mono px-1 py-0.2 bg-black/20 rounded">↵</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onCancelTranscript?.(); }}
                    className="py-2 px-3.5 bg-[#E5DED2] dark:bg-[#2E2822] hover:bg-[#DCD4C5] text-[#5A4E40] dark:text-[#C5B8A5] hover:text-[#28211A] dark:hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer"
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
                <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD0] dark:border-[#2D2721]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[10px] shrink-0 text-amber-800 dark:text-amber-200">
                      🛡️
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold tracking-wider text-[#28211A] dark:text-[#FAF6F0] uppercase">
                        DRISHTI INTEL HUD
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[9px] font-mono text-amber-800 dark:text-amber-300 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isSpeaking ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onStopSpeaking?.(); }}
                        className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-white hover:bg-red-500/25 bg-red-500/15 border border-red-500/40 px-2.5 py-1 rounded-lg cursor-pointer transition-all text-xs flex items-center gap-1.5 font-mono font-bold animate-pulse shadow-xs"
                        title="Stop audio speech immediately"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span>Stop Audio</span>
                      </button>
                    ) : onReadAloud ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReadAloud(); }}
                        className="text-[#5A4E40] dark:text-[#C5B8A5] hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-500/15 bg-[#EFE9DE] dark:bg-[#25201B] border border-[#DDD4C5] dark:border-[#352F28] px-2 py-1 rounded-lg cursor-pointer transition-all text-xs flex items-center gap-1 font-mono"
                        title="Read Aloud"
                      >
                        🔊 Listen
                      </button>
                    ) : null}
                    {onOpenPanel && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenPanel(); }}
                        className="text-[#5A4E40] dark:text-[#C5B8A5] hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-500/15 bg-[#EFE9DE] dark:bg-[#25201B] border border-[#DDD4C5] dark:border-[#352F28] px-2 py-1 rounded-lg cursor-pointer transition-all text-xs font-mono"
                        title="Open Full Copilot Workspace"
                      >
                        ↗ Panel
                      </button>
                    )}
                    <button
                      onClick={handleDismissBubble}
                      className="text-[#7A6E60] hover:text-[#28211A] dark:text-[#A89C8D] dark:hover:text-white hover:bg-amber-500/15 p-1 rounded-lg cursor-pointer transition-all text-xs ml-0.5"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Render Rich Intelligence Response in Beige Luxury Theme */}
                <div className="max-h-80 overflow-y-auto drishti-scrollbar pr-1">
                  <PoliceIntelligenceRenderer text={orbResponse} isDark={true} theme="beige" mode="bubble" />
                </div>

                {/* Interactive Recommended Queries (Clean 2-Column Grid) */}
                {suggestions && suggestions.length > 0 && (
                  <div className="pt-2.5 border-t border-[#E8DFD0] dark:border-[#2D2721] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#7A6E60] dark:text-[#A89C8D] font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="text-amber-600 dark:text-amber-400">⚡</span>
                        <span>Recommended Next Inquiries</span>
                      </span>
                      <span className="text-[9px] font-medium text-amber-800/70 dark:text-amber-300/70">Click to ask</span>
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
                            className="group relative flex items-center gap-2 p-2 rounded-xl text-left bg-[#F4EDE2] hover:bg-[#ECE3D4] dark:bg-[#201C17] dark:hover:bg-[#2A241E] border border-[#DDD3C0] hover:border-amber-500/50 dark:border-[#383126] dark:hover:border-amber-500/40 transition-all cursor-pointer shadow-2xs active:scale-[0.98] overflow-hidden"
                            title={sug}
                          >
                            <span className="w-5 h-5 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-[10px] shrink-0 text-amber-800 dark:text-amber-200">
                              {icon}
                            </span>
                            <span className="text-[11px] font-semibold text-[#2C231A] dark:text-[#FAF6F0] line-clamp-1 leading-tight flex-1">
                              {sug}
                            </span>
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tactical Footer */}
                <div className="pt-2 border-t border-[#E8DFD0] dark:border-[#2D2721] flex items-center justify-between text-[10px] text-[#7A6E60] dark:text-[#A89C8D] font-mono">
                  <span>KSP CCTNS v4.2 • Grid Synced</span>
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined') {
                        navigator.clipboard.writeText(orbResponse);
                      }
                    }}
                    className="hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer flex items-center gap-1 transition-colors font-medium"
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
