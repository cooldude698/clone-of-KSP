'use client';

// maplibre-gl is pure ESM (v6) — loaded client-side only via ssr:false dynamic()
import * as maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';

// Inject MapLibre CSS once via <link> — avoids webpack CSS bundle issues with pure ESM
function ensureMaplibreCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('maplibre-gl-css')) return;
  const link = document.createElement('link');
  link.id = 'maplibre-gl-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/maplibre-gl@6/dist/maplibre-gl.css';
  document.head.appendChild(link);
}

// ── Tile Style: OpenFreeMap Positron (FREE, no API key, has building data) ─
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

// ── Bengaluru Crime Routes ─────────────────────────────────────────────────
const CRIME_ROUTE_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Bullet Ramesh Escape Corridor', syndicate: 'SYN-VT-01', color: '#ef4444' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.6215, 12.9175], // Silk Board TTMC
          [77.6320, 12.9050], // Hosur Road
          [77.6450, 12.8900], // Electronic City Phase 1
          [77.6550, 12.8700], // Electronic City Phase 2
          [77.6600, 12.8452], // Electronic City Toll
          [77.6900, 12.8100], // Towards Attibele
          [77.7200, 12.7800], // Attibele Border
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Helmet Imran Narcotics Drop', syndicate: 'SYN-ND-02', color: '#10b981' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.6900, 12.9350], // Bellandur
          [77.6700, 12.9600], // ORR
          [77.6400, 12.9784], // Indiranagar
          [77.6256, 13.0456], // Hebbal Flyover
          [77.5500, 13.2000], // NH-48 North
          [77.1000, 13.3400], // Tumakuru
        ],
      },
    },
  ],
};

const ANPR_NODES = [
  { id: 'CAM-BLR-0045', name: 'Silk Board TTMC',   lng: 77.6215, lat: 12.9175, status: 'LOCKED_SWEEP' },
  { id: 'CAM-BLR-0088', name: 'Indiranagar 100ft', lng: 77.6408, lat: 12.9784, status: 'SWEEPING' },
  { id: 'CAM-WF-0019',  name: 'Bellandur ORR',     lng: 77.6900, lat: 12.9350, status: 'LOCKED_SWEEP' },
  { id: 'CAM-HEB-0012', name: 'Hebbal Expressway', lng: 77.6256, lat: 13.0456, status: 'PATROL_DEPLOYED' },
  { id: 'CAM-ATT-0001', name: 'Attibele Border',   lng: 77.7200, lat: 12.7800, status: 'INTERCEPT_READY' },
];

const SEVERITY_COLOR = {
  critical: '#c8372d',
  high:     '#e05a3a',
  medium:   '#f0a848',
  low:      '#4A8B6F',
};

export default function MapView3D({
  filtered = [],
  selectedHotspot,
  setSelectedHotspot,
  is3D = true,
}) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // ── Initialize map once on mount ─────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    ensureMaplibreCSS();
    let map;
    try {
      map = new maplibregl.Map({
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
        console.error('[MapView3D] error:', e);
        setError(e?.error?.message || 'Map failed to load tiles');
      });

      map.on('load', () => {
        // ── 3D Buildings ────────────────────────────────────────────────────
        const styleLayers = map.getStyle().layers || [];
        let firstSymbolId;
        for (const layer of styleLayers) {
          if (layer.type === 'symbol') { firstSymbolId = layer.id; break; }
        }

        try {
          map.addLayer(
            {
              id:             '3d-buildings',
              type:           'fill-extrusion',
              source:         'openmaptiles',
              'source-layer': 'building',
              minzoom:        12,
              paint: {
                'fill-extrusion-color': [
                  'interpolate', ['linear'], ['zoom'],
                  12, '#e8e2d8',
                  16, '#f0ebe3',
                ],
                'fill-extrusion-height': [
                  'interpolate', ['linear'], ['zoom'],
                  12, 0,
                  12.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
                ],
                'fill-extrusion-base': [
                  'interpolate', ['linear'], ['zoom'],
                  12, 0,
                  12.5, ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                ],
                'fill-extrusion-opacity': 0.88,
              },
              layout: { visibility: is3D ? 'visible' : 'none' },
            },
            firstSymbolId
          );
        } catch (layerErr) {
          console.warn('[MapView3D] 3D buildings (non-fatal):', layerErr.message);
        }

        // ── Crime Routes ──────────────────────────────────────────────────
        map.addSource('crime-routes', { type: 'geojson', data: CRIME_ROUTE_GEOJSON });

        map.addLayer({
          id: 'crime-routes-glow',
          type: 'line',
          source: 'crime-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color':   ['get', 'color'],
            'line-width':   12,
            'line-opacity': 0.18,
            'line-blur':    5,
          },
        });

        map.addLayer({
          id: 'crime-routes-line',
          type: 'line',
          source: 'crime-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color':      ['get', 'color'],
            'line-width':      3.5,
            'line-opacity':    0.95,
            'line-dasharray':  [2, 1.5],
          },
        });

        // ── ANPR Cameras ──────────────────────────────────────────────────
        map.addSource('anpr-nodes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: ANPR_NODES.map(n => ({
              type: 'Feature',
              properties: { id: n.id, name: n.name, status: n.status },
              geometry:   { type: 'Point', coordinates: [n.lng, n.lat] },
            })),
          },
        });

        map.addLayer({
          id: 'anpr-pulse',
          type: 'circle',
          source: 'anpr-nodes',
          paint: {
            'circle-radius':         24,
            'circle-color':          '#06b6d4',
            'circle-opacity':        0.12,
            'circle-stroke-width':   1.5,
            'circle-stroke-color':   '#06b6d4',
            'circle-stroke-opacity': 0.45,
          },
        });

        map.addLayer({
          id: 'anpr-dot',
          type: 'circle',
          source: 'anpr-nodes',
          paint: {
            'circle-radius':       6,
            'circle-color':        '#06b6d4',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Route click popup
        map.on('click', 'crime-routes-line', (e) => {
          const props = e.features[0].properties;
          new maplibregl.Popup({ closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family:monospace;padding:8px 12px;font-size:11px;">
                <div style="font-weight:700;color:#ef4444;margin-bottom:3px;">🚨 ${props.syndicate}</div>
                <div style="color:#374151;">${props.name}</div>
              </div>
            `)
            .addTo(map);
        });

        map.on('mouseenter', 'crime-routes-line', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'crime-routes-line', () => { map.getCanvas().style.cursor = ''; });

        setReady(true);
      });
    } catch (err) {
      console.error('[MapView3D] init failed:', err);
      setError(err.message);
    }

    return () => {
      if (map) {
        map.remove();
        mapRef.current = null;
        setReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle 3D/2D ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    mapRef.current.easeTo({
      pitch:    is3D ? 55 : 0,
      bearing:  is3D ? -20 : 0,
      duration: 900,
    });
    if (mapRef.current.getLayer('3d-buildings')) {
      mapRef.current.setLayoutProperty('3d-buildings', 'visibility', is3D ? 'visible' : 'none');
    }
  }, [is3D, ready]);

  // ── Render hotspot circles ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;

    const geojson = {
      type: 'FeatureCollection',
      features: filtered.map((h, i) => ({
        type: 'Feature',
        properties: {
          id:       i,
          area:     h.area,
          count:    h.count,
          severity: h.severity,
          color:    SEVERITY_COLOR[h.severity] || '#3b82f6',
          radius:   h.severity === 'critical' ? 18 : h.severity === 'high' ? 13 : h.severity === 'medium' ? 9 : 6,
        },
        geometry: { type: 'Point', coordinates: [h.lng, h.lat] },
      })),
    };

    if (map.getSource('hotspots')) {
      map.getSource('hotspots').setData(geojson);
      return;
    }

    map.addSource('hotspots', { type: 'geojson', data: geojson });

    map.addLayer({
      id: 'hotspot-pulse',
      type: 'circle',
      source: 'hotspots',
      paint: {
        'circle-radius':  ['*', ['get', 'radius'], 2.5],
        'circle-color':   ['get', 'color'],
        'circle-opacity': 0.15,
      },
    });

    map.addLayer({
      id: 'hotspot-dot',
      type: 'circle',
      source: 'hotspots',
      paint: {
        'circle-radius':       ['get', 'radius'],
        'circle-color':        ['get', 'color'],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity':      0.9,
      },
    });

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
    mapRef.current.flyTo({
      center:   [selectedHotspot.lng, selectedHotspot.lat],
      zoom:     15,
      pitch:    is3D ? 55 : 0,
      bearing:  is3D ? -20 : 0,
      duration: 1400,
    });
  }, [selectedHotspot, ready, is3D]);

  if (error) {
    return (
      <div
        style={{
          width: '100%', minHeight: 650,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
          fontFamily: 'monospace', fontSize: 12, color: '#94a3b8',
        }}
      >
        ⚠ Map error: {error}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 650 }}>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          minHeight: 650,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      />
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          background: '#f8f5f0', borderRadius: 12,
          fontFamily: 'monospace', fontSize: 12, color: '#9ca3af',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid #d1d5db', borderTopColor: '#6b7280',
            animation: 'spin 1s linear infinite',
          }} />
          <span>Rendering 3D City Map…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
