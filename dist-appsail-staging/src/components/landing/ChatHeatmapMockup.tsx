'use client';

import React from 'react';

export default function ChatHeatmapMockup() {
  return (
    <div className="w-full h-48 bg-void-000 rounded-lg p-3 overflow-hidden border border-steel-600/30 flex flex-col justify-between font-mono text-[10px] select-none">
      {/* TODO: replace with real screenshot once built */}
      {/* Chat header */}
      <div className="flex items-center justify-between pb-2 border-b border-steel-600/20 shrink-0">
        <span className="text-phosphor-500 font-bold">DRISHTI CO-PILOT FEED</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-phosphor-500 animate-pulse" />
          <span className="badge badge-critical font-mono text-[9px] px-2 py-0.5">CASE: CHAT-AI</span>
        </div>
      </div>

      {/* Chat conversation area */}
      <div className="flex-1 py-2 flex flex-col gap-2 overflow-hidden justify-end">
        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-phosphor-500/10 border border-phosphor-500/20 text-phosphor-500 rounded px-2 py-1 max-w-[85%]">
            Show hotspot near Silk Board junction
          </div>
        </div>

        {/* AI message */}
        <div className="flex gap-2">
          <div className="w-4 h-4 rounded bg-steel-600 flex items-center justify-center text-paper-100 shrink-0 font-sans font-bold">D</div>
          <div className="flex-1 bg-steel-700/50 border border-steel-600/30 rounded p-2 text-paper-100/90">
            <p className="mb-1.5 text-[9px]">Generating real-time crime hotspot index map...</p>
            {/* Heatmap mockup map */}
            <div className="relative h-16 w-full rounded border border-steel-600/40 bg-steel-700/50 overflow-hidden">
              {/* Grid map background */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
              
              {/* Heat blur markers */}
              <div className="absolute top-1/2 left-1/3 w-8 h-8 rounded-full bg-critical-500/30 filter blur-md" />
              <div className="absolute top-1/3 left-1/2 w-6 h-6 rounded-full bg-warn-500/30 filter blur-md" />
              <div className="absolute top-[60%] left-[45%] w-10 h-10 rounded-full bg-critical-500/20 filter blur-md" />

              {/* Map pin */}
              <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-paper-100 border border-critical-500 flex items-center justify-center">
                <div className="w-0.5 h-0.5 bg-critical-500 rounded-full" />
              </div>

              {/* Label */}
              <div className="absolute bottom-1 right-1 bg-void-000/90 border border-steel-600/40 px-1 rounded text-[7px] text-paper-100/60">
                12.917° N, 77.622° E
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
