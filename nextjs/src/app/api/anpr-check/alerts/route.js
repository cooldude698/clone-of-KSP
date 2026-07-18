import { NextResponse } from 'next/server';

export async function GET() {
  const alerts = [
    {
      id: 'alert-001',
      severity: 'critical',
      plate_number: 'KA-01-MJ-8821',
      camera_name: 'Silk Board Inbound Junction',
      fir_case_number: 'KAR/BLR/2026/04921',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'alert-002',
      severity: 'high',
      plate_number: 'KA-05-NB-1102',
      camera_name: 'MG Road Metro Signal Approach',
      fir_case_number: 'KAR/BLR/2026/01184',
      timestamp: new Date(Date.now() - 1200000).toLocaleTimeString(),
    }
  ];

  return NextResponse.json({ alerts }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
