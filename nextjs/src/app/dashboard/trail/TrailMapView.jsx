'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon URLs for safety across environments
if (typeof window !== 'undefined' && L.Icon && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Custom Leaflet Numbered Marker with theme-aligned colors & confidence weighting
function createNumberedMarkerHtml(number, type, isLowConfidence, isHighlighted) {
  let bgColor = '#1E2733'; // deep navy / steel default
  let borderColor = '#7A90A8'; // coastal slate
  let textColor = '#EFEAE4'; // paper-100

  if (type === 'first') {
    bgColor = '#16A34A'; // success-500 green
    borderColor = '#15803D';
  } else if (type === 'last') {
    bgColor = '#DC2626'; // critical-500 red
    borderColor = '#991B1B';
  } else if (type === 'projected') {
    bgColor = '#7A90A8';
    borderColor = '#48596D';
    textColor = '#FFFFFF';
  } else {
    bgColor = '#1E2733';
    borderColor = '#7A90A8';
  }

  const opacity = isLowConfidence ? '0.65' : '1.0';
  const pulseStyle = isHighlighted
    ? 'box-shadow: 0 0 0 6px rgba(122, 144, 168, 0.4), 0 0 15px rgba(122, 144, 168, 0.8); border-color: #7A90A8;'
    : 'box-shadow: 0 2px 8px rgba(0,0,0,0.4);';

  return `
    <div style="
      background-color: ${bgColor};
      color: ${textColor};
      border: 2px solid ${borderColor};
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 12px;
      opacity: ${opacity};
      transition: all 0.3s ease;
      ${pulseStyle}
    ">
      ${type === 'projected' ? '?' : number}
    </div>
  `;
}

export default function TrailMapView({
  trailData = [],
  visibleHopsCount = 1,
  highlightedHop = null,
  projectedPath = null,
  onHopSelect = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

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

    // Dark/Coastal themed Carto basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

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

  // Update map polylines & markers whenever visibleHopsCount, trailData, or highlightedHop changes
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (!trailData || trailData.length === 0) return;

    // Filter visible hops based on hop-by-hop animation step
    const visibleHops = trailData.slice(0, visibleHopsCount);
    if (visibleHops.length === 0) return;

    // 1. Draw connecting polylines segment by segment with confidence-weighted styling
    for (let i = 0; i < visibleHops.length - 1; i++) {
      const p1 = [visibleHops[i].lat, visibleHops[i].lng];
      const p2 = [visibleHops[i + 1].lat, visibleHops[i + 1].lng];
      const nextHop = visibleHops[i + 1];
      const isLowConf = (nextHop.confidence ?? 100) < 90;

      const segmentPolyline = L.polyline([p1, p2], {
        color: '#7A90A8', // coastal slate accent token
        weight: 3.5,
        dashArray: isLowConf ? '6, 6' : '',
        opacity: isLowConf ? 0.6 : 0.9,
      });

      segmentPolyline.addTo(layerGroup);
    }

    // 2. Render Projected Path segment if all hops are visible
    if (projectedPath && visibleHopsCount >= trailData.length) {
      const projPolyline = L.polyline(
        [
          [projectedPath.fromLat, projectedPath.fromLng],
          [projectedPath.lat, projectedPath.lng],
        ],
        {
          color: '#A68A69', // earthy gold warn accent token
          weight: 2.5,
          dashArray: '3, 6',
          opacity: 0.75,
        }
      );
      projPolyline.addTo(layerGroup);

      // Add Projected Marker
      const projHtml = createNumberedMarkerHtml('?', 'projected', false, false);
      const projIcon = L.divIcon({
        html: projHtml,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const projMarker = L.marker([projectedPath.lat, projectedPath.lng], {
        icon: projIcon,
      });

      projMarker.bindPopup(`
        <div style="padding: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #1E2733;">
          <p style="font-weight: 700; font-size: 12px; margin-bottom: 4px; color: #A68A69;">
            PROJECTED HEADING (UNCONFIRMED)
          </p>
          <p style="margin: 2px 0;">Estimated Arrival: <strong>~${projectedPath.projectedTime} IST</strong></p>
          <p style="margin: 2px 0; color: #48596D;">Extrapolated from last 2 confirmed sighting vectors.</p>
        </div>
      `);
      projMarker.addTo(layerGroup);
    }

    // 3. Render Hop Markers
    visibleHops.forEach((hop, index) => {
      let type = 'middle';
      if (index === 0) type = 'first';
      else if (index === trailData.length - 1) type = 'last';

      const isLowConf = (hop.confidence ?? 100) < 90;
      const isHighlighted = highlightedHop === hop.hop;

      const markerHtml = createNumberedMarkerHtml(hop.hop, type, isLowConf, isHighlighted);
      const icon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      });

      const marker = L.marker([hop.lat, hop.lng], {
        icon,
        zIndexOffset: isHighlighted ? 1000 : index * 10,
      });

      const popupContent = `
        <div style="padding: 6px; font-family: sans-serif; color: #1E2733; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-[700]; font-size: 11px; background: #E2D8CC; padding: 2px 6px; border-radius: 4px;">
              HOP ${hop.hop}
            </span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #48596D;">
              ${hop.confidence}% Match
            </span>
          </div>
          <p style="font-weight: 700; font-size: 13px; margin: 4px 0 6px 0; color: #1E2733;">
            ${hop.camera_name}
          </p>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #48596D; line-height: 1.5;">
            <p style="margin: 2px 0;"><strong>Time:</strong> ${new Date(hop.timestamp).toLocaleTimeString('en-IN')}</p>
            <p style="margin: 2px 0;"><strong>Plate:</strong> ${hop.plate_detected || 'Unknown'}</p>
            <p style="margin: 2px 0;"><strong>Distance:</strong> ${hop.distance_from_crime_km} km away</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onHopSelect) onHopSelect(hop.hop);
      });

      marker.addTo(layerGroup);

      if (isHighlighted) {
        marker.openPopup();
      }
    });

    // Auto fit bounds to visible hops
    const positions = visibleHops.map((h) => [h.lat, h.lng]);
    if (positions.length > 1) {
      mapRef.current.fitBounds(positions, { padding: [50, 50], maxZoom: 15 });
    } else if (positions.length === 1) {
      mapRef.current.setView(positions[0], 14);
    }
  }, [trailData, visibleHopsCount, highlightedHop, projectedPath, onHopSelect]);

  // Pan smoothly when user clicks a timeline entry
  useEffect(() => {
    if (!mapRef.current || !highlightedHop || !trailData) return;
    const hop = trailData.find((h) => h.hop === highlightedHop);
    if (hop) {
      mapRef.current.setView([hop.lat, hop.lng], 15, { animate: true });
    }
  }, [highlightedHop, trailData]);

  return <div ref={containerRef} className="w-full h-full rounded-xl z-0" />;
}
