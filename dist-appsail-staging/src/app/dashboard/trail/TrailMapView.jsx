'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Eye, EyeOff, Grid } from 'lucide-react';

// Fix Leaflet default icon URLs for safety across environments
if (typeof window !== 'undefined' && L.Icon && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// ── CUSTOM SVG ICON CREATOR ───────────────────────────────────────────────────

function getMarkerIconSvg(type) {
  if (type === 'first') {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>`;
  }
  if (type === 'last') {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`;
  }
  if (type === 'projected') {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
  }
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
}

// ── MARKER HTML CREATOR ───────────────────────────────────────────────────────

function createCustomMarkerHtml(number, type, isLowConfidence, isHighlighted, prefersReducedMotion, index = 0) {
  // STRICT NAMED TOKENS:
  // phosphor-500: #4A8B6F (monitor green)
  // critical-500: #B91C1C (alert red)
  // warn-500:     #D97706 (earthy gold)

  let bgColor = '#4A8B6F';
  let borderColor = '#2E5A47';
  let textColor = '#FFFFFF';
  let ringColor = '#4A8B6F';

  if (type === 'first') {
    bgColor = '#4A8B6F';
    borderColor = '#2E5A47';
    ringColor = '#4A8B6F';
  } else if (type === 'last') {
    bgColor = '#B91C1C';
    borderColor = '#7F1D1D';
    ringColor = '#B91C1C';
  } else if (type === 'projected') {
    bgColor = '#D97706';
    borderColor = '#92400E';
    ringColor = '#D97706';
  }

  const opacity = isLowConfidence ? '0.65' : '1.0';
  const highlightRing = isHighlighted
    ? 'outline: 3px solid #4A8B6F; outline-offset: 2px; box-shadow: 0 0 16px rgba(74,139,111,0.7);'
    : 'box-shadow: 0 2px 8px rgba(0,0,0,0.5);';

  const iconSvg = getMarkerIconSvg(type);

  const pulseRingHtml = !prefersReducedMotion
    ? `<div style="
        position: absolute;
        inset: -6px;
        border-radius: 8px;
        border: 2px solid ${ringColor};
        animation: markerPulseRing 2.2s infinite cubic-bezier(0, 0.2, 0.8, 1);
        animation-delay: ${index * 0.45}s;
        pointer-events: none;
        box-sizing: border-box;
      "></div>`
    : '';

  return `
    <div style="position: relative; display: inline-block;">
      ${pulseRingHtml}
      <div style="
        position: relative;
        z-index: 10;
        background-color: ${bgColor};
        color: ${textColor};
        border: 1.5px solid ${borderColor};
        border-radius: 6px;
        padding: 3px 8px;
        height: 26px;
        display: flex;
        align-items: center;
        gap: 5px;
        font-family: var(--font-mono), 'IBM Plex Mono', 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 11px;
        opacity: ${opacity};
        transition: all 0.2s ease;
        cursor: pointer;
        ${highlightRing}
      ">
        <span>${iconSvg}</span>
        <span>${type === 'projected' ? 'PROJ' : `#${number}`}</span>
      </div>
    </div>
  `;
}

function createGhostMarkerHtml() {
  return `
    <div style="position: relative; display: flex; items-center; justify-content: center;">
      <div style="
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px solid #4A8B6F;
        animation: ghostBeacon 1.5s infinite ease-out;
      "></div>
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #EFEAE4;
        border: 2.5px solid #4A8B6F;
        box-shadow: 0 0 12px rgba(74, 139, 111, 0.9);
      "></div>
    </div>
  `;
}

// ── COMPONENT DEFINITION ──────────────────────────────────────────────────────

export default function TrailMapView({
  trailData = [],
  visibleHopsCount = 1,
  highlightedHop = null,
  projectedPath = null,
  ghostPosition = null,
  onHopSelect = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const ghostMarkerRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [nightVision, setNightVision] = useState(false); // BUTTON 1 STATE
  const [tacticalGrid, setTacticalGrid] = useState(false); // BUTTON 2 STATE (Tactical Lat/Lng Graticule Grid)
  const [flicker, setFlicker] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setPrefersReducedMotion(reduced);
    }
  }, []);

  // BUTTON 1 HANDLER: Night-Vision Toggle
  const toggleNightVision = () => {
    const nextState = !nightVision;
    console.log('[GeoTrail Map Debug] BUTTON 1 CLICKED: Night-Vision Toggled to ->', nextState);
    setFlicker(true);
    setNightVision(nextState);
    setTimeout(() => setFlicker(false), 250);
  };

  // BUTTON 2 HANDLER: Tactical Graticule Grid Toggle
  const toggleTacticalGrid = () => {
    const nextState = !tacticalGrid;
    console.log('[GeoTrail Map Debug] BUTTON 2 CLICKED: Tactical Grid Toggled to ->', nextState);
    setTacticalGrid(nextState);
  };

  // BUTTON 4 HANDLER: Fit-All-Hops Control
  const handleFitAllHops = useCallback(() => {
    console.log('[GeoTrail Map Debug] BUTTON 4 CLICKED: Fit-All-Hops triggered. mapRef ready?:', !!mapRef.current);
    if (!mapRef.current || !trailData || trailData.length === 0) return;
    const positions = trailData.map((h) => [h.lat, h.lng]);
    if (positions.length > 1) {
      mapRef.current.flyToBounds(positions, { padding: [60, 60], duration: 1.2 });
    } else if (positions.length === 1) {
      mapRef.current.flyTo(positions[0], 14, { duration: 1.2 });
    }
  }, [trailData]);

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!containerRef.current) return;

    if (containerRef.current._leaflet_id) {
      delete containerRef.current._leaflet_id;
    }

    const defaultCenter =
      trailData && trailData.length > 0
        ? [trailData[0].lat, trailData[0].lng]
        : [12.9716, 77.5946];

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 13,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Standard OpenStreetMap basemap (clean, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'map-tiles-dark-invert',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;
    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
      if (containerRef.current && containerRef.current._leaflet_id) {
        delete containerRef.current._leaflet_id;
      }
    };
  }, []);

  // Update polylines, markers, tooltips & view on data/animation state changes
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current || !mapReady) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (!trailData || trailData.length === 0) return;

    const visibleHops = trailData.slice(0, visibleHopsCount);
    if (visibleHops.length === 0) return;

    // PATH POLYLINES
    for (let i = 0; i < visibleHops.length - 1; i++) {
      const p1 = [visibleHops[i].lat, visibleHops[i].lng];
      const p2 = [visibleHops[i + 1].lat, visibleHops[i + 1].lng];
      const nextHop = visibleHops[i + 1];
      const isLowConf = (nextHop.confidence ?? 100) < 90;

      const segmentPolyline = L.polyline([p1, p2], {
        color: isLowConf ? '#48596D' : '#4A8B6F',
        weight: isLowConf ? 3 : 4,
        dashArray: isLowConf ? '6, 6' : '',
        opacity: isLowConf ? 0.6 : 0.7,
      });

      segmentPolyline.addTo(layerGroup);
    }

    // PROJECTED VECTOR
    if (projectedPath && visibleHopsCount >= trailData.length) {
      const projPolyline = L.polyline(
        [
          [projectedPath.fromLat, projectedPath.fromLng],
          [projectedPath.lat, projectedPath.lng],
        ],
        {
          color: '#D97706',
          weight: 3,
          dashArray: '3, 6',
          opacity: 0.85,
        }
      );
      projPolyline.addTo(layerGroup);

      // Add Projected Vector Marker
      const projHtml = createCustomMarkerHtml(
        '?',
        'projected',
        false,
        false,
        prefersReducedMotion,
        visibleHops.length
      );
      const projIcon = L.divIcon({
        html: projHtml,
        className: '',
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      });

      const projMarker = L.marker([projectedPath.lat, projectedPath.lng], {
        icon: projIcon,
      });

      projMarker.bindTooltip(
        `
        <div style="font-family: var(--font-mono), 'IBM Plex Mono', monospace; font-size: 11px; padding: 4px 6px; color: #D97706;">
          <strong>PROJECTED HEADING (UNCONFIRMED)</strong><br/>
          Est. Arrival: ~${projectedPath.projectedTime} IST
        </div>
      `,
        { opacity: 1, direction: 'top', offset: [0, -14] }
      );

      projMarker.addTo(layerGroup);
    }

    // HOP MARKERS
    visibleHops.forEach((hop, index) => {
      let type = 'middle';
      if (index === 0) type = 'first';
      else if (index === trailData.length - 1) type = 'last';

      const isLowConf = (hop.confidence ?? 100) < 90;
      const isHighlighted = highlightedHop === hop.hop;

      const markerHtml = createCustomMarkerHtml(
        hop.hop,
        type,
        isLowConf,
        isHighlighted,
        prefersReducedMotion,
        index
      );
      const icon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [52, 26],
        iconAnchor: [26, 13],
        popupAnchor: [0, -15],
      });

      const marker = L.marker([hop.lat, hop.lng], {
        icon,
        zIndexOffset: isHighlighted ? 1000 : index * 10,
      });

      const tooltipContent = `
        <div style="
          background-color: #1E2733;
          border: 1px solid #7A90A8;
          border-radius: 8px;
          padding: 8px 12px;
          color: #EFEAE4;
          box-shadow: 0 6px 20px rgba(0,0,0,0.6);
          min-width: 180px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-family: var(--font-mono), 'IBM Plex Mono', monospace; color: #4A8B6F; font-weight: 700; font-size: 11px;">
              HOP #${hop.hop}
            </span>
            <span style="font-family: var(--font-mono), 'IBM Plex Mono', monospace; color: ${
              isLowConf ? '#D97706' : '#4A8B6F'
            }; font-weight: 600; font-size: 10px;">
              ${hop.confidence}% Match
            </span>
          </div>
          <p style="font-family: var(--font-sans), 'IBM Plex Sans', sans-serif; font-weight: 700; font-size: 12px; margin: 2px 0 6px 0; color: #FFFFFF;">
            ${hop.camera_name}
          </p>
          <div style="font-family: var(--font-mono), 'IBM Plex Mono', monospace; font-size: 10px; opacity: 0.85; line-height: 1.5;">
            <p style="margin: 1px 0;">Time: <strong>${new Date(hop.timestamp).toLocaleTimeString('en-IN')} IST</strong></p>
            <p style="margin: 1px 0;">Plate: <strong>${hop.plate_detected || 'Unknown'}</strong></p>
            <p style="margin: 1px 0;">Dist: <strong>${hop.distance_from_crime_km} km away</strong></p>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        opacity: 1,
        direction: 'top',
        offset: [0, -14],
        className: 'custom-leaflet-tooltip-clean',
      });

      marker.on('click', () => {
        if (onHopSelect) onHopSelect(hop.hop);
      });

      marker.addTo(layerGroup);
    });

    // INITIAL LOAD AUTO-FIT BOUNDS
    const positions = visibleHops.map((h) => [h.lat, h.lng]);
    if (positions.length > 1) {
      mapRef.current.fitBounds(positions, { padding: [60, 60], maxZoom: 15 });
    } else if (positions.length === 1) {
      mapRef.current.setView(positions[0], 14);
    }
  }, [trailData, visibleHopsCount, projectedPath, mapReady, prefersReducedMotion, onHopSelect]);

  // GHOST VEHICLE MARKER ON MAP
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;

    if (ghostMarkerRef.current) {
      layerGroup.removeLayer(ghostMarkerRef.current);
      ghostMarkerRef.current = null;
    }

    if (ghostPosition && ghostPosition.lat && ghostPosition.lng) {
      const ghostIconHtml = createGhostMarkerHtml();
      const ghostIcon = L.divIcon({
        html: ghostIconHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const gMarker = L.marker([ghostPosition.lat, ghostPosition.lng], {
        icon: ghostIcon,
        zIndexOffset: 2000,
      });

      gMarker.bindTooltip(
        `
        <div style="font-family: var(--font-mono), 'IBM Plex Mono', monospace; font-size: 11px; padding: 4px 8px; color: #EFEAE4; background: #1E2733; border: 1px solid #4A8B6F; border-radius: 6px;">
          <strong>VEHICLE REPLAY GHOST</strong><br/>
          Time: ${ghostPosition.currentTimeStr || ''} IST
        </div>
      `,
        { opacity: 1, direction: 'top', offset: [0, -10] }
      );

      gMarker.addTo(layerGroup);
      ghostMarkerRef.current = gMarker;
    }
  }, [ghostPosition]);

  // TIMELINE CLICK SMOOTH FLYTO PAN/ZOOM TO MARKER
  useEffect(() => {
    if (!mapRef.current || !highlightedHop || !trailData) return;
    const hop = trailData.find((h) => h.hop === highlightedHop);
    if (hop) {
      mapRef.current.flyTo([hop.lat, hop.lng], 16, { duration: 1.2 });
    }
  }, [highlightedHop, trailData]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-steel-600/50 shadow-sm bg-steel-700/30">
      {/* CSS Keyframes for Feature animations */}
      <style jsx global>{`
        @keyframes markerPulseRing {
          0% { transform: scale(0.95); opacity: 0.75; }
          100% { transform: scale(2.3); opacity: 0; }
        }
        @keyframes ghostBeacon {
          0% { transform: scale(0.8); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes nvFlicker {
          0% { opacity: 0.1; }
          25% { opacity: 0.45; }
          50% { opacity: 0.2; }
          75% { opacity: 0.4; }
          100% { opacity: 0.3; }
        }
      `}</style>

      {/* Leaflet Map DOM Element */}
      <div ref={containerRef} className="w-full h-full rounded-xl z-0" />

      {/* BUTTON 2 VISUAL EFFECT: TACTICAL LAT/LNG GRATICULE OVERLAY */}
      {tacticalGrid && (
        <div
          className="absolute inset-0 pointer-events-none z-[440] transition-opacity duration-300"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(72, 89, 109, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(72, 89, 109, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        >
          <div className="absolute top-2 left-2 text-[9px] font-mono text-paper-100/40 bg-steel-700/80 px-1.5 py-0.5 rounded border border-steel-600/40">
            TACTICAL GRID ACTIVE (12.97°N, 77.59°E)
          </div>
        </div>
      )}

      {/* BUTTON 1 VISUAL EFFECT: NIGHT-VISION TINT & SCANLINES OVERLAY */}
      {nightVision && (
        <div
          className={`absolute inset-0 pointer-events-none z-[450] transition-opacity ${
            flicker ? 'animate-[nvFlicker_0.25s_ease-in-out]' : ''
          }`}
          style={{
            backgroundColor: 'rgba(74, 139, 111, 0.28)', // phosphor-500 tint
            mixBlendMode: 'screen',
          }}
        />
      )}

      {nightVision && (
        <div
          className="absolute inset-0 pointer-events-none z-[451]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.35) 0px, rgba(0, 0, 0, 0.35) 1px, transparent 1px, transparent 2px)',
            opacity: 0.35,
          }}
        />
      )}

      {/* MAP CONTROLS BAR: BUTTON 1 (NV), BUTTON 2 (GRID), BUTTON 4 (FIT-ALL) */}
      <div className="absolute top-3 right-3 z-[500] flex items-center gap-2">
        {/* BUTTON 1: NIGHT-VISION TOGGLE BUTTON */}
        <button
          type="button"
          onClick={toggleNightVision}
          title={nightVision ? 'Disable Night-Vision Grid' : 'Enable Night-Vision Grid'}
          className={`p-2 rounded-md border shadow-lg transition-all focus:outline-none flex items-center gap-1.5 font-mono text-xs cursor-pointer ${
            nightVision
              ? 'bg-steel-700 border-phosphor-500 text-phosphor-500 ring-1 ring-phosphor-500/50'
              : 'bg-steel-700 hover:bg-steel-600 border-steel-600 text-paper-100'
          }`}
        >
          {nightVision ? <EyeOff className="w-4 h-4 text-phosphor-500" /> : <Eye className="w-4 h-4 text-paper-100/70" />}
          <span className="hidden sm:inline">{nightVision ? 'NV ON' : 'NV GRID'}</span>
        </button>

        {/* BUTTON 2: TACTICAL LAT/LNG GRID OVERLAY BUTTON */}
        <button
          type="button"
          onClick={toggleTacticalGrid}
          title={tacticalGrid ? 'Disable Tactical Coordinate Grid' : 'Enable Tactical Coordinate Grid'}
          className={`p-2 rounded-md border shadow-lg transition-all focus:outline-none flex items-center gap-1.5 font-mono text-xs cursor-pointer ${
            tacticalGrid
              ? 'bg-steel-700 border-phosphor-500 text-phosphor-500 ring-1 ring-phosphor-500/50'
              : 'bg-steel-700 hover:bg-steel-600 border-steel-600 text-paper-100'
          }`}
        >
          <Grid className={`w-4 h-4 ${tacticalGrid ? 'text-phosphor-500' : 'text-paper-100/70'}`} />
          <span className="hidden sm:inline">{tacticalGrid ? 'GRID ON' : 'GRID'}</span>
        </button>

        {/* BUTTON 4: FIT ALL HOPS BUTTON */}
        <button
          type="button"
          onClick={handleFitAllHops}
          title="Reset & Fit All Hops Bounds"
          className="bg-steel-700 hover:bg-steel-600 text-paper-100 p-2 rounded-md border border-steel-600 shadow-lg transition-all focus:outline-none focus:border-phosphor-500 active:scale-95 group cursor-pointer"
        >
          <Maximize2 className="w-4 h-4 text-phosphor-500 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* LEGEND CONTAINER BOX */}
      <div className="absolute bottom-4 left-4 z-[500] bg-steel-700 border border-steel-600 rounded-lg p-3 shadow-xl font-mono text-[11px] leading-tight space-y-2 pointer-events-auto max-w-[240px] opacity-100">
        <div className="text-[10px] font-bold uppercase tracking-wider text-paper-100/60 border-b border-steel-600/40 pb-1 mb-1 font-sans">
          TACTICAL MAP LEGEND
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#4A8B6F' }} />
          <span className="text-paper-100 font-medium">Hop 1 (Origin - #4A8B6F)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#4A8B6F' }} />
          <span className="text-paper-100 font-medium">ANPR / CCTV Hop (#4A8B6F)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#B91C1C' }} />
          <span className="text-paper-100 font-medium">Last Confirmed (#B91C1C)</span>
        </div>
        <div className="flex items-center gap-2 border-t border-steel-600/40 pt-1.5 mt-1">
          <span className="w-4 h-0.5 shrink-0" style={{ borderTop: '2px dashed #48596D' }} />
          <span className="text-paper-100/70 text-[10px]">Low Conf. (&lt;90% match)</span>
        </div>
        {projectedPath && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 shrink-0" style={{ borderTop: '2px dashed #D97706' }} />
            <span className="text-warn-500 font-semibold text-[10px]">Projected Vector (#D97706)</span>
          </div>
        )}
      </div>
    </div>
  );
}
