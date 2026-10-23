import { NextRequest, NextResponse } from 'next/server';
import { syncPlatformStatistics } from '@/lib/dsa/platformService';
import { saveCodingStats } from '@/lib/dsa/dsaStore';
import { CodingPlatform } from '@/types/dsa';
import { validateStudentSession } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, platform, username, profile_url } = body;

    // Verify authenticated student session server-side
    const authResult = await validateStudentSession(req, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session. Please log in.' },
        { status: authResult.status || 401 }
      );
    }
    const studentId = authResult.studentId;

    if (!platform || !username || !profile_url) {
      return NextResponse.json(
        { error: 'Platform, username, and profile_url are required to sync statistics.' },
        { status: 400 }
      );
    }

    const stats = await syncPlatformStatistics(
      platform as CodingPlatform,
      username,
      profile_url
    );

    await saveCodingStats(studentId, stats);

    return NextResponse.json({
      success: true,
      stats,
      message: stats.is_automatic
        ? `Successfully synchronized live stats from ${platform}.`
        : `Platform ${platform} does not expose public APIs. Please update counts manually.`,
    });
  } catch (error: any) {
    console.error('Error synchronizing DSA stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to synchronize coding statistics' },
      { status: 500 }
    );
  }
}
