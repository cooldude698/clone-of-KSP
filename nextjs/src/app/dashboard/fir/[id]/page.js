'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import FIRDetailView from './FIRDetailView';

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

import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS, DEMO_TRAIL } from '@/lib/demo-data';

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FIRDetailPage() {
  const params     = useParams();
  const caseNumber = decodeURIComponent(params?.id || '');

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

      const demoCase = DEMO_FIRS.firs.find(f => f.case_number === caseNumber) || DEMO_FIRS.firs[0];

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
