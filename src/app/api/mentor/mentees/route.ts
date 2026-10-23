import { NextRequest, NextResponse } from 'next/server';
import { dbGetMentorMentees } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dept = searchParams.get('dept') || 'ALL';
    const search = searchParams.get('q') || '';

    const mentees = await dbGetMentorMentees({
      departmentCode: dept,
      search,
    });

    return NextResponse.json({
      mentees,
      count: mentees.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
