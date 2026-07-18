import { NextResponse } from 'next/server';
import kmlCctvData from '@/data/bengaluru-cctv.json';

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '12.9716');
  const lng = parseFloat(searchParams.get('lng') || '77.5946');
  const radius = parseFloat(searchParams.get('radius_m') || '5000');

  const nearby = kmlCctvData.filter(cam => {
    const dist = haversineM(lat, lng, cam.lat, cam.lng);
    return dist <= radius;
  });

  return NextResponse.json({
    status: 'success',
    total: nearby.length,
    cameras: nearby
  });
}

export async function OPTIONS() {
  return NextResponse.json({ status: 'ok' });
}
