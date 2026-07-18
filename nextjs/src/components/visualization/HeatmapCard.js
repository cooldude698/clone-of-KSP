'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const heat = L.heatLayer(
      points.map((p) => [p.lat, p.lng, p.intensity / 10]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: { 0.4: '#2E6B4C', 0.65: '#D97706', 1: '#B91C1C' },
      }
    );
    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points]);
  return null;
}

export default function HeatmapCard({ data, title }) {
  const points = data?.points || [];
  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="rounded-xl bg-steel-700 border border-steel-600/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-steel-600/40">
        <p className="text-xs font-semibold text-paper-100/80">{title}</p>
      </div>
      {points.length === 0 ? (
        <div className="h-52 flex items-center justify-center bg-void-000">
          <p className="text-xs text-paper-100/40">No heatmap data available</p>
        </div>
      ) : (
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ height: '260px', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer url={tileUrl} attribution="© OpenStreetMap" />
          <HeatmapLayer points={points} />
        </MapContainer>
      )}
      <div className="px-4 py-2 border-t border-steel-600/40 flex items-center gap-3">
        <div className="flex gap-1.5 items-center">
          <div className="w-12 h-2 rounded-full" style={{ background: 'linear-gradient(to right, #2E6B4C, #D97706, #B91C1C)' }} />
        </div>
        <span className="text-[10px] text-paper-100/50">Low → High intensity</span>
      </div>
    </div>
  );
}
