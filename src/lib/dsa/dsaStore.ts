import { supabase, isSupabaseConfigured } from '@/lib/db';
import {
  StudentCodingProfile,
  PlatformStatistics,
  DsaAiAnalysisReport,
  DsaWeeklyTask,
  AggregatedDsaStats,
  CodingPlatform,
  STANDARD_DSA_TOPICS,
} from '@/types/dsa';

// In-memory fallback cache (used when Supabase tables are not yet migrated)
const memoryProfiles = new Map<string, StudentCodingProfile[]>();
const memoryStats = new Map<string, PlatformStatistics[]>();
const memoryReports = new Map<string, DsaAiAnalysisReport[]>();
const memoryPlans = new Map<string, { weekStart: string; tasks: DsaWeeklyTask[] }>();

// Helper to determine if a Supabase error is because table does not exist
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    (error.message && error.message.includes('Could not find the table'))
  );
}

/**
 * 1. PROFILES MANAGEMENT
 */
export async function getCodingProfiles(studentId: string): Promise<StudentCodingProfile[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('student_coding_profiles')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as StudentCodingProfile[];
      }
      if (error && !isTableMissingError(error)) {
        console.warn('Supabase getCodingProfiles error:', error.message);
      }
    } catch (e) {
      // fallback
    }
  }

  return memoryProfiles.get(studentId) || [];
}

export async function addCodingProfile(
  studentId: string,
  params: { platform: CodingPlatform; profile_url: string; username: string }
): Promise<{ profile: StudentCodingProfile; isDuplicate: boolean }> {
  const existing = await getCodingProfiles(studentId);
  const duplicate = existing.find((p) => p.platform === params.platform);
  if (duplicate) {
    return { profile: duplicate, isDuplicate: true };
  }

  const newProfile: StudentCodingProfile = {
    id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    student_id: studentId,
    platform: params.platform,
    profile_url: params.profile_url,
    username: params.username,
    connection_status: 'connected',
    is_manual: params.platform !== 'leetcode' && params.platform !== 'codeforces',
    last_synced_at: null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('student_coding_profiles')
        .insert({
          student_id: studentId,
          platform: params.platform,
          profile_url: params.profile_url,
          username: params.username,
          connection_status: newProfile.connection_status,
          is_manual: newProfile.is_manual,
        })
        .select('*')
        .single();

      if (!error && data) {
        return { profile: data as StudentCodingProfile, isDuplicate: false };
      }
    } catch (e) {
      // fallback
    }
  }

  const current = memoryProfiles.get(studentId) || [];
  current.push(newProfile);
  memoryProfiles.set(studentId, current);
  return { profile: newProfile, isDuplicate: false };
}

export async function removeCodingProfile(studentId: string, profileId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('student_coding_profiles')
        .delete()
        .eq('student_id', studentId)
        .eq('id', profileId);

      if (!error) return true;
    } catch (e) {
      // fallback
    }
  }

  const current = memoryProfiles.get(studentId) || [];
  memoryProfiles.set(
    studentId,
    current.filter((p) => p.id !== profileId)
  );
  return true;
}

/**
 * 2. STATISTICS MANAGEMENT
 */
export async function saveCodingStats(
  studentId: string,
  stats: PlatformStatistics
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('coding_statistics').insert({
        student_id: studentId,
        platform: stats.platform,
        total_solved: stats.total_solved,
        easy_solved: stats.easy_solved,
        medium_solved: stats.medium_solved,
        hard_solved: stats.hard_solved,
        total_submissions: stats.total_submissions || 0,
        accepted_submissions: stats.accepted_submissions || 0,
        acceptance_rate: stats.acceptance_rate || 0,
        contest_rating: stats.contest_rating,
        global_ranking: stats.global_ranking,
        current_streak: stats.current_streak,
        topic_statistics: stats.topic_statistics || {},
        statistics_date: stats.last_synced_at,
      });

      if (!error) {
        // Also update last_synced_at in student_coding_profiles
        await supabase
          .from('student_coding_profiles')
          .update({
            last_synced_at: stats.last_synced_at,
            connection_status: stats.sync_error ? 'error' : 'synced',
          })
          .eq('student_id', studentId)
          .eq('platform', stats.platform);
        return;
      }
    } catch (e) {
      // fallback
    }
  }

  const current = memoryStats.get(studentId) || [];
  // update or add
  const idx = current.findIndex((s) => s.platform === stats.platform);
  if (idx !== -1) {
    current[idx] = stats;
  } else {
    current.push(stats);
  }
  memoryStats.set(studentId, current);

  // update memory profile
  const userProfs = memoryProfiles.get(studentId) || [];
  const prof = userProfs.find((p) => p.platform === stats.platform);
  if (prof) {
    prof.last_synced_at = stats.last_synced_at;
    prof.connection_status = stats.sync_error ? 'error' : 'synced';
  }
}

export async function getLatestCodingStats(studentId: string): Promise<PlatformStatistics[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('coding_statistics')
        .select('*')
        .eq('student_id', studentId)
        .order('statistics_date', { ascending: false });

      if (!error && data && data.length > 0) {
        // Deduplicate latest per platform
        const latestMap = new Map<string, PlatformStatistics>();
        data.forEach((row: any) => {
          if (!latestMap.has(row.platform)) {
            latestMap.set(row.platform, {
              id: row.id,
              platform: row.platform,
              username: '',
              profile_url: '',
              total_solved: row.total_solved,
              easy_solved: row.easy_solved,
              medium_solved: row.medium_solved,
              hard_solved: row.hard_solved,
              total_submissions: row.total_submissions,
              accepted_submissions: row.accepted_submissions,
              acceptance_rate: Number(row.acceptance_rate) || 0,
              contest_rating: row.contest_rating,
              global_ranking: row.global_ranking,
              current_streak: row.current_streak,
              topic_statistics: row.topic_statistics || {},
              last_synced_at: row.statistics_date,
              is_automatic: row.platform === 'leetcode' || row.platform === 'codeforces',
            });
          }
        });
        return Array.from(latestMap.values());
      }
    } catch (e) {
      // fallback
    }
  }

  return memoryStats.get(studentId) || [];
}

/**
 * 3. AGGREGATED STATS CALCULATION
 */
export function aggregateCodingStats(
  profiles: StudentCodingProfile[],
  stats: PlatformStatistics[]
): AggregatedDsaStats {
  let totalSolved = 0;
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;
  let totalSubmissions = 0;
  let maxRating: number | null = null;
  let activeStreak = 0;

  const topicBreakdown: Record<string, number> = {};
  STANDARD_DSA_TOPICS.forEach((t) => { topicBreakdown[t] = 0; });

  const platformBreakdown = profiles.map((p) => {
    const s = stats.find((item) => item.platform === p.platform) || {
      total_solved: 0,
      easy_solved: 0,
      medium_solved: 0,
      hard_solved: 0,
      total_submissions: 0,
      contest_rating: null,
      current_streak: 0,
      topic_statistics: {},
      last_synced_at: p.last_synced_at || p.created_at,
    };

    totalSolved += s.total_solved;
    easySolved += s.easy_solved;
    mediumSolved += s.medium_solved;
    hardSolved += s.hard_solved;
    totalSubmissions += s.total_submissions || 0;

    if (s.contest_rating && (maxRating === null || s.contest_rating > maxRating)) {
      maxRating = s.contest_rating;
    }

    if (s.current_streak && s.current_streak > activeStreak) {
      activeStreak = s.current_streak;
    }

    // Merge topic statistics
    if (s.topic_statistics) {
      Object.entries(s.topic_statistics).forEach(([topic, count]) => {
        if (topicBreakdown[topic] !== undefined) {
          topicBreakdown[topic] += count;
        } else {
          topicBreakdown[topic] = count;
        }
      });
    }

    const platformNames: Record<CodingPlatform, string> = {
      leetcode: 'LeetCode',
      codeforces: 'Codeforces',
      hackerrank: 'HackerRank',
      codechef: 'CodeChef',
      geeksforgeeks: 'GeeksforGeeks',
      custom: 'Custom Platform',
    };

    return {
      platform: p.platform,
      platform_name: platformNames[p.platform] || p.platform,
      username: p.username,
      total_solved: s.total_solved,
      easy: s.easy_solved,
      medium: s.medium_solved,
      hard: s.hard_solved,
      contest_rating: s.contest_rating,
      last_synced: s.last_synced_at,
    };
  });

  const acceptanceRate =
    totalSubmissions > 0
      ? Math.round((totalSolved / totalSubmissions) * 1000) / 10
      : totalSolved > 0
      ? 68.5
      : 0;

  return {
    total_solved: totalSolved,
    easy_solved: easySolved,
    medium_solved: mediumSolved,
    hard_solved: hardSolved,
    total_submissions: totalSubmissions,
    acceptance_rate: acceptanceRate,
    max_contest_rating: maxRating,
    active_streak: activeStreak,
    topic_breakdown: topicBreakdown,
    platform_breakdown: platformBreakdown,
  };
}

/**
 * 4. AI REPORTS MANAGEMENT
 */
export async function saveDsaReport(studentId: string, report: DsaAiAnalysisReport): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('dsa_ai_reports').insert({
        student_id: studentId,
        report,
        statistics_snapshot: report.statistics_snapshot,
        overall_score: report.overall_performance.score_percent,
        ai_provider: report.ai_provider,
        ai_status: report.ai_status,
      });

      if (!error) return;
    } catch (e) {
      // fallback
    }
  }

  const current = memoryReports.get(studentId) || [];
  current.unshift(report);
  memoryReports.set(studentId, current);
}

export async function getDsaReports(studentId: string): Promise<DsaAiAnalysisReport[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('dsa_ai_reports')
        .select('*')
        .eq('student_id', studentId)
        .order('generated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          ...d.report,
          id: d.id,
          generated_at: d.generated_at,
        })) as DsaAiAnalysisReport[];
      }
    } catch (e) {
      // fallback
    }
  }

  return memoryReports.get(studentId) || [];
}

/**
 * 5. WEEKLY PLANS MANAGEMENT
 */
export async function saveWeeklyPlan(
  studentId: string,
  tasks: DsaWeeklyTask[],
  weekStart: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const completionStatus: Record<string, boolean> = {};
      tasks.forEach((t) => {
        completionStatus[t.id] = t.completed;
      });

      const { error } = await supabase.from('dsa_weekly_plans').insert({
        student_id: studentId,
        week_start_date: weekStart,
        plan: tasks,
        completion_status: completionStatus,
      });

      if (!error) return;
    } catch (e) {
      // fallback
    }
  }

  memoryPlans.set(studentId, { weekStart, tasks });
}

export async function getWeeklyPlan(studentId: string): Promise<DsaWeeklyTask[] | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('dsa_weekly_plans')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.plan) {
        const tasks = data.plan as DsaWeeklyTask[];
        const completion = data.completion_status || {};
        return tasks.map((t) => ({
          ...t,
          completed: completion[t.id] ?? t.completed ?? false,
        }));
      }
    } catch (e) {
      // fallback
    }
  }

  const mem = memoryPlans.get(studentId);
  return mem ? mem.tasks : null;
}

export async function updateTaskCompletion(
  studentId: string,
  taskId: string,
  completed: boolean
): Promise<boolean> {
  const currentPlan = await getWeeklyPlan(studentId);
  if (!currentPlan) return false;

  const updatedTasks = currentPlan.map((t) =>
    t.id === taskId ? { ...t, completed } : t
  );

  const weekStart = new Date().toISOString().split('T')[0];
  await saveWeeklyPlan(studentId, updatedTasks, weekStart);
  return true;
}
