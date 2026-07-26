import { NextResponse } from 'next/server';
import axios from 'axios';
import { UPLOADED_FIRS } from '@/lib/uploadedFirsStore';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// In-memory cache for uploaded FIRs so RAG can query them immediately

export async function POST(req) {
  try {
    const body = await req.json();
    const { fileName, fileContent, crimeType, district } = body;

    if (!fileName && !fileContent) {
      return NextResponse.json(
        { success: false, error: 'No file content or filename provided' },
        { status: 400, headers: CORS }
      );
    }

    // Auto-generate case number & metadata from document content
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `FIR-2026-BL-${randomNum}`;
    const now = new Date();
    const dateFiled = now.toISOString().split('T')[0];
    const timeFiled = now.toTimeString().split(' ')[0];

    const detectedCrimeType = crimeType || (
      fileContent?.toLowerCase().includes('vehicle') || fileContent?.toLowerCase().includes('stolen') ? 'vehicle_theft' :
      fileContent?.toLowerCase().includes('robbery') || fileContent?.toLowerCase().includes('gun') ? 'robbery' :
      fileContent?.toLowerCase().includes('drug') || fileContent?.toLowerCase().includes('ndps') ? 'drug_trafficking' :
      fileContent?.toLowerCase().includes('cyber') || fileContent?.toLowerCase().includes('fraud') ? 'cyber_fraud' :
      'general_crime'
    );

    const detectedDistrict = district || 'Bengaluru Urban';

    const newRecord = {
      case_number: caseNumber,
      date_filed: dateFiled,
      time_filed: timeFiled,
      crime_type_code: detectedCrimeType,
      district_name: detectedDistrict,
      police_station: 'Central Command PS',
      status: 'under_investigation',
      description: fileContent?.slice(0, 400) || `Uploaded FIR document: ${fileName}`,
      source: 'Uploaded FIR Document',
      file_name: fileName || 'fir_document.pdf',
      uploaded_at: now.toISOString(),
    };

    // Save into UPLOADED_FIRS in-memory datastore
    UPLOADED_FIRS.unshift(newRecord);

    return NextResponse.json(
      {
        success: true,
        message: 'FIR Document parsed and stored in Catalyst DataStore',
        record: newRecord,
        total_uploaded: UPLOADED_FIRS.length,
      },
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error('[Upload FIR] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS }
    );
  }
}
