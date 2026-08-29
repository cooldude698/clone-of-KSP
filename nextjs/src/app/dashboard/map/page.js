'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Layers, WifiOff, RefreshCw, Clock, Box, Map, SlidersHorizontal, ChevronLeft, X, Flame } from 'lucide-react';

import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_HOTSPOTS } from '@/lib/demo-data';

// 2D flat Leaflet map (fallback / toggled)
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-steel-700/50 text-paper-100/40 font-mono text-xs">
      Loading 2D Map...
    </div>
  ),
});

// 3D MapLibre GL city view (default)
const MapView3D = dynamic(() => import('./MapView3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#f8f5f0] font-mono text-xs text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
        <span>Initialising 3D City Renderer…</span>
      </div>
    </div>
  ),
});

// ── Safety-net mock data (shown only on complete fetch failure)────────────
const MOCK_HOTSPOTS_FALLBACK = [
  { lat: 12.9344, lng: 77.6264, area: 'Silk Board', count: 48, severity: 'critical', district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft', 'robbery'] },
  { lat: 12.9762, lng: 77.6033, area: 'MG Road',    count: 32, severity: 'high',     district: 'Bengaluru Urban', top_crime_types: ['chain_snatching'] },
  { lat: 12.9698, lng: 77.7499, area: 'Whitefield', count: 27, severity: 'high',     district: 'Bengaluru Urban', top_crime_types: ['robbery', 'assault'] },
  { lat: 12.9279, lng: 77.6271, area: 'HSR Layout', count: 22, severity: 'high',     district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft'] },
  { lat: 13.0456, lng: 77.6256, area: 'Hebbal',     count: 19, severity: 'medium',   district: 'Bengaluru Urban', top_crime_types: ['chain_snatching'] },
  { lat: 12.9141, lng: 77.5998, area: 'JP Nagar',   count: 15, severity: 'medium',   district: 'Bengaluru Urban', top_crime_types: ['theft'] },
];

function scoreToSeverity(score) {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

const SEVERITY_HEX = {
  critical: '#c8372d',
  high:     '#e05a3a',
  medium:   '#f0a848',
  low:      '#4A8B6F',
};
const SEVERITY_RADIUS = { critical: 22, high: 16, medium: 12, low: 8 };
const SEVERITY_DOT_CLASS = {
  critical: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  high:     'bg-amber-500',
  medium:   'bg-yellow-400',
  low:      'bg-emerald-500',
};

const DISTRICTS = [
  'all',
  'Bengaluru Urban',
  'Mysuru',
  'Hubballi-Dharwad',
  'Mangaluru',
  'Kalaburagi',
  'Belagavi',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
];
const CRIME_TYPES = [
  'all',
  'vehicle_theft',
  'robbery',
  'chain_snatching',
  'assault',
  'burglary',
  'cybercrime',
  'drug_offence',
  'hit_and_run',
];

function SkeletonItem() {
  return (
    <div className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-white/20 flex-shrink-0" />
        <div className="h-3.5 bg-white/20 rounded w-24" />
        <div className="h-3 bg-white/10 rounded w-8 ml-auto" />
      </div>
      <div className="h-2.5 bg-white/10 rounded w-32 ml-4" />
    </div>
  );
}

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [is3D, setIs3D] = useState(true);

  // Clever space-saving drawer state: starts collapsed so map gets 100% viewport
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live data state
  const [hotspots, setHotspots]       = useState(MOCK_HOTSPOTS_FALLBACK);
  const [loading, setLoading]         = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError]             = useState(null);
  const [usingCache, setUsingCache]   = useState(false);

  // Filter state
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterCrimeType, setFilterCrimeType] = useState('all');

  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const fetchHotspots = useCallback(async ({ district, crime_type } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (district  && district  !== 'all') params.set('district',   district);
      if (crime_type && crime_type !== 'all') params.set('crime_type', crime_type);

      const endpoint = `cache-hotspots${params.toString() ? '?' + params.toString() : ''}`;
      const { data, source } = await fetchWithFallback(endpoint, DEMO_HOTSPOTS);

      const rawHotspots = Array.isArray(data) ? data : (data?.hotspots || DEMO_HOTSPOTS.hotspots);
      const mapped = rawHotspots.map(h => ({
        lat: h.lat || h.cell_lat || 12.9716,
        lng: h.lng || h.cell_lng || 77.5946,
        area: h.area_name || h.area || 'Bengaluru Zone',
        count: h.crime_count || h.count || 10,
        severity: h.risk_level || (h.severity_score ? scoreToSeverity(h.severity_score) : 'medium'),
        district: h.district || 'Bengaluru Urban',
        top_crime_types: h.top_crime_types || [h.primary_crime || 'Theft']
      }));

      setHotspots(mapped);
      setUsingCache(source === 'catalyst_cache' || data?.source === 'catalyst_cache');
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[MapPage] hotspots fetch failed:', err.message);
      setError('Failed to load live hotspot data.');
      setHotspots(MOCK_HOTSPOTS_FALLBACK);
      setUsingCache(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotspots({ district: filterDistrict, crime_type: filterCrimeType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchHotspots({ district: filterDistrict, crime_type: filterCrimeType });
  }, [filterDistrict, filterCrimeType, fetchHotspots]);

  const filtered = filterSeverity === 'all'
    ? hotspots
    : hotspots.filter(h => h.severity === filterSeverity);

  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const formatTime = (d) => d
    ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : null;

  return (
    <div className="relative w-full h-[calc(100vh-7.5rem)] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-0)] text-[var(--text-primary)] font-sans shadow-lg">

      {/* ── 1. Clever Left Panel: Floating Collapsible Intelligence HUD ── */}
      {!sidebarOpen ? (
        /* Collapsed Floating Trigger Pill */
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-3 left-3 z-[1001] flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all duration-200 group hover:scale-[1.02]"
          title="Open Hotspot Intelligence Drawer & Filters"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-wide">Hotspot Intel</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-blue-300 font-mono text-[10px] font-bold border border-white/10">
            {filtered.length}
          </span>
        </button>
      ) : (
        /* Expanded Floating Tactical Drawer */
        <div className="absolute top-3 left-3 bottom-20 w-80 max-w-[calc(100vw-2.5rem)] z-[1002] bg-slate-950/90 dark:bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200">
          
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  Hotspot Intelligence
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold border border-red-500/30">
                    {filtered.length}
                  </span>
                </h2>
                <p className="text-[10px] text-white/50">Karnataka Tactical Grid</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchHotspots({ district: filterDistrict, crime_type: filterCrimeType })}
                disabled={loading}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Collapse panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters section */}
          <div className="p-3 border-b border-white/10 space-y-2.5 bg-white/[0.01]">
            {/* Severity pills */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Severity</span>
                {lastUpdated && (
                  <span className="text-[9px] text-white/40 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(lastUpdated)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterSeverity(s)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-all ${
                      filterSeverity === s
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* District dropdown */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-white/40 uppercase tracking-wider mb-1 font-semibold block">
                  District
                </label>
                <select
                  value={filterDistrict}
                  onChange={e => { setFilterDistrict(e.target.value); setSelectedHotspot(null); }}
                  className="w-full bg-slate-900/90 border border-white/15 text-white text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      {d === 'all' ? 'All Districts' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-white/40 uppercase tracking-wider mb-1 font-semibold block">
                  Crime Type
                </label>
                <select
                  value={filterCrimeType}
                  onChange={e => { setFilterCrimeType(e.target.value); setSelectedHotspot(null); }}
                  className="w-full bg-slate-900/90 border border-white/15 text-white text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                >
                  {CRIME_TYPES.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c === 'all' ? 'All Crimes' : c.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hotspots scroll list */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-white/40 font-mono">
                No hotspots match filter.
              </div>
            ) : (
              filtered.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedHotspot(h)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    selectedHotspot?.area === h.area
                      ? 'bg-blue-600/30 border-blue-400/50 shadow-md'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${SEVERITY_DOT_CLASS[h.severity]}`} />
                      <span className="text-xs text-white/90 font-medium truncate">{h.area}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-400 ml-2 flex-shrink-0">
                      {h.count} FIRs
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 ml-4.5 text-[10px] text-white/40">
                    <span className="capitalize text-white/60">{h.severity}</span>
                    {h.top_crime_types?.[0] && (
                      <>
                        <span>·</span>
                        <span className="truncate text-white/50">{h.top_crime_types[0].replace(/_/g, ' ')}</span>
                      </>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer Legend */}
          <div className="px-3 py-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[10px] text-white/50 font-mono">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Crit</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> High</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Med</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</div>
          </div>
        </div>
      )}

      {/* ── 2. Full Width Map Engine ── */}
      <div className="w-full h-full relative">
        {mounted && (
          is3D ? (
            <MapView3D
              filtered={filtered}
              selectedHotspot={selectedHotspot}
              setSelectedHotspot={setSelectedHotspot}
              is3D={is3D}
            />
          ) : (
            <MapView
              filtered={filtered}
              selectedHotspot={selectedHotspot}
              setSelectedHotspot={setSelectedHotspot}
              SEVERITY_HEX={SEVERITY_HEX}
              SEVERITY_RADIUS={SEVERITY_RADIUS}
              tileUrl={tileUrl}
            />
          )
        )}

        {/* Selected hotspot detail card (floats above lower-left bar) */}
        {selectedHotspot && (
          <div className="absolute bottom-18 left-4 bg-slate-950/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-[1000] max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${SEVERITY_DOT_CLASS[selectedHotspot.severity]}`} />
                  <h3 className="text-sm font-bold text-white">{selectedHotspot.area}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold font-mono text-amber-400">{selectedHotspot.count}</p>
                  <p className="text-[11px] text-white/50">incidents registered</p>
                </div>
                <p className="text-xs text-white/60 mt-1 capitalize">Severity: <span className="font-semibold text-white">{selectedHotspot.severity}</span></p>
                {selectedHotspot.district && (
                  <p className="text-xs text-white/40 mt-0.5">{selectedHotspot.district}</p>
                )}
                {selectedHotspot.top_crime_types?.length > 0 && (
                  <p className="text-[11px] text-white/50 mt-1 capitalize">
                    Primary: {selectedHotspot.top_crime_types.map(c => c.replace(/_/g, ' ')).join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-white/40 hover:text-white text-xs transition-colors flex-shrink-0 p-1"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── 3. [LIVE CRIME MAP, 3D 2D, Hotspots] Shifted to LOWER LEFT ── */}
        <div className="absolute bottom-4 left-4 z-[1000] flex flex-wrap items-center gap-2">
          {/* Header badge */}
          <div className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-white font-medium">Live Crime Map</span>
          </div>

          {/* 3D / 2D Switcher */}
          <div className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-xl p-1 flex items-center gap-1 shadow-xl">
            <button
              id="btn-map-3d"
              onClick={() => setIs3D(true)}
              title="3D City Extrusions"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                is3D
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              3D
            </button>
            <button
              id="btn-map-2d"
              onClick={() => setIs3D(false)}
              title="2D Topographic Grid"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !is3D
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              2D
            </button>
          </div>

          {/* Hotspot count */}
          <div className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-xl px-3 py-2 text-xs text-white/80 font-mono shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>
              {loading ? (
                'Loading…'
              ) : (
                `${filtered.length} hotspot${filtered.length !== 1 ? 's' : ''}`
              )}
            </span>
          </div>

          {usingCache && (
            <div className="bg-amber-500/20 backdrop-blur-xl border border-amber-500/40 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-xl">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-amber-300 font-semibold">Cached</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}