'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  Navigation,
  Download,
  Clock,
  Activity,
  MapPin,
  Camera,
  Radio,
  Shield,
  Video,
  AlertTriangle,
  Zap,
  TrendingUp,
  RefreshCw,
  Eye,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';

// Dynamically import Leaflet map component to prevent SSR issues
const TrailMapView = dynamic(() => import('./TrailMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-steel-700/50 animate-pulse rounded-xl flex items-center justify-center text-paper-100/50 font-mono text-xs">
      Initializing Tactical Map Grid...
    </div>
  ),
});

// ── MOCK MULTI-VEHICLE ANPR DATABASE ──────────────────────────────────────────
const MOCK_VEHICLE_TRAILS = {
  'KA-01-MJ-8821': {
    target: 'Ramesh Kumar (Bullet Ramesh)',
    crime_linked: 'FIR-2026-BL-0492 (Vehicle Theft & Armed Robbery)',
    trail_status: 'active',
    duration_minutes: 48,
    total_distance_km: 12.1,
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-BLR-0010',
        camera_name: 'Vijayanagar TTMC CCTV Camera #10',
        lat: 12.9651,
        lng: 77.5348,
        timestamp: '2026-07-26T14:22:10Z',
        plate_detected: 'KA-01-MJ-8821',
        confidence: 98.4,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.2,
      },
      {
        hop: 2,
        camera_id: 'CAM-BLR-0012',
        camera_name: 'MG Road BATCS Signal Pole 5',
        lat: 12.9737,
        lng: 77.6138,
        timestamp: '2026-07-26T14:35:45Z',
        plate_detected: 'KA-01-MJ-8821',
        confidence: 96.1,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 3.4,
      },
      {
        hop: 3,
        camera_id: 'CAM-BLR-0015',
        camera_name: 'Hebbal Flyover Dome ANPR 15',
        lat: 13.0064,
        lng: 77.5787,
        timestamp: '2026-07-26T14:41:00Z', // 5.2 km in 5 min 15 sec -> ~60 km/h
        plate_detected: 'KA-01-MJ-8821',
        confidence: 88.2, // Low confidence hop
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 7.8,
      },
      {
        hop: 4,
        camera_id: 'CAM-BLR-0035',
        camera_name: 'Silk Board Toll Plaza Checkpost',
        lat: 12.9344,
        lng: 77.6123,
        timestamp: '2026-07-26T14:46:30Z', // 9.5 km in 5.5 min -> 103 km/h (HIGH SPEED)
        plate_detected: 'KA-01-MJ-8821',
        confidence: 95.5,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 12.1,
      },
    ],
  },
  'KA-05-EV-9012': {
    target: 'Anand Gowda (SUS-8842)',
    crime_linked: 'FIR-2026-BL-1104 (Extortion & Chain Snatching)',
    trail_status: 'active',
    duration_minutes: 62,
    total_distance_km: 14.8,
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-BLR-0101',
        camera_name: 'Jayanagar 4th Block ANPR Cam #04',
        lat: 12.9298,
        lng: 77.5826,
        timestamp: '2026-07-26T11:10:00Z',
        plate_detected: 'KA-05-EV-9012',
        confidence: 97.9,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.5,
      },
      {
        hop: 2,
        camera_id: 'CAM-BLR-0105',
        camera_name: 'Bannerghatta Road Signal Junction',
        lat: 12.9081,
        lng: 77.5954,
        timestamp: '2026-07-26T11:18:00Z',
        plate_detected: 'KA-05-EV-9012',
        confidence: 94.2,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 3.2,
      },
      {
        hop: 3,
        camera_id: 'CAM-BLR-0112',
        camera_name: 'BTM 2nd Stage CCTV Surveillance',
        lat: 12.9166,
        lng: 77.6101,
        timestamp: '2026-07-26T12:08:00Z', // 50 min gap over 1.8 km (UNUSUAL GAP)
        plate_detected: 'KA-05-EV-9012',
        confidence: 86.5,
        sighting_type: 'CCTV Surveillance',
        distance_from_crime_km: 5.8,
      },
      {
        hop: 4,
        camera_id: 'CAM-BLR-0120',
        camera_name: 'Electronics City Expressway Toll',
        lat: 12.8452,
        lng: 77.6602,
        timestamp: '2026-07-26T12:12:00Z', // 9 km in 4 min -> ~135 km/h (HIGH SPEED)
        plate_detected: 'KA-05-EV-9012',
        confidence: 96.8,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 14.8,
      },
    ],
  },
  'KA-03-HA-4512': {
    target: 'Zakir Hussain (Unindexed Record)',
    crime_linked: 'FIR-2026-BL-0811 (Cyber Fraud Intercept)',
    trail_status: 'flagged',
    duration_minutes: 25,
    total_distance_km: 6.4,
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-BLR-0201',
        camera_name: 'Shivajinagar Bus Stand CCTV',
        lat: 12.9857,
        lng: 77.6057,
        timestamp: '2026-07-26T13:00:00Z',
        plate_detected: 'KA-03-HA-4512',
        confidence: 95.1,
        sighting_type: 'CCTV Surveillance',
        distance_from_crime_km: 0.8,
      },
      {
        hop: 2,
        camera_id: 'CAM-BLR-0205',
        camera_name: 'MG Road Metro Station ANPR',
        lat: 12.9756,
        lng: 77.6068,
        timestamp: '2026-07-26T13:12:00Z',
        plate_detected: 'KA-03-HA-4512',
        confidence: 92.4,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 2.5,
      },
      {
        hop: 3,
        camera_id: 'CAM-BLR-0210',
        camera_name: 'Indiranagar 100ft Road Signal Junction',
        lat: 12.9784,
        lng: 77.6408,
        timestamp: '2026-07-26T13:25:00Z',
        plate_detected: 'KA-03-HA-4512',
        confidence: 87.0,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 6.4,
      },
    ],
  },
};

// ── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getCameraTypeDetails(cameraName = '') {
  const name = cameraName.toUpperCase();
  if (name.includes('ANPR')) {
    return { type: 'ANPR', label: 'ANPR Camera', icon: Camera, badgeVariant: 'info' };
  }
  if (name.includes('BATCS') || name.includes('SIGNAL') || name.includes('JUNCTION')) {
    return { type: 'BATCS', label: 'Traffic Signal', icon: Radio, badgeVariant: 'default' };
  }
  if (name.includes('TOLL') || name.includes('CHECKPOST') || name.includes('PLAZA')) {
    return { type: 'TOLL', label: 'Toll Checkpoint', icon: Shield, badgeVariant: 'warning' };
  }
  return { type: 'CCTV', label: 'CCTV Sweep', icon: Video, badgeVariant: 'default' };
}

function analyzeHopInsights(hop, prevHop) {
  if (!prevHop || !hop.timestamp || !prevHop.timestamp) {
    return { speedKmh: null, diffMinutes: null, anomaly: null };
  }

  const t1 = new Date(prevHop.timestamp).getTime();
  const t2 = new Date(hop.timestamp).getTime();
  const diffMinutes = Math.max(1, Math.round((t2 - t1) / (1000 * 60)));

  const distKm = calculateDistance(prevHop.lat, prevHop.lng, hop.lat, hop.lng);
  const hours = diffMinutes / 60;
  const speedKmh = Math.round(distKm / hours);

  let anomaly = null;
  if (speedKmh > 85) {
    anomaly = {
      type: 'speed',
      label: `HIGH SPEED (${speedKmh} km/h)`,
      variant: 'critical',
      detail: `Implied speed of ${speedKmh} km/h exceeds urban road limits. Check for potential fake plate swap.`,
    };
  } else if (diffMinutes > 40 && distKm < 4) {
    anomaly = {
      type: 'gap',
      label: `UNUSUAL GAP (${diffMinutes}m)`,
      variant: 'warning',
      detail: `${diffMinutes} minute gap over only ${distKm.toFixed(1)} km. Possible stopover or hideout area.`,
    };
  }

  return { speedKmh, diffMinutes, anomaly };
}

function computeProjectedPath(trail) {
  if (!trail || trail.length < 2) return null;

  const h1 = trail[trail.length - 2];
  const h2 = trail[trail.length - 1];

  const dLat = h2.lat - h1.lat;
  const dLng = h2.lng - h1.lng;

  const projLat = h2.lat + dLat * 0.65;
  const projLng = h2.lng + dLng * 0.65;

  const t1 = new Date(h1.timestamp).getTime();
  const t2 = new Date(h2.timestamp).getTime();
  const diffMs = Math.max(t2 - t1, 5 * 60 * 1000);
  const projTime = new Date(t2 + diffMs * 0.65).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    fromLat: h2.lat,
    fromLng: h2.lng,
    lat: projLat,
    lng: projLng,
    projectedTime: projTime,
    label: 'Projected Heading (Unconfirmed)',
  };
}

// ── MAIN GEOTRAIL PAGE COMPONENT ──────────────────────────────────────────────

export default function GeoTrailPage() {
  const [searchQuery, setSearchQuery] = useState('KA-01-MJ-8821');
  const [searchedPlate, setSearchedPlate] = useState('KA-01-MJ-8821');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [trailData, setTrailData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [highlightedHop, setHighlightedHop] = useState(null);
  const [visibleHopsCount, setVisibleHopsCount] = useState(1);

  // Load target trail by plate number
  const loadTrailForPlate = useCallback(async (plateNumber) => {
    const cleanPlate = plateNumber.trim().toUpperCase();
    setSearchedPlate(cleanPlate);
    setLoading(true);
    setNotFound(false);
    setHighlightedHop(null);

    // 1. Check local mock dataset
    const mockEntry = MOCK_VEHICLE_TRAILS[cleanPlate];

    try {
      const fallbackPayload = mockEntry
        ? {
            trail: mockEntry.trail,
            total_hops: mockEntry.trail.length,
            total_distance_km: mockEntry.total_distance_km,
            trail_status: mockEntry.trail_status,
            duration_minutes: mockEntry.duration_minutes,
            target: mockEntry.target,
            crime_linked: mockEntry.crime_linked,
          }
        : null;

      if (!fallbackPayload) {
        // Plate not in mock dictionary
        setNotFound(true);
        setTrailData([]);
        setMetadata(null);
        setLoading(false);
        return;
      }

      // 2. Fetch with fallback API pattern
      const { data } = await fetchWithFallback('trail', fallbackPayload, {
        method: 'POST',
        body: { plate: cleanPlate },
      });

      const activeTrail = data?.trail || fallbackPayload.trail;
      setTrailData(activeTrail);
      setMetadata({
        totalHops: data?.total_hops || fallbackPayload.total_hops,
        totalDistance: data?.total_distance_km || fallbackPayload.total_distance_km,
        status: data?.trail_status || fallbackPayload.trail_status,
        duration: data?.duration_minutes || fallbackPayload.duration_minutes,
        target: data?.target || fallbackPayload.target,
        crimeLinked: data?.crime_linked || fallbackPayload.crime_linked,
        lastUpdated: new Date().toLocaleTimeString('en-IN'),
      });
    } catch {
      if (mockEntry) {
        setTrailData(mockEntry.trail);
        setMetadata({
          totalHops: mockEntry.trail.length,
          totalDistance: mockEntry.total_distance_km,
          status: mockEntry.trail_status,
          duration: mockEntry.duration_minutes,
          target: mockEntry.target,
          crimeLinked: mockEntry.crime_linked,
          lastUpdated: new Date().toLocaleTimeString('en-IN'),
        });
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Check URL query param or load default on mount
  useEffect(() => {
    let plateParam = 'KA-01-MJ-8821';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPlate = urlParams.get('plate');
      if (urlPlate) plateParam = urlPlate.toUpperCase();
    }
    setSearchQuery(plateParam);
    loadTrailForPlate(plateParam);
  }, [loadTrailForPlate]);

  // Step 2.2 — Hop-by-hop delayed trail animation with reduced motion check
  useEffect(() => {
    if (!trailData || trailData.length === 0) {
      setVisibleHopsCount(0);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setVisibleHopsCount(trailData.length);
      return;
    }

    // Start with 1 visible hop and increment by 1 every 500ms
    setVisibleHopsCount(1);
    const interval = setInterval(() => {
      setVisibleHopsCount((prev) => {
        if (prev >= trailData.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [trailData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadTrailForPlate(searchQuery);
    }
  };

  // Step 2.4 — Export Trail Report (Text/Blob Download)
  const handleExportReport = () => {
    if (!metadata || trailData.length === 0) return;

    const reportText =
      `=======================================================\n` +
      `DRISHTI — KARNATAKA STATE POLICE CO-PILOT\n` +
      `SUSPECT GEO-TRAIL TACTICAL REPORT\n` +
      `=======================================================\n\n` +
      `Target Plate:     ${searchedPlate}\n` +
      `Suspect Linked:   ${metadata.target || 'Under Investigation'}\n` +
      `Linked Case:      ${metadata.crimeLinked || 'FIR-2026-BL-0492'}\n` +
      `Trail Status:     ${metadata.status.toUpperCase()}\n` +
      `Total Hops:       ${metadata.totalHops}\n` +
      `Total Distance:   ${metadata.totalDistance} km\n` +
      `Total Duration:   ${metadata.duration} minutes\n` +
      `Generated At:     ${new Date().toLocaleString('en-IN')} IST\n\n` +
      `-------------------------------------------------------\n` +
      `CHRONOLOGICAL ANPR & CCTV SIGHTINGS TIMELINE:\n` +
      `-------------------------------------------------------\n` +
      trailData
        .map((hop, i) => {
          const prev = i > 0 ? trailData[i - 1] : null;
          const { speedKmh, diffMinutes, anomaly } = analyzeHopInsights(hop, prev);
          const camType = getCameraTypeDetails(hop.camera_name);
          const speedStr = speedKmh ? ` | Speed: ${speedKmh} km/h` : '';
          const anomalyStr = anomaly ? ` [ANOMALY: ${anomaly.label}]` : '';

          return (
            `[HOP ${hop.hop}] ${new Date(hop.timestamp).toLocaleString('en-IN')}\n` +
            `  Camera:      ${hop.camera_name} (${camType.label})\n` +
            `  Coordinates: ${hop.lat.toFixed(4)}, ${hop.lng.toFixed(4)}\n` +
            `  Confidence:  ${hop.confidence}% Match\n` +
            `  Distance:    ${hop.distance_from_crime_km} km from origin${speedStr}${anomalyStr}\n\n`
          );
        })
        .join('') +
      `-------------------------------------------------------\n` +
      `PROJECTED VECTOR ANALYSIS:\n` +
      `-------------------------------------------------------\n` +
      `Next Projected Heading: Extrapolated from Hop ${trailData.length - 1} -> Hop ${trailData.length}\n` +
      `Status: UNCONFIRMED PROJECTION (Tactical surveillance recommended)\n` +
      `=======================================================\n`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DRISHTI_GeoTrail_${searchedPlate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Step 3.4 — Projected Path Calculation
  const projectedPath = useMemo(() => {
    return computeProjectedPath(trailData);
  }, [trailData]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-void-000 text-paper-100 min-h-screen">
      {/* ── HEADER & SEARCH BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-600/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-phosphor-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-phosphor-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-phosphor-500 uppercase font-semibold">
              TACTICAL ANPR RECONSTRUCTION
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-paper-100 mt-1 flex items-center gap-2 font-sans">
            <Navigation className="w-6 h-6 text-phosphor-500" />
            Suspect Geo-Trail Tracker
          </h1>
          <p className="text-xs text-paper-100/60 mt-0.5 font-sans">
            Trace vehicle movements, analyze time-speed gaps, and project escape heading vectors.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Plate (e.g. KA-01-MJ-8821)..."
              className="w-full px-3.5 py-2 pl-9 rounded-md bg-steel-700 border border-steel-600/50 text-xs font-mono text-paper-100 placeholder:text-paper-100/40 focus:outline-none focus:border-phosphor-500 transition-all shadow-sm"
            />
            <Search className="w-4 h-4 text-paper-100/40 absolute left-3 top-2.5" />
          </div>
          <Button type="submit" variant="primary" size="sm" className="font-mono text-xs shrink-0">
            Search
          </Button>
        </form>
      </div>

      {/* ── NOT FOUND STATE ────────────────────────────────────────────────── */}
      {notFound ? (
        <EmptyState
          icon={Search}
          title={`No Sightings Found for Plate "${searchedPlate}"`}
          description="No automated camera hits or CCTV sightings detected in the ANPR matrix for this plate."
          className="py-16 bg-steel-700/20 border border-steel-600/30"
        >
          <div className="mt-4 flex flex-col items-center gap-3">
            <p className="text-xs font-mono text-paper-100/60">Try searching active sample watchlists:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['KA-01-MJ-8821', 'KA-05-EV-9012', 'KA-03-HA-4512'].map((plate) => (
                <button
                  key={plate}
                  onClick={() => {
                    setSearchQuery(plate);
                    loadTrailForPlate(plate);
                  }}
                  className="px-3 py-1.5 rounded bg-steel-700 hover:bg-steel-600 border border-steel-600/60 text-xs font-mono text-phosphor-500 transition-all"
                >
                  {plate}
                </button>
              ))}
            </div>
          </div>
        </EmptyState>
      ) : (
        /* ── MAIN DUAL-PANEL GRID (MAP + TIMELINE) ─────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] items-stretch">
          {/* ── LEFT: LEAFLET MAP DISPLAY (7 COLS) ─────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col min-h-[480px] lg:min-h-[620px] relative">
            <Card className="flex-1 p-2 relative overflow-hidden flex flex-col border border-steel-600/50 bg-steel-700/30">
              {loading && (
                <div className="absolute inset-0 z-50 bg-void-000/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Spinner size="lg" />
                  <p className="text-xs font-mono text-paper-100/70 mt-3 animate-pulse">
                    Reconstructing ANPR Spatial Vector Grid...
                  </p>
                </div>
              )}

              {/* Map Canvas */}
              <div className="w-full h-full min-h-[450px] rounded-lg overflow-hidden relative">
                <TrailMapView
                  trailData={trailData}
                  visibleHopsCount={visibleHopsCount}
                  highlightedHop={highlightedHop}
                  projectedPath={projectedPath}
                  onHopSelect={(h) => setHighlightedHop(h)}
                />

                {/* Map Overlay Top HUD Badge */}
                {metadata && (
                  <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 pointer-events-none">
                    <div className="bg-void-000/90 backdrop-blur border border-steel-600/60 rounded px-3 py-1.5 shadow-md flex items-center gap-2">
                      <span className="text-[10px] font-mono text-paper-100/50 uppercase">TARGET:</span>
                      <span className="text-xs font-mono font-bold text-phosphor-500">
                        {searchedPlate}
                      </span>
                    </div>

                    <div className="bg-void-000/90 backdrop-blur border border-steel-600/60 rounded px-3 py-1.5 shadow-md flex items-center gap-3 font-mono text-xs">
                      <div>
                        <span className="text-paper-100/50 text-[10px]">DISTANCE:</span>{' '}
                        <span className="font-semibold text-paper-100">{metadata.totalDistance} km</span>
                      </div>
                      <span className="text-paper-100/30">|</span>
                      <div>
                        <span className="text-paper-100/50 text-[10px]">DURATION:</span>{' '}
                        <span className="font-semibold text-paper-100">{metadata.duration}m</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Legend Overlay */}
                <div className="absolute bottom-3 left-3 z-[400] bg-void-000/90 backdrop-blur border border-steel-600/60 rounded p-2.5 shadow-md font-mono text-[10px] space-y-1.5 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-success-500" />
                    <span className="text-paper-100/70">Hop 1 (Origin)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-phosphor-500" />
                    <span className="text-paper-100/70">ANPR / CCTV Hop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-critical-500" />
                    <span className="text-paper-100/70">Last Confirmed Sighting</span>
                  </div>
                  {projectedPath && (
                    <div className="flex items-center gap-2 border-t border-steel-600/40 pt-1 mt-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-warn-500/70 border border-dashed border-warn-500" />
                      <span className="text-warn-500 font-semibold">Projected Vector</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* ── RIGHT: SIGHTINGS TIMELINE & INSIGHTS PANEL (5 COLS) ─────────── */}
          <div className="lg:col-span-5 flex flex-col min-h-[480px]">
            <Card className="flex-1 flex flex-col p-4 border border-steel-600/50 bg-steel-700/30 justify-between space-y-4">
              {/* Timeline Header & Export */}
              <div className="flex items-center justify-between pb-3 border-b border-steel-600/30">
                <div>
                  <h3 className="text-sm font-bold text-paper-100 flex items-center gap-2 font-sans">
                    <Clock className="w-4 h-4 text-phosphor-500" />
                    Sighting Timeline & Insights
                  </h3>
                  {metadata && (
                    <p className="text-[11px] font-mono text-paper-100/50 mt-0.5">
                      {metadata.target} • {metadata.totalHops} Hops Captured
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleExportReport}
                  variant="secondary"
                  size="sm"
                  className="font-mono text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </Button>
              </div>

              {/* Hop Timeline List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[500px]">
                {trailData.map((hop, idx) => {
                  const prevHop = idx > 0 ? trailData[idx - 1] : null;
                  const { speedKmh, diffMinutes, anomaly } = analyzeHopInsights(hop, prevHop);
                  const camDetails = getCameraTypeDetails(hop.camera_name);
                  const CamIcon = camDetails.icon;
                  const isLowConf = hop.confidence < 90;
                  const isHighlighted = highlightedHop === hop.hop;

                  return (
                    <div
                      key={hop.hop}
                      onClick={() => setHighlightedHop(hop.hop)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isHighlighted
                          ? 'bg-steel-700 border-phosphor-500 shadow-md ring-1 ring-phosphor-500/40'
                          : 'bg-steel-700/50 border-steel-600/40 hover:border-steel-600'
                      }`}
                    >
                      {/* Top Row: Hop Badge + Camera Type + Timestamp */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={idx === 0 ? 'success' : idx === trailData.length - 1 ? 'critical' : 'info'}>
                            Hop {hop.hop}
                          </Badge>

                          <span className="flex items-center gap-1 text-[11px] font-mono text-paper-100/60 bg-steel-600/20 px-2 py-0.5 rounded">
                            <CamIcon className="w-3 h-3 text-phosphor-500" />
                            <span>{camDetails.label}</span>
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-paper-100/50">
                          {new Date(hop.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Camera Location Name */}
                      <h4 className="text-xs font-semibold text-paper-100 line-clamp-1">
                        {hop.camera_name}
                      </h4>

                      {/* Speed Anomaly Badge or Speed Detail */}
                      {anomaly ? (
                        <div className="mt-2 p-2 rounded bg-steel-700/80 border border-steel-600/50 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle
                              className={`w-3.5 h-3.5 ${
                                anomaly.variant === 'critical' ? 'text-critical-500' : 'text-warn-500'
                              }`}
                            />
                            <Badge variant={anomaly.variant}>{anomaly.label}</Badge>
                          </div>
                          <p className="text-[10px] font-mono text-paper-100/60 leading-snug">
                            {anomaly.detail}
                          </p>
                        </div>
                      ) : (
                        speedKmh && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-paper-100/50">
                            <Zap className="w-3 h-3 text-phosphor-500/70" />
                            <span>Implied Speed: {speedKmh} km/h ({diffMinutes}m elapsed)</span>
                          </div>
                        )
                      )}

                      {/* Bottom Row: Confidence & Distance */}
                      <div className="mt-3 pt-2 border-t border-steel-600/30 flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-phosphor-500" />
                          <Badge variant={isLowConf ? 'warning' : 'success'}>
                            {hop.confidence}% Match {isLowConf ? '(Low Confidence)' : ''}
                          </Badge>
                        </div>
                        <span className="text-paper-100/50">
                          {hop.distance_from_crime_km} km from origin
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Step 3.4 — Projected Path Card on Timeline */}
                {projectedPath && (
                  <div className="p-3.5 rounded-lg border border-dashed border-warn-500/40 bg-warn-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-warn-500" />
                        <Badge variant="warning">PROJECTED HEADING</Badge>
                      </div>
                      <span className="text-[11px] font-mono text-warn-500">
                        ~{projectedPath.projectedTime} IST
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-paper-100/90">
                      Estimated Escape Corridor (Unconfirmed)
                    </p>
                    <p className="text-[11px] font-mono text-paper-100/60 leading-snug">
                      Extrapolated continuation vector derived from velocity & heading of final 2 sightings.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Target Meta Footer */}
              {metadata && (
                <div className="pt-3 border-t border-steel-600/30 flex items-center justify-between text-[11px] font-mono text-paper-100/60">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-phosphor-500" />
                    <span>Case: {metadata.crimeLinked || 'FIR-2026-BL-0492'}</span>
                  </div>
                  <span className="text-phosphor-500 uppercase font-semibold">
                    Status: {metadata.status}
                  </span>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
