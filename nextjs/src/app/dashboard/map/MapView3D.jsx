'use client';

import { useEffect, useRef, useState } from 'react';

// ── Tile Style ────────────────────────────────────────────────────────────
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

// ── Crime Routes ──────────────────────────────────────────────────────────
const CRIME_ROUTE_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Bullet Ramesh Escape Corridor', syndicate: 'SYN-VT-01', color: '#ef4444' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.6215, 12.9175], [77.6320, 12.9050], [77.6450, 12.8900],
          [77.6550, 12.8700], [77.6600, 12.8452], [77.6900, 12.8100], [77.7200, 12.7800],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Helmet Imran Narcotics Drop', syndicate: 'SYN-ND-02', color: '#10b981' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.6900, 12.9350], [77.6700, 12.9600], [77.6400, 12.9784],
          [77.6256, 13.0456], [77.5500, 13.2000], [77.1000, 13.3400],
        ],
      },
    },
  ],
};

const ANPR_NODES = [
  { id: 'CAM-BLR-0045', name: 'Silk Board TTMC',   lng: 77.6215, lat: 12.9175 },
  { id: 'CAM-BLR-0088', name: 'Indiranagar 100ft', lng: 77.6408, lat: 12.9784 },
  { id: 'CAM-WF-0019',  name: 'Bellandur ORR',     lng: 77.6900, lat: 12.9350 },
  { id: 'CAM-HEB-0012', name: 'Hebbal Expressway', lng: 77.6256, lat: 13.0456 },
  { id: 'CAM-ATT-0001', name: 'Attibele Border',   lng: 77.7200, lat: 12.7800 },
];

const SEVERITY_COLOR = {
  critical: '#c8372d', high: '#e05a3a', medium: '#f0a848', low: '#4A8B6F',
};

function injectCSS() {
  if (document.getElementById('maplibre-gl-css')) return;
  const link = document.createElement('link');
  link.id   = 'maplibre-gl-css';
  link.rel  = 'stylesheet';
  link.href = 'https://unpkg.com/maplibre-gl@6/dist/maplibre-gl.css';
  document.head.appendChild(link);
}

export default function MapView3D({ filtered = [], selectedHotspot, setSelectedHotspot, is3D = true }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const mlRef        = useRef(null); // stores the maplibre-gl module namespace
  const [ready,  setReady]  = useState(false);
  const [error,  setError]  = useState(null);

  // ── Load maplibre-gl dynamically and init map ─────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    injectCSS();

    let map;
    let cancelled = false;

    import('maplibre-gl').then((ml) => {
      if (cancelled || mapRef.current) return;
      mlRef.current = ml; // ml.Map, ml.Popup, ml.NavigationControl …

      map = new ml.Map({
        container: containerRef.current,
        style:     MAP_STYLE,
        center:    [77.5946, 12.9716],
        zoom:      13,
        pitch:     is3D ? 55 : 0,
        bearing:   is3D ? -20 : 0,
        antialias: true,
      });

      mapRef.current = map;

      map.on('error', (e) => {
        const msg = e?.error?.message ?? (typeof e === 'string' ? e : 'Map tile error');
        console.warn('[MapView3D]', msg);
        // non-fatal tile errors — don't crash the whole map
      });

      map.on('load', () => {
        if (cancelled) return;

        // ── 3D Buildings ────────────────────────────────────────────────────
        const styleLayers = map.getStyle().layers ?? [];
        const firstSymbol = styleLayers.find(l => l.type === 'symbol')?.id;
        try {
          map.addLayer({
            id: '3d-buildings', type: 'fill-extrusion',
            source: 'openmaptiles', 'source-layer': 'building', minzoom: 12,
            paint: {
              'fill-extrusion-color': ['interpolate', ['linear'], ['zoom'], 12, '#e8e2d8', 16, '#f0ebe3'],
              'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 12, 0, 12.5,
                ['coalesce', ['get', 'render_height'], ['get', 'height'], 10]],
              'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 12, 0, 12.5,
                ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0]],
              'fill-extrusion-opacity': 0.88,
            },
            layout: { visibility: is3D ? 'visible' : 'none' },
          }, firstSymbol);
        } catch (e) { console.warn('[MapView3D] buildings layer:', e.message); }

        // ── Crime Routes ────────────────────────────────────────────────────
        map.addSource('crime-routes', { type: 'geojson', data: CRIME_ROUTE_GEOJSON });
        map.addLayer({ id: 'crime-routes-glow', type: 'line', source: 'crime-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': ['get', 'color'], 'line-width': 12, 'line-opacity': 0.18, 'line-blur': 5 } });
        map.addLayer({ id: 'crime-routes-line', type: 'line', source: 'crime-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': ['get', 'color'], 'line-width': 3.5, 'line-opacity': 0.95, 'line-dasharray': [2, 1.5] } });

        // ── ANPR Cameras ────────────────────────────────────────────────────
        map.addSource('anpr-nodes', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: ANPR_NODES.map(n => ({
            type: 'Feature', properties: { id: n.id, name: n.name },
            geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
          })) },
        });
        map.addLayer({ id: 'anpr-pulse', type: 'circle', source: 'anpr-nodes',
          paint: { 'circle-radius': 24, 'circle-color': '#06b6d4', 'circle-opacity': 0.12,
            'circle-stroke-width': 1.5, 'circle-stroke-color': '#06b6d4', 'circle-stroke-opacity': 0.45 } });
        map.addLayer({ id: 'anpr-dot', type: 'circle', source: 'anpr-nodes',
          paint: { 'circle-radius': 6, 'circle-color': '#06b6d4', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });

        // Route click popup
        map.on('click', 'crime-routes-line', (e) => {
          const p = e.features[0].properties;
          new ml.Popup({ closeButton: false }).setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:monospace;padding:8px 12px;font-size:11px;">
              <div style="font-weight:700;color:#ef4444;margin-bottom:3px;">🚨 ${p.syndicate}</div>
              <div>${p.name}</div></div>`)
            .addTo(map);
        });
        map.on('mouseenter', 'crime-routes-line', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'crime-routes-line', () => { map.getCanvas().style.cursor = ''; });

        setReady(true);
      });
    }).catch(err => {
      console.error('[MapView3D] load failed:', err);
      setError(err?.message || String(err));
    });

    return () => {
      cancelled = true;
      if (map) { map.remove(); mapRef.current = null; setReady(false); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 3D / 2D toggle ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    mapRef.current.easeTo({ pitch: is3D ? 55 : 0, bearing: is3D ? -20 : 0, duration: 900 });
    if (mapRef.current.getLayer('3d-buildings'))
      mapRef.current.setLayoutProperty('3d-buildings', 'visibility', is3D ? 'visible' : 'none');
  }, [is3D, ready]);

  // ── Hotspot circles ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;
    const geojson = {
      type: 'FeatureCollection',
      features: filtered.map((h, i) => ({
        type: 'Feature',
        properties: { id: i, color: SEVERITY_COLOR[h.severity] || '#3b82f6',
          radius: h.severity === 'critical' ? 18 : h.severity === 'high' ? 13 : h.severity === 'medium' ? 9 : 6 },
        geometry: { type: 'Point', coordinates: [h.lng, h.lat] },
      })),
    };
    if (map.getSource('hotspots')) { map.getSource('hotspots').setData(geojson); return; }
    map.addSource('hotspots', { type: 'geojson', data: geojson });
    map.addLayer({ id: 'hotspot-pulse', type: 'circle', source: 'hotspots',
      paint: { 'circle-radius': ['*', ['get', 'radius'], 2.5], 'circle-color': ['get', 'color'], 'circle-opacity': 0.15 } });
    map.addLayer({ id: 'hotspot-dot', type: 'circle', source: 'hotspots',
      paint: { 'circle-radius': ['get', 'radius'], 'circle-color': ['get', 'color'],
        'circle-stroke-width': 2, 'circle-stroke-color': '#fff', 'circle-opacity': 0.9 } });
    map.on('click', 'hotspot-dot', (e) => {
      const h = filtered[e.features[0].properties.id];
      if (h && setSelectedHotspot) setSelectedHotspot(h);
    });
    map.on('mouseenter', 'hotspot-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'hotspot-dot', () => { map.getCanvas().style.cursor = ''; });
  }, [filtered, ready, setSelectedHotspot]);

  // ── Fly to selected hotspot ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready || !selectedHotspot) return;
    mapRef.current.flyTo({ center: [selectedHotspot.lng, selectedHotspot.lat],
      zoom: 15, pitch: is3D ? 55 : 0, bearing: is3D ? -20 : 0, duration: 1400 });
  }, [selectedHotspot, ready, is3D]);

  if (error) return (
    <div style={{ width: '100%', minHeight: 650, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8fafc', borderRadius: 12,
      fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>
      ⚠ Map error: {error}
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 650 }}>
      <div ref={containerRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, minHeight: 650, borderRadius: 12, overflow: 'hidden' }} />
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          background: '#f8f5f0', borderRadius: 12, fontFamily: 'monospace', fontSize: 12, color: '#9ca3af' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%',
            border: '2px solid #d1d5db', borderTopColor: '#6b7280', animation: 'spin 1s linear infinite' }} />
          <span>Rendering 3D City Map…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
