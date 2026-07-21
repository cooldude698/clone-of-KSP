'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon URLs for safety
if (typeof window !== 'undefined' && L.Icon && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const createNumberedIcon = (number, type) => {
  let bgColor, borderColor;
  if (type === 'first') {
    bgColor = '#22c55e'; // green
    borderColor = '#166534';
  } else if (type === 'last') {
    bgColor = '#ef4444'; // red
    borderColor = '#991b1b';
  } else {
    bgColor = '#3b82f6'; // blue
    borderColor = '#1e3a8a';
  }

  const html = `
    <div style="
      background-color: ${bgColor};
      color: white;
      border: 2px solid ${borderColor};
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    ">
      ${number}
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

export default function TrailMapView({ trailData = [], highlightedHop = null }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize map instance once
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any stale Leaflet instance ID on DOM element
    if (containerRef.current._leaflet_id) {
      delete containerRef.current._leaflet_id;
    }

    const defaultCenter = trailData && trailData.length > 0
      ? [trailData[0].lat, trailData[0].lng]
      : [12.9716, 77.5946];

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 13,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
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

  // Update polyline, markers & view whenever trailData changes
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (!trailData || trailData.length === 0) return;

    const positions = trailData.map(h => [h.lat, h.lng]);

    // Draw dashed connecting polyline
    const polyline = L.polyline(positions, {
      color: '#3b82f6',
      weight: 3,
      dashArray: '8, 8',
      opacity: 0.75,
    });
    polyline.addTo(layerGroup);

    // Add markers
    trailData.forEach((hop, index) => {
      let type = 'middle';
      if (index === 0) type = 'first';
      else if (index === trailData.length - 1) type = 'last';

      const icon = createNumberedIcon(hop.hop, type);
      const isHighlighted = highlightedHop === hop.hop;

      const marker = L.marker([hop.lat, hop.lng], {
        icon,
        zIndexOffset: isHighlighted ? 1000 : 0,
      });

      const popupContent = `
        <div style="padding: 4px; font-family: sans-serif; color: #1e293b;">
          <p style="font-weight: bold; font-size: 13px; margin: 0 0 4px 0;">${hop.camera_name}</p>
          <div style="font-size: 11px; line-height: 1.4; color: #475569;">
            <p style="margin: 2px 0;"><strong>Time:</strong> ${new Date(hop.timestamp).toLocaleTimeString('en-IN')}</p>
            <p style="margin: 2px 0;"><strong>Plate:</strong> ${hop.plate_detected || 'Unknown'}</p>
            <p style="margin: 2px 0;"><strong>Confidence:</strong> ${hop.confidence}%</p>
            <p style="margin: 2px 0;"><strong>Distance:</strong> ${hop.distance_from_crime_km} km</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(layerGroup);

      if (isHighlighted) {
        marker.openPopup();
      }
    });

    // Fit bounds to fit all markers nicely
    if (positions.length > 1) {
      mapRef.current.fitBounds(positions, { padding: [40, 40], maxZoom: 15 });
    } else if (positions.length === 1) {
      mapRef.current.setView(positions[0], 14);
    }
  }, [trailData]);

  // Pan to highlighted hop when clicked in timeline
  useEffect(() => {
    if (!mapRef.current || !highlightedHop || !trailData) return;
    const hop = trailData.find(h => h.hop === highlightedHop);
    if (hop) {
      mapRef.current.setView([hop.lat, hop.lng], 16, { animate: true });
    }
  }, [highlightedHop, trailData]);

  if (!trailData || trailData.length === 0) {
    return (
      <div className="w-full h-full bg-steel-700/50 flex items-center justify-center text-paper-100/50">
        No trail data
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full rounded-2xl z-0" />;
}
