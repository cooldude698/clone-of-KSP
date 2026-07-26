'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Deterministic coordinate generator so unmapped nodes stay rock-solid static
function hashCoords(idStr, label) {
  let hash = 0;
  const str = (idStr || '') + (label || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const normLat = 12.9100 + (Math.abs(hash % 1000) / 1000) * 0.15;
  const normLng = 77.5500 + (Math.abs((hash >> 3) % 1000) / 1000) * 0.20;
  return { lat: normLat, lng: normLng, area: label || idStr };
}

export default function NetworkMapView({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  height = 550
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Map center default (Bengaluru Urban)
  const defaultCenter = [12.9716, 77.6000];
  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Explicit, accurate coordinate dictionary for Karnataka Gang & FIR Network
  const NODE_COORDS = {
    'SUS-8842': { lat: 12.9175, lng: 77.6215, area: 'Silk Board Junction (Ramesh Kumar - Leader)' },
    'SUS-7104': { lat: 12.9762, lng: 77.6033, area: 'MG Road Signal (Suresh Naidu - Robber)' },
    'SUS-5921': { lat: 12.9698, lng: 77.7499, area: 'Whitefield ITPL (Imran Khan - Snatcher)' },
    'SUS-4401': { lat: 13.1007, lng: 77.5963, area: 'Yelahanka Chopshop Yard (Deepak Shetty - Fence)' },
    'SUS-3302': { lat: 13.3392, lng: 77.1015, area: 'Tumkur Highway Bypass (Arun Gowda - Lookout)' },
    'SUS-2211': { lat: 12.9716, lng: 77.5946, area: 'Central Bengaluru (Farid Mirza - Weapons Source)' },
    'SUS-1190': { lat: 12.8452, lng: 77.6602, area: 'Electronic City Toll (Manoj Reddy - Driver)' },

    'FIR-2026-BL-4921': { lat: 12.9175, lng: 77.6215, area: 'Silk Board Metro Approach (Vehicle Theft)' },
    'FIR-2026-MY-1103': { lat: 12.9762, lng: 77.6033, area: 'MG Road Corridor (Armed Robbery)' },
    'FIR-2026-BL-4920': { lat: 12.9698, lng: 77.7499, area: 'ITPL Main Road (Chain Snatching)' },
    'FIR-2026-BL-5001': { lat: 12.9716, lng: 77.5946, area: 'Cubbon Park Fringe (Assault)' },
    'FIR-2026-YL-0234': { lat: 13.1007, lng: 77.5963, area: 'Yelahanka Auto Yard (Stolen Goods)' },

    n1: { lat: 12.9175, lng: 77.6215, area: 'Silk Board Junction' },
    n2: { lat: 12.9762, lng: 77.6033, area: 'MG Road Signal' },
    n3: { lat: 12.9698, lng: 77.7499, area: 'ITPL Main Road' },
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (containerRef.current._leaflet_id) {
      delete containerRef.current._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current && containerRef.current._leaflet_id) {
        delete containerRef.current._leaflet_id;
      }
    };
  }, [tileUrl]);

  // Update map markers & gang trajectory links when nodes, edges, or selection change
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Draw Connecting Link Lines between connected criminal nodes
    edges.forEach((edge) => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

      const sCoords = NODE_COORDS[sourceId] || hashCoords(sourceId, '');
      const tCoords = NODE_COORDS[targetId] || hashCoords(targetId, '');

      if (sCoords && tCoords) {
        const line = L.polyline([[sCoords.lat, sCoords.lng], [tCoords.lat, tCoords.lng]], {
          color: '#2563eb',
          weight: 2.5,
          opacity: 0.7,
          dashArray: '6 6'
        });
        layerGroup.addLayer(line);
      }
    });

    // 2. Render Node Markers
    nodes.forEach((node) => {
      const coords = NODE_COORDS[node.id] || hashCoords(node.id, node.label);
      const isSelected = selectedNodeId === node.id;
      const isCase = node.type === 'case' || node.type === 'fir' || node.id?.startsWith('FIR');

      const color = isCase
        ? '#2563eb'
        : (node.risk_score || 0) > 80
        ? '#dc2626'
        : (node.risk_score || 0) > 60
        ? '#d97706'
        : '#16a34a';

      const radius = isSelected ? 14 : isCase ? 9 : 11;

      const circle = L.circleMarker([coords.lat, coords.lng], {
        radius,
        fillColor: color,
        fillOpacity: isSelected ? 0.95 : 0.8,
        color: isSelected ? '#ffffff' : '#0f172a',
        weight: isSelected ? 3 : 1.5,
      });

      const tooltipContent = `
        <div style="font-family: system-ui; padding: 2px;">
          <strong style="color: ${color}; font-size: 12px;">${node.label}</strong>
          <p style="font-size: 10px; color: #475569; margin-top: 2px;">${coords.area}</p>
          ${!isCase ? `<p style="font-size: 10px; font-weight: bold; color: #dc2626;">Threat Risk Index: ${node.risk_score || 80}/100</p>` : ''}
          <p style="font-size: 9px; text-transform: uppercase; color: #64748b;">${node.type || 'Suspect'}</p>
        </div>
      `;

      circle.bindTooltip(tooltipContent);
      circle.on('click', () => {
        if (onNodeClick) onNodeClick(node.id);
      });

      layerGroup.addLayer(circle);
    });

    // Pan smoothly to selected node coordinates
    if (selectedNodeId) {
      const selCoords = NODE_COORDS[selectedNodeId] || hashCoords(selectedNodeId, '');
      mapRef.current.flyTo([selCoords.lat, selCoords.lng], 13, { animate: true, duration: 0.8 });
    }

  }, [nodes, edges, selectedNodeId, onNodeClick]);

  return <div ref={containerRef} className="w-full rounded-xl overflow-hidden shadow-xl border border-[var(--border)]/50" style={{ height }} />;
}
