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

// ── Gang colors ──────────────────────────────────────────────────────────────
const GANG_COLORS = {
  'GANG-NORTH': '#f97316', // amber-orange
  'GANG-SOUTH': '#8b5cf6', // violet
};

function getNodeFillColor(node) {
  const isCase = node.type === 'case' || node.type === 'fir' || (node.id || '').startsWith('FIR');
  if (isCase) return '#2563eb';
  if (node.gang_id && GANG_COLORS[node.gang_id]) return GANG_COLORS[node.gang_id];
  return '#64748b';
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

  // ── Explicit, accurate coordinate dictionary ──────────────────────────────
  const NODE_COORDS = {
    // GANG-NORTH suspects
    'SUS-8842': { lat: 12.9175, lng: 77.6215, area: 'Silk Board Junction (Ramesh Kumar - Leader)' },
    'SUS-4401': { lat: 13.1007, lng: 77.5963, area: 'Yelahanka Chopshop Yard (Deepak Shetty - Weapons Handler)' },
    'SUS-2211': { lat: 12.9716, lng: 77.5946, area: 'Central Bengaluru (Farid Mirza - Arms Supplier)' },
    'SUS-1190': { lat: 12.8452, lng: 77.6602, area: 'Electronic City Toll (Manoj Reddy - Lookout)' },
    'SUS-9901': { lat: 12.9784, lng: 77.6408, area: 'Indiranagar 100ft Road (Ravi Shankar - Finance Handler)' },
    'SUS-6633': { lat: 12.9850, lng: 77.5930, area: 'Shivajinagar Court Complex (Basha Khan - Enforcer)' },

    // GANG-SOUTH suspects
    'SUS-5921': { lat: 12.9698, lng: 77.7499, area: 'Whitefield ITPL (Imran Khan - Gang Leader)' },
    'SUS-7104': { lat: 12.9279, lng: 77.6271, area: 'HSR Layout BDA Complex (Suresh Naidu - Armed Heist)' },
    'SUS-3302': { lat: 13.0456, lng: 77.6256, area: 'Hebbal Flyover Junction (Arun Gowda - Logistics)' },
    'SUS-5512': { lat: 12.9344, lng: 77.6101, area: 'Koramangala 5th Block (Karthik Raja - Money Laundering)' },

    // Core FIR Cases
    'FIR-2026-BL-0492': { lat: 12.9165, lng: 77.6200, area: 'Silk Board Vehicle Theft (FIR-2026-BL-0492)' },
    'FIR-2026-BL-0811': { lat: 12.9740, lng: 77.6080, area: 'MG Road Armed Robbery (FIR-2026-BL-0811)' },
    'FIR-2026-BL-1104': { lat: 12.9680, lng: 77.7450, area: 'Whitefield Chain Snatching (FIR-2026-BL-1104)' },
    'FIR-2026-BL-1726': { lat: 12.9250, lng: 77.6240, area: 'HSR Layout Burglary (FIR-2026-BL-1726)' },
  };

  // ── 1. Map Initialization ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // Prevent double init

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [tileUrl]);

  // ── 2. Render Markers, Heat Radii & Dynamic Links ─────────────────────────
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Node lookup dictionary by ID for drawing links
    const nodePosMap = {};

    // ── Draw Gang Area Heat Radii ───────────────────────────────────────────
    const gangNorthCenter = [12.9175, 77.6215]; // Silk Board
    const gangSouthCenter = [12.9698, 77.7499]; // Whitefield

    L.circle(gangNorthCenter, {
      radius: 3500,
      color: '#f97316',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#f97316',
      fillOpacity: 0.08,
    }).addTo(layerGroup).bindTooltip('GANG-NORTH Primary Vehicle Theft Zone', { permanent: false, direction: 'top' });

    L.circle(gangSouthCenter, {
      radius: 4200,
      color: '#8b5cf6',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#8b5cf6',
      fillOpacity: 0.08,
    }).addTo(layerGroup).bindTooltip('GANG-SOUTH Chain Snatching Operational Zone', { permanent: false, direction: 'top' });

    // ── Map Nodes ─────────────────────────────────────────────────────────────
    (nodes || []).forEach((node) => {
      const coords = NODE_COORDS[node.id] || hashCoords(node.id, node.label);
      nodePosMap[node.id] = [coords.lat, coords.lng];

      const isSelected = selectedNodeId === node.id;
      const isSuspect = node.type === 'suspect' || (node.id || '').startsWith('SUS');
      const isCase = node.type === 'case' || node.type === 'fir' || (node.id || '').startsWith('FIR');
      const fillColor = getNodeFillColor(node);

      const radius = isSelected ? 14 : (node.size ? Math.max(7, Math.min(16, node.size / 1.5)) : (isSuspect ? 10 : 7));

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius,
        fillColor,
        color: isSelected ? '#ffffff' : (isSuspect ? '#0f172a' : '#ffffff'),
        weight: isSelected ? 3 : 1.5,
        opacity: 0.95,
        fillOpacity: isSelected ? 0.95 : 0.8,
      });

      // Tooltip content
      const tooltipContent = `
        <div style="font-family:sans-serif;padding:4px 6px;min-width:140px;">
          <div style="font-weight:bold;font-size:12px;color:#0f172a;">${node.label || node.id}</div>
          <div style="font-size:11px;color:#475569;margin-top:2px;">${node.role || node.district || coords.area}</div>
          ${node.risk_score ? `<div style="font-size:10px;font-weight:bold;color:${node.risk_score > 85 ? '#dc2626' : '#d97706'};margin-top:4px;">Risk Score: ${node.risk_score}/100</div>` : ''}
          ${node.gang_id ? `<div style="font-size:10px;font-weight:bold;color:${GANG_COLORS[node.gang_id] || '#64748b'};margin-top:2px;">Gang: ${node.gang_id}</div>` : ''}
        </div>
      `;
      marker.bindTooltip(tooltipContent, { direction: 'top', offset: [0, -6] });

      marker.on('click', () => {
        if (onNodeClick) onNodeClick(node.id);
      });

      marker.addTo(layerGroup);
    });

    // ── Map Edges (Co-Accused & Case Links) ──────────────────────────────────
    (edges || []).forEach((edge) => {
      const srcId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const tgtId = typeof edge.target === 'object' ? edge.target.id : edge.target;

      const srcPos = nodePosMap[srcId];
      const tgtPos = nodePosMap[tgtId];

      if (srcPos && tgtPos) {
        const isCrossGang = edge.crime_type === 'cross_gang' || edge.weight > 3;
        const polyline = L.polyline([srcPos, tgtPos], {
          color: isCrossGang ? '#dc2626' : '#94a3b8',
          weight: isCrossGang ? 2.5 : 1.2,
          opacity: isCrossGang ? 0.85 : 0.4,
          dashArray: isCrossGang ? '4, 4' : null,
        });

        if (edge.fir_case_number || edge.crime_type) {
          polyline.bindTooltip(
            `<div style="font-size:10px;font-family:sans-serif;color:#0f172a;"><b>Link:</b> ${edge.fir_case_number || edge.crime_type}</div>`,
            { sticky: true }
          );
        }

        polyline.addTo(layerGroup);
      }
    });

    // ── 4. Add Crisp Light Theme Map Legend ───────────────────────────────────
    if (!mapRef.current._drishtiLegend) {
      const legend = L.control({ position: 'bottomleft' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText = `
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 14px;
          font-family: inherit;
          font-size: 11px;
          color: #0f172a;
          backdrop-filter: blur(8px);
          line-height: 1.9;
          min-width: 220px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        `;
        div.innerHTML = `
          <div style="font-weight:700;font-size:10px;letter-spacing:0.08em;color:#64748b;margin-bottom:6px;text-transform:uppercase;">Gang Intelligence Legend</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#f97316;flex-shrink:0;"></span>
            <span><b style="color:#ea580c;">GANG-NORTH</b> — Vehicle Theft Syndicate</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#8b5cf6;flex-shrink:0;"></span>
            <span><b style="color:#7c3aed;">GANG-SOUTH</b> — Chain Snatching Cell</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#2563eb;flex-shrink:0;"></span>
            <span style="color:#2563eb;font-weight:600;">FIR Case Node</span>
          </div>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:22px;height:2px;background:#ef4444;border-radius:2px;flex-shrink:0;"></span>
              <span style="color:#dc2626;font-weight:500;">Predicted High-Risk Zone</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:22px;height:2px;background:#dc2626;border-top:2px dashed #dc2626;flex-shrink:0;"></span>
              <span style="color:#dc2626;font-weight:500;">Cross-Gang Link</span>
            </div>
          </div>
        `;
        L.DomEvent.disableClickPropagation(div);
        return div;
      };
      legend.addTo(mapRef.current);
      mapRef.current._drishtiLegend = legend;
    }

    // ── 5. Pan smoothly to selected node coordinates ──────────────────────────
    if (selectedNodeId) {
      const selCoords = NODE_COORDS[selectedNodeId] || hashCoords(selectedNodeId, '');
      mapRef.current.flyTo([selCoords.lat, selCoords.lng], 13, { animate: true, duration: 0.8 });
    }

  }, [nodes, edges, selectedNodeId, onNodeClick]);

  return <div ref={containerRef} className="w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800" style={{ height }} />;
}
