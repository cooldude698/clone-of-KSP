'use client';

import React from 'react';
import Link from 'next/link';

/**
 * DrishtiLogo — Exact Solar Eye / Guardian Vision Emblem
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
    sm: { icon: 'w-8 h-8 rounded-xl', title: 'text-sm', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10 rounded-xl', title: 'text-base', sub: 'text-[11px]' },
    lg: { icon: 'w-12 h-12 rounded-2xl', title: 'text-lg', sub: 'text-xs' },
  };

  const currentSize = SIZES[size] || SIZES.md;

  const EmblemIcon = (
    <div className={`relative flex items-center justify-center flex-shrink-0 bg-black text-white dark:bg-black dark:text-white border border-gray-800 shadow-sm ${currentSize.icon}`}>
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full p-1"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Center Spike */}
        <polygon points="256,65 278,172 234,172" />
        
        {/* Top Left Diagonal Spike */}
        <polygon points="152,125 208,188 174,212" />
        
        {/* Top Right Diagonal Spike */}
        <polygon points="360,125 338,212 304,188" />

        {/* Bottom Center Spike */}
        <polygon points="256,447 234,340 278,340" />
        
        {/* Bottom Left Diagonal Spike */}
        <polygon points="152,387 174,300 208,324" />
        
        {/* Bottom Right Diagonal Spike */}
        <polygon points="360,387 304,324 338,300" />

        {/* Outer Eye Contour Ring */}
        <path
          d="M 72 256 C 135 158, 377 158, 440 256 C 377 354, 135 354, 72 256 Z M 124 256 C 168 190, 344 190, 388 256 C 344 322, 168 322, 124 256 Z"
          fillRule="evenodd"
        />

        {/* Inner Eye Swirling Wave Crest */}
        <path
          d="M 128 256 C 172 196, 340 196, 384 256 C 340 236, 290 232, 236 242 C 185 252, 180 286, 226 294 C 268 300, 294 286, 308 274 C 286 300, 246 314, 206 308 C 152 300, 140 272, 128 256 Z"
        />
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
      <Link href={href} className="inline-flex items-center group transition-opacity hover:opacity-90 active:scale-98">
        {Content}
      </Link>
    );
  }

  return Content;
}

export default DrishtiLogo;
