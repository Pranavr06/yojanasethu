import { NextRequest, NextResponse } from 'next/server';
import { dbGetVerifiedCredentials } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let studentId = searchParams.get('student_id');

    if (!studentId || !studentId.includes('-')) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        studentId = user.id;
      } else {
        studentId = '11111111-1111-1111-1111-111111111111';
      }
    }

    const credentials = await dbGetVerifiedCredentials(studentId);

    return NextResponse.json({
      student_id: studentId,
      credentials,
      total_verified: credentials.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
