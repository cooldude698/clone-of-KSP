'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, X, ArrowLeft } from 'lucide-react';
import InvestigatorWall from '@/components/InvestigatorWall';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getFIRFromStore } from '@/lib/fir-store';

export default function FIRDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const caseNumber = Array.isArray(rawId) ? rawId.map(decodeURIComponent).join('/') : decodeURIComponent(rawId || '');

  const storedFir = caseNumber ? getFIRFromStore(caseNumber) : null;
  let demoCase = storedFir || DEMO_FIRS.firs.find(f => f.case_number === caseNumber);

  if (!demoCase && caseNumber) {
    demoCase = {
      case_number: caseNumber,
      date_filed: "2024-06-01",
      crime_type: "Vehicle Theft",
      description: `Official CCTNS FIR complaint entry for ${caseNumber}. Incident recorded at Karnataka State Police jurisdiction area.`,
      status: "open",
      case_status: "open",
      district_name: "Bengaluru Urban",
      police_station: "Central Command PS",
      location_name: "Bengaluru Central",
      accused_name: "Ramesh Kumar",
      risk_score: 88
    };
  }

  const [fir, setFir] = useState(demoCase || DEMO_FIRS.firs[0]);

  useEffect(() => {
    if (!caseNumber) return;
    async function loadData() {
      const res = await fetchWithFallback(`firs?case_number=${encodeURIComponent(caseNumber)}`, DEMO_FIRS);
      const list = res?.data?.firs || (Array.isArray(res?.data) ? res.data : DEMO_FIRS.firs);
      const match = list.find(f => f.case_number === caseNumber);
      if (match) setFir(match);
    }
    loadData();
  }, [caseNumber]);

  const activeFir = fir || DEMO_FIRS.firs[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 select-none">
      
      {/* Top Floating Control Bar */}
      <div className="max-w-[1200px] mx-auto mb-6 flex items-center justify-between bg-white border border-slate-300 rounded-2xl px-6 py-3.5 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-black font-mono tracking-wider text-slate-900 uppercase">
            Official CCTNS Dossier · {activeFir.case_number}
          </span>
        </div>
      </div>

      {/* 3D ROTATING SPINNING NEWSPAPER ANIMATION CONTAINER */}
      <div className="max-w-[1200px] mx-auto animate-newspaper-spin">
        <InvestigatorWall
          fir={{
            case_number: activeFir.case_number || 'KAR/BLR/2026/04921',
            crime_type: activeFir.crime_type || activeFir.crime_type_code || 'Vehicle Theft',
            date_filed: activeFir.date_filed || '2026-07-22',
            location_name: activeFir.location_name || activeFir.district_name || 'Silk Board PS',
            case_status: activeFir.status || activeFir.case_status || 'open',
            description: activeFir.description || 'Target vehicle theft and commercial chopshop transport operation.',
            police_station: activeFir.police_station || 'Bengaluru Urban East PS',
          }}
          accused={[
            {
              full_name: activeFir.accused_name || 'Ramesh Kumar',
              alias: 'The Snake',
              age: 34,
              gender: 'Male',
              district_name: activeFir.district_name || 'Bengaluru Urban',
              occupation: 'Fence / Chopshop Logistics',
              prior_convictions: 6,
              risk_score: activeFir.risk_score || 94,
              modus_operandi: activeFir.description || 'Inter-district night heist using fake ANPR plates.'
            }
          ]}
          victims={[
            {
              full_name: activeFir.complainant_name || 'KSP Commercial Unit',
              age: 42,
              gender: 'Male',
              occupation: 'Citizen / Commercial Unit',
              district_name: activeFir.district_name || 'Bengaluru Urban',
              vulnerability_score: 65,
            }
          ]}
          related_firs={[
            { case_number: 'KAR/BLR/2026/01184', crime_type: 'Armed Robbery', date_filed: '2026-07-20', link_reason: 'Matching MO & Getaway Vehicle' },
            { case_number: 'KAR/MYS/2026/00199', crime_type: 'Physical Assault', date_filed: '2026-07-15', link_reason: 'Co-Accused Communication Log' }
          ]}
          case_summary={activeFir.description || 'Verified CCTNS first information report statement filed at Karnataka State Police command center.'}
        />
      </div>

    </div>
  );
}
