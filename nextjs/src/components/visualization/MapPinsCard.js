'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const PIN_COLORS = {
  crime_scene: '#c8372d',
  camera: '#2d83d9',
  suspect: '#d4611c',
  safe_zone: '#1a8a5a',
  default: '#64748b',
};

function getCenter(locations) {
  if (!locations || locations.length === 0) return [12.9716, 77.5946];
  const lat = locations.reduce((s, l) => s + l.lat, 0) / locations.length;
  const lng = locations.reduce((s, l) => s + l.lng, 0) / locations.length;
  return [lat, lng];
}

export default function MapPinsCard({ data, title }) {
  const containerRef = useRef(null);
  const locations = data?.locations || [];
  const center = getCenter(locations);
  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  useEffect(() => {
    return () => {
      if (containerRef.current && containerRef.current._leaflet_id) {
        delete containerRef.current._leaflet_id;
      }
    };
  }, []);

  if (locations.length === 0) {
    return (
      <div className="rounded-xl bg-steel-700 border border-steel-600/40 p-4">
        <p className="text-xs text-paper-100/70 font-semibold mb-2">{title}</p>
        <div className="h-52 flex items-center justify-center rounded-lg bg-void-000">
          <p className="text-xs text-paper-100/40">No location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-steel-700 border border-steel-600/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-steel-600/40">
        <p className="text-xs font-semibold text-paper-100/80">{title}</p>
      </div>
      <div ref={containerRef} className="w-full">
        <MapContainer
        center={center}
        zoom={13}
        style={{ height: '260px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer url={tileUrl} attribution="© OpenStreetMap" />
        {locations.map((loc, i) => (
          <CircleMarker
            key={i}
            center={[loc.lat, loc.lng]}
            radius={8}
            fillColor={PIN_COLORS[loc.type] || PIN_COLORS.default}
            fillOpacity={0.85}
            color="#0a1628"
            weight={2}
          >
            <Tooltip>
              <div className="text-xs">
                <strong>{loc.label}</strong>
                {loc.description && <p>{loc.description}</p>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      </div>
      <div className="px-4 py-2 border-t border-steel-600/40 flex flex-wrap gap-3">
        {Object.entries(PIN_COLORS)
          .filter(([k]) => k !== 'default')
          .map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-paper-100/50 capitalize">{type.replace('_', ' ')}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
