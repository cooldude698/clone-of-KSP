'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PatrolUnit } from '@/context/SupervisorTelemetryContext';

interface SupervisorFleetMapViewProps {
  patrolUnits: PatrolUnit[];
  selectedUnit: PatrolUnit | null;
  onSelectUnit: (unit: PatrolUnit) => void;
}

export default function SupervisorFleetMapView({
  patrolUnits,
  selectedUnit,
  onSelectUnit,
}: SupervisorFleetMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const isFirstMount = useRef(true);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return;

    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      center: [14.8, 76.5],
      zoom: 7,
      scrollWheelZoom: true,
    });

    // 100% Free OpenStreetMap Clean Tiles with NO API Key watermark
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | KSP DRISHTI',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current && (containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update dynamic moving markers & breadcrumbs every 2 seconds
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    patrolUnits.forEach((unit) => {
      const isSelected = selectedUnit?.id === unit.id;

      let color = '#1d6fbf'; // default blue
      let iconChar = '🚓';

      if (unit.type === 'Cheetah Bike') {
        color = '#0284c7';
        iconChar = '🏍️';
      } else if (unit.type === 'Highway Interceptor') {
        color = '#ea580c';
        iconChar = '🚔';
      } else if (unit.type === 'Drone Unit') {
        color = '#7c3aed';
        iconChar = '🚁';
      }

      if (unit.status === 'DISPATCHED') {
        color = '#dc2626';
      }

      // 1. Moving Breadcrumb Trail Line (Past path in 2s increments)
      if (unit.breadcrumb && unit.breadcrumb.length > 1) {
        const polyline = L.polyline(unit.breadcrumb, {
          color: color,
          weight: isSelected ? 3 : 2,
          opacity: isSelected ? 0.7 : 0.4,
          dashArray: '3, 6',
        });
        polyline.addTo(layerGroupRef.current!);
      }

      // 2. Coverage Radius Halo
      const circle = L.circle([unit.lat, unit.lng], {
        radius: unit.type === 'Highway Interceptor' ? 6000 : 3000,
        color: unit.status === 'DISPATCHED' ? '#dc2626' : color,
        fillColor: unit.status === 'DISPATCHED' ? '#dc2626' : color,
        fillOpacity: isSelected ? 0.22 : 0.07,
        weight: isSelected ? 2 : 1,
        dashArray: unit.status === 'DISPATCHED' ? '4, 4' : undefined,
      });
      circle.addTo(layerGroupRef.current!);

      // 3. Dynamic Moving Vehicle Icon with Heading Vector
      const customIcon = L.divIcon({
        className: 'custom-fleet-marker',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '40px' : '32px'};
            height: ${isSelected ? '40px' : '32px'};
            border-radius: 50%;
            background: ${color};
            border: ${isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.95)'};
            box-shadow: 0 0 ${isSelected ? '18px' : '8px'} ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '17px' : '13px'};
            cursor: pointer;
            transition: all 0.25s ease-out;
          ">
            ${iconChar}
            <!-- 2s Live Moving Pulse Ring -->
            <div style="
              position: absolute;
              inset: -4px;
              border-radius: 50%;
              border: 1.5px solid ${color};
              opacity: 0.7;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
          </div>
        `,
        iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
        iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
      });

      const marker = L.marker([unit.lat, unit.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; min-width: 200px; color: #0f172a; padding: 2px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
            <span>${unit.callsign}</span>
            <span style="font-size: 9px; padding: 1px 6px; border-radius: 4px; background: #e0f2fe; color: #0369a1;">${unit.type}</span>
          </div>
          <p style="margin: 2px 0; font-weight: 600; color: #334155;">${unit.officer}</p>
          <p style="margin: 2px 0; font-size: 10px; color: #64748b;">${unit.precinct}, ${unit.district}</p>
          <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 10px; color: #475569;">
            <span>Speed: <strong>${unit.speedKmH} km/h</strong></span>
            <span>Distance: <strong>${unit.distanceKm} km</strong></span>
          </div>
          <div style="margin-top: 3px; font-size: 9px; color: #059669; font-weight: bold;">
            ● Active Moving Telemetry (2s interval)
          </div>
          ${unit.assignedIncident ? `<div style="margin-top: 4px; font-size: 10px; color: #dc2626; font-weight: bold;">Mission: ${unit.assignedIncident}</div>` : ''}
        </div>
      `);

      marker.on('click', () => {
        onSelectUnit(unit);
      });

      marker.addTo(layerGroupRef.current!);
    });
  }, [patrolUnits, selectedUnit, onSelectUnit]);

  // Center map on selectedUnit change only on manual selection or first mount
  useEffect(() => {
    if (mapRef.current && selectedUnit && isFirstMount.current) {
      mapRef.current.flyTo([selectedUnit.lat, selectedUnit.lng], 12, {
        duration: 1.0,
      });
      isFirstMount.current = false;
    }
  }, [selectedUnit]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[520px] rounded-2xl overflow-hidden border border-[#1e293b] shadow-sm relative z-0"
    />
  );
}
