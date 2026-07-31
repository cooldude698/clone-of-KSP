'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function FIRError({ error, reset }) {
  useEffect(() => {
    console.error('[FIR Route Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-100 mb-2">FIR Dossier Unavailable</h2>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        An error occurred while loading this FIR dossier. The record may be temporarily unreachable or undergoing updates.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Load
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-steel-800 hover:bg-steel-700 text-slate-200 text-sm font-medium rounded-xl transition-all border border-steel-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
