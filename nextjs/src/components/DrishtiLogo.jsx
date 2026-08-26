'use client';

import React from 'react';
import Link from 'next/link';

/**
 * DrishtiEmblem — Magnifying Vision Eye & Query Vector Emblem
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
        strokeWidth="40"
        strokeLinecap="round"
      />
      {/* ── Loupe Handle ── */}
      <line
        x1="325"
        y1="325"
        x2="380"
        y2="380"
        stroke={color}
        strokeWidth="40"
        strokeLinecap="round"
      />
      {/* ── Inner Eye / Pupil Aperture with Top-Right Valley ── */}
      <path
        d="M 195 142
           C 195 175, 230 195, 255 190
           C 275 186, 285 198, 282 225
           A 75 75 0 1 1 195 142 Z"
        fill={color}
      />
      {/* ── Radar / Exclamation Dot ── */}
      <circle cx="435" cy="435" r="32" fill={color} />
    </svg>
  );
}

/**
 * DrishtiLogo — Full Brand Component
 */
export function DrishtiLogo({
  variant = 'compact',
  size = 'md',
  href,
  className = '',
}) {
  const SIZES = {
    sm: { icon: 'w-8 h-8 rounded-xl', title: 'text-sm', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10 rounded-2xl', title: 'text-base', sub: 'text-[11px]' },
    lg: { icon: 'w-12 h-12 rounded-2xl', title: 'text-lg', sub: 'text-xs' },
  };

  const currentSize = SIZES[size] || SIZES.md;

  const EmblemIcon = (
    <div className={`relative flex items-center justify-center flex-shrink-0 bg-black text-white dark:bg-black dark:text-white border border-gray-800 shadow-md ${currentSize.icon}`}>
      <DrishtiEmblem className="w-full h-full p-1.5" color="#FFFFFF" />
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
      <Link href={href} className="inline-flex items-center group transition-opacity hover:opacity-90 active:scale-98">
        {Content}
      </Link>
    );
  }

  return Content;
}

export default DrishtiLogo;
