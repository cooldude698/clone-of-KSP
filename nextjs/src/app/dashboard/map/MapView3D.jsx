'use client';

import { useEffect, useRef, useState } from 'react';

// Use 'bright' style — has richer building data than positron
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright';

// ── Bengaluru road-following crime route coordinates ─────────────────────
// Manually traced along actual NH-44, ORR, MG Road etc.
const CRIME_ROUTES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Bullet Ramesh — NH-44 Escape Corridor', syndicate: 'SYN-VT-01', color: '#ef4444' },
      geometry: {
        type: 'LineString',
        coordinates: [
          // Silk Board → Hosur Road → Electronic City → Attibele (follows NH-44)
          [77.6215, 12.9175], [77.6250, 12.9130], [77.6290, 12.9060],
          [77.6340, 12.8980], [77.6400, 12.8890], [77.6440, 12.8810],
          [77.6490, 12.8720], [77.6530, 12.8640], [77.6580, 12.8540],
          [77.6600, 12.8452], [77.6640, 12.8350], [77.6700, 12.8220],
          [77.6760, 12.8080], [77.6900, 12.7960], [77.7050, 12.7870],
          [77.7200, 12.7800],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Helmet Imran — ORR → NH-75 Narcotics Run', syndicate: 'SYN-ND-02', color: '#10b981' },
      geometry: {
        type: 'LineString',
        coordinates: [
          // Bellandur → ORR → Hebbal → Tumakuru Highway
          [77.6900, 12.9350], [77.6820, 12.9430], [77.6700, 12.9530],
          [77.6600, 12.9620], [77.6500, 12.9700], [77.6400, 12.9750],
          [77.6300, 12.9770], [77.6256, 13.0000], [77.6256, 13.0200],
          [77.6200, 13.0350], [77.6100, 13.0450], [77.6000, 13.0700],
          [77.5900, 13.1100], [77.5500, 13.1800], [77.4200, 13.2500],
          [77.2500, 13.3000], [77.1000, 13.3400],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Snake Naidu — MG Road Heist Vector', syndicate: 'SYN-RB-03', color: '#f59e0b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          // Indiranagar → Halasuru → MG Road → Cubbon Park → Yelahanka NH-44N
          [77.6408, 12.9784], [77.6350, 12.9750], [77.6290, 12.9730],
          [77.6200, 12.9716], [77.6120, 12.9716], [77.6020, 12.9716],
          [77.5946, 12.9716], [77.5880, 12.9750], [77.5800, 12.9800],
          [77.5750, 12.9900], [77.5750, 13.0100], [77.5800, 13.0400],
          [77.5850, 13.0700], [77.5900, 13.0900], [77.5963, 13.1007],
        ],
      },
    },
  ],
};

const ANPR = [
  { id:'CAM-BLR-0045', name:'Silk Board TTMC',   lng:77.6215, lat:12.9175, status:'LOCKED_SWEEP' },
  { id:'CAM-BLR-0088', name:'Indiranagar 100ft', lng:77.6408, lat:12.9784, status:'SWEEPING' },
  { id:'CAM-WF-0019',  name:'Bellandur ORR',     lng:77.6900, lat:12.9350, status:'LOCKED_SWEEP' },
  { id:'CAM-HEB-0012', name:'Hebbal Expressway', lng:77.6256, lat:13.0456, status:'PATROL_DEPLOYED' },
  { id:'CAM-ATT-0001', name:'Attibele Border',   lng:77.7200, lat:12.7800, status:'INTERCEPT_READY' },
];

const SEVERITY_COLOR = { critical:'#c8372d', high:'#e05a3a', medium:'#f0a848', low:'#4A8B6F' };

function loadMaplibre() {
  return new Promise((resolve) => {
    if (window.maplibregl) { resolve(window.maplibregl); return; }
    if (!document.getElementById('maplibre-gl-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-gl-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }
    if (document.getElementById('maplibre-gl-js')) {
      const check = setInterval(() => {
        if (window.maplibregl) { clearInterval(check); resolve(window.maplibregl); }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.id  = 'maplibre-gl-js';
    script.src = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.js';
    script.onload = () => resolve(window.maplibregl);
    document.head.appendChild(script);
  });
}

export default function MapView3D({ filtered = [], selectedHotspot, setSelectedHotspot, is3D = true }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let cancelled = false;

    loadMaplibre().then((ml) => {
      if (cancelled || mapRef.current || !containerRef.current) return;

      const map = new ml.Map({
        container:  containerRef.current,
        style:      MAP_STYLE,
        center:     [77.6200, 12.9400],  // Bengaluru center
        zoom:       13.5,
        pitch:      62,                  // Huawei-style tilt
        bearing:    -25,
        antialias:  true,
        // Full 3D navigation — drag to pan, right-click/ctrl-drag to rotate & tilt
        dragRotate:      true,
        pitchWithRotate: true,
        touchPitch:      true,
        touchZoomRotate: true,
      });

      mapRef.current = map;

      // ── Navigation controls (compass + zoom + pitch wheel) ────────────
      map.addControl(new ml.NavigationControl({ visualizePitch: true }), 'top-right');

      map.on('load', () => {
        if (cancelled) return;

        // ── 3D Buildings ────────────────────────────────────────────────
        const layers   = map.getStyle().layers || [];
        const firstSym = layers.find(l => l.type === 'symbol')?.id;
        try {
          // Find the right building source — try both naming conventions
          const sourceId = map.getSource('openmaptiles') ? 'openmaptiles'
                         : map.getSource('maptiler_planet') ? 'maptiler_planet'
                         : 'openmaptiles';

          map.addLayer({
            id: '3d-buildings', type: 'fill-extrusion',
            source: sourceId, 'source-layer': 'building', minzoom: 12,
            paint: {
              'fill-extrusion-color': '#f0ebe3',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                12, 0, 13,
                ['coalesce', ['get', 'render_height'], ['get', 'height'], 8],
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                12, 0, 13,
                ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
              ],
              'fill-extrusion-opacity': 0.92,
            },
            layout: { visibility: is3D ? 'visible' : 'none' },
          }, firstSym);
        } catch (e) { console.warn('[3D buildings]', e.message); }

        // ── Crime Routes ────────────────────────────────────────────────
        map.addSource('routes', { type: 'geojson', data: CRIME_ROUTES });

        // Thick glow
        map.addLayer({
          id: 'routes-glow', type: 'line', source: 'routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 16, 'line-opacity': 0.22, 'line-blur': 8,
          },
        });

        // Animated dashed line
        map.addLayer({
          id: 'routes-dash', type: 'line', source: 'routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 4, 'line-opacity': 0.95,
            'line-dasharray': [3, 2],
          },
        });

        // ── ANPR Cameras ────────────────────────────────────────────────
        const anprGJ = {
          type: 'FeatureCollection',
          features: ANPR.map(n => ({
            type: 'Feature',
            properties: { id: n.id, name: n.name, status: n.status },
            geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
          })),
        };
        map.addSource('anpr', { type: 'geojson', data: anprGJ });
        map.addLayer({
          id: 'anpr-ring', type: 'circle', source: 'anpr',
          paint: {
            'circle-radius': 28, 'circle-color': '#06b6d4',
            'circle-opacity': 0.13, 'circle-stroke-width': 1.5,
            'circle-stroke-color': '#06b6d4', 'circle-stroke-opacity': 0.5,
          },
        });
        map.addLayer({
          id: 'anpr-dot', type: 'circle', source: 'anpr',
          paint: {
            'circle-radius': 7, 'circle-color': '#06b6d4',
            'circle-stroke-width': 2.5, 'circle-stroke-color': '#fff',
          },
        });

        // ── Tooltips ────────────────────────────────────────────────────
        const addTooltip = (layerId, getHTML) => {
          map.on('click', layerId, e => {
            new ml.Popup({ closeButton: false, offset: [0, -8] })
              .setLngLat(e.lngLat).setHTML(getHTML(e.features[0].properties)).addTo(map);
          });
          map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
        };

        addTooltip('routes-dash', p =>
          `<div style="font-family:monospace;padding:8px 12px;font-size:11px;min-width:200px;">
            <div style="font-weight:700;color:${p.color};font-size:10px;text-transform:uppercase;margin-bottom:3px;">🚨 ${p.syndicate}</div>
            <div style="color:#0f172a;">${p.name}</div>
          </div>`
        );
        addTooltip('anpr-dot', p =>
          `<div style="font-family:monospace;padding:8px 12px;font-size:11px;">
            <div style="font-weight:700;color:#0891b2;font-size:9px;text-transform:uppercase;margin-bottom:3px;">ANPR: ${p.id}</div>
            <div style="color:#0f172a;font-weight:600;">${p.name}</div>
            <div style="color:#dc2626;font-size:9px;font-weight:700;margin-top:3px;">${p.status}</div>
          </div>`
        );

        setReady(true);
      });

      map.on('error', e => console.warn('[MapView3D]', e?.error?.message ?? e));
    }).catch(err => setError(err?.message || String(err)));

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; setReady(false); }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle 3D / 2D ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    mapRef.current.easeTo({ pitch: is3D ? 62 : 0, bearing: is3D ? -25 : 0, duration: 900 });
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
        properties: {
          id: i,
          color: SEVERITY_COLOR[h.severity] || '#3b82f6',
          r: h.severity === 'critical' ? 18 : h.severity === 'high' ? 13 : h.severity === 'medium' ? 9 : 6,
        },
        geometry: { type: 'Point', coordinates: [h.lng, h.lat] },
      })),
    };
    if (map.getSource('hotspots')) { map.getSource('hotspots').setData(geojson); return; }
    map.addSource('hotspots', { type: 'geojson', data: geojson });
    map.addLayer({ id: 'hs-pulse', type: 'circle', source: 'hotspots',
      paint: { 'circle-radius': ['*', ['get', 'r'], 2.5], 'circle-color': ['get', 'color'], 'circle-opacity': 0.18 } });
    map.addLayer({ id: 'hs-dot', type: 'circle', source: 'hotspots',
      paint: { 'circle-radius': ['get', 'r'], 'circle-color': ['get', 'color'],
        'circle-stroke-width': 2.5, 'circle-stroke-color': '#fff', 'circle-opacity': 0.92 } });
    map.on('click', 'hs-dot', e => {
      const h = filtered[e.features[0].properties.id];
      if (h && setSelectedHotspot) setSelectedHotspot(h);
    });
    map.on('mouseenter', 'hs-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'hs-dot', () => { map.getCanvas().style.cursor = ''; });
  }, [filtered, ready, setSelectedHotspot]);

  // ── Fly to selection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready || !selectedHotspot) return;
    mapRef.current.flyTo({
      center: [selectedHotspot.lng, selectedHotspot.lat],
      zoom: 15, pitch: is3D ? 62 : 0, bearing: is3D ? -25 : 0, duration: 1500,
    });
  }, [selectedHotspot, ready, is3D]);

  if (error) return (
    <div style={{ width:'100%', minHeight:650, display:'flex', alignItems:'center', justifyContent:'center',
      background:'#f8fafc', borderRadius:12, fontFamily:'monospace', fontSize:12, color:'#94a3b8' }}>
      ⚠ Map error: {error}
    </div>
  );

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', minHeight:650 }}>
      <div ref={containerRef}
        style={{ position:'absolute', top:0, left:0, right:0, bottom:0, minHeight:650, borderRadius:12, overflow:'hidden' }} />

      {/* 3D controls hint */}
      {ready && (
        <div style={{ position:'absolute', bottom:12, left:12, zIndex:10,
          background:'rgba(15,23,42,0.75)', backdropFilter:'blur(8px)',
          borderRadius:8, padding:'5px 10px', fontFamily:'monospace', fontSize:10, color:'#94a3b8',
          border:'1px solid rgba(51,65,85,0.5)', pointerEvents:'none' }}>
          🖱 Drag to pan &nbsp;·&nbsp; Right-click drag / Ctrl+drag to rotate &amp; tilt
        </div>
      )}

      {!ready && (
        <div style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:12,
          background:'#f8f5f0', borderRadius:12, fontFamily:'monospace', fontSize:12, color:'#9ca3af' }}>
          <div style={{ width:32, height:32, borderRadius:'50%',
            border:'2px solid #d1d5db', borderTopColor:'#6b7280', animation:'spin 1s linear infinite' }} />
          <span>Loading 3D City…</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
