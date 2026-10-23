'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { normalizeRole, ROLE_DASHBOARDS, AppRole, getRoleLabel } from '@/lib/rbac';

interface AuthContextType {
  user: Profile | null;
  supabaseUser: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string, expectedRole?: AppRole | '') => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  login: (email: string, password: string, expectedRole?: AppRole | '') => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  signUp: (params: {
    fullName: string;
    email: string;
    password: string;
    role: AppRole;
    departmentId?: string;
  }) => Promise<{ success: boolean; error?: string; isPendingApproval?: boolean }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  role: null,
  loading: true,
  signIn: async () => ({ success: false }),
  login: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Load profile from database given auth user
  const fetchProfile = useCallback(
    async (authUser: User | null): Promise<Profile | null> => {
      if (!authUser || !authUser.email) return null;

      try {
        // Query profile by ID or by unique Email
        const { data: byId } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (byId) return byId as Profile;

        const { data: byEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle();

        if (byEmail) return byEmail as Profile;

        // If not found in profiles, construct synthetic profile from auth metadata
        const metaRole = (authUser.user_metadata?.role as string) || 'student';
        const metaName = (authUser.user_metadata?.full_name as string) || authUser.email.split('@')[0];

        const fallbackProfile: Profile = {
          id: authUser.id,
          email: authUser.email,
          full_name: metaName,
          role: metaRole as any,
          institution_id: '11111111-0000-0000-0000-000000000001',
          recruiter_consent: false,
          created_at: authUser.created_at,
          updated_at: authUser.created_at,
        };

        return fallbackProfile;
      } catch (err) {
        console.error('Error fetching profile:', err);
        return null;
      }
    },
    [supabase]
  );

  // Initialize and subscribe to Auth changes
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(initialSession);
        setSupabaseUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const prof = await fetchProfile(initialSession.user);
          if (mounted) {
            setUser(prof);
            const resolvedRole =
              normalizeRole(prof?.role) ||
              normalizeRole(initialSession.user.user_metadata?.role) ||
              'student';
            setRole(resolvedRole);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Listen to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, newSession: any) => {
      if (!mounted) return;

      setSession(newSession);
      setSupabaseUser(newSession?.user ?? null);

      if (newSession?.user) {
        const prof = await fetchProfile(newSession.user);
        if (mounted) {
          setUser(prof);
          const resolvedRole =
            normalizeRole(prof?.role) ||
            normalizeRole(newSession.user.user_metadata?.role) ||
            'student';
          setRole(resolvedRole);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const refreshProfile = async () => {
    if (supabaseUser) {
      const prof = await fetchProfile(supabaseUser);
      setUser(prof);
      const resolvedRole =
        normalizeRole(prof?.role) ||
        normalizeRole(supabaseUser.user_metadata?.role) ||
        'student';
      setRole(resolvedRole);
    }
  };

  const signIn = async (email: string, password: string, expectedRole?: AppRole | '') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      const authUser = data.user;
      setSupabaseUser(authUser);
      setSession(data.session);

      const prof = await fetchProfile(authUser);
      setUser(prof);

      const resolvedRole =
        normalizeRole(prof?.role) ||
        normalizeRole(authUser?.user_metadata?.role) ||
        'student';
      setRole(resolvedRole);

      // Verify against selected dropdown role if user specified one
      if (expectedRole) {
        const isRoleMatch =
          resolvedRole === expectedRole ||
          (resolvedRole === 'admin' && (expectedRole === 'placements' || expectedRole === 'admin')) ||
          (resolvedRole === 'placements' && (expectedRole === 'admin' || expectedRole === 'placements'));

        if (!isRoleMatch) {
          setLoading(false);
          return {
            success: false,
            error: `Role Mismatch: Your account is verified as "${getRoleLabel(resolvedRole)}", but you selected "${getRoleLabel(expectedRole)}". Please select the correct role from the dropdown.`,
          };
        }
      }

      // Check if user is pending approval
      const isPending = authUser?.user_metadata?.approval_status === 'pending';
      if (isPending && resolvedRole !== 'student') {
        router.push('/auth/pending-approval');
        setLoading(false);
        return { success: true, redirectUrl: '/auth/pending-approval' };
      }

      const redirectUrl = ROLE_DASHBOARDS[resolvedRole] || '/student/dashboard';
      router.push(redirectUrl);
      router.refresh();

      setLoading(false);
      return { success: true, redirectUrl };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Authentication error' };
    }
  };

  const signUp = async (params: {
    fullName: string;
    email: string;
    password: string;
    role: AppRole;
    departmentId?: string;
  }) => {
    setLoading(true);
    try {
      const isStudent = params.role === 'student';
      const approvalStatus = isStudent ? 'approved' : 'pending';

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: params.fullName,
          email: params.email,
          password: params.password,
          role: params.role,
          departmentId: params.departmentId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setLoading(false);
        return { success: false, error: json.error || 'Failed to create account.' };
      }

      // If approved directly (student), auto-sign in
      if (isStudent) {
        const loginRes = await signIn(params.email, params.password);
        setLoading(false);
        return { success: true, isPendingApproval: false };
      } else {
        // Privileged role awaiting admin verification
        setLoading(false);
        router.push('/auth/pending-approval');
        return { success: true, isPendingApproval: true };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      setRole(null);
      try {
        localStorage.removeItem('pathpilot_session_user');
        localStorage.removeItem('yojanasethu_session_user');
      } catch (e) {}
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Sign out error:', err);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        role,
        loading,
        signIn,
        login: signIn,
        signUp,
        signOut,
        logout: signOut,
        refreshProfile,
        isAuthenticated: !!supabaseUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
