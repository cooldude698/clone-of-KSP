'use client';

import dynamic from 'next/dynamic';

function MapLoadingPlaceholder() {
  return <div style={{ height: '260px', background: '#0f2035', borderRadius: '12px' }} />;
}

// ── Leaflet-dependent cards (must be ssr:false) ─────────────────────
export const HeatmapCardDynamic = dynamic(
  () => import('./HeatmapCard'),
  { ssr: false, loading: MapLoadingPlaceholder }
);

export const MapPinsCardDynamic = dynamic(
  () => import('./MapPinsCard'),
  { ssr: false, loading: MapLoadingPlaceholder }
);

export const GeoTrailCardDynamic = dynamic(
  () => import('./GeoTrailCard'),
  { ssr: false, loading: MapLoadingPlaceholder }
);
