export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  try {
    const data = {
      jurisdiction: 'Bengaluru Central & East Division',
      hotspots: [
        { id: 'HS-01', area: 'Silk Board Junction', lat: 12.9175, lng: 77.6215, crime_count: 48, severity: 'critical', primary_crime: 'Vehicle Theft', peak_hours: '22:00 - 04:00', station: 'Ashoknagar PS' },
        { id: 'HS-02', area: 'MG Road & Brigade Road Corridor', lat: 12.9762, lng: 77.6033, crime_count: 32, severity: 'high', primary_crime: 'Chain Snatching & Robbery', peak_hours: '20:00 - 01:00', station: 'Cubbon Park PS' },
        { id: 'HS-03', area: 'Indiranagar 100ft Road & 12th Main', lat: 12.9719, lng: 77.6412, crime_count: 38, severity: 'high', primary_crime: 'Mobile Theft & Night Extortion', peak_hours: '23:00 - 03:00', station: 'Indiranagar PS' },
        { id: 'HS-04', area: 'Ulsoor Lake South Perimeter', lat: 12.9822, lng: 77.6200, crime_count: 18, severity: 'medium', primary_crime: 'Burglary & Trespass', peak_hours: '01:00 - 05:00', station: 'Ulsoor PS' },
        { id: 'HS-05', area: 'Domlur Flyover Underpass', lat: 12.9610, lng: 77.6387, crime_count: 24, severity: 'high', primary_crime: 'Armed Robbery', peak_hours: '21:30 - 02:30', station: 'Indiranagar PS' },
      ],
      dark_zones: [
        { area: 'Old Airport Road Outpost Fringe', station: 'Ulsoor PS', reporting_deficit: '58%', risk: 'Critical Beat Deficit', reason: 'Insufficient street lighting and low beat constable frequency between 00:00-04:00' },
        { area: 'Viveknagar Border Transit Lane', station: 'Ashoknagar PS', reporting_deficit: '42%', risk: 'Moderate Gap', reason: 'Cross-station jurisdictional ambiguity leading to delayed e-FIR logging' },
        { area: 'Kasturba Road Back Corridor', station: 'Cubbon Park PS', reporting_deficit: '36%', risk: 'Moderate Gap', reason: 'Park perimeter blind spots lacking ANPR coverage' },
      ],
      patrol_recommendations: [
        { unit: 'Hoysala 04 (Ashoknagar)', current_sector: 'Hosur Road', recommended_sector: 'Silk Board TTMC Underpass', time_window: '22:00 - 03:00', reason: 'High vehicle theft surge predicted based on 30-day clustering' },
        { unit: 'Hoysala 09 (Indiranagar)', current_sector: 'Defence Colony', recommended_sector: 'Domlur Flyover & 100ft Road', time_window: '23:30 - 04:00', reason: 'Intercept route for night mobile snatchers heading toward Ring Road' },
        { unit: 'Hoysala 02 (Ulsoor)', current_sector: 'Kensington Road', recommended_sector: 'Old Airport Road Dark Zone', time_window: '00:00 - 05:00', reason: 'Close 58% reporting gap with high-visibility siren presence' },
      ]
    };

    return NextResponse.json(data, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
