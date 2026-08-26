'use client';

import React from 'react';
import Link from 'next/link';

/**
 * DrishtiLogo — Iconic, Sleek & Executive Law Enforcement AI Branding
 * 
 * Features:
 * - Geometric 'D' + Tactical Lens Monomark
 * - Deep Royal Cobalt & Titanium Blue Facets
 * - Crisp High-Definition SVG Vector
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
    <div className={`relative flex items-center justify-center flex-shrink-0 bg-[#0F172A] border border-slate-700/60 shadow-md ${currentSize.icon}`}>
      <svg
        viewBox="0 0 512 512"
        className="w-6 h-6 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dlFacetPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="dlFacetDeep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <linearGradient id="dlFacetHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <radialGradient id="dlCoreLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </radialGradient>
        </defs>

        <!-- Interlocking geometric shield & lens facets forming the 'D' of Drishti -->
        <g transform="translate(256, 256)">
          <!-- Top-Left Facet -->
          <path 
            d="M 0 -150 L 120 -80 C 135 -70, 145 -55, 145 -35 L 145 0 L 60 0 L 60 -45 L 0 -80 Z" 
            fill="url(#dlFacetHighlight)" 
          />

          <!-- Bottom-Right Facet Curve -->
          <path 
            d="M 145 0 L 145 35 C 145 95, 95 145, 30 145 L -100 145 L -100 70 L 20 70 C 55 70, 75 50, 75 15 L 75 0 Z" 
            fill="url(#dlFacetPrimary)" 
          />

          <!-- Left Tactical Spine -->
          <path 
            d="M -100 -145 L -35 -145 L -35 145 L -100 145 Z" 
            fill="url(#dlFacetDeep)" 
          />

          <!-- Diagonal Ray Bridge -->
          <path 
            d="M -35 -145 L 0 -150 L -35 -85 Z" 
            fill="#60A5FA" 
            opacity="0.85"
          />

          <!-- Central Optical Lens Core -->
          <circle cx="20" cy="0" r="38" fill="#020617" stroke="#38BDF8" strokeWidth="8" />
          <circle cx="20" cy="0" r="18" fill="url(#dlCoreLight)" />
          <circle cx="14" cy="-6" r="5" fill="#FFFFFF" opacity="0.95" />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon') {
    if (href) {
      return (
        <Link href={href} className={`inline-flex items-center transition-opacity hover:opacity-85 active:scale-95 ${className}`}>
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
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-sans">
            ದೃಷ್ಟಿ
          </span>
          {variant === 'full' && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
              KSP AI
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
