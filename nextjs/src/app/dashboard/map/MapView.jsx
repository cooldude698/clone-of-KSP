'use client';

import { useEffect, useRef } from 'react';
import { DEMO_CRIME_ROUTES, DEMO_ANPR_CAMERAS } from '@/lib/demo-data';

function injectLeafletCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id   = 'leaflet-css';
  link.rel  = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

export default function MapView({
  filtered = [],
  selectedHotspot,
  setSelectedHotspot,
  selectedRoute,
  setSelectedRoute,
  SEVERITY_HEX,
  SEVERITY_RADIUS,
  tileUrl,
  showHotspots = true,
  showRoutes = true,
  showCameras = true,
  routes = DEMO_CRIME_ROUTES,
  cameras = DEMO_ANPR_CAMERAS,
}) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const layersRef    = useRef({
    hotspots: [],
    routes: [],
    cameras: [],
  });

  // ── Init Leaflet Map ───────────────────────────────────────────────────────
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
        zoom: 12,
        scrollWheelZoom: true,
      });

      const activeTileUrl = tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      L.tileLayer(activeTileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 250);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current?._leaflet_id) {
        delete containerRef.current._leaflet_id;
      }
    };
  }, [tileUrl]);

  // ── Render Hotspots, Routes & Cameras ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((mod) => {
      const L = mod.default;
      const map = mapRef.current;
      if (!map) return;

      // Clear previous layers
      layersRef.current.hotspots.forEach(m => m.remove());
      layersRef.current.routes.forEach(m => m.remove());
      layersRef.current.cameras.forEach(m => m.remove());
      layersRef.current = { hotspots: [], routes: [], cameras: [] };

      // ── 1. Render Crime Routes / Corridors ──────────────────────────────
      if (showRoutes && Array.isArray(routes)) {
        routes.forEach((r) => {
          // points in DEMO_CRIME_ROUTES are [lng, lat], Leaflet expects [lat, lng]
          const latLngs = r.points.map(pt => [pt[1], pt[0]]);
          const isSelected = selectedRoute?.id === r.id;
          const routeColor = r.color || '#ef4444';

          // Outer glowing halo
          const halo = L.polyline(latLngs, {
            color: routeColor,
            weight: isSelected ? 16 : 10,
            opacity: isSelected ? 0.45 : 0.22,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          // Core polyline
          const line = L.polyline(latLngs, {
            color: routeColor,
            weight: isSelected ? 5 : 3.5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          // Dashed center highlight
          const dash = L.polyline(latLngs, {
            color: '#ffffff',
            weight: 1.5,
            opacity: isSelected ? 0.9 : 0.4,
            dashArray: '6, 8',
          }).addTo(map);

          // Popup on click
          const popupHtml = `
            <div style="font-family: sans-serif; padding: 4px; min-width: 220px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 10px; font-weight: 700; color: ${routeColor}; text-transform: uppercase;">
                  🚨 ${r.id} · ${r.threat_level?.toUpperCase()}
                </span>
                <span style="font-size: 10px; font-weight: 600; background: rgba(0,0,0,0.06); padding: 2px 5px; border-radius: 4px;">
                  ${r.distance_km} km
                </span>
              </div>
              <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">${r.name}</h4>
              <p style="font-size: 11px; margin: 0 0 4px 0; color: #475569;">${r.description}</p>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
                <strong>Suspect:</strong> ${r.suspect_name || 'Syndicate Network'} · <strong>Est:</strong> ${r.est_transit_time || '35m'}
              </div>
            </div>
          `;

          line.bindPopup(popupHtml);
          halo.bindPopup(popupHtml);

          const handleClick = () => {
            if (setSelectedRoute) setSelectedRoute(r);
            if (setSelectedHotspot) setSelectedHotspot(null);
          };

          line.on('click', handleClick);
          halo.on('click', handleClick);

          // Route hover tooltip
          line.bindTooltip(`<strong>${r.short_name || r.name}</strong><br/>${r.distance_km} km · ${r.threat_level?.toUpperCase()}`, {
            sticky: true,
            className: 'route-map-tooltip',
          });

          layersRef.current.routes.push(halo, line, dash);
        });
      }

      // ── 2. Render ANPR Cameras ──────────────────────────────────────────
      if (showCameras && Array.isArray(cameras)) {
        cameras.forEach((cam) => {
          const camIcon = L.divIcon({
            className: 'custom-anpr-icon',
            html: `
              <div style="
                width: 22px;
                height: 22px;
                background: rgba(6, 182, 212, 0.95);
                border: 2px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(6, 182, 212, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">
                <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const marker = L.marker([cam.lat, cam.lng], { icon: camIcon }).addTo(map);

          marker.bindTooltip(`
            <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: #0891b2;">📷 ANPR: ${cam.id}</strong>
              <div style="font-weight: 600; color: #0f172a;">${cam.name}</div>
              <div style="font-size: 9px; color: #dc2626; font-weight: 700; text-transform: uppercase;">● ${cam.status || 'ACTIVE'}</div>
            </div>
          `);

          layersRef.current.cameras.push(marker);
        });
      }

      // ── 3. Render Crime Hotspots ────────────────────────────────────────
      if (showHotspots && Array.isArray(filtered)) {
        filtered.forEach((h) => {
          const radius = SEVERITY_RADIUS?.[h.severity] || 14;
          const color  = SEVERITY_HEX?.[h.severity]    || '#3b82f6';
          const isSelected = selectedHotspot?.area === h.area;

          // Pulse outer circle
          const pulse = L.circleMarker([h.lat, h.lng], {
            radius: radius * 1.8,
            fillColor: color,
            fillOpacity: isSelected ? 0.35 : 0.15,
            stroke: false,
          }).addTo(map);

          // Core marker
          const marker = L.circleMarker([h.lat, h.lng], {
            radius: isSelected ? radius + 3 : radius,
            fillColor: color,
            color: '#ffffff',
            weight: isSelected ? 3 : 2,
            opacity: 0.95,
            fillOpacity: isSelected ? 0.9 : 0.75,
          }).addTo(map);

          marker.bindTooltip(
            `<div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
              <strong style="font-weight: 700; color: #0f172a;">${h.area}</strong>
              <p style="margin: 2px 0 0; color: #475569;">
                <span style="font-weight: 700; color: ${color};">${h.count} FIRs</span> · <span style="text-transform: capitalize; font-weight: 600;">${h.severity}</span>
              </p>
              ${h.top_crime_types?.[0] ? `<p style="margin: 2px 0 0; font-size: 10px; color: #64748b; text-transform: capitalize;">Primary: ${h.top_crime_types[0].replace(/_/g, ' ')}</p>` : ''}
            </div>`
          );

          const handleClick = () => {
            if (setSelectedHotspot) setSelectedHotspot(h);
            if (setSelectedRoute) setSelectedRoute(null);
          };

          marker.on('click', handleClick);
          pulse.on('click', handleClick);

          layersRef.current.hotspots.push(pulse, marker);
        });
      }
    });
  }, [filtered, routes, cameras, showHotspots, showRoutes, showCameras, selectedRoute, selectedHotspot, SEVERITY_HEX, SEVERITY_RADIUS, setSelectedHotspot, setSelectedRoute]);

  // ── Pan / Zoom on Selection ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedHotspot && selectedHotspot.lat && selectedHotspot.lng) {
      mapRef.current.flyTo([selectedHotspot.lat, selectedHotspot.lng], 14, { duration: 1.2 });
    } else if (selectedRoute && Array.isArray(selectedRoute.points) && selectedRoute.points.length > 0) {
      import('leaflet').then((mod) => {
        const L = mod.default;
        const bounds = L.latLngBounds(selectedRoute.points.map(pt => [pt[1], pt[0]]));
        mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, duration: 1.2 });
      });
    }
  }, [selectedHotspot, selectedRoute]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[650px] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800"
      style={{ width: '100%', height: '100%', minHeight: '650px' }}
    />
  );
}
