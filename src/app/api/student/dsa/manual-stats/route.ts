import { NextRequest, NextResponse } from 'next/server';
import { saveCodingStats } from '@/lib/dsa/dsaStore';
import { CodingPlatform, PlatformStatistics, STANDARD_DSA_TOPICS } from '@/types/dsa';
import { validateStudentSession } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      student_id,
      platform,
      username,
      profile_url,
      easy_solved,
      medium_solved,
      hard_solved,
      total_solved,
      contest_rating,
      current_streak,
      total_submissions,
      topic_statistics,
    } = body;

    // Verify authenticated student session server-side
    const authResult = await validateStudentSession(req, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session. Please log in.' },
        { status: authResult.status || 401 }
      );
    }
    const studentId = authResult.studentId;

    if (!platform) {
      return NextResponse.json({ error: 'Platform identifier is required' }, { status: 400 });
    }

    const easy = Math.max(0, parseInt(easy_solved, 10) || 0);
    const medium = Math.max(0, parseInt(medium_solved, 10) || 0);
    const hard = Math.max(0, parseInt(hard_solved, 10) || 0);
    const calcTotal = easy + medium + hard;
    const total = total_solved !== undefined && total_solved !== null && total_solved !== ''
      ? Math.max(0, parseInt(total_solved, 10) || 0)
      : calcTotal;

    const submissions = Math.max(total, parseInt(total_submissions, 10) || total);
    const acceptanceRate = submissions > 0 ? Math.round((total / submissions) * 1000) / 10 : 0;

    // Validate topic statistics
    const cleanTopicStats: Record<string, number> = {};
    STANDARD_DSA_TOPICS.forEach((t) => {
      cleanTopicStats[t] = 0;
    });

    if (topic_statistics && typeof topic_statistics === 'object') {
      Object.entries(topic_statistics).forEach(([k, v]) => {
        if (cleanTopicStats[k] !== undefined) {
          cleanTopicStats[k] = Math.max(0, parseInt(v as any, 10) || 0);
        }
      });
    }

    const stats: PlatformStatistics = {
      platform: platform as CodingPlatform,
      username: username || 'coder',
      profile_url: profile_url || '',
      total_solved: total,
      easy_solved: easy,
      medium_solved: medium,
      hard_solved: hard,
      total_submissions: submissions,
      accepted_submissions: total,
      acceptance_rate: acceptanceRate,
      contest_rating: contest_rating ? parseInt(contest_rating, 10) : null,
      current_streak: current_streak ? parseInt(current_streak, 10) : null,
      topic_statistics: cleanTopicStats,
      last_synced_at: new Date().toISOString(),
      is_automatic: false,
    };

    await saveCodingStats(studentId, stats);

    return NextResponse.json({
      success: true,
      stats,
      message: `Manual statistics for ${platform} saved successfully.`,
    });
  } catch (error: any) {
    console.error('Error saving manual DSA stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save manual statistics' },
      { status: 500 }
    );
  }
}
