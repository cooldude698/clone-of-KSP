'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function AnimatedTrail({ trail }) {
  const map = useMap();
  useEffect(() => {
    if (!trail || trail.length < 2) return;
    map.fitBounds(trail.map((t) => [t.lat, t.lng]), { padding: [30, 30] });
  }, [map, trail]);
  return null;
}

export default function GeoTrailCard({ data, title }) {
  const trail = data?.trail || [];
  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const positions = trail.map((t) => [t.lat, t.lng]);
  const center = positions.length > 0 ? positions[0] : [12.9716, 77.5946];

  return (
    <div className="rounded-xl bg-steel-700 border border-steel-600/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-steel-600/40">
        <p className="text-xs font-semibold text-paper-100/80">{title}</p>
        <p className="text-[10px] text-paper-100/50 mt-0.5">Suspect geo-trail reconstruction</p>
      </div>
      {trail.length === 0 ? (
        <div className="h-52 flex items-center justify-center bg-void-000">
          <p className="text-xs text-paper-100/40">No trail data available</p>
        </div>
      ) : (
        <MapContainer center={center} zoom={13} style={{ height: '280px', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer url={tileUrl} attribution="© OpenStreetMap" />
          <AnimatedTrail trail={trail} />
          {/* Trail polyline */}
          <Polyline positions={positions} color="#d4611c" weight={3} dashArray="6 4" opacity={0.85} />
          {/* Camera markers */}
          {trail.map((point, i) => (
            <CircleMarker
              key={i}
              center={[point.lat, point.lng]}
              radius={i === 0 ? 10 : i === trail.length - 1 ? 10 : 7}
              fillColor={i === 0 ? '#c8372d' : i === trail.length - 1 ? '#1a8a5a' : '#2d83d9'}
              fillOpacity={0.9}
              color="#0a1628"
              weight={2}
            >
              <Tooltip>
                <div className="text-xs">
                  <strong>Hop {i + 1}: {point.camera_name || `Camera ${i + 1}`}</strong>
                  {point.timestamp && <p>{point.timestamp}</p>}
                  {point.confidence && <p>Confidence: {point.confidence}%</p>}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      )}
      <div className="px-4 py-2 border-t border-steel-600/40 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-critical-500" />
          <span className="text-[10px] text-paper-100/50">Start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-phosphor-500/60" />
          <span className="text-[10px] text-paper-100/50">Camera hop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
          <span className="text-[10px] text-paper-100/50">Last seen</span>
        </div>
        <span className="text-[10px] text-paper-100/40 ml-auto">{trail.length} hops</span>
      </div>
    </div>
  );
}
