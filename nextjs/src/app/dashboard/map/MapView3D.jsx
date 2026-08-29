'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── Bengaluru Crime Route GeoJSON (Bullet Ramesh Syndicate Escape Corridor) ──
// Coordinates follow actual road geometry: Silk Board → Hosur Rd → Electronic City → Attibele
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
          [77.6400, 12.9784], // Indiranagar junction
          [77.6256, 13.0456], // Hebbal Flyover
          [77.5500, 13.2000], // NH-48 North
          [77.1000, 13.3400], // Tumakuru Highway Gate
        ],
      },
    },
  ],
};

// ── ANPR Camera Nodes ──────────────────────────────────────────────────────
const ANPR_NODES = [
  { id: 'CAM-BLR-0045', name: 'Silk Board TTMC',        lng: 77.6215, lat: 12.9175, status: 'LOCKED_SWEEP' },
  { id: 'CAM-BLR-0088', name: 'Indiranagar 100ft',      lng: 77.6408, lat: 12.9784, status: 'SWEEPING' },
  { id: 'CAM-WF-0019',  name: 'Bellandur ORR',          lng: 77.6900, lat: 12.9350, status: 'LOCKED_SWEEP' },
  { id: 'CAM-HEB-0012', name: 'Hebbal Expressway',      lng: 77.6256, lat: 13.0456, status: 'PATROL_DEPLOYED' },
  { id: 'CAM-ATT-0001', name: 'Attibele Border Gate',   lng: 77.7200, lat: 12.7800, status: 'INTERCEPT_READY' },
];

// ── Carto Positron Style (Light buildings, free, no API key) ──────────────
// Carto Positron GL gives white/cream buildings on light background
const CARTO_POSITRON_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// ── Severity colors ────────────────────────────────────────────────────────
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
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLibre, setMapLibre] = useState(null);

  // ── Dynamically load MapLibre (avoids SSR issues) ────────────────────────
  useEffect(() => {
    let cancelled = false;
    import('maplibre-gl').then((mod) => {
      if (!cancelled) setMapLibre(mod.default || mod);
    });
    return () => { cancelled = true; };
  }, []);

  // ── Initialize map once MapLibre is loaded ────────────────────────────────
  useEffect(() => {
    if (!mapLibre || !containerRef.current || mapRef.current) return;

    const map = new mapLibre.Map({
      container: containerRef.current,
      style: CARTO_POSITRON_STYLE,
      center: [77.5946, 12.9716],  // Bengaluru
      zoom: 13,
      pitch: is3D ? 55 : 0,
      bearing: is3D ? -20 : 0,
      antialias: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      // ── 3D Building Extrusion Layer ──────────────────────────────────────
      // Check if the style already has a buildings source (Carto Positron has OSM data)
      const layers = map.getStyle().layers;
      let firstSymbolId;
      for (const layer of layers) {
        if (layer.type === 'symbol') { firstSymbolId = layer.id; break; }
      }

      // Add 3D building fill-extrusion
      if (!map.getLayer('3d-buildings')) {
        map.addLayer(
          {
            id: '3d-buildings',
            source: 'carto',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 12,
            paint: {
              'fill-extrusion-color': [
                'interpolate', ['linear'], ['zoom'],
                12, '#e8e0d8',
                15, '#f5f0ea',
              ],
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                12, 0,
                12.05, ['get', 'render_height'],
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                12, 0,
                12.05, ['get', 'render_min_height'],
              ],
              'fill-extrusion-opacity': 0.9,
            },
          },
          firstSymbolId
        );
      }

      // ── Crime Routes ─────────────────────────────────────────────────────
      map.addSource('crime-routes', { type: 'geojson', data: CRIME_ROUTE_GEOJSON });

      // Glow/shadow under the route
      map.addLayer({
        id: 'crime-routes-glow',
        type: 'line',
        source: 'crime-routes',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 10,
          'line-opacity': 0.2,
          'line-blur': 4,
        },
      });

      // Main route line
      map.addLayer({
        id: 'crime-routes-line',
        type: 'line',
        source: 'crime-routes',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-opacity': 0.92,
          'line-dasharray': [2, 1.5],
        },
      });

      // ── ANPR Camera Nodes ────────────────────────────────────────────────
      map.addSource('anpr-nodes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: ANPR_NODES.map(n => ({
            type: 'Feature',
            properties: { id: n.id, name: n.name, status: n.status },
            geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
          })),
        },
      });

      // ANPR pulse ring
      map.addLayer({
        id: 'anpr-pulse',
        type: 'circle',
        source: 'anpr-nodes',
        paint: {
          'circle-radius': 22,
          'circle-color': '#06b6d4',
          'circle-opacity': 0.12,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#06b6d4',
          'circle-stroke-opacity': 0.4,
        },
      });

      // ANPR dot
      map.addLayer({
        id: 'anpr-dot',
        type: 'circle',
        source: 'anpr-nodes',
        paint: {
          'circle-radius': 6,
          'circle-color': '#06b6d4',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1,
        },
      });

      setMapLoaded(true);
    });

    // Click on routes
    map.on('click', 'crime-routes-line', (e) => {
      const props = e.features[0].properties;
      new mapLibre.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-family:monospace;padding:6px 10px;font-size:11px;">
            <div style="font-weight:700;color:#ef4444;margin-bottom:4px;">🚨 ${props.syndicate}</div>
            <div style="color:#374151;">${props.name}</div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', 'crime-routes-line', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'crime-routes-line', () => { map.getCanvas().style.cursor = ''; });

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLibre]);

  // ── Toggle 2D / 3D camera ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.easeTo({
      pitch: is3D ? 55 : 0,
      bearing: is3D ? -20 : 0,
      duration: 900,
      easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    });

    // Show/hide 3D buildings based on mode
    if (mapRef.current.getLayer('3d-buildings')) {
      mapRef.current.setLayoutProperty(
        '3d-buildings',
        'visibility',
        is3D ? 'visible' : 'none'
      );
    }
  }, [is3D, mapLoaded]);

  // ── Render hotspot circles as MapLibre circles ────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const hotspotsGeoJSON = {
      type: 'FeatureCollection',
      features: filtered.map((h, i) => ({
        type: 'Feature',
        properties: {
          id: i,
          area: h.area,
          count: h.count,
          severity: h.severity,
          district: h.district,
          top_crime_types: JSON.stringify(h.top_crime_types || []),
          color: SEVERITY_COLOR[h.severity] || '#3b82f6',
          radius: h.severity === 'critical' ? 18 : h.severity === 'high' ? 13 : h.severity === 'medium' ? 9 : 6,
        },
        geometry: { type: 'Point', coordinates: [h.lng, h.lat] },
      })),
    };

    if (map.getSource('hotspots')) {
      map.getSource('hotspots').setData(hotspotsGeoJSON);
    } else {
      map.addSource('hotspots', { type: 'geojson', data: hotspotsGeoJSON });

      // Outer pulse ring
      map.addLayer({
        id: 'hotspot-pulse',
        type: 'circle',
        source: 'hotspots',
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 2.2],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.15,
        },
      });

      // Main dot
      map.addLayer({
        id: 'hotspot-dot',
        type: 'circle',
        source: 'hotspots',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.88,
        },
      });

      // Click handler
      map.on('click', 'hotspot-dot', (e) => {
        const props = e.features[0].properties;
        const h = filtered[props.id];
        if (h && setSelectedHotspot) setSelectedHotspot(h);
      });

      map.on('mouseenter', 'hotspot-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'hotspot-dot', () => { map.getCanvas().style.cursor = ''; });
    }
  }, [filtered, mapLoaded, setSelectedHotspot]);

  // ── Fly to selected hotspot ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedHotspot) return;
    mapRef.current.flyTo({
      center: [selectedHotspot.lng, selectedHotspot.lat],
      zoom: 15,
      pitch: is3D ? 55 : 0,
      bearing: is3D ? -20 : 0,
      duration: 1400,
    });
  }, [selectedHotspot, mapLoaded, is3D]);

  return (
    <div className="relative w-full h-full min-h-[650px]">
      {/* MapLibre canvas */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[650px] rounded-xl overflow-hidden"
        style={{ width: '100%', height: '100%', minHeight: '650px' }}
      />

      {/* MapLibre CSS — inline to avoid SSR issues */}
      <style>{`
        .maplibregl-ctrl-attrib { font-size: 9px; opacity: 0.7; }
        .maplibregl-ctrl-logo { display: none !important; }
        .maplibregl-popup-content {
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          padding: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
