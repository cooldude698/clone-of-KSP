'use client';

// Static imports are safe — loaded only client-side via ssr:false dynamic()
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

// ── Syndicate Route Data ──────────────────────────────────────────────────
const PREDICTIVE_ROUTES = [
  {
    id: 'SYN-VT-01-ROUTE',
    name: 'Bullet Ramesh Escape Corridor (NH-44)',
    color: '#3B82F6',
    waypoints: [
      { lng: 77.6215, lat: 12.9175, label: 'Silk Board TTMC (Last Sighted: 02:15 AM)', type: 'start' },
      { lng: 77.6602, lat: 12.8452, label: 'Electronic City Toll (FASTag Sweep)', type: 'checkpoint' },
      { lng: 77.7200, lat: 12.7800, label: 'Attibele Intercept Checkpost (Active Alert)', type: 'intercept' },
      { lng: 77.6000, lat: 13.1500, label: 'Predicted Transit: Raichur Chopshop', type: 'destination' },
    ],
  },
  {
    id: 'SYN-ND-02-ROUTE',
    name: 'Helmet Imran Narcotics Drop Trajectory',
    color: '#10B981',
    waypoints: [
      { lng: 77.6900, lat: 12.9350, label: 'Bellandur Tech Node (Dead-drop origin)', type: 'start' },
      { lng: 77.6256, lat: 13.0456, label: 'Hebbal Flyover (ANPR Sweep CAM-WF-0019)', type: 'checkpoint' },
      { lng: 77.1000, lat: 13.3400, label: 'Tumakuru Highway Intercept Gate', type: 'intercept' },
    ],
  },
  {
    id: 'SYN-RB-03-ROUTE',
    name: 'Snake Naidu Highway Heist Escape Vector',
    color: '#EF4444',
    waypoints: [
      { lng: 77.6408, lat: 12.9784, label: 'Indiranagar 100ft Rd (Target Ambush)', type: 'start' },
      { lng: 77.5946, lat: 12.9716, label: 'Cubbon Park Fringe (Getaway Transition)', type: 'checkpoint' },
      { lng: 77.5963, lat: 13.1007, label: 'Yelahanka Toll Intercept Barrier', type: 'intercept' },
    ],
  },
];

const ANPR_NODES = [
  { id: 'CAM-BLR-0045', name: 'Silk Board TTMC Chokepoint',   lng: 77.6215, lat: 12.9175, status: 'LOCKED_SWEEP' },
  { id: 'CAM-BLR-0088', name: 'Indiranagar 100ft Toll Barrier',lng: 77.6408, lat: 12.9784, status: 'SWEEPING' },
  { id: 'CAM-WF-0019',  name: 'Outer Ring Road Bellandur ANPR',lng: 77.6900, lat: 12.9350, status: 'LOCKED_SWEEP' },
  { id: 'CAM-HEB-0012', name: 'Hebbal Expressway Checkpoint',  lng: 77.6256, lat: 13.0456, status: 'PATROL_DEPLOYED' },
  { id: 'CAM-ATT-0001', name: 'Attibele Inter-State Border',   lng: 77.7200, lat: 12.7800, status: 'INTERCEPT_READY' },
];

function buildRoutesGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: PREDICTIVE_ROUTES.map(r => ({
      type: 'Feature',
      properties: { id: r.id, name: r.name, color: r.color },
      geometry: { type: 'LineString', coordinates: r.waypoints.map(w => [w.lng, w.lat]) },
    })),
  };
}

function buildWaypointsGeoJSON() {
  const features = [];
  PREDICTIVE_ROUTES.forEach(r => {
    r.waypoints.forEach(wp => {
      const isStart     = wp.type === 'start';
      const isIntercept = wp.type === 'intercept';
      const isDest      = wp.type === 'destination';
      features.push({
        type: 'Feature',
        properties: {
          label:     wp.label,
          type:      wp.type,
          routeName: r.name,
          color:     isStart ? '#DC2626' : isIntercept ? '#F59E0B' : isDest ? '#8B5CF6' : r.color,
          radius:    isStart ? 9 : isIntercept ? 7 : 5,
        },
        geometry: { type: 'Point', coordinates: [wp.lng, wp.lat] },
      });
    });
  });
  return { type: 'FeatureCollection', features };
}

export default function NetworkMapView3D({
  nodes = [],
  edges = [],
  selectedNodeId,
  onNodeClick,
  height = 580,
  is3D = true,
}) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // ── Initialize map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style:     MAP_STYLE,
        center:    [77.6000, 12.9716],
        zoom:      11,
        pitch:     is3D ? 50 : 0,
        bearing:   is3D ? -15 : 0,
        antialias: true,
      });

      mapRef.current = map;

      map.on('error', (e) => {
        console.error('[NetworkMapView3D] error:', e);
        setError(e?.error?.message || 'Map failed to load');
      });

      map.on('load', () => {
        // ── 3D Buildings ──────────────────────────────────────────────────
        const styleLayers = map.getStyle().layers || [];
        let firstSymbolId;
        for (const layer of styleLayers) {
          if (layer.type === 'symbol') { firstSymbolId = layer.id; break; }
        }

        try {
          map.addLayer({
            id:             '3d-buildings',
            type:           'fill-extrusion',
            source:         'openmaptiles',
            'source-layer': 'building',
            minzoom:        11,
            paint: {
              'fill-extrusion-color': [
                'interpolate', ['linear'], ['zoom'],
                11, '#e8e2d8',
                15, '#f0ebe3',
              ],
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                11, 0,
                11.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                11, 0,
                11.5, ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
              ],
              'fill-extrusion-opacity': 0.85,
            },
            layout: { visibility: is3D ? 'visible' : 'none' },
          }, firstSymbolId);
        } catch (layerErr) {
          console.warn('[NetworkMapView3D] 3D buildings (non-fatal):', layerErr.message);
        }

        // ── Syndicate Routes ──────────────────────────────────────────────
        map.addSource('network-routes', { type: 'geojson', data: buildRoutesGeoJSON() });

        map.addLayer({
          id: 'network-routes-glow',
          type: 'line',
          source: 'network-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': ['get', 'color'], 'line-width': 14, 'line-opacity': 0.15, 'line-blur': 6 },
        });

        map.addLayer({
          id: 'network-routes-line',
          type: 'line',
          source: 'network-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color':     ['get', 'color'],
            'line-width':     3,
            'line-opacity':   0.92,
            'line-dasharray': [3, 2],
          },
        });

        // ── Waypoints ─────────────────────────────────────────────────────
        map.addSource('network-waypoints', { type: 'geojson', data: buildWaypointsGeoJSON() });

        map.addLayer({
          id: 'waypoint-pulse',
          type: 'circle',
          source: 'network-waypoints',
          paint: { 'circle-radius': ['*', ['get', 'radius'], 2.4], 'circle-color': ['get', 'color'], 'circle-opacity': 0.18 },
        });

        map.addLayer({
          id: 'waypoint-dot',
          type: 'circle',
          source: 'network-waypoints',
          paint: {
            'circle-radius':       ['get', 'radius'],
            'circle-color':        ['get', 'color'],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
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
          id: 'anpr-radius',
          type: 'circle',
          source: 'anpr-nodes',
          paint: {
            'circle-radius':          30,
            'circle-color':           '#06B6D4',
            'circle-opacity':         0.08,
            'circle-stroke-width':    1.5,
            'circle-stroke-color':    '#06B6D4',
            'circle-stroke-opacity':  0.4,
            'circle-pitch-alignment': 'map',
          },
        });

        map.addLayer({
          id: 'anpr-dot',
          type: 'circle',
          source: 'anpr-nodes',
          paint: {
            'circle-radius':       6,
            'circle-color':        '#06B6D4',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // ── Suspect Pins ──────────────────────────────────────────────────
        const suspectFeatures = (nodes || [])
          .filter(n => n.district === 'Bengaluru Urban' || n.id === 'SUS-8842')
          .map(n => ({
            type: 'Feature',
            properties: { id: n.id, label: n.label || n.id, risk_score: n.risk_score || 80 },
            geometry: { type: 'Point', coordinates: [77.6215, 12.9175] },
          }));

        if (suspectFeatures.length > 0) {
          map.addSource('suspects', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: suspectFeatures },
          });

          map.addLayer({
            id: 'suspect-pulse',
            type: 'circle',
            source: 'suspects',
            paint: { 'circle-radius': 22, 'circle-color': '#DC2626', 'circle-opacity': 0.2 },
          });

          map.addLayer({
            id: 'suspect-dot',
            type: 'circle',
            source: 'suspects',
            paint: {
              'circle-radius':       11,
              'circle-color':        '#DC2626',
              'circle-stroke-width': 2.5,
              'circle-stroke-color': '#ffffff',
            },
          });

          map.on('click', 'suspect-dot', (e) => {
            if (onNodeClick) onNodeClick(e.features[0].properties.id);
          });
          map.on('mouseenter', 'suspect-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', 'suspect-dot', () => { map.getCanvas().style.cursor = ''; });
        }

        // ── Tooltips ──────────────────────────────────────────────────────
        map.on('click', 'waypoint-dot', (e) => {
          const p = e.features[0].properties;
          new maplibregl.Popup({ offset: [0, -8], closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:monospace;padding:7px 10px;font-size:10.5px;color:#0F172A;min-width:180px;">
              <div style="font-weight:700;text-transform:uppercase;color:#475569;font-size:9px;margin-bottom:3px;">${p.type} VECTOR</div>
              <div style="font-weight:600;">${p.label}</div>
              <div style="font-size:9px;color:#6B7280;margin-top:2px;">${p.routeName}</div>
            </div>`)
            .addTo(map);
        });

        map.on('click', 'anpr-dot', (e) => {
          const p = e.features[0].properties;
          new maplibregl.Popup({ offset: [0, -8], closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:monospace;padding:7px 10px;font-size:10.5px;color:#0F172A;">
              <div style="font-weight:700;font-size:9px;color:#0891B2;text-transform:uppercase;">ANPR: ${p.id}</div>
              <div style="font-weight:600;">${p.name}</div>
              <div style="font-size:9px;font-weight:700;color:#DC2626;margin-top:2px;">${p.status}</div>
            </div>`)
            .addTo(map);
        });

        map.on('mouseenter', 'waypoint-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'waypoint-dot', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'anpr-dot',     () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'anpr-dot',     () => { map.getCanvas().style.cursor = ''; });

        setReady(true);
      });
    } catch (err) {
      console.error('[NetworkMapView3D] init failed:', err);
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

  // ── Toggle 2D/3D ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    mapRef.current.easeTo({ pitch: is3D ? 50 : 0, bearing: is3D ? -15 : 0, duration: 900 });
    if (mapRef.current.getLayer('3d-buildings')) {
      mapRef.current.setLayoutProperty('3d-buildings', 'visibility', is3D ? 'visible' : 'none');
    }
  }, [is3D, ready]);

  // ── Fly to selected node ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready || !selectedNodeId) return;
    mapRef.current.flyTo({ center: [77.6215, 12.9175], zoom: 14, pitch: is3D ? 50 : 0, duration: 1200 });
  }, [selectedNodeId, ready, is3D]);

  if (error) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0',
        fontFamily: 'monospace', fontSize: 12, color: '#94a3b8',
      }}>
        ⚠ Map error: {error}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div
        ref={containerRef}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: 16, overflow: 'hidden',
        }}
      />
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          background: '#f8f5f0', borderRadius: 16,
          fontFamily: 'monospace', fontSize: 12, color: '#9ca3af',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid #d1d5db', borderTopColor: '#6b7280',
            animation: 'spin 1s linear infinite',
          }} />
          <span>Rendering 3D Tactical Grid…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
