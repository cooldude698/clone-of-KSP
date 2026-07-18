'use client';

import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

export default function MapView({
  filtered,
  selectedHotspot,
  setSelectedHotspot,
  SEVERITY_HEX,
  SEVERITY_RADIUS,
  tileUrl
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (containerRef.current && containerRef.current._leaflet_id) {
        delete containerRef.current._leaflet_id;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap" />
        {filtered.map((h, i) => (
          <CircleMarker
            key={`${h.area}-${i}`}
            center={[h.lat, h.lng]}
            radius={SEVERITY_RADIUS[h.severity] || 12}
            fillColor={SEVERITY_HEX[h.severity] || '#f0a848'}
            fillOpacity={0.65}
            color={SEVERITY_HEX[h.severity] || '#f0a848'}
            weight={2}
            eventHandlers={{ click: () => setSelectedHotspot(h) }}
          >
            <Tooltip>
              <div className="text-xs font-sans">
                <strong>{h.area}</strong>
                <p>{h.count} incidents -- {h.severity}</p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
