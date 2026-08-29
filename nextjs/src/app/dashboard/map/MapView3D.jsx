'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright';

// ── Route waypoints for OSRM routing ─────────────────────────────────────
const ROUTE_DEFS = [
  {
    id: 'SYN-VT-01', name: 'Bullet Ramesh — NH-44 Escape Corridor', color: '#ef4444',
    points: [[77.6215,12.9175],[77.6600,12.8452],[77.7200,12.7800]], // Silk Board → Elec City → Attibele
  },
  {
    id: 'SYN-ND-02', name: 'Helmet Imran — ORR Narcotics Run', color: '#10b981',
    points: [[77.6900,12.9350],[77.6256,13.0456],[77.1000,13.3400]], // Bellandur → Hebbal → Tumakuru
  },
  {
    id: 'SYN-RB-03', name: 'Snake Naidu — MG Road Heist Vector', color: '#f59e0b',
    points: [[77.6408,12.9784],[77.5946,12.9716],[77.5963,13.1007]], // Indiranagar → Cubbon → Yelahanka
  },
];

const ANPR = [
  { id:'CAM-BLR-0045', name:'Silk Board TTMC',   lng:77.6215, lat:12.9175, status:'LOCKED_SWEEP' },
  { id:'CAM-BLR-0088', name:'Indiranagar 100ft', lng:77.6408, lat:12.9784, status:'SWEEPING' },
  { id:'CAM-WF-0019',  name:'Bellandur ORR',     lng:77.6900, lat:12.9350, status:'LOCKED_SWEEP' },
  { id:'CAM-HEB-0012', name:'Hebbal Expressway', lng:77.6256, lat:13.0456, status:'PATROL_DEPLOYED' },
  { id:'CAM-ATT-0001', name:'Attibele Border',   lng:77.7200, lat:12.7800, status:'INTERCEPT_READY' },
];

const SEVERITY_COLOR = { critical:'#c8372d', high:'#e05a3a', medium:'#f0a848', low:'#4A8B6F' };

// ── Fetch real road route from OSRM (free, no API key) ───────────────────
async function fetchOSRM(points) {
  try {
    const coords = points.map(p => `${p[0]},${p[1]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates?.length) {
      return data.routes[0].geometry.coordinates;
    }
  } catch (e) { console.warn('[OSRM]', e.message); }
  return points; // fallback: straight line
}

// ── CDN loader for maplibre-gl ────────────────────────────────────────────
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
    const script   = document.createElement('script');
    script.id      = 'maplibre-gl-js';
    script.src     = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.js';
    script.onload  = () => resolve(window.maplibregl);
    document.head.appendChild(script);
  });
}

export default function MapView3D({ filtered = [], selectedHotspot, setSelectedHotspot, is3D = true }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const orbitRef     = useRef({ active: false, startX: 0, startY: 0, bearing: 0, pitch: 0 });

  const [ready,      setReady]      = useState(false);
  const [error,      setError]      = useState(null);
  const [orbitMode,  setOrbitMode]  = useState(false);   // left-click = orbit when true
  const [routeStatus, setRouteStatus] = useState('loading'); // 'loading' | 'real' | 'fallback'

  // ── Orbit mode: left-click drag = rotate + tilt ──────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (orbitMode) {
      map.dragPan.disable();
      map.getCanvas().style.cursor = 'grab';
    } else {
      map.dragPan.enable();
      map.getCanvas().style.cursor = '';
    }
  }, [orbitMode, ready]);

  // Attach orbit mouse handlers once on mount
  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas) return;

    const onDown = (e) => {
      if (!orbitRef.current.enabled || e.button !== 0) return;
      const map = mapRef.current;
      if (!map) return;
      orbitRef.current.active  = true;
      orbitRef.current.startX  = e.clientX;
      orbitRef.current.startY  = e.clientY;
      orbitRef.current.bearing = map.getBearing();
      orbitRef.current.pitch   = map.getPitch();
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!orbitRef.current.active) return;
      const map = mapRef.current;
      if (!map) return;
      const dx = e.clientX - orbitRef.current.startX;
      const dy = e.clientY - orbitRef.current.startY;
      map.setBearing(orbitRef.current.bearing - dx * 0.45);
      map.setPitch(Math.max(0, Math.min(82, orbitRef.current.pitch - dy * 0.38)));
    };

    const onUp = () => {
      if (orbitRef.current.active) {
        orbitRef.current.active = false;
        if (orbitRef.current.enabled && containerRef.current)
          containerRef.current.style.cursor = 'grab';
      }
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  // Sync orbitRef so handlers can read latest value
  useEffect(() => { orbitRef.current.enabled = orbitMode; }, [orbitMode]);

  // ── Init map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let cancelled = false;

    loadMaplibre().then(async (ml) => {
      if (cancelled || mapRef.current || !containerRef.current) return;

      const map = new ml.Map({
        container:  containerRef.current,
        style:      MAP_STYLE,
        center:     [77.6200, 12.9400],
        zoom:       13,
        pitch:      62,
        bearing:    -25,
        antialias:  true,
        dragRotate:      true,
        pitchWithRotate: true,
        touchPitch:      true,
        touchZoomRotate: true,
      });

      mapRef.current = map;
      map.addControl(new ml.NavigationControl({ visualizePitch: true }), 'top-right');

      // ── Fetch road routes from OSRM (parallel) ─────────────────────────
      const routeCoords = await Promise.all(ROUTE_DEFS.map(r => fetchOSRM(r.points)));
      const usedReal = routeCoords.every((c, i) => c !== ROUTE_DEFS[i].points);
      if (!cancelled) setRouteStatus(usedReal ? 'real' : 'fallback');

      const routeGJ = {
        type: 'FeatureCollection',
        features: ROUTE_DEFS.map((r, i) => ({
          type: 'Feature',
          properties: { id: r.id, name: r.name, color: r.color },
          geometry: { type: 'LineString', coordinates: routeCoords[i] },
        })),
      };

      map.on('load', () => {
        if (cancelled) return;

        // ── 3D Buildings ──────────────────────────────────────────────
        const firstSym = (map.getStyle().layers || []).find(l => l.type === 'symbol')?.id;
        try {
          map.addLayer({
            id: '3d-buildings', type: 'fill-extrusion',
            source: 'openmaptiles', 'source-layer': 'building', minzoom: 12,
            paint: {
              'fill-extrusion-color': '#f0ebe3',
              'fill-extrusion-height': ['interpolate',['linear'],['zoom'],12,0,13,
                ['coalesce',['get','render_height'],['get','height'],8]],
              'fill-extrusion-base': ['interpolate',['linear'],['zoom'],12,0,13,
                ['coalesce',['get','render_min_height'],['get','min_height'],0]],
              'fill-extrusion-opacity': 0.9,
            },
            layout: { visibility: is3D ? 'visible' : 'none' },
          }, firstSym);
        } catch (e) { console.warn('[buildings]', e.message); }

        // ── Crime Routes (OSRM real roads) ────────────────────────────
        map.addSource('routes', { type: 'geojson', data: routeGJ });

        // Glow halo
        map.addLayer({ id: 'routes-halo', type: 'line', source: 'routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': ['get', 'color'], 'line-width': 20,
            'line-opacity': 0.20, 'line-blur': 10 } });

        // Solid route line (NO dashes — looks like Huawei screenshot)
        map.addLayer({ id: 'routes-line', type: 'line', source: 'routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': ['get', 'color'], 'line-width': 5, 'line-opacity': 0.95 } });

        // White inner highlight
        map.addLayer({ id: 'routes-inner', type: 'line', source: 'routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 1.5, 'line-opacity': 0.35 } });

        // ── ANPR Cameras ───────────────────────────────────────────────
        const anprGJ = { type: 'FeatureCollection', features: ANPR.map(n => ({
          type: 'Feature',
          properties: { id: n.id, name: n.name, status: n.status },
          geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
        })) };
        map.addSource('anpr', { type: 'geojson', data: anprGJ });
        map.addLayer({ id: 'anpr-ring', type: 'circle', source: 'anpr',
          paint: { 'circle-radius': 28, 'circle-color': '#06b6d4', 'circle-opacity': 0.13,
            'circle-stroke-width': 1.5, 'circle-stroke-color': '#06b6d4', 'circle-stroke-opacity': 0.5 } });
        map.addLayer({ id: 'anpr-dot', type: 'circle', source: 'anpr',
          paint: { 'circle-radius': 7, 'circle-color': '#06b6d4',
            'circle-stroke-width': 2.5, 'circle-stroke-color': '#fff' } });

        // ── Tooltips ───────────────────────────────────────────────────
        const tip = (layerId, html) => {
          map.on('click', layerId, e => {
            new ml.Popup({ closeButton: false, offset: [0,-8] })
              .setLngLat(e.lngLat).setHTML(html(e.features[0].properties)).addTo(map);
          });
          map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = orbitRef.current.enabled ? 'grab' : '';
          });
        };

        tip('routes-line', p =>
          `<div style="font-family:monospace;padding:8px 12px;font-size:11px;min-width:200px;">
            <div style="font-weight:700;color:${p.color};text-transform:uppercase;font-size:9px;margin-bottom:3px;">🚨 ${p.id}</div>
            <div style="color:#0f172a;font-weight:600;">${p.name}</div>
          </div>`);

        tip('anpr-dot', p =>
          `<div style="font-family:monospace;padding:8px 12px;font-size:11px;">
            <div style="font-weight:700;color:#0891b2;font-size:9px;text-transform:uppercase;margin-bottom:3px;">ANPR: ${p.id}</div>
            <div style="color:#0f172a;font-weight:600;">${p.name}</div>
            <div style="color:#dc2626;font-size:9px;font-weight:700;margin-top:3px;">${p.status}</div>
          </div>`);

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

  // ── Toggle 3D ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    mapRef.current.easeTo({ pitch: is3D ? 62 : 0, bearing: is3D ? -25 : 0, duration: 900 });
    if (mapRef.current.getLayer('3d-buildings'))
      mapRef.current.setLayoutProperty('3d-buildings', 'visibility', is3D ? 'visible' : 'none');
  }, [is3D, ready]);

  // ── Hotspots ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;
    const gj = { type:'FeatureCollection', features: filtered.map((h,i) => ({
      type:'Feature',
      properties:{ id:i, color:SEVERITY_COLOR[h.severity]||'#3b82f6',
        r:h.severity==='critical'?18:h.severity==='high'?13:h.severity==='medium'?9:6 },
      geometry:{ type:'Point', coordinates:[h.lng, h.lat] },
    })) };
    if (map.getSource('hotspots')) { map.getSource('hotspots').setData(gj); return; }
    map.addSource('hotspots', { type:'geojson', data:gj });
    map.addLayer({ id:'hs-pulse', type:'circle', source:'hotspots',
      paint:{ 'circle-radius':['*',['get','r'],2.5], 'circle-color':['get','color'], 'circle-opacity':0.18 } });
    map.addLayer({ id:'hs-dot', type:'circle', source:'hotspots',
      paint:{ 'circle-radius':['get','r'], 'circle-color':['get','color'],
        'circle-stroke-width':2.5, 'circle-stroke-color':'#fff', 'circle-opacity':0.92 } });
    map.on('click','hs-dot', e => {
      const h = filtered[e.features[0].properties.id];
      if (h && setSelectedHotspot) setSelectedHotspot(h);
    });
  }, [filtered, ready, setSelectedHotspot]);

  useEffect(() => {
    if (!mapRef.current || !ready || !selectedHotspot) return;
    mapRef.current.flyTo({ center:[selectedHotspot.lng,selectedHotspot.lat],
      zoom:15, pitch:is3D?62:0, bearing:is3D?-25:0, duration:1500 });
  }, [selectedHotspot, ready, is3D]);

  if (error) return (
    <div style={{ width:'100%',minHeight:650,display:'flex',alignItems:'center',justifyContent:'center',
      background:'#f8fafc',borderRadius:12,fontFamily:'monospace',fontSize:12,color:'#94a3b8' }}>
      ⚠ Map error: {error}
    </div>
  );

  return (
    <div style={{ position:'relative',width:'100%',height:'100%',minHeight:650 }}>
      <div ref={containerRef}
        style={{ position:'absolute',top:0,left:0,right:0,bottom:0,minHeight:650,borderRadius:12,overflow:'hidden' }} />

      {/* Orbit mode toggle */}
      {ready && (
        <button
          onClick={() => setOrbitMode(m => !m)}
          title={orbitMode ? 'Switch to Pan mode (drag to move map)' : 'Switch to Orbit mode (drag to rotate 360°)'}
          style={{
            position:'absolute', top:12, left:178, zIndex:10,
            background: orbitMode ? 'rgba(37,99,235,0.92)' : 'rgba(15,23,42,0.82)',
            backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.18)',
            borderRadius:10, padding:'7px 13px', fontFamily:'monospace', fontSize:11,
            color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6,
            boxShadow:'0 4px 14px rgba(0,0,0,0.3)',
            transition:'all 0.2s',
          }}>
          {orbitMode ? '🔄 Orbit ON' : '🖐 Pan Mode'}
          <span style={{ fontSize:9, opacity:0.75, marginLeft:2 }}>
            {orbitMode ? 'drag=rotate' : 'drag=pan'}
          </span>
        </button>
      )}

      {/* Route status badge (positioned bottom-right so bottom-left is clear for 3D/2D switch) */}
      {ready && (
        <div style={{
          position:'absolute', bottom:14, right:14, zIndex:10,
          background:'rgba(15,23,42,0.82)', backdropFilter:'blur(10px)',
          borderRadius:10, padding:'6px 12px', fontFamily:'monospace', fontSize:10,
          color: routeStatus==='real' ? '#10b981' : '#f59e0b',
          border:'1px solid rgba(255,255,255,0.15)', pointerEvents:'none',
          boxShadow:'0 4px 14px rgba(0,0,0,0.3)',
          display:'flex', alignItems:'center', gap:6,
        }}>
          <span style={{ width:6,height:6,borderRadius:'50%',
            background: routeStatus==='real'?'#10b981':'#f59e0b',
            display:'inline-block',flexShrink:0 }} />
          {routeStatus==='real' ? 'Live road routes via OSRM' : 'Routes: loading…'}
          &nbsp;·&nbsp; Right-click = 360° rotate
        </div>
      )}

      {!ready && (
        <div style={{ position:'absolute',inset:0,zIndex:10,display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center',gap:12,
          background:'#f8f5f0',borderRadius:12,fontFamily:'monospace',fontSize:12,color:'#9ca3af' }}>
          <div style={{ width:32,height:32,borderRadius:'50%',
            border:'2px solid #d1d5db',borderTopColor:'#6b7280',animation:'spin 1s linear infinite' }} />
          <span>Calculating live road routes…</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
