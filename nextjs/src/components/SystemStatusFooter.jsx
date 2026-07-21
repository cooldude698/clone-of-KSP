'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw } from 'lucide-react';

/**
 * SystemStatusFooter — Performance-optimised version.
 *
 * Changes from original:
 * 1. 5 sequential await fetch() → single Promise.allSettled() (fires all in parallel)
 * 2. Uses AbortController with 2s timeout instead of the default browser timeout (~30s)
 * 3. First render is deferred by 2s to let critical page content load first
 * 4. Poll interval: 60s (was 30s) — status doesn't need to change that often
 */

const ENDPOINTS = [
  { key: 'firs',     name: 'FIR DB Engine',       url: '/api/firs?limit=1',                liveLabel: 'Live ZCQL' },
  { key: 'hotspots', name: 'Hotspots & Map',       url: '/api/hotspots?limit=1',            liveLabel: 'Live ZCQL' },
  { key: 'trends',   name: 'Analytics Trends',     url: '/api/trends?groupby=monthly',      liveLabel: 'Live ZCQL' },
  { key: 'anpr',     name: 'ANPR Surveillance',    url: '/api/anpr-check',   method: 'OPTIONS', liveLabel: 'Live' },
  { key: 'ai',       name: 'Drishti AI Co-Pilot',  url: '/api/askDrishtiAI', method: 'OPTIONS', liveLabel: 'QuickML + Gemini' },
];

async function pingEndpoint({ url, method = 'GET' }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(url, { method, signal: controller.signal });
    clearTimeout(timer);
    // OPTIONS can return 200 or 204 — both mean the route exists
    if (method === 'OPTIONS') return res.ok || res.status === 204 || res.status === 405;
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return !(data?.status === 'degraded' && (!data?.firs || data?.firs?.length === 0));
  } catch {
    clearTimeout(timer);
    return false;
  }
}

const INITIAL_STATUSES = Object.fromEntries(
  ENDPOINTS.map(e => [e.key, { name: e.name, mode: e.liveLabel }])
);

export default function SystemStatusFooter() {
  const [statuses,    setStatuses]    = useState(INITIAL_STATUSES);
  const [isDemoMode,  setIsDemoMode]  = useState(false);
  const [initialized, setInitialized] = useState(false);

  const checkStatus = useCallback(async () => {
    // Fire all pings in parallel — massively faster than sequential awaits
    const results = await Promise.allSettled(ENDPOINTS.map(ep => pingEndpoint(ep)));

    let hasDemoFallback = false;
    const next = { ...INITIAL_STATUSES };

    results.forEach((result, i) => {
      const ep = ENDPOINTS[i];
      const isLive = result.status === 'fulfilled' && result.value === true;
      if (!isLive) hasDemoFallback = true;
      next[ep.key] = { name: ep.name, mode: isLive ? ep.liveLabel : 'Demo Mode' };
    });

    setStatuses(next);
    setIsDemoMode(hasDemoFallback);
    setInitialized(true);
  }, []);

  useEffect(() => {
    // Defer first status check by 1.5s so critical page content loads first
    const initTimer = setTimeout(() => {
      checkStatus();
    }, 1500);

    const interval = setInterval(checkStatus, 60_000); // poll every 60s (was 30s)
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [checkStatus]);

  return (
    <footer className="w-full bg-[#0a0c0a] border-t border-steel-600/40 px-6 py-2 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-paper-100/60 gap-3">
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-phosphor-500 animate-pulse" />
        <span className="font-bold tracking-wider uppercase text-paper-100/90">System Status:</span>
        {!initialized ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-steel-600/40 text-paper-100/40 border border-steel-600/60 uppercase">
            Checking…
          </span>
        ) : isDemoMode ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warn-500/20 text-warn-500 border border-warn-500/40 uppercase" title="Some services using sample data">
            DEMO MODE
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success-500/20 text-success-500 border border-success-500/40 uppercase">
            LIVE MATRIX
          </span>
        )}
        <span className="text-paper-100/30">|</span>
        <span className="text-paper-100/50">Karnataka State Police Command Grid</span>
      </div>

      <div className="flex items-center flex-wrap gap-4">
        {ENDPOINTS.map(({ key, name }) => {
          const service = statuses[key];
          const isDemo  = service.mode === 'Demo Mode';
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                !initialized
                  ? 'bg-paper-100/20'
                  : isDemo
                  ? 'bg-warn-500 animate-pulse'
                  : 'bg-success-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              }`} />
              <span className="text-paper-100/80">{service.name}:</span>
              <span className={`font-semibold ${
                !initialized ? 'text-paper-100/30' : isDemo ? 'text-warn-500' : 'text-success-500'
              }`}>
                {initialized ? service.mode : '…'}
              </span>
            </div>
          );
        })}
        <button
          onClick={checkStatus}
          className="p-1 hover:text-paper-100 transition-colors ml-1"
          title="Refresh Services Status"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
}
