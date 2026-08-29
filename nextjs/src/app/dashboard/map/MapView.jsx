'use client';

import { useEffect, useRef } from 'react';

function injectLeafletCSS() {
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id   = 'leaflet-css';
  link.rel  = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1/dist/leaflet.css';
  document.head.appendChild(link);
}

export default function MapView({ filtered, selectedHotspot, setSelectedHotspot, SEVERITY_HEX, SEVERITY_RADIUS, tileUrl }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);

  // ── Init Leaflet (dynamic import — no SSR) ────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    injectLeafletCSS();

    let map;
    let cancelled = false;

    import('leaflet').then((mod) => {
      if (cancelled) return;
      const L = mod.default;

      if (containerRef.current._leaflet_id) {
        delete containerRef.current._leaflet_id;
      }

      map = L.map(containerRef.current, {
        center: [12.9716, 77.5946],
        zoom:   12,
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
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      if (containerRef.current?._leaflet_id) delete containerRef.current._leaflet_id;
    };
  }, [tileUrl]);

  // ── Update markers ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((mod) => {
      const L = mod.default;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      filtered.forEach((h) => {
        const radius = SEVERITY_RADIUS?.[h.severity] || 12;
        const color  = SEVERITY_HEX?.[h.severity]    || '#3b82f6';

        const marker = L.circleMarker([h.lat, h.lng], {
          radius, fillColor: color, color: '#ffffff',
          weight: 2, opacity: 0.9, fillOpacity: 0.75,
        });

        marker.bindTooltip(
          `<div class="text-xs font-sans p-1">
            <strong class="font-bold text-slate-900">${h.area}</strong>
            <p class="text-slate-600">${h.count} incidents · <span class="capitalize font-semibold">${h.severity}</span></p>
          </div>`
        );

        marker.on('click', () => { if (setSelectedHotspot) setSelectedHotspot(h); });
        marker.addTo(mapRef.current);
        markersRef.current.push(marker);
      });
    });
  }, [filtered, SEVERITY_HEX, SEVERITY_RADIUS, setSelectedHotspot]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[650px] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800"
      style={{ width: '100%', height: '100%', minHeight: '650px' }}
    />
  );
}
