'use client';

import { useEffect, useRef, useState } from 'react';

// ── Predictive Trajectory Corridors (same intel as 2D version) ─────────────
const PREDICTIVE_ROUTES = [
  {
    id: 'SYN-VT-01-ROUTE',
    name: 'Bullet Ramesh Escape Corridor (NH-44)',
    color: '#3B82F6',
    waypoints: [
      { lng: 77.6215, lat: 12.9175, label: 'Silk Board TTMC (Last Sighted: 02:15 AM)', type: 'start' },
      { lng: 77.6602, lat: 12.8452, label: 'Electronic City Toll (FASTag Sweep)', type: 'checkpoint' },
      { lng: 77.7200, lat: 12.7800, label: 'Attibele Intercept Checkpost (Active Alert)', type: 'intercept' },
      { lng: 77.6000, lat: 13.1500, label: 'Predicted Transit: Raichur Rural Chopshop', type: 'destination' },
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

const ANPR_SURVEILLANCE_NODES = [
  { id: 'CAM-BLR-0045', name: 'Silk Board TTMC Chokepoint', lng: 77.6215, lat: 12.9175, status: 'LOCKED_SWEEP' },
  { id: 'CAM-BLR-0088', name: 'Indiranagar 100ft Toll Barrier', lng: 77.6408, lat: 12.9784, status: 'SWEEPING' },
  { id: 'CAM-WF-0019',  name: 'Outer Ring Road Bellandur ANPR', lng: 77.6900, lat: 12.9350, status: 'LOCKED_SWEEP' },
  { id: 'CAM-HEB-0012', name: 'Hebbal Expressway Checkpoint', lng: 77.6256, lat: 13.0456, status: 'PATROL_DEPLOYED' },
  { id: 'CAM-ATT-0001', name: 'Attibele Inter-State Border Gate', lng: 77.7200, lat: 12.7800, status: 'INTERCEPT_READY' },
];

const STATUS_COLORS = {
  LOCKED_SWEEP:      '#EF4444',
  SWEEPING:          '#F59E0B',
  PATROL_DEPLOYED:   '#10B981',
  INTERCEPT_READY:   '#8B5CF6',
};

// ── Build GeoJSON from routes ────────────────────────────────────────────────
function buildRoutesGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: PREDICTIVE_ROUTES.map(r => ({
      type: 'Feature',
      properties: { id: r.id, name: r.name, color: r.color },
      geometry: {
        type: 'LineString',
        coordinates: r.waypoints.map(w => [w.lng, w.lat]),
      },
    })),
  };
}

function buildWaypointsGeoJSON() {
  const features = [];
  PREDICTIVE_ROUTES.forEach(r => {
    r.waypoints.forEach((wp, i) => {
      const isStart = wp.type === 'start';
      const isIntercept = wp.type === 'intercept';
      const isDest = wp.type === 'destination';
      features.push({
        type: 'Feature',
        properties: {
          label: wp.label,
          type: wp.type,
          color: isStart ? '#DC2626' : isIntercept ? '#F59E0B' : isDest ? '#8B5CF6' : r.color,
          radius: isStart ? 9 : isIntercept ? 7 : 5,
          routeName: r.name,
        },
        geometry: { type: 'Point', coordinates: [wp.lng, wp.lat] },
      });
    });
  });
  return { type: 'FeatureCollection', features };
}

function buildAnprGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: ANPR_SURVEILLANCE_NODES.map(n => ({
      type: 'Feature',
      properties: { id: n.id, name: n.name, status: n.status, statusColor: STATUS_COLORS[n.status] || '#06B6D4' },
      geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
    })),
  };
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
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLibre, setMapLibre] = useState(null);

  // ── Load MapLibre dynamically (no SSR) ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    import('maplibre-gl').then(mod => {
      if (!cancelled) setMapLibre(mod.default || mod);
    });
    return () => { cancelled = true; };
  }, []);

  // ── Initialize map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLibre || !containerRef.current || mapRef.current) return;

    const map = new mapLibre.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [77.6000, 12.9716],
      zoom: 11,
      pitch: is3D ? 50 : 0,
      bearing: is3D ? -15 : 0,
      antialias: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      // ── 3D Buildings ──────────────────────────────────────────────────────
      const layers = map.getStyle().layers;
      let firstSymbolId;
      for (const layer of layers) {
        if (layer.type === 'symbol') { firstSymbolId = layer.id; break; }
      }

      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          id: '3d-buildings',
          source: 'carto',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 11,
          paint: {
            'fill-extrusion-color': [
              'interpolate', ['linear'], ['zoom'],
              11, '#ede8e0',
              15, '#f5f2ec',
            ],
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              11, 0,
              11.05, ['get', 'render_height'],
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'], ['zoom'],
              11, 0,
              11.05, ['get', 'render_min_height'],
            ],
            'fill-extrusion-opacity': 0.85,
          },
        }, firstSymbolId);
      }

      // ── Crime Routes (glow + dashed line) ────────────────────────────────
      map.addSource('network-routes', { type: 'geojson', data: buildRoutesGeoJSON() });

      map.addLayer({
        id: 'network-routes-glow',
        type: 'line',
        source: 'network-routes',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 12,
          'line-opacity': 0.18,
          'line-blur': 5,
        },
      });

      map.addLayer({
        id: 'network-routes-line',
        type: 'line',
        source: 'network-routes',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.92,
          'line-dasharray': [3, 2],
        },
      });

      // ── Waypoint markers ─────────────────────────────────────────────────
      map.addSource('network-waypoints', { type: 'geojson', data: buildWaypointsGeoJSON() });

      map.addLayer({
        id: 'waypoint-pulse',
        type: 'circle',
        source: 'network-waypoints',
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 2.4],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.18,
        },
      });

      map.addLayer({
        id: 'waypoint-dot',
        type: 'circle',
        source: 'network-waypoints',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1,
        },
      });

      // ── ANPR Camera Nodes ────────────────────────────────────────────────
      map.addSource('anpr-nodes', { type: 'geojson', data: buildAnprGeoJSON() });

      map.addLayer({
        id: 'anpr-radius',
        type: 'circle',
        source: 'anpr-nodes',
        paint: {
          'circle-radius': 28,
          'circle-color': '#06B6D4',
          'circle-opacity': 0.08,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#06B6D4',
          'circle-stroke-opacity': 0.35,
          'circle-pitch-alignment': 'map',
        },
      });

      map.addLayer({
        id: 'anpr-dot',
        type: 'circle',
        source: 'anpr-nodes',
        paint: {
          'circle-radius': 6,
          'circle-color': '#06B6D4',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // ── Suspect node pins from props ─────────────────────────────────────
      const suspectFeatures = (nodes || [])
        .filter(n => n.district === 'Bengaluru Urban' || n.id === 'SUS-8842')
        .map(n => ({
          type: 'Feature',
          properties: {
            id: n.id,
            label: n.label || n.id,
            risk_score: n.risk_score || 80,
            vehicle: n.vehicle || '',
          },
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
          paint: {
            'circle-radius': 22,
            'circle-color': '#DC2626',
            'circle-opacity': 0.2,
          },
        });

        map.addLayer({
          id: 'suspect-dot',
          type: 'circle',
          source: 'suspects',
          paint: {
            'circle-radius': 11,
            'circle-color': '#DC2626',
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1,
          },
        });

        map.on('click', 'suspect-dot', e => {
          const props = e.features[0].properties;
          if (onNodeClick) onNodeClick(props.id);
        });
        map.on('mouseenter', 'suspect-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'suspect-dot', () => { map.getCanvas().style.cursor = ''; });
      }

      // ── Tooltips ─────────────────────────────────────────────────────────
      map.on('click', 'waypoint-dot', e => {
        const props = e.features[0].properties;
        new mapLibre.Popup({ offset: [0, -8], closeButton: false })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:monospace;padding:7px 10px;font-size:10.5px;color:#0F172A;min-width:180px;">
              <div style="font-weight:700;text-transform:uppercase;color:#475569;font-size:9px;margin-bottom:3px;">${props.type} VECTOR</div>
              <div style="font-weight:600;margin-bottom:2px;">${props.label}</div>
              <div style="font-size:9px;color:#6B7280;">${props.routeName}</div>
            </div>
          `)
          .addTo(map);
      });

      map.on('click', 'anpr-dot', e => {
        const props = e.features[0].properties;
        new mapLibre.Popup({ offset: [0, -8], closeButton: false })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:monospace;padding:7px 10px;font-size:10.5px;color:#0F172A;">
              <div style="font-weight:700;font-size:9px;color:#0891B2;text-transform:uppercase;margin-bottom:2px;">ANPR CHOKEPOINT: ${props.id}</div>
              <div style="font-weight:600;">${props.name}</div>
              <div style="font-size:9px;font-weight:700;color:${props.statusColor};margin-top:3px;">${props.status}</div>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'waypoint-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'waypoint-dot', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'anpr-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'anpr-dot', () => { map.getCanvas().style.cursor = ''; });

      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLibre]);

  // ── Toggle 2D / 3D camera ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.easeTo({
      pitch: is3D ? 50 : 0,
      bearing: is3D ? -15 : 0,
      duration: 900,
    });
    if (mapRef.current.getLayer('3d-buildings')) {
      mapRef.current.setLayoutProperty('3d-buildings', 'visibility', is3D ? 'visible' : 'none');
    }
  }, [is3D, mapLoaded]);

  // ── Fly to selected node ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedNodeId) return;
    mapRef.current.flyTo({ center: [77.6215, 12.9175], zoom: 14, pitch: is3D ? 50 : 0, duration: 1200 });
  }, [selectedNodeId, mapLoaded, is3D]);

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm"
        style={{ width: '100%', height }}
      />
      <style>{`
        .maplibregl-ctrl-attrib { font-size: 9px; opacity: 0.6; }
        .maplibregl-ctrl-logo { display: none !important; }
        .maplibregl-popup-content {
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}
