'use client';

import React from 'react';
import Link from 'next/link';

/**
 * DrishtiLogo — Concept B: Fluid Cyber Eye 'D' Monogram
 * 
 * Features:
 * - Continuous aerodynamic obsidian 'D' ribbon with glowing sapphire rim
 * - Visionary precision optical iris core
 * - Sleek typography with Kannada accent & Karnataka State Police branding
 */
export function DrishtiLogo({
  variant = 'compact',
  size = 'md',
  href,
  className = '',
}) {
  const SIZES = {
    sm: { icon: 'w-8 h-8 rounded-xl', title: 'text-sm', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10 rounded-xl', title: 'text-base', sub: 'text-[11px]' },
    lg: { icon: 'w-12 h-12 rounded-2xl', title: 'text-lg', sub: 'text-xs' },
  };

  const currentSize = SIZES[size] || SIZES.md;

  const EmblemIcon = (
    <div className={`relative flex items-center justify-center flex-shrink-0 bg-[#0B0F19] border border-slate-800 shadow-md ${currentSize.icon}`}>
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full p-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dlbRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="35%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="dlbSapphire" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="45%" stopColor="#38BDF8" />
            <stop offset="75%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="dlbEyeGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>
          <radialGradient id="dlbPupil" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="40%" stopColor="#00F0FF" />
            <stop offset="75%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>
        </defs>

        <g transform="translate(256, 256)">
          {/* Outer 'D' Shell */}
          <path
            d="M -70 -160 C 40 -160, 165 -90, 165 20 C 165 125, 65 175, -55 175 C -95 175, -125 160, -125 140 L -125 70 C -125 65, -115 60, -100 60 C -30 60, 95 30, 95 -20 C 95 -75, 15 -110, -70 -110 Z"
            fill="url(#dlbRibbon)"
            stroke="url(#dlbSapphire)"
            strokeWidth="9"
            strokeLinejoin="round"
          />

          {/* Inner Eye */}
          <path
            d="M -165 -10 C -90 -85, 35 -85, 95 -10 C 35 65, -90 65, -165 -10 Z"
            fill="url(#dlbEyeGlass)"
            stroke="url(#dlbSapphire)"
            strokeWidth="10"
            strokeLinejoin="round"
          />

          {/* Iris & Pupil */}
          <circle cx="-35" cy="-10" r="48" fill="#090D16" stroke="url(#dlbSapphire)" strokeWidth="6" />
          <circle cx="-35" cy="-10" r="28" fill="url(#dlbPupil)" />
          <circle cx="-45" cy="-20" r="8" fill="#FFFFFF" opacity="0.95" />
          <circle cx="-25" cy="-2" r="3.5" fill="#FFFFFF" opacity="0.6" />

          {/* Flare Arc */}
          <path
            d="M -125 140 C -70 160, 20 155, 75 110"
            fill="none"
            stroke="url(#dlbSapphire)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon') {
    if (href) {
      return (
        <Link href={href} className={`inline-flex items-center transition-transform hover:scale-105 active:scale-95 ${className}`}>
          {EmblemIcon}
        </Link>
      );
    }
    return <div className={`inline-flex items-center ${className}`}>{EmblemIcon}</div>;
  }

  const Content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {EmblemIcon}
      <div className="flex flex-col min-w-0 leading-tight">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-gray-900 dark:text-white font-sans ${currentSize.title}`}>
            DRISHTI
          </span>
          <span className="text-xs font-bold text-sky-500 font-sans">
            ದೃಷ್ಟಿ
          </span>
          {variant === 'full' && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/25 font-bold">
              AI CO-PILOT
            </span>
          )}
        </div>
        <p className={`text-gray-500 dark:text-gray-400 font-semibold tracking-wider uppercase ${currentSize.sub}`}>
          Karnataka State Police
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group transition-transform hover:opacity-90 active:scale-98">
        {Content}
      </Link>
    );
  }

  return Content;
}

export default DrishtiLogo;
