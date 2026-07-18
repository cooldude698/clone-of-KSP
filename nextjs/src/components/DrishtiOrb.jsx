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
    size: "140px",
    compactSize: "60px",
    colors: {
      bg: "#040817", // Deep space navy
      c1: "oklch(60% 0.22 260)", // Vibrant royal blue
      c2: "oklch(55% 0.2 295)",  // Indigo
      c3: "oklch(50% 0.18 325)"  // Deep violet
    },
    animationDuration: 12
  },
  listening: {
    size: "185px",
    compactSize: "60px",
    colors: {
      bg: "#020f13", // Very dark emerald undertone
      c1: "oklch(70% 0.25 140)", // Neon green
      c2: "oklch(76% 0.22 175)", // Glowing mint/emerald
      c3: "oklch(65% 0.2 205)"   // Electric teal
    },
    animationDuration: 4.0
  },
  thinking: {
    size: "160px",
    compactSize: "60px",
    colors: {
      bg: "#0d0a08", // Very dark amber undertone
      c1: "oklch(68% 0.25 45)",  // Neon orange
      c2: "oklch(74% 0.26 75)",  // Bright gold/amber
      c3: "oklch(78% 0.22 95)"   // Bright yellow
    },
    animationDuration: 2.8
  },
  speaking: {
    size: "165px",
    compactSize: "60px",
    colors: {
      bg: "#050718", // Dark navy
      c1: "oklch(70% 0.22 215)", // Electric cyan
      c2: "oklch(62% 0.25 260)", // Ocean blue
      c3: "oklch(68% 0.26 320)"  // Hot magenta/pink
    },
    animationDuration: 5.0
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
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
        {/* Pulse rings for listening state */}
        <div className="relative flex items-center justify-center">
          {state === 'listening' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping" />
              <div className="absolute rounded-full border border-emerald-400/30 animate-ping"
                style={{ inset: '-8px', animationDelay: '0.3s' }} />
            </>
          )}
          {/* Change 4: data-state for breathing animation */}
          <div
            data-state={state}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className={cn(
              "siri-orb cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 relative",
              "shadow-[0_0_20px_rgba(59,130,246,0.25)]",
              state === 'listening' && "shadow-[0_0_24px_rgba(16,185,129,0.5)]",
              state === 'thinking'  && "shadow-[0_0_24px_rgba(245,158,11,0.45)]",
              state === 'speaking'  && "shadow-[0_0_24px_rgba(6,182,212,0.5)]",
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
              .siri-orb[data-state="idle"]::before { animation:rotate var(--animation-duration) linear infinite,breathe 4s ease-in-out infinite; }
              .siri-orb::after { background-image:radial-gradient(circle at center,rgba(255,255,255,0.35) var(--dot-size),transparent var(--dot-size)); background-size:calc(var(--dot-size)*2.5) calc(var(--dot-size)*2.5); backdrop-filter:blur(calc(var(--blur-amount)*1.5)) contrast(calc(var(--contrast-amount)*1.5)); mix-blend-mode:overlay; }
              .siri-orb[style*="--mask-radius: 0%"]::after { mask-image:none; }
              .siri-orb:not([style*="--mask-radius: 0%"])::after { mask-image:radial-gradient(black var(--mask-radius),transparent 75%); }
              @keyframes rotate { to { --angle:360deg; } }
              @keyframes breathe { 0%,100% { opacity:0.75; transform:scale(0.97); } 50% { opacity:1; transform:scale(1.03); } }
              @media (prefers-reduced-motion:reduce) { .siri-orb::before { animation:none; } }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  // Full mode: fixed bottom-right with label
  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-center select-none gap-4">
      {/* Siri Style Orb */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings when listening */}
        {state === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping" />
            <div className="absolute rounded-full border border-emerald-400/30 animate-ping"
              style={{ inset: '-8px', animationDelay: '0.3s' }} />
          </>
        )}
        {/* Change 4: data-state drives breathing CSS */}
        <div
          data-state={state}
          onClick={onClick}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className={cn(
            "siri-orb cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 relative",
            "shadow-[0_0_50px_rgba(59,130,246,0.25)]",
            state === 'listening' && "shadow-[0_0_60px_rgba(16,185,129,0.5)]",
            state === 'thinking'  && "shadow-[0_0_60px_rgba(245,158,11,0.45)]",
            state === 'speaking'  && "shadow-[0_0_60px_rgba(6,182,212,0.5)]",
            className
          )}
          style={{
            /* Change 1: boosted size and speed from audioLevel */
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
            /* Registering custom properties to allow smooth transitions */
            @property --angle {
              syntax: "<angle>";
              inherits: false;
              initial-value: 0deg;
            }

            @property --c1 {
              syntax: "<color>";
              inherits: true;
              initial-value: oklch(60% 0.22 260);
            }

            @property --c2 {
              syntax: "<color>";
              inherits: true;
              initial-value: oklch(55% 0.2 295);
            }

            @property --c3 {
              syntax: "<color>";
              inherits: true;
              initial-value: oklch(50% 0.18 325);
            }

            @property --bg {
              syntax: "<color>";
              inherits: true;
              initial-value: #040817;
            }

            .siri-orb {
              display: grid;
              grid-template-areas: "stack";
              overflow: hidden;
              border-radius: 50%;
              position: relative;
              background: var(--bg);
              /* Change 1: fast size transition for audio reactivity */
              transition:
                --c1 0.8s ease-in-out,
                --c2 0.8s ease-in-out,
                --c3 0.8s ease-in-out,
                --bg 0.8s ease-in-out,
                width 0.08s ease-out,
                height 0.08s ease-out;
            }

            .siri-orb::before,
            .siri-orb::after {
              content: "";
              display: block;
              grid-area: stack;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }

            .siri-orb::before {
              background:
                conic-gradient(
                  from calc(var(--angle) * 2) at 25% 70%,
                  var(--c3),
                  transparent 20% 80%,
                  var(--c3)
                ),
                conic-gradient(
                  from calc(var(--angle) * 2) at 45% 75%,
                  var(--c2),
                  transparent 30% 60%,
                  var(--c2)
                ),
                conic-gradient(
                  from calc(var(--angle) * -3) at 80% 20%,
                  var(--c1),
                  transparent 40% 60%,
                  var(--c1)
                ),
                conic-gradient(
                  from calc(var(--angle) * 2) at 15% 5%,
                  var(--c2),
                  transparent 10% 90%,
                  var(--c2)
                ),
                conic-gradient(
                  from calc(var(--angle) * 1) at 20% 80%,
                  var(--c1),
                  transparent 10% 90%,
                  var(--c1)
                ),
                conic-gradient(
                  from calc(var(--angle) * -2) at 85% 10%,
                  var(--c3),
                  transparent 20% 80%,
                  var(--c3)
                );
              box-shadow: inset var(--bg) 0 0 var(--shadow-spread)
                calc(var(--shadow-spread) * 0.2);
              filter: blur(var(--blur-amount)) contrast(var(--contrast-amount));
              animation: rotate var(--animation-duration) linear infinite;
            }

            /* Change 4: Breathing animation only on idle state */
            .siri-orb[data-state="idle"]::before {
              animation:
                rotate var(--animation-duration) linear infinite,
                breathe 4s ease-in-out infinite;
            }

            .siri-orb::after {
              background-image: radial-gradient(
                circle at center,
                rgba(255, 255, 255, 0.35) var(--dot-size),
                transparent var(--dot-size)
              );
              background-size: calc(var(--dot-size) * 2.5) calc(var(--dot-size) * 2.5);
              backdrop-filter: blur(calc(var(--blur-amount) * 1.5))
                contrast(calc(var(--contrast-amount) * 1.5));
              mix-blend-mode: overlay;
            }

            .siri-orb[style*="--mask-radius: 0%"]::after {
              mask-image: none;
            }

            .siri-orb:not([style*="--mask-radius: 0%"])::after {
              mask-image: radial-gradient(
                black var(--mask-radius),
                transparent 75%
              );
            }

            @keyframes rotate {
              to { --angle: 360deg; }
            }

            /* Change 4: breathe keyframe */
            @keyframes breathe {
              0%, 100% { opacity: 0.75; transform: scale(0.97); }
              50%       { opacity: 1;   transform: scale(1.03); }
            }

            @media (prefers-reduced-motion: reduce) {
              .siri-orb::before {
                animation: none;
              }
            }
          `}</style>
        </div>
      </div>

      {/* Change 5: Sound wave bars when speaking */}
      {state === 'speaking' && (
        <div className="flex items-center justify-center gap-[3px] h-6">
          {[0.4, 0.7, 1.0, 0.85, 0.6, 0.9, 0.5, 0.75, 0.45, 0.8].map((h, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: `${h * 20}px`,
                borderRadius: '2px',
                background: 'rgba(6, 182, 212, 0.7)',
                animation: `soundBar 0.${4 + (i % 4)}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.07}s`,
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

      {/* DRISHTI Labels */}
      <div className="text-center flex flex-col items-center">
        <div className="text-xs font-mono font-bold tracking-[0.25em] text-white/95 drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">
          DRISHTI ದೃಷ್ಟಿ
        </div>
        <div className="text-[9px] uppercase tracking-widest text-white/50 mt-1 font-sans font-medium">
          Karnataka State Police
        </div>
      </div>
    </div>
  );
};

export default DrishtiOrb;
