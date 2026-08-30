'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupervisorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/supervisor');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <span>Loading Supervisor Operations Command...</span>
      </div>
    </div>
  );
}
