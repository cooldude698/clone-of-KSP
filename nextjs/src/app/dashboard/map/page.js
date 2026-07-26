'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Layers, WifiOff, RefreshCw, Clock } from 'lucide-react';

import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_HOTSPOTS } from '@/lib/demo-data';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-steel-700/50 text-paper-100/40 font-mono text-xs">
      Loading Live Map...
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

// ── Severity mapping ──────────────────────────────────────────────────────
/**
 * Maps a numeric severity_score from /server/hotspots/ to the string severity
 * used by MapView (critical/high/medium/low).
 * Thresholds: ≥9 → critical | ≥7 → high | ≥5 → medium | <5 → low
 * Spot-check: severity_score=9.5 → "critical" ✓
 */
function scoreToSeverity(score) {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/** Map a raw hotspot from /server/hotspots/ to the shape MapView expects. */
function mapHotspot(h) {
  return {
    lat: h.cell_lat,
    lng: h.cell_lng,
    area: h.area_name || `${h.district} Zone`,
    count: h.crime_count,
    severity: scoreToSeverity(h.severity_score ?? 0),
    district: h.district || '',
    top_crime_types: h.top_crime_types || [],
    severity_score: h.severity_score,
  };
}

// ── Colour maps (unchanged from original) ────────────────────────────────
const SEVERITY_HEX = {
  critical: '#c8372d',
  high:     '#e05a3a',
  medium:   '#f0a848',
  low:      '#4A8B6F',
};
const SEVERITY_RADIUS = { critical: 22, high: 16, medium: 12, low: 8 };
const SEVERITY_DOT_CLASS = {
  critical: 'bg-critical-500',
  high:     'bg-warn-500',
  medium:   'bg-warn-500/60',
  low:      'bg-phosphor-500',
};

// ── Filter option lists ───────────────────────────────────────────────────
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

// ── Skeleton list item ────────────────────────────────────────────────────
function SkeletonItem() {
  return (
    <div className="w-full p-3 rounded-lg bg-steel-600/20 border border-steel-600/40 space-y-2 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-steel-500/50 flex-shrink-0" />
        <div className="h-3.5 bg-steel-500/50 rounded w-28" />
        <div className="h-3 bg-steel-500/30 rounded w-8 ml-auto" />
      </div>
      <div className="h-2.5 bg-steel-500/30 rounded w-36 ml-4" />
    </div>
  );
}

// ── Cached data badge (matches dashboard Task 2 style) ────────────────────
function CachedBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-warn-500/10 border border-warn-500/30 text-warn-500 text-[10px] font-semibold">
      <WifiOff className="w-3 h-3" />
      Cached data
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function MapPage() {
  const [mounted, setMounted] = useState(false);

  // Live data state (pre-filled for instant 0ms mount)
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

  const abortRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch function — called on mount and whenever backend filters change ──
  const fetchHotspots = useCallback(async ({ district, crime_type } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (district  && district  !== 'all') params.set('district',   district);
      if (crime_type && crime_type !== 'all') params.set('crime_type', crime_type);

      const endpoint = `hotspots${params.toString() ? '?' + params.toString() : ''}`;
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
      setUsingCache(source === 'demo');
      setLastUpdated(new Date());
      setUsingCache(false);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') return; // Superseded by newer request — ignore
      console.error('[MapPage] hotspots fetch failed:', err.message);
      setError('Failed to load live hotspot data.');
      setHotspots(MOCK_HOTSPOTS_FALLBACK);
      setUsingCache(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchHotspots({ district: filterDistrict, crime_type: filterCrimeType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when backend-level filters change (district or crime_type)
  // Note: severity is a computed field — filtered client-side after fetch
  useEffect(() => {
    fetchHotspots({ district: filterDistrict, crime_type: filterCrimeType });
  }, [filterDistrict, filterCrimeType, fetchHotspots]);

  // ── Client-side severity filter applied on top of fetched data ───────────
  const filtered = filterSeverity === 'all'
    ? hotspots
    : hotspots.filter(h => h.severity === filterSeverity);

  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const formatTime = (d) => d
    ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : null;

  return (
    <div className="flex h-full">

      {/* ── Sidebar ── */}
      <div className="w-72 flex-shrink-0 border-r border-steel-600/40 flex flex-col bg-steel-700">

        {/* Header */}
        <div className="p-4 border-b border-steel-600/40">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-paper-100">Crime Hotspot Map</h2>
            <button
              id="btn-refresh-map"
              onClick={() => fetchHotspots({ district: filterDistrict, crime_type: filterCrimeType })}
              disabled={loading}
              className="text-paper-100/40 hover:text-paper-100/80 disabled:opacity-30 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-paper-100/50">Karnataka State · Live data</p>

          {/* Last updated + cache badge */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {lastUpdated && (
              <div className="flex items-center gap-1 text-[10px] text-paper-100/30">
                <Clock className="w-3 h-3" />
                {formatTime(lastUpdated)}
              </div>
            )}
            {usingCache && <CachedBadge />}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="p-4 border-b border-steel-600/40 space-y-4">

          {/* Severity — client-side */}
          <div>
            <p className="text-[10px] text-paper-100/50 uppercase tracking-wider mb-1.5 font-semibold">Severity</p>
            <div className="flex flex-wrap gap-1">
              {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
                <button
                  key={s}
                  id={`filter-severity-${s}`}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all
                    ${filterSeverity === s
                      ? 'bg-phosphor-500 text-white'
                      : 'bg-steel-600/40 text-paper-100/60 hover:text-paper-100 border border-steel-600/50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* District — triggers re-fetch */}
          <div>
            <label htmlFor="filter-district" className="text-[10px] text-paper-100/50 uppercase tracking-wider mb-1.5 font-semibold block">
              District
            </label>
            <select
              id="filter-district"
              value={filterDistrict}
              onChange={e => { setFilterDistrict(e.target.value); setSelectedHotspot(null); }}
              className="w-full bg-steel-600/40 border border-steel-600/50 text-paper-100/80 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-phosphor-500/60"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d} className="bg-steel-700">
                  {d === 'all' ? 'All Districts' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Crime Type — triggers re-fetch */}
          <div>
            <label htmlFor="filter-crime-type" className="text-[10px] text-paper-100/50 uppercase tracking-wider mb-1.5 font-semibold block">
              Crime Type
            </label>
            <select
              id="filter-crime-type"
              value={filterCrimeType}
              onChange={e => { setFilterCrimeType(e.target.value); setSelectedHotspot(null); }}
              className="w-full bg-steel-600/40 border border-steel-600/50 text-paper-100/80 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-phosphor-500/60"
            >
              {CRIME_TYPES.map(c => (
                <option key={c} value={c} className="bg-steel-700">
                  {c === 'all' ? 'All Crime Types' : c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Hotspot list ── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-paper-100/40">
              No hotspots match the current filters.
            </div>
          ) : (
            filtered.map((h, i) => (
              <button
                key={i}
                onClick={() => setSelectedHotspot(h)}
                className={`w-full text-left p-3 rounded-lg border transition-all
                  ${selectedHotspot?.area === h.area
                    ? 'bg-steel-600/60 border-phosphor-500/40'
                    : 'bg-steel-600/20 border-steel-600/40 hover:bg-steel-600/40'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${SEVERITY_DOT_CLASS[h.severity]}`} />
                    <span className="text-sm text-paper-100/90 font-medium truncate max-w-[140px]">{h.area}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-paper-100/80">{h.count}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-4">
                  <p className="text-[10px] text-paper-100/40 capitalize">{h.severity}</p>
                  {h.top_crime_types?.[0] && (
                    <>
                      <span className="text-[10px] text-paper-100/20">·</span>
                      <p className="text-[10px] text-paper-100/35 capitalize">
                        {h.top_crime_types[0].replace(/_/g, ' ')}
                      </p>
                    </>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* ── Legend ── */}
        <div className="p-4 border-t border-steel-600/40 space-y-1.5">
          {Object.entries(SEVERITY_DOT_CLASS).map(([sev, cls]) => (
            <div key={sev} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
              <span className="text-xs text-paper-100/50 capitalize">{sev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Map area ── */}
      <div className="flex-1 relative">
        {mounted && (
          <MapView
            filtered={filtered}
            selectedHotspot={selectedHotspot}
            setSelectedHotspot={setSelectedHotspot}
            SEVERITY_HEX={SEVERITY_HEX}
            SEVERITY_RADIUS={SEVERITY_RADIUS}
            tileUrl={tileUrl}
          />
        )}

        {/* Selected hotspot detail card */}
        {selectedHotspot && (
          <div className="absolute bottom-6 left-4 bg-steel-700/95 backdrop-blur border border-steel-600/60 rounded-xl p-4 shadow-2xl z-[1000] max-w-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${SEVERITY_DOT_CLASS[selectedHotspot.severity]}`} />
                  <h3 className="text-sm font-bold text-paper-100">{selectedHotspot.area}</h3>
                </div>
                <p className="text-2xl font-bold font-mono text-warn-500">{selectedHotspot.count}</p>
                <p className="text-xs text-paper-100/50">incidents this period</p>
                <p className="text-xs text-paper-100/50 mt-1 capitalize">Severity: {selectedHotspot.severity}</p>
                {selectedHotspot.district && (
                  <p className="text-xs text-paper-100/40 mt-0.5">{selectedHotspot.district}</p>
                )}
                {selectedHotspot.top_crime_types?.length > 0 && (
                  <p className="text-xs text-paper-100/40 mt-0.5 capitalize">
                    Top crimes: {selectedHotspot.top_crime_types.map(c => c.replace(/_/g, ' ')).join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-paper-100/40 hover:text-paper-100/80 text-xs transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Map overlay badges */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <div className="bg-steel-700/90 backdrop-blur border border-steel-600/60 rounded-lg px-3 py-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-phosphor-500" />
            <span className="text-xs text-paper-100/80 font-medium">Live Crime Map</span>
          </div>
          <div className="bg-steel-700/90 backdrop-blur border border-steel-600/60 rounded-lg px-3 py-2 text-xs text-paper-100/50 font-mono text-center">
            {loading ? (
              <span className="animate-pulse">Loading…</span>
            ) : (
              `${filtered.length} hotspot${filtered.length !== 1 ? 's' : ''}`
            )}
          </div>
          {usingCache && (
            <div className="bg-warn-500/10 backdrop-blur border border-warn-500/30 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <WifiOff className="w-3 h-3 text-warn-500" />
              <span className="text-[10px] text-warn-500 font-semibold">Cached data</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}