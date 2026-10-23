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

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id') || 'student-mock-1';

    const [profiles, stats, weeklyPlan, reports] = await Promise.all([
      getCodingProfiles(studentId),
      getLatestCodingStats(studentId),
      getWeeklyPlan(studentId),
      getDsaReports(studentId),
    ]);

    const aggregated = aggregateCodingStats(profiles, stats);

    return NextResponse.json({
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

    const studentId = student_id || 'student-mock-1';

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
    const { student_id, profile_id } = body;

    const studentId = student_id || 'student-mock-1';
    if (!profile_id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    await removeCodingProfile(studentId, profile_id);

    return NextResponse.json({ success: true, message: 'Platform disconnected successfully' });
  } catch (error: any) {
    console.error('Error removing DSA profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to disconnect platform' }, { status: 500 });
  }
}
