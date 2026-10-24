import { NextRequest, NextResponse } from 'next/server';
import { dbGetMentorMentees, dbGetProfileByEmail } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dept = searchParams.get('dept') || 'ALL';
    const search = searchParams.get('q') || '';
    const scope = searchParams.get('scope'); // 'all' for placement cell overview
    let mentorId = searchParams.get('mentor_id') || undefined;

    // If scope is not 'all' and no mentor_id was explicitly provided, inspect current user session
    if (!mentorId && scope !== 'all') {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const profile = await dbGetProfileByEmail(user.email || '');
          if (profile && (profile.role === 'faculty' || profile.role === 'mentor')) {
            mentorId = profile.id;
          }
        }
      } catch {
        // Fallback to client query param or scope
      }
    }

    const mentees = await dbGetMentorMentees({
      mentorId,
      departmentCode: dept,
      search,
    });

    return NextResponse.json({
      success: true,
      mentees,
      count: mentees.length,
      mentor_id: mentorId || null,
      max_capacity: 12,
    });
  } catch (error: any) {
    console.error('GET /api/mentor/mentees error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
