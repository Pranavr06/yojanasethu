'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ROLE_DASHBOARDS, normalizeRole } from '@/lib/rbac';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else {
        const resolved =
          (role && ROLE_DASHBOARDS[role]) ||
          (user?.role && ROLE_DASHBOARDS[normalizeRole(user.role) || 'student']) ||
          '/student/dashboard';
        router.replace(resolved);
      }
    }
  }, [user, role, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070B14]">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Loading YojanaSethu...
        </p>
      </div>
    </div>
  );
}
