import { NextRequest, NextResponse } from 'next/server';
import {
  getCodingProfiles,
  addCodingProfile,
  removeCodingProfile,
  getLatestCodingStats,
  aggregateCodingStats,
  getWeeklyPlan,
  getDsaReports,
  saveCodingStats,
} from '@/lib/dsa/dsaStore';
import { parseCodingProfileUrl, syncPlatformStatistics } from '@/lib/dsa/platformService';
import { validateStudentSession } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientSuppliedStudentId = searchParams.get('student_id') || undefined;

    // Verify authenticated student session server-side
    const authResult = await validateStudentSession(req, clientSuppliedStudentId);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session. Please log in.' },
        { status: authResult.status || 401 }
      );
    }
    const studentId = authResult.studentId;

    const [profiles, stats, weeklyPlan, reports] = await Promise.all([
      getCodingProfiles(studentId),
      getLatestCodingStats(studentId),
      getWeeklyPlan(studentId),
      getDsaReports(studentId),
    ]);

    const aggregated = aggregateCodingStats(profiles, stats);

    return NextResponse.json({
      student_id: studentId,
      profiles,
      stats,
      aggregated,
      weeklyPlan: weeklyPlan || [],
      latestReport: reports[0] || null,
      reportsCount: reports.length,
    });
  } catch (error: any) {
    console.error('Error fetching DSA profiles:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch DSA data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, url, platform_hint } = body;

    // Verify authenticated student session server-side
    const authResult = await validateStudentSession(req, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session. Please log in.' },
        { status: authResult.status || 401 }
      );
    }
    const studentId = authResult.studentId;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'Profile URL is required' }, { status: 400 });
    }

    const parsed = parseCodingProfileUrl(url.trim(), platform_hint);
    if (!parsed.isValid) {
      return NextResponse.json({ error: parsed.errorMessage || 'Invalid coding platform URL' }, { status: 400 });
    }

    const { profile, isDuplicate } = await addCodingProfile(studentId, {
      platform: parsed.platform,
      profile_url: parsed.normalizedUrl,
      username: parsed.username,
    });

    if (isDuplicate) {
      return NextResponse.json(
        { error: `You have already connected a ${parsed.platform.toUpperCase()} profile. Please remove or update the existing one.` },
        { status: 409 }
      );
    }

    // Attempt initial sync
    let syncError: string | null = null;
    let initialStats = null;

    try {
      initialStats = await syncPlatformStatistics(parsed.platform, parsed.username, parsed.normalizedUrl);
      await saveCodingStats(studentId, initialStats);
    } catch (err: any) {
      syncError = err.message || 'Could not fetch live statistics at this time.';
    }

    return NextResponse.json({
      profile,
      stats: initialStats,
      synced: !syncError && initialStats?.is_automatic,
      sync_error: syncError,
    });
  } catch (error: any) {
    console.error('Error adding DSA profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to connect platform' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, profile_id, platform } = body;

    // Verify authenticated student session server-side
    const authResult = await validateStudentSession(req, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session. Please log in.' },
        { status: authResult.status || 401 }
      );
    }
    const studentId = authResult.studentId;

    const targetIdentifier = profile_id || platform;
    if (!targetIdentifier) {
      return NextResponse.json({ error: 'Profile ID or platform is required' }, { status: 400 });
    }

    await removeCodingProfile(studentId, targetIdentifier);

    return NextResponse.json({ success: true, message: 'Platform disconnected successfully' });
  } catch (error: any) {
    console.error('Error removing DSA profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to disconnect platform' }, { status: 500 });
  }
}
