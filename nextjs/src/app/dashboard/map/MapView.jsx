'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView({
  filtered,
  selectedHotspot,
  setSelectedHotspot,
  SEVERITY_HEX,
  SEVERITY_RADIUS,
  tileUrl
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (containerRef.current._leaflet_id) {
      delete containerRef.current._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      scrollWheelZoom: true,
    });

    const activeTileUrl = tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(activeTileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current && containerRef.current._leaflet_id) {
        delete containerRef.current._leaflet_id;
      }
    };
  }, [tileUrl]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filtered.forEach((h) => {
      const radius = SEVERITY_RADIUS[h.severity] || 12;
      const color = SEVERITY_HEX[h.severity] || '#3b82f6';

      const marker = L.circleMarker([h.lat, h.lng], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.75,
      });

      marker.bindTooltip(
        `<div class="text-xs font-sans p-1">
          <strong class="font-bold text-slate-900">${h.area}</strong>
          <p class="text-slate-600">${h.count} incidents · <span class="capitalize font-semibold">${h.severity}</span></p>
        </div>`
      );

      marker.on('click', () => {
        if (setSelectedHotspot) setSelectedHotspot(h);
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [filtered, SEVERITY_HEX, SEVERITY_RADIUS, setSelectedHotspot]);

  return <div ref={containerRef} className="w-full h-full min-h-[650px] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800" style={{ width: '100%', height: '100%', minHeight: '650px' }} />;
}
