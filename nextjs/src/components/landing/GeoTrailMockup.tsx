'use client';

import React from 'react';

export default function GeoTrailMockup() {
  return (
    <div className="w-full h-48 bg-void-000 rounded-lg p-3 overflow-hidden border border-steel-600/30 flex flex-col justify-between font-mono text-[10px] select-none">
      {/* TODO: replace with real screenshot once built */}
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-steel-600/20 shrink-0">
        <span className="text-phosphor-500 font-bold">SUSPECT GEO-TRAIL ANALYSIS</span>
        <span className="text-paper-100/40 text-[8px] uppercase">Route Live</span>
      </div>

      {/* Map visual content */}
      <div className="flex-1 relative my-2 rounded border border-steel-600/30 bg-steel-700/40 overflow-hidden">
        {/* Grid lines background */}
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:12px_12px]" />

        {/* Trail SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          {/* Path */}
          <path
            d="M 30 75 L 70 35 L 110 65 L 150 25 M 150 25 L 180 55"
            fill="none"
            stroke="var(--color-phosphor-500)"
            strokeWidth="1"
            strokeDasharray="3 2"
            className="opacity-40"
          />

          {/* Animated trail path */}
          <path
            d="M 30 75 L 70 35 L 110 65 L 150 25 M 150 25 L 180 55"
            fill="none"
            stroke="var(--color-phosphor-500)"
            strokeWidth="1.5"
            strokeDasharray="40 100"
            strokeDashoffset="100"
            style={{
              animation: 'dashOffset 6s linear infinite'
            }}
          />

          {/* Node circles */}
          <g>
            {/* Node 1 */}
            <circle cx="30" cy="75" r="3.5" fill="var(--color-steel-700)" stroke="var(--color-phosphor-500)" strokeWidth="1" />
            <text x="30" y="86" fill="var(--color-paper-100)" fontSize="5" textAnchor="middle" opacity="0.6">CAM_01</text>
            
            {/* Node 2 */}
            <circle cx="70" cy="35" r="3.5" fill="var(--color-steel-700)" stroke="var(--color-phosphor-500)" strokeWidth="1" />
            <text x="70" y="26" fill="var(--color-paper-100)" fontSize="5" textAnchor="middle" opacity="0.6">CAM_02</text>

            {/* Node 3 */}
            <circle cx="110" cy="65" r="3.5" fill="var(--color-steel-700)" stroke="var(--color-phosphor-500)" strokeWidth="1" />
            <text x="110" y="76" fill="var(--color-paper-100)" fontSize="5" textAnchor="middle" opacity="0.6">CAM_03</text>

            {/* Node 4 */}
            <circle cx="150" cy="25" r="4.5" fill="var(--color-critical-500)" stroke="var(--color-void-000)" strokeWidth="0.75" />
            <text x="150" y="16" fill="var(--color-critical-500)" fontSize="5" fontWeight="bold" textAnchor="middle">LAST_LOC</text>

            {/* Node 5 */}
            <circle cx="180" cy="55" r="3" fill="var(--color-steel-700)" stroke="var(--color-steel-600)" strokeWidth="1" opacity="0.4" />
          </g>
        </svg>

        {/* Trail animation keyframes in standard inline style block */}
        <style jsx>{`
          @keyframes dashOffset {
            from {
              stroke-dashoffset: 140;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-[8px] text-paper-100/60 border-t border-steel-600/10 pt-1.5 shrink-0">
        <span>PRECINCT SURVEILLANCE CCB</span>
        <span className="text-phosphor-500 font-bold">MATCH CONFIDENCE: 94.2%</span>
      </div>
    </div>
  );
}
