'use client';

import React from 'react';
import Link from 'next/link';

/**
 * DrishtiEmblem — Magnifying Vision Eye & Radar Dot Vector Emblem
 * Exact vector replication of the search loupe + eye aperture + radar dot emblem.
 */
export function DrishtiEmblem({ className = 'w-6 h-6', color = 'currentColor' }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Main Loupe Lens Arc (Centered ~230,230) ── */}
      <path
        d="M 95 230 A 135 135 0 1 1 135 325"
        fill="none"
        stroke={color}
        strokeWidth="42"
        strokeLinecap="round"
      />
      {/* ── Loupe Handle ── */}
      <line
        x1="325"
        y1="325"
        x2="380"
        y2="380"
        stroke={color}
        strokeWidth="42"
        strokeLinecap="round"
      />
      {/* ── Inner Eye / Pupil Aperture ── */}
      <path
        d="M 195 142
           C 195 175, 230 195, 255 190
           C 275 186, 285 198, 282 225
           A 75 75 0 1 1 195 142 Z"
        fill={color}
      />
      {/* ── Radar / Query Dot ── */}
      <circle cx="435" cy="435" r="32" fill={color} />
    </svg>
  );
}

/**
 * DrishtiLogo — Clean, Artistic & Modern Brand Lockup
 * 
 * Props:
 * - variant: 'icon' | 'compact' | 'full'
 * - size: 'sm' | 'md' | 'lg'
 * - href: optional link destination (e.g. '/dashboard' or '/')
 * - className: custom Tailwind classes
 */
export function DrishtiLogo({
  variant = 'compact',
  size = 'md',
  href,
  className = '',
}) {
  const SIZES = {
    sm: {
      icon: 'w-8 h-8 rounded-xl',
      title: 'text-[15px]',
      kannada: 'text-[11px]',
      sub: 'text-[9px]',
      gap: 'gap-2.5',
    },
    md: {
      icon: 'w-9 h-9 rounded-xl',
      title: 'text-[17px]',
      kannada: 'text-[12px]',
      sub: 'text-[10px]',
      gap: 'gap-3',
    },
    lg: {
      icon: 'w-11 h-11 rounded-2xl',
      title: 'text-xl',
      kannada: 'text-sm',
      sub: 'text-[11px]',
      gap: 'gap-3.5',
    },
  };

  const currentSize = SIZES[size] || SIZES.md;

  const EmblemIcon = (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 bg-black text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/20 shadow-sm transition-transform duration-200 group-hover:scale-105 ${currentSize.icon}`}
    >
      <DrishtiEmblem className="w-full h-full p-2" color="currentColor" />
    </div>
  );

  if (variant === 'icon') {
    if (href) {
      return (
        <Link
          href={href}
          className={`inline-flex items-center group transition-transform hover:scale-105 active:scale-95 ${className}`}
        >
          {EmblemIcon}
        </Link>
      );
    }
    return <div className={`inline-flex items-center ${className}`}>{EmblemIcon}</div>;
  }

  const Content = (
    <div className={`flex items-center ${currentSize.gap} select-none ${className}`}>
      {EmblemIcon}
      <div className="flex flex-col min-w-0 justify-center leading-none">
        {/* Top Line: Artistic DRISHTI Wordmark + Subtle Kannada Script */}
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight text-gray-950 dark:text-white font-sans ${currentSize.title}`}
          >
            DRISHTI
          </span>
          <span
            className={`font-bold text-sky-500 dark:text-sky-400 font-sans ${currentSize.kannada}`}
          >
            ದೃಷ್ಟಿ
          </span>
          {variant === 'full' && (
            <span className="ml-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 uppercase tracking-wider">
              AI CO-PILOT
            </span>
          )}
        </div>

        {/* Bottom Line: Clean, Modern Micro Subtitle */}
        <p
          className={`text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase mt-1 truncate ${currentSize.sub}`}
        >
          Karnataka State Police
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center group transition-opacity hover:opacity-90 active:scale-[0.99]"
      >
        {Content}
      </Link>
    );
  }

  return Content;
}

export default DrishtiLogo;
