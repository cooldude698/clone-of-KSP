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

    // Remove old _leaflet_id if present
    if (containerRef.current._leaflet_id) {
      delete containerRef.current._leaflet_id;
    }

    // Initialize Leaflet map instance
    const map = L.map(containerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

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

  // Update markers when filtered hotspots change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filtered.forEach((h) => {
      const radius = SEVERITY_RADIUS[h.severity] || 12;
      const color = SEVERITY_HEX[h.severity] || '#f0a848';

      const marker = L.circleMarker([h.lat, h.lng], {
        radius,
        fillColor: color,
        fillOpacity: 0.65,
        color,
        weight: 2,
      });

      marker.bindTooltip(
        `<div class="text-xs font-sans">
          <strong>${h.area}</strong>
          <p>${h.count} incidents -- ${h.severity}</p>
        </div>`
      );

      marker.on('click', () => {
        if (setSelectedHotspot) setSelectedHotspot(h);
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [filtered, SEVERITY_HEX, SEVERITY_RADIUS, setSelectedHotspot]);

  return <div ref={containerRef} className="w-full h-full" />;
}
