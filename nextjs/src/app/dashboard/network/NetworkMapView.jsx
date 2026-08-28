'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Predictive Trajectory Corridors & Checkpoints ─────────────────────────
const PREDICTIVE_ROUTES = [
  {
    id: 'SYN-VT-01-ROUTE',
    name: 'Bullet Ramesh Escape Corridor (NH-44)',
    color: '#3B82F6',
    waypoints: [
      { lat: 12.9175, lng: 77.6215, label: 'Silk Board TTMC (Last Sighted: 02:15 AM)', type: 'start' },
      { lat: 12.8452, lng: 77.6602, label: 'Electronic City Toll (FASTag Sweep)', type: 'checkpoint' },
      { lat: 12.7800, lng: 77.7200, label: 'Attibele Intercept Checkpost (Active Alert)', type: 'intercept' },
      { lat: 13.1500, lng: 77.6000, label: 'Predicted Transit: Raichur Rural Chopshop Yard', type: 'destination' }
    ]
  },
  {
    id: 'SYN-ND-02-ROUTE',
    name: 'Helmet Imran Narcotics Drop Trajectory',
    color: '#10B981',
    waypoints: [
      { lat: 12.9350, lng: 77.6900, label: 'Bellandur Tech Node (Dead-drop origin)', type: 'start' },
      { lat: 13.0456, lng: 77.6256, label: 'Hebbal Flyover (ANPR Sweep CAM-WF-0019)', type: 'checkpoint' },
      { lat: 13.3400, lng: 77.1000, label: 'Tumakuru Highway Intercept Gate', type: 'intercept' }
    ]
  },
  {
    id: 'SYN-RB-03-ROUTE',
    name: 'Snake Naidu Highway Heist Escape Vector',
    color: '#EF4444',
    waypoints: [
      { lat: 12.9784, lng: 77.6408, label: 'Indiranagar 100ft Rd (Target Ambush)', type: 'start' },
      { lat: 12.9716, lng: 77.5946, label: 'Cubbon Park Fringe (Getaway Transition)', type: 'checkpoint' },
      { lat: 13.1007, lng: 77.5963, label: 'Yelahanka Toll Intercept Barrier', type: 'intercept' }
    ]
  }
];

const ANPR_SURVEILLANCE_NODES = [
  { id: 'CAM-BLR-0045', name: 'Silk Board TTMC Chokepoint', lat: 12.9175, lng: 77.6215, status: 'LOCKED_SWEEP' },
  { id: 'CAM-BLR-0088', name: 'Indiranagar 100ft Toll Barrier', lat: 12.9784, lng: 77.6408, status: 'SWEEPING' },
  { id: 'CAM-WF-0019',  name: 'Outer Ring Road Bellandur ANPR', lat: 12.9350, lng: 77.6900, status: 'LOCKED_SWEEP' },
  { id: 'CAM-HEB-0012', name: 'Hebbal Expressway Checkpoint', lat: 13.0456, lng: 77.6256, status: 'PATROL_DEPLOYED' },
  { id: 'CAM-ATT-0001', name: 'Attibele Inter-State Border Gate', lat: 12.7800, lng: 77.7200, status: 'INTERCEPT_READY' },
];

export default function NetworkMapView({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  height = 580
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Map center default (Bengaluru Urban & Karnataka Arteries)
  const defaultCenter = [12.9716, 77.6000];
  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // ── 1. Map Initialization ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors • KSP Telemetry',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 250);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [tileUrl]);

  // ── 2. Render Predictive Trajectories & Intercept Grid ───────────────────
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Draw Predictive Trajectory Paths
    PREDICTIVE_ROUTES.forEach((route) => {
      const latlngs = route.waypoints.map(w => [w.lat, w.lng]);
      
      // Background glow polyline
      L.polyline(latlngs, {
        color: route.color,
        weight: 6,
        opacity: 0.25,
        lineCap: 'round'
      }).addTo(layerGroup);

      // Foreground dashed trajectory polyline
      const polyline = L.polyline(latlngs, {
        color: route.color,
        weight: 2.5,
        opacity: 0.9,
        dashArray: '8, 6',
      }).addTo(layerGroup);

      polyline.bindTooltip(`
        <div style="font-family:monospace;font-size:11px;padding:3px 5px;color:#0F172A;font-weight:bold;">
          PREDICTED TRAJECTORY: ${route.name}
        </div>
      `, { sticky: true });

      // Waypoint Markers
      route.waypoints.forEach((wp, wIdx) => {
        const isStart = wp.type === 'start';
        const isIntercept = wp.type === 'intercept';
        const isDest = wp.type === 'destination';

        const markerColor = isStart ? '#DC2626' : isIntercept ? '#F59E0B' : isDest ? '#8B5CF6' : route.color;
        const markerRadius = isStart ? 8 : isIntercept ? 7 : 5;

        const circle = L.circleMarker([wp.lat, wp.lng], {
          radius: markerRadius,
          fillColor: markerColor,
          color: '#FFFFFF',
          weight: 2,
          fillOpacity: 0.95,
        }).addTo(layerGroup);

        circle.bindTooltip(`
          <div style="font-family:sans-serif;padding:4px 8px;min-width:160px;">
            <div style="font-weight:bold;font-size:11px;color:#0F172A;font-family:monospace;">${wp.type.toUpperCase()} VECTOR</div>
            <div style="font-size:11px;color:#334155;margin-top:2px;">${wp.label}</div>
            <div style="font-size:9.5px;color:${markerColor};font-weight:bold;margin-top:3px;font-family:monospace;">Multi-Source Intel Verified</div>
          </div>
        `, { direction: 'top', offset: [0, -5] });
      });
    });

    // 2. Draw ANPR Surveillance Chokepoints (Sensors with Radar Radii)
    ANPR_SURVEILLANCE_NODES.forEach((cam) => {
      L.circle([cam.lat, cam.lng], {
        radius: 1200,
        color: '#06B6D4',
        weight: 1,
        dashArray: '4, 4',
        fillColor: '#06B6D4',
        fillOpacity: 0.08,
      }).addTo(layerGroup);

      const camMarker = L.circleMarker([cam.lat, cam.lng], {
        radius: 6,
        fillColor: '#06B6D4',
        color: '#FFFFFF',
        weight: 1.5,
        fillOpacity: 1,
      }).addTo(layerGroup);

      camMarker.bindTooltip(`
        <div style="font-family:sans-serif;padding:3px 6px;">
          <div style="font-weight:bold;font-size:11px;color:#0F172A;font-family:monospace;">ANPR CHOKEPOINT: ${cam.id}</div>
          <div style="font-size:10.5px;color:#475569;">${cam.name}</div>
          <div style="font-size:9.5px;color:#0891B2;font-weight:bold;margin-top:2px;font-family:monospace;">STATUS: ${cam.status}</div>
        </div>
      `, { direction: 'top', offset: [0, -5] });
    });

    // 3. Map Dynamic Syndicate Suspect Pins
    (nodes || []).forEach((node) => {
      if (node.district === 'Bengaluru Urban' || node.id === 'SUS-8842') {
        const pin = L.circleMarker([12.9175, 77.6215], {
          radius: 11,
          fillColor: '#DC2626',
          color: '#FFFFFF',
          weight: 2.5,
          fillOpacity: 0.95,
        }).addTo(layerGroup);

        pin.bindTooltip(`
          <div style="font-family:sans-serif;padding:4px 6px;">
            <div style="font-weight:bold;font-size:12px;color:#0F172A;">${node.label}</div>
            <div style="font-size:11px;color:#475569;">Vehicle: ${node.vehicle || 'Tracked Vehicle'}</div>
            <div style="font-size:10px;font-weight:bold;color:#DC2626;margin-top:2px;font-family:monospace;">Risk: ${node.risk_score}/100 • HIGH PRIORITY INTERCEPT</div>
          </div>
        `, { direction: 'top', offset: [0, -8] });

        pin.on('click', () => {
          if (onNodeClick) onNodeClick(node.id);
        });
      }
    });

    // 4. Tactical Map Telemetry Legend
    if (!mapRef.current._drishtiPredictiveLegend) {
      const legend = L.control({ position: 'bottomleft' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(51, 65, 85, 0.8);
          border-radius: 14px;
          padding: 12px 14px;
          font-family: monospace;
          font-size: 11px;
          color: #F8FAFC;
          backdrop-filter: blur(10px);
          line-height: 1.8;
          min-width: 240px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        `;
        div.innerHTML = `
          <div style="font-weight:700;font-size:10px;letter-spacing:0.08em;color:#94A3B8;margin-bottom:6px;text-transform:uppercase;border-bottom:1px solid rgba(51,65,85,0.6);padding-bottom:3px;">
            CIA-Calibrated Intercept Grid
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#DC2626;flex-shrink:0;"></span>
            <span><b>Target Sighting</b> (Last Confirmed)</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:18px;height:2px;background:#3B82F6;border-top:2px dashed #3B82F6;flex-shrink:0;"></span>
            <span style="color:#60A5FA;">Predicted Escape Corridor</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#F59E0B;flex-shrink:0;"></span>
            <span style="color:#FBBF24;">Active Intercept Chokepoint</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#06B6D4;flex-shrink:0;"></span>
            <span style="color:#22D3EE;">ANPR Surveillance Sensor</span>
          </div>
          <div style="margin-top:6px;padding-top:5px;border-top:1px solid rgba(51,65,85,0.6);font-size:9.5px;color:#94A3B8;">
            <div>FASTag Sweep Rate: <b>98.4%</b></div>
            <div>Cell Tower Hops: <b>3 Synced</b></div>
          </div>
        `;
        L.DomEvent.disableClickPropagation(div);
        return div;
      };
      legend.addTo(mapRef.current);
      mapRef.current._drishtiPredictiveLegend = legend;
    }

  }, [nodes, edges, selectedNodeId, onNodeClick]);

  return (
    <div 
      ref={containerRef} 
      className="w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200 dark:border-zinc-800" 
      style={{ height }} 
    />
  );
}
