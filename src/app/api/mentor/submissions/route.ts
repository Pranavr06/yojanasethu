import { NextRequest, NextResponse } from 'next/server';
import { dbGetMentorSubmissions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const dept = searchParams.get('dept') || 'ALL';

    const submissions = await dbGetMentorSubmissions({
      status,
      departmentCode: dept,
    });

    return NextResponse.json({
      submissions,
      count: submissions.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
