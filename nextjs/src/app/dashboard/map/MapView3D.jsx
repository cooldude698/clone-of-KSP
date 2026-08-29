'use client';

import { useEffect, useRef, useState } from 'react';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

const CRIME_ROUTES = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature',
      properties: { name: 'Bullet Ramesh Escape Corridor', syndicate: 'SYN-VT-01', color: '#ef4444' },
      geometry: { type: 'LineString', coordinates: [
        [77.6215,12.9175],[77.6320,12.9050],[77.6450,12.8900],
        [77.6550,12.8700],[77.6600,12.8452],[77.6900,12.8100],[77.7200,12.7800],
      ]}},
    { type: 'Feature',
      properties: { name: 'Helmet Imran Narcotics Drop', syndicate: 'SYN-ND-02', color: '#10b981' },
      geometry: { type: 'LineString', coordinates: [
        [77.6900,12.9350],[77.6700,12.9600],[77.6400,12.9784],
        [77.6256,13.0456],[77.5500,13.2000],[77.1000,13.3400],
      ]}},
  ],
};

const ANPR = [
  { id:'CAM-BLR-0045', name:'Silk Board TTMC',   lng:77.6215, lat:12.9175 },
  { id:'CAM-BLR-0088', name:'Indiranagar 100ft', lng:77.6408, lat:12.9784 },
  { id:'CAM-WF-0019',  name:'Bellandur ORR',     lng:77.6900, lat:12.9350 },
  { id:'CAM-HEB-0012', name:'Hebbal Expressway', lng:77.6256, lat:13.0456 },
  { id:'CAM-ATT-0001', name:'Attibele Border',   lng:77.7200, lat:12.7800 },
];

const SEVERITY_COLOR = { critical:'#c8372d', high:'#e05a3a', medium:'#f0a848', low:'#4A8B6F' };

// ── Load maplibre-gl from CDN (avoids webpack bundling the 4MB ESM) ────────
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
      // Script already injected but window.maplibregl not ready yet — wait
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
  const [ready, setReady]   = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let cancelled = false;

    loadMaplibre().then((ml) => {
      if (cancelled || mapRef.current || !containerRef.current) return;

      const map = new ml.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [77.5946, 12.9716],
        zoom: 13,
        pitch: is3D ? 55 : 0,
        bearing: is3D ? -20 : 0,
        antialias: true,
      });
      mapRef.current = map;

      map.on('load', () => {
        if (cancelled) return;
        const firstSymbol = (map.getStyle().layers || []).find(l => l.type === 'symbol')?.id;

        // 3D buildings
        try {
          map.addLayer({ id:'3d-buildings', type:'fill-extrusion',
            source:'openmaptiles', 'source-layer':'building', minzoom:12,
            paint:{
              'fill-extrusion-color':['interpolate',['linear'],['zoom'],12,'#e8e2d8',16,'#f0ebe3'],
              'fill-extrusion-height':['interpolate',['linear'],['zoom'],12,0,12.5,['coalesce',['get','render_height'],['get','height'],10]],
              'fill-extrusion-base':['interpolate',['linear'],['zoom'],12,0,12.5,['coalesce',['get','render_min_height'],['get','min_height'],0]],
              'fill-extrusion-opacity':0.88,
            },
            layout:{ visibility: is3D ? 'visible' : 'none' },
          }, firstSymbol);
        } catch(e) { console.warn('[MapView3D] buildings:', e.message); }

        // Crime routes
        map.addSource('crime-routes', { type:'geojson', data:CRIME_ROUTES });
        map.addLayer({ id:'routes-glow', type:'line', source:'crime-routes',
          layout:{ 'line-join':'round', 'line-cap':'round' },
          paint:{ 'line-color':['get','color'], 'line-width':12, 'line-opacity':0.18, 'line-blur':5 } });
        map.addLayer({ id:'routes-line', type:'line', source:'crime-routes',
          layout:{ 'line-join':'round', 'line-cap':'round' },
          paint:{ 'line-color':['get','color'], 'line-width':3.5, 'line-opacity':0.95, 'line-dasharray':[2,1.5] } });

        // ANPR cameras
        map.addSource('anpr', { type:'geojson', data:{ type:'FeatureCollection',
          features: ANPR.map(n => ({ type:'Feature',
            properties:{ id:n.id, name:n.name },
            geometry:{ type:'Point', coordinates:[n.lng, n.lat] } })) } });
        map.addLayer({ id:'anpr-pulse', type:'circle', source:'anpr',
          paint:{ 'circle-radius':24,'circle-color':'#06b6d4','circle-opacity':0.12,
            'circle-stroke-width':1.5,'circle-stroke-color':'#06b6d4','circle-stroke-opacity':0.45 } });
        map.addLayer({ id:'anpr-dot', type:'circle', source:'anpr',
          paint:{ 'circle-radius':6,'circle-color':'#06b6d4','circle-stroke-width':2,'circle-stroke-color':'#fff' } });

        map.on('click','routes-line', e => {
          const p = e.features[0].properties;
          new ml.Popup({ closeButton:false }).setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:monospace;padding:8px 12px;font-size:11px;">
              <b style="color:#ef4444;">🚨 ${p.syndicate}</b><br/>${p.name}</div>`).addTo(map);
        });
        map.on('mouseenter','routes-line', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave','routes-line', () => { map.getCanvas().style.cursor = ''; });

        setReady(true);
      });

      map.on('error', e => { console.warn('[MapView3D]', e?.error?.message ?? e); });
    }).catch(err => { setError(err?.message || String(err)); });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; setReady(false); }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !ready) return;
    mapRef.current.easeTo({ pitch: is3D ? 55 : 0, bearing: is3D ? -20 : 0, duration: 900 });
    if (mapRef.current.getLayer('3d-buildings'))
      mapRef.current.setLayoutProperty('3d-buildings','visibility', is3D ? 'visible' : 'none');
  }, [is3D, ready]);

  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;
    const geojson = { type:'FeatureCollection', features: filtered.map((h,i) => ({
      type:'Feature',
      properties:{ id:i, color: SEVERITY_COLOR[h.severity]||'#3b82f6',
        radius: h.severity==='critical'?18:h.severity==='high'?13:h.severity==='medium'?9:6 },
      geometry:{ type:'Point', coordinates:[h.lng, h.lat] } })) };
    if (map.getSource('hotspots')) { map.getSource('hotspots').setData(geojson); return; }
    map.addSource('hotspots',{ type:'geojson', data:geojson });
    map.addLayer({ id:'hotspot-pulse', type:'circle', source:'hotspots',
      paint:{ 'circle-radius':['*',['get','radius'],2.5],'circle-color':['get','color'],'circle-opacity':0.15 } });
    map.addLayer({ id:'hotspot-dot', type:'circle', source:'hotspots',
      paint:{ 'circle-radius':['get','radius'],'circle-color':['get','color'],
        'circle-stroke-width':2,'circle-stroke-color':'#fff','circle-opacity':0.9 } });
    map.on('click','hotspot-dot', e => {
      const h = filtered[e.features[0].properties.id];
      if (h && setSelectedHotspot) setSelectedHotspot(h);
    });
  }, [filtered, ready, setSelectedHotspot]);

  useEffect(() => {
    if (!mapRef.current || !ready || !selectedHotspot) return;
    mapRef.current.flyTo({ center:[selectedHotspot.lng,selectedHotspot.lat],
      zoom:15, pitch:is3D?55:0, bearing:is3D?-20:0, duration:1400 });
  }, [selectedHotspot, ready, is3D]);

  if (error) return (
    <div style={{ width:'100%',minHeight:650,display:'flex',alignItems:'center',justifyContent:'center',
      background:'#f8fafc',borderRadius:12,fontFamily:'monospace',fontSize:12,color:'#94a3b8' }}>
      ⚠ Map error: {error}
    </div>
  );

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', minHeight:650 }}>
      <div ref={containerRef} style={{ position:'absolute',top:0,left:0,right:0,bottom:0,minHeight:650,borderRadius:12,overflow:'hidden' }} />
      {!ready && (
        <div style={{ position:'absolute',inset:0,zIndex:10,display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center',gap:12,
          background:'#f8f5f0',borderRadius:12,fontFamily:'monospace',fontSize:12,color:'#9ca3af' }}>
          <div style={{ width:32,height:32,borderRadius:'50%',
            border:'2px solid #d1d5db',borderTopColor:'#6b7280',animation:'spin 1s linear infinite' }} />
          <span>Loading 3D City Map…</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
