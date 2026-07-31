import { NextResponse } from 'next/server';
import { DEMO_HOTSPOTS } from '@/lib/demo-data';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const district = searchParams.get('district');
  const crime_type = searchParams.get('crime_type');

  let hotspots = DEMO_HOTSPOTS.hotspots || [];

  if (district && district !== 'all') {
    hotspots = hotspots.filter((h) => h.district.toLowerCase() === district.toLowerCase());
  }

  if (crime_type && crime_type !== 'all') {
    const queryCrime = crime_type.toLowerCase().replace(/_/g, ' ');
    hotspots = hotspots.filter((h) => {
      const matchTop = h.top_crime_types && h.top_crime_types.some((c) => c.toLowerCase() === crime_type.toLowerCase());
      const matchPrimary = h.primary_crime && h.primary_crime.toLowerCase().includes(queryCrime);
      return matchTop || matchPrimary;
    });
  }

  return NextResponse.json(
    { hotspots, total_count: hotspots.length },
    { status: 200, headers: CORS }
  );
}

export async function POST(req) {
  return GET(req);
}
