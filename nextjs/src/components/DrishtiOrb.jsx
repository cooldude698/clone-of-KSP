'use client';

import React, { useEffect, useState } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Thresholds for responsiveness
const SIZE_THRESHOLD_SMALL = 50;
const SIZE_THRESHOLD_TINY = 30;
const SIZE_THRESHOLD_MEDIUM = 100;

// Balanced blur and contrast multipliers for high-quality organic color fusion
const BLUR_MULTIPLIER_SMALL = 0.03;
const BLUR_MIN_SMALL = 2;
const BLUR_MULTIPLIER_LARGE = 0.07; // ~12px blur for 180px size - perfect liquid blending
const BLUR_MIN_LARGE = 8;

const CONTRAST_MULTIPLIER_SMALL = 0.01;
const CONTRAST_MIN_SMALL = 1.2;
const CONTRAST_MULTIPLIER_LARGE = 0.018; // Sharp but smooth boundary
const CONTRAST_MIN_LARGE = 2.4;

const DOT_SIZE_MULTIPLIER_SMALL = 0.003;
const DOT_SIZE_MIN_SMALL = 0.04;
const DOT_SIZE_MULTIPLIER_LARGE = 0.006;
const DOT_SIZE_MIN_LARGE = 0.08;

const SHADOW_MULTIPLIER_SMALL = 0.02;
const SHADOW_MIN_SMALL = 2;
const SHADOW_MULTIPLIER_LARGE = 0.04;
const SHADOW_MIN_LARGE = 8;

const MASK_RADIUS_TINY = "0%";
const MASK_RADIUS_SMALL = "10%";
const MASK_RADIUS_MEDIUM = "20%";
const MASK_RADIUS_LARGE = "30%";

const CONTRAST_TINY = 1.2;
const CONTRAST_MULTIPLIER_FINAL = 1.3;
const CONTRAST_MIN_FINAL = 1.5;

// Deep space background with high-vibrancy neon colors for maximum color fusion
const STATE_MAPPING = {
  idle: {
    size: "105px",
    compactSize: "45px",
    colors: {
      bg: "#040817",
      c1: "oklch(60% 0.22 260)",
      c2: "oklch(55% 0.2 295)",
      c3: "oklch(50% 0.18 325)"
    },
    animationDuration: 12,
    glowColor: 'rgba(99, 102, 241, 0.22)',
  },
  listening: {
    size: "138px",
    compactSize: "45px",
    colors: {
      bg: "#020f13",
      c1: "oklch(70% 0.25 140)",
      c2: "oklch(76% 0.22 175)",
      c3: "oklch(65% 0.2 205)"
    },
    animationDuration: 4.0,
    glowColor: 'rgba(16, 185, 129, 0.32)',
  },
  thinking: {
    size: "120px",
    compactSize: "45px",
    colors: {
      bg: "#0d0a08",
      c1: "oklch(68% 0.25 45)",
      c2: "oklch(74% 0.26 75)",
      c3: "oklch(78% 0.22 95)"
    },
    animationDuration: 2.8,
    glowColor: 'rgba(251, 191, 36, 0.24)',
  },
  speaking: {
    size: "124px",
    compactSize: "45px",
    colors: {
      bg: "#050718",
      c1: "oklch(70% 0.22 215)",
      c2: "oklch(62% 0.25 260)",
      c3: "oklch(68% 0.26 320)"
    },
    animationDuration: 5.0,
    glowColor: 'rgba(34, 211, 238, 0.26)',
  }
};

const DrishtiOrb = ({
  state = 'idle',
  onClick,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  className,
  /** compact: when true renders at 60px with no label text (used when panel is open) */
  compact = false,
  /** audioLevel: 0–1, drives reactive size and speed boost */
  audioLevel = 0,
  // NEW props:
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
  isMuted = false,
  onToggleMute,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0 });
  const activePosition = React.useRef({ x: 0, y: 0 });
  const currentPos = React.useRef({ x: 0, y: 0 });
  const hasMoved = React.useRef(false);

  // Mouse drag handlers
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
      x: e.clientX,
      y: e.clientY
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMoved.current = true;
    }
    currentPos.current = {
      x: activePosition.current.x + dx,
      y: activePosition.current.y + dy
    };
    setPosition(currentPos.current);
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      activePosition.current = currentPos.current;
      isDragging.current = false;
      setPosition({ ...activePosition.current });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('drishti_orb_position', JSON.stringify(activePosition.current));
      }
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Touch drag handlers
  const handleTouchStart = (e) => {
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
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMoved.current = true;
    }
    currentPos.current = {
      x: activePosition.current.x + dx,
      y: activePosition.current.y + dy
    };
    setPosition(currentPos.current);
  };

  const handleTouchEnd = () => {
    if (isDragging.current) {
      activePosition.current = currentPos.current;
      isDragging.current = false;
      setPosition({ ...activePosition.current });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('drishti_orb_position', JSON.stringify(activePosition.current));
      }
    }
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  };

  const handleOrbClick = (e) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('drishti_orb_position');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Safety check: ensure coordinates are within current viewport bounds
          const maxWidth = window.innerWidth || 1200;
          const maxHeight = window.innerHeight || 800;
          if (
            parsed &&
            typeof parsed.x === 'number' &&
            typeof parsed.y === 'number' &&
            Math.abs(parsed.x) < maxWidth &&
            Math.abs(parsed.y) < maxHeight
          ) {
            setPosition(parsed);
            activePosition.current = parsed;
            currentPos.current = parsed;
          } else {
            sessionStorage.removeItem('drishti_orb_position');
            setPosition({ x: 0, y: 0 });
          }
        } catch (err) {
          sessionStorage.removeItem('drishti_orb_position');
          setPosition({ x: 0, y: 0 });
        }
      }
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  if (!isClient) return null;

  const currentConfig = STATE_MAPPING[state] || STATE_MAPPING.idle;
  const { colors, animationDuration } = currentConfig;

  // Use compact size (60px) when compact mode; otherwise the state-based size
  const size = compact ? currentConfig.compactSize : currentConfig.size;
  const sizeValue = Number.parseInt(size.replace("px", ""), 10);

  // Change 1: audio-reactive boost
  const boost = 1 + (audioLevel * 0.35);
  const boostedSize = `${sizeValue * boost}px`;
  const boostedDuration = animationDuration / (1 + audioLevel * 1.5);

  // Responsive calculations based on size
  const blurAmount =
    sizeValue < SIZE_THRESHOLD_SMALL
      ? Math.max(sizeValue * BLUR_MULTIPLIER_SMALL, BLUR_MIN_SMALL)
      : Math.max(sizeValue * BLUR_MULTIPLIER_LARGE, BLUR_MIN_LARGE);

  const contrastAmount =
    sizeValue < SIZE_THRESHOLD_SMALL
      ? Math.max(sizeValue * CONTRAST_MULTIPLIER_SMALL, CONTRAST_MIN_SMALL)
      : Math.max(sizeValue * CONTRAST_MULTIPLIER_LARGE, CONTRAST_MIN_LARGE);

  const dotSize =
    sizeValue < SIZE_THRESHOLD_SMALL
      ? Math.max(sizeValue * DOT_SIZE_MULTIPLIER_SMALL, DOT_SIZE_MIN_SMALL)
      : Math.max(sizeValue * DOT_SIZE_MULTIPLIER_LARGE, DOT_SIZE_MIN_LARGE);

  const shadowSpread =
    sizeValue < SIZE_THRESHOLD_SMALL
      ? Math.max(sizeValue * SHADOW_MULTIPLIER_SMALL, SHADOW_MIN_SMALL)
      : Math.max(sizeValue * SHADOW_MULTIPLIER_LARGE, SHADOW_MIN_LARGE);

  const getMaskRadius = (value) => {
    if (value < SIZE_THRESHOLD_TINY) return MASK_RADIUS_TINY;
    if (value < SIZE_THRESHOLD_SMALL) return MASK_RADIUS_SMALL;
    if (value < SIZE_THRESHOLD_MEDIUM) return MASK_RADIUS_MEDIUM;
    return MASK_RADIUS_LARGE;
  };

  const maskRadius = getMaskRadius(sizeValue);

  const getFinalContrast = (value) => {
    if (value < SIZE_THRESHOLD_TINY) return CONTRAST_TINY;
    if (value < SIZE_THRESHOLD_SMALL) {
      return Math.max(
        contrastAmount * CONTRAST_MULTIPLIER_FINAL,
        CONTRAST_MIN_FINAL
      );
    }
    return contrastAmount;
  };

  const finalContrast = getFinalContrast(sizeValue);

  // Compact mode: inline element (no fixed positioning), no label
  if (compact) {
    return (
      <div className={cn("flex flex-col items-center select-none", className)}>
        <div className="relative flex items-center justify-center">

          {/* Outer ambient glow halo */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: '-14px',
              background: `radial-gradient(circle, ${currentConfig.glowColor || 'rgba(99,102,241,0.15)'} 0%, transparent 72%)`,
              animation: state === 'idle'
                ? 'orbHaloBreath 2.5s ease-in-out infinite'
                : state === 'listening'
                ? 'orbHaloBreath 0.85s ease-in-out infinite'
                : state === 'speaking'
                ? 'orbHaloBreath 1.4s ease-in-out infinite'
                : 'orbHaloBreath 1.8s ease-in-out infinite alternate',
            }}
          />

          {/* 3 fast listening rings */}
          {state === 'listening' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/70"
                style={{ animation: 'fastPing 0.85s cubic-bezier(0,0,0.2,1) infinite' }} />
              <div className="absolute rounded-full border border-emerald-400/40"
                style={{ inset: '-8px', animation: 'fastPing 0.85s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.28s' }} />
              <div className="absolute rounded-full border border-emerald-300/20"
                style={{ inset: '-16px', animation: 'fastPing 0.85s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.56s' }} />
            </>
          )}

          {/* Thinking — rotating orbit ring */}
          {state === 'thinking' && (
            <div className="absolute rounded-full border-2 border-amber-400/30 border-t-amber-400"
              style={{ inset: '-6px', animation: 'spin 1.1s linear infinite' }} />
          )}

          <div
            data-state={state}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className={cn(
              "siri-orb cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 relative shadow-xl shadow-black/20"
            )}
            style={{
              width: boostedSize,
              height: boostedSize,
              "--bg": colors.bg,
              "--c1": colors.c1,
              "--c2": colors.c2,
              "--c3": colors.c3,
              "--animation-duration": `${boostedDuration}s`,
              "--blur-amount": `${blurAmount}px`,
              "--contrast-amount": finalContrast,
              "--dot-size": `${dotSize}px`,
              "--shadow-spread": `${shadowSpread}px`,
              "--mask-radius": maskRadius,
            }}
          >
            <style>{`
              @property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
              @property --c1 { syntax: "<color>"; inherits: true; initial-value: oklch(60% 0.22 260); }
              @property --c2 { syntax: "<color>"; inherits: true; initial-value: oklch(55% 0.2 295); }
              @property --c3 { syntax: "<color>"; inherits: true; initial-value: oklch(50% 0.18 325); }
              @property --bg { syntax: "<color>"; inherits: true; initial-value: #040817; }
              .siri-orb { display:grid; grid-template-areas:"stack"; overflow:hidden; border-radius:50%; position:relative; background:var(--bg); transition:--c1 0.8s ease-in-out,--c2 0.8s ease-in-out,--c3 0.8s ease-in-out,--bg 0.8s ease-in-out,width 0.08s ease-out,height 0.08s ease-out; }
              .siri-orb::before,.siri-orb::after { content:""; display:block; grid-area:stack; width:100%; height:100%; border-radius:50%; }
              .siri-orb::before { background: conic-gradient(from calc(var(--angle)*2) at 25% 70%,var(--c3),transparent 20% 80%,var(--c3)),conic-gradient(from calc(var(--angle)*2) at 45% 75%,var(--c2),transparent 30% 60%,var(--c2)),conic-gradient(from calc(var(--angle)*-3) at 80% 20%,var(--c1),transparent 40% 60%,var(--c1)),conic-gradient(from calc(var(--angle)*2) at 15% 5%,var(--c2),transparent 10% 90%,var(--c2)),conic-gradient(from calc(var(--angle)*1) at 20% 80%,var(--c1),transparent 10% 90%,var(--c1)),conic-gradient(from calc(var(--angle)*-2) at 85% 10%,var(--c3),transparent 20% 80%,var(--c3)); box-shadow:inset var(--bg) 0 0 var(--shadow-spread) calc(var(--shadow-spread)*0.2); filter:blur(var(--blur-amount)) contrast(var(--contrast-amount)); animation:rotate var(--animation-duration) linear infinite; }
              .siri-orb[data-state="idle"]::before { animation:rotate var(--animation-duration) linear infinite,breathe 2.5s ease-in-out infinite; }
              .siri-orb::after { background-image:radial-gradient(circle at center,rgba(255,255,255,0.35) var(--dot-size),transparent var(--dot-size)); background-size:calc(var(--dot-size)*2.5) calc(var(--dot-size)*2.5); backdrop-filter:blur(calc(var(--blur-amount)*1.5)) contrast(calc(var(--contrast-amount)*1.5)); mix-blend-mode:overlay; }
              .siri-orb[style*="--mask-radius: 0%"]::after { mask-image:none; }
              .siri-orb:not([style*="--mask-radius: 0%"])::after { mask-image:radial-gradient(black var(--mask-radius),transparent 75%); }
              @keyframes rotate { to { --angle:360deg; } }
              @keyframes breathe { 0%,100% { opacity:0.7; transform:scale(0.94); } 50% { opacity:1; transform:scale(1.06); } }
              @keyframes orbHaloBreath { 0%,100% { opacity:0.35; transform:scale(0.85); } 50% { opacity:1; transform:scale(1.15); } }
              @keyframes fastPing { 0% { transform:scale(1); opacity:0.9; } 100% { transform:scale(2.6); opacity:0; } }
              @keyframes spin { to { transform:rotate(360deg); } }
              @media (prefers-reduced-motion:reduce) { .siri-orb::before { animation:none; } }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  // Full mode: fixed bottom-right with label
  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        "fixed bottom-16 right-8 z-[9999] flex flex-col items-center select-none gap-2.5 cursor-grab",
        isDragging.current && "cursor-grabbing"
      )}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none'
      }}
    >

      {/* ── TRANSCRIPT / RESPONSE BUBBLE — appears above orb ── */}
      {(liveTranscript || pendingTranscript || orbResponse) && (
        <div className="w-64 rounded-2xl overflow-hidden mb-1.5 animate-fade-in shadow-2xl relative">
          {/* subtle glow behind bubble */}
          <div className="absolute inset-0 bg-white/5 blur-xl pointer-events-none" />
          <div
            style={{
              background: 'rgba(5, 5, 5, 0.65)',
              backdropFilter: 'blur(24px)',
            }}
            className="px-5 py-4 border border-white/10 rounded-2xl relative z-10"
          >
            {/* Live transcript while listening */}
            {liveTranscript && !pendingTranscript && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold font-mono">
                    Listening
                  </span>
                </div>
                <p className="text-white/75 text-sm leading-relaxed italic">
                  {liveTranscript}
                </p>
              </div>
            )}

            {/* Pending transcript — waiting for user to confirm */}
            {pendingTranscript && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold font-mono">
                    Ready to send
                  </span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-3">
                  {pendingTranscript}
                </p>
                {/* Confirm / Cancel buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={onConfirmSend}
                    className="flex-1 py-2 rounded-xl bg-white text-black text-[10px] uppercase font-bold tracking-widest transition-all hover:bg-white/90 flex items-center justify-center gap-2"
                  >
                    <span>Send</span>
                    <span className="opacity-40 text-xs">↵</span>
                  </button>
                  <button
                    onClick={onCancelTranscript}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Orb response — shown after AI replies, when no pending transcript */}
            {orbResponse && !pendingTranscript && !liveTranscript && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold font-mono">
                      Drishti
                    </span>
                  </div>
                  {onReadAloud && (
                    <button
                      onClick={onReadAloud}
                      className="text-white/40 hover:text-white transition-colors flex items-center justify-center p-1 rounded-full hover:bg-white/10"
                      title="Read Aloud"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                    </button>
                  )}
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {orbResponse.length > 180 ? orbResponse.slice(0, 180) + '…' : orbResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TYPING INPUT — appears above orb when showTypingInput is true ── */}
      {showTypingInput && (
        <div
          style={{
            background: 'rgba(5, 5, 5, 0.7)',
            backdropFilter: 'blur(24px)',
          }}
          className="w-64 rounded-2xl border border-white/10 shadow-2xl px-3 py-2 flex items-center gap-2 mb-1.5 animate-fade-in"
        >
          <input
            autoFocus
            type="text"
            value={typingText}
            onChange={e => onTypingChange?.(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && typingText.trim()) {
                e.preventDefault();
                onTypingSubmit?.();
              }
              if (e.key === 'Escape') onToggleTyping?.();
            }}
            placeholder="TYPE QUERY..."
            className="flex-1 bg-transparent text-white text-[11px] tracking-widest placeholder-white/20 outline-none uppercase font-mono"
          />
          <button
            onClick={() => typingText.trim() && onTypingSubmit?.()}
            disabled={!typingText.trim()}
            className="w-8 h-8 rounded-full bg-white hover:bg-white/90 disabled:opacity-20 disabled:bg-white/10 disabled:text-white text-black flex items-center justify-center transition-all flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── ORB CONTAINER ── */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Outer ambient glow halo — the heartbeat */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: state === 'idle' ? '-24px' : '-16px',
            background: `radial-gradient(circle, ${currentConfig.glowColor || 'rgba(99,102,241,0.15)'} 0%, transparent 68%)`,
            animation: state === 'idle'
              ? 'orbHaloBreath 2.5s ease-in-out infinite'
              : state === 'listening'
              ? 'orbHaloBreath 0.85s ease-in-out infinite'
              : state === 'speaking'
              ? 'orbHaloBreath 1.4s ease-in-out infinite'
              : 'orbHaloBreath 1.8s ease-in-out infinite alternate',
            opacity: state === 'idle' ? 0.8 : 1,
          }}
        />

        {/* 3 fast-ping listening rings */}
        {state === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/80"
              style={{ animation: 'fastPing 0.85s cubic-bezier(0,0,0.2,1) infinite' }} />
            <div className="absolute rounded-full border-2 border-emerald-400/50"
              style={{ inset: '-9px', animation: 'fastPing 0.85s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.28s' }} />
            <div className="absolute rounded-full border border-emerald-300/25"
              style={{ inset: '-18px', animation: 'fastPing 0.85s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.56s' }} />
          </>
        )}

        {/* Thinking — spinning orbit ring */}
        {state === 'thinking' && (
          <div className="absolute rounded-full border-2 border-amber-400/30 border-t-amber-400"
            style={{ inset: '-8px', animation: 'spin 1.1s linear infinite' }} />
        )}

        {/* The Actual Orb */}
        <div
          data-state={state}
          onClick={handleOrbClick}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className={cn(
            "siri-orb cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 relative shadow-2xl shadow-black/40",
            className
          )}
          style={{
            width: boostedSize,
            height: boostedSize,
            "--bg": colors.bg,
            "--c1": colors.c1,
            "--c2": colors.c2,
            "--c3": colors.c3,
            "--animation-duration": `${boostedDuration}s`,
            "--blur-amount": `${blurAmount}px`,
            "--contrast-amount": finalContrast,
            "--dot-size": `${dotSize}px`,
            "--shadow-spread": `${shadowSpread}px`,
            "--mask-radius": maskRadius,
          }}
        >
          <style>{`
            @property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
            @property --c1 { syntax: "<color>"; inherits: true; initial-value: oklch(60% 0.22 260); }
            @property --c2 { syntax: "<color>"; inherits: true; initial-value: oklch(55% 0.2 295); }
            @property --c3 { syntax: "<color>"; inherits: true; initial-value: oklch(50% 0.18 325); }
            @property --bg { syntax: "<color>"; inherits: true; initial-value: #040817; }
            .siri-orb { display:grid; grid-template-areas:"stack"; overflow:hidden; border-radius:50%; position:relative; background:var(--bg); transition:--c1 0.8s ease-in-out,--c2 0.8s ease-in-out,--c3 0.8s ease-in-out,--bg 0.8s ease-in-out,width 0.08s ease-out,height 0.08s ease-out; }
            .siri-orb::before,.siri-orb::after { content:""; display:block; grid-area:stack; width:100%; height:100%; border-radius:50%; }
            .siri-orb::before { background: conic-gradient(from calc(var(--angle)*2) at 25% 70%,var(--c3),transparent 20% 80%,var(--c3)),conic-gradient(from calc(var(--angle)*2) at 45% 75%,var(--c2),transparent 30% 60%,var(--c2)),conic-gradient(from calc(var(--angle)*-3) at 80% 20%,var(--c1),transparent 40% 60%,var(--c1)),conic-gradient(from calc(var(--angle)*2) at 15% 5%,var(--c2),transparent 10% 90%,var(--c2)),conic-gradient(from calc(var(--angle)*1) at 20% 80%,var(--c1),transparent 10% 90%,var(--c1)),conic-gradient(from calc(var(--angle)*-2) at 85% 10%,var(--c3),transparent 20% 80%,var(--c3)); box-shadow:inset var(--bg) 0 0 var(--shadow-spread) calc(var(--shadow-spread)*0.2); filter:blur(var(--blur-amount)) contrast(var(--contrast-amount)); animation:rotate var(--animation-duration) linear infinite; }
            .siri-orb[data-state="idle"]::before { animation:rotate var(--animation-duration) linear infinite,breathe 2.5s ease-in-out infinite; }
            .siri-orb::after { background-image:radial-gradient(circle at center,rgba(255,255,255,0.35) var(--dot-size),transparent var(--dot-size)); background-size:calc(var(--dot-size)*2.5) calc(var(--dot-size)*2.5); backdrop-filter:blur(calc(var(--blur-amount)*1.5)) contrast(calc(var(--contrast-amount)*1.5)); mix-blend-mode:overlay; }
            .siri-orb[style*="--mask-radius: 0%"]::after { mask-image:none; }
            .siri-orb:not([style*="--mask-radius: 0%"])::after { mask-image:radial-gradient(black var(--mask-radius),transparent 75%); }
            @keyframes rotate { to { --angle:360deg; } }
            @keyframes breathe { 0%,100% { opacity:0.7; transform:scale(0.94); } 50% { opacity:1; transform:scale(1.06); } }
            @keyframes orbHaloBreath { 0%,100% { opacity:0.35; transform:scale(0.85); } 50% { opacity:1; transform:scale(1.16); } }
            @keyframes fastPing { 0% { transform:scale(1); opacity:0.9; } 100% { transform:scale(2.6); opacity:0; } }
            @keyframes spin { to { transform:rotate(360deg); } }
            @media (prefers-reduced-motion:reduce) { .siri-orb::before { animation:none; } }
          `}</style>
        </div>
      </div>

      {/* ── SOUND WAVE BARS ── */}
      {state === 'speaking' && (
        <div className="flex items-center justify-center gap-[3px] h-6 my-1.5">
          {[0.4, 0.7, 1.0, 0.85, 0.6, 0.9, 0.5, 0.75, 0.45, 0.8].map((h, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: `${(h + audioLevel * 0.5) * 16}px`,
                borderRadius: '2px',
                background: `rgba(6, 182, 212, ${0.5 + audioLevel * 0.5})`,
                animation: `soundBar 0.${4 + (i % 4)}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.07}s`,
                transition: 'height 0.08s ease-out',
              }}
            />
          ))}
          <style>{`
            @keyframes soundBar {
              from { transform: scaleY(0.3); opacity: 0.5; }
              to   { transform: scaleY(1.0); opacity: 1.0; }
            }
          `}</style>
        </div>
      )}

      {/* ── DISTINCT FLOATING CONTROLS PILL — stacked vertically below orb ── */}
      <div className="flex items-center gap-2 bg-[#050914]/85 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full shadow-2xl animate-fade-in mt-1.5">
        {/* PTT BUTTON */}
        <button
          onMouseDown={(e) => { e.preventDefault(); onPttStart?.(); }}
          onMouseUp={(e) => { e.preventDefault(); onPttEnd?.(); }}
          onMouseLeave={isListening ? (e) => { e.preventDefault(); onPttEnd?.(); } : undefined}
          onTouchStart={(e) => { e.preventDefault(); onPttStart?.(); }}
          onTouchEnd={(e) => { e.preventDefault(); onPttEnd?.(); }}
          className={`px-4 py-2 rounded-full text-[9px] uppercase font-bold tracking-[0.2em] select-none transition-all duration-300 flex items-center gap-1.5 h-8
            ${isListening
              ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
              : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/15'}`}
        >
          {isListening && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          {isListening ? 'LISTENING…' : 'HOLD TO TALK'}
        </button>

        {/* TYPE INSTEAD BUTTON */}
        <button
          onClick={onToggleTyping}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300
            ${showTypingInput
              ? 'bg-white text-black border-transparent shadow-[0_0_12px_rgba(255,255,255,0.2)]'
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/15'}`}
          title="Type text message"
        >
          {showTypingInput ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16v10H4z"/><path d="M8 11h.01"/><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M7 14h10"/></svg>
          )}
        </button>

        {/* PERMANENT MUTE BUTTON */}
        <button
          onClick={onToggleMute}
          className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-all duration-300
            ${isMuted
              ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/15'}`}
          title={isMuted ? "Unmute Spoken Audio (Alt+M)" : "Permanently Mute Spoken Audio (Alt+M)"}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
};

export default DrishtiOrb;
