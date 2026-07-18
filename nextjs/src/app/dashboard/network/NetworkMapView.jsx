'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function NetworkMapView({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  height = 550
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Map center default (Bengaluru)
  const defaultCenter = [12.9716, 77.5946];
  const tileUrl = process.env.NEXT_PUBLIC_MAPS_TILE ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Coordinate mapping for mock nodes
  const NODE_COORDS = {
    n1: { lat: 12.9175, lng: 77.6215, area: 'Silk Board Junction' },      // Ramesh Kumar
    n2: { lat: 12.9762, lng: 77.6033, area: 'MG Road Signal' },         // Suresh Naidu
    n3: { lat: 12.9279, lng: 77.6271, area: 'HSR Layout Sector 1' },    // Anand Murthy
    n4: { lat: 13.0456, lng: 77.6256, area: 'Hebbal Flyover' },         // Kiran Gowda
    n5: { lat: 12.9141, lng: 77.5998, area: 'JP Nagar 5th Phase' },     // Vijay Bhaskar
    n6: { lat: 12.9344, lng: 77.6264, area: 'FIR-2026-BL-0492 Scene' }, // FIR 0492
    n7: { lat: 12.9762, lng: 77.6033, area: 'FIR-2026-BL-0811 Scene' }, // FIR 0811
    n8: { lat: 12.9698, lng: 77.7499, area: 'FIR-2026-BL-1104 Scene' }, // FIR 1104
    n9: { lat: 12.9698, lng: 77.7499, area: 'Whitefield ITPL Road' },   // Venkatesh Gowda
    n10: { lat: 12.9542, lng: 77.4975, area: 'Rajajinagar Metro' },     // Prakash Raj
    n11: { lat: 12.9175, lng: 77.6215, area: 'Silk Board Cam #45' },    // Cam 45
    n12: { lat: 12.9762, lng: 77.6033, area: 'MG Road Cam #102' }       // Cam 102
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

  // Update map markers & suspect trail lines when nodes or selection changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const map = mapRef.current;
    const trailPositions = [];

    nodes.forEach((node) => {
      const coords = NODE_COORDS[node.id] || {
        lat: 12.9716 + (Math.random() - 0.5) * 0.08,
        lng: 77.5946 + (Math.random() - 0.5) * 0.08,
        area: node.label
      };

      const isSelected = selectedNodeId === node.id;
      const isAccused = node.type === 'accused';
      const isCase = node.type === 'case';
      const isCamera = node.type === 'camera';

      const color = isAccused
        ? ((node.risk_score || 0) > 70 ? '#ef4444' : (node.risk_score || 0) > 40 ? '#f97316' : '#10b981')
        : isCase ? '#2563eb' : '#06b6d4';

      const radius = isSelected ? 14 : isAccused ? 10 : 8;

      const circle = L.circleMarker([coords.lat, coords.lng], {
        radius,
        fillColor: color,
        fillOpacity: isSelected ? 0.95 : 0.75,
        color: isSelected ? '#ffffff' : '#0f172a',
        weight: isSelected ? 3 : 1.5,
      });

      const tooltipContent = `
        <div class="text-xs font-mono font-sans p-1">
          <strong style="color: ${color}">${node.label}</strong>
          <p class="text-[10px] text-gray-300 mt-0.5">${coords.area}</p>
          ${isAccused ? `<p class="text-[10px] font-bold">Threat Score: ${node.risk_score || 70}/100</p>` : ''}
          <p class="text-[10px] text-blue-400 capitalize mt-0.5">${node.type}</p>
        </div>
      `;

      circle.bindTooltip(tooltipContent);
      circle.on('click', () => {
        if (onNodeClick) onNodeClick(node.id);
      });

      circle.addTo(map);
      markersRef.current.push(circle);

      if (isSelected || node.id === 'n1') {
        trailPositions.push([coords.lat, coords.lng]);
      }
    });

    // Draw connecting trail lines between linked nodes
    const edgeLines = [];
    edges.forEach((edge) => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

      const sCoords = NODE_COORDS[sourceId];
      const tCoords = NODE_COORDS[targetId];

      if (sCoords && tCoords) {
        edgeLines.push([[sCoords.lat, sCoords.lng], [tCoords.lat, tCoords.lng]]);
      }
    });

    if (edgeLines.length > 0) {
      edgeLines.forEach(line => {
        const poly = L.polyline(line, {
          color: '#38bdf8',
          weight: 2,
          opacity: 0.6,
          dashArray: '5 5'
        }).addTo(map);
        markersRef.current.push(poly);
      });
    }

    // Pan map to selected node if active
    if (selectedNodeId && NODE_COORDS[selectedNodeId]) {
      const selCoords = NODE_COORDS[selectedNodeId];
      map.flyTo([selCoords.lat, selCoords.lng], 13, { animate: true, duration: 1 });
    }

  }, [nodes, edges, selectedNodeId, onNodeClick]);

  return <div ref={containerRef} className="w-full rounded-xl overflow-hidden shadow-2xl" style={{ height }} />;
}
