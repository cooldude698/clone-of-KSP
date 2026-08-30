'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalystRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/analyst');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
        <span>Loading Analyst Intelligence Division...</span>
      </div>
    </div>
  );
}
