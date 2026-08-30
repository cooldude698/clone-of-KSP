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
      nodes: [
        // Accused Nodes
        { id: 'accused_Ramesh_Kumar', label: 'Ramesh Kumar ("Bullet Ramesh")', type: 'kingpin', total_firs: 7, risk_score: 94, primary_crime: 'Vehicle Theft Syndicate', stations: ['Ashoknagar PS', 'Cubbon Park PS'] },
        { id: 'accused_Imran_Khan', label: 'Imran Khan ("Helmet Imran")', type: 'kingpin', total_firs: 4, risk_score: 96, primary_crime: 'Commercial Narcotics', stations: ['Indiranagar PS', 'Ulsoor PS'] },
        { id: 'accused_Suresh_Naidu', label: 'Suresh Naidu ("Snake Naidu")', type: 'accused', total_firs: 5, risk_score: 91, primary_crime: 'Armed Robbery', stations: ['Cubbon Park PS', 'Ashoknagar PS'] },
        { id: 'accused_Anand_Gowda', label: 'Anand Gowda ("Speedy Anand")', type: 'accused', total_firs: 4, risk_score: 72, primary_crime: 'Chain Snatching', stations: ['Indiranagar PS', 'Ashoknagar PS'] },
        { id: 'accused_Vikram_Malhotra', label: 'Vikram Malhotra ("Shadow Vicky")', type: 'accused', total_firs: 2, risk_score: 88, primary_crime: 'Cyber Extortion', stations: ['Cubbon Park PS', 'Ulsoor PS'] },

        // Receivers / Fences / Hubs
        { id: 'fence_Bidar_Scrapyard', label: 'Bidar Auto Dismantlers', type: 'fence', risk_score: 82, location: 'Bidar Industrial Belt', connects_to: ['Ashoknagar PS', 'Cubbon Park PS'] },
        { id: 'hub_Silk_Board_Bay', label: 'Silk Board Transit Parking', type: 'hotspot_hub', risk_score: 89, location: 'Hosur Road Corridor', connects_to: ['Ashoknagar PS'] },
        { id: 'mule_Tumakuru_Accounts', label: 'Tumakuru Mule Bank Grid', type: 'financial_mule', risk_score: 78, location: 'Tumakuru Rural', connects_to: ['Cubbon Park PS', 'Ulsoor PS'] },

        // Station Nodes
        { id: 'stn_Ashoknagar', label: 'Ashoknagar PS', type: 'station', officer: 'Insp. V. Sharma' },
        { id: 'stn_Cubbon_Park', label: 'Cubbon Park PS', type: 'station', officer: 'Insp. Rajesh Rao' },
        { id: 'stn_Ulsoor', label: 'Ulsoor PS', type: 'station', officer: 'Insp. Priya Patel' },
        { id: 'stn_Indiranagar', label: 'Indiranagar PS', type: 'station', officer: 'Insp. Anand Deshmukh' },
      ],
      edges: [
        { source: 'accused_Ramesh_Kumar', target: 'stn_Ashoknagar', relation: 'Active FIR-2024-1840', weight: 4 },
        { source: 'accused_Ramesh_Kumar', target: 'stn_Cubbon_Park', relation: 'Wanted in FIR-2024-0675', weight: 3 },
        { source: 'accused_Ramesh_Kumar', target: 'fence_Bidar_Scrapyard', relation: 'Stolen Chassis Transit', weight: 5 },
        { source: 'accused_Ramesh_Kumar', target: 'hub_Silk_Board_Bay', relation: 'Transit Stash Point', weight: 4 },

        { source: 'accused_Imran_Khan', target: 'stn_Indiranagar', relation: 'Active FIR-2024-1726', weight: 5 },
        { source: 'accused_Imran_Khan', target: 'stn_Ulsoor', relation: 'Supply Link FIR-2024-0122', weight: 3 },
        { source: 'accused_Imran_Khan', target: 'accused_Anand_Gowda', relation: 'Drug-for-Stolen Phone Exchange', weight: 4 },

        { source: 'accused_Suresh_Naidu', target: 'stn_Cubbon_Park', relation: 'Active FIR-2024-2250', weight: 4 },
        { source: 'accused_Suresh_Naidu', target: 'stn_Ashoknagar', relation: 'Highway Robbery Link', weight: 3 },

        { source: 'accused_Vikram_Malhotra', target: 'stn_Cubbon_Park', relation: 'CEN Cyber FIR-2026-9104', weight: 4 },
        { source: 'accused_Vikram_Malhotra', target: 'mule_Tumakuru_Accounts', relation: 'OTP Siphon Routing', weight: 5 },
        { source: 'accused_Vikram_Malhotra', target: 'stn_Ulsoor', relation: 'Victim Account Jurisdiction', weight: 3 },

        { source: 'accused_Anand_Gowda', target: 'stn_Indiranagar', relation: 'Active FIR-2024-0125', weight: 4 },
        { source: 'accused_Anand_Gowda', target: 'stn_Ashoknagar', relation: '100ft Snatching Link', weight: 3 },
      ],
      syndicates: [
        { name: 'Ramesh Auto-Lift & Inter-State Disposal Syndicate', accused_count: 5, active_cases: 7, stations: 'Ashoknagar + Cubbon Park + Bidar' },
        { name: 'East Division Synthetic Narcotics Network', accused_count: 4, active_cases: 6, stations: 'Indiranagar + Ulsoor' },
        { name: 'CEN Digital Imposter & Crypto Mule Syndicate', accused_count: 3, active_cases: 4, stations: 'Cubbon Park + Ulsoor + Tumakuru' },
      ]
    };

    return NextResponse.json(data, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
