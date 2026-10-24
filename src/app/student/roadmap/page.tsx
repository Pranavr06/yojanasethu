'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CareerRoadmapRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
        Redirecting to Student Dashboard...
      </h2>
    </div>
  );
}
