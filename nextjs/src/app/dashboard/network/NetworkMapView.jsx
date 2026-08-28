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
    'SUS-7104': { lat: 12.9762, lng: 77.6033, area: 'MG Road Signal (Suresh Naidu - Co-Accused)' },
    'SUS-3302': { lat: 13.3392, lng: 77.1015, area: 'Tumkur Highway Bypass (Arun Gowda - Lookout)' },
    'SUS-0012': { lat: 12.9279, lng: 77.6271, area: 'Koramangala 5th Block (Prakash Nair - Intel Mole)' },

    // FIR case nodes
    'FIR-2026-BL-4921': { lat: 12.9175, lng: 77.6215, area: 'Silk Board Metro Approach (Vehicle Theft)' },
    'FIR-2026-MY-1103': { lat: 12.9762, lng: 77.6033, area: 'MG Road Corridor (Armed Robbery)' },
    'FIR-2026-BL-4920': { lat: 12.9698, lng: 77.7499, area: 'ITPL Main Road (Chain Snatching)' },
    'FIR-2026-BL-5001': { lat: 12.9716, lng: 77.5946, area: 'Cubbon Park Fringe (Assault)' },
    'FIR-2026-YL-0234': { lat: 13.1007, lng: 77.5963, area: 'Yelahanka Auto Yard (Stolen Goods)' },

    // Legacy fallback keys
    n1: { lat: 12.9175, lng: 77.6215, area: 'Silk Board Junction' },
    n2: { lat: 12.9762, lng: 77.6033, area: 'MG Road Signal' },
    n3: { lat: 12.9698, lng: 77.7499, area: 'ITPL Main Road' },
  };

  // Build a quick node lookup by id for edge gang resolution
  const nodeMapRef = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;

    if (containerRef.current._leaflet_id) {
      delete containerRef.current._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
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

    // Build node lookup for gang resolution in edges
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    // ── 1. Draw edge lines with gang-aware styling ──────────────────────────
    edges.forEach((edge) => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

      const sCoords = NODE_COORDS[sourceId] || hashCoords(sourceId, '');
      const tCoords = NODE_COORDS[targetId] || hashCoords(targetId, '');

      if (!sCoords || !tCoords) return;

      const sNode = nodeMap[sourceId];
      const tNode = nodeMap[targetId];
      const sIsCase = !sNode || sNode.type === 'fir' || sNode.type === 'case' || sourceId.startsWith('FIR');
      const tIsCase = !tNode || tNode.type === 'fir' || tNode.type === 'case' || targetId.startsWith('FIR');

      let lineOptions;

      if (sIsCase || tIsCase) {
        // Edge to/from FIR node → thin dashed blue
        lineOptions = {
          color: '#2563eb',
          weight: 1.5,
          opacity: 0.4,
          dashArray: '4 6',
        };
      } else {
        const sGang = sNode?.gang_id;
        const tGang = tNode?.gang_id;

        if (sGang && tGang && sGang === tGang) {
          // Same-gang edge → solid, gang color
          lineOptions = {
            color: GANG_COLORS[sGang] || '#64748b',
            weight: 3,
            opacity: 0.8,
            dashArray: null,
          };
        } else if (sGang && tGang && sGang !== tGang) {
          // Cross-gang edge → dashed red
          lineOptions = {
            color: '#dc2626',
            weight: 2,
            opacity: 0.6,
            dashArray: '6 5',
          };
        } else {
          // Unknown/fallback
          lineOptions = {
            color: '#64748b',
            weight: 1.5,
            opacity: 0.5,
            dashArray: '4 4',
          };
        }
      }

      const line = L.polyline(
        [[sCoords.lat, sCoords.lng], [tCoords.lat, tCoords.lng]],
        lineOptions
      );
      layerGroup.addLayer(line);
    });

    // ── 2. Render Node Markers ────────────────────────────────────────────────
    nodes.forEach((node) => {
      const coords = NODE_COORDS[node.id] || hashCoords(node.id, node.label);
      const isSelected = selectedNodeId === node.id;
      const isCase = node.type === 'case' || node.type === 'fir' || node.id?.startsWith('FIR');

      const fillColor = getNodeFillColor(node);
      const radius = isSelected ? 14 : isCase ? 7 : 11;

      const circle = L.circleMarker([coords.lat, coords.lng], {
        radius,
        fillColor,
        fillOpacity: isSelected ? 0.95 : 0.85,
        color: isSelected ? '#ffffff' : '#0f172a',
        weight: isSelected ? 3 : 1.5,
      });

      // Tooltip: name, role, gang, district, crime type
      const gangLabel = node.gang_id
        ? `<p style="font-size:10px;font-weight:bold;color:${GANG_COLORS[node.gang_id] || '#64748b'};margin-top:2px;">${node.gang_id}</p>`
        : '';
      const roleLabel = node.role
        ? `<p style="font-size:10px;color:#475569;margin:1px 0;">${node.role}</p>`
        : '';
      const districtLabel = node.district
        ? `<p style="font-size:10px;color:#64748b;margin:1px 0;">📍 ${node.district}</p>`
        : '';
      const crimeLabel = node.crime
        ? `<p style="font-size:9px;text-transform:uppercase;color:#94a3b8;margin-top:2px;">${node.crime.replace(/_/g,' ')}</p>`
        : '';

      const tooltipContent = `
        <div style="font-family:system-ui;padding:3px;min-width:160px;">
          <strong style="color:${fillColor};font-size:12px;">${node.label ? node.label.replace(/\n/g,' · ') : node.id}</strong>
          ${gangLabel}
          ${roleLabel}
          ${districtLabel}
          ${crimeLabel}
        </div>
      `;

      circle.bindTooltip(tooltipContent, { sticky: true });
      circle.on('click', () => {
        if (onNodeClick) onNodeClick(node.id);
      });

      layerGroup.addLayer(circle);
    });

    // ── 3. Prediction Heatmap Zones ───────────────────────────────────────────
    const zone1 = L.circle([12.9175, 77.6215], {
      radius: 1800,
      fillColor: '#ef4444',
      fillOpacity: 0.08,
      color: '#ef4444',
      weight: 1.5,
      dashArray: '5 5',
    });
    zone1.bindPopup('<strong style="color:#ef4444;">HIGH RISK: Silk Board Corridor — Vehicle Theft Zone</strong>');
    layerGroup.addLayer(zone1);

    const zone2 = L.circle([12.9698, 77.7499], {
      radius: 1400,
      fillColor: '#f97316',
      fillOpacity: 0.07,
      color: '#f97316',
      weight: 1.5,
      dashArray: '5 5',
    });
    zone2.bindPopup('<strong style="color:#f97316;">ELEVATED RISK: Whitefield-ITPL Corridor — Snatch Theft Zone</strong>');
    layerGroup.addLayer(zone2);

    // ── 4. Map Legend (bottom-left) ───────────────────────────────────────────
    if (mapRef.current) {
      // Remove old legend if any
      if (mapRef.current._drishtiLegend) {
        mapRef.current._drishtiLegend.remove();
      }

      const legend = L.control({ position: 'bottomleft' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-drishti-legend');
        div.style.cssText = `
          background: rgba(10,15,30,0.88);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          font-family: monospace;
          font-size: 11px;
          color: #f1f5f9;
          backdrop-filter: blur(6px);
          line-height: 1.9;
          min-width: 210px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        `;
        div.innerHTML = `
          <div style="font-weight:bold;font-size:10px;letter-spacing:0.08em;color:#94a3b8;margin-bottom:6px;text-transform:uppercase;">Gang Intelligence Legend</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#f97316;flex-shrink:0;"></span>
            <span><b style="color:#f97316;">GANG-NORTH</b> — Vehicle Theft Syndicate</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#8b5cf6;flex-shrink:0;"></span>
            <span><b style="color:#8b5cf6;">GANG-SOUTH</b> — Chain Snatching Cell</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#2563eb;flex-shrink:0;"></span>
            <span style="color:#93c5fd;">FIR Case Node</span>
          </div>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:22px;height:2px;background:#ef4444;border-radius:2px;flex-shrink:0;"></span>
              <span style="color:#fca5a5;">Predicted High-Risk Zone</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:22px;height:2px;background:#dc2626;border-top:2px dashed #dc2626;flex-shrink:0;"></span>
              <span style="color:#fca5a5;">Cross-Gang Link</span>
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

  return <div ref={containerRef} className="w-full rounded-xl overflow-hidden shadow-xl border border-[var(--border)]/50" style={{ height }} />;
}
