'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface AnalystZone {
  id: string;
  lat: number;
  lng: number;
  area: string;
  district: string;
  timeSlot: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'PREDICTIVE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  crimeCount: number;
  riskScore: number;
  topCategories: string[];
  primarySuspect: string;
  patrolRecommendation: string;
  predictedShift: string;
}

const SEVERITY_COLORS = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#F59E0B',
};

export default function AnalystHeatmapView({
  zones,
  selectedZone,
  onSelectZone,
}: {
  zones: AnalystZone[];
  selectedZone: AnalystZone | null;
  onSelectZone: (z: AnalystZone) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | KSP DRISHTI',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    zones.forEach((zone) => {
      const color = SEVERITY_COLORS[zone.severity] || '#3B82F6';
      const radius = zone.severity === 'CRITICAL' ? 24 : zone.severity === 'HIGH' ? 18 : 14;

      // Outer Heat Halo
      const halo = L.circleMarker([zone.lat, zone.lng], {
        radius: radius * 1.8,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.2,
      });

      // Core Hotspot Marker
      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius,
        fillColor: color,
        color: '#FFFFFF',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.85,
      });

      marker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 4px;">
          <strong style="color: #0F172A;">${zone.area}</strong> (${zone.district})<br/>
          <span style="color: ${color}; font-weight: bold;">${zone.severity} RISK · Score ${zone.riskScore}</span><br/>
          <span>${zone.crimeCount} Incidents · ${zone.topCategories.join(', ')}</span><br/>
          <small style="color: #475569;">Key Suspect: ${zone.primarySuspect}</small>
        </div>`,
        { direction: 'top', className: 'custom-leaflet-tooltip' }
      );

      marker.on('click', () => {
        onSelectZone(zone);
        mapRef.current?.flyTo([zone.lat, zone.lng], 14, { duration: 1 });
      });

      halo.addTo(layerGroupRef.current!);
      marker.addTo(layerGroupRef.current!);
    });
  }, [zones, onSelectZone]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[580px] rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm relative z-10"
    />
  );
}
