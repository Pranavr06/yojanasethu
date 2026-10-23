import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dbResolveStudentProfileId, dbGetProfileById, dbGetProfileByEmail } from './db';
import { Profile } from '@/types';

export interface StudentAuthValidationResult {
  authorized: boolean;
  studentId?: string; // Valid profiles.id UUID
  studentProfile?: Profile;
  userEmail?: string;
  error?: string;
  status: number;
}

/**
 * Validates the authenticated student session for protected routes (e.g., certificate & assessment submissions).
 * Enforces:
 * 1. An active authenticated session must exist.
 * 2. Authenticated user must resolve to a valid student profile in PostgreSQL or seeded cohort.
 * 3. Client-supplied student ID (if any) cannot spoof another user's identity.
 * 4. Never falls back to a default student profile.
 */
export async function validateStudentSession(
  request: NextRequest | Request,
  clientSuppliedStudentId?: string,
  testSessionOverride?: { id: string; email?: string }
): Promise<StudentAuthValidationResult> {
  let authUser: { id: string; email?: string } | null = testSessionOverride || null;

  // 1. If not provided via testSessionOverride, inspect Supabase SSR session
  if (!authUser) {
    try {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        authUser = { id: user.id, email: user.email };
      }
    } catch {
      // Outside SSR request scope (e.g. standalone test) or cookies unavailable
    }
  }

  // 2. Check Bearer token in Authorization header
  if (!authUser && request?.headers) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { supabase, isSupabaseConfigured } = await import('@/lib/db');
        if (isSupabaseConfigured && supabase) {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser(token);
          if (!error && user) {
            authUser = { id: user.id, email: user.email };
          }
        }
      } catch {
        // Token verification failed or unavailable
      }
    }
  }

  // 3. If no session, reject immediately
  if (!authUser) {
    return {
      authorized: false,
      error: 'Unauthorized: Authentication required. No active student session found. Please sign in.',
      status: 401,
    };
  }

  // 4. Resolve the profile from the authenticated user
  let profile: Profile | null = null;
  if (authUser.id) {
    profile = await dbGetProfileById(authUser.id);
  }
  if (!profile && authUser.email) {
    profile = await dbGetProfileByEmail(authUser.email);
  }

  let resolvedStudentUuid: string | null = profile?.id || null;
  if (!resolvedStudentUuid) {
    resolvedStudentUuid =
      (await dbResolveStudentProfileId(authUser.id)) ||
      (authUser.email ? await dbResolveStudentProfileId(authUser.email) : null);
  }

  if (!resolvedStudentUuid) {
    return {
      authorized: false,
      error: 'Forbidden: No student profile record found for this authenticated user account.',
      status: 403,
    };
  }

  // Verify role if profile is known
  if (profile && profile.role && profile.role !== 'student') {
    return {
      authorized: false,
      error: 'Forbidden: Only students are authorized to register certificates and complete assessments.',
      status: 403,
    };
  }

  // 5. Anti-spoofing check on client-supplied ID
  if (clientSuppliedStudentId && clientSuppliedStudentId.trim()) {
    const rawClient = clientSuppliedStudentId.trim();
    const resolvedClientId = await dbResolveStudentProfileId(rawClient);

    const matchesId = rawClient.toLowerCase() === resolvedStudentUuid.toLowerCase();
    const matchesEmail = Boolean(profile?.email && rawClient.toLowerCase() === profile.email.toLowerCase());
    const matchesUsn = Boolean(profile?.usn && rawClient.toLowerCase() === profile.usn.toLowerCase());
    const matchesResolved = Boolean(
      resolvedClientId && resolvedClientId.toLowerCase() === resolvedStudentUuid.toLowerCase()
    );

    if (!matchesId && !matchesEmail && !matchesUsn && !matchesResolved) {
      return {
        authorized: false,
        error: 'Forbidden: The supplied student_id does not match the authenticated student identity.',
        status: 403,
      };
    }
  }

  return {
    authorized: true,
    studentId: resolvedStudentUuid,
    studentProfile: profile || undefined,
    userEmail: authUser.email,
    status: 200,
  };
}
