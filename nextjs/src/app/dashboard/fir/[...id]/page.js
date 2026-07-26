'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import FIRDetailView from './FIRDetailView';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS, DEMO_TRAIL } from '@/lib/demo-data';
import { getFIRFromStore } from '@/lib/fir-store';

// ── Plate extractor: finds first KA-XX-XX-XXXX pattern ──────────────────────
function extractPlate(text) {
  if (!text) return null;
  const m = text.match(/\bKA[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}\b/i);
  if (!m) return null;
  // Normalise to KA-01-AB-1234 format
  return m[0].replace(/\s/g, '-').toUpperCase();
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-steel-600/40 rounded-lg ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="xl:w-80 space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function NotFound({ caseNumber }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-critical-500/10 border border-critical-500/30 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-critical-500" />
      </div>
      <h2 className="text-xl font-bold text-paper-100 mb-2">Case Not Found</h2>
      <p className="text-paper-100/50 text-sm max-w-sm leading-relaxed mb-6">
        No FIR matching <span className="font-mono text-phosphor-500">{caseNumber}</span> was found in the system.
        The case number may be incorrect or may not be loaded yet.
      </p>
      <Link
        href="/dashboard"
        className="btn-secondary text-sm"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FIRDetailPage() {
  const params     = useParams();
  const rawId      = params?.id;
  const caseNumber = Array.isArray(rawId) ? rawId.map(decodeURIComponent).join('/') : decodeURIComponent(rawId || '');

  const [fir,          setFir]          = useState(null);
  const [suspects,     setSuspects]     = useState([]);
  const [relatedCases, setRelatedCases] = useState([]);
  const [trailData,    setTrailData]    = useState([]);
  const [trailLoading, setTrailLoading] = useState(false);
  const [trailError,   setTrailError]   = useState(null);
  const [detectedPlate,setDetectedPlate]= useState(null);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);

  const fetchTrail = useCallback(async (plate) => {
    if (!plate) return;
    setTrailLoading(true);
    setTrailError(null);
    try {
      const { data } = await fetchWithFallback('trail', DEMO_TRAIL);
      if (data?.trail?.length) {
        setTrailData(data.trail);
      } else {
        setTrailData(DEMO_TRAIL.trail);
      }
    } catch {
      setTrailData(DEMO_TRAIL.trail);
    } finally {
      setTrailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!caseNumber) return;

    async function load() {
      setLoading(true);
      setNotFound(false);

      const storedFir = getFIRFromStore(caseNumber);
      let demoCase = storedFir || DEMO_FIRS.firs.find(f => f.case_number === caseNumber);

      if (!demoCase) {
        const parts = caseNumber.split('/');
        const stationCode = parts[1] || 'BEN';
        const numPart = parseInt(parts[3] || '0', 10);

        let cCode = 'vehicle_theft';
        let cLabel = 'Vehicle Theft';

        if (numPart % 8 === 0 || caseNumber.includes('KAL')) { cCode = 'hit_and_run'; cLabel = 'Hit And Run'; }
        else if (numPart % 8 === 1 || caseNumber.includes('RAI')) { cCode = 'vehicle_theft'; cLabel = 'Vehicle Theft'; }
        else if (numPart % 8 === 2 || caseNumber.includes('UDU')) { cCode = 'senior_citizen_crime'; cLabel = 'Senior Citizen Crime'; }
        else if (numPart % 8 === 3 || caseNumber.includes('CHI')) { cCode = 'burglary'; cLabel = 'Burglary'; }
        else if (numPart % 8 === 4 || caseNumber.includes('TUM')) { cCode = 'drug_offence'; cLabel = 'Drug Offence'; }
        else if (numPart % 8 === 5 || caseNumber.includes('HAS') || caseNumber.includes('VIJ')) { cCode = 'domestic_violence'; cLabel = 'Domestic Violence'; }
        else if (numPart % 8 === 6 || caseNumber.includes('KOP') || caseNumber.includes('BID')) { cCode = 'robbery'; cLabel = 'Robbery'; }
        else { cCode = 'cybercrime'; cLabel = 'Cybercrime'; }

        demoCase = {
          case_number: caseNumber,
          date_filed: "2024-06-01",
          time_filed: "10:15:00",
          crime_type_code: cCode,
          crime_type: cLabel,
          description: `${cLabel} incident reported at ${stationCode} Police Station jurisdiction area under IPC provisions. Active investigation in progress.`,
          status: numPart % 3 === 0 ? "open" : numPart % 3 === 1 ? "under_investigation" : "chargesheeted",
          case_status: numPart % 3 === 0 ? "open" : numPart % 3 === 1 ? "under_investigation" : "chargesheeted",
          district_name: `${stationCode} District`,
          police_station: `${stationCode} Sector PS`,
          location_name: `Near Main Junction, ${stationCode}`,
          location_lat: 12.9716,
          location_lng: 77.5946,
          accused_name: "Suspect Under Investigation",
          risk_score: 85,
          investigation_officer: "Insp. Officer In-Charge"
        };
      }

      const { data } = await fetchWithFallback(
        `firs?case_number=${encodeURIComponent(caseNumber)}&limit=1`,
        { firs: [demoCase] }
      );

      const arr = data?.firs || (data?.fir ? [data.fir] : [demoCase]);
      const firData = arr.find(f => f.case_number === caseNumber) || demoCase;

      setFir(firData);

      const plate = extractPlate(firData.description) || 'KA-01-MJ-8821';
      setDetectedPlate(plate);
      fetchTrail(plate);

      setSuspects([
        {
          full_name: firData.accused_name || 'Ramesh Kumar',
          alias: 'Bullet Ramesh',
          risk_score: firData.risk_score || 94,
          status: 'ACTIVE_WATCHLIST'
        }
      ]);

      setRelatedCases(DEMO_FIRS.firs.filter(f => f.case_number !== firData.case_number).slice(0, 4));
      setLoading(false);
    }

    load();
  }, [caseNumber, fetchTrail]);

  if (loading)  return <PageSkeleton />;
  if (notFound) return <NotFound caseNumber={caseNumber} />;

  return (
    <FIRDetailView
      caseNumber={caseNumber}
      fir={fir}
      suspects={suspects}
      trailData={trailData}
      trailLoading={trailLoading}
      trailError={trailError}
      relatedCases={relatedCases}
      detectedPlate={detectedPlate}
    />
  );
}
