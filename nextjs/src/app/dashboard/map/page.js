'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);

const MOCK_HOTSPOTS = [
  { lat: 12.9344, lng: 77.6264, area: 'Silk Board', count: 48, severity: 'critical' },
  { lat: 12.9762, lng: 77.6033, area: 'MG Road', count: 32, severity: 'high' },
  { lat: 12.9698, lng: 77.7499, area: 'Whitefield', count: 27, severity: 'high' },
  { lat: 12.9279, lng: 77.6271, area: 'HSR Layout', count: 22, severity: 'high' },
  { lat: 13.0456, lng: 77.6256, area: 'Hebbal', count: 19, severity: 'medium' },
  { lat: 12.9141, lng: 77.5998, area: 'JP Nagar', count: 15, severity: 'medium' },
  { lat: 12.9542, lng: 77.4975, area: 'Rajajinagar', count: 13, severity: 'medium' },
  { lat: 13.0035, lng: 77.5971, area: 'Yeshwantpur', count: 10, severity: 'low' },
  { lat: 12.9975, lng: 77.7162, area: 'KR Puram', count: 9, severity: 'low' },
];

const SEVERITY_HEX = {
  critical: '#c8372d',
  high: '#e05a3a',
  medium: '#f0a848',
  low: '#4A8B6F',
};

const SEVERITY_RADIUS = { critical: 22, high: 16, medium: 12, low: 8 };

const SEVERITY_DOT_CLASS = {
  critical: 'bg-critical-500',
  high: 'bg-warn-500',
  medium: 'bg-warn-500/60',
  low: 'bg-phosphor-500',
};

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => { setMounted(true); }, []);

  const filtered = filterSeverity === 'all'
    ? MOCK_HOTSPOTS
    : MOCK_HOTSPOTS.filter((h) => h.severity === filterSeverity);

  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="flex h-full">
      <div className="w-72 flex-shrink-0 border-r border-steel-600/40 flex flex-col bg-steel-700">
        <div className="p-4 border-b border-steel-600/40">
          <h2 className="text-sm font-bold text-paper-100">Crime Hotspot Map</h2>
          <p className="text-xs text-paper-100/50 mt-0.5">Bengaluru Urban District</p>
        </div>

        <div className="p-4 border-b border-steel-600/40">
          <p className="text-xs text-paper-100/50 uppercase tracking-wider mb-2 font-semibold">Filter Severity</p>
          <div className="flex flex-wrap gap-1.5">
            {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all
                  ${filterSeverity === s
                    ? 'bg-phosphor-500 text-paper-100'
                    : 'bg-steel-600/40 text-paper-100/60 hover:text-paper-100 border border-steel-600/50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map((h, i) => (
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
                  <span className="text-sm text-paper-100/90 font-medium">{h.area}</span>
                </div>
                <span className="text-xs font-mono font-bold text-paper-100/80">{h.count}</span>
              </div>
              <p className="text-[10px] text-paper-100/40 mt-1 ml-4 capitalize">{h.severity} -- incidents/month</p>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-steel-600/40 space-y-1.5">
          {Object.entries(SEVERITY_DOT_CLASS).map(([sev, cls]) => (
            <div key={sev} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
              <span className="text-xs text-paper-100/50 capitalize">{sev}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        {mounted && (
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap" />
            {filtered.map((h, i) => (
              <CircleMarker
                key={i}
                center={[h.lat, h.lng]}
                radius={SEVERITY_RADIUS[h.severity]}
                fillColor={SEVERITY_HEX[h.severity]}
                fillOpacity={0.55}
                color={SEVERITY_HEX[h.severity]}
                weight={2}
                eventHandlers={{ click: () => setSelectedHotspot(h) }}
              >
                <Tooltip>
                  <div className="text-xs">
                    <strong>{h.area}</strong>
                    <p>{h.count} incidents -- {h.severity}</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        {selectedHotspot && (
          <div className="absolute bottom-6 left-4 bg-steel-700/95 backdrop-blur border border-steel-600/60 rounded-xl p-4 shadow-2xl z-[1000] max-w-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${SEVERITY_DOT_CLASS[selectedHotspot.severity]}`} />
                  <h3 className="text-sm font-bold text-paper-100">{selectedHotspot.area}</h3>
                </div>
                <p className="text-2xl font-bold font-mono text-warn-500">{selectedHotspot.count}</p>
                <p className="text-xs text-paper-100/50">incidents this month</p>
                <p className="text-xs text-paper-100/50 mt-1 capitalize">Severity: {selectedHotspot.severity}</p>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-paper-100/40 hover:text-paper-100/80 text-xs transition-colors"
              >X</button>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <div className="bg-steel-700/90 backdrop-blur border border-steel-600/60 rounded-lg px-3 py-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-phosphor-500" />
            <span className="text-xs text-paper-100/80 font-medium">Live Crime Map</span>
          </div>
          <div className="bg-steel-700/90 backdrop-blur border border-steel-600/60 rounded-lg px-3 py-2 text-xs text-paper-100/50 font-mono text-center">
            {filtered.length} hotspots
          </div>
        </div>
      </div>
    </div>
  );
}