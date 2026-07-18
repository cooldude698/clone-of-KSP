'use client';

import React from 'react';

export default function ChronoNetworkMockup() {
  return (
    <div className="w-full h-48 bg-void-000 rounded-lg p-3 overflow-hidden border border-steel-600/30 flex flex-col justify-between font-mono text-[10px] select-none">
      {/* TODO: replace with real screenshot once built */}
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-steel-600/20 shrink-0">
        <span className="text-phosphor-500 font-bold">CHRONO-CRIMINAL GRAPH</span>
        <span className="text-paper-100/40 text-[8px] uppercase">GANG_AFFILIATION_MAP</span>
      </div>

      {/* Network visualization */}
      <div className="flex-1 relative my-2 rounded border border-steel-600/30 bg-steel-700/40 overflow-hidden">
        {/* Radial scanner graphic element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-steel-600/10 animate-pulse" />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          {/* Link Lines */}
          <g opacity="0.6">
            {/* Center to top left */}
            <line x1="100" y1="50" x2="60" y2="25" stroke="var(--color-critical-500)" strokeWidth="1.5" />
            {/* Center to bottom left */}
            <line x1="100" y1="50" x2="65" y2="75" stroke="var(--color-warn-500)" strokeWidth="1" />
            {/* Center to top right */}
            <line x1="100" y1="50" x2="140" y2="20" stroke="var(--color-phosphor-500)" strokeWidth="1" />
            {/* Center to bottom right */}
            <line x1="100" y1="50" x2="145" y2="70" stroke="var(--color-steel-600)" strokeWidth="1.25" />
            {/* Auxiliary link */}
            <line x1="60" y1="25" x2="65" y2="75" stroke="var(--color-critical-500)" strokeWidth="0.75" strokeDasharray="2 1" />
          </g>

          {/* Node circles */}
          <g>
            {/* Central Node (Gang Leader) */}
            <circle cx="100" cy="50" r="6" fill="var(--color-critical-500)" stroke="var(--color-void-000)" strokeWidth="1" />
            <text x="100" y="62" fill="var(--color-paper-100)" fontSize="5.5" fontWeight="bold" textAnchor="middle">Ramesh_K (92)</text>

            {/* Sub-node 1 */}
            <circle cx="60" cy="25" r="4.5" fill="var(--color-critical-500)" stroke="var(--color-steel-600)" strokeWidth="0.5" />
            <text x="60" y="17" fill="var(--color-paper-100)" fontSize="5" textAnchor="middle">Suresh_N</text>

            {/* Sub-node 2 */}
            <circle cx="65" cy="75" r="4" fill="var(--color-warn-500)" stroke="var(--color-steel-600)" strokeWidth="0.5" />
            <text x="65" y="85" fill="var(--color-paper-100)" fontSize="5" textAnchor="middle">Anand_M</text>

            {/* Sub-node 3 */}
            <circle cx="140" cy="20" r="3.5" fill="var(--color-phosphor-500)" stroke="var(--color-steel-600)" strokeWidth="0.5" />
            <text x="140" y="12" fill="var(--color-paper-100)" fontSize="5" textAnchor="middle">Kiran_G</text>

            {/* Sub-node 4 */}
            <circle cx="145" cy="70" r="3.5" fill="var(--color-steel-600)" stroke="var(--color-steel-750)" strokeWidth="0.5" />
            <text x="145" y="80" fill="var(--color-paper-100)" fontSize="5" textAnchor="middle">Vijay_B</text>
          </g>
        </svg>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[8px] text-paper-100/60 border-t border-steel-600/10 pt-1.5 shrink-0">
        <span>GANG CORRELATION INDEX</span>
        <span>DATE: 2026-07-18</span>
      </div>
    </div>
  );
}
